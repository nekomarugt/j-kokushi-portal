#!/usr/bin/env node
/* 解説AI先生の検索インデックスを作る： node tools/build-search-index.js
 * 読むもの：過去問 questions.json ×3、解剖の解説 explanations.js、学習資料3つ（本文・解説・深掘り）。
 * アンダースコアで始まるフォルダ（_qa, _delivery, _note-drafts, _build）は読まない。
 * 出力：ai/search-index.json（コミットする）。資料や過去問を直したら、これを再実行してコミット。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
function load(files) {
  const ctx = { window: {}, console }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of files) vm.runInContext(rd(f), ctx, { filename: f });
  return ctx.window;
}
const strip = (h) => String(h || '')
  .replace(/<(br|\/p|\/li|\/tr|\/h\d|\/div)[^>]*>/gi, '\n').replace(/<\/t[dh]>/gi, '／').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&')
  .replace(/／\s*\n/g, '\n').replace(/[ \t\u3000]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
const join = (...a) => a.filter(Boolean).map(strip).filter(Boolean).join('\n');
const docs = [];
const MAX = 900; // 1チャンクの最大文字数（長い節は分割）
function add(d) {
  d.x = d.x.trim(); if (d.x.replace(/■[^\n]*/g, '').trim().length < 8) return;
  if (d.x.length <= MAX) { docs.push(d); return; }
  const parts = []; let cur = '';
  for (const line of d.x.split('\n')) {
    if (cur && cur.length + line.length > MAX) { parts.push(cur); cur = ''; }
    cur += (cur ? '\n' : '') + line;
  }
  if (cur) parts.push(cur);
  parts.forEach((p, i) => docs.push({ ...d, x: p.slice(0, MAX * 1.5), t: d.t + (parts.length > 1 ? `（${i + 1}/${parts.length}）` : '') }));
}
const NUM = '①②③④⑤⑥⑦⑧';
function addQuestions(subj, label, dir, list, expl) {
  for (const q of list) {
    const id = q.id || `${q.exam}-${q.number}`;
    const ans = (q.answers || []).map((i) => `${i + 1}. ${q.choices[i]}`).join('、');
    let ex = q.explanation || '';
    if (expl) { const e = expl(q); ex = join(e.why, e.relation, e.keyPoint) || ex; }
    add({ k: 'q', s: subj, t: `${label} 第${q.exam}回 問${q.number}`, u: `../${dir}/`,
      q: { stem: q.question, choices: q.choices, answers: q.answers, img: !!q.image },
      x: join(q.question, q.choices.map((c, i) => `${i + 1}. ${c}`).join(' '), `正解：${ans}`, ex) });
  }
}
// ---- 過去問 ----
const anaExpl = load(['anatomy/explanations.js']).anatomyExplanationFor;
addQuestions('anatomy', '解剖学 過去問', 'anatomy', JSON.parse(rd('anatomy/questions.json')), anaExpl);
addQuestions('physiology', '生理学 過去問', 'physiology', JSON.parse(rd('physiology/questions.json')));
addQuestions('clinical', '一般臨床 過去問', 'clinical', JSON.parse(rd('clinical/questions.json')));
// ---- 解剖学 学習資料 ----
for (const ch of load(['anatomy-guide/content.js']).anatomyChapters) {
  add({ k: 'g', s: 'anatomy', t: `解剖学 資料 ${ch.number} ${ch.title}`, u: `../anatomy-guide/#${ch.id}`, x: join(ch.intro) });
  for (const p of ch.points) add({ k: 'g', s: 'anatomy', t: `解剖学 資料 ${p.no || ch.number} ${p.title}`, u: `../anatomy-guide/#${encodeURIComponent(p.id)}`,
    x: join(p.title, p.anchor, p.why, p.check_q && `確認：${p.check_q}`, p.check_a && `答え：${p.check_a}`) });
  (ch.quiz || []).forEach((z) => add({ k: 'g', s: 'anatomy', t: `解剖学 資料 ${ch.number} ${ch.title} 理解度チェック`, u: `../anatomy-guide/#${ch.id}`, x: join(`問：${z.q}`, `答え：${z.a}`) }));
}
// ---- 生理学 学習資料 ----
const phy = load(['physiology-guide/content.js', 'physiology-guide/deepdive.js']);
for (const ch of phy.physiologyChapters) {
  add({ k: 'g', s: 'physiology', t: `生理学 資料 ${ch.number} ${ch.title}`, u: `../physiology-guide/#${ch.id}`, x: join(ch.intro) });
  ch.sections.forEach((s, i) => add({ k: 'g', s: 'physiology', t: `生理学 資料 ${ch.number}-${String(i + 1).padStart(2, '0')} ${s.title}`,
    u: `../physiology-guide/#lesson-${ch.id}-${i + 1}`, x: join(s.title, s.anchor, s.explanation, s.caption, s.question && `確認：${s.question}`, s.answer && `答え：${s.answer}`) }));
  (ch.quiz || []).forEach((z) => add({ k: 'g', s: 'physiology', t: `生理学 資料 ${ch.number} ${ch.title} 理解度チェック`, u: `../physiology-guide/#${ch.id}`, x: join(`問：${z.q}`, `答え：${z.a}`) }));
  (phy.physiologyDeepDives[ch.id] || []).forEach((d) => add({ k: 'g', s: 'physiology', t: `生理学 深掘り ${ch.title}：${d.title}`, u: `../physiology-guide/#${ch.id}`,
    x: join(d.title, d.shortcut && `よくある覚え方：${d.shortcut}`, d.mechanism, d.folded, d.exam && `試験では：${d.exam}`) }));
}
// ---- 一般臨床 学習資料 ----
// 穴埋め（answer:true）の語は、AI先生では「答えを見せた状態」でそのまま入れる（質問への答えとして使うため）。
const cl = load(['clinical-guide/content.js', 'clinical-guide/explanations.js', 'clinical-guide/disease-content.js', 'clinical-guide/disease-explanations.js', 'clinical-guide/deepdives.js']);
const norm = (v) => String(v).normalize('NFKC');
function sectionStarts(blocks, general) { // clinical-guide/app.js の sectionStarts と同じ規則
  const heads = []; blocks.forEach((b, i) => { if (b.type === 'heading') heads.push(i); });
  const cand = [];
  if (general) heads.forEach((i) => { if (blocks[i].level >= 2 && /^\d+\s*[.．]/.test(norm(blocks[i].text))) cand.push(i); });
  else heads.forEach((i, k) => {
    const b = blocks[i], next = k + 1 < heads.length ? blocks[heads[k + 1]] : null;
    if (b.level === 1) {
      if (!(next && next.level >= 2)) cand.push(i);
      else if (blocks.slice(i + 1, heads[k + 1]).some((x) => x.type === 'note' || x.type === 'table')) cand.push(i);
    } else if (b.level === 2) cand.push(i);
  });
  const starts = cand.filter((i, k) => { const end = k + 1 < cand.length ? cand[k + 1] : blocks.length; return blocks.slice(i + 1, end).some((b) => b.type === 'note' || b.type === 'table'); });
  return new Map(starts.map((i, k) => [i, k + 1]));
}
const segText = (v) => Array.isArray(v) ? v.map((x) => (x && typeof x === 'object') ? (x.text || '') : String(x)).join('') : String(v || '');
function blockText(b) {
  if (b.type === 'heading') return '■' + b.text;
  if (b.type === 'note') return segText(b.segments);
  if (b.type === 'table') return (b.rows || []).map((r) => r.map(segText).join('／')).join('\n');
  if (b.type === 'box') return join(b.title, b.html);
  if (b.type === 'figure' || b.type === 'tips') return join(b.caption || b.title, b.alt, b.point);
  return strip(b.text || b.html || '');
}
function addUnit(unit, general, label) {
  const starts = sectionStarts(unit.blocks, general);
  let cur = { t: `${label}：${unit.title}`, u: `../clinical-guide/#unit-${unit.id}`, lines: [] };
  const flush = () => { add({ k: 'g', s: 'clinical', t: `一般臨床 資料 ${cur.t}`, u: cur.u, x: strip(cur.lines.join('\n')) }); };
  unit.blocks.forEach((b, i) => {
    if (starts.has(i)) { flush(); cur = { t: `${label}：${unit.title} ＞ ${b.text}`, u: `../clinical-guide/#sec-${unit.id}-${starts.get(i)}`, lines: [] }; }
    const t = blockText(b); if (t) cur.lines.push(t);
  });
  flush();
}
cl.CLINICAL_CONTENT.sections.forEach((u) => addUnit(u, true, '総論'));
cl.CLINICAL_DISEASE_CONTENT.chapters.forEach((u) => addUnit(u, false, '各論'));
const unitTitle = {}; cl.CLINICAL_CONTENT.sections.forEach((u) => { unitTitle[u.id] = u.title; }); cl.CLINICAL_DISEASE_CONTENT.chapters.forEach((u) => { unitTitle[u.id] = u.title; });
for (const src of [cl.CLINICAL_EXPLANATIONS, cl.CLINICAL_DISEASE_EXPLANATIONS]) for (const [id, list] of Object.entries(src || {}))
  list.forEach((e) => add({ k: 'g', s: 'clinical', t: `一般臨床 解説 ${unitTitle[id] || id}：${e.title}`, u: `../clinical-guide/#unit-${id}`, x: join(e.title, e.body) }));
for (const grp of ['general', 'diseases']) for (const [id, dd] of Object.entries(cl.CLINICAL_DEEP_DIVES[grp] || {}))
  (dd.items || []).forEach((e) => add({ k: 'g', s: 'clinical', t: `一般臨床 深掘り ${unitTitle[id] || id}：${e.title}`, u: `../clinical-guide/#unit-${id}`,
    x: join(e.title, e.anchor && `よくある覚え方：${e.anchor}`, e.current, e.bridge, e.exam && `試験では：${e.exam}`) }));
// ---- 出力 ----
const out = { v: 1, built: new Date().toISOString().slice(0, 10), n: docs.length, docs };
fs.writeFileSync(path.join(ROOT, 'ai/search-index.json'), JSON.stringify(out));
const by = {}; docs.forEach((d) => { const k = d.s + '/' + d.k; by[k] = (by[k] || 0) + 1; });
console.log('docs', docs.length, by, 'bytes', fs.statSync(path.join(ROOT, 'ai/search-index.json')).size);
