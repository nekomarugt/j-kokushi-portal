(function () {
  'use strict';
  function h(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s != null) e.textContent = s; return e; }
  fetch('./content.json').then(function (r) { return r.json(); }).then(function (S) {
    var toc = document.getElementById('toc'), body = document.getElementById('body');
    toc.append(h('b', '', '目次（多く出る順に学ぶなら件数を参考に）'));
    S.forEach(function (s) {
      var a = h('a', '', s.title.replace(/（.*）/, '') + ' ' + s.n + '問'); a.href = '#sec-' + s.id; toc.append(a);
      var sec = h('section', 'sec'); sec.id = 'sec-' + s.id;
      var hd = h('div', 'sh'); hd.append(h('h2', '', s.title), h('span', 'cnt', '過去問 ' + s.n + '問（必修' + s.hissu + '）'));
      sec.append(hd, h('p', 'lead', s.lead));
      if (s.conn.length) { var c = h('div', 'conn'); c.append(h('span', 'cl', 'つながり')); s.conn.forEach(function (x) { var a = h('a', '', x[0] + ' →'); a.href = x[1]; c.append(a); }); var m = h('a', '', '頻出MAPで位置を見る →'); m.href = '../map/#jusei'; c.append(m); sec.append(c); }
      var ul = h('ul', 'pts'); s.points.forEach(function (p) { ul.append(h('li', '', p)); }); sec.append(ul);
      if (s.fig) { var f = h('figure', 'fig'); var im = h('img'); im.src = 'figures/' + s.fig[0]; im.alt = s.fig[1]; im.loading = 'lazy'; f.append(im, h('figcaption', '', s.fig[1])); sec.append(f); }
      var w = h('div', 'why'); w.append(h('h3', '', 'なぜ？')); s.why.forEach(function (x) { var p = h('p'); p.append(h('b', '', x[0]), document.createTextNode(' ' + x[1])); w.append(p); }); sec.append(w);
      if (s.old) sec.append(h('p', 'old', '用語メモ：' + s.old));
      s.deep.forEach(function (d) { var de = h('details', 'deep'); de.append(h('summary', '', 'より深く：' + d[0]), h('p', '', d[1])); sec.append(de); });
      var q = h('div', 'qs'); q.append(h('h3', '', 'この項目の過去問'));
      var go = h('a', 'go', 'この項目の過去問をまとめて解く（' + s.n + '問）→'); go.href = '../jusei-riron/?topic=' + encodeURIComponent(s.tid); q.append(go);
      var ol = h('ul'); s.qs.forEach(function (x) { var li = h('li'), a = h('a', '', '第' + x[0].replace('-', '回 問') + '：' + x[1]); a.href = '../jusei-riron/?qid=' + x[0]; li.append(a); ol.append(li); });
      q.append(ol); sec.append(q); body.append(sec);
    });
    if (location.hash) { var t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  });
})();
