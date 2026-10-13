#!/usr/bin/env node
/* 「なんで違う？」カード用：過去問1問ごとに、いちばん近い学習資料の節を先に決めておく。
 *   node tools/build-search-index.js && node tools/build-wrong-links.js
 * 読むもの：ai/search-index.json（資料 k:'g' と過去問 k:'q'）。出力：data/wrong-links.json（コミットする）。
 * 形：{ ana: { "18-1": ["../anatomy-guide/#…", "節の名前"] }, phy: {…}, cli: {…} }。リンクは過去問ページ（/anatomy/ など）から見た相対。 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const S = require('../ai/search.js');
const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'ai/search-index.json'), 'utf8'));
const SUB = { anatomy: 'ana', physiology: 'phy', clinical: 'cli' };
const out = { v: 1, built: new Date().toISOString().slice(0, 10), ana: {}, phy: {}, cli: {} };
const strong = { ana: 0, phy: 0, cli: 0 }, total = { ana: 0, phy: 0, cli: 0 };
for (const s of Object.keys(SUB)) {
  const guides = idx.docs.filter((d) => d.k === 'g' && d.s === s && !/理解度チェック/.test(d.t));
  const se = S.buildSearch(guides);
  for (const d of idx.docs.filter((x) => x.k === 'q' && x.s === s)) {
    const m = d.t.match(/第(\d+)回 問(\d+)/); if (!m) continue;
    const ans = d.q.answers.map((i) => d.q.choices[i]).join(' ');
    const ex = d.x.split('\n').slice(3).join(' ').slice(0, 160);
    const r = se.search(d.q.stem + ' ' + ans + ' ' + ans + ' ' + ex, { limit: 1 }).hits[0];
    total[SUB[s]]++;
    if (!r || r.cov < 0.25) continue; // 弱い一致はリンクなし（科目の資料トップを出す）
    strong[SUB[s]]++;
    out[SUB[s]][`${m[1]}-${m[2]}`] = [r.doc.u, r.doc.t.replace(/^(解剖学|生理学|一般臨床) (資料|深掘り|解説) /, '').replace(/（\d+\/\d+）$/, '')];
  }
}
fs.writeFileSync(path.join(ROOT, 'data/wrong-links.json'), JSON.stringify(out));
console.log('linked', strong, 'of', total);
