/* 10問ミニクエスト／まちがえた問題だけ復習。既存の問題データ（過去問JSON・一問一答JS）をそのまま読み込んで出題。 */
(function () {
  "use strict";
  var G = window.JKGame;
  var ROOT = G.rootUrl;
  var C = G.constants;
  var NAMES = C.SUBJ, PAGES = C.SUBJ_PAGE;
  var PAGE2S = { anatomy: "ana", physiology: "phy", clinical: "cli" };
  var N = 10;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var st = {
    subj: PAGE2S[params.get("s")] || "phy",
    type: params.get("src") === "past" ? "past" : "qa",
    topic: "all",
    queue: [], pos: 0, score: 0, wrong: [], xp: 0, coins: 0, mode: "quest", sel: new Set(), answered: false
  };
  var cache = { past: {}, qa: {} };

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function view(name) {
    ["setup", "loading", "quiz", "result", "error"].forEach(function (v) { $("v-" + v).hidden = v !== name; });
    window.scrollTo(0, 0);
  }

  /* ---- data loading ---- */
  function loadPast(subj) {
    if (cache.past[subj]) return Promise.resolve(cache.past[subj]);
    return fetch(ROOT + PAGES[subj] + "/questions.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var list = d.map(function (q) {
        return { kind: "mc", src: subj, id: subj === "cli" ? q.id : q.exam + "-" + q.number, text: q.question, choices: q.choices, answers: q.answers,
          expl: q.explanation, label: "第" + q.exam + "回 問" + q.number, image: q.image ? ROOT + "clinical/" + q.image.replace(/^\.\//, "") : null };
      });
      cache.past[subj] = list; return list;
    });
  }
  function loadQA(subj) {
    var src = subj + "Q", def = C.QS[src];
    if (cache.qa[subj]) return Promise.resolve(cache.qa[subj]);
    function conv() {
      var list = (window[def.v] || []).map(function (q) { return { kind: "qa", src: src, id: q.id, topic: q.topic, text: q.question, answer: q.answer, why: q.why, label: q.topic }; });
      cache.qa[subj] = list; G.registerBank(src, window[def.v]); return list;
    }
    if (window[def.v]) return Promise.resolve(conv());
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = ROOT + def.dir + "/questions.js";
      s.onload = function () { res(conv()); }; s.onerror = rej; document.head.appendChild(s);
    });
  }

  /* ---- setup ---- */
  function renderSetup() {
    document.querySelectorAll("[data-subj]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.subj === st.subj)); });
    document.querySelectorAll("[data-type]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.type === st.type)); });
    $("topic-wrap").hidden = st.type !== "qa";
    var wc = G.weakCount(st.subj);
    $("weak-btn").hidden = wc === 0;
    $("weak-btn-n").textContent = String(wc);
    $("no-weak").hidden = wc !== 0;
    $("type-note").textContent = st.type === "qa"
      ? "短い問いに答えて、自分で「わかった／まだ」を選びます。やさしめ。"
      : "本番と同じ4択の過去問です。ぴったり10問。";
    if (st.type === "qa") {
      loadQA(st.subj).then(function (list) {
        var sel = $("topic-select"), cur = sel.value, seen = [];
        sel.innerHTML = '<option value="all">ぜんぶ</option>';
        list.forEach(function (q) { if (seen.indexOf(q.topic) < 0) seen.push(q.topic); });
        seen.forEach(function (t) { var o = document.createElement("option"); o.value = t; o.textContent = t; sel.appendChild(o); });
        if (seen.indexOf(cur) >= 0) sel.value = cur; else st.topic = "all";
      }).catch(function () {});
    }
  }
  function start(mode) {
    st.mode = mode; view("loading");
    document.querySelector(".jkq-head h1").textContent = mode === "weak" ? "まちがえた問題の復習" : "10問ミニクエスト";
    var jobs = mode === "weak" ? [loadPast(st.subj), loadQA(st.subj)] : [st.type === "past" ? loadPast(st.subj) : loadQA(st.subj)];
    Promise.all(jobs).then(function (res) {
      var pool;
      if (mode === "weak") {
        var byKey = {};
        res[0].concat(res[1]).forEach(function (q) { byKey[q.src + ":" + q.id] = q; });
        pool = [];
        [st.subj, st.subj + "Q"].forEach(function (src) { G.weakIds(src).forEach(function (id) { var q = byKey[src + ":" + id]; if (q) pool.push(q); }); });
      } else {
        pool = res[0];
        if (st.type === "qa" && st.topic !== "all") pool = pool.filter(function (q) { return q.topic === st.topic; });
      }
      if (!pool.length) { renderSetup(); view("setup"); return; }
      st.queue = shuffle(pool).slice(0, N); st.pos = 0; st.score = 0; st.wrong = []; st.xp = 0; st.coins = 0;
      view("quiz"); renderQ();
    }).catch(function () { view("error"); });
  }

  /* ---- quiz ---- */
  function renderQ() {
    var q = st.queue[st.pos]; st.sel = new Set(); st.answered = false;
    $("prog-n").textContent = String(st.pos + 1); $("prog-t").textContent = String(st.queue.length);
    $("prog-bar").style.width = ((st.pos + 1) / st.queue.length * 100) + "%";
    $("q-label").textContent = (st.mode !== "quest" ? "復習｜" : "") + q.label;
    $("q-text").textContent = q.text;
    var img = $("q-img"); if (q.image) { img.src = q.image; img.hidden = false; } else { img.hidden = true; img.removeAttribute("src"); }
    $("fb").hidden = true; $("fb").className = "jkq-fb";
    var box = $("choices"); box.innerHTML = "";
    $("show-ans").hidden = q.kind !== "qa"; $("submit").hidden = q.kind !== "mc"; $("submit").disabled = true;
    $("multi-note").hidden = !(q.kind === "mc" && q.answers.length > 1);
    if (q.kind === "mc") {
      q.choices.forEach(function (c, i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "jkq-choice"; b.setAttribute("aria-pressed", "false");
        var n = document.createElement("span"); n.className = "jkq-cn"; n.textContent = String(i + 1);
        var t = document.createElement("span"); t.textContent = c; b.appendChild(n); b.appendChild(t);
        b.addEventListener("click", function () { pick(i, b, q.answers.length > 1); });
        box.appendChild(b);
      });
    }
  }
  function pick(i, btn, multi) {
    if (st.answered) return;
    var all = $("choices").children;
    if (!multi) { st.sel = new Set([i]); for (var k = 0; k < all.length; k++) { all[k].classList.remove("is-sel"); all[k].setAttribute("aria-pressed", "false"); } btn.classList.add("is-sel"); btn.setAttribute("aria-pressed", "true"); }
    else if (st.sel.has(i)) { st.sel.delete(i); btn.classList.remove("is-sel"); btn.setAttribute("aria-pressed", "false"); }
    else { st.sel.add(i); btn.classList.add("is-sel"); btn.setAttribute("aria-pressed", "true"); }
    $("submit").disabled = st.sel.size === 0;
  }
  function grade(q, ok) {
    if (ok) st.score++; else st.wrong.push(q);
    var ev = G.record(q.src, q.id, ok);
    if (ev) { st.xp += ev.xp; st.coins += ev.coins || 0; }
  }
  function submit() {
    var q = st.queue[st.pos]; if (st.answered || !st.sel.size) return; st.answered = true;
    var ans = new Set(q.answers), ok = ans.size === st.sel.size && q.answers.every(function (a) { return st.sel.has(a); });
    var bs = $("choices").children;
    for (var i = 0; i < bs.length; i++) { bs[i].disabled = true; bs[i].classList.remove("is-sel"); if (ans.has(i)) bs[i].classList.add("is-ok"); else if (st.sel.has(i)) bs[i].classList.add("is-ng"); }
    $("submit").hidden = true;
    fb(ok, "正解：" + q.answers.map(function (a) { return (a + 1) + "．" + q.choices[a]; }).join("／"), q.expl || "");
    $("fb-btns").hidden = true; $("next").hidden = false; $("next").textContent = st.pos === st.queue.length - 1 ? "結果を見る" : "次の問題へ";
    grade(q, ok); $("next").focus({ preventScroll: true });
  }
  function fb(ok, a, w) {
    var f = $("fb"); f.hidden = false; f.className = "jkq-fb " + (ok === null ? "" : ok ? "is-ok" : "is-ng");
    $("fb-title").textContent = ok === null ? "答え" : ok ? "✓ 正解" : "× 不正解";
    $("fb-ans").textContent = a; $("fb-why").textContent = w; $("fb-why-wrap").hidden = !w;
  }
  function showAns() {
    var q = st.queue[st.pos]; st.answered = true; $("show-ans").hidden = true;
    fb(null, q.answer, q.why); $("fb-btns").hidden = false; $("next").hidden = true;
    $("know").focus({ preventScroll: true });
  }
  function selfGrade(ok) { var q = st.queue[st.pos]; grade(q, ok); advance(); }
  function advance() {
    if (st.pos < st.queue.length - 1) { st.pos++; renderQ(); window.scrollTo(0, 0); } else result();
  }

  /* ---- result ---- */
  function result() {
    var total = st.queue.length, pct = Math.round(st.score / total * 100);
    var bonus = st.mode === "quest" ? G.questDone(total, st.score) : null;
    if (bonus) { st.xp += bonus.xp; st.coins += bonus.coins || 0; }
    $("r-score").textContent = st.score + " / " + total;
    $("r-ring").style.setProperty("--p", pct + "%"); $("r-pct").textContent = pct + "%";
    var msg = pct === 100 ? "全問正解！ すごい！" : pct >= 80 ? "いい調子！ あと少しで満点。" : pct >= 50 ? "半分以上できた。まちがえた所は、次で取り返そう。" : "ここからが伸びどき。まちがえた問題は「復習リスト」に入れたよ。";
    if (st.mode !== "quest") msg = st.wrong.length ? "あと " + st.wrong.length + " 問。2回つづけて正解すると、リストから外れます。" : "全部できた！ 2回つづけて正解した問題はリストから外れます。";
    $("r-msg").textContent = msg;
    var s = G.streak(), li = G.level();
    $("r-xp").textContent = "+" + st.xp + " XP";
    $("r-coin").textContent = "+" + st.coins + " コイン（いま " + G.coins() + "）";
    $("r-streak").textContent = s.n ? s.n + "日連続" : "—";
    $("r-lv").textContent = "Lv" + li.lv + " " + li.title;
    $("r-bar").style.width = li.pct + "%";
    $("r-wrong").hidden = !st.wrong.length;
    $("r-wrong").textContent = "まちがえた問題だけ（" + st.wrong.length + "問）";
    $("r-again").textContent = st.mode === "quest" ? "もう一回（新しい10問）" : "もう一回（復習リスト）";
    var wc = G.weakCount(st.subj);
    $("r-weaknote").textContent = wc ? "復習リスト：いま " + wc + " 問" : "復習リスト：からっぽ。えらい！";
    view("result");
  }

  /* ---- wire ---- */
  document.querySelectorAll("[data-subj]").forEach(function (b) { b.addEventListener("click", function () { st.subj = b.dataset.subj; st.topic = "all"; $("topic-select").value = "all"; renderSetup(); }); });
  document.querySelectorAll("[data-type]").forEach(function (b) { b.addEventListener("click", function () { st.type = b.dataset.type; renderSetup(); }); });
  $("topic-select").addEventListener("change", function () { st.topic = this.value; });
  $("start-btn").addEventListener("click", function () { start("quest"); });
  $("weak-btn").addEventListener("click", function () { start("weak"); });
  $("submit").addEventListener("click", submit);
  $("show-ans").addEventListener("click", showAns);
  $("know").addEventListener("click", function () { selfGrade(true); });
  $("unsure").addEventListener("click", function () { selfGrade(false); });
  $("next").addEventListener("click", advance);
  $("quit").addEventListener("click", function () { document.querySelector(".jkq-head h1").textContent = "10問ミニクエスト"; renderSetup(); view("setup"); });
  $("r-again").addEventListener("click", function () { start(st.mode === "quest" ? "quest" : "weak"); });
  $("r-wrong").addEventListener("click", function () {
    st.queue = shuffle(st.wrong); st.pos = 0; st.score = 0; st.wrong = []; st.xp = 0; st.coins = 0; st.mode = "weak-round"; view("quiz"); renderQ();
  });
  $("r-back").addEventListener("click", function () { document.querySelector(".jkq-head h1").textContent = "10問ミニクエスト"; renderSetup(); view("setup"); });
  $("retry-error").addEventListener("click", function () { renderSetup(); view("setup"); });

  renderSetup(); view("setup");
})();
