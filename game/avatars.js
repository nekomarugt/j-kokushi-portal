/* 柔整国試ポータル：ごほうびアバター（ぷにっ子）30体。すべて自作のインラインSVG（外部画像なし）。
 * コンセプト：まんまるでぷにっとした、ちいさな「ぷにっ子」たち。動物・食べ物・お天気・ちびナイト・幻獣。
 * ID（n01…/r01…/s01…）は保存データに使うので、変更しないこと。 */
(function () {
  "use strict";
  var K = "#3a2f4d", uid = 0;
  function mix(a, b, t) {
    function p(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
    var x = p(a), y = p(b);
    return "#" + x.map(function (v, i) { var n = Math.round(v + (y[i] - v) * t).toString(16); return n.length < 2 ? "0" + n : n; }).join("");
  }
  function O(fn, fill, w) { return fn(' fill="' + K + '" stroke="' + K + '" stroke-width="' + (w || 5) + '" stroke-linejoin="round" stroke-linecap="round"') + fn(' fill="' + fill + '"'); }
  function ln(a, c, w) { return '<path d="' + a + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"/>'; }
  function sp(x, y, s, fill, cls, delay) { // 4-point sparkle
    return '<path class="' + (cls || "") + '" style="animation-delay:' + (delay || 0) + 's" d="M' + x + " " + (y - s) + "Q" + x + " " + y + " " + (x + s) + " " + y + "Q" + x + " " + y + " " + x + " " + (y + s) + "Q" + x + " " + y + " " + (x - s) + " " + y + "Q" + x + " " + y + " " + x + " " + (y - s) + 'Z" fill="' + fill + '"/>';
  }
  function star(cx, cy, R, r) {
    var pts = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; pts.push((cx + q * Math.cos(a)).toFixed(1) + "," + (cy + q * Math.sin(a)).toFixed(1)); }
    return pts.join(" ");
  }

  /* ---- からだ ---- */
  var SH = {
    round: function (a) { return '<ellipse cx="50" cy="60" rx="31" ry="28"' + a + "/>"; },
    egg: function (a) { return '<ellipse cx="50" cy="58" rx="26" ry="31"' + a + "/>"; },
    mochi: function (a) { return '<ellipse cx="50" cy="64" rx="35" ry="24"' + a + "/>"; },
    drop: function (a) { return '<path d="M50 24C58 38 78 48 78 66C78 80 66 88 50 88C34 88 22 80 22 66C22 48 42 38 50 24Z"' + a + "/>"; },
    onigiri: function (a) { return '<path d="M50 26C56 26 60 30 66 40L80 68C85 79 78 88 68 88L32 88C22 88 15 79 20 68L34 40C40 30 44 26 50 26Z"' + a + "/>"; },
    cloud: function (a) { return "<g" + a + '><circle cx="33" cy="62" r="20"/><circle cx="67" cy="62" r="20"/><circle cx="50" cy="50" r="22"/><rect x="33" y="62" width="34" height="20"/></g>'; },
    star: function (a) { return '<polygon points="' + star(50, 56, 40, 25) + '"' + a + "/>"; },
    square: function (a) { return '<rect x="22" y="26" width="56" height="62" rx="18"' + a + "/>"; },
    stem: function (a) { return '<rect x="30" y="50" width="40" height="38" rx="14"' + a + "/>"; }
  };
  var TOP = { round: 32, egg: 27, mochi: 40, drop: 26, onigiri: 26, cloud: 28, star: 18, square: 26, stem: 50 };
  var FY = { round: 0, egg: 0, mochi: 4, drop: 8, onigiri: 8, cloud: 2, star: 2, square: 2, stem: 10 };
  var BELLY = { round: 19, egg: 16, mochi: 22, drop: 18 };

  /* ---- 後ろのパーツ（耳・しっぽ・はね・マント） ---- */
  var BK = {
    cat: function (p) { return O(function (a) { return '<polygon points="22,46 24,18 47,33"' + a + '/><polygon points="78,46 76,18 53,33"' + a + "/>"; }, p[0]) + '<polygon points="27,39 28,27 39,33" fill="' + p[2] + '"/><polygon points="73,39 72,27 61,33" fill="' + p[2] + '"/>'; },
    bear: function (p) { return O(function (a) { return '<circle cx="27" cy="36" r="11"' + a + '/><circle cx="73" cy="36" r="11"' + a + "/>"; }, p[0]) + '<circle cx="27" cy="36" r="5" fill="' + p[2] + '"/><circle cx="73" cy="36" r="5" fill="' + p[2] + '"/>'; },
    bunny: function (p) { return O(function (a) { return '<ellipse cx="35" cy="22" rx="8" ry="20" transform="rotate(-10 35 30)"' + a + '/><ellipse cx="65" cy="22" rx="8" ry="20" transform="rotate(10 65 30)"' + a + "/>"; }, p[0]) + '<ellipse cx="35" cy="23" rx="4" ry="13" transform="rotate(-10 35 30)" fill="' + p[2] + '"/><ellipse cx="65" cy="23" rx="4" ry="13" transform="rotate(10 65 30)" fill="' + p[2] + '"/>'; },
    fox: function (p) { return O(function (a) { return '<polygon points="20,50 20,12 48,34"' + a + '/><polygon points="80,50 80,12 52,34"' + a + "/>"; }, p[0]) + '<polygon points="24,42 24,24 38,34" fill="' + p[1] + '"/><polygon points="76,42 76,24 62,34" fill="' + p[1] + '"/>'; },
    dog: function (p) { return O(function (a) { return '<ellipse cx="20" cy="50" rx="9" ry="17" transform="rotate(18 20 50)"' + a + '/><ellipse cx="80" cy="50" rx="9" ry="17" transform="rotate(-18 80 50)"' + a + "/>"; }, p[2]); },
    frog: function (p) { return O(function (a) { return '<circle cx="33" cy="36" r="11"' + a + '/><circle cx="67" cy="36" r="11"' + a + "/>"; }, p[0]); },
    round: function (p) { return O(function (a) { return '<circle cx="28" cy="38" r="9"' + a + '/><circle cx="72" cy="38" r="9"' + a + "/>"; }, p[3]) + '<circle cx="28" cy="38" r="4" fill="' + p[2] + '"/><circle cx="72" cy="38" r="4" fill="' + p[2] + '"/>'; },
    horn: function (p) { return O(function (a) { return '<polygon points="30,38 32,14 45,33"' + a + '/><polygon points="70,38 68,14 55,33"' + a + "/>"; }, p[2], 4); },
    owl: function (p) { return O(function (a) { return '<polygon points="26,42 28,14 47,32"' + a + '/><polygon points="74,42 72,14 53,32"' + a + "/>"; }, p[3]); },
    flip: function (p) { return O(function (a) { return '<ellipse cx="17" cy="66" rx="7" ry="15" transform="rotate(20 17 66)"' + a + '/><ellipse cx="83" cy="66" rx="7" ry="15" transform="rotate(-20 83 66)"' + a + "/>"; }, p[3]); },
    wingS: function (p) { return O(function (a) { return '<ellipse cx="19" cy="64" rx="8" ry="12" transform="rotate(25 19 64)"' + a + '/><ellipse cx="81" cy="64" rx="8" ry="12" transform="rotate(-25 81 64)"' + a + "/>"; }, mix(p[0], "#ffffff", .2)); },
    wing: function (p) { return O(function (a) { return '<path d="M26 64C8 60 2 40 6 24C20 28 32 40 34 54Z"' + a + '/><path d="M74 64C92 60 98 40 94 24C80 28 68 40 66 54Z"' + a + "/>"; }, p[1]) + ln("M12 34Q22 40 28 52", p[2], 2) + ln("M88 34Q78 40 72 52", p[2], 2); },
    fwing: function (p) { return O(function (a) { return '<path d="M28 66C6 66-2 44 2 22C18 26 32 40 34 56Z"' + a + '/><path d="M72 66C94 66 102 44 98 22C82 26 68 40 66 56Z"' + a + "/>"; }, p[3]) + '<path d="M26 62C12 60 6 46 8 34C18 38 28 46 30 56Z" fill="' + p[2] + '"/><path d="M74 62C88 60 94 46 92 34C82 38 72 46 70 56Z" fill="' + p[2] + '"/>'; },
    tfluff: function (p) { return O(function (a) { return '<circle cx="83" cy="72" r="11"' + a + "/>"; }, p[1]); },
    tfox: function (p) { return O(function (a) { return '<ellipse cx="82" cy="68" rx="10" ry="19" transform="rotate(30 82 68)"' + a + "/>"; }, p[0]) + '<ellipse cx="91" cy="55" rx="5" ry="6" transform="rotate(30 91 55)" fill="' + p[1] + '"/>'; },
    tflame: function (p) { return O(function (a) { return '<path d="M74 84C98 80 102 58 90 34C88 50 80 52 82 64C76 58 70 66 74 84Z"' + a + "/>"; }, p[2]) + '<path d="M80 80C92 76 94 62 90 52C88 60 84 62 84 68C80 66 78 72 80 80Z" fill="' + p[3] + '"/>'; },
    tdrag: function (p) { return O(function (a) { return '<path d="M72 80C92 84 100 72 94 56L86 66L88 52L78 64Z"' + a + "/>"; }, p[0]) + '<path d="M91 60L86 66L88 55Z" fill="' + p[2] + '"/>'; },
    tcurl: function (p) { return ln("M78 78Q96 78 90 60", K, 9) + ln("M78 78Q96 78 90 60", p[0], 5.5); },
    train: function (p) { var c = ["#ff7aa8", "#ffc857", "#7ad7f0", "#b28cff"]; return c.map(function (k, i) { return ln("M76 " + (76 + i * 0) + "Q" + (98 - i * 3) + " " + (78 - i * 3) + " " + (92 - i * 3) + " " + (52 + i * 5), K, 9 - i * 0) + ""; }).join("") + c.map(function (k, i) { return ln("M76 76Q" + (98 - i * 3) + " " + (78 - i * 3) + " " + (92 - i * 3) + " " + (52 + i * 5), k, 5); }).join(""); },
    mane: function () { var c = ["#ff7aa8", "#ffc857", "#7ad7f0", "#b28cff"]; return c.map(function (k, i) { return ln("M38 " + (30 + i * 2) + "Q" + (10 + i * 3) + " " + (38 + i * 4) + " " + (16 + i * 4) + " " + (72 + i * 2), K, 9); }).join("") + c.map(function (k, i) { return ln("M38 " + (30 + i * 2) + "Q" + (10 + i * 3) + " " + (38 + i * 4) + " " + (16 + i * 4) + " " + (72 + i * 2), k, 5); }).join(""); },
    cape: function (p) { return O(function (a) { return '<path d="M24 54L76 54L90 94L10 94Z"' + a + "/>"; }, p[2]); }
  };

  /* ---- からだの模様（からだの形でクリップ） ---- */
  var CL = {
    grid: function (p) { return ln("M20 44L66 96M36 34L82 86M56 30L92 70M8 60L40 96", p[2], 1.6).replace("<path", '<path opacity=".55"') + ln("M84 44L36 96M68 34L18 86M46 30L10 70M96 60L60 96", p[2], 1.6).replace("<path", '<path opacity=".55"'); },
    stripe: function (p) { return ln("M14 52L30 56M14 64L28 66M86 52L70 56M86 64L72 66M44 30L46 42M56 30L54 42", p[3], 4.5); },
    scallop: function (p) { var s = ""; [64, 73, 82].forEach(function (y, r) { for (var x = 30 + (r % 2) * 5; x < 72; x += 10) s += "M" + x + " " + y + "q5 6 10 0"; }); return ln(s, p[3], 1.7).replace("<path", '<path opacity=".55"'); },
    nori: function () { return '<rect x="26" y="70" width="48" height="24" fill="#2c4a3b"/><rect x="26" y="70" width="48" height="3" fill="#3f6b55"/>'; },
    powder: function () { return [[34, 44, 2], [60, 40, 1.6], [70, 56, 2.2], [28, 62, 1.6], [46, 34, 1.4], [66, 76, 1.8], [36, 80, 1.6]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#fff" opacity=".85"/>'; }).join(""); },
    ridge: function (p) { return ln("M35 38Q24 64 37 92M65 38Q76 64 63 92M50 36Q44 64 50 92", p[2], 2.2); },
    stars: function () { return sp(34, 46, 3.6, "#fff", "", 0) + sp(66, 74, 3.2, "#fff") + sp(72, 44, 2.4, "#fff") + sp(28, 76, 2.4, "#fff"); }
  };
  /* ---- 顔の前に描くもの（マスクなど） ---- */
  var PRE = {
    mask: function (p) { return '<ellipse cx="36" cy="59" rx="9" ry="7" transform="rotate(-22 36 59)" fill="' + p[3] + '"/><ellipse cx="64" cy="59" rx="9" ry="7" transform="rotate(22 64 59)" fill="' + p[3] + '"/>'; },
    shine: function () { return '<ellipse cx="38" cy="48" rx="6" ry="3.4" transform="rotate(-30 38 48)" fill="#fff" opacity=".8"/>'; }
  };
  /* ---- 頭のうえ（丸い頭のてっぺん y=32 基準。形に合わせて自動で上下） ---- */
  var HD = {
    sprout: function (p) { return ln("M50 33Q50 27 50 22", K, 2.6) + '<ellipse cx="43" cy="19" rx="7" ry="4" transform="rotate(-25 43 19)" fill="' + p[2] + '" stroke="' + K + '" stroke-width="1.8"/><ellipse cx="57" cy="19" rx="7" ry="4" transform="rotate(25 57 19)" fill="' + p[2] + '" stroke="' + K + '" stroke-width="1.8"/>'; },
    leaf: function () { return '<ellipse cx="50" cy="27" rx="10" ry="5" transform="rotate(-18 50 27)" fill="#7bd88f" stroke="' + K + '" stroke-width="1.8"/>' + ln("M42 30L57 24", K, 1.2); },
    tuft: function (p) { return ln("M46 33Q44 24 40 22M50 33Q50 22 50 19M54 33Q56 24 60 22", p[3], 3.2); },
    acorn: function (p) { return '<rect x="47" y="21" width="6" height="8" rx="2" fill="' + p[3] + '" stroke="' + K + '" stroke-width="1.8"/><path d="M27 42C27 26 73 26 73 42Z" fill="' + p[3] + '" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/>' + ln("M33 36L38 41M44 33L48 41M56 33L52 41M67 36L62 41", K, 1.2).replace("<path", '<path opacity=".5"'); },
    ribbon: function (p) { return '<g fill="' + p[2] + '" stroke="' + K + '" stroke-width="1.8" stroke-linejoin="round"><polygon points="70,36 57,28 57,44"/><polygon points="70,36 83,28 83,44"/><circle cx="70" cy="36" r="4.5"/></g>'; },
    crown: function () { return '<polygon points="33,38 35,17 43,27 50,12 57,27 65,17 67,38" fill="#ffd84a" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/><circle cx="50" cy="30" r="3" fill="#ff5c8a"/><circle cx="40" cy="33" r="2" fill="#5cc8ff"/><circle cx="60" cy="33" r="2" fill="#5cc8ff"/>'; },
    wizard: function (p) { return '<polygon points="33,38 54,-2 68,38" fill="' + p[3] + '" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="50" cy="38" rx="25" ry="6" fill="' + p[3] + '" stroke="' + K + '" stroke-width="2.4"/><path d="M38 33Q52 38 64 31L65 36Q52 41 37 38Z" fill="' + p[2] + '"/>' + sp(54, 16, 5, "#ffe27a", "jka-tw") + sp(45, 27, 2.6, "#fff"); },
    helmet: function (p) { return '<path d="M52 24C47 6 65 2 71 10C63 10 60 16 58 25Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><path d="M26 48C26 20 74 20 74 48Z" fill="#d5deec" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/><rect x="47.5" y="46" width="5" height="11" rx="2" fill="#d5deec" stroke="' + K + '" stroke-width="2"/>' + ln("M34 32Q38 26 46 25", "#fff", 2.4); },
    flower: function () { var s = ""; for (var i = 0; i < 5; i++) { var a = i * 72 * Math.PI / 180; s += '<circle cx="' + (70 + 5.5 * Math.sin(a)).toFixed(1) + '" cy="' + (36 - 5.5 * Math.cos(a)).toFixed(1) + '" r="4.6" fill="#ffb3cb" stroke="' + K + '" stroke-width="1.3"/>'; } return s + '<circle cx="70" cy="36" r="3.2" fill="#ffe27a" stroke="' + K + '" stroke-width="1.2"/>'; },
    halo: function () { return '<ellipse cx="50" cy="20" rx="15" ry="5" fill="none" stroke="' + K + '" stroke-width="5.4"/><ellipse cx="50" cy="20" rx="15" ry="5" fill="none" stroke="#ffd84a" stroke-width="3"/>'; },
    flame: function (p) { return '<path d="M50 35C40 29 45 20 50 8C55 20 60 29 50 35Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><path d="M50 34C46 30 48 25 50 19C52 25 54 30 50 34Z" fill="' + p[1] + '"/><path d="M38 36C33 31 36 26 38 20C41 26 44 31 38 36Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M62 36C57 31 60 26 62 20C65 26 67 31 62 36Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/>'; },
    phoenix: function (p) { return '<path d="M50 36C40 28 44 16 50 2C56 16 60 28 50 36Z" fill="' + p[1] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><path d="M36 38C26 32 26 20 30 10C36 18 44 26 42 36Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><path d="M64 38C74 32 74 20 70 10C64 18 56 26 58 36Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' + sp(50, 22, 3, "#fff", "jka-tw"); },
    icecrown: function () { return '<g fill="#e4f7ff" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"><polygon points="35,38 39,18 46,36"/><polygon points="44,36 50,8 56,36"/><polygon points="54,36 61,18 65,38"/></g><path d="M35 37L65 37" stroke="#7cc4ee" stroke-width="3"/>' + sp(50, 24, 3, "#fff", "jka-tw"); },
    band: function (p) { return '<path d="M27 47Q50 38 73 47L73 53Q50 44 27 53Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><polygon points="52,37 43,50 50,49 46,60 58,46 51,46" fill="#fff27a" stroke="' + K + '" stroke-width="1.5" stroke-linejoin="round"/>'; },
    star: function () { return '<polygon points="' + star(50, 22, 10, 4.6) + '" fill="#ffe14a" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>'; },
    unihorn: function () { return '<polygon points="44,32 51,-4 56,32" fill="#ffe27a" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/>' + ln("M46 24L55 21M47 16L54 13M48 8L53 6", "#fff", 1.8) + sp(62, 10, 4, "#fff", "jka-tw"); },
    shell: function () { return '<path d="M27 52C27 28 73 28 73 52L67 45L61 53L55 45L50 53L45 45L39 53L33 45Z" fill="#fffdf6" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/>'; },
    pstem: function () { return ln("M50 34Q51 26 58 23", K, 6.5) + ln("M50 34Q51 26 58 23", "#5aa85a", 3.6) + '<ellipse cx="44" cy="26" rx="7" ry="4" transform="rotate(20 44 26)" fill="#7bd88f" stroke="' + K + '" stroke-width="1.8"/>'; },
    bolt: function () { return '<polygon points="55,10 42,28 50,28 45,42 62,22 53,22" fill="#ffe14a" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>'; }
  };
  /* ---- からだの前（首もと・腕など） ---- */
  var FR = {
    bell: function (p) { return ln("M32 74Q50 84 68 74", K, 6.5) + ln("M32 74Q50 84 68 74", p[2], 3.6) + '<circle cx="50" cy="82" r="4.6" fill="#ffd84a" stroke="' + K + '" stroke-width="1.6"/>'; },
    scarf: function (p) { return '<path d="M27 73Q50 85 73 73L73 82Q50 94 27 82Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/><polygon points="61,84 72,82 71,97 60,95" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>'; },
    ume: function () { return '<circle cx="50" cy="42" r="5.5" fill="#d6304a" stroke="' + K + '" stroke-width="1.6"/>'; },
    pearl: function () { return '<circle cx="50" cy="43" r="4.4" fill="#fff" stroke="' + K + '" stroke-width="1.6"/><circle cx="48.6" cy="41.6" r="1.3" fill="#ffc6e0"/>'; },
    shield: function (p) { return '<path d="M14 66L36 66L36 79Q25 94 14 79Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2.2" stroke-linejoin="round"/>' + ln("M25 69L25 84M18 74L32 74", "#fff", 2.4); },
    brows: function (p) { return '<circle cx="38" cy="49" r="2" fill="' + p[3] + '"/><circle cx="62" cy="49" r="2" fill="' + p[3] + '"/>'; },
    mcap: function (p) { return '<path d="M11 58C11 30 30 21 50 21C70 21 89 30 89 58Z" fill="' + p[2] + '" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/><circle cx="30" cy="42" r="6" fill="#fff"/><circle cx="55" cy="33" r="5" fill="#fff"/><circle cx="72" cy="47" r="7" fill="#fff"/><circle cx="46" cy="51" r="3.4" fill="#fff"/>'; },
    sakuraleaf: function () { return '<path d="M26 84Q50 70 74 84Q62 94 50 94Q38 94 26 84Z" fill="#7bd88f" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' + ln("M34 84Q50 80 66 84", "#4fa863", 1.6); },
    spark: function () { return sp(20, 30, 5, "#fff", "jka-tw", .2) + sp(82, 36, 4, "#fff", "jka-tw", .6); }
  };

  /* ---- 顔 ---- */
  function eye(t, x, y, side) {
    var hl = function (dx, dy, r) { return '<circle cx="' + (x + dx) + '" cy="' + (y + dy) + '" r="' + r + '" fill="#fff"/>'; };
    if (t === "sparkle") return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.8" ry="5.8" fill="' + K + '"/>' + hl(1.5, -2, 1.9) + hl(-1.5, 2, 1);
    if (t === "happy") return ln("M" + (x - 4.5) + " " + (y + 2) + "Q" + x + " " + (y - 5) + " " + (x + 4.5) + " " + (y + 2), K, 2.6);
    if (t === "sleepy") return ln("M" + (x - 4.5) + " " + (y - 1) + "Q" + x + " " + (y + 4) + " " + (x + 4.5) + " " + (y - 1), K, 2.6);
    if (t === "owl") return '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#fff" stroke="' + K + '" stroke-width="2.2"/><circle cx="' + x + '" cy="' + y + '" r="3.6" fill="' + K + '"/>' + hl(1, -1.2, 1.2);
    if (t === "wink" && side > 0) return ln("M" + (x - 4.5) + " " + (y + 2) + "Q" + x + " " + (y - 5) + " " + (x + 4.5) + " " + (y + 2), K, 2.6);
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="3.5" ry="4.5" fill="' + K + '"/>' + hl(1.1, -1.5, 1.3);
  }
  function mouth(t, y) {
    if (t === "cat") return ln("M44 " + y + "Q47 " + (y + 4) + " 50 " + y + "Q53 " + (y + 4) + " 56 " + y, K, 2.2);
    if (t === "open") return '<path d="M45 ' + (y - 1) + "Q50 " + (y + 10) + " 55 " + (y - 1) + 'Z" fill="' + K + '" stroke="' + K + '" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="50" cy="' + (y + 4.2) + '" rx="2.6" ry="1.8" fill="#ff8fa8"/>';
    if (t === "grin") return '<path d="M41 ' + (y - 1) + "Q50 " + (y + 9) + " 59 " + (y - 1) + 'Z" fill="' + K + '" stroke="' + K + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M44 ' + (y + 1) + "Q50 " + (y + 3) + " 56 " + (y + 1) + '" stroke="#fff" stroke-width="1.6" fill="none"/>';
    if (t === "beak") return '<path d="M44 ' + (y - 3) + "L56 " + (y - 3) + "L50 " + (y + 4) + 'Z" fill="#ff9f1c" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/>';
    if (t === "dot") return '<ellipse cx="50" cy="' + y + '" rx="2" ry="1.6" fill="' + K + '"/>';
    return ln("M45 " + y + "Q50 " + (y + 5) + " 55 " + y, K, 2.4);
  }

  /* ---- 30体 ---- */
  // p = [からだ, おなか/明るい色, アクセント, こい色]
  var D = [
    // ノーマル（20）
    { id: "n01", n: "もちねこ", r: "N", f: "ふわふわでゴロゴロ。おひるねが大すき。", s: "mochi", p: ["#fdf6ee", "#ffffff", "#ffb7c5", "#f0c060"], bk: ["cat"], ey: "dot", mo: "cat", fr: ["bell"] },
    { id: "n02", n: "くりまる", r: "N", f: "どんぐり帽子がじまん。ころころ転がる。", s: "round", p: ["#b8804f", "#f1d3a8", "#e58f8f", "#8a5a34"], bk: ["bear"], hd: ["acorn"], ey: "dot", mo: "smile" },
    { id: "n03", n: "みずたま", r: "N", f: "雨あがりに生まれた、ぷるぷるのしずく。", s: "drop", p: ["#6cc4f5", "#c8ecff", "#3d8fd6", "#2f6fb0"], pre: ["shine"], ey: "sparkle", mo: "open" },
    { id: "n04", n: "うさだんご", r: "N", f: "おつきみの夜にだけ、ぴょこっと出てくる。", s: "egg", p: ["#ffc9dd", "#fff0f5", "#ff8fb4", "#d9648f"], bk: ["bunny", "tfluff"], hd: ["ribbon"], ey: "happy", mo: "smile" },
    { id: "n05", n: "まめしば", r: "N", f: "しっぽをぶんぶん。さんぽの時間をまってる。", s: "round", p: ["#e8a860", "#fff1d6", "#c98a48", "#7a4a26"], bk: ["dog", "tcurl"], fr: ["brows"], ey: "dot", mo: "open" },
    { id: "n06", n: "ぽんたぬ", r: "N", f: "葉っぱを頭にのせて、すましてる。", s: "round", p: ["#a08468", "#efe0c8", "#e3a48f", "#6f523d"], bk: ["round", "tfluff"], pre: ["mask"], hd: ["leaf"], ey: "dot", mo: "smile" },
    { id: "n07", n: "ぴよまる", r: "N", f: "ちいさなはねで、せいいっぱいはばたく。", s: "round", p: ["#ffe066", "#fff4b8", "#ffb84d", "#f0a020"], bk: ["wingS"], hd: ["tuft"], ey: "dot", mo: "beak" },
    { id: "n08", n: "かえるっち", r: "N", f: "雨の日はごきげん。ジャンプが得意。", s: "mochi", p: ["#8bd66b", "#e6f8c8", "#ff9db1", "#4f9a3a"], bk: ["frog"], ey: "dot", mo: "grin" },
    { id: "n09", n: "ぺんぺん", r: "N", f: "赤いマフラーは手あみ。お腹でスーッとすべる。", s: "egg", p: ["#46648e", "#ffffff", "#e5533d", "#2f4266"], bk: ["flip"], ey: "dot", mo: "beak", fr: ["scarf"] },
    { id: "n10", n: "くもわた", r: "N", f: "そよ風にのって、ぷかぷかお散歩。", s: "cloud", p: ["#f6faff", "#ffffff", "#9fd0ff", "#b6c8e0"], ey: "sleepy", mo: "smile" },
    { id: "n11", n: "おにぎりん", r: "N", f: "ほかほか。中には梅ぼしがひそんでる。", s: "onigiri", p: ["#ffffff", "#ffffff", "#e5533d", "#9aa8bd"], cl: ["nori"], fr: ["ume"], ey: "dot", mo: "smile" },
    { id: "n12", n: "だいふくん", r: "N", f: "白い粉をまとった、もちもちのやさしい子。", s: "mochi", p: ["#ffd6e2", "#fff0f5", "#7bd88f", "#e79ab3"], cl: ["powder"], hd: ["leaf"], ey: "happy", mo: "smile" },
    { id: "n13", n: "めろんぱん", r: "N", f: "こんがり焼きたて。さくっとした自信家。", s: "round", p: ["#e9b45c", "#f6d590", "#b9803a", "#8a5a26"], cl: ["grid"], ey: "dot", mo: "open" },
    { id: "n14", n: "たまごろう", r: "N", f: "殻をかぶったまま、外の世界にワクワク。", s: "egg", p: ["#fff0c2", "#fffbe6", "#ffc94d", "#e0a020"], hd: ["shell"], ey: "sparkle", mo: "smile" },
    { id: "n15", n: "きのこまる", r: "N", f: "森のすみっこで、しずかに育つ。", s: "stem", p: ["#fff0d8", "#ffffff", "#e5533d", "#c9a878"], fr: ["mcap"], ey: "dot", mo: "smile" },
    { id: "n16", n: "ほしくず", r: "N", f: "夜空からこぼれた、ちいさなきらめき。", s: "star", p: ["#ffd84a", "#fff3a8", "#ffa53d", "#c98a10"], ey: "sparkle", mo: "smile" },
    { id: "n17", n: "かぼちゃん", r: "N", f: "秋になるとぐんと元気になる。", s: "mochi", p: ["#ff9a3c", "#ffc27a", "#d8721a", "#b85a10"], cl: ["ridge"], hd: ["pstem"], ey: "dot", mo: "grin" },
    { id: "n18", n: "さくらもち", r: "N", f: "春のにおいをまとって、ほんわか登場。", s: "round", p: ["#ffb6c8", "#ffe3ec", "#ff8fb4", "#d9648f"], fr: ["sakuraleaf"], hd: ["flower"], ey: "happy", mo: "smile" },
    { id: "n19", n: "こおりん", r: "N", f: "ひんやりクール。でも心はあったかい。", s: "square", p: ["#c4ecff", "#e9f9ff", "#7cc4ee", "#5aa9d6"], pre: ["shine"], cl: ["stars"], ey: "sparkle", mo: "smile" },
    { id: "n20", n: "ごろごろ", r: "N", f: "ゴロゴロ鳴るけど、実はこわがり。", s: "cloud", p: ["#9aa0c8", "#c8ccec", "#ffe14a", "#6f75a0"], hd: ["bolt"], ey: "dot", mo: "open" },
    // レア（8）
    { id: "r01", n: "ほむらぎつね", r: "R", f: "しっぽに宿る青い炎は、やる気のしるし。", s: "round", p: ["#ff8a3d", "#fff1d6", "#5ab8ff", "#dff4ff"], bk: ["fox", "tflame"], hd: ["flame"], ey: "sparkle", mo: "smile" },
    { id: "r02", n: "みなもりゅう", r: "R", f: "水面をすべる小さな竜。しんじゅが宝物。", s: "egg", p: ["#4fc3d9", "#cdf4fb", "#a8e6f0", "#2b8ea8"], bk: ["horn", "tdrag", "wingS"], fr: ["pearl"], ey: "sparkle", mo: "grin" },
    { id: "r03", n: "かみなりとら", r: "R", f: "ビリビリ走る、いなずまハチマキの元気っ子。", s: "round", p: ["#ffcf4a", "#fff3c2", "#3b7bff", "#4a3428"], bk: ["round", "tfluff"], cl: ["stripe"], hd: ["band"], ey: "sparkle", mo: "open" },
    { id: "r04", n: "もりふくろう", r: "R", f: "森の物知り博士。夜ふかしはお手のもの。", s: "egg", p: ["#9a7a52", "#f1e2c6", "#7bd88f", "#6b4f33"], bk: ["owl", "wingS"], cl: ["scallop"], hd: ["sprout"], ey: "owl", mo: "beak" },
    { id: "r05", n: "ゆきんこひめ", r: "R", f: "雪の国のお姫さま。笑うと粉雪がきらり。", s: "round", p: ["#eaf5ff", "#ffffff", "#9fd2ff", "#8fb8e0"], bk: ["bear"], hd: ["icecrown"], fr: ["spark"], ey: "sparkle", mo: "smile" },
    { id: "r06", n: "ほしよみねこ", r: "R", f: "星の動きで明日を占う、ないしょの魔法使い。", s: "egg", p: ["#6b5bb0", "#c9c0f0", "#ffb3d1", "#4a3d8a"], bk: ["cat", "tfluff"], cl: ["stars"], hd: ["wizard"], fr: ["spark"], ey: "sparkle", mo: "cat" },
    { id: "r07", n: "さくらひめうさ", r: "R", f: "桜ふぶきの中から現れた、はなやかな春の使者。", s: "egg", p: ["#f3ecff", "#ffffff", "#ffb3cb", "#c9a8f0"], bk: ["bunny", "tfluff"], hd: ["flower", "star"], fr: ["spark"], ey: "sparkle", mo: "smile" },
    { id: "r08", n: "しろがねナイト", r: "R", f: "ちびっこ騎士。マントとたてで、みんなを守る。", s: "round", p: ["#b7c8e2", "#eef3fb", "#e5533d", "#7c8fae"], bk: ["cape"], hd: ["helmet"], fr: ["shield"], ey: "dot", mo: "smile" },
    // スーパーレア（2）
    { id: "s01", n: "にじいろユニ", r: "SR", f: "にじのたてがみをなびかせる、ゆめの中の一角獣。", s: "egg", p: ["#ffffff", "#fff0f8", "#ffb3d1", "#c9a8f0"], bk: ["mane", "wing", "train", "cat"], hd: ["unihorn"], fr: ["spark"], ey: "sparkle", mo: "smile" },
    { id: "s02", n: "ほむらのひのとり", r: "SR", f: "燃える翼で夜をてらす、伝説の火の鳥。", s: "round", p: ["#ff6a3d", "#ffd23f", "#ffb347", "#c8321e"], bk: ["fwing", "tflame"], hd: ["phoenix"], fr: ["spark"], ey: "sparkle", mo: "beak" }
  ];

  var BYID = {}, BYR = { N: [], R: [], SR: [] };
  D.forEach(function (d) { BYID[d.id] = d; BYR[d.r].push(d.id); });

  function build(d) {
    var p = d.p, s = d.s, id = "jk" + (++uid), out = "", i;
    (d.bk || []).forEach(function (k) { out += BK[k](p); });
    out += O(SH[s], p[0]);
    var cl = "";
    if (BELLY[s]) cl += '<ellipse cx="50" cy="74" rx="' + BELLY[s] + '" ry="13" fill="' + p[1] + '"/>';
    (d.cl || []).forEach(function (k) { cl += CL[k](p); });
    if (cl) out += '<clipPath id="' + id + '">' + SH[s]("") + '</clipPath><g clip-path="url(#' + id + ')">' + cl + "</g>";
    (d.pre || []).forEach(function (k) { out += PRE[k](p); });
    var fy = FY[s];
    out += '<g transform="translate(0 ' + fy + ')">' + eye(d.ey, 38, 58, -1) + eye(d.ey, 62, 58, 1) + mouth(d.mo, 67) +
      '<circle cx="29" cy="66" r="4.4" fill="#ff8fa8" opacity=".5"/><circle cx="71" cy="66" r="4.4" fill="#ff8fa8" opacity=".5"/></g>';
    (d.fr || []).forEach(function (k) { out += FR[k](p); });
    (d.hd || []).forEach(function (k) { out += '<g transform="translate(0 ' + (TOP[s] - 32) + ')">' + HD[k](p) + "</g>"; });
    return out;
  }
  function frame(d, inner) {
    var id = "jf" + (++uid), r = d.r, c0 = d.p[0], bg;
    var defs = "", deco = "";
    if (r === "N") {
      bg = '<rect width="100" height="100" rx="20" fill="' + mix(c0, "#ffffff", .78) + '"/><circle cx="50" cy="58" r="40" fill="#fff" opacity=".5"/>';
    } else if (r === "R") {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(c0, "#ffffff", .82) + '"/><stop offset="1" stop-color="#b7cfff"/></linearGradient><radialGradient id="' + id + 'r"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
      bg = '<rect width="100" height="100" rx="20" fill="url(#' + id + 'g)"/><circle cx="50" cy="56" r="46" fill="url(#' + id + 'r)"/>';
      deco = '<rect x="2.5" y="2.5" width="95" height="95" rx="18" fill="none" stroke="#5b8def" stroke-width="3"/><rect x="6" y="6" width="88" height="88" rx="15" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/>' +
        sp(12, 14, 6, "#fff", "jka-tw", 0) + sp(88, 22, 5, "#fff", "jka-tw", .5) + sp(10, 82, 4.5, "#fff", "jka-tw", 1) + sp(90, 84, 6, "#fff", "jka-tw", 1.4);
    } else {
      var rays = ""; for (var k = 0; k < 12; k++) rays += '<polygon points="50,56 ' + (50 + 90 * Math.cos(k * Math.PI / 6 - .13)).toFixed(1) + "," + (56 + 90 * Math.sin(k * Math.PI / 6 - .13)).toFixed(1) + " " + (50 + 90 * Math.cos(k * Math.PI / 6 + .13)).toFixed(1) + "," + (56 + 90 * Math.sin(k * Math.PI / 6 + .13)).toFixed(1) + '"/>';
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c2"/><stop offset=".5" stop-color="#ffd76a"/><stop offset="1" stop-color="#ff9fc4"/></linearGradient><linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a0"/><stop offset=".5" stop-color="#e5a100"/><stop offset="1" stop-color="#fff2a0"/></linearGradient><radialGradient id="' + id + 'r"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="' + id + 'c"><rect width="100" height="100" rx="20"/></clipPath>';
      bg = '<rect width="100" height="100" rx="20" fill="url(#' + id + 'g)"/><g clip-path="url(#' + id + 'c)"><g class="jka-spin" fill="#fff" opacity=".4">' + rays + '</g></g><circle cx="50" cy="56" r="44" fill="url(#' + id + 'r)"/>';
      deco = '<rect x="2.5" y="2.5" width="95" height="95" rx="18" fill="none" stroke="url(#' + id + 'b)" stroke-width="4.5"/><rect x="7" y="7" width="86" height="86" rx="14" fill="none" stroke="#fff" stroke-width="1.4" opacity=".9"/>' +
        sp(11, 13, 7, "#fff", "jka-tw", 0) + sp(89, 16, 5, "#fff5b0", "jka-tw", .3) + sp(8, 50, 4, "#fff", "jka-tw", .8) + sp(93, 55, 5, "#fff", "jka-tw", 1.1) +
        sp(14, 88, 6, "#fff5b0", "jka-tw", .6) + sp(86, 88, 7, "#fff", "jka-tw", 1.5) + sp(30, 8, 3.4, "#fff", "jka-tw", 1.2) + sp(72, 92, 3.4, "#fff", "jka-tw", .2);
    }
    return (defs ? "<defs>" + defs + "</defs>" : "") + bg + inner + deco;
  }
  function svg(id, size, o) {
    var d = BYID[id]; if (!d) return "";
    o = o || {}; var sz = size || 64;
    var inner = build(d);
    return '<svg class="jka jka-' + d.r.toLowerCase() + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="' + sz + '" height="' + sz + '" role="img" aria-label="' + d.n + '">' + (o.bare ? inner : frame(d, inner)) + "</svg>";
  }
  function sil(id, size) {
    var d = BYID[id]; if (!d) return "";
    return '<svg class="jka jka-sil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="' + (size || 64) + '" height="' + (size || 64) + '" aria-hidden="true">' + build(d) + "</svg>";
  }
  window.JKAvatars = { list: D, get: function (id) { return BYID[id] || null; }, byRarity: BYR, svg: svg, sil: sil, RARITY: { N: "ノーマル", R: "レア", SR: "スーパーレア" } };
})();
