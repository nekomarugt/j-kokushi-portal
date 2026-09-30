/* ぷにっ子ガチャ画面。抽せんと保存は game/game.js（JKGame.pull）、絵は game/avatars.js。 */
(function () {
  "use strict";
  var G = window.JKGame, AV = window.JKAvatars;
  var $ = function (id) { return document.getElementById(id); };
  var RN = AV.RARITY, busy = false, hold = null, timers = [], skip = null;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ORDER = { N: 0, R: 1, SR: 2 };

  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function capsule(cls) {
    return '<svg class="jkc-cap ' + cls + '" viewBox="0 0 120 120" width="150" height="150" aria-hidden="true">' +
      '<defs><radialGradient id="jkcg" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#9fb8ff"/></radialGradient></defs>' +
      '<ellipse cx="60" cy="112" rx="34" ry="6" fill="#0b1730" opacity=".18"/>' +
      '<g class="jkc-cap-in"><circle cx="60" cy="60" r="46" fill="#3a2f4d"/>' +
      '<path d="M15 60a45 45 0 0 1 90 0Z" fill="#ff7aa8"/><path d="M15 60a45 45 0 0 0 90 0Z" fill="url(#jkcg)"/>' +
      '<rect x="14" y="56.5" width="92" height="7" fill="#3a2f4d"/><circle cx="60" cy="60" r="10" fill="#ffd23f" stroke="#3a2f4d" stroke-width="4"/>' +
      '<ellipse cx="42" cy="36" rx="9" ry="5" transform="rotate(-35 42 36)" fill="#fff" opacity=".75"/>' +
      '<path d="M88 78l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#fff" opacity=".8"/></g></svg>';
  }
  function idle() { $("stage").innerHTML = '<div class="jkc-idle">' + capsule("") + '</div>'; }

  function card(r, big) {
    var d = AV.get(r.id), tag = r.isNew ? '<span class="jkc-new">NEW!</span>' : '<span class="jkc-dupe">DUPE +' + r.refund + '</span>';
    return '<div class="jkc-card r-' + d.r.toLowerCase() + (big ? " is-big" : "") + '" data-id="' + r.id + '">' + tag +
      AV.svg(r.id, big ? 132 : 76) + '<span class="jkc-rar r-' + d.r.toLowerCase() + '">' + d.r + '</span><strong>' + esc(d.n) + '</strong>' +
      (big ? '<small>' + esc(d.f) + '</small>' : '') + '</div>';
  }

  function updateHud() {
    var c = hold === null ? G.coins() : hold;
    $("coin").textContent = c;
    $("pity").textContent = G.pity();
    $("pull1").disabled = busy || c < G.ECO.PULL;
    $("pull10").disabled = busy || c < G.ECO.PULL10;
    var s = $("short");
    if (!busy && c < G.ECO.PULL) { s.hidden = false; s.textContent = "コインが足りません。問題を解くとたまります（あと " + (G.ECO.PULL - c) + " コイン）。"; }
    else if (!busy && c < G.ECO.PULL10) { s.hidden = false; s.textContent = "10連はあと " + (G.ECO.PULL10 - c) + " コインで回せます。"; }
    else s.hidden = true;
  }

  function renderBook() {
    var own = G.owned(), sel = G.selected(), n = G.ownedCount();
    $("count").textContent = n + "/" + AV.list.length;
    $("count-bar").style.width = Math.round(n / AV.list.length * 100) + "%";
    var html = "";
    ["N", "R", "SR"].forEach(function (r) {
      var ids = AV.byRarity[r], have = ids.filter(function (i) { return own[i]; }).length;
      html += '<h3 class="jkc-bh r-' + r.toLowerCase() + '"><b>' + r + '</b> ' + RN[r] + ' <small>' + have + '/' + ids.length + '</small></h3><div class="jkc-bgrid">';
      ids.forEach(function (id) {
        var d = AV.get(id), has = own[id];
        html += '<button type="button" class="jkc-cell r-' + d.r.toLowerCase() + (has ? "" : " is-locked") + (sel === id ? " is-sel" : "") + '" data-id="' + id + '" aria-label="' + (has ? esc(d.n) : "まだ出ていない子") + '">' +
          (has ? AV.svg(id, 64) : AV.sil(id, 64)) + '<span>' + (has ? esc(d.n) : "？？？") + '</span>' + (sel === id ? '<i class="jkc-mine">つかってる</i>' : "") + '</button>';
      });
      html += "</div>";
    });
    $("book").innerHTML = html;
  }

  function showDetail(id) {
    var own = G.owned(), d = AV.get(id), box = $("detail");
    if (!own[id]) { box.hidden = false; box.innerHTML = '<p class="jkc-locked">まだ出会っていない <b>' + d.r + '</b> の子です。ガチャで探そう。</p>'; return; }
    var sel = G.selected() === id;
    box.hidden = false;
    box.innerHTML = '<div class="jkc-dwrap">' + AV.svg(id, 96) + '<div><span class="jkc-rar r-' + d.r.toLowerCase() + '">' + d.r + ' ' + RN[d.r] + '</span><strong>' + esc(d.n) + '</strong><small>' + esc(d.f) + '</small>' +
      '<small>あつめた数：' + own[id] + '</small></div></div>' +
      '<button type="button" class="jkq-primary" data-use="' + id + '"' + (sel ? " disabled" : "") + '>' + (sel ? "いま使っています" : "この子をマイアバターにする") + '</button>';
  }

  function burst(r) {
    var n = r === "SR" ? 26 : r === "R" ? 14 : 6, cols = r === "SR" ? ["#ffd23f", "#fff", "#ff9fc4", "#8fe3ff"] : r === "R" ? ["#5b8def", "#fff", "#9fd2ff"] : ["#fff", "#cfd8e6"];
    var h = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.283 + Math.random() * .4, dist = (r === "SR" ? 120 : 84) + Math.random() * 60;
      h += '<i class="jkc-p" style="--x:' + Math.round(Math.cos(a) * dist) + 'px;--y:' + Math.round(Math.sin(a) * dist) + 'px;background:' + cols[i % cols.length] + ';animation-delay:' + (Math.random() * .12).toFixed(2) + 's"></i>';
    }
    return '<div class="jkc-burst">' + h + '</div>';
  }

  function finish(pr) {
    clearTimers(); skip = null; hold = null; busy = false;
    var st = $("stage"); st.className = "jkc-stage";
    var rs = pr.results, big = rs.length === 1;
    $("results").hidden = false;
    $("res-grid").className = "jkc-grid" + (big ? " is-one" : "");
    $("res-grid").innerHTML = rs.map(function (r, i) { return card(r, big).replace('class="jkc-card', 'style="animation-delay:' + (reduce ? 0 : i * 70) + 'ms" class="jkc-card'); }).join("");
    if (big) {
      var d = AV.get(rs[0].id);
      $("res-grid").insertAdjacentHTML("beforeend", '<button type="button" class="jkq-secondary jkc-use" data-use="' + rs[0].id + '"' + (G.selected() === rs[0].id ? " disabled" : "") + '>' + (G.selected() === rs[0].id ? "いま使っています" : "この子をマイアバターにする") + '</button>');
    }
    var best = rs.reduce(function (a, r) { return ORDER[r.r] > ORDER[a] ? r.r : a; }, "N");
    var newN = rs.filter(function (r) { return r.isNew; }).length, back = rs.reduce(function (a, r) { return a + r.refund; }, 0);
    $("msg").textContent = (best === "SR" ? "スーパーレア！！ " : best === "R" ? "レアが出た！ " : "") + "新しい子 " + newN + " 体" + (back ? "／ かぶり分で +" + back + " コインもどった" : "") + "。";
    idle(); updateHud(); renderBook();
    try { $("results").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); } catch (e) {}
  }

  function run(n) {
    if (busy) return;
    var before = G.coins();
    var pr = G.pull(n);
    if (!pr.ok) { updateHud(); return; }
    busy = true; hold = before - pr.cost; updateHud();
    $("results").hidden = true;
    var best = pr.results.reduce(function (a, r) { return ORDER[r.r] > ORDER[a] ? r.r : a; }, "N"), st = $("stage");
    skip = function () { finish(pr); };
    if (reduce) { $("msg").textContent = "ひらいています…"; later(function () { finish(pr); }, 350); return; }
    $("msg").textContent = "ドキドキ…（タップでスキップ）";
    st.className = "jkc-stage is-" + best.toLowerCase();
    st.innerHTML = '<div class="jkc-wrap">' + capsule("is-shake") + '</div>';
    var shakeMs = best === "SR" ? 1900 : best === "R" ? 1400 : 950;
    later(function () {
      st.innerHTML = '<div class="jkc-flash f-' + best.toLowerCase() + '"></div>' + (best === "SR" ? '<div class="jkc-rays"></div>' : "") + burst(best) +
        '<div class="jkc-pop">' + (best === "N" ? "" : '<b class="jkc-rar r-' + best.toLowerCase() + '">' + best + '</b>') + '</div>';
      later(function () { finish(pr); }, best === "SR" ? 1500 : best === "R" ? 1000 : 600);
    }, shakeMs);
  }

  $("stage").addEventListener("click", function () { if (skip) skip(); });
  $("pull1").addEventListener("click", function () { run(1); });
  $("pull10").addEventListener("click", function () { run(10); });
  document.addEventListener("click", function (e) {
    var u = e.target.closest && e.target.closest("[data-use]");
    if (u && !u.disabled) {
      if (G.setAvatar(u.getAttribute("data-use"))) {
        renderBook();
        document.querySelectorAll("[data-use]").forEach(function (b) { b.disabled = b.getAttribute("data-use") === G.selected(); b.textContent = b.disabled ? "いま使っています" : b.textContent; });
        var cell = document.querySelector('.jkc-cell[data-id="' + G.selected() + '"]'); if (cell) showDetail(G.selected());
      }
      return;
    }
    var c = e.target.closest && e.target.closest(".jkc-cell");
    if (c) { showDetail(c.getAttribute("data-id")); $("detail").scrollIntoView({ block: "nearest", behavior: "auto" }); }
  });
  document.addEventListener("jkg-change", function () { if (!busy) { updateHud(); renderBook(); } });

  idle(); updateHud(); renderBook();
})();
