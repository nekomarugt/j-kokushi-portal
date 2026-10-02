/* 出題範囲マップ（学習者向け）。データ: data.js（JKMap）。ガイド・過去問ページへのリンクだけを持つ静的ページ */
(function () {
  "use strict";
  var D = window.JKMap || {};
  var SUBJ = ["anatomy", "physiology", "clinical"];
  var subj = SUBJ.indexOf(location.hash.replace("#", "")) >= 0 ? location.hash.replace("#", "") : "anatomy";
  var sortFreq = false, openState = {};
  var body = document.getElementById("mapBody");
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function model() {
    var d = D[subj];
    var list = d.majors.map(function (m) {
      return { m: m, rows: m.rows.slice(), nfreq: m.rows.filter(function (r) { return r.f; }).length };
    });
    if (sortFreq) {
      list.forEach(function (c) { c.rows.sort(function (a, b) { return b.q - a.q; }); });
      list.sort(function (a, b) { return b.m.nq - a.m.nq; });
    }
    return list;
  }
  function syncAll() {
    var all = document.querySelectorAll(".map-major"), n = document.querySelectorAll(".map-major.is-open").length;
    var oa = document.getElementById("mapOpenAll");
    oa.setAttribute("aria-pressed", String(all.length > 0 && n === all.length));
    oa.textContent = all.length > 0 && n === all.length ? "すべて閉じる" : "すべて開く";
  }
  function setOpen(art, open) {
    var hd = art.querySelector(".map-head"), bd = art.querySelector(".map-rows");
    bd.hidden = !open; art.classList.toggle("is-open", open); hd.setAttribute("aria-expanded", String(open));
    openState[subj + ":" + art.getAttribute("data-id")] = open;
    syncAll();
  }
  function render() {
    var d = D[subj];
    document.querySelectorAll("[data-subj]").forEach(function (b) { var on = b.getAttribute("data-subj") === subj; b.setAttribute("aria-selected", String(on)); });
    document.getElementById("mapSort").setAttribute("aria-pressed", String(sortFreq));
    document.getElementById("mapSort").textContent = sortFreq ? "もとの順にもどす" : "頻出順に並べる";
    document.getElementById("mapNote").textContent = d.note;
    body.replaceChildren();
    model().forEach(function (c) {
      var art = h("article", "map-major"); art.setAttribute("data-id", c.m.id);
      var hd = h("button", "map-head"); hd.type = "button"; hd.setAttribute("aria-expanded", "false");
      var t = h("span", "map-title"); if (d.std) t.appendChild(h("span", "map-no", c.m.id)); t.appendChild(document.createTextNode(c.m.name)); hd.appendChild(t);
      var bs = h("span", "map-badges");
      if (c.nfreq) bs.appendChild(h("span", "badge-freq", "頻出" + c.nfreq + "か所"));
      bs.appendChild(h("span", "badge-n", "出題" + c.m.nq + "問"));
      hd.appendChild(bs); hd.appendChild(h("span", "map-chev")); hd.lastChild.setAttribute("aria-hidden", "true");
      art.appendChild(hd);
      var bd = h("div", "map-rows"); bd.hidden = true;
      c.rows.forEach(function (r) {
        var row = h("div", "map-row");
        var top = h("div", "map-rowtop");
        top.appendChild(h("strong", "map-name", r.n));
        var b2 = h("span", "map-badges");
        if (r.f) b2.appendChild(h("span", "badge-freq", "頻出"));
        b2.appendChild(h("span", r.q ? "badge-n" : "badge-n0", "過去問" + r.q + "問"));
        top.appendChild(b2); row.appendChild(top);
        if (r.t) row.appendChild(h("p", "map-pt", "よく出る所：" + r.t));
        var act = h("div", "map-act");
        var a1 = h("a", "map-btn", "資料を読む"); a1.href = r.r; act.appendChild(a1);
        if (r.s) { var a2 = h("a", "map-btn map-btn2", "過去問を解く"); a2.href = r.s; act.appendChild(a2); }
        else act.appendChild(h("span", "map-none", "この項目の過去問はまだありません"));
        row.appendChild(act); bd.appendChild(row);
      });
      art.appendChild(bd);
      hd.addEventListener("click", function () { setOpen(art, bd.hidden); });
      body.appendChild(art);
      if (openState[subj + ":" + c.m.id]) setOpen(art, true);
    });
    syncAll();
  }
  document.querySelectorAll("[data-subj]").forEach(function (b) { b.addEventListener("click", function () { subj = b.getAttribute("data-subj"); history.replaceState(null, "", "#" + subj); render(); }); });
  document.getElementById("mapSort").addEventListener("click", function () { sortFreq = !sortFreq; render(); });
  document.getElementById("mapOpenAll").addEventListener("click", function () {
    var arts = [].slice.call(document.querySelectorAll(".map-major")), allOpen = arts.every(function (a) { return a.classList.contains("is-open"); });
    arts.forEach(function (a) { setOpen(a, !allOpen); });
  });
  window.addEventListener("hashchange", function () { var s = location.hash.replace("#", ""); if (SUBJ.indexOf(s) >= 0 && s !== subj) { subj = s; render(); } });
  render();
})();
