/* 学習資料・過去問ページの「聞いてみる」ボタン。押すと解説AI（../ai/）を開き、
 * 科目・ページ名・（あれば）選択した文字や表示中の問題文を渡す。 */
(function () {
  'use strict';
  if (window.__aiAskBtn) return; window.__aiAskBtn = true;
  var me = document.currentScript;
  var AI = new URL('./', (me && me.src) || location.href).href; // このファイルは ai/ に置く
  var p = location.pathname, subj = /anatomy/.test(p) ? 'anatomy' : /physiology|basics-qa/.test(p) ? 'physiology' : /clinical/.test(p) ? 'clinical' : '';
  var lastSel = '';
  document.addEventListener('selectionchange', function () {
    var s = String(window.getSelection ? window.getSelection() : '').trim();
    if (s && s.length <= 200) lastSel = s;
  });
  function visibleText(id) {
    var el = document.getElementById(id);
    if (!el || !el.offsetParent) return '';
    return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  }
  function go() {
    var u = new URL(AI);
    if (subj) u.searchParams.set('subj', subj);
    u.searchParams.set('from', (document.title || '').split('｜')[0].slice(0, 40));
    var sel = String(window.getSelection ? window.getSelection() : '').trim() || lastSel;
    if (sel && sel.length <= 200) u.searchParams.set('q', sel);
    else { var qt = visibleText('question-text') || visibleText('q-text'); if (qt) u.searchParams.set('ctx', qt); }
    location.href = u.href;
  }
  function mount() {
    var label = '聞いてみる';
    var st = document.createElement('style');
    // 目立ちすぎないよう、顔だけの小さい丸ボタン（文字はかくす）
    st.textContent = '.ai-ask{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:1500;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:2px solid #fff;border-radius:50%;background:#1676ae;box-shadow:0 3px 10px rgba(11,23,48,.22);opacity:.72;cursor:pointer}' +
      '.ai-ask:hover,.ai-ask:focus-visible{opacity:1}.ai-ask span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
      '.ai-ask img{width:36px;height:36px;border-radius:50%;background:#fff;object-fit:cover}@media print{.ai-ask{display:none}}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ai-ask'; b.title = '解説AIに聞いてみる'; b.setAttribute('aria-label', '解説AIに' + label);
    var ch = ''; try { ch = JSON.parse(localStorage.getItem('jkp-ai-tutor') || '{}').char || ''; } catch (e) {}
    b.innerHTML = '<img src="' + AI + 'chars/' + (ch === 'mio' ? 'mio' : 'hinata') + '-face.webp" alt=""><span>' + label + '</span>';
    b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // 選択を消さない
    b.addEventListener('click', go);
    document.body.appendChild(b);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
