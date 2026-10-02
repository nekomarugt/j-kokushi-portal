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
  const openBoxes = new Set();
  const openItems = new Set(); // 開いている項目（単元ID:項目番号）
  // 頻出＝その節に結び付いた過去問が6問以上（guidelinks.json の対応から数える。全節のうち上位およそ1/5）
  const FREQ_MIN = 6;

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

  // ---- 過去問との行き来（../clinical/guidelinks.json）----
  // 節 = 総論は「１．体位、姿勢」のような番号つき見出し／各論は疾患（見出し）ごと。節ID = 単元ID:節番号
  const normText = (value) => String(value).normalize("NFKC");
  const startsCache = new Map();
  function sectionStarts(unit) {
    if (startsCache.has(unit.id)) return startsCache.get(unit.id);
    const blocks = unit.blocks;
    const heads = [];
    blocks.forEach((block, index) => { if (block.type === "heading") heads.push(index); });
    const cand = [];
    if (unit.id && generalContent.sections.some((item) => item.id === unit.id)) {
      heads.forEach((index) => {
        const block = blocks[index];
        if (block.level >= 2 && /^\d+\s*[.．]/.test(normText(block.text))) cand.push(index);
      });
    } else {
      heads.forEach((index, k) => {
        const block = blocks[index];
        const next = k + 1 < heads.length ? blocks[heads[k + 1]] : null;
        if (block.level === 1) {
          if (!(next && next.level >= 2)) cand.push(index);
          else if (blocks.slice(index + 1, heads[k + 1]).some((b) => b.type === "note" || b.type === "table")) cand.push(index);
        } else if (block.level === 2) {
          cand.push(index);
        }
      });
    }
    const starts = cand.filter((index, k) => {
      const end = k + 1 < cand.length ? cand[k + 1] : blocks.length;
      return blocks.slice(index + 1, end).some((b) => b.type === "note" || b.type === "table");
    });
    const map = new Map(starts.map((index, k) => [blocks[index], k + 1]));
    startsCache.set(unit.id, map);
    return map;
  }
  let currentStarts = null;
  let currentUnitId = "";
  let linkData = null;
  function xqCounts() {
    const bySec = {};
    const byUnit = {};
    if (!linkData) return { bySec, byUnit };
    Object.values(linkData.map).forEach((ids) => {
      const units = new Set();
      ids.forEach((sid) => {
        bySec[sid] = (bySec[sid] || 0) + 1;
        const sec = linkData.sections[sid];
        if (sec) units.add(sec.c);
      });
      units.forEach((unitId) => { byUnit[unitId] = (byUnit[unitId] || 0) + 1; });
    });
    return { bySec, byUnit };
  }
  function fillXqCounts() {
    if (!linkData) return;
    const { bySec, byUnit } = xqCounts();
    document.querySelectorAll("[data-xq-sec]").forEach((el) => {
      const n = bySec[el.dataset.xqSec] || 0;
      el.textContent = "（" + n + "問）";
      const link = el.closest("a");
      if (link) link.classList.toggle("is-empty", n === 0);
    });
    document.querySelectorAll("[data-xq-badge]").forEach((el) => {
      const n = bySec[el.dataset.xqBadge] || 0;
      el.textContent = "過去問" + n + "問";
      el.hidden = false;
      const fq = el.parentElement.querySelector(".badge-freq");
      if (fq) fq.hidden = n < FREQ_MIN;
    });
    document.querySelectorAll("[data-xq-ch]").forEach((el) => {
      const n = byUnit[el.dataset.xqCh] || 0;
      el.textContent = "（" + n + "問）";
      const link = el.closest("a");
      if (link) link.classList.toggle("is-empty", n === 0);
    });
  }
  fetch("../clinical/guidelinks.json")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("guidelinks unavailable"))))
    .then((data) => { linkData = data; fillXqCounts(); })
    .catch(() => { linkData = null; });

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
    if (block.type === "figure") return `${block.caption || ""} ${block.alt || ""} ${block.point || ""}`;
    if (block.type === "tips") return `${block.title || ""} ${block.caption || ""} ${block.note || ""}`;
    if (block.type === "box") return `${block.title || ""} ${String(block.html || "").replace(/<[^>]*>/g, " ")}`;
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
    if (block.type === "box") return /class="answer"/.test(block.html || "");
    return false;
  }

  function answerButton(id) {
    const isOpen = revealed.has(id);
    return `<button class="answer-toggle" type="button" data-answer-id="${escapeHtml(id)}" aria-expanded="${isOpen}">${isOpen ? "解答を隠す" : "解答を見る"}</button>`;
  }

  function renderBlock(block, index, unitId) {
    if (block.type === "heading") {
      const level = Math.min(4, Math.max(2, block.level + 1));
      const secNo = currentStarts && currentStarts.get(block);
      if (secNo) {
        const secId = `${unitId}:${secNo}`;
        return `<h${level} id="sec-${escapeHtml(unitId)}-${secNo}" class="note-heading level-${block.level}">${escapeHtml(block.text)}</h${level}>` +
          `<p class="xq"><a class="xq-link" href="../clinical/?sec=${encodeURIComponent(secId)}" data-xq-link="${escapeHtml(secId)}">この節の過去問<span data-xq-sec="${escapeHtml(secId)}"></span> →</a></p>`;
      }
      return `<h${level} class="note-heading level-${block.level}">${escapeHtml(block.text)}</h${level}>`;
    }

    if (block.type === "tips") {
      const src = escapeHtml(block.src);
      const alt = escapeHtml(block.alt || "");
      const title = escapeHtml(block.title || "TIPS");
      const note = block.note ? `<small class="tips-note">${escapeHtml(block.note)}</small>` : "";
      return `<details class="tips-box">
        <summary><span class="tips-badge">TIPS</span><span class="tips-title">${title.replace(/^TIPS\s*/, "")}</span><span class="tips-open" aria-hidden="true">ひらく</span></summary>
        <div class="tips-body">
          <p class="tips-caption">${escapeHtml(block.caption || "")}</p>
          <button class="figure-zoom" type="button" data-image-src="${src}" data-image-alt="${alt}" data-image-caption="${title}" aria-label="${title}を拡大表示">
            <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />
            <span class="zoom-hint" aria-hidden="true">タップで拡大</span>
          </button>
          ${note}
        </div>
      </details>`;
    }

    if (block.type === "box") {
      const bid = `${unitId}-${block.id || index}`;
      const shown = revealed.has(bid);
      const html = String(block.html || "").replace(/<span class="answer">/g, shown ? '<span class="answer is-visible" aria-hidden="false">' : '<span class="answer" aria-hidden="true">');
      const btn = hasAnswer(block) ? answerButton(bid) : "";
      if (block.kind === "main") return `<div class="mb-main">${html}${btn}</div>`;
      const isLink = block.kind === "link";
      const label = escapeHtml(String(block.title || "").replace(/^(つながりで覚える|より深く)：/, ""));
      return `<details class="more-box mb-${isLink ? "link" : "deep"}" data-box-id="${escapeHtml(bid)}"${openBoxes.has(bid) ? " open" : ""}><summary><span class="more-badge">${isLink ? "つながり" : "より深く"}</span><span class="more-title">${label}</span><span class="more-open" aria-hidden="true">ひらく</span></summary><div class="more-body">${html}${btn}</div></details>`;
    }

    if (block.type === "figure") {
      const src = escapeHtml(block.src);
      const alt = escapeHtml(block.alt || "");
      const caption = escapeHtml(block.caption || "");
      const point = block.point ? `<span class="fig-point"><strong>ひとことポイント</strong>${escapeHtml(block.point)}</span>` : "";
      return `<figure class="study-figure${block.point ? " fig-diagram" : ""}">
        <button class="figure-zoom" type="button" data-image-src="${src}" data-image-alt="${alt}" data-image-caption="${caption}" aria-label="${caption}を拡大表示">
          <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />
          <span class="zoom-hint" aria-hidden="true">タップで拡大</span>
        </button>
        <figcaption><span class="fig-title">${caption}</span>${point}</figcaption>
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

  // ---- 項目のアコーディオン（見出しをタップで本文を開閉） ----
  // 過去問と結び付いた節（sectionStarts）ごとに項目をつくる。節の手前の見出しだけが並ぶ部分は、その節の見出しの上にまとめる。
  function buildItems(blocks) {
    const items = [];
    let cur = null;
    blocks.forEach((block) => {
      if (block.type === "heading" && currentStarts.has(block)) {
        const pre = [];
        if (cur) {
          while (cur.blocks.length && cur.blocks[cur.blocks.length - 1].type === "heading") pre.unshift(cur.blocks.pop());
          if (!cur.blocks.length && !cur.start) items.pop();
        }
        cur = { start: block, pre, blocks: [] };
        items.push(cur);
      } else {
        if (!cur) { cur = { start: null, pre: [], blocks: [] }; items.push(cur); }
        cur.blocks.push(block);
      }
    });
    return items;
  }

  function headingTag(block) {
    const level = Math.min(4, Math.max(2, block.level + 1));
    return { level, tag: "h" + level };
  }

  function renderItem(item, index, unit, forceOpen) {
    const key = unit.id + ":" + index;
    const open = forceOpen || openItems.has(key);
    let title = "";
    let headHtml = "";
    let xq = "";
    let badges = "";
    let blocks = item.blocks;
    const ctx = item.pre.length ? `<span class="acc-ctx">${item.pre.map((b) => escapeHtml(b.text)).join(" ＞ ")}</span>` : "";
    if (item.start) {
      const block = item.start;
      const secId = `${unit.id}:${currentStarts.get(block)}`;
      const { tag } = headingTag(block);
      headHtml = `<${tag} id="sec-${escapeHtml(unit.id)}-${currentStarts.get(block)}" class="note-heading level-${block.level}">${escapeHtml(block.text)}</${tag}>`;
      xq = `<p class="xq"><a class="xq-link" href="../clinical/?sec=${encodeURIComponent(secId)}" data-xq-link="${escapeHtml(secId)}">この節の過去問<span data-xq-sec="${escapeHtml(secId)}"></span> →</a></p>`;
      badges = `<span class="acc-badges"><span class="badge-freq" hidden>頻出</span><span class="badge-n" data-xq-badge="${escapeHtml(secId)}" hidden></span></span>`;
    } else {
      // 見出しだけで始まる冒頭部分は、その見出しを項目名にする
      let first = blocks[0] && blocks[0].type === "heading" ? blocks[0] : null;
      if (first) {
        blocks = blocks.slice(1);
        const { tag } = headingTag(first);
        headHtml = `<${tag} class="note-heading level-${first.level}">${escapeHtml(first.text)}</${tag}>`;
      } else {
        headHtml = `<h3 class="note-heading level-2">はじめに</h3>`;
      }
    }
    const bodyId = `acc-body-${escapeHtml(unit.id)}-${index}`;
    return `<section class="acc-item${open ? " is-open" : ""}" data-acc="${escapeHtml(key)}">
      <div class="acc-head" role="button" tabindex="0" aria-expanded="${open}" aria-controls="${bodyId}">
        <div class="acc-title">${ctx}${headHtml}</div>${badges}<span class="acc-chev" aria-hidden="true"></span>
      </div>
      <div class="acc-body notes-list" id="${bodyId}"${open ? "" : " hidden"}>${xq}${blocks.map((block, i) => renderBlock(block, i, unit.id)).join("")}</div>
    </section>`;
  }

  function setItemOpen(item, open) {
    const head = item.querySelector(".acc-head");
    const body = item.querySelector(".acc-body");
    if (!head || !body) return;
    body.hidden = !open;
    item.classList.toggle("is-open", open);
    head.setAttribute("aria-expanded", String(open));
    if (open) openItems.add(item.dataset.acc); else openItems.delete(item.dataset.acc);
    updateExpandAll();
  }

  function updateExpandAll() {
    const btn = document.getElementById("expandAll");
    if (!btn) return;
    const items = [...document.querySelectorAll(".acc-item")];
    const allOpen = items.length > 0 && items.every((item) => item.classList.contains("is-open"));
    btn.textContent = allOpen ? "すべて閉じる" : "すべて開く";
    btn.setAttribute("aria-pressed", String(allOpen));
  }

  function renderReader({ unit, nav, eyebrow, explanations, sourceIntro, caution }) {
    const q = query.trim().toLowerCase();
    currentStarts = sectionStarts(unit);
    currentUnitId = unit.id;
    const blocks = q ? unit.blocks.filter((block) => blockText(block).toLowerCase().includes(q)) : unit.blocks;
    const noteCount = unit.blocks.filter((block) => block.type === "note" || block.type === "table").length;
    const answerCount = unit.blocks.filter((block) => hasAnswer(block)).length;
    const items = buildItems(blocks);
    const allRevealed = answerCount > 0 && unit.blocks.every((block, index) => !hasAnswer(block) || revealed.has(`${unit.id}-${block.id || index}`));

    app.innerHTML = `
      ${renderNav(nav)}
      <section class="reader">
        <div class="reader-head">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1>${escapeHtml(unit.title)}</h1>
            <p>${escapeHtml(unit.summary)}</p>
            <div class="xq-chapter-row"><a class="xq-chapter" href="../clinical/?ch=${encodeURIComponent(unit.id)}">この章の過去問<span data-xq-ch="${escapeHtml(unit.id)}"></span> →</a></div>
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
          ${answerCount ? `<button id="reveal-all" class="secondary-button" type="button" data-state="${allRevealed ? "hide" : "show"}">${allRevealed ? "この章の解答をすべて隠す" : "この章の解答をすべて表示"}</button>` : ""}
        </div>

        <section class="oral-notes" aria-labelledby="oral-title">
          <details class="oral-fold">
            <summary><span class="section-label"><span></span><h2 id="oral-title">講義の補足</h2></span><small>${explanations.length}件　タップで開く</small></summary>
            <div class="explanation-grid">
              ${explanations.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join("")}
            </div>
          </details>
        </section>

        ${renderDeepDive(unit.id, activeCourse)}

        <section class="source-notes" aria-labelledby="source-title">
          <div class="section-label"><span></span><h2 id="source-title">資料の確認</h2></div>
          <p class="source-intro">${escapeHtml(sourceIntro)}</p>
          ${blocks.length ? `<div class="acc-toolbar"><span class="acc-count">${items.length}項目　${q ? "検索結果" : "見出しをタップで開く"}</span><button id="expandAll" class="acc-all" type="button" aria-pressed="false">すべて開く</button></div>` : ""}
          <div class="notes-list acc-list">
            ${blocks.length ? items.map((item, index) => renderItem(item, index, unit, Boolean(q))).join("") : `<p class="empty">該当する項目はありません。</p>`}
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
    fillXqCounts();
    updateExpandAll();
  }

  // 過去問ページの「関連資料」から来たとき：#sec-単元ID-節番号 → その単元を開いて節へ移動
  function routeFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    const m = /^(sec|unit)-(.+?)(?:-(\d+))?$/.exec(id);
    if (!m) return false;
    const unitId = m[2];
    if (generalContent.sections.some((item) => item.id === unitId)) {
      activeCourse = "general";
      activeSection = unitId;
    } else if (availableDiseases.has(unitId)) {
      activeCourse = "diseases";
      activeDisease = unitId;
    } else {
      return false;
    }
    query = "";
    render();
    if (m[1] === "sec" && m[3]) {
      const target = document.getElementById("sec-" + unitId + "-" + m[3]);
      if (target) {
        document.querySelectorAll(".is-focus").forEach((el) => el.classList.remove("is-focus"));
        target.classList.add("is-focus");
        const accItem = target.closest(".acc-item");
        if (accItem) setItemOpen(accItem, true);
        // 画像の遅延読み込みでレイアウトが動くので、少し後にもう一度合わせる
        const jump = () => target.scrollIntoView({ block: "start", behavior: "instant" });
        jump();
        [250, 700, 1400].forEach((ms) => setTimeout(jump, ms));
      }
    }
    return true;
  }
  window.addEventListener("hashchange", routeFromHash);

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

    document.querySelectorAll(".acc-head").forEach((head) => {
      const toggle = () => {
        const item = head.closest(".acc-item");
        setItemOpen(item, !item.classList.contains("is-open"));
      };
      head.addEventListener("click", toggle);
      head.addEventListener("keydown", (event) => {
        if (event.target !== head) return;
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
      });
    });

    const expandAll = document.getElementById("expandAll");
    if (expandAll) {
      expandAll.addEventListener("click", () => {
        const items = [...document.querySelectorAll(".acc-item")];
        const allOpen = items.every((item) => item.classList.contains("is-open"));
        items.forEach((item) => setItemOpen(item, !allOpen));
      });
    }

    document.querySelectorAll("details.more-box[data-box-id]").forEach((d) => {
      d.addEventListener("toggle", () => { if (d.open) openBoxes.add(d.dataset.boxId); else openBoxes.delete(d.dataset.boxId); });
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
        const hide = revealAll.dataset.state === "hide";
        unit.blocks.forEach((block, index) => {
          if (!hasAnswer(block)) return;
          const id = `${unit.id}-${block.id || index}`;
          if (hide) revealed.delete(id); else revealed.add(id);
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

  if (!routeFromHash()) render();
})();
