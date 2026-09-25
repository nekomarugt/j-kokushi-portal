(function () {
  'use strict';

  const chapters = window.anatomyChapters || [];
  const meta = window.anatomyGuideMeta || {};
  const qIndex = window.anatomyQIndex || {};
  const tabs = document.getElementById('chapterTabs');
  const view = document.getElementById('view');
  const answerToggle = document.getElementById('answerToggle');
  const prevButton = document.getElementById('prevChapter');
  const nextButton = document.getElementById('nextChapter');
  const toTop = document.getElementById('toTop');
  const qViewer = document.getElementById('qViewer');
  const qViewerTitle = document.getElementById('qViewerTitle');
  const qViewerBody = document.getElementById('qViewerBody');

  // pages: overview, chapters..., reverse
  // 00ページの id は 'home'（第1章の id 'overview' と重ならないように。#overview は第1章を開く）
  const pages = [{id: 'home', number: '00', title: '出題基準と頻度'}]
    .concat(chapters.map((c) => ({id: c.id, number: c.number, title: c.title, chapter: c})))
    .concat([{id: 'reverse', number: '逆', title: '過去問から逆引き'}]);
  const pointMap = {};
  chapters.forEach((c) => c.points.forEach((p) => { pointMap[p.id] = {chapter: c, point: p}; }));

  let currentIndex = 0;
  let answersVisible = true;
  let reverseExam = 'all';
  let reverseQuery = '';

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  function qLabel(id) {
    const [e, n] = id.split('-');
    return '第' + e + '回 問' + n;
  }
  function stars(n) {
    return n >= 6 ? '★★★' : n >= 3 ? '★★' : '★';
  }

  function parseHash() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h) return {page: 0};
    if (pointMap[h]) {
      return {page: pages.findIndex((p) => p.chapter === pointMap[h].chapter), point: h};
    }
    const idx = pages.findIndex((p) => p.id === h);
    return {page: idx >= 0 ? idx : 0};
  }

  function renderTabs() {
    tabs.innerHTML = pages.map((page, index) => {
      const selected = index === currentIndex;
      const count = page.chapter ? '<small class="tab-count">' + page.chapter.total + '問</small>' : '';
      return '<button class="chapter-tab' + (page.chapter ? '' : ' special') + '" type="button" role="tab" data-index="' + index +
        '" aria-selected="' + selected + '" tabindex="' + (selected ? '0' : '-1') + '">' +
        '<span class="num">' + escapeHtml(page.number) + '</span>' +
        '<span class="tab-title">' + escapeHtml(page.title) + '</span>' + count + '</button>';
    }).join('');
    const active = tabs.querySelector('[aria-selected="true"]');
    if (active) active.scrollIntoView({block: 'nearest', inline: 'center'});
  }

  function kijunBars(chapter) {
    const max = Math.max(1, ...chapter.kijun.map((k) => k.count));
    return '<div class="kijun-box"><p class="kijun-title">出題基準 大項目「' + escapeHtml(chapter.major + '．' + chapter.majorName) +
      '」の中項目と過去問数</p><ul class="kijun-bars">' +
      chapter.kijun.map((k) =>
        '<li><span class="k-name">' + escapeHtml(k.code.split('-')[1] + ' ' + k.name) + '</span>' +
        '<span class="k-bar"><i style="width:' + (k.count / max * 100).toFixed(1) + '%"></i></span>' +
        '<span class="k-count">' + k.count + '</span></li>').join('') +
      '</ul></div>';
  }

  function qChips(ids) {
    return '<div class="q-chips">' + ids.map((id) =>
      '<button type="button" class="q-chip" data-q="' + escapeHtml(id) + '">' + escapeHtml(qLabel(id)) + '</button>').join('') + '</div>';
  }

  function renderChapter(chapter, focusPoint) {
    document.title = chapter.title + '｜解剖学 学習資料';
    let html =
      '<div class="chapter-intro">' +
        '<p class="chapter-kicker">CHAPTER ' + escapeHtml(chapter.number) + '　｜　過去問 ' + chapter.total + '問・ポイント ' + chapter.points.length + '</p>' +
        '<h2>' + escapeHtml(chapter.title) + '</h2>' +
        '<p>' + escapeHtml(chapter.intro) + '</p>' +
      '</div>' + kijunBars(chapter) +
      '<p class="order-note">ポイントは、関連する過去問が多い順（＝よく出る順）に並んでいます。</p>' +
      '<div class="section-list">';
    html += chapter.points.map((p) =>
      '<article class="lesson-card" id="' + escapeHtml(p.id) + '">' +
        '<div class="lesson-head">' +
          '<div class="lesson-meta"><span class="lesson-number">' + escapeHtml(p.no) + '</span>' +
            '<span class="freq freq-' + stars(p.freq).length + '" title="関連する過去問の数">' + stars(p.freq) + ' 過去問' + p.freq + '問</span>' +
            p.items.map((c) => '<span class="kcode">基準 ' + escapeHtml(c) + '</span>').join('') + '</div>' +
          '<h3>' + escapeHtml(p.title) + '</h3>' +
        '</div>' +
        '<div class="lesson-body">' +
          '<div class="anchor">' + p.anchor + '</div>' +
          '<div class="why"><span class="why-label">なぜ？</span><p>' + escapeHtml(p.why.replace(/^なぜ：/, '')) + '</p></div>' +
          '<div class="from-q"><strong>このポイントが出た過去問</strong>' + qChips(p.qs) + '</div>' +
          '<div class="quick-check"><strong>理解度チェック</strong><p>' + escapeHtml(p.check_q) + '</p>' +
            '<button class="reveal" type="button" aria-expanded="false">解答を見る</button>' +
            '<p class="check-answer" hidden>' + escapeHtml(p.check_a) + '</p></div>' +
        '</div>' +
      '</article>').join('');
    html += '</div>';
    html += '<div class="chapter-quiz"><h3>章末まとめチェック</h3><p>この章で出てきた内容を、一問一答で確認する。</p><div class="quiz-list">' +
      chapter.quiz.map((item, i) =>
        '<div class="quiz-item"><p><strong>問' + (i + 1) + '</strong>　' + escapeHtml(item.q) + '</p>' +
        '<button class="reveal" type="button" aria-expanded="false">解答を見る</button>' +
        '<p class="quiz-answer" hidden>' + escapeHtml(item.a) + '</p></div>').join('') + '</div></div>';
    view.innerHTML = html;
    if (focusPoint) {
      const el = document.getElementById(focusPoint);
      if (el) { el.classList.add('is-focus'); setTimeout(() => el.scrollIntoView({block: 'start'}), 30); }
    }
  }

  function renderOverview() {
    document.title = '解剖学 学習資料｜出題基準別・過去問逆引き';
    const total = chapters.reduce((s, c) => s + c.total, 0);
    const ranking = [];
    chapters.forEach((c) => c.points.forEach((p) => ranking.push({c, p})));
    ranking.sort((a, b) => b.p.freq - a.p.freq);
    const max = Math.max(...chapters.map((c) => c.total));
    view.innerHTML =
      '<div class="chapter-intro"><p class="chapter-kicker">HOW TO USE</p><h2>出題基準と頻度</h2>' +
      '<p>公式の出題基準（' + escapeHtml(meta.kijunEdition || '') + '）の大項目・中項目で章を立て、解剖学の過去問' + escapeHtml(meta.exams || '') +
      '・' + total + '問を1問ずつ中項目に振り分けました。各ポイントには「その内容が出た過去問の回・問番号」を付けています。</p></div>' +
      '<div class="howto"><ol>' +
        '<li>まず下の表で、どの章がよく出るかを確認する。</li>' +
        '<li>章を開き、上から順に読む（よく出る順に並んでいる）。赤字は「赤字を隠す」で隠して暗記チェックできる。</li>' +
        '<li>「なぜ？」を読んで理由とセットで覚える。丸暗記より忘れにくい。</li>' +
        '<li>過去問アプリで間違えた問題は「過去問から逆引き」で回・問番号を探すと、関係するポイントに飛べる。</li>' +
      '</ol><p class="src">出題基準の出典：<a href="' + escapeHtml(meta.kijunSource || '#') + '" target="_blank" rel="noreferrer">公益財団法人 柔道整復研修試験財団「柔道整復師国家試験出題基準」PDF</a></p></div>' +
      '<h3 class="block-title">章ごとの過去問数</h3><div class="overview-table">' +
      chapters.map((c, i) =>
        '<button type="button" class="ov-row" data-index="' + (i + 1) + '">' +
          '<span class="ov-num">' + escapeHtml(c.number) + '</span>' +
          '<span class="ov-title">' + escapeHtml(c.title) + '<small>出題基準 ' + escapeHtml(c.major + '．' + c.majorName) + '（' + c.kijun.map((k) => k.code.split('-')[1]).join('・') + '）</small></span>' +
          '<span class="ov-bar"><i style="width:' + (c.total / max * 100).toFixed(1) + '%"></i></span>' +
          '<span class="ov-count">' + c.total + '問</span></button>').join('') +
      '</div>' +
      '<h3 class="block-title">よく出るポイント TOP15</h3><ol class="rank-list">' +
      ranking.slice(0, 15).map((r) =>
        '<li><a href="#' + escapeHtml(r.p.id) + '"><span class="rank-ch">' + escapeHtml(r.c.number) + '</span>' + escapeHtml(r.p.title) +
        '<span class="rank-n">' + r.p.freq + '問</span></a></li>').join('') + '</ol>';
  }

  function renderReverse() {
    document.title = '過去問から逆引き｜解剖学 学習資料';
    const ids = Object.keys(qIndex).sort((a, b) => {
      const [ea, na] = a.split('-').map(Number); const [eb, nb] = b.split('-').map(Number);
      return ea - eb || na - nb;
    });
    const exams = Array.from(new Set(ids.map((id) => qIndex[id].exam)));
    const q = reverseQuery.trim().toLowerCase();
    const rows = ids.filter((id) => {
      const r = qIndex[id];
      if (reverseExam !== 'all' && String(r.exam) !== reverseExam) return false;
      if (!q) return true;
      return (r.q + r.answer + r.mid + r.major + r.code + qLabel(id)).toLowerCase().includes(q);
    });
    view.innerHTML =
      '<div class="chapter-intro"><p class="chapter-kicker">REVERSE INDEX</p><h2>過去問から逆引き</h2>' +
      '<p>回・問番号から、その問題が出題基準のどの項目にあたり、この資料のどのポイントで解説しているかを探せます。</p></div>' +
      '<form class="reverse-tools" id="reverseForm" role="search">' +
        '<label>回<select id="reverseExam"><option value="all">すべて</option>' +
          exams.map((e) => '<option value="' + e + '"' + (String(e) === reverseExam ? ' selected' : '') + '>第' + e + '回</option>').join('') + '</select></label>' +
        '<label class="grow">キーワード<input id="reverseQuery" type="search" value="' + escapeHtml(reverseQuery) + '" placeholder="例：腋窩神経、腎臓、2-H" autocomplete="off"></label>' +
        '<button type="submit">絞り込む</button>' +
      '</form>' +
      '<p class="reverse-count">' + rows.length + '問を表示</p>' +
      '<div class="reverse-list">' + rows.map((id) => {
        const r = qIndex[id];
        return '<article class="rev-row" id="q-' + escapeHtml(id) + '">' +
          '<div class="rev-head"><span class="rev-id">' + escapeHtml(qLabel(id)) + '</span>' +
            '<span class="kcode">基準 ' + escapeHtml(r.code) + '</span><span class="rev-mid">' + escapeHtml(r.major + ' ＞ ' + r.mid) + '</span></div>' +
          '<p class="rev-q">' + escapeHtml(r.q) + '</p>' +
          '<p class="rev-a">正答：<span class="answer">' + escapeHtml(r.answer) + '</span></p>' +
          '<div class="rev-points">' + r.points.map((pid) => {
            const pm = pointMap[pid];
            return '<a href="#' + escapeHtml(pid) + '">' + escapeHtml(pm.point.no + ' ' + pm.point.title) + ' →</a>';
          }).join('') + '</div></article>';
      }).join('') + '</div>';
    const form = document.getElementById('reverseForm');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      reverseExam = document.getElementById('reverseExam').value;
      reverseQuery = document.getElementById('reverseQuery').value;
      renderReverse();
    });
    document.getElementById('reverseExam').addEventListener('change', (ev) => {
      reverseExam = ev.target.value; reverseQuery = document.getElementById('reverseQuery').value; renderReverse();
    });
  }

  function render(focusPoint) {
    const page = pages[currentIndex];
    // 章かどうかは page.chapter で判定する
    if (page.chapter) renderChapter(page.chapter, focusPoint);
    else if (page.id === 'reverse') renderReverse();
    else renderOverview();
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === pages.length - 1;
    prevButton.textContent = currentIndex === 0 ? '前の章' : '← ' + pages[currentIndex - 1].title;
    nextButton.textContent = currentIndex === pages.length - 1 ? '次の章' : pages[currentIndex + 1].title + ' →';
    renderTabs();
  }

  function changePage(index, updateHash) {
    if (index < 0 || index >= pages.length) return;
    currentIndex = index;
    render();
    if (updateHash) history.pushState(null, '', '#' + pages[index].id);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function openQuestion(id) {
    const r = qIndex[id];
    if (!r) return;
    qViewerTitle.textContent = qLabel(id) + '（' + (r.year ? r.year + '年度' : '') + '）';
    qViewerBody.innerHTML =
      '<p class="rev-q">' + escapeHtml(r.q) + '</p>' +
      '<p class="rev-a">正答：<span class="answer">' + escapeHtml(r.answer) + '</span></p>' +
      '<p class="rev-mid">出題基準：' + escapeHtml(r.code + '　' + r.major + ' ＞ ' + r.mid) + '</p>' +
      '<div class="rev-points">' + r.points.map((pid) => '<a href="#' + escapeHtml(pid) + '" data-close>' + escapeHtml(pointMap[pid].point.no + ' ' + pointMap[pid].point.title) + ' →</a>').join('') + '</div>' +
      '<p class="q-note">選択肢と解説は <a href="../anatomy/">解剖学 過去問アプリ</a> で確認できます。</p>';
    qViewer.showModal();
  }

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('.chapter-tab, .ov-row');
    if (tab) { changePage(Number(tab.dataset.index), true); return; }
    const chip = event.target.closest('.q-chip');
    if (chip) { openQuestion(chip.dataset.q); return; }
    if (event.target.closest('[data-close]')) qViewer.close();
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
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const delta = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? 1 : -1;
    changePage(Math.max(0, Math.min(pages.length - 1, currentIndex + delta)), true);
    const active = tabs.querySelector('[aria-selected="true"]');
    if (active) active.focus();
  });

  answerToggle.addEventListener('click', () => {
    answersVisible = !answersVisible;
    document.body.classList.toggle('answers-hidden', !answersVisible);
    answerToggle.textContent = answersVisible ? '赤字を隠す' : '赤字を表示';
    answerToggle.setAttribute('aria-pressed', String(answersVisible));
  });

  prevButton.addEventListener('click', () => changePage(currentIndex - 1, true));
  nextButton.addEventListener('click', () => changePage(currentIndex + 1, true));
  toTop.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  document.getElementById('closeQViewer').addEventListener('click', () => qViewer.close());
  qViewer.addEventListener('click', (event) => { if (event.target === qViewer) qViewer.close(); });

  function fromHash() {
    const st = parseHash();
    currentIndex = st.page;
    render(st.point);
    if (!st.point) window.scrollTo({top: 0});
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
