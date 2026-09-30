/* 柔整国試ポータル：学習ゲーム機能（連続日数・バッジ・レベル・弱点ステージ）
 * - すべて端末内（localStorage "jkp-game-v1"）。サーバー送信・個人情報・計測なし。
 * - 各ドリルから JKGame.record(src, id, correct, topic) を呼ぶだけ。
 *   src: ana/phy/cli = 過去問(解剖/生理/臨床)、anaQ/phyQ/cliQ = 一問一答(解剖/生理(basics-qa)/臨床)
 */
(function () {
  "use strict";
  var KEY = "jkp-game-v1";
  var script = document.currentScript || document.querySelector('script[src*="game/game.js"]');
  var ROOT = script && script.src ? new URL("../", script.src).href : "../";

  var SUBJ = { ana: "解剖学", phy: "生理学", cli: "一般臨床医学" };
  var SUBJ_PAGE = { ana: "anatomy", phy: "physiology", cli: "clinical" };
  var QS = { // 一問一答バンク
    anaQ: { subj: "ana", dir: "anatomy-qa", v: "ANATOMY_QA" },
    phyQ: { subj: "phy", dir: "basics-qa", v: "BASICS_QA" },
    cliQ: { subj: "cli", dir: "clinical-qa", v: "CLINICAL_QA" }
  };
  var SRC_SUBJ = { ana: "ana", phy: "phy", cli: "cli", anaQ: "ana", phyQ: "phy", cliQ: "cli" };
  var WEAK_OUT = 2;      // 弱点リストから外れる連続正解数
  var MASTER_RATE = 0.8; // 分野マスター：一問一答の80%以上に「正解」したことがある
  var PAST_TITLE_N = 100; // 過去問で100問（重複なし）に正解

  var LEVELS = [
    [0, "はじめの一歩"], [50, "かけだし"], [150, "見習い"], [300, "いっぱしの学生"], [500, "実力アップ"],
    [800, "国試に近づいた"], [1200, "頼れる先輩"], [1700, "合格圏"], [2300, "ほぼ先生"], [3000, "国試マスター"]
  ];
  var BADGES = [
    { id: "first", n: "はじめの一歩", d: "はじめて1問答えた", t: function (s) { return s.att >= 1; } },
    { id: "c10", n: "10問正解", d: "正解が合計10問", t: function (s) { return s.cor >= 10; } },
    { id: "c50", n: "50問正解", d: "正解が合計50問", t: function (s) { return s.cor >= 50; } },
    { id: "c100", n: "100問正解", d: "正解が合計100問", t: function (s) { return s.cor >= 100; } },
    { id: "st3", n: "3日連続", d: "3日つづけて問題をといた", t: function (s) { return s.best >= 3; } },
    { id: "st7", n: "7日連続", d: "7日つづけて問題をといた", t: function (s) { return s.best >= 7; } },
    { id: "st14", n: "14日連続", d: "14日つづけて問題をといた", t: function (s) { return s.best >= 14; } },
    { id: "st30", n: "30日連続", d: "30日つづけて問題をといた", t: function (s) { return s.best >= 30; } },
    { id: "q1", n: "ミニクエスト クリア", d: "10問ミニクエストを最後までやった", t: function (s) { return s.quests >= 1; } },
    { id: "q10", n: "満点クエスト", d: "ミニクエストで10問全問正解", t: function (s) { return s.perfect >= 1; } },
    { id: "grad", n: "弱点を1つ克服", d: "まちがえた問題を2回連続で正解した", t: function (s) { return s.grads >= 1; } },
    { id: "chap", n: "分野パーフェクト", d: "一問一答の1分野を全問正解", t: function (s) { return s.perfChap >= 1; } },
    { id: "subj", n: "科目コンプリート", d: "一問一答の1科目で全分野マスター", t: function (s) { return s.subjDone >= 1; } },
    { id: "three", n: "3科目デビュー", d: "解剖・生理・臨床をすべて1問以上といた", t: function (s) { return s.seen.ana && s.seen.phy && s.seen.cli; } },
    { id: "d20", n: "1日20問", d: "1日で20問といた", t: function (s) { return s.maxDay >= 20; } }
  ];

  /* ---------- state ---------- */
  var mem = null;
  function blank() {
    return { v: 1, xp: 0, att: 0, cor: 0, days: [], best: 0, qs: {}, ec: {}, weak: {}, badges: {}, mast: {}, past: {},
      quests: 0, perfect: 0, grads: 0, perfChap: 0, subjDone: 0, seen: {}, td: { d: "", n: 0 }, maxDay: 0 };
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    var s = blank();
    if (raw) { try { var o = JSON.parse(raw); if (o && o.v === 1) { for (var k in s) if (o[k] !== undefined) s[k] = o[k]; } } catch (e) {} }
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode etc.: keep in memory */ } }
  var S = load();

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function dayNum(str) { var p = str.split("-"); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000); }
  function streakNow() {
    var days = S.days; if (!days.length) return { n: 0, today: false };
    var t = dayNum(today()), last = dayNum(days[days.length - 1]);
    var doneToday = last === t;
    if (t - last > 1) return { n: 0, today: false };
    var n = 1;
    for (var i = days.length - 1; i > 0; i--) { if (dayNum(days[i]) - dayNum(days[i - 1]) === 1) n++; else break; }
    return { n: n, today: doneToday };
  }
  function levelInfo(xp) {
    var i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    var cur = LEVELS[i][0], next = i + 1 < LEVELS.length ? LEVELS[i + 1][0] : null;
    return { lv: i + 1, title: LEVELS[i][1], cur: cur, next: next, pct: next ? Math.min(100, Math.round((xp - cur) / (next - cur) * 100)) : 100, max: next === null };
  }

  /* ---------- banks (一問一答。分野マスター判定用) ---------- */
  var banks = {};
  function registerBank(src, items) { if (Array.isArray(items)) banks[src] = items; }
  function topicsOf(src) {
    var m = {}, list = banks[src] || [];
    list.forEach(function (q) { (m[q.topic] = m[q.topic] || []).push(q.id); });
    return m;
  }
  function topicStat(src, topic) {
    var ids = topicsOf(src)[topic] || [], ok = 0;
    ids.forEach(function (id) { var r = S.qs[src + ":" + id]; if (r && r[2]) ok++; });
    return { ok: ok, total: ids.length };
  }
  function shortTopic(t) { return t === "骨・関節・頭頸部" ? "骨・関節" : t; }
  function checkMastery(src, ev) {
    if (QS[src] && !banks[src] && window[QS[src].v]) registerBank(src, window[QS[src].v]);
    if (!QS[src] || !banks[src]) return;
    var subj = QS[src].subj, tp = topicsOf(src), all = true;
    Object.keys(tp).forEach(function (t) {
      var st = topicStat(src, t), key = subj + "|" + t;
      if (st.total && st.ok / st.total >= MASTER_RATE) {
        if (!S.mast[key]) { S.mast[key] = today(); ev.titles.push(shortTopic(t) + "マスター（" + SUBJ[subj] + "）"); }
        if (st.ok === st.total && !S.mast[key + "|p"]) { S.mast[key + "|p"] = 1; S.perfChap++; }
      } else all = false;
    });
    if (all && !S.mast[subj + "|all"]) { S.mast[subj + "|all"] = 1; S.subjDone++; }
  }

  /* ---------- record ---------- */
  function record(src, id, ok, topic) {
    if (!SRC_SUBJ[src]) return null;
    var ev = { xp: 0, badges: [], titles: [], levelUp: null, grad: false };
    var before = levelInfo(S.xp).lv;
    var k = src + ":" + id, r = S.qs[k] || (S.qs[k] = [0, 0, 0]);
    var firstOk = ok && !r[2];
    r[0]++; S.att++;
    if (ok) {
      r[1]++; S.cor++;
      if (!r[2]) { r[2] = 1; S.ec[src] = (S.ec[src] || 0) + 1; }
      ev.xp = firstOk ? 10 : 5;
    } else ev.xp = 2;
    S.xp += ev.xp;
    var d = today();
    if (S.days[S.days.length - 1] !== d) { S.days.push(d); if (S.days.length > 400) S.days.splice(0, S.days.length - 400); }
    var sn = streakNow().n; if (sn > S.best) S.best = sn;
    if (S.td.d !== d) S.td = { d: d, n: 0 };
    S.td.n++; if (S.td.n > S.maxDay) S.maxDay = S.td.n;
    S.seen[SRC_SUBJ[src]] = 1;
    var w = S.weak[src] || (S.weak[src] = {});
    if (ok) { if (Object.prototype.hasOwnProperty.call(w, id)) { w[id]++; if (w[id] >= WEAK_OUT) { delete w[id]; S.grads++; ev.grad = true; } } }
    else w[id] = 0;
    // 過去問：100問正解の称号
    var subj = SRC_SUBJ[src];
    if (!QS[src] && (S.ec[src] || 0) >= PAST_TITLE_N && !S.past[subj]) { S.past[subj] = today(); ev.titles.push(SUBJ[subj] + " 過去問100問クリア"); }
    checkMastery(src, ev);
    finish(ev, before);
    return ev;
  }
  function questDone(total, score) {
    var ev = { xp: 20 + (score === total && total > 0 ? 10 : 0), badges: [], titles: [], levelUp: null };
    var before = levelInfo(S.xp).lv;
    S.quests++; if (score === total && total > 0) S.perfect++;
    S.xp += ev.xp;
    finish(ev, before, true);
    return ev;
  }
  function finish(ev, before, bonus) {
    BADGES.forEach(function (b) { if (!S.badges[b.id] && b.t(S)) { S.badges[b.id] = today(); ev.badges.push(b.n); } });
    var after = levelInfo(S.xp);
    if (after.lv > before) ev.levelUp = after;
    save(); renderAll(); showToasts(ev, bonus);
  }

  function weakIds(src) { return Object.keys(S.weak[src] || {}); }
  function weakCount(subj) { var n = 0; [subj, subj + "Q"].forEach(function (s) { n += weakIds(s).length; }); return n; }
  function reset() { S = blank(); try { localStorage.removeItem(KEY); } catch (e) {} renderAll(); }

  /* ---------- UI helpers ---------- */
  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var toastBox = null, toastQ = [], toasting = false;
  function showToasts(ev, bonus) {
    var msgs = [];
    if (ev.xp) msgs.push({ t: "+" + ev.xp + " XP", k: "xp" });
    if (ev.grad) msgs.push({ t: "弱点を1つ克服！", k: "up" });
    if (ev.levelUp) msgs.push({ t: "レベルアップ！ Lv" + ev.levelUp.lv + "「" + ev.levelUp.title + "」", k: "up" });
    ev.badges.forEach(function (b) { msgs.push({ t: "バッジ：" + b, k: "up" }); });
    ev.titles.forEach(function (b) { msgs.push({ t: "称号：" + b, k: "up" }); });
    if (bonus) msgs = msgs.filter(function (m) { return m.k !== "xp"; }); // クエスト結果画面で表示するので省略
    if (!toastBox) {
      toastBox = document.createElement("div"); toastBox.className = "jkg-toasts"; toastBox.setAttribute("aria-live", "polite");
      document.body.appendChild(toastBox);
    }
    // 連続回答で画面がうるさくならないよう、XPだけのときは1つに保つ
    if (msgs.length === 1 && msgs[0].k === "xp") { toastQ = toastQ.filter(function (m) { return m.k !== "xp"; }); }
    toastQ = toastQ.concat(msgs); pump();
  }
  function pump() {
    if (toasting || !toastQ.length) return;
    toasting = true;
    var m = toastQ.shift(), el = document.createElement("div");
    el.className = "jkg-toast " + (m.k === "up" ? "is-up" : ""); el.textContent = m.t;
    toastBox.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); toasting = false; pump(); }, 220);
    }, m.k === "up" ? 2600 : 1300);
  }

  function barHtml(li) {
    return '<div class="jkg-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + li.pct + '"><i style="width:' + li.pct + '%"></i></div>';
  }
  function streakText(st) {
    if (st.n > 0) return '<strong>' + st.n + '</strong>日連続';
    return "今日からスタート";
  }
  function streakHint(st) {
    if (st.n === 0) return "1問やると「1日目」になります。";
    return st.today ? "今日の分はOK！" : "今日1問やると記録がつづきます。";
  }
  function questUrl(subj, extra) { return ROOT + "quest/?s=" + SUBJ_PAGE[subj] + (extra || ""); }

  function renderHome(el) {
    var st = streakNow(), li = levelInfo(S.xp), n = S.td.d === today() ? S.td.n : 0;
    var rows = ["ana", "phy", "cli"].map(function (s) {
      var wc = weakCount(s);
      return '<div class="jkg-subrow"><span class="jkg-subname">' + SUBJ[s] + '</span>' +
        '<a class="jkg-btn" href="' + questUrl(s) + '">10問ミニクエスト</a>' +
        (wc ? '<a class="jkg-btn is-weak" href="' + questUrl(s, "&mode=weak") + '">まちがえた問題 ' + wc + '問</a>'
            : '<span class="jkg-none">まちがえた問題：なし</span>') + '</div>';
    }).join("");
    el.innerHTML =
      '<div class="jkg-card">' +
      '<div class="jkg-top">' +
      '<div class="jkg-streak"><span class="jkg-fire" aria-hidden="true">🔥</span><div><div class="jkg-streak-n">' + streakText(st) + '</div><div class="jkg-sub">' + streakHint(st) + '</div></div></div>' +
      '<div class="jkg-level"><div class="jkg-lvline"><span class="jkg-lv">Lv' + li.lv + '</span><span class="jkg-lvtitle">' + esc(li.title) + '</span></div>' + barHtml(li) +
      '<div class="jkg-sub">' + (li.max ? "最高レベル！ " + S.xp + " XP" : "あと " + (li.next - S.xp) + " XP で Lv" + (li.lv + 1)) + '</div></div>' +
      '</div>' +
      '<p class="jkg-today">' + (n ? "今日は <strong>" + n + "</strong> 問といたよ。" : "今日はまだ0問。まずは1問だけやってみよう。") + '</p>' +
      '<div class="jkg-subrows">' + rows + '</div>' +
      '<div class="jkg-foot"><button type="button" class="jkg-link" data-jkg-open>🏅 バッジ・きろくを見る（' + Object.keys(S.badges).length + '/' + BADGES.length + '）</button>' +
      '<span class="jkg-note">記録は、この端末の中だけに保存されます。</span></div></div>';
  }
  function renderPanel(el) {
    var subj = el.getAttribute("data-subject"), isQA = el.getAttribute("data-src") === "qa";
    var st = streakNow(), li = levelInfo(S.xp), wc = weakCount(subj);
    el.innerHTML =
      '<div class="jkg-card is-compact">' +
      '<div class="jkg-strip"><span class="jkg-chip">🔥 ' + streakText(st) + '</span><span class="jkg-chip">Lv' + li.lv + ' ' + esc(li.title) + '</span>' +
      '<button type="button" class="jkg-link" data-jkg-open>きろく</button></div>' +
      '<div class="jkg-actions"><a class="jkg-btn" href="' + questUrl(subj, isQA ? "&src=qa" : "&src=past") + '">10問ミニクエスト</a>' +
      (wc ? '<a class="jkg-btn is-weak" href="' + questUrl(subj, "&mode=weak") + '">まちがえた問題だけ復習（' + wc + '問）</a>'
          : '<span class="jkg-none">まちがえた問題：いまはなし</span>') + '</div>' +
      '<p class="jkg-note">記録は、この端末の中だけに保存されます。</p></div>';
  }
  var mounts = [];
  function mountAll() {
    mounts = [].slice.call(document.querySelectorAll("[data-jkg]"));
    renderAll();
  }
  function renderAll() {
    mounts.forEach(function (el) { if (el.getAttribute("data-jkg") === "home") renderHome(el); else renderPanel(el); });
    if (overlay && !overlay.hidden) renderRecord();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-jkg-open]");
    if (b) { e.preventDefault(); openRecord(); }
  });

  /* ---------- きろくパネル ---------- */
  var overlay = null, lastFocus = null;
  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div"); overlay.className = "jkg-overlay"; overlay.hidden = true;
    overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true"); overlay.setAttribute("aria-label", "わたしのきろく");
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeRecord(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeRecord(); });
    document.body.appendChild(overlay);
  }
  function openRecord() {
    ensureOverlay(); lastFocus = document.activeElement; overlay.hidden = false; document.documentElement.classList.add("jkg-lock");
    renderRecord(); loadQABanks(renderRecord);
    var c = overlay.querySelector("[data-jkg-close]"); if (c) c.focus();
  }
  function closeRecord() {
    overlay.hidden = true; document.documentElement.classList.remove("jkg-lock");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function loadQABanks(cb) {
    var pending = 0;
    Object.keys(QS).forEach(function (src) {
      if (banks[src]) return;
      if (window[QS[src].v]) { registerBank(src, window[QS[src].v]); return; }
      pending++;
      var s = document.createElement("script"); s.src = ROOT + QS[src].dir + "/questions.js";
      s.onload = function () { registerBank(src, window[QS[src].v]); if (--pending === 0) cb(); };
      s.onerror = function () { pending--; };
      document.head.appendChild(s);
    });
    if (pending === 0) cb();
  }
  function renderRecord() {
    var st = streakNow(), li = levelInfo(S.xp);
    var badges = BADGES.map(function (b) {
      var got = S.badges[b.id];
      return '<li class="jkg-badge' + (got ? " is-got" : "") + '"><span class="jkg-bico" aria-hidden="true">' + (got ? "🏅" : "🔒") + '</span><span><strong>' + esc(b.n) + '</strong><small>' + esc(b.d) + '</small></span></li>';
    }).join("");
    var titles = [];
    Object.keys(S.mast).forEach(function (k) {
      if (k.indexOf("|p") > -1 || k.indexOf("|all") > -1) return;
      var p = k.split("|"); titles.push(shortTopic(p[1]) + "マスター（" + SUBJ[p[0]] + "）");
    });
    Object.keys(S.past).forEach(function (s) { titles.push(SUBJ[s] + " 過去問100問クリア"); });
    var prog = "";
    Object.keys(QS).forEach(function (src) {
      if (!banks[src]) return;
      var tp = topicsOf(src);
      prog += '<h4>' + SUBJ[QS[src].subj] + '（一問一答）</h4><ul class="jkg-prog">' + Object.keys(tp).map(function (t) {
        var x = topicStat(src, t), done = x.total && x.ok / x.total >= MASTER_RATE;
        return '<li class="' + (done ? "is-done" : "") + '"><span>' + esc(shortTopic(t)) + '</span><b>' + x.ok + '/' + x.total + (done ? " ✓" : "") + '</b></li>';
      }).join("") + '</ul>';
    });
    overlay.innerHTML =
      '<div class="jkg-modal"><div class="jkg-mhead"><h3>わたしのきろく</h3><button type="button" class="jkg-x" data-jkg-close aria-label="閉じる">閉じる</button></div>' +
      '<div class="jkg-mgrid"><div class="jkg-stat"><small>連続日数</small><strong>' + st.n + '<em>日</em></strong><span>最高 ' + Math.max(S.best, st.n) + '日</span></div>' +
      '<div class="jkg-stat"><small>レベル</small><strong>Lv' + li.lv + '</strong><span>' + esc(li.title) + '</span></div>' +
      '<div class="jkg-stat"><small>正解した数</small><strong>' + S.cor + '<em>問</em></strong><span>挑戦 ' + S.att + '問</span></div></div>' +
      '<div class="jkg-lvbox">' + barHtml(li) + '<span class="jkg-sub">' + S.xp + ' XP' + (li.max ? "（最高レベル）" : " ／ 次のレベルまで " + (li.next - S.xp) + " XP") + '</span></div>' +
      '<h4>バッジ（' + Object.keys(S.badges).length + '/' + BADGES.length + '）</h4><ul class="jkg-badges">' + badges + '</ul>' +
      '<h4>称号</h4>' + (titles.length ? '<ul class="jkg-titles">' + titles.map(function (t) { return "<li>🎖 " + esc(t) + "</li>"; }).join("") + '</ul>' : '<p class="jkg-sub">まだありません。一問一答の1分野で80%以上に正解すると「〇〇マスター」がもらえます。</p>') +
      (prog ? '<h4>分野ごとの進みぐあい</h4><p class="jkg-sub">正解したことがある問題の数。80%で称号。</p>' + prog : '') +
      '<div class="jkg-rules"><h4>ルール</h4><ul><li>正解 +10 XP（同じ問題の2回目以降は +5）／ まちがい +2 XP ／ ミニクエスト +20 XP（満点で +10）</li>' +
      '<li>連続日数：1日1問でも答えれば、その日は数えます（端末の日付で、0時に切り替わります）。</li>' +
      '<li>まちがえた問題は「復習リスト」に入り、2回つづけて正解すると外れます。</li></ul></div>' +
      '<p class="jkg-note">記録は、この端末（このブラウザ）の中だけに保存されます。サーバーには送りません。別の端末とは共有されません。</p>' +
      '<button type="button" class="jkg-reset" data-jkg-reset>記録を消す（ゲームの記録だけ）</button></div>';
    overlay.querySelector("[data-jkg-close]").addEventListener("click", closeRecord);
    overlay.querySelector("[data-jkg-reset]").addEventListener("click", function () {
      if (window.confirm("ストリーク・バッジ・レベル・復習リストなど、ゲームの記録をすべて消します。よろしいですか？")) reset();
    });
  }

  /* ---------- public ---------- */
  window.JKGame = {
    record: record, questDone: questDone, registerBank: registerBank, weakIds: weakIds, weakCount: weakCount,
    streak: streakNow, level: function () { return levelInfo(S.xp); }, xp: function () { return S.xp; },
    openRecord: openRecord, reset: reset, rootUrl: ROOT, isMastered: function (subj, topic) { return !!S.mast[subj + "|" + topic]; },
    qs: function (src, id) { return S.qs[src + ":" + id] || null; }, _state: function () { return S; },
    constants: { WEAK_OUT: WEAK_OUT, MASTER_RATE: MASTER_RATE, SUBJ: SUBJ, SUBJ_PAGE: SUBJ_PAGE, QS: QS }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll); else mountAll();
})();
