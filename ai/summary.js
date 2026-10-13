/* 解説AI：資料から要点の文をそのまま抜き出してまとめる（AIなしで動く・正確さ優先）。ブラウザ・Node 共通。 */
(function (G) {
  'use strict';
  function norm(s) { return String(s || '').normalize('NFKC').toLowerCase(); }
  function bigr(s) { var g = {}, m = norm(s).match(/[\p{L}\p{N}⁺⁻]+/gu) || []; m.forEach(function (w) { for (var i = 0; i + 1 < w.length; i++) g[w.substr(i, 2)] = 1; }); return g; }
  var key = function (s) { return norm(s).replace(/\[\d\]|[\s・、。！？!?「」（）()■]/g, ''); };
  function splitSent(x) {
    return String(x).split(/\n|(?<=[。！？])/).map(function (s) { return s.replace(/^[■・\-\s]+/, '').replace(/[／\s]+$/, '').trim(); })
      .map(function (s) { return (/^試験では[:：]/.test(s) ? '§' : '') + s.replace(/^(試験では|ひとことポイント|ポイント|よくある覚え方)[:：\s]*/, '').trim(); })
      .filter(function (s) {
        if (s.replace(/^§/, '').length < 8 || /^(問|確認|図|答え|ほかの科目)[:：]?/.test(s) || /か[。？]$/.test(s)) return false;
        if (!/[。、：＝=→]/.test(s) && s.length < 22) return false; // 見出しだけの行
        if (/／/.test(s) && s.split('／').every(function (x) { return x.length <= 6; })) return false; // 表の見出し
        return true;
      });
  }
  function clip(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  // hits: 上位の資料（[1][2][3] の順）。kws: 検索の語。mode: 'normal' | 'detail' | 'exam'
  function extract(hits, kws, mode) {
    var qg = {}; kws.forEach(function (k) { Object.assign(qg, bigr(k)); });
    var qk = Object.keys(qg), cand = [];
    hits.forEach(function (h, i) {
      var d = h.doc, ss;
      if (d.k === 'q') {
        var body = d.x.slice(d.x.indexOf('正解：'));
        var lines = body.split('\n'); ss = lines.slice(1).join('\n'); ss = splitSent(ss);
      } else ss = splitSent(d.x);
      ss.forEach(function (s, j) {
        if (key(s) === key(d.t.replace(/^.*?(資料|解説|深掘り|過去問)\s*[\d-]*\s*/, ''))) return;
        var g = bigr(s), hit = qk.filter(function (b) { return g[b]; }).length;
        var whole = kws.filter(function (k) { return Array.from(k).length >= 2 && norm(s).indexOf(norm(k)) >= 0; }).length;
        var sc = (hit / Math.sqrt(Math.max(12, s.length)) + whole * 0.6) * (1 - i * 0.12) - j * 0.01;
        if (d.k === 'q') sc *= 0.8;
        if (d.k === 'g' && j <= 1) sc += 0.35 * (1 - i * 0.3); // 資料の書き出し（定義・仕組み）を優先
        var isEx = /^§/.test(s) || /試験|国試|出題|よく出|頻出/.test(s); s = s.replace(/^§/, '');
        cand.push({ s: s, n: i + 1, j: j, sc: sc + (isEx ? 0.2 : 0), exam: isEx, k: d.k });
      });
    });
    cand.sort(function (a, b) { return b.sc - a.sc; });
    var chosen = [], pick = function (c) {
      var g = bigr(c.s), gk = Object.keys(g);
      for (var i = 0; i < chosen.length; i++) { var o = chosen[i], inter = gk.filter(function (x) { return o[x]; }).length; if (inter / Math.min(gk.length, Object.keys(o).length || 1) > 0.6) return false; }
      chosen.push(g); return true;
    };
    var main = null, points = [], exam = null, maxP = mode === 'detail' ? 4 : 2;
    var t0 = hits[0] && hits[0].doc;
    if (t0 && t0.k === 'g' && !/[・、]/.test(t0.t.replace(/^.*?(資料|解説|深掘り)\s*[\d-]*\s*/, '').split(/[：（]/)[0]) && kws.some(function (k) { return Array.from(k).length >= 2 && norm(t0.t).indexOf(norm(k)) >= 0; })) {
      var lead = cand.filter(function (c) { return c.n === 1; }).sort(function (a, b) { return a.j - b.j; })[0]; // 見出しに質問の語がある資料は、書き出し（定義）を先に
      if (lead && pick(lead)) main = lead;
    }
    for (var i = 0; i < cand.length && !main; i++) if (cand[i].sc > 0 && cand[i].k === 'g' && pick(cand[i])) main = cand[i];
    for (i = 0; i < cand.length && !main; i++) if (cand[i].sc > 0 && pick(cand[i])) main = cand[i];
    for (i = 0; i < cand.length && points.length < maxP; i++) if (cand[i].sc > 0 && cand[i] !== main && !cand[i].exam && pick(cand[i])) points.push(cand[i]);
    var qh = hits.map(function (h, i) { return { h: h, n: i + 1 }; }).filter(function (o) { return o.h.doc.k === 'q'; })[0];
    var ex = cand.filter(function (c) { return c.exam && c.sc > 0; })[0];
    if (ex) exam = { s: ex.s, n: ex.n };
    else if (qh) { var m = qh.h.doc.t.match(/第\d+回 問\d+/), a = (qh.h.doc.x.match(/正解：([^\n]*)/) || [])[1]; exam = { s: (m ? m[0] : '過去問') + 'で「' + clip(qh.h.doc.q.stem, 40) + '」→ 正解は「' + clip(String(a || '').replace(/^\d+\.\s*/, ''), 30) + '」', n: qh.n }; }
    if (!main) return null;
    return { main: { s: clip(main.s, 110), n: main.n }, points: points.map(function (p) { return { s: clip(p.s, 90), n: p.n }; }), exam: exam && { s: clip(exam.s, 110), n: exam.n } };
  }
  function toText(sum) {
    var t = '【ひとことで】' + sum.main.s + '[' + sum.main.n + ']';
    if (sum.points.length) t += '\n【ポイント】\n' + sum.points.map(function (p) { return '・' + p.s + '[' + p.n + ']'; }).join('\n');
    if (sum.exam) t += '\n【試験では】' + sum.exam.s + '[' + sum.exam.n + ']';
    return t;
  }
  function coreText(sum) { return sum ? sum.main.s + ' ' + sum.points.map(function (p) { return p.s; }).join(' ') : ''; }
  G.AITutorSummary = { extract: extract, toText: toText, coreText: coreText };
  if (typeof module !== 'undefined') module.exports = G.AITutorSummary;
})(typeof window !== 'undefined' ? window : globalThis);
