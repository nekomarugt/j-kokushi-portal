/* 解説AI先生：日本語の文字バイグラム＋BM25 検索（ブラウザ・Node 共通）。
 * buildSearch(docs) → { search(query, {subj, limit}) }。辞書不要・分かち書き不要。 */
(function (G) {
  'use strict';
  var VARIANT = [[/頚/g, '頸'], [/鉤/g, '鈎'], [/繊維/g, '線維'], [/[ヶケ](?=[月所])/g, 'か'], [/ー/g, 'ー']];
  function norm(s) {
    s = String(s || '').normalize('NFKC').toLowerCase();
    for (var i = 0; i < VARIANT.length; i++) s = s.replace(VARIANT[i][0], VARIANT[i][1]);
    return s;
  }
  var HIRA = /^[\u3041-\u309f]+$/;
  // 質問によく出る、内容と関係ない言い回し
  var FILLER = /(について|に関して|とは|って何|ってなに|ってなん|って|なんですか|ですか|でしょうか|教えて(ください|ほしい|欲しい)?|知りたい|わから(ない|ん)|分から(ない|ん)|わかりやすく|簡単に|かんたんに|どういう(こと|意味)?|どんな|なぜ|なんで|どうして|どうやって|覚え方|おぼえかた|違い|ちがい|仕組み|しくみ|とは何|何|なに|いつ|どこ|だれ|誰|ください|ほしい|の?こと|意味|説明して|解説して|起こる|起こること|起きる|出る|でる|作る|つくる|できてる|一番|いちばん|多い|少ない|して|する|ある|いる|なる|ね|よ|か[?？]?$)/g;
  function runs(s) { return norm(s).match(/[\p{L}\p{N}]+/gu) || []; }
  function grams(s, out) {
    out = out || [];
    var rs = runs(s);
    for (var i = 0; i < rs.length; i++) {
      var r = Array.from(rs[i]);
      if (r.length === 1) out.push(r[0]);
      else for (var j = 0; j + 1 < r.length; j++) out.push(r[j] + r[j + 1]);
    }
    return out;
  }
  // 質問から「中身の語」を取り出す（ひらがなだけの断片は捨てる）
  function keywords(q) {
    var s = norm(q).replace(FILLER, ' ');
    var parts = s.split(/[^\p{L}\p{N}]+|[\u3041-\u309f]{2,}|[はがをにでとのもへや](?![\u3041-\u309f])/u);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].replace(/^[\u3041-\u309f]+|[\u3041-\u309f]+$/g, '');
      if (p && (Array.from(p).length >= 2 || /[\u4e00-\u9fff]/.test(p)) && out.indexOf(p) < 0) out.push(p);
    }
    return out;
  }
  function buildSearch(docs) {
    var N = docs.length, df = Object.create(null), tf = new Array(N), len = new Float32Array(N), total = 0, normText = new Array(N);
    for (var i = 0; i < N; i++) {
      var d = docs[i], g = grams(d.t + ' ' + d.t + ' ' + d.x), m = Object.create(null);
      for (var j = 0; j < g.length; j++) m[g[j]] = (m[g[j]] || 0) + 1;
      for (var k in m) df[k] = (df[k] || 0) + 1;
      tf[i] = m; len[i] = g.length; total += g.length;
      normText[i] = [norm(d.t), norm(d.x)];
    }
    var avg = total / N, K1 = 1.2, B = 0.75;
    function idf(t) { var n = df[t] || 0; return Math.log(1 + (N - n + 0.5) / (n + 0.5)); }
    function search(query, opt) {
      opt = opt || {};
      var kws = keywords(query), qg = [];
      for (var i = 0; i < kws.length; i++) grams(kws[i], qg);
      if (!qg.length) grams(query, qg);
      var uniq = Array.from(new Set(qg)).filter(function (t) { return !HIRA.test(t) || qg.length < 3; });
      if (!uniq.length) return { kws: kws, hits: [] };
      var w = uniq.map(idf), wsum = w.reduce(function (a, b) { return a + b; }, 0), res = [];
      for (var d = 0; d < N; d++) {
        var m = tf[d], s = 0, cov = 0;
        for (var q = 0; q < uniq.length; q++) {
          var f = m[uniq[q]]; if (!f) continue;
          cov += w[q];
          s += w[q] * f * (K1 + 1) / (f + K1 * (1 - B + B * len[d] / avg));
        }
        if (!s) continue;
        var bonus = 0;
        for (var k = 0; k < kws.length; k++) {
          if (Array.from(kws[k]).length < 2) continue;
          if (normText[d][0].indexOf(kws[k]) >= 0) bonus += 1.5;
          else if (normText[d][1].indexOf(kws[k]) >= 0) bonus += 0.6;
        }
        s = (s + bonus * Math.min(3, wsum / Math.max(1, kws.length)) / 3) * (0.4 + 0.6 * cov / wsum);
        if (docs[d].k === 'g') s *= 1.15;
        if (opt.subj && docs[d].s === opt.subj) s *= 1.2;
        res.push({ i: d, score: s, cov: cov / wsum });
      }
      res.sort(function (a, b) { return b.score - a.score; });
      var hits = res.slice(0, opt.limit || 6).map(function (r) { return { doc: docs[r.i], score: r.score, cov: r.cov }; });
      return { kws: kws, hits: hits };
    }
    return { search: search };
  }
  G.AITutorSearch = { buildSearch: buildSearch, keywords: keywords, norm: norm };
  if (typeof module !== 'undefined') module.exports = G.AITutorSearch;
})(typeof window !== 'undefined' ? window : globalThis);
