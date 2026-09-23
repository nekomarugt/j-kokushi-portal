(function () {
  "use strict";

  const generalContent = window.CLINICAL_CONTENT;
  const generalExplanations = window.CLINICAL_EXPLANATIONS || {};
  const diseaseContent = window.CLINICAL_DISEASE_CONTENT || { chapters: [] };
  const diseaseExplanations = window.CLINICAL_DISEASE_EXPLANATIONS || {};
  const deepDives = window.CLINICAL_DEEP_DIVES || { checkedAt: "", general: {}, diseases: {} };
  const app = document.getElementById("app");
  const imageViewer = document.getElementById("image-viewer");
  const imageViewerImage = document.getElementById("image-viewer-image");
  const imageViewerCaption = document.getElementById("image-viewer-caption");
  const tabs = Array.from(document.querySelectorAll(".course-tab"));
  const availableDiseases = new Map(diseaseContent.chapters.map((chapter) => [chapter.id, chapter]));
  let activeCourse = "general";
  let activeSection = generalContent.sections[0].id;
  let activeDisease = diseaseContent.chapters[0] ? diseaseContent.chapters[0].id : "respiratory";
  let query = "";
  const revealed = new Set();

  const diseaseCatalog = [
    { id: "cardiovascular", title: "循環器疾患" },
    { id: "respiratory", title: "呼吸器疾患" },
    { id: "digestive", title: "消化器疾患" },
    { id: "metabolic", title: "栄養・代謝疾患" },
    { id: "endocrine", title: "内分泌疾患" },
    { id: "hematology", title: "血液・造血器疾患" },
    { id: "neurology", title: "神経疾患" },
    { id: "renal", title: "腎・尿路疾患" },
    { id: "infection_rheumatology", title: "感染症・リウマチ系疾患" }
  ].map((item) => ({ ...item, chapter: availableDiseases.get(item.id) || null }));

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function sectionById(id) {
    return generalContent.sections.find((section) => section.id === id) || generalContent.sections[0];
  }

  function diseaseById(id) {
    return availableDiseases.get(id) || diseaseContent.chapters[0];
  }

  function blockText(block) {
    if (block.type === "heading") return block.text;
    if (block.type === "note") return block.segments.map((part) => part.text).join("");
    if (block.type === "table") return block.rows.flat(2).map((part) => part.text).join("");
    if (block.type === "figure") return `${block.caption || ""} ${block.alt || ""}`;
    return "";
  }

  function answerSegment(part, id) {
    const text = escapeHtml(part.text).replaceAll("\n", "<br>");
    if (!part.answer) return text;
    const isOpen = revealed.has(id);
    return `<span class="answer ${isOpen ? "is-visible" : ""}" aria-hidden="${isOpen ? "false" : "true"}">${text}</span>`;
  }

  function renderSegments(segments, id) {
    return segments.map((part) => answerSegment(part, id)).join("");
  }

  function hasAnswer(block) {
    if (block.type === "note") return block.segments.some((part) => part.answer);
    if (block.type === "table") return block.rows.flat(2).some((part) => part.answer);
    return false;
  }

  function answerButton(id) {
    const isOpen = revealed.has(id);
    return `<button class="answer-toggle" type="button" data-answer-id="${escapeHtml(id)}" aria-expanded="${isOpen}">${isOpen ? "解答を隠す" : "解答を見る"}</button>`;
  }

  function renderBlock(block, index, unitId) {
    if (block.type === "heading") {
      const level = Math.min(4, Math.max(2, block.level + 1));
      return `<h${level} class="note-heading level-${block.level}">${escapeHtml(block.text)}</h${level}>`;
    }

    if (block.type === "figure") {
      const src = escapeHtml(block.src);
      const alt = escapeHtml(block.alt || "");
      const caption = escapeHtml(block.caption || "");
      return `<figure class="study-figure">
        <button class="figure-zoom" type="button" data-image-src="${src}" data-image-alt="${alt}" data-image-caption="${caption}" aria-label="${caption}を拡大表示">
          <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />
          <span class="zoom-hint" aria-hidden="true">タップで拡大</span>
        </button>
        <figcaption>${caption}</figcaption>
      </figure>`;
    }

    const id = `${unitId}-${block.id || index}`;
    if (block.type === "table") {
      const rows = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${renderSegments(cell, id)}</td>`).join("")}</tr>`).join("");
      return `<article class="note-card table-card"><div class="table-wrap"><table>${rows}</table></div>${hasAnswer(block) ? answerButton(id) : ""}</article>`;
    }
    return `<article class="note-card"><p>${renderSegments(block.segments, id)}</p>${hasAnswer(block) ? answerButton(id) : ""}</article>`;
  }

  function generalNav() {
    const section = sectionById(activeSection);
    return {
      kicker: "GENERAL",
      title: "総論",
      items: generalContent.sections.map((item, index) => ({
        id: item.id,
        number: index + 1,
        title: item.title,
        summary: item.summary,
        active: item.id === section.id,
        available: true
      }))
    };
  }

  function diseaseNav() {
    return {
      kicker: "DISEASES",
      title: "各論",
      items: diseaseCatalog.map((item, index) => ({
        id: item.id,
        number: index + 1,
        title: item.title,
        summary: item.chapter ? item.chapter.summary : "資料未追加",
        active: item.id === activeDisease,
        available: Boolean(item.chapter)
      }))
    };
  }

  function renderNav(nav) {
    return `<aside class="chapter-nav" aria-label="${escapeHtml(nav.title)}の章">
      <div class="nav-heading"><span>${escapeHtml(nav.kicker)}</span><strong>${escapeHtml(nav.title)}</strong></div>
      ${nav.items.map((item) => `
        <button class="chapter-button ${item.active ? "is-active" : ""} ${item.available ? "is-ready" : "is-locked"}" type="button"
          ${item.available ? `data-unit="${escapeHtml(item.id)}"` : "disabled"}>
          <span>${String(item.number).padStart(2, "0")}</span>
          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.summary)}</small></span>
        </button>`).join("")}
    </aside>`;
  }

  function renderDeepDive(unitId, course) {
    const group = course === "general" ? deepDives.general : deepDives.diseases;
    const dive = group && group[unitId];
    if (!dive || !Array.isArray(dive.items) || !dive.items.length) return "";
    const refs = Array.isArray(dive.refs) && dive.refs.length
      ? `<div class="deep-dive-refs"><span>確認先</span>${dive.refs.map((ref) => `<a href="${escapeHtml(ref.url)}" target="_blank" rel="noreferrer">${escapeHtml(ref.label)}</a>`).join("")}</div>`
      : "";
    return `<section class="deep-dive-wrap" aria-labelledby="deep-dive-${escapeHtml(unitId)}">
      <details class="deep-dive">
        <summary>
          <span class="deep-dive-icon" aria-hidden="true">＋</span>
          <span><strong id="deep-dive-${escapeHtml(unitId)}">現在の標準につなぐ</strong><small>本編で圧縮した部分・旧表現を一段深く見る</small></span>
          <span class="deep-dive-date">${escapeHtml(deepDives.checkedAt)}補足更新</span>
        </summary>
        <div class="deep-dive-body">
          <p class="deep-dive-lead">${escapeHtml(dive.lead || "")}</p>
          <div class="deep-dive-list">
            ${dive.items.map((item, index) => `<article class="deep-dive-card">
              <div class="deep-dive-number">${String(index + 1).padStart(2, "0")}</div>
              <div class="deep-dive-copy">
                <h3>${escapeHtml(item.title)}</h3>
                <dl>
                  <div><dt>本編の覚え方</dt><dd>${escapeHtml(item.anchor)}</dd></div>
                  <div><dt>現在の整理</dt><dd>${escapeHtml(item.current)}</dd></div>
                  <div><dt>つなぎ目</dt><dd>${escapeHtml(item.bridge)}</dd></div>
                  <div><dt>国試では</dt><dd>${escapeHtml(item.exam)}</dd></div>
                </dl>
              </div>
            </article>`).join("")}
          </div>
          ${refs}
          <p class="deep-dive-note">ここは診療判断の手順書ではなく、国試教材の圧縮表現を現在の用語・考え方へつなぐ補足です。</p>
        </div>
      </details>
    </section>`;
  }

  function renderReader({ unit, nav, eyebrow, explanations, sourceIntro, caution }) {
    const q = query.trim().toLowerCase();
    const blocks = q ? unit.blocks.filter((block) => blockText(block).toLowerCase().includes(q)) : unit.blocks;
    const noteCount = unit.blocks.filter((block) => block.type === "note" || block.type === "table").length;
    const answerCount = unit.blocks.filter((block) => hasAnswer(block)).length;

    app.innerHTML = `
      ${renderNav(nav)}
      <section class="reader">
        <div class="reader-head">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1>${escapeHtml(unit.title)}</h1>
            <p>${escapeHtml(unit.summary)}</p>
          </div>
          <span class="count-badge">${noteCount}項目</span>
        </div>

        ${caution ? `<p class="material-caution">${escapeHtml(caution)}</p>` : ""}

        <div class="reader-tools">
          <form id="search-form" class="search-form" role="search">
            <label class="search-box">
              <span class="sr-only">この章を検索</span>
              <input id="search-input" type="search" value="${escapeHtml(query)}" placeholder="この章を検索" autocomplete="off" enterkeyhint="search" spellcheck="false" />
            </label>
            <button class="search-submit" type="submit">検索</button>
            ${q ? `<button id="clear-search" class="search-clear" type="button">解除</button>` : ""}
          </form>
          ${answerCount ? `<button id="reveal-all" class="secondary-button" type="button">この章の解答をすべて表示</button>` : ""}
        </div>

        <section class="oral-notes" aria-labelledby="oral-title">
          <div class="section-label"><span></span><h2 id="oral-title">講義の補足</h2></div>
          <div class="explanation-grid">
            ${explanations.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join("")}
          </div>
        </section>

        ${renderDeepDive(unit.id, activeCourse)}

        <section class="source-notes" aria-labelledby="source-title">
          <div class="section-label"><span></span><h2 id="source-title">資料の確認</h2></div>
          <p class="source-intro">${escapeHtml(sourceIntro)}</p>
          <div class="notes-list">
            ${blocks.length ? blocks.map((block, index) => renderBlock(block, index, unit.id)).join("") : `<p class="empty">該当する項目はありません。</p>`}
          </div>
        </section>
      </section>`;
  }

  function renderGeneral() {
    const section = sectionById(activeSection);
    renderReader({
      unit: section,
      nav: generalNav(),
      eyebrow: "一般臨床医学 総論",
      explanations: generalExplanations[section.id] || [],
      sourceIntro: "赤字部分は解答です。ボタンを押すと表示できます。",
      caution: ""
    });
  }

  function renderDiseases() {
    const chapter = diseaseById(activeDisease);
    renderReader({
      unit: chapter,
      nav: diseaseNav(),
      eyebrow: "一般臨床医学 各論",
      explanations: diseaseExplanations[chapter.id] || [],
      sourceIntro: "赤字部分は解答です。疾患名・所見・検査をつなげながら確認できます。",
      caution: "資料中の用語や基準値には作成時点の表現を含みます。授業の指示と最新版資料もあわせて確認してください。"
    });
  }

  function activeUnit() {
    return activeCourse === "general" ? sectionById(activeSection) : diseaseById(activeDisease);
  }

  function render() {
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.course === activeCourse));
    if (activeCourse === "general") renderGeneral();
    else renderDiseases();
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-unit]").forEach((button) => {
      button.addEventListener("click", () => {
        if (activeCourse === "general") activeSection = button.dataset.unit;
        else activeDisease = button.dataset.unit;
        query = "";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    document.querySelectorAll("[data-answer-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.answerId;
        if (revealed.has(id)) revealed.delete(id);
        else revealed.add(id);
        render();
      });
    });

    document.querySelectorAll("[data-image-src]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!imageViewer || !imageViewerImage || !imageViewerCaption) return;
        imageViewerImage.src = button.dataset.imageSrc;
        imageViewerImage.alt = button.dataset.imageAlt || "";
        imageViewerCaption.textContent = button.dataset.imageCaption || "";
        imageViewer.showModal();
      });
    });

    const searchForm = document.getElementById("search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const search = document.getElementById("search-input");
        if (!search) return;
        query = search.value.trim();
        render();
      });
    }

    const clearSearch = document.getElementById("clear-search");
    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        query = "";
        render();
        document.getElementById("search-input")?.focus();
      });
    }

    const revealAll = document.getElementById("reveal-all");
    if (revealAll) {
      revealAll.addEventListener("click", () => {
        const unit = activeUnit();
        unit.blocks.forEach((block, index) => {
          if (hasAnswer(block)) revealed.add(`${unit.id}-${block.id || index}`);
        });
        render();
      });
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCourse = tab.dataset.course;
      query = "";
      render();
    });
  });

  if (imageViewer) {
    imageViewer.querySelector("[data-close-viewer]").addEventListener("click", () => imageViewer.close());
    imageViewer.addEventListener("click", (event) => {
      if (event.target === imageViewer) imageViewer.close();
    });
  }

  render();
})();
