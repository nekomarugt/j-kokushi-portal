/* 「なんで違う？」カード（AIなし）：過去問でまちがえたら、えらんだ選択肢・正解・資料へのリンクを出す。
 * 資料へのリンクは data/wrong-links.json（tools/build-wrong-links.js で先に決めたもの）から。
 * リンクは学習資料ページへのふつうの <a> なので、限界突破②「資料を読む」に数えられる（game.js がクリックを拾う）。 */
(function () {
  'use strict';
  var me = document.currentScript, ROOT = new URL('./', (me && me.src) || location.href).href;
  var GUIDE = { ana: ['anatomy-guide/', '解剖学'], phy: ['physiology-guide/', '生理学'], cli: ['clinical-guide/', '一般臨床'] };
  var links = null, traps = null;
  var get = function (f) { return fetch(ROOT + 'data/' + f).then(function (r) { return r.json(); }).catch(function () { return {}; }); };
  var wait = Promise.all([get('wrong-links.json'), get('trap-notes.json')]).then(function (a) { links = a[0]; traps = a[1]; });
  var css = document.createElement('style');
  css.textContent = '.why-card{margin:0 0 16px;padding:14px 15px;border:2px solid #e3b3b3;border-radius:14px;background:#fff;color:#10213e}' +
    '.why-card h3{margin:0 0 8px;font-size:1rem;color:#8f2d2d}.why-card .wr{display:flex;gap:8px;align-items:baseline;margin:4px 0;line-height:1.5}' +
    '.why-card .wl{flex:none;min-width:4.6em;padding:1px 7px;border-radius:999px;font-size:.78rem;font-weight:800;text-align:center}' +
    '.why-card .wl.ng{background:#fde2e2;color:#8f2d2d}.why-card .wl.ok{background:#dcf3e6;color:#105b3a}' +
    '.why-card .wn{margin:8px 0 0;font-size:.85rem;color:#4a5872}.why-card .wa{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
    '.why-card .wa a{display:inline-flex;align-items:center;min-height:40px;padding:6px 13px;border-radius:999px;font-weight:800;font-size:.9rem;text-decoration:none}' +
    '.why-card .wg{background:#1676ae;color:#fff}' +
    '.why-card .wt{margin:6px 0 2px;padding:8px 10px;border-radius:10px;background:#fff6e5;border-left:4px solid #d98a1c;line-height:1.55}.why-card .wt b{color:#a35d00;margin-right:4px}';
  document.head.appendChild(css);
  function txt(tag, cls, s) { var e = document.createElement(tag); if (cls) e.className = cls; if (s != null) e.textContent = s; return e; }
  function row(lbl, cls, s) { var r = txt('div', 'wr'); r.append(txt('span', 'wl ' + cls, lbl), txt('span', '', s)); return r; }
  function show(o) { // o = { subj:'ana', id:'18-1', question, picked:[index], correct:bool, feedback, before }
    var old = document.querySelector('.why-card'); if (old) old.remove();
    if (o.correct) return;
    var q = o.question, pick = o.picked.filter(function (i) { return q.answers.indexOf(i) < 0; });
    var card = txt('section', 'why-card'); card.setAttribute('aria-label', 'なんで違う？');
    card.append(txt('h3', '', '🤔 なんで違う？'));
    var trapBox = txt('div', ''); // ワナの一言（data/trap-notes.json。なければ何も出さない）
    (pick.length ? pick : o.picked).forEach(function (i) { card.append(row('えらんだ', 'ng', (i + 1) + '．' + q.choices[i])); });
    q.answers.forEach(function (i) { card.append(row('正解', 'ok', (i + 1) + '．' + q.choices[i])); });
    card.append(trapBox, txt('p', 'wn', '↓ 下の解説で「なぜ」を読んで、資料で確かめよう。'));
    var acts = txt('div', 'wa'); card.append(acts);
    if (o.before && o.before.parentNode) o.before.parentNode.insertBefore(card, o.before); else o.feedback.appendChild(card);
    wait.then(function () {
      var l = links && links[o.subj] && links[o.subj][o.id], g = GUIDE[o.subj];
      var a = txt('a', 'wg', l ? '📖 資料で確かめる：' + l[1].slice(0, 26) : '📖 ' + g[1] + 'の資料を開く');
      a.href = l ? new URL(l[0], location.href).href : ROOT + g[0];
      acts.append(a);
      // 解説AIへの「もっと噛み砕いて」リンクは休止中（/ai/ のコードは残してある）
      var tn = traps && traps[o.subj] && traps[o.subj][o.id];
      if (tn) pick.forEach(function (i) {
        var e = tn[String(i)]; if (!e || !e.t) return;
        var p = txt('p', 'wt'); p.append(txt('b', '', '⚠ ' + (i + 1) + 'がワナなわけ'), document.createTextNode(e.t)); trapBox.append(p);
      });
    });
  }
  window.JKWhy = { show: show };
})();
