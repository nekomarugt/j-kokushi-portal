/* 科目をつなぐ橋（解剖学 ⇄ 生理学 ⇄ 一般臨床）。
 * データ: ../data/bridges.json（対応表）→ ここで描画するだけ。リンクを HTML に直書きしない。
 * 生理学の節：「つながり」バー（解剖＝名前・場所／臨床＝乱れると）を節の本文の先頭に1つ。
 * 解剖学・一般臨床の節：生理学（ハブ）へ戻る1行リンク。
 * 学習資料側のアプリが描き直しても MutationObserver で付け直す。データが読めなければ何もしない。 */
(function () {
  'use strict';
  var p = location.pathname;
  var kind = /\/physiology-guide\//.test(p) ? 'phys' : /\/anatomy-guide\//.test(p) ? 'anat' : /\/clinical-guide\//.test(p) ? 'clin' : '';
  if (!kind || !window.fetch) return;
  var HREF = { anat: '../anatomy-guide/#', phys: '../physiology-guide/#', clin: '../clinical-guide/#' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function link(side, item, pre) { return '<a href="' + HREF[side] + esc(item.id) + '" data-bridge-to="' + esc(item.id) + '">' + esc((pre || '') + item.t) + '</a>'; }

  var byPhys = {}, back = {}, order = [];
  function addBack(id, ph) {
    var list = back[id] || (back[id] = []);
    if (!list.some(function (x) { return x.id === ph.id; })) list.push(ph);
  }
  function index(data) {
    (data.slices || []).forEach(function (slice) {
      (slice.rows || []).forEach(function (row) {
        (row.physiology || []).forEach(function (ph) {
          if (!byPhys[ph.id]) { byPhys[ph.id] = []; order.push(ph.id); }
          byPhys[ph.id].push(row);
        });
        (row.anatomy || []).forEach(function (a) { (row.physiology || []).forEach(function (ph) { addBack('a:' + a.id, ph); }); });
        (row.clinical || []).forEach(function (c) { (row.physiology || []).forEach(function (ph) { addBack('c:' + c.id, ph); }); });
      });
    });
  }

  function physBar(id) {
    var rows = byPhys[id];
    var names = rows.map(function (r) { return r.gland; }).filter(function (g) { return g !== '内分泌の全体像'; });
    var html = rows.map(function (r) {
      var other = (r.physiology || []).filter(function (x) { return x.id !== id; });
      return '<div class="bridge-row">' +
        '<p class="bridge-gland"><strong>' + esc(r.gland) + '</strong></p>' +
        (r.anatomy && r.anatomy.length ? '<p class="mb-go"><span class="mb-k">← 解剖（名前・場所）</span>' + r.anatomy.map(function (x) { return link('anat', x); }).join('') + '</p>' : '') +
        (r.clinical && r.clinical.length ? '<p class="mb-go"><span class="mb-k">→ 臨床（乱れると）</span>' + r.clinical.map(function (x) { return link('clin', x); }).join('') + '</p>' : '') +
        (r.hint ? '<p class="bridge-hint">' + esc(r.hint) + '</p>' : '') +
        (r.add ? '<p class="bridge-add">' + esc(r.add) + '</p>' : '') +
        (other.length ? '<p class="mb-go"><span class="mb-k">生理学の関連</span>' + other.map(function (x) { return link('phys', x); }).join('') + '</p>' : '') +
        '</div>';
    }).join('');
    var d = document.createElement('details');
    d.className = 'bridge';
    d.setAttribute('data-bridge', id);
    d.innerHTML = '<summary><span class="bridge-badge">つながり</span><span class="bridge-title">← 解剖 ｜ → 臨床' +
      (names.length ? '：' + esc(names.join('・')) : '') + '</span><span class="bridge-open" aria-hidden="true">ひらく</span></summary>' +
      '<div class="bridge-body">' + html + '</div>';
    return d;
  }
  function backLine(list, key) {
    var el = document.createElement('p');
    el.className = 'mb-go bridge-back';
    el.setAttribute('data-bridge', key);
    el.innerHTML = '<span class="mb-k">仕組みは生理学へ</span>' + list.map(function (x) { return link('phys', x, '生理学：'); }).join('');
    return el;
  }

  function apply() {
    if (kind === 'phys') {
      order.forEach(function (id) {
        var card = document.getElementById(id);
        var body = card && card.querySelector('.lesson-body');
        if (body && !body.querySelector('[data-bridge]')) body.insertBefore(physBar(id), body.firstChild);
      });
    } else {
      var pre = kind === 'anat' ? 'a:' : 'c:';
      Object.keys(back).forEach(function (key) {
        if (key.indexOf(pre) !== 0) return;
        var target = document.getElementById(key.slice(2));
        if (!target) return;
        var item = kind === 'anat' ? target : target.closest('.acc-item');
        var body = item && item.querySelector(kind === 'anat' ? '.lesson-body' : '.acc-body');
        if (body && !body.querySelector('[data-bridge]')) body.insertBefore(backLine(back[key], key), body.firstChild);
      });
    }
  }

  var CSS = 'details.bridge{margin:4px 0 12px;border:1px dashed #9db8c9;border-radius:12px;background:#fbfdff}' +
    'details.bridge>summary{display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 12px;list-style:none;cursor:pointer;font-size:.92rem;color:#2f4a5e}' +
    'details.bridge>summary::-webkit-details-marker{display:none}details.bridge>summary:focus-visible{outline:3px solid #0b5ea8;outline-offset:2px}' +
    '.bridge-badge{flex:none;padding:2px 10px;border-radius:999px;background:#fff1d6;color:#8a5a00;font-size:.78rem;font-weight:800}' +
    '.bridge-title{flex:1;min-width:0;font-weight:700}.bridge-open{flex:none;font-size:.78rem;color:#607487}details.bridge[open] .bridge-open{display:none}' +
    '.bridge-body{padding:2px 12px 12px;font-size:.95rem;line-height:1.7;overflow-wrap:anywhere}' +
    '.bridge-row{padding:6px 0;border-top:1px dotted #c9d6e0}.bridge-row:first-child{border-top:0}' +
    '.bridge-row p{margin:4px 0}.bridge-gland{margin:2px 0 4px}' +
    '.bridge-hint,.bridge-add{font-size:.9rem;line-height:1.6;color:#33475b}' +
    '.bridge-add{padding:4px 10px;border-left:3px solid #e0b54a;background:#fffaf0}' +
    '.bridge-back{margin:2px 0 10px}';
  function start(data) {
    index(data);
    var st = document.createElement('style'); st.setAttribute('data-bridge-css', ''); st.textContent = CSS; document.head.appendChild(st);
    var queued = false;
    var mo = new MutationObserver(function () {
      if (queued) return; queued = true;
      (window.requestAnimationFrame || setTimeout)(function () { queued = false; apply(); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    apply();
  }
  fetch('../data/bridges.json').then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(start).catch(function () {});
})();
