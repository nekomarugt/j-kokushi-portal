/* 合格祈願おみくじ（ガチャ画面のおまけ）。1回5コイン・何回でも可。コイン／XPのごほうびなし、ガチャの確率・天井・保存データには一切さわらない。
 * ラッキー分野は、過去問の「分野別」と同じ分野の一覧から選び、?field= でその分野の出題へ飛ぶ（解剖学・生理学は fields.json のid、一般臨床は分野名）。 */
(function () {
  "use strict";
  var G = window.JKGame, $ = function (id) { return document.getElementById(id); };
  if (!G || !$("omi-draw")) return;
  var FORTUNES = [ // k：運勢、w：重み、c：色クラス、m：ひとこと（どれもポジティブ）
    { k: "大吉", w: 10, c: "dai", m: ["今日はぜんぶ追い風。ひと問ひと問、手ごたえがありそう。", "覚えたことが、ふっとつながる日。自信をもっていこう。", "ここまで続けてきた分が、ちゃんと味方になってくれる。"] },
    { k: "中吉", w: 20, c: "chu", m: ["いい調子。ひとつ前の復習から入ると、もっと伸びるよ。", "コツコツの人に、運が寄ってくる日。", "あと一歩のところに、いいことが待っている。"] },
    { k: "小吉", w: 20, c: "sho", m: ["小さな「わかった」を集める日。1問ずつでじゅうぶん。", "ちょっと眠くても大丈夫。短い時間でも前に進める。", "ささやかだけど、たしかな進歩の日。"] },
    { k: "吉", w: 22, c: "kichi", m: ["ふつうの日こそ、合格に近づく日。いつものペースでいこう。", "あわてず、ていねいに。それがいちばんの近道。", "いつもの席、いつもの1問。それがちゃんと力になる。"] },
    { k: "末吉", w: 18, c: "sue", m: ["あとからじわじわ効いてくる日。今の勉強は、本番でごほうびになる。", "ゆっくりでも、止まらなければ前進。", "今日の1問が、あとで「あっ、これ見たことある」に変わる。"] },
    { k: "凶", w: 10, c: "kyo", m: ["今日は基礎に戻る日。足もとを固めると、あとで大きく伸びる。", "まちがいは宝の地図。見直した分だけ、本番で強くなる。", "うまくいかない日は、少し休んでもOK。明日の自分が助かるよ。"] }
  ];
  var FIELDS = [ // 過去問「分野別」と同じ分野（テストで fields.json／questions.json と照合）
    { s: "解剖学", dir: "anatomy", f: [["a1", "人体解剖学概説"], ["a2", "運動器系"], ["a3", "脈管系（循環）"], ["a4", "消化器系"], ["a5", "呼吸器系"], ["a6", "泌尿器系"], ["a7", "生殖器系"], ["a8", "内分泌器系"], ["a9", "感覚器系"], ["a10", "神経系"], ["a11", "体表解剖"]] },
    { s: "生理学", dir: "physiology", f: [["cell", "細胞・体液・酸塩基"], ["muscle", "筋・骨"], ["nerve", "神経（基本機能・中枢）"], ["motor", "運動の調節と反射"], ["blood", "血液・免疫"], ["circ", "循環"], ["resp", "呼吸"], ["dig", "消化・吸収"], ["meta", "栄養・代謝・体温"], ["renal", "腎・尿"], ["endo", "内分泌"], ["repro", "生殖・発生・加齢"], ["sense", "感覚"]] },
    { s: "一般臨床医学", dir: "clinical", f: ["視診・全身／局所所見", "打診・聴診・触診", "消化器", "神経・筋", "膠原病・リウマチ", "感覚・反射／神経診察", "循環器", "血液・造血", "呼吸器", "腎・尿路", "内分泌・代謝", "生命徴候", "医療面接・診察概論", "感染症", "救急・その他", "生体機能検査"].map(function (n) { return [n, n]; }) }
  ];
  var TIPS = [
    "まちがえた問題は、その日のうちにもう一度。", "解説は「なぜ他の選択肢がちがうのか」まで読むと強くなる。", "1回30分より、10分を3回のほうが覚えやすい。",
    "覚えにくい用語は、声に出して言ってみよう。", "寝る前の5分の復習は、いちばん頭に残る。", "分からない問題には印をつけて、あとで見直そう。",
    "表や図は、自分で書き直すと記憶に残る。", "眠いときは、いったん水を飲んで深呼吸。", "同じ分野を続けて解くと、つながりが見えてくる。", "過去問は、解いたあとの「ひとことメモ」が宝になる。"
  ];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COST = G.ECO.OMIKUJI;
  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pick(a) { return a[Math.min(a.length - 1, Math.floor(Math.random() * a.length))]; }
  function draw() {
    var tot = FORTUNES.reduce(function (a, f) { return a + f.w; }, 0), x = Math.random() * tot, fo = FORTUNES[FORTUNES.length - 1];
    for (var i = 0; i < FORTUNES.length; i++) { if (x < FORTUNES[i].w) { fo = FORTUNES[i]; break; } x -= FORTUNES[i].w; }
    var all = []; FIELDS.forEach(function (g) { g.f.forEach(function (f) { all.push({ s: g.s, dir: g.dir, id: f[0], n: f[1] }); }); });
    return { fo: fo, msg: pick(fo.m), field: pick(all), tip: pick(TIPS) };
  }
  function show(r) {
    var href = "../" + r.field.dir + "/?field=" + encodeURIComponent(r.field.id);
    $("omi-result").innerHTML = '<div class="jkc-omicard is-' + r.fo.c + (reduce ? " is-still" : "") + '"><div class="jkc-omi-top"><small>合格祈願</small><b class="jkc-omi-k">' + r.fo.k + '</b></div>' +
      '<p class="jkc-omi-msg">' + esc(r.msg) + '</p>' +
      '<dl class="jkc-omi-dl"><dt>ラッキー分野</dt><dd>' + esc(r.field.s) + '：' + esc(r.field.n) + '</dd><dt>ひとこと勉強メモ</dt><dd>' + esc(r.tip) + '</dd></dl>' +
      '<a class="jkq-primary jkc-omi-go" href="' + href + '">この分野の過去問を解く →</a></div>';
  }
  function hud() {
    var c = G.coins(), b = $("omi-draw"); b.disabled = c < COST;
    var n = $("omi-short"); n.hidden = c >= COST; if (c < COST) n.textContent = "コインが足りません（あと " + (COST - c) + " コイン）。";
  }
  $("omi-draw").addEventListener("click", function () {
    if (!G.spend(COST)) { hud(); return; }
    show(draw()); hud();
    try { $("omi-result").scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); } catch (e) {}
  });
  document.addEventListener("jkg-change", hud);
  hud();
  window.JKOmikuji = { FORTUNES: FORTUNES, FIELDS: FIELDS, TIPS: TIPS, COST: COST };
})();
