/* 解説AI先生 本体：検索 → 資料カード → （任意）AIのかんたん説明 */
(function () {
  'use strict';
  var CHS = window.AI_TUTOR_CHARACTERS, CH = CHS[0], S = window.AITutorSearch, L = window.AITutorLLM;
  var $ = function (id) { return document.getElementById(id); };
  var log = $('log'), form = $('askForm'), input = $('askInput');
  var SUBJ = { anatomy: '解剖学', physiology: '生理学', clinical: '一般臨床' };
  var KEY = 'jkp-ai-tutor';
  var conf = (function () { try { return Object.assign({ model: L.MODELS[0].id, auto: false, subj: '', char: '' }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return { model: L.MODELS[0].id, auto: false, subj: '' }; } })();
  if (!L.MODELS.some(function (m) { return m.id === conf.model; })) conf.model = L.MODELS[0].id; // 3B などの古い設定は 1.5B に戻す
  function save() { try { localStorage.setItem(KEY, JSON.stringify(conf)); } catch (e) {} }
  var params = new URLSearchParams(location.search);
  var urlSubj = '', engine = null, engineModel = null, loading = null, searcher = null, lastHits = null, lastQ = '', busy = false;

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
  function isFollowUp(q, kws) { return lastHits && !kws.some(function (k) { return Array.from(k).length >= 2; }); }

  function ask(q) {
    q = q.trim(); if (!q || busy) return;
    row('me', esc(q));
    if (!searcher) { row('bot', '資料を読み込み中…ちょっと待ってね。'); return; }
    var r = searcher.search(q, { subj: conf.subj || urlSubj, limit: 6 }), hits, follow = false;
    if (isFollowUp(q, r.kws)) { hits = lastHits; follow = true; }
    else {
      // 見つからない判定：中身の語（2文字以上）がどの候補にも入っていない、または一致が少なすぎる
      var big = r.kws.filter(function (k) { return Array.from(k).length >= 2; });
      hits = r.hits.filter(function (h) { return h.cov >= 0.4; });
      var hasKw = !big.length || hits.slice(0, 3).some(function (h) { var t = S.norm(h.doc.t + ' ' + h.doc.x); return big.some(function (k) { return t.indexOf(k) >= 0; }); });
      if (!hits.length || hits[0].cov < 0.5 || !hasKw) { row('bot', esc(CH.notFound)); return; }
      lastHits = hits; lastQ = q;
    }
    var kws = follow ? S.keywords(lastQ) : r.kws, top = hits.slice(0, 3), rest = hits.slice(3);
    var b = row('bot', esc(follow ? 'さっきの資料でいうと…' : CH.found) +
      top.map(function (h, i) { return card(h, i + 1, kws); }).join('') +
      (rest.length ? '<details class="rest"><summary>ほかの候補（' + rest.length + '件）</summary>' + rest.map(function (h, i) { return card(h, i + 4, kws); }).join('') + '</details>' : '') +
      '<div class="ai-area"></div>');
    var area = b.querySelector('.ai-area');
    if (!navigator.gpu) { area.innerHTML = '<p class="hint">この端末・ブラウザではAI説明が使えないから、資料だけ表示してるよ（検索はふつうに使えるよ）。</p>'; return; }
    if (conf.auto && engine) explain(area, q, top);
    else {
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ai-btn';
      btn.textContent = '✨ ' + CH.name + 'のAI説明' + (engine ? '' : '（初回はモデルを準備）');
      btn.onclick = function () { btn.remove(); explain(area, q, top); };
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
  async function explain(area, q, hits) {
    if (!engine && !localStorage.getItem(KEY + '-dl')) {
      if (!confirm('AI説明のために、はじめに一度だけモデル（' + modelInfo().size + '）をダウンロードするよ。Wi-Fiのときがおすすめ。続ける？')) {
        area.innerHTML = '<p class="hint">資料だけ表示してるよ。AI説明は⚙️からいつでも使えるよ。</p>'; return;
      }
      try { localStorage.setItem(KEY + '-dl', '1'); } catch (e) {}
    }
    busy = true; $('send').disabled = true;
    var box = document.createElement('div'); box.className = 'ai-box';
    box.innerHTML = '<div class="ai-h">✨ ' + esc(CH.name) + 'のAI説明' + '</div><p class="ai-t typing"><span></span><span></span><span></span></p><p class="ai-note">AIはまちがえることがあるよ。かならず上の資料で確かめてね。</p>';
    area.appendChild(box); scroll();
    var out = box.querySelector('.ai-t'), txt = null, why = '';
    try {
      var eng = await loadEngine();
      var msgs = L.messages(CH, q, hits);
      for (var i = 0; i < 2 && !txt; i++) {
        var st = await eng.chat.completions.create(Object.assign({ stream: true, messages: msgs }, L.params, { temperature: i ? 0.2 : L.params.temperature }));
        var s = '';
        for await (var c of st) { s += (c.choices[0] && c.choices[0].delta && c.choices[0].delta.content) || ''; out.classList.remove('typing'); out.textContent = s; scroll(); }
        s = L.clean(s); why = L.problem(s, q, hits);
        if (!why || (why === 'keigo' && i === 1)) txt = s; else { out.classList.add('typing'); out.innerHTML = '<span></span><span></span><span></span>'; }
      }
    } catch (e) { why = 'error: ' + String(e && e.message || e).slice(0, 80); }
    busy = false; $('send').disabled = false;
    if (txt) out.innerHTML = esc(txt).replace(/\[(\d)\]/g, '<sup class="cite">[$1]</sup>').replace(/\n/g, '<br>');
    else { out.classList.remove('typing'); out.textContent = /^error/.test(why) ? '⚠️ AIが使えなかったよ（' + why.slice(7) + '）。上の資料を読んでみてね。' : 'うまく説明できなかったから、上の資料を読んでみてね。'; }
    scroll();
  }

  // ---- 設定 ----
  function renderSettings() {
    $('modelSel').innerHTML = L.MODELS.map(function (m) { return '<option value="' + m.id + '"' + (m.id === conf.model ? ' selected' : '') + '>' + esc(m.label) + '</option>'; }).join('');
    $('autoAi').checked = !!conf.auto;
    $('gpuNote').textContent = navigator.gpu ? 'この端末はAI説明に対応してるよ（WebGPU）。' : 'この端末・ブラウザはWebGPUがないので、AI説明は使えないよ（資料の検索は使えるよ）。';
    document.querySelectorAll('.subj-chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.subj === conf.subj)); });
  }
  $('modelSel').onchange = function (e) { conf.model = e.target.value; save(); };
  $('autoAi').onchange = function (e) { conf.auto = e.target.checked; save(); };
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
