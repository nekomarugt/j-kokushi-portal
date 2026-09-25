(function () {
  'use strict';

  const chapters = window.physiologyChapters || [];
  const deepDives = window.physiologyDeepDives || {};
  const tabs = document.getElementById('chapterTabs');
  const intro = document.getElementById('chapterIntro');
  const sectionList = document.getElementById('sectionList');
  const chapterDeepDive = document.getElementById('chapterDeepDive');
  const chapterQuiz = document.getElementById('chapterQuiz');
  const answerToggle = document.getElementById('answerToggle');
  const prevButton = document.getElementById('prevChapter');
  const nextButton = document.getElementById('nextChapter');
  const toTop = document.getElementById('toTop');
  const imageViewer = document.getElementById('imageViewer');
  const viewerImage = document.getElementById('viewerImage');
  const viewerCaption = document.getElementById('viewerCaption');

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

  function chapterFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const index = chapters.findIndex((chapter) => chapter.id === id);
    return index >= 0 ? index : 0;
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

    document.title = chapter.title + '｜生理学 学習資料';
    intro.innerHTML =
      '<p class="chapter-kicker">CHAPTER ' + escapeHtml(chapter.number) + '</p>' +
      '<h2>' + escapeHtml(chapter.title) + '</h2>' +
      '<p>' + escapeHtml(chapter.intro) + '</p>';

    sectionList.innerHTML = chapter.sections.map((section, index) => {
      const image = section.image
        ? '<img class="lesson-image" src="' + encodeURI(section.image) + '" alt="' +
          escapeHtml(section.caption || section.title) + '" loading="lazy">' +
          (section.caption ? '<p class="image-caption">' + escapeHtml(section.caption) + '</p>' : '')
        : '';

      return '<article class="lesson-card" id="lesson-' + chapter.id + '-' + (index + 1) + '">' +
        '<div class="lesson-head">' +
          '<div class="lesson-number">' + escapeHtml(chapter.number) + '-' + String(index + 1).padStart(2, '0') + '</div>' +
          '<h3>' + escapeHtml(section.title) + '</h3>' +
        '</div>' +
        '<div class="lesson-body">' +
          '<div class="anchor">' + section.anchor + '</div>' +
          '<p class="explanation">' + escapeHtml(section.explanation) + '</p>' +
          image + (section.illustrations || []).map((item) =>
            '<figure class="illustration"><button type="button" class="illustration-open" data-src="' + escapeHtml(item.src) + '" data-caption="' + escapeHtml(item.caption) + '" aria-label="' + escapeHtml(item.caption) + 'を拡大">' +
            '<img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.caption) + '" loading="lazy" decoding="async">' +
            '<span>タップで拡大</span></button><figcaption>' + escapeHtml(item.caption) + '</figcaption></figure>'
          ).join('') +
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
            '<p class="deep-dive-note">本編は国家試験で扱いやすい形に圧縮しています。ここでは、その表現が何を省略しているかを展開します。治療ガイドラインではなく、標準的な生理学の仕組みを国試範囲へつなぐ補足です。</p>' +
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
      '<h3>章末まとめチェック</h3>' +
      '<p>この章で出てきた内容を、一問一答で確認する。</p>' +
      '<div class="quiz-list">' +
      chapter.quiz.map((item, index) =>
        '<div class="quiz-item">' +
          '<p><strong>問' + (index + 1) + '</strong>　' + escapeHtml(item.q) + '</p>' +
          '<button class="reveal" type="button" aria-expanded="false">解答を見る</button>' +
          '<p class="quiz-answer" hidden>' + escapeHtml(item.a) + '</p>' +
        '</div>'
      ).join('') +
      '</div>';

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

  document.addEventListener('click', (event) => {
    const illustration = event.target.closest('.illustration-open');
    if (illustration) {
      viewerImage.src = illustration.dataset.src;
      viewerImage.alt = illustration.dataset.caption;
      viewerCaption.textContent = illustration.dataset.caption;
      imageViewer.showModal();
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
  });

  document.getElementById('closeImageViewer').addEventListener('click', () => imageViewer.close());
  imageViewer.addEventListener('click', (event) => { if (event.target === imageViewer) imageViewer.close(); });

  currentIndex = chapterFromHash();
  renderChapter();
})();
