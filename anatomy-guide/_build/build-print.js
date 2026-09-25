'use strict';
// 印刷用 print.html を content.js / qindex.js から生成する（生理学版 note-pdf-build/build-print.js と同じ体裁）
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'content.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'qindex.js'), 'utf8'), ctx);
const chapters = ctx.window.anatomyChapters;
const meta = ctx.window.anatomyGuideMeta;
const qi = ctx.window.anatomyQIndex;
const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const key = (h) => String(h).replace(/<span class="answer">/g, '<strong class="key">').replace(/<\/span>/g, '</strong>');
const ql = (id) => { const [e, n] = id.split('-'); return `第${e}回問${n}`; };
const pointNo = {};
chapters.forEach((c) => c.points.forEach((p) => { pointNo[p.id] = p.no; }));

const toc = chapters.map((c) => `<li><a href="#ch-${c.id}"><span class="toc-num">${c.number}</span> ${esc(c.title)}<span class="toc-n">${c.total}問</span></a></li>`).join('\n');
const body = chapters.map((c) => {
  const kj = c.kijun.map((k) => `${esc(k.code)} ${esc(k.name)}（${k.count}）`).join('　');
  const pts = c.points.map((p) => `<section class="lesson">
    <h3><span class="sec-num">${p.no}</span> ${esc(p.title)} <span class="freq">過去問${p.freq}問</span></h3>
    <div class="anchor">${key(p.anchor)}</div>
    <p class="explanation"><strong>なぜ？</strong> ${esc(p.why.replace(/^なぜ：/, ''))}</p>
    <p class="qs"><span class="label">出題</span> ${p.qs.map(ql).join('、')}</p>
    <div class="qa"><p class="q"><span class="label">Q</span> ${esc(p.check_q)}</p><p class="a"><span class="label">A</span> ${esc(p.check_a)}</p></div>
  </section>`).join('\n');
  const quiz = `<div class="quiz"><h3>章末まとめチェック</h3><ol>${c.quiz.map((x) => `<li><p class="q">${esc(x.q)}</p><p class="a"><span class="label">答え</span> ${esc(x.a)}</p></li>`).join('')}</ol></div>`;
  return `<article class="chapter" id="ch-${c.id}"><header class="chapter-head"><p class="kicker">CHAPTER ${c.number}　過去問${c.total}問</p><h2>${esc(c.title)}</h2>
    <p class="intro">${esc(c.intro)}</p><p class="kijun">出題基準 ${esc(c.major + '．' + c.majorName)}：${kj}</p></header>${pts}${quiz}</article>`;
}).join('\n');
const ids = Object.keys(qi).sort((a, b) => { const [x, y] = a.split('-').map(Number); const [u, v] = b.split('-').map(Number); return x - u || y - v; });
const rev = ids.map((id) => { const r = qi[id]; return `<tr><td>${ql(id)}</td><td>${esc(r.q)}<br><span class="ans">正答：${esc(r.answer)}</span></td><td>${esc(r.code)} ${esc(r.mid)}</td><td>${r.points.map((p) => pointNo[p]).join(', ')}</td></tr>`; }).join('\n');

const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><title>柔道整復師国家試験｜解剖学 学習資料（出題基準別・過去問逆引き）</title>
<style>
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; }
html, body { margin: 0; font-family: "Noto Sans CJK JP", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif; font-size: 10pt; line-height: 1.6; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.cover { page-break-after: always; min-height: 250mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 2px solid #1e3a5f; padding: 40mm 20mm; }
.cover .badge { font-size: 11pt; letter-spacing: .15em; color: #1e3a5f; margin-bottom: 18mm; border: 1px solid #1e3a5f; padding: 4px 18px; }
.cover h1 { font-size: 22pt; margin: 0 0 8mm; line-height: 1.4; color: #0f2744; }
.cover .sub { font-size: 13pt; margin: 0 0 24mm; color: #333; }
.cover .meta { font-size: 10.5pt; color: #444; line-height: 2; }
.toc { page-break-after: always; }
.toc h2, .appendix h2 { font-size: 16pt; border-bottom: 2px solid #1e3a5f; padding-bottom: 3mm; color: #1e3a5f; }
.toc ol { list-style: none; padding: 0; }
.toc li { padding: 2.2mm 0; border-bottom: 1px dotted #ccc; font-size: 11pt; }
.toc a { color: #1a1a1a; text-decoration: none; display: flex; gap: 3mm; }
.toc-num { width: 10mm; font-weight: 700; color: #1e3a5f; }
.toc-n { margin-left: auto; color: #666; }
.howto { font-size: 10pt; background: #f4f7fa; padding: 3mm 4mm; border-radius: 2px; }
.chapter { page-break-before: always; }
.chapter-head { margin-bottom: 5mm; padding-bottom: 3mm; border-bottom: 2px solid #1e3a5f; }
.kicker { margin: 0; font-size: 9pt; letter-spacing: .1em; color: #1e3a5f; font-weight: 700; }
.chapter-head h2 { margin: 1mm 0 2mm; font-size: 16pt; color: #0f2744; }
.intro, .kijun { margin: 0 0 1mm; color: #444; }
.kijun { font-size: 8.5pt; }
.lesson { margin: 4mm 0 6mm; page-break-inside: avoid; }
.lesson h3 { font-size: 11.5pt; margin: 0 0 2mm; padding: 1.8mm 3mm; background: #eef3f8; border-left: 3.5px solid #1e3a5f; page-break-after: avoid; }
.sec-num { color: #1e3a5f; margin-right: 2mm; }
.freq { float: right; font-size: 8.5pt; color: #a33a12; }
.anchor p { margin: 0 0 1.5mm; } .anchor ul { margin: 1mm 0 2mm; padding-left: 5mm; } .anchor li { margin: .5mm 0; }
.anchor table { width: 100%; border-collapse: collapse; margin: 1mm 0 2mm; font-size: 9pt; }
.anchor th, .anchor td { border: 1px solid #b9c7d6; padding: 1.2mm 2mm; text-align: left; vertical-align: top; }
.anchor th { background: #e3edf6; }
strong.key { color: #8b0000; background: #fff3cd; padding: 0 1.5px; }
.explanation { margin: 2mm 0; padding: 2.2mm 3mm; background: #fbf6e6; border-radius: 2px; }
.qs { margin: 1.5mm 0; font-size: 8.8pt; color: #333; }
.qa { margin-top: 2mm; padding: 2mm 3mm; border: 1px solid #c5d4e8; background: #f8fbff; }
.qa .q, .qa .a, .quiz .q, .quiz .a { margin: .8mm 0; }
.label { display: inline-block; min-width: 8mm; font-weight: 700; color: #1e3a5f; }
.qa .a .label, .quiz .a .label { color: #8b0000; }
.quiz { margin-top: 5mm; page-break-inside: avoid; }
.quiz h3 { font-size: 11.5pt; color: #1e3a5f; border-bottom: 1px solid #1e3a5f; padding-bottom: 1.5mm; }
.appendix { page-break-before: always; }
.appendix table { width: 100%; border-collapse: collapse; font-size: 8pt; line-height: 1.4; }
.appendix th, .appendix td { border: 1px solid #ccc; padding: 1mm 1.5mm; text-align: left; vertical-align: top; }
.appendix th { background: #e3edf6; }
.appendix tr { page-break-inside: avoid; }
.appendix td:first-child { white-space: nowrap; }
.appendix .ans { color: #8b0000; }
footer.note { margin-top: 8mm; font-size: 8.5pt; color: #666; text-align: center; }
@media screen { body { max-width: 210mm; margin: 0 auto; padding: 10mm; } }
</style></head><body>
<section class="cover"><div class="badge">柔道整復師国家試験対策</div>
<h1>柔道整復師国家試験｜解剖学 学習資料</h1>
<p class="sub">出題基準の章立て　全${chapters.length}章・${meta.pointCount}ポイント<br>過去問${meta.exams}・${meta.questionCount}問から逆引き</p>
<div class="meta">教員個人制作・無料版<br>学習・復習用プリント</div></section>
<nav class="toc"><h2>目次</h2>
<p class="howto">章は公式の出題基準（${esc(meta.kijunEdition)}）の大項目・中項目に沿って立てています。各章のポイントは、関連する過去問が多い順に並んでいます。赤字（黄色の背景）が暗記の中心です。巻末に「過去問→出題基準→ポイント番号」の逆引き表があります。</p>
<ol>${toc}<li><a href="#appendix"><span class="toc-num">付録</span> 過去問からの逆引き表<span class="toc-n">${ids.length}問</span></a></li></ol></nav>
${body}
<section class="appendix" id="appendix"><h2>付録　過去問からの逆引き表</h2>
<p>回・問番号 → 出題基準の中項目 → この資料のポイント番号（例：05-01＝第5章の1番目）。</p>
<table><thead><tr><th>回・問</th><th>問題</th><th>出題基準</th><th>ポイント</th></tr></thead><tbody>${rev}</tbody></table></section>
<footer class="note">柔道整復師国家試験｜解剖学 学習資料 — 教員個人制作 / 出題基準出典：${esc(meta.kijunSource)}</footer>
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'print.html'), html, 'utf8');
console.log('Wrote print.html', Buffer.byteLength(html), 'bytes');
