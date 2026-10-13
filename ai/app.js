/* 解説AI先生 本体：検索 → 資料カード → （任意）AIのかんたん説明 */
(function () {
  'use strict';
  var CHS = window.AI_TUTOR_CHARACTERS, CH = CHS[0], M = window.AITutorSummary, Mx = M, S = window.AITutorSearch, L = window.AITutorLLM;
  var $ = function (id) { return document.getElementById(id); };
  var log = $('log'), form = $('askForm'), input = $('askInput');
  var SUBJ = { anatomy: '解剖学', physiology: '生理学', clinical: '一般臨床' };
  var KEY = 'jkp-ai-tutor';
  var conf = (function () { try { return Object.assign({ model: L.MODELS[0].id, auto: false, subj: '', char: '' }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return { model: L.MODELS[0].id, auto: false, subj: '' }; } })();
  if (!L.MODELS.some(function (m) { return m.id === conf.model; })) conf.model = L.MODELS[0].id; // 3B などの古い設定は 1.5B に戻す
  function save() { try { localStorage.setItem(KEY, JSON.stringify(conf)); } catch (e) {} }
  var params = new URLSearchParams(location.search);
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
      chipsRow(b, [['「' + t + '」を聞く', t], ['1問だけやる', t + 'の過去問']]);
    }
  }

  function ask(q) {
    q = q.trim(); if (!q || busy) return;
    row('me', esc(q));
    if (!searcher) { row('bot', '資料を読み込み中…ちょっと待ってね。'); return; }
    if (!router) initTalk();
    var rt = router ? router.route(q, { lastTurn: lastTurn, lastHits: lastHits, lastQ: lastQ }) : null;
    var r = rt ? rt.r : searcher.search(q, { subj: conf.subj || urlSubj, limit: 6 }), hits, follow = false;
    if (rt && (rt.kind === 'talk' || rt.kind === 'encourage') && talk) { talkReply(q, rt.kind); return; }
    if (rt && rt.kind === 'follow' || !rt && isFollowUp(q, r.kws)) { followUp(q); return; }
    else {
      var big = r.kws.filter(function (k) { return Array.from(k).length >= 2; });
      hits = r.hits.filter(function (h) { return h.cov >= 0.4; });
      var hasKw = !big.length || hits.slice(0, 3).some(function (h) { var t = S.norm(h.doc.t + ' ' + h.doc.x); return big.some(function (k) { return t.indexOf(k) >= 0; }); });
      if (rt ? rt.kind === 'notfound' : (!hits.length || hits[0].cov < 0.5 || !hasKw)) { row('bot', esc(CH.notFound)); lastTurn = 'study'; return; }
      lastHits = hits; lastQ = q; lastTurn = 'study'; talkTurns = 0;
    }
    var kws = r.kws, top = hits.slice(0, 3), rest = hits.slice(3);
    lastSum = M.extract(top, kws, 'normal');
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
  function studyChips(b) { chipsRow(b, [['もっとかみ砕いて', 'もっとかみ砕いて'], ['たとえで', 'たとえで'], ['試験ではどう出る？', '試験ではどう出る？']]); }
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
    var say = mode === 'analogy' ? (CH.analogyIntro || 'たとえも入れて言うね。') : (CH.simpleIntro || 'もっとやさしく言うね。');
    var b = row('bot', esc(say) + srcs + '<div class="ai-area"></div>');
    var area = b.querySelector('.ai-area');
    var fallback = function (msg) { area.innerHTML = (lastSum ? '<div class="sum-box"><p>' + fmt('【ひとことで】' + lastSum.main.s + '[' + lastSum.main.n + ']') + '</p></div>' : '') + '<p class="hint">' + esc(msg) + '</p>'; studyChips(b); };
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
      out.innerHTML = fmt(txt);
      if (/たとえるなら/.test(txt)) box.querySelector('.ai-note').textContent = '「たとえるなら」はイメージだよ。正確な内容は上の資料で確かめてね。';
    }
    else { out.classList.remove('typing'); if (sum) box.insertAdjacentHTML('beforebegin', '<div class="sum-box"><p>' + fmt('【ひとことで】' + sum.main.s + '[' + sum.main.n + ']') + '</p></div>'); out.textContent = /^error/.test(why) ? '⚠️ AIが使えなかったよ（' + why.slice(7) + '）。上の資料を読んでみてね。' : 'AIはうまく言いかえられなかったよ（小さいAIなので、まちがいそうな答えは出さないようにしてるの）。'; }
    if (done) done();
    scroll();
  }

  // ---- 設定 ----
  function renderSettings() {
    $('modelSel').innerHTML = L.MODELS.map(function (m) { return '<option value="' + m.id + '"' + (m.id === conf.model ? ' selected' : '') + '>' + esc(m.label) + '</option>'; }).join('');
    $('gpuNote').textContent = navigator.gpu ? 'この端末はAI説明に対応してるよ（WebGPU）。' : 'この端末・ブラウザはWebGPUがないので、AI説明は使えないよ（資料の検索は使えるよ）。';
    document.querySelectorAll('.subj-chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.subj === conf.subj)); });
  }
  $('modelSel').onchange = function (e) { conf.model = e.target.value; save(); };
  $('gear').onclick = function () { $('settings').hidden = !$('settings').hidden; };
  document.querySelectorAll('.subj-chip').forEach(function (b) { b.onclick = function () { conf.subj = b.dataset.subj; save(); renderSettings(); }; });

  form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value; input.value = ''; ask(q); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  $('sample').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ask(b.textContent); });

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
  $('chBtn').onclick = function () { showPicker(false); };
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
  if (conf.char && CHS.some(function (c) { return c.id === conf.char; })) { setChar(conf.char, true); start(); }
  else showPicker(true);
  fetch('search-index.json').then(function (r) { return r.json(); }).then(function (idx) {
    searcher = S.buildSearch(idx.docs); window.__aiTutorReady = idx.docs.length;
    if (q0 && started) ask(q0.slice(0, 200));
  }).catch(function () { row('bot', '資料の読み込みに失敗しちゃった。通信を確認して、もう一度開いてね。'); });
})();
