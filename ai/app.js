/* 解説AI先生 本体：検索 → 資料カード → （任意）AIのかんたん説明 */
(function () {
  'use strict';
  var CHS = window.AI_TUTOR_CHARACTERS, CH = CHS[0], M = window.AITutorSummary, Mx = M, S = window.AITutorSearch, L = window.AITutorLLM;
  var $ = function (id) { return document.getElementById(id); };
  var log = $('log'), form = $('askForm'), input = $('askInput');
  var SUBJ = { anatomy: '解剖学', physiology: '生理学', clinical: '一般臨床' };
  var KEY = 'jkp-ai-tutor';
  var conf = (function () { try { return Object.assign({ model: L.MODELS[0].id, auto: false, subj: '', char: '', localAi: false, ext: 'grok' }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return { model: L.MODELS[0].id, auto: false, subj: '' }; } })();
  if (!L.MODELS.some(function (m) { return m.id === conf.model; })) conf.model = L.MODELS[0].id; // 3B などの古い設定は 1.5B に戻す
  function save() { try { localStorage.setItem(KEY, JSON.stringify(conf)); } catch (e) {} }
  var params = new URLSearchParams(location.search);
  // シンプル表示（既定）：先生えらび・問題モード・おしゃべり・AIモデル選択・外部AIボタンはかくす（コードは残す）。
  // ぜんぶ出すときは ?full=1（または localStorage の設定 full:true）。
  var FULL = params.get('full') === '1' || !!conf.full;
  if (!FULL) document.documentElement.classList.add('ai-simple');
  var urlSubj = '', lastSum = null, engine = null, engineModel = null, loading = null, searcher = null, lastHits = null, lastQ = '', busy = false;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function scroll() { requestAnimationFrame(function () { window.scrollTo(0, document.body.scrollHeight); }); }
  function row(who, html) {
    var d = document.createElement('div'); d.className = 'row ' + who;
    if (who === 'bot') d.innerHTML = '<img class="av" src="' + esc(CH.avatar) + '" alt="">';
    var b = document.createElement('div'); b.className = 'b'; b.innerHTML = html; d.appendChild(b); log.appendChild(d); scroll(); return b;
  }
  function highlight(text, kws) {
    var h = esc(text);
    kws.filter(function (k) { return Array.from(k).length >= 2; }).forEach(function (k) {
      h = h.split(esc(k)).join('<mark>' + esc(k) + '</mark>');
    });
    return h;
  }
  function snippet(x, kws) {
    var n = S.norm(x), pos = -1;
    for (var i = 0; i < kws.length && pos < 0; i++) pos = n.indexOf(kws[i]);
    var start = Math.max(0, pos - 40), s = x.slice(start, start + 220);
    return (start > 0 ? '…' : '') + s + (start + 220 < x.length ? '…' : '');
  }
  function card(h, n, kws) {
    var d = h.doc, tag = d.k === 'q' ? '過去問' : '資料';
    var html = '<article class="card ' + d.s + '"><div class="card-h"><span class="num">[' + n + ']</span><span class="tag">' + tag + '</span><span class="ttl">' + esc(d.t) + '</span></div>';
    if (d.k === 'q' && d.q) {
      html += '<p class="stem">' + highlight(d.q.stem, kws) + (d.q.img ? ' <small>（図あり）</small>' : '') + '</p><ol class="choices">' +
        d.q.choices.map(function (c) { return '<li>' + highlight(c, kws) + '</li>'; }).join('') + '</ol>' +
        '<details class="ans"><summary>正解と解説を見る</summary><div>' + highlight(d.x.slice(d.x.indexOf('正解：')).replace(/\n/g, ' '), kws).replace(/^正解：([^ ]*(?: [^ ]+)?)/, '<b>正解：$1</b>') + '</div></details>' +
        '<a class="go" href="' + esc(d.u) + '">' + SUBJ[d.s] + 'の過去問アプリへ →</a>';
    } else {
      html += '<p class="snip">' + highlight(snippet(d.x, kws), kws).replace(/\n/g, '<br>') + '</p>' +
        '<details class="more"><summary>全文を見る</summary><p>' + highlight(d.x, kws).replace(/\n/g, '<br>') + '</p></details>' +
        '<a class="go" href="' + esc(d.u) + '">学習資料のこの場所を開く →</a>';
    }
    return html + '</article>';
  }
  // 「もっと詳しく」「なんで？」など中身の語がない質問は、前の検索結果を使う
  // 「噛み砕いて」「もーちょい詳しく」「試験では？」など：新しい中身の語がなければ前の資料で言い直す
  function lastText() { return S.norm(lastHits.map(function (h) { return h.doc.t + ' ' + h.doc.x; }).join(' ') + ' ' + lastQ); }
  function isFollowUp(q, kws) {
    if (!lastHits) return false;
    var big = kws.filter(function (k) { return Array.from(k).length >= 2 && !L.FOLLOW.test(k); });
    if (!big.length) return true;
    if (L.FOLLOW.test(q) && Array.from(q).length <= 40) { var t = lastText(); return big.every(function (k) { return t.indexOf(k) >= 0; }); }
    return false;
  }

  // ---- おしゃべり（休けい） ----
  var talk = null, talkMem = null, talkTurns = 0, lastTurn = null, router = null;
  function TK() { return (window.AI_TUTOR_TALK || {})[CH.id]; }
  function initTalk() {
    var tk = TK(); if (!tk || !window.TalkEngine) { talk = null; return; }
    talk = window.TalkEngine.create(tk);
    try { talkMem = JSON.parse(localStorage.getItem('jkp-ai-talk-' + CH.id) || 'null'); } catch (e) {}
    if (!talkMem || !Array.isArray(talkMem.likes)) talkMem = { name: '', likes: [] };
    router = AITutorRouter.create({ search: function (q) { return searcher.search(q, { subj: conf.subj || urlSubj, limit: 6 }); }, norm: S.norm,
      detect: TalkEngine.detect, talkNorm: function (q) { return TalkEngine.norm(q, { calls: tk.calls }); }, FOLLOW: L.FOLLOW });
  }
  function you() { var tk = TK(); return talkMem && talkMem.name ? tk.addr(talkMem.name) : tk.you; }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  function topicChip() { // ランダムな学習資料の見出し
    var g = searcher.docs.filter(function (d) { return d.k === 'g' && /資料 \d+-\d+/.test(d.t); });
    var t = pickOne(g).t.replace(/^.*?資料 [\d-]+\s*/, '').replace(/（\d+\/\d+）$/, '').replace(/理解度チェック$/, '').split(/[：（]/)[0].trim();
    return t.slice(0, 18) || '活動電位';
  }
  function chipsRow(b, items) {
    var d = document.createElement('div'); d.className = 'chips-q';
    items.forEach(function (it) { var cb = document.createElement('button'); cb.type = 'button'; cb.textContent = it[0]; cb.onclick = function () { ask(it[1]); }; d.appendChild(cb); });
    b.appendChild(d); scroll();
  }
  function talkReply(q, kind) {
    var tk = TK(), text;
    if (kind === 'encourage') text = pickOne(tk.r.encourage).replace(/\{u\}/g, you());
    else { var o = talk.reply(q, 'normal', talkMem, new Date()); text = o.text; }
    try { localStorage.setItem('jkp-ai-talk-' + CH.id, JSON.stringify(talkMem)); } catch (e) {}
    lastTurn = 'talk'; talkTurns++;
    var b = row('bot', esc(text).replace(/\n/g, '<br>'));
    if (kind === 'encourage' || talkTurns >= 3) {
      var t = topicChip();
      if (kind !== 'encourage') { b.insertAdjacentHTML('beforeend', '<br>' + esc(pickOne(tk.r.nudge))); talkTurns = 0; }
      chipsRow(b, [['1問いく！', '問題だして'], ['「' + t + '」の問題', t + 'の問題'], ['「' + t + '」を聞く', t]]);
    }
  }

  function ask(q) {
    q = q.trim(); if (!q || busy) return;
    row('me', esc(q));
    if (!searcher) { row('bot', '資料を読み込み中…ちょっと待ってね。'); return; }
    if (!router) initTalk();
    if (FULL && quizHook(q)) return;
    var rt = router ? router.route(q, { lastTurn: lastTurn, lastHits: lastHits, lastQ: lastQ }) : null;
    var r = rt ? rt.r : searcher.search(q, { subj: conf.subj || urlSubj, limit: 6 }), hits, follow = false;
    if (rt && (rt.kind === 'talk' || rt.kind === 'encourage') && talk) { if (FULL) { talkReply(q, rt.kind); return; } row('bot', esc('ここは「まちがえた問題のなぜ」を調べる場所だよ。わからない用語や問題文を入れてね。')); return; }
    if (rt && rt.kind === 'follow' || !rt && isFollowUp(q, r.kws)) { followUp(q); return; }
    else {
      var big = r.kws.filter(function (k) { return Array.from(k).length >= 2; });
      hits = r.hits.filter(function (h) { return h.cov >= 0.4; });
      var hasKw = !big.length || hits.slice(0, 3).some(function (h) { var t = S.norm(h.doc.t + ' ' + h.doc.x); return big.some(function (k) { return t.indexOf(k) >= 0; }); });
      if (rt ? rt.kind === 'notfound' : (!hits.length || hits[0].cov < 0.5 || !hasKw)) { row('bot', esc(CH.notFound)); lastTurn = 'study'; return; }
      lastHits = hits; lastQ = q; lastTurn = 'study'; talkTurns = 0;
    }
    var kws = r.kws, top = hits.slice(0, 3), rest = hits.slice(3);
    // 関係のうすい資料はまとめに混ぜない（弱い一致なら一番上だけ）
    var bigK = kws.filter(function (k) { return Array.from(k).length >= 2; });
    var rel = top.filter(function (h, i) { return i === 0 || bigK.some(function (k) { return S.norm(h.doc.t + ' ' + h.doc.x).indexOf(k) >= 0; }); });
    if (top[0].cov < 0.7) rel = [top[0]];
    lastSum = remap(M.extract(rel, kws, 'normal'), rel, top);
    var b = row('bot', esc(CH.found) + (lastSum ? sumBox(lastSum, pickOne(CH.sumIntro || ['']), pickOne(CH.sumOutro || [''])) : '') +
      '<details class="rest src" open><summary>資料（' + top.length + '件）</summary>' + top.map(function (h, i) { return card(h, i + 1, kws); }).join('') + '</details>' +
      (rest.length ? '<details class="rest"><summary>ほかの候補（' + rest.length + '件）</summary>' + rest.map(function (h, i) { return card(h, i + 4, kws); }).join('') + '</details>' : ''));
    studyChips(b);
  }
  // 資料から抜き出した「まとめ」（AIなし・常に表示）
  function sumBox(sum, intro, outro) {
    var t = M.toText(sum);
    return '<div class="sum-box">' + (intro ? '<p class="sum-in">' + esc(intro) + '</p>' : '') + '<p>' + fmt(t) + '</p>' + (outro ? '<p class="sum-out">' + esc(outro.replace(/\{u\}/g, you())) + '</p>' : '') + '</div>';
  }
  function fmt(t) { return esc(t).replace(/\[(\d)\]/g, '<sup class="cite">[$1]</sup>').replace(/【([^】]+)】/g, '<b class="lbl">$1</b> ').replace(/(たとえるなら[:：][^\n]*)/g, '<span class="analogy">$1</span>').replace(/\n/g, '<br>'); }
  function studyChips(b) { if (!FULL) { chipsRow(b, [['もっと噛み砕いて', 'もっとかみ砕いて']]); return; } chipsRow(b, [['もっとかみ砕いて', 'もっとかみ砕いて'], ['たとえで', 'たとえで'], ['試験ではどう出る？', '試験ではどう出る？']]); extAsk(b); }
  function remap(sum, rel, top) { // rel の番号 → top の番号
    if (!sum) return sum;
    var f = function (o) { if (o) o.n = top.indexOf(rel[o.n - 1]) + 1; };
    f(sum.main); sum.points.forEach(f); f(sum.exam); return sum;
  }

  // ---- 問題モード ----
  var Qz = window.AITutorQuiz, quiz = null, seen = {}, score = { n: 0, ok: 0, streak: 0 };
  function QL() { return CH.quiz || {}; }
  function quizHook(q) {
    if (!Qz) return false;
    if (quiz && !quiz.done) {
      var ai = Qz.answerOf(q, quiz.doc.q.choices);
      if (ai !== null && ai >= 0) { answerQuiz(ai); return true; }
      var c0 = Qz.command(q);
      if (c0 === 'reveal') { answerQuiz(null); return true; }
      if (c0 === 'hint') { hintQuiz(); return true; }
      if (c0 === 'again') { showQuiz(quiz.doc, true); return true; }
    }
    var p = Qz.parse(q);
    if (p) { startQuiz(p); return true; }
    var c = Qz.command(q);
    if (c && lastHits && lastTurn === 'study') {
      if (c === 'memo') { memoReply(); return true; }
      if (c === 'again' && quiz && quiz.done && lastQ === quiz.doc.q.stem) { quiz.done = false; quiz.hinted = []; showQuiz(quiz.doc, true); return true; }
      if (c === 'summary' || c === 'again') { followUp('くわしく'); return true; }
      if (c === 'reveal' && quiz && quiz.done) { var bb = row('bot', esc(QL().reveal || '') + quizAnswerHtml(quiz.doc)); quizChips(bb); return true; }
      if (c === 'hint') { row('bot', esc('いまは問題を出してないよ。「問題だして」って言ってね。')); return true; }
    }
    if (c === 'memo' && lastHits) { memoReply(); return true; }
    return false;
  }
  function pickQ(pool) {
    var fresh = pool.filter(function (d) { return !seen[d.t]; });
    if (!fresh.length) { fresh = pool; }
    return fresh.length ? pickOne(fresh) : null;
  }
  function startQuiz(p) {
    lastTurn = 'quiz'; talkTurns = 0;
    var subj = p.subj || ((p.kind !== 'new' && quiz) ? quiz.subj : '') || conf.subj || urlSubj || '';
    var qd = function (d) { return d.k === 'q' && d.q && !d.q.img && d.q.choices.length >= 2; }, pool, doc = null;
    if (p.topic) {
      var r = searcher.search(p.topic, { limit: 40 }), big = r.kws.filter(function (k) { return Array.from(k).length >= 2; });
      pool = r.hits.map(function (h) { return h.doc; }).filter(function (d) { return qd(d) && (!subj || d.s === subj) && big.every(function (k) { return S.norm(d.x).indexOf(k) >= 0; }); });
      var inStem = pool.filter(function (d) { return big.some(function (k) { return S.norm(d.q.stem).indexOf(k) >= 0; }); });
      if (inStem.length) pool = inStem; // 問題文に出てくるものを優先
    } else if (p.kind === 'same' && quiz) {
      pool = searcher.search(quiz.doc.q.stem + ' ' + quiz.doc.q.choices.join(' '), { limit: 30 }).hits.map(function (h) { return h.doc; }).filter(function (d) { return qd(d) && d.s === quiz.doc.s && d !== quiz.doc; }).slice(0, 8);
    } else pool = searcher.docs.filter(function (d) { return qd(d) && (!subj || d.s === subj); });
    doc = pickQ(pool || []);
    if (!doc) { row('bot', esc(QL().none || '問題が見つからなかったよ。')); return; }
    seen[doc.t] = 1;
    quiz = { doc: doc, subj: p.topic ? subj : (subj || ''), done: false, hinted: [] };
    showQuiz(doc, false);
  }
  function showQuiz(doc, again) {
    var b = row('bot', esc(again ? 'もう一回どうぞ。' : pickOne(QL().intro || ['1問どうぞ。'])) +
      '<div class="quiz"><div class="quiz-h">' + esc(doc.t.replace(' 過去問', '')) + (score.streak >= 2 ? ' <span class="streak">🔥' + score.streak + '連続中</span>' : '') + '</div><p class="stem">' + esc(doc.q.stem) + '</p>' +
      doc.q.choices.map(function (c, i) { return '<button type="button" class="qc" data-i="' + i + '">' + (i + 1) + '. ' + esc(c) + '</button>'; }).join('') +
      '<p class="hint">番号をタップするか、「2」みたいに送ってね。「ヒント」「答え教えて」もOK。</p></div>');
    quiz.el = b;
    b.querySelectorAll('.qc').forEach(function (btn) { btn.onclick = function () { if (quiz && quiz.doc === doc && !quiz.done) { row('me', esc(btn.textContent)); answerQuiz(+btn.dataset.i); } }; });
  }
  function quizAnswerHtml(doc) {
    var ans = doc.q.answers.map(function (i) { return (i + 1) + '. ' + doc.q.choices[i]; }).join('、');
    var ex = doc.x.slice(doc.x.indexOf('正解：')).split('\n').slice(1).join('\n').trim();
    var g = searcher.search(doc.q.stem + ' ' + doc.q.answers.map(function (i) { return doc.q.choices[i]; }).join(' '), { limit: 8 }).hits.filter(function (h) { return h.doc.k === 'g'; })[0];
    return '<div class="sum-box"><p><b class="lbl">正解</b> ' + esc(ans) + '</p>' + (ex ? '<p>' + esc(ex).replace(/\n/g, '<br>') + '</p>' : '') +
      (g ? '<p><a class="go" href="' + esc(g.doc.u) + '">📖 ' + esc(g.doc.t) + ' を読む →</a></p>' : '') + '</div>';
  }
  function quizChips(b) { chipsRow(b, [['次の問題', '次の問題'], ['もっとかみ砕いて', 'もっとかみ砕いて'], ['同じ分野でもう一問', '同じ分野でもう一問']]); extAsk(b); }
  function answerQuiz(i) {
    var doc = quiz.doc, L2 = QL(), ok = i !== null && doc.q.answers.indexOf(i) >= 0, msg;
    quiz.done = true; score.n++;
    if (ok) { score.ok++; score.streak++; } else score.streak = 0;
    if (quiz.el) quiz.el.querySelectorAll('.qc').forEach(function (btn) { var k = +btn.dataset.i; btn.disabled = true; if (doc.q.answers.indexOf(k) >= 0) btn.classList.add('ok'); else if (k === i) btn.classList.add('ng'); });
    if (i === null) msg = L2.reveal || '答えはこれ。';
    else if (ok) {
      var st = score.streak;
      msg = st >= 10 && st % 5 === 0 ? pickOne(L2.streak10) : st === 5 ? pickOne(L2.streak5) : st === 3 ? pickOne(L2.streak3) : pickOne(L2.right);
    } else msg = pickOne(L2.wrong);
    var b = row('bot', '<p class="verdict ' + (ok ? 'ok' : 'ng') + '">' + (ok ? '⭕ ' : i === null ? '📘 ' : '❌ ') + esc(msg) + (ok && score.streak >= 2 ? ' <span class="streak">🔥' + score.streak + '連続！</span>' : '') + '</p>' +
      quizAnswerHtml(doc) + '<p class="score">' + esc((L2.score || '{n}問中{ok}問正解').replace('{n}', score.n).replace('{ok}', score.ok)) + '</p>');
    if (ok) celebrate(score.streak);
    // 「もっとかみ砕いて」用に、この問題と関連資料を「さっきの資料」にする
    var r = searcher.search(doc.q.stem + ' ' + doc.q.answers.map(function (k) { return doc.q.choices[k]; }).join(' '), { limit: 6 });
    lastHits = [{ doc: doc, cov: 1, score: 99 }].concat(r.hits.filter(function (h) { return h.doc !== doc; }).slice(0, 2));
    lastQ = doc.q.stem; lastTurn = 'study'; lastSum = M.extract(lastHits, r.kws, 'normal');
    quizChips(b);
  }
  function hintQuiz() {
    var doc = quiz.doc, wrongs = doc.q.choices.map(function (c, i) { return i; }).filter(function (i) { return doc.q.answers.indexOf(i) < 0 && quiz.hinted.indexOf(i) < 0; });
    if (wrongs.length <= 1) { row('bot', esc('もうヒントは出しきったよ。答えてみて！')); return; }
    var x = pickOne(wrongs); quiz.hinted.push(x);
    if (quiz.el) { var bt = quiz.el.querySelector('.qc[data-i="' + x + '"]'); if (bt) bt.classList.add('out'); }
    row('bot', esc((QL().hint || '{x}番はちがうよ。').replace('{x}', x + 1)));
  }
  function celebrate(streak) {
    var n = streak >= 3 ? 40 + Math.min(streak, 10) * 4 : 14, box = document.createElement('div'); box.className = 'confetti' + (streak >= 3 ? ' big' : '');
    var cols = ['#f6c344', '#e46f6f', '#5ab0e8', '#6cc28a', '#b48ae6', CH.color || '#1676ae'];
    for (var i = 0; i < n; i++) { var sp = document.createElement('i'); sp.textContent = streak >= 3 ? '' : '✦'; sp.style.left = (Math.random() * 100) + 'vw'; sp.style.background = streak >= 3 ? cols[i % cols.length] : 'none'; sp.style.color = cols[i % cols.length]; sp.style.animationDelay = (Math.random() * 0.4) + 's'; sp.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px'); box.appendChild(sp); }
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 2200);
  }
  function memoReply() {
    lastTurn = 'study';
    var r = searcher.search(lastQ + ' 覚え方', { limit: 12 }), out = [], kws = S.keywords(lastQ);
    lastHits.concat(r.hits).forEach(function (h) {
      if (!kws.some(function (k) { return Array.from(k).length < 2 || S.norm(h.doc.t + h.doc.x).indexOf(k) >= 0; })) return;
      String(h.doc.x).split(/\n|(?<=。)/).forEach(function (sen) { if (/覚え|ゴロ|語呂|イメージ|コツ|つなげ|たとえ/.test(sen) && sen.length > 8 && out.length < 3 && out.indexOf(sen) < 0) out.push({ s: sen.replace(/^[■・\s]+/, ''), d: h.doc }); });
    });
    var html = out.length ? esc('資料にある覚え方だよ。') + '<div class="sum-box">' + out.map(function (o) { return '<p>・' + esc(o.s) + ' <a class="go" href="' + esc(o.d.u) + '">→</a></p>'; }).join('') + '</div>'
      : esc('資料に語呂合わせは載ってないみたい。まずは要点をおさえよう。') + (lastSum ? sumBox(lastSum, '', '') : '');
    var b = row('bot', html); studyChips(b);
  }

  // ---- 自分のAIで聞く（外部AI・ブラウザ内蔵AI） ----
  var EXT = [
    { id: 'grok', name: 'Grok', url: 'https://grok.com/?q=' },
    { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q=' },
    { id: 'gemini', name: 'Gemini', open: 'https://gemini.google.com/app' },
    { id: 'claude', name: 'Claude', open: 'https://claude.ai/new' },
    { id: 'other', name: 'ほかのAI（コピー）' }
  ];
  function abs(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } }
  function buildPrompt(max) {
    var hits = (lastHits || []).slice(0, 3), per = max ? Math.floor(max / Math.max(hits.length, 1)) : 1e9;
    var src = hits.map(function (h, i) { var x = String(h.doc.x).replace(/\s+/g, ' ').trim(); if (x.length > per) x = x.slice(0, per) + '…'; return '[' + (i + 1) + '] ' + h.doc.t + '\n' + abs(h.doc.u) + '\n' + x; }).join('\n\n');
    var q = lastQ || '';
    if (quiz && quiz.doc && lastQ === quiz.doc.q.stem) q = '過去問「' + quiz.doc.q.stem + '」（選択肢：' + quiz.doc.q.choices.map(function (c, i) { return (i + 1) + '. ' + c; }).join(' ') + '）の答えと理由';
    return 'あなたは柔道整復師国家試験の勉強を手伝う「' + CH.name + '」。' + (CH.persona || '').slice(0, 200) + '\n' +
      '話し方：くだけたタメ口（敬語なし）。やさしく、短く。\n\n' +
      '学生の質問：' + q + '\n\n' +
      '参考資料（学習ポータルより）：\n' + src + '\n\n' +
      'お願い：\n- 上の資料をもとに、中学生にもわかるくらいやさしく説明して。\n- 資料に書いてあることを優先して、使った資料は[1]のように番号で示して。\n- たとえ話を使うときは「たとえるなら：」と書いて、たとえだとわかるようにして。どこがたとえと違うかもひとこと添えて。\n- 自信がないことや資料にないことは「たぶん」「資料にはない」とはっきり言って。\n- 最後に試験で出やすいポイントを1行で。';
  }
  function toast(t) { var el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2600); }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).catch(function () { return legacyCopy(t); });
    return Promise.resolve(legacyCopy(t));
  }
  function legacyCopy(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
  function goExt(id) {
    var s = EXT.filter(function (e) { return e.id === id; })[0] || EXT[0];
    conf.ext = s.id; save();
    var full = buildPrompt(0);
    if (s.url) { var u = s.url + encodeURIComponent(buildPrompt(1500)); window.open(u, '_blank', 'noopener'); copyText(full); return u; }
    copyText(full).then(function () { toast('質問をコピーしたよ。' + (s.open ? s.name + 'に' : '') + '貼り付けてね'); });
    if (s.open) window.open(s.open, '_blank', 'noopener');
    return s.id;
  }
  function hasBuiltin() { return typeof window.LanguageModel !== 'undefined' && !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent); }
  async function builtinAsk(area) {
    area.innerHTML = '<div class="ai-box"><div class="ai-h">🧩 ブラウザ内蔵AI</div><p class="ai-t typing"><span></span><span></span><span></span></p><p class="ai-note">AIはまちがえることがあるよ。資料で確かめてね。</p></div>';
    var out = area.querySelector('.ai-t');
    try {
      var av = await LanguageModel.availability();
      if (av === 'unavailable') throw new Error('この端末では使えないみたい');
      var ses = await LanguageModel.create();
      var txt = '', st = ses.promptStreaming(buildPrompt(3000));
      out.classList.remove('typing'); out.textContent = '';
      for await (var c of st) { txt = c.length > txt.length && c.indexOf(txt) === 0 ? c : txt + c; out.innerHTML = fmt(txt); scroll(); }
    } catch (e) { area.innerHTML = '<p class="ai-fail">' + esc('内蔵AIが使えなかったよ（' + String(e && e.message || e).slice(0, 60) + '）。') + '</p>'; }
  }
  function extAsk(b) {
    if (!lastHits || !lastHits.length) return;
    var order = EXT.slice().sort(function (x, y) { return (y.id === conf.ext) - (x.id === conf.ext); });
    var d = document.createElement('details'); d.className = 'ext';
    d.innerHTML = '<summary>🤖 自分のAIで聞く</summary><div class="ext-btns">' +
      (hasBuiltin() ? '<button type="button" class="ext-b" data-id="builtin">🧩 ブラウザ内蔵AI（この画面で）</button>' : '') +
      order.map(function (e) { return '<button type="button" class="ext-b' + (e.id === conf.ext ? ' last' : '') + '" data-id="' + e.id + '">' + esc(e.name) + (e.id === conf.ext ? ' ★' : '') + '</button>'; }).join('') +
      '</div><div class="ext-area"></div><p class="ext-note">外部AIは各自の判断で使ってね（入力内容は各サービスに送られるよ）。資料の抜き出しと質問をいっしょに送るよ。</p>';
    d.querySelectorAll('.ext-b').forEach(function (btn) {
      btn.onclick = function () { if (btn.dataset.id === 'builtin') builtinAsk(d.querySelector('.ext-area')); else goExt(btn.dataset.id); };
    });
    b.appendChild(d);
  }

  // ---- たとえ（手書きのたとえ集から。AIには作らせない） ----
  var analogies = null;
  function loadAnalogies() { return analogies ? Promise.resolve(analogies) : fetch('analogies.json').then(function (r) { return r.json(); }).then(function (j) { return (analogies = j.items); }); }
  function findAnalogy(items) {
    var N = S.norm, q = N(lastQ || ''), h0 = lastHits && lastHits[0] ? N(lastHits[0].doc.t) : '', main = lastSum && lastSum.main ? N(lastSum.main.s) : '';
    var rest = (lastHits || []).slice(0, 2).map(function (h) { return N(h.doc.x); }).join(' ');
    var best = null, bs = 0;
    items.forEach(function (it) {
      var sc = 0, strong = false;
      it.k.forEach(function (k) {
        var kk = N(k), w = Array.from(kk).length;
        if (q.indexOf(kk) >= 0) { sc += 6 + w; strong = true; }
        if (h0.indexOf(kk) >= 0) { sc += 4 + w; strong = true; }
        if (main.indexOf(kk) >= 0) sc += 3;
        if (rest.indexOf(kk) >= 0) sc += 1;
      });
      if (strong && sc > bs) { bs = sc; best = it; }
    });
    return best;
  }
  function analogyReply(srcs) {
    var A = CH.analogy || {};
    loadAnalogies().then(function (items) {
      var it = findAnalogy(items), b;
      if (!it) {
        b = row('bot', esc(A.none || 'これはいいたとえがないよ。'));
        chipsRow(b, [['もっとかみ砕いて', 'もっとかみ砕いて'], ['試験ではどう出る？', '試験ではどう出る？']]); return;
      }
      b = row('bot', esc(A.intro || 'イメージで言うと：') +
        '<div class="ana-box"><div class="ana-h">💡 たとえるなら（イメージだよ）</div><p class="ana-t">' + esc(it.t) + '</p>' +
        '<p class="ana-c"><b>⚠️ ' + esc(A.caveat || 'たとえと違う所') + '</b><br>' + esc(it.c) + '</p></div>' +
        (lastSum ? '<div class="sum-box"><p>' + fmt('【正確には】' + lastSum.main.s + '[' + lastSum.main.n + ']') + '</p></div>' : '') + srcs);
      studyChips(b);
    }).catch(function () { var b = row('bot', esc(A.none || 'たとえが読みこめなかったよ。')); studyChips(b); });
  }

  function followUp(q) {
    lastTurn = 'study'; talkTurns = 0;
    var mode = L.followMode(q), top = lastHits.slice(0, 3), kws = S.keywords(lastQ);
    var srcs = '<details class="rest"><summary>さっきの資料（' + top.length + '件）</summary>' + top.map(function (h, i) { return card(h, i + 1, kws); }).join('') + '</details>';
    if (mode === 'exam' || mode === 'detail') { // 資料から抜き出し（AIなし）
      var sum = M.extract(lastHits.slice(0, 6), kws, mode === 'detail' ? 'detail' : 'normal');
      var qs = lastHits.filter(function (h) { return h.doc.k === 'q'; }).slice(0, 3);
      var html = mode === 'exam'
        ? esc(CH.examIntro || '試験ではこう出てるよ。') + (sum && sum.exam && !/^第\d+回/.test(sum.exam.s) ? '<div class="sum-box"><p>' + fmt('【試験では】' + sum.exam.s + '[' + sum.exam.n + ']') + '</p></div>' : '') +
          (qs.length ? '<div class="sum-box"><b class="lbl">過去問</b><br>' + qs.map(function (h) { var a = (h.doc.x.match(/正解：([^\n]*)/) || [])[1] || ''; return esc(h.doc.t.replace(/^.*?過去問\s*/, '') + '：' + h.doc.q.stem + ' → 正解 ' + a); }).join('<br>') + '</div>' : '<p class="hint">この話題の過去問は、さっきの検索には入ってなかったよ。</p>')
        : esc(CH.detailIntro || 'もう少しくわしく。') + (sum ? sumBox(sum, '', '') : '');
      var bb = row('bot', html + srcs); studyChips(bb); return;
    }
    if (mode === 'analogy') { analogyReply(srcs); return; }
    var say = mode === 'analogy' ? (CH.analogyIntro || 'たとえも入れて言うね。') : (CH.simpleIntro || 'もっとやさしく言うね。');
    var b = row('bot', esc(say) + srcs + '<div class="ai-area"></div>');
    var area = b.querySelector('.ai-area');
    var fallback = function (msg) { area.innerHTML = (lastSum ? '<div class="sum-box"><p>' + fmt(FULL ? '【ひとことで】' + lastSum.main.s + '[' + lastSum.main.n + ']' : M.toText(lastSum)) + '</p></div>' : '') + '<p class="hint">' + esc(msg) + '</p>'; studyChips(b); };
    if (!conf.localAi) { fallback(FULL ? 'もっと言いかえてほしいときは、下の「自分のAIで聞く」も使えるよ。' : 'くわしくは資料のリンクから読んでみてね。'); return; }
    if (!navigator.gpu) { fallback('やさしい言いかえ・たとえ話はAI対応の端末（WebGPU）で使えるよ。いまは資料の要点だけ見せるね。'); return; }
    var lq = lastQ + '（' + q + '）';
    var go = function () { explain(area, lq, top, mode, lastSum, function () { studyChips(b); }); };
    if (engine || localStorage.getItem(KEY + '-dl')) go();
    else {
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ai-btn';
      btn.textContent = '✨ ' + CH.name + 'のAIで言いかえ（初回はモデルを準備）';
      btn.onclick = function () { btn.remove(); go(); };
      area.appendChild(btn);
    }
  }

  function prog(p, t) { var el = $('prog'); el.hidden = p == null; if (p != null) { $('pbar').style.width = Math.round(p * 100) + '%'; $('ptxt').textContent = t || ''; } }
  function modelInfo() { return L.MODELS.filter(function (m) { return m.id === conf.model; })[0]; }
  async function loadEngine() {
    if (engine && engineModel === conf.model) return engine;
    if (loading) return loading;
    loading = (async function () {
      try {
        var webllm = await import('https://esm.run/@mlc-ai/web-llm');
        prog(0, 'モデルを準備中…');
        if (engine) { await engine.unload(); engine = null; }
        engine = await webllm.CreateMLCEngine(conf.model, { initProgressCallback: function (r) { prog(r.progress, r.text); } });
        engineModel = conf.model; prog(null); return engine;
      } catch (e) { prog(null); engine = null; throw e; } finally { loading = null; }
    })();
    return loading;
  }
  async function explain(area, q, hits, mode, sum, done) {
    if (!engine && !localStorage.getItem(KEY + '-dl')) {
      if (!confirm('AI説明のために、はじめに一度だけモデル（' + modelInfo().size + '）をダウンロードするよ。Wi-Fiのときがおすすめ。続ける？')) {
        area.innerHTML = '<p class="hint">資料だけ表示してるよ。AI説明は⚙️からいつでも使えるよ。</p>'; return;
      }
      try { localStorage.setItem(KEY + '-dl', '1'); } catch (e) {}
    }
    busy = true; $('send').disabled = true;
    var box = document.createElement('div'); box.className = 'ai-box';
    box.innerHTML = '<div class="ai-h">✨ ' + esc(CH.name) + 'のAI言いかえ' + '</div><p class="ai-t typing"><span></span><span></span><span></span></p><p class="ai-note">AIはまちがえることがあるよ。かならず上の資料で確かめてね。</p>';
    area.appendChild(box); scroll();
    var out = box.querySelector('.ai-t'), txt = null, why = '';
    try {
      var eng = await loadEngine();
      var msgs = L.messages(CH, q, hits, mode, sum ? Mx.toText(sum) : '');
      for (var i = 0; i < 2 && !txt; i++) {
        var st = await eng.chat.completions.create(Object.assign({ stream: true, messages: msgs }, L.params, { temperature: i ? 0.2 : L.params.temperature }));
        var s = '', cut = false, n = 0;
        for await (var c of st) {
          s += (c.choices[0] && c.choices[0].delta && c.choices[0].delta.content) || '';
          // 生の出力は見せない（チェックを通った文だけ表示する）
          if ((++n % 4) === 0 && L.looping(s)) { cut = true; try { eng.interruptGenerate(); } catch (e) {} break; } // ループしたら止める
        }
        s = L.clean(s, cut, L.ctxOf(q, hits)); why = L.problem(s, q, hits, sum ? Mx.coreText(sum) : '');
        if (cut && !why) why = null; // 切りつめて十分な長さなら使う
        if (!why || (why === 'keigo' && i === 1)) txt = s; else { out.classList.add('typing'); out.innerHTML = '<span></span><span></span><span></span>'; }
      }
    } catch (e) { why = 'error: ' + String(e && e.message || e).slice(0, 80); }
    busy = false; $('send').disabled = false;
    if (txt) {
      out.classList.remove('typing'); out.innerHTML = fmt(txt);
      if (/たとえるなら/.test(txt)) box.querySelector('.ai-note').textContent = '「たとえるなら」はイメージだよ。正確な内容は上の資料で確かめてね。';
    }
    else {
      if (/^error/.test(why) && window.console) console.warn('AI言いかえ', why);
      box.outerHTML = (sum ? '<div class="sum-box"><p>' + fmt('【ひとことで】' + sum.main.s + '[' + sum.main.n + ']') + '</p></div>' : '') +
        '<p class="ai-fail">' + esc(/^error/.test(why) ? 'いまはAIが使えないみたい。要点はこれだよ。' : 'うまく言いかえられなかったから、資料の要点で見てね。') + '</p>';
    }
    if (done) done();
    scroll();
  }

  // ---- 設定 ----
  function renderSettings() {
    $('modelSel').innerHTML = L.MODELS.map(function (m) { return '<option value="' + m.id + '"' + (m.id === conf.model ? ' selected' : '') + '>' + esc(m.label) + '</option>'; }).join('');
    $('gpuNote').textContent = navigator.gpu ? 'この端末はAI説明に対応してるよ（WebGPU）。' : 'この端末・ブラウザはWebGPUがないので、AI説明は使えないよ（資料の検索は使えるよ）。';
    document.querySelectorAll('.subj-chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.subj === conf.subj)); });
  }
  $('localAi').checked = !!conf.localAi; $('localAi').onchange = function (e) { conf.localAi = e.target.checked; save(); };
  $('modelSel').onchange = function (e) { conf.model = e.target.value; save(); };
  $('gear').onclick = function () { $('settings').hidden = !$('settings').hidden; };
  document.querySelectorAll('.subj-chip').forEach(function (b) { b.onclick = function () { conf.subj = b.dataset.subj; save(); renderSettings(); }; });

  form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value; input.value = ''; ask(q); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  $('sample').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ask(b.textContent); });

  // ---- まちがえた問題の「なんで違う？」（過去問ページの why-card.js から来る） ----
  // ?mode=why&s=ana|phy|cli&id=第回-問&pick=えらんだ番号(0始まり,カンマ区切り)
  var WS = { ana: 'anatomy', phy: 'physiology', cli: 'clinical' };
  function whyMode(docs) {
    var s = WS[params.get('s')], id = String(params.get('id') || '').split('-'), pick = String(params.get('pick') || '').split(',').filter(Boolean).map(Number);
    var qd = s && docs.filter(function (d) { return d.k === 'q' && d.s === s && new RegExp('第' + id[0] + '回 問' + id[1] + '$').test(d.t); })[0];
    if (!qd) { row('bot', esc('問題が見つからなかったよ。わからない言葉を下に入れてね。')); return; }
    urlSubj = s;
    fetch('../data/wrong-links.json').then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (wl) {
      var l = (wl[params.get('s')] || {})[params.get('id')], gd = l && docs.filter(function (d) { return d.k === 'g' && d.u === l[0]; })[0];
      var q = qd.q, wrong = pick.filter(function (i) { return q.answers.indexOf(i) < 0; });
      var ex = qd.x.slice(qd.x.indexOf('正解：')).split('\n').slice(1).join('\n').trim();
      var b = row('bot', '<div class="quiz"><div class="quiz-h">' + esc(qd.t.replace(' 過去問', '')) + '</div><p class="stem">' + esc(q.stem) + '</p>' +
        q.choices.map(function (c, i) { var ok = q.answers.indexOf(i) >= 0, ng = wrong.indexOf(i) >= 0; return '<button type="button" disabled class="qc' + (ok ? ' ok' : ng ? ' ng' : '') + '">' + (i + 1) + '. ' + esc(c) + (ok ? '　← 正解' : ng ? '　← えらんだ' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="sum-box">' + (wrong.length ? '<p><b class="lbl">えらんだ</b> ' + esc(wrong.map(function (i) { return (i + 1) + '. ' + q.choices[i]; }).join('、')) + '</p>' : '') +
        '<p><b class="lbl">正解</b> ' + esc(q.answers.map(function (i) { return (i + 1) + '. ' + q.choices[i]; }).join('、')) + '</p>' + (ex ? '<p><b class="lbl">なぜ</b> ' + esc(ex).replace(/\n/g, '<br>') + '</p>' : '') + '</div>' +
        (l ? '<p><a class="go" href="' + esc(l[0]) + '">📖 資料で確かめる：' + esc(l[1]) + ' →</a></p>' : ''));
      lastHits = [{ doc: qd, cov: 1, score: 99 }].concat(gd ? [{ doc: gd, cov: 1, score: 98 }] : []);
      lastQ = '過去問「' + q.stem + '」で' + (wrong.length ? '「' + wrong.map(function (i) { return q.choices[i]; }).join('、') + '」をえらんでまちがえた。なぜ違うのか、正解「' + q.answers.map(function (i) { return q.choices[i]; }).join('、') + '」との違い' : '答えの理由');
      lastTurn = 'study';
      // 「ひとことで」はこの問題の解説から。ポイントは、つないだ資料の文のうち正解の言葉を含むものだけ（関係ない文を混ぜない）
      var akw = S.keywords(q.answers.map(function (i) { return q.choices[i]; }).join(' ')).filter(function (k) { return Array.from(k).length >= 2; });
      var gs = gd ? M.extract([{ doc: gd, cov: 1, score: 98 }], akw.concat(S.keywords(q.stem)), 'normal') : null;
      var pts = gs ? [gs.main].concat(gs.points).filter(function (p) { return p && akw.some(function (k) { return S.norm(p.s).indexOf(k) >= 0; }); }).slice(0, 2).map(function (p) { return { s: p.s, n: 2 }; }) : [];
      lastSum = ex ? { main: { s: ex.split(/(?<=。)/)[0].trim(), n: 1 }, points: pts, exam: null } : M.extract(lastHits, akw, 'normal');
      studyChips(b);
    });
  }

  // ---- 起動 ----
  function setChar(id, greet) {
    CH = CHS.filter(function (c) { return c.id === id; })[0] || CHS[0];
    conf.char = CH.id; save();
    document.title = CH.name + '｜解説AI｜柔道整復師 学習ポータル';
    $('chName').textContent = CH.name; $('chAv').src = CH.avatar;
    document.documentElement.style.setProperty('--ch', CH.color || '#1676ae');
    router = null; lastTurn = null; talkTurns = 0;
    if (greet) row('bot', esc(CH.greeting));
  }
  function showPicker(first) {
    var pk = $('picker');
    pk.innerHTML = '<h2>' + (first ? 'いっしょに勉強する先生をえらんでね' : '先生を変える') + '</h2>' +
      CHS.map(function (c) { return '<button type="button" class="pick" data-id="' + esc(c.id) + '" style="--pc:' + esc(c.color) + '"><img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy"><span class="pn">' + esc(c.name) + '</span><span class="pt">' + esc(c.tagline) + '</span></button>'; }).join('') +
      (first ? '' : '<button type="button" class="pick-cancel">そのまま</button>');
    pk.hidden = false; document.body.classList.add('picking');
    pk.onclick = function (e) {
      var b = e.target.closest('.pick'), cancel = e.target.closest('.pick-cancel');
      if (!b && !cancel) return;
      pk.hidden = true; document.body.classList.remove('picking');
      if (b && (first || b.dataset.id !== CH.id)) { setChar(b.dataset.id, true); if (first) start(); }
    };
  }
  $('chBtn').onclick = function () { if (FULL) showPicker(false); };
  $('changeChar').onclick = function () { $('settings').hidden = true; showPicker(false); };
  renderSettings();
  var from = params.get('from'), subj = params.get('subj'), ctxQ = params.get('ctx'), q0 = params.get('q');
  if (subj && SUBJ[subj]) urlSubj = subj; // ページから来た科目は一時的に優先（保存しない）
  var started = false;
  function start() {
    if (started) return; started = true;
    if (from) row('bot', '<small class="from">「' + esc(from) + '」から来たんだね。</small>');
    if (ctxQ && !q0) { input.value = ctxQ.slice(0, 200); }
    if (q0 && searcher) ask(q0.slice(0, 200));
  }
  if (!FULL) { setChar(CHS.some(function (c) { return c.id === conf.char; }) ? conf.char : CHS[0].id, !params.get('mode')); start(); }
  else if (conf.char && CHS.some(function (c) { return c.id === conf.char; })) { setChar(conf.char, true); start(); }
  else showPicker(true);
  fetch('search-index.json').then(function (r) { return r.json(); }).then(function (idx) {
    searcher = S.buildSearch(idx.docs); window.__aiTutorReady = idx.docs.length;
    if (params.get('mode') === 'why') { whyMode(idx.docs); return; }
    if (q0 && started) ask(q0.slice(0, 200));
  }).catch(function () { row('bot', '資料の読み込みに失敗しちゃった。通信を確認して、もう一度開いてね。'); });
})();
