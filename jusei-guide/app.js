(function () {
  'use strict';

  const chapters = window.juseiChapters || [];
  const deepDives = window.juseiDeepDives || {};
  const tabs = document.getElementById('chapterTabs');
  const intro = document.getElementById('chapterIntro');
  const sectionList = document.getElementById('sectionList');
  const toolbar = document.getElementById('accToolbar');
  const chapterDeepDive = document.getElementById('chapterDeepDive');
  const chapterQuiz = document.getElementById('chapterQuiz');
  const answerToggle = document.getElementById('answerToggle');
  const prevButton = document.getElementById('prevChapter');
  const nextButton = document.getElementById('nextChapter');
  const toTop = document.getElementById('toTop');
  const imageViewer = document.getElementById('imageViewer');
  const viewerImage = document.getElementById('viewerImage');
  const viewerCaption = document.getElementById('viewerCaption');

  // 頻出＝その節に結び付いた過去問が12問以上（guidelinks.json の対応から数える。パイロット版）
  const FREQ_MIN = 20;
  let currentIndex = 0;
  let answersVisible = true;

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // 過去問との行き来：../jusei-riron/guidelinks.json が読めれば問題数を表示（読めなくてもリンクは使える）
  let linkData = null;
  function xqCounts() {
    const bySec = {}, byCh = {};
    if (!linkData) return {bySec, byCh};
    Object.values(linkData.map).forEach((ids) => {
      const chs = new Set();
      ids.forEach((sid) => {
        bySec[sid] = (bySec[sid] || 0) + 1;
        const sec = linkData.sections[sid];
        if (sec) chs.add(sec.c);
      });
      chs.forEach((c) => { byCh[c] = (byCh[c] || 0) + 1; });
    });
    return {bySec, byCh};
  }
  function fillXqCounts() {
    const {bySec, byCh} = xqCounts();
    document.querySelectorAll('[data-xq-sec]').forEach((el) => {
      const n = bySec[el.dataset.xqSec];
      el.textContent = linkData ? '（' + (n || 0) + '問）' : '';
    });
    document.querySelectorAll('[data-xq-badge]').forEach((el) => {
      const n = bySec[el.dataset.xqBadge] || 0;
      el.textContent = linkData ? '過去問' + n + '問' : '';
      el.hidden = !linkData;
      const fq = el.parentElement.querySelector('.badge-freq');
      if (fq) fq.hidden = !(linkData && n >= FREQ_MIN);
    });
    document.querySelectorAll('[data-xq-ch]').forEach((el) => {
      const n = byCh[el.dataset.xqCh];
      el.textContent = linkData ? '（' + (n || 0) + '問）' : '';
    });
  }
  fetch('../jusei-riron/guidelinks.json')
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error('guidelinks unavailable'))))
    .then((data) => { linkData = data; fillXqCounts(); })
    .catch(() => { linkData = null; });

  function chapterFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    let index = chapters.findIndex((chapter) => chapter.id === id);
    if (index < 0) {
      // 過去問アプリからの「関連資料」リンク：#lesson-章ID-節番号
      const m = /^lesson-(.+)-(\d+)$/.exec(id);
      if (m) index = chapters.findIndex((chapter) => chapter.id === m[1]);
    }
    if (index < 0 && /^fig-/.test(id)) {
      // 図への直接リンク（例：#fig-bend）：その図を持つ章を開く
      index = chapters.findIndex((chapter) => chapter.sections.some((sec) => (sec.illustrations || []).some((it) => it.id === id)));
    }
    return index >= 0 ? index : 0;
  }

  function focusLessonFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (/^fig-/.test(id)) {
      const fig = document.getElementById(id);
      const card = fig && fig.closest('.lesson-card');
      if (!card) return;
      card.classList.add('is-focus');
      setCardOpen(card, true);
      setTimeout(() => fig.scrollIntoView({block: 'start'}), 60);
      return;
    }
    if (!/^lesson-.+-\d+$/.test(id)) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-focus');
    setCardOpen(el, true);
    setTimeout(() => el.scrollIntoView({block: 'start'}), 60);
  }

  // ---- 項目のアコーディオン（見出しをタップで本文を開閉） ----
  function setCardOpen(card, open) {
    const head = card.querySelector('.lesson-head');
    const body = card.querySelector('.lesson-body');
    if (!head || !body) return;
    body.hidden = !open;
    card.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', String(open));
    updateExpandAll();
  }
  function updateExpandAll() {
    const btn = document.getElementById('expandAll');
    if (!btn) return;
    const cards = sectionList.querySelectorAll('.lesson-card');
    const allOpen = cards.length > 0 && [...cards].every((c) => c.classList.contains('is-open'));
    btn.textContent = allOpen ? 'すべて閉じる' : 'すべて開く';
    btn.setAttribute('aria-pressed', String(allOpen));
  }

  function renderTabs() {
    tabs.innerHTML = chapters.map((chapter, index) => {
      const selected = index === currentIndex;
      return '<button class="chapter-tab" type="button" role="tab" data-index="' + index +
        '" aria-selected="' + selected + '" tabindex="' + (selected ? '0' : '-1') + '">' +
        '<span class="num">' + escapeHtml(chapter.number) + '</span>' +
        escapeHtml(chapter.title) + '</button>';
    }).join('');

    const active = tabs.querySelector('[aria-selected="true"]');
    if (active) active.scrollIntoView({block: 'nearest', inline: 'center'});
  }

  function renderChapter() {
    const chapter = chapters[currentIndex];
    if (!chapter) return;

    document.title = chapter.title + '｜柔道整復理論 学習資料';
    intro.innerHTML =
      '<p class="chapter-kicker">CHAPTER ' + escapeHtml(chapter.number) + '</p>' +
      '<h2>' + escapeHtml(chapter.title) + '</h2>' +
      '<p>' + escapeHtml(chapter.intro) + '</p>' +
      '<div class="xq-chapter-row"><a class="xq-chapter" href="../jusei-riron/?ch=' + encodeURIComponent(chapter.id) + '">この章の過去問<span data-xq-ch="' + escapeHtml(chapter.id) + '"></span> →</a></div>';
    toolbar.innerHTML =
      '<span class="acc-count">' + chapter.sections.length + '項目　見出しをタップで開く</span>' +
      '<button id="expandAll" class="acc-all" type="button" aria-pressed="false">すべて開く</button>';

    sectionList.innerHTML = chapter.sections.map((section, index) => {
      const image = section.image
        ? '<img class="lesson-image" src="' + encodeURI(section.image) + '" alt="' +
          escapeHtml(section.caption || section.title) + '" loading="lazy">' +
          (section.caption ? '<p class="image-caption">' + escapeHtml(section.caption) + '</p>' : '')
        : '';

      return '<article class="lesson-card" id="lesson-' + chapter.id + '-' + (index + 1) + '">' +
        '<div class="lesson-head" role="button" tabindex="0" aria-expanded="false" aria-controls="lesson-body-' + chapter.id + '-' + (index + 1) + '">' +
          '<div class="lesson-number">' + escapeHtml(chapter.number) + '-' + String(index + 1).padStart(2, '0') + '</div>' +
          '<h3>' + escapeHtml(section.title) + '</h3>' +
          '<div class="lesson-badges"><span class="badge-freq" hidden>頻出</span><span class="badge-n" data-xq-badge="' + escapeHtml(chapter.number + '-' + (index + 1)) + '" hidden></span></div>' +
          '<span class="lesson-chev" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="lesson-body" id="lesson-body-' + chapter.id + '-' + (index + 1) + '" hidden>' +
          '<div class="anchor">' + section.anchor + '</div>' +
          '<p class="explanation">' + escapeHtml(section.explanation) + '</p>' +
          (section.whyLink ? '<p class="why-link"><a href="' + escapeHtml(section.whyLink.href) + '">' + escapeHtml(section.whyLink.label) + ' →</a></p>' : '') +
          image + (section.illustrations || []).map((item) =>
            '<figure class="illustration"' + (item.id ? ' id="' + escapeHtml(item.id) + '"' : '') + '><button type="button" class="illustration-open" data-src="' + escapeHtml(item.src) + '" data-caption="' + escapeHtml(item.caption) + '" aria-label="' + escapeHtml(item.caption) + 'を拡大">' +
            '<img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.caption) + '" loading="lazy" decoding="async">' +
            '<span>タップで拡大</span></button>' + (item.before ? '<button type="button" class="fig-toggle" data-after="' + escapeHtml(item.src) + '" data-before="' + escapeHtml(item.before) + '" aria-pressed="false">転位前 ⇄ 転位後（いま：転位後）</button>' : '') + '<figcaption>' + escapeHtml(item.caption) + '</figcaption></figure>'
          ).join('') +
          (section.fixNote ? '<div class="fix-note"><b>整復・固定</b>' + section.fixNote.map((l) => '<p>' + escapeHtml(l) + '</p>').join('') + '</div>' : '') +
          (section.tips || []).map((tip) =>
            '<details class="tips-box">' +
              '<summary><span class="tips-badge">TIPS</span><span class="tips-title">' + escapeHtml(String(tip.title || '').replace(/^TIPS\s*/, '')) + '</span><span class="tips-open" aria-hidden="true">ひらく</span></summary>' +
              '<div class="tips-body">' +
                '<p class="tips-caption">' + escapeHtml(tip.caption || '') + '</p>' +
                (tip.images || [{src: tip.src, alt: tip.alt}]).map((im) =>
                  '<button type="button" class="illustration-open" data-src="' + escapeHtml(im.src) + '" data-caption="' + escapeHtml(String(tip.title || '')) + '" aria-label="' + escapeHtml(String(tip.title || '')) + 'を拡大">' +
                  '<img src="' + escapeHtml(im.src) + '" alt="' + escapeHtml(im.alt || tip.alt || tip.title || '') + '" loading="lazy" decoding="async">' +
                  '<span>タップで拡大</span></button>'
                ).join('') +
                (tip.note ? '<small class="tips-note">' + escapeHtml(tip.note) + '</small>' : '') +
              '</div>' +
            '</details>'
          ).join('') +
          (section.boxes || []).map((box) =>
            '<details class="more-box mb-' + (box.kind === 'link' ? 'link' : 'deep') + '">' +
              '<summary><span class="more-badge">' + (box.kind === 'link' ? 'つながり' : 'より深く') + '</span><span class="more-title">' + escapeHtml(String(box.title || '').replace(/^(つながりで覚える|より深く)：/, '')) + '</span><span class="more-open" aria-hidden="true">ひらく</span></summary>' +
              '<div class="more-body">' + box.html + '</div>' +
            '</details>'
          ).join('') +
          '<p class="xq"><a class="xq-link" href="../jusei-riron/?sec=' + escapeHtml(chapter.number + '-' + (index + 1)) + '" data-xq-link="' + escapeHtml(chapter.number + '-' + (index + 1)) + '">この節の過去問<span data-xq-sec="' + escapeHtml(chapter.number + '-' + (index + 1)) + '"></span> →</a></p>' +
          '<div class="quick-check">' +
            '<strong>理解度チェック</strong>' +
            '<p>' + escapeHtml(section.question) + '</p>' +
            '<button class="reveal" type="button" aria-expanded="false">解答を見る</button>' +
            '<p class="check-answer" hidden>' + escapeHtml(section.answer) + '</p>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    const deepDiveItems = deepDives[chapter.id] || [];
    chapterDeepDive.innerHTML = deepDiveItems.length
      ? '<details class="deep-dive">' +
          '<summary>' +
            '<span>仕組みを一段深く見る</span>' +
            '<small>本編で畳んだ部分を、必要なところだけ展開</small>' +
          '</summary>' +
          '<div class="deep-dive-content">' +
            '<p class="deep-dive-note">本編は国家試験で扱いやすい形に圧縮しています。ここでは、その表現が何を省略しているかを展開します。治療ガイドラインではなく、標準的な柔道整復学の考え方を国試範囲へつなぐ補足です。</p>' +
            deepDiveItems.map((item, index) =>
              '<article class="deep-dive-item">' +
                '<p class="deep-dive-number">DEEP ' + String(index + 1).padStart(2, '0') + '</p>' +
                '<h4>' + escapeHtml(item.title) + '</h4>' +
                '<dl>' +
                  '<div class="memory"><dt>本編の覚え方</dt><dd>' + escapeHtml(item.shortcut) + '</dd></div>' +
                  '<div><dt>実際の仕組み</dt><dd>' + escapeHtml(item.mechanism) + '</dd></div>' +
                  '<div><dt>ここを畳んでいる</dt><dd>' + escapeHtml(item.folded) + '</dd></div>' +
                  '<div class="exam"><dt>国試では</dt><dd>' + escapeHtml(item.exam) + '</dd></div>' +
                '</dl>' +
              '</article>'
            ).join('') +
          '</div>' +
        '</details>'
      : '';

    chapterQuiz.innerHTML =
      '<details class="quiz-fold"><summary><span>章末まとめチェック</span><small>' + chapter.quiz.length + '問　タップで開く</small></summary>' +
      '<p>この章で出てきた内容を、一問一答で確認する。</p>' +
      '<div class="quiz-list">' +
      chapter.quiz.map((item, index) =>
        '<div class="quiz-item">' +
          '<p><strong>問' + (index + 1) + '</strong>　' + escapeHtml(item.q) + '</p>' +
          '<button class="reveal" type="button" aria-expanded="false">解答を見る</button>' +
          '<p class="quiz-answer" hidden>' + escapeHtml(item.a) + '</p>' +
        '</div>'
      ).join('') +
      '</div></details>';

    fillXqCounts();
    updateExpandAll();
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === chapters.length - 1;
    prevButton.textContent = currentIndex === 0 ? '前の章' : '← ' + chapters[currentIndex - 1].title;
    nextButton.textContent = currentIndex === chapters.length - 1 ? '次の章' : chapters[currentIndex + 1].title + ' →';
    renderTabs();
  }

  function changeChapter(index, updateHash) {
    if (index < 0 || index >= chapters.length) return;
    currentIndex = index;
    renderChapter();
    if (updateHash) history.pushState(null, '', '#' + chapters[index].id);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  const preloaded = new Set();
  const preloadBefore = () => document.querySelectorAll('.fig-toggle').forEach((b) => { if (preloaded.has(b.dataset.before)) return; preloaded.add(b.dataset.before); const i = new Image(); i.src = b.dataset.before; });
  new MutationObserver(preloadBefore).observe(document.body, {childList: true, subtree: true});
  document.addEventListener('click', (event) => {
    const tog = event.target.closest('.fig-toggle');
    if (tog) {
      const fig = tog.closest('figure'); const img = fig.querySelector('img'); const open = fig.querySelector('.illustration-open');
      const toBefore = tog.getAttribute('aria-pressed') !== 'true';
      const src = toBefore ? tog.dataset.before : tog.dataset.after;
      img.classList.add('is-fading');
      setTimeout(() => { img.src = src; open.dataset.src = src; img.classList.remove('is-fading'); }, 180);
      tog.setAttribute('aria-pressed', String(toBefore));
      tog.textContent = '転位前 ⇄ 転位後（いま：' + (toBefore ? '転位前' : '転位後') + '）';
      return;
    }
    const illustration = event.target.closest('.illustration-open');
    if (illustration) {
      viewerImage.src = illustration.dataset.src;
      viewerImage.alt = illustration.dataset.caption;
      viewerCaption.textContent = illustration.dataset.caption;
      imageViewer.showModal();
      return;
    }
    const head = event.target.closest('.lesson-head');
    if (head) {
      const card = head.closest('.lesson-card');
      setCardOpen(card, !card.classList.contains('is-open'));
      return;
    }
    if (event.target.closest('#expandAll')) {
      const cards = [...sectionList.querySelectorAll('.lesson-card')];
      const allOpen = cards.every((c) => c.classList.contains('is-open'));
      cards.forEach((c) => setCardOpen(c, !allOpen));
      return;
    }
    const tab = event.target.closest('.chapter-tab');
    if (tab) {
      changeChapter(Number(tab.dataset.index), true);
      return;
    }

    const reveal = event.target.closest('.reveal');
    if (reveal) {
      const answer = reveal.nextElementSibling;
      const isHidden = answer.hasAttribute('hidden');
      answer.toggleAttribute('hidden', !isHidden);
      reveal.textContent = isHidden ? '解答を隠す' : '解答を見る';
      reveal.setAttribute('aria-expanded', String(isHidden));
    }
  });

  sectionList.addEventListener('keydown', (event) => {
    const head = event.target.closest && event.target.closest('.lesson-head');
    if (!head || event.target !== head) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const card = head.closest('.lesson-card');
      setCardOpen(card, !card.classList.contains('is-open'));
    }
  });

  tabs.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    changeChapter(Math.max(0, Math.min(chapters.length - 1, currentIndex + delta)), true);
    const active = tabs.querySelector('[aria-selected="true"]');
    if (active) active.focus();
  });

  answerToggle.addEventListener('click', () => {
    answersVisible = !answersVisible;
    document.body.classList.toggle('answers-hidden', !answersVisible);
    answerToggle.textContent = answersVisible ? '赤字を隠す' : '赤字を表示';
    answerToggle.setAttribute('aria-pressed', String(answersVisible));
  });

  prevButton.addEventListener('click', () => changeChapter(currentIndex - 1, true));
  nextButton.addEventListener('click', () => changeChapter(currentIndex + 1, true));
  toTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  window.addEventListener('popstate', () => {
    currentIndex = chapterFromHash();
    renderChapter();
    focusLessonFromHash();
  });

  document.getElementById('closeImageViewer').addEventListener('click', () => imageViewer.close());
  imageViewer.addEventListener('click', (event) => { if (event.target === imageViewer) imageViewer.close(); });

  currentIndex = chapterFromHash();
  renderChapter();
  focusLessonFromHash();
})();
