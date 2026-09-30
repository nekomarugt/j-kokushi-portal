/* 柔整国試ポータル：ごほうびアバター（SDキャラ）30体。すべて自作のインラインSVG（外部画像・既存キャラなし）。
 * 全身・約2.7頭身のSDキャラ。ノーマル20（普段着の若者）／レア8（ファンタジー職）／スーパーレア2（羽・オーラ）。
 * ID（n01…/r01…/s01…）は保存データに使うので、変更しないこと。絵は 100x150 の縦長（枠つき）。 */
(function () {
  "use strict";
  var K = "#2b2340", uid = 0;
  function hx(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function mix(a, b, t) { var x = hx(a), y = hx(b); return "#" + x.map(function (v, i) { var n = Math.round(v + (y[i] - v) * t).toString(16); return n.length < 2 ? "0" + n : n; }).join(""); }
  function PO(d, f, w) { return '<path d="' + d + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (w || 1.5) + '" stroke-linejoin="round" stroke-linecap="round"/>'; }
  function P(d, f, o) { return '<path d="' + d + '" fill="' + f + '"' + (o || "") + "/>"; }
  function L(d, c, w, o) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (o || "") + "/>"; }
  function CI(x, y, r, f, w) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (w === 0 ? "" : ' stroke="' + K + '" stroke-width="' + (w || 1.3) + '"') + "/>"; }
  function EL(x, y, rx, ry, f, w, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (w === 0 ? "" : ' stroke="' + K + '" stroke-width="' + (w || 1.3) + '"') + (rot ? ' transform="rotate(' + rot + " " + x + " " + y + ')"' : "") + "/>"; }
  function PG(pts, f, w) { return PO("M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join("L") + "Z", f, w); }
  function RC(x, y, w, h, r, f, sw) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + f + '" stroke="' + K + '" stroke-width="' + (sw || 1.3) + '"/>'; }
  function limb(pts, w, col) { var d = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L"); return L(d, K, w + 3) + L(d, col, w); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function MR(s) { return '<g transform="translate(100 0) scale(-1 1)">' + s + "</g>"; }
  function sp(x, y, s, fill, dl) { return '<path class="jka-tw" style="animation-delay:' + (dl || 0) + 's" d="M' + x + " " + (y - s) + "Q" + x + " " + y + " " + (x + s) + " " + y + "Q" + x + " " + y + " " + x + " " + (y + s) + "Q" + x + " " + y + " " + (x - s) + " " + y + "Q" + x + " " + y + " " + x + " " + (y - s) + 'Z" fill="' + fill + '"/>'; }

  /* ---------- 髪 ---------- */
  var FR = "M29.5 47C26.5 27 37 15 50 15C63 15 73.5 27 70.5 47C69.8 41 68.5 37 66 34C63 37.5 57 37 53.5 30.5C50 36.5 44.5 38 40.5 33.5C37.5 36 34 39 31.5 44Z";
  var SWEEP = "M29.5 47C26.5 27 37 15 50 15C63 15 73.5 27 70.5 47C69.8 41 68.5 37 66 33C58 34 47 37 39 45C37.5 41 34.5 39.5 31.5 43Z";
  var HAIR = {
    short: function () { return { b: "", f: FR }; },
    sweep: function () { return { b: "", f: SWEEP }; },
    spiky: function () { return { b: "", f: "M31 32L26 17L38 22L37 6L47 17L52 1L58 17L67 6L65 22L76 15L70 33Z" + FR }; },
    wolf: function () { return { b: "M28 40C24 56 26 68 32 76L36 67L40 76L44 65L50 72L56 65L60 76L64 67L68 76C74 68 76 56 72 40Z", f: FR + "M29.5 47L28 60L34 52Z M70.5 47L72 60L66 52Z" }; },
    bob: function () { return { b: "M28.5 42C26 22 37 14 50 14C63 14 74 22 71.5 42L72.5 68Q50 75 27.5 68Z", f: FR + "M29.5 47L29.5 67Q33.5 69 37 65L35.5 44Z M70.5 47L70.5 67Q66.5 69 63 65L64.5 44Z" }; },
    long: function () { return { b: "M28.5 42C26 22 37 14 50 14C63 14 74 22 71.5 42L75 100Q66 105 61 97L58 66L42 66L39 97Q34 105 25 100Z", f: FR + "M29.5 47Q26 66 31 86Q35 90 38.5 85Q36 66 36.5 46Z M70.5 47Q74 66 69 86Q65 90 61.5 85Q64 66 63.5 46Z" }; },
    twin: function (c) { var t = "M32 30C20 26 9 42 11 64C12 78 17 88 24 95C25 80 30 68 35 54Z"; return { b: t + MR(t), f: FR }; },
    pony: function () { return { b: "M60 22C77 10 94 30 86 57C83 69 78 77 72 86C73 69 71 57 65 42Z", f: FR }; },
    bun: function () { return { b: "", f: "M50 1.5a8.5 8.5 0 1 1-.1 0Z" + FR }; }
  };

  /* ---------- 目・口 ---------- */
  function eye(t, iris, cx, cy, s, hc) {
    if (t === "wink" && s > 0) return L("M" + (cx - 6) + " " + (cy + 0.8) + "Q" + cx + " " + (cy - 4.2) + " " + (cx + 6) + " " + (cy + 0.8), K, 1.9) + brow(cx, cy, s, hc, 0);
    var eh = t === "calm" ? 0.66 : t === "bright" ? 1.12 : 0.92, tilt = t === "sharp" ? -2.7 : t === "calm" ? -0.5 : -1.1;
    var ox = cx + s * 6.4, oy = cy + tilt, ix = cx - s * 5.2, iy = cy + 0.9, top = cy - 4.7 * eh, bot = cy + 3.9 * eh, id = "ce" + (++uid);
    var shape = "M" + ox + " " + oy + "Q" + (cx + s * 0.5) + " " + top + " " + ix + " " + iy + "Q" + (cx - s * 0.5) + " " + bot + " " + ox + " " + oy + "Z";
    return '<clipPath id="' + id + '"><path d="' + shape + '"/></clipPath><path d="' + shape + '" fill="#fff"/>' +
      '<g clip-path="url(#' + id + ')">' + EL(cx - s * 0.3, cy, 3.1, 3.8 * eh + 0.6, iris, 0) + EL(cx - s * 0.3, cy + 1.6, 2.7, 1.9, mix(iris, "#000", 0.3), 0).replace("/>", ' opacity=".55"/>') +
      EL(cx - s * 0.3, cy, 1.4, 2.3 * eh + 0.3, K, 0) + CI(cx - s * 0.3 - 1, cy - 1.3, 1, "#fff", 0) + CI(cx - s * 0.3 + 1.1, cy + 1.5, 0.55, "#fff", 0) + "</g>" +
      L("M" + (ox + s * 1.8) + " " + (oy - 1.4) + "L" + ox + " " + oy + "Q" + (cx + s * 0.5) + " " + top + " " + ix + " " + iy, K, 1.9) +
      L("M" + ox + " " + oy + "Q" + (cx - s * 0.5) + " " + bot + " " + ix + " " + iy, K, 0.7, ' opacity=".5"') + brow(cx, cy, s, hc, t === "sharp" ? 1 : 0);
  }
  function brow(cx, cy, s, hc, sh) {
    return L("M" + (cx + s * 6.6) + " " + (cy - 9.2 - sh * 1.3) + "Q" + (cx + s * 0.6) + " " + (cy - 10.6) + " " + (cx - s * 4.6) + " " + (cy - 8 + sh * 1.1), mix(hc, "#000", 0.45), 1.5);
  }
  function mouth(t) {
    if (t === "open") return P("M46.6 54Q50 60.5 53.4 54Z", "#7a2a3a") + L("M46.6 54H53.4", K, 1.1);
    if (t === "smirk") return L("M46.5 55.6Q50 56.6 53.6 53.6", K, 1.4) + L("M53.6 53.6l1 -1", K, 1);
    if (t === "flat") return L("M47.2 55.4H52.8", K, 1.3);
    return L("M46.4 54.2Q50 58 53.6 54.2", K, 1.4);
  }

  /* ---------- 腕・脚 ---------- */
  var POSE = {
    0: { l: [[35, 79], [36, 91]], r: [[65, 79], [64, 91]] },
    1: { l: [[31.5, 79], [41, 91]], r: [[68.5, 79], [59, 91]] },
    3: { l: [[35, 79], [36, 91]], r: [[69, 68], [71, 54]] },
    4: { l: [[35, 79], [36, 91]], r: [[68, 73], [77, 65]] },
    5: { l: [[31, 68], [29, 54]], r: [[69, 68], [71, 54]] },
    6: { l: [[36, 82], [58, 79]], r: [[64, 85], [42, 83]] },
    7: { l: [[36, 78], [42, 91]], r: [[64, 78], [58, 91]] },
    9: { l: [[36, 81], [46, 82]], r: [[64, 81], [54, 82]] },
    10: { l: [[31, 68], [29, 54]], r: [[65, 79], [64, 91]] },
    11: { l: [[32, 78], [31, 90]], r: [[67, 76], [70, 90]] }
  };
  var STANCE = [[44.5, 55.5], [40, 60], [42, 61.5]];
  var SHL = [67, 67];

  function arm(side, pose, d, ex) {
    var S = side === "l" ? [39.5, 67] : [60.5, 67], pt = POSE[pose][side], E = pt[0], H = pt[1], sl = d.sl || "long", col = d.c[0];
    if (d.sc) col = d.sc;
    var out = limb([S, E, H], 5, d.sk);
    if (sl === "long") out += limb([S, E, lerp(E, H, 0.74)], 6.8, col);
    else if (sl === "wide") out += limb([S, E, lerp(E, H, 0.8)], 9.5, col);
    else if (sl === "short") out += limb([S, lerp(S, E, 0.85)], 7, col);
    if (d.cf && sl !== "none" && sl !== "short") out += limb([lerp(E, H, 0.72), lerp(E, H, 0.8)], 6.9, d.cf);
    return { arm: out, hand: H };
  }
  function hand(H, d) { return CI(H[0], H[1], 3.3, d.gl || d.sk, 1.3); }

  function legs(d) {
    var st = STANCE[d.st || 0], c = d.c, s = "", lg = d.lg || "pants", i, hp = [[45, 92], [55, 92]], foot = [[st[0], 131], [st[1], 131]];
    for (i = 0; i < 2; i++) {
      var sgn = i ? 1 : -1, H = hp[i], F = foot[i];
      if (lg === "pants") s += limb([H, F], 9.6, c[3]);
      else if (lg === "hakama") s += limb([H, lerp(H, F, 0.9)], 13, c[3]);
      else if (lg === "robe") s += limb([H, F], 8, d.sk);
      else {
        s += limb([H, F], 8, d.sk);
        if (lg === "shorts") s += limb([H, lerp(H, F, 0.36)], 10.6, c[3]);
        if (lg === "skirtsock") s += limb([lerp(H, F, 0.5), F], 8.6, c[4] === "#ffffff" ? "#ffffff" : mix(c[3], "#000", 0.2));
        if (lg === "shortsock") s += limb([H, lerp(H, F, 0.36)], 10.6, c[3]) + limb([lerp(H, F, 0.78), F], 8.6, "#f4f4f8");
      }
      if (d.bt) { s += limb([[F[0], 119], [F[0], 131]], 10.8, d.bt) + L("M" + (F[0] - 5.3) + " 119.5H" + (F[0] + 5.3), mix(d.bt, "#fff", 0.4), 1.6); }
      s += EL(F[0] + sgn * 1.8, 134.2, 7.6, 4.3, d.bt || c[4]) + EL(F[0] + sgn * 1.8, 136.3, 7.8, 1.5, "#fff", 0).replace('fill="#fff"', 'fill="#fff" opacity=".9"');
    }
    return s;
  }

  /* ---------- 服 ---------- */
  var TB = "M39.5 65Q50 61 60.5 65L61.5 93Q50 96.5 38.5 93Z";
  var OUT = {
    hoodie: function (c, d) {
      return PO("M37.5 65Q50 61 62.5 65L64.5 98Q50 101.5 35.5 98Z", c[0]) + PO("M41.5 86L58.5 86L60.5 96.5L39.5 96.5Z", mix(c[0], "#000", 0.1), 1.2) +
        PO("M39 64Q50 75 61 64Q62 59.5 50 59Q38 59.5 39 64Z", mix(c[0], "#fff", 0.18), 1.3) + L("M46.5 68L45.6 80M53.5 68L54.4 80", c[2], 1.3) + CI(45.6, 80.6, 1, c[2], 0) + CI(54.4, 80.6, 1, c[2], 0) +
        P("M47 84L50 78.5L53 84L50 82.8Z", c[2]);
    },
    jacket: function (c, d) {
      return PO(TB, c[1]) + PO("M39.5 65Q43 63.5 47.5 64.5L46 94Q42 95 38.5 93Z", c[0]) + PO("M60.5 65Q57 63.5 52.5 64.5L54 94Q58 95 61.5 93Z", c[0]) +
        PO("M43.5 63L50 73L47.5 63Z", mix(c[0], "#fff", 0.22), 1.1) + PO("M56.5 63L50 73L52.5 63Z", mix(c[0], "#fff", 0.22), 1.1) +
        (d.tie ? PG([[48.6, 70], [51.4, 70], [52, 84], [50, 86], [48, 84]], c[2], 1) : L("M46 68V93M54 68V93", c[2], 1.2)) + L("M39 91Q50 94.5 61 91", c[2], 1.6);
    },
    coat: function (c, d) {
      return PO(TB, c[1]) + PO("M38.5 90Q50 96 61.5 90L69 119Q50 125.5 31 119Z", c[0]) + PO("M39.5 65Q43 63.5 47.5 64.5L46.5 93L38.5 91Z", c[0]) + PO("M60.5 65Q57 63.5 52.5 64.5L53.5 93L61.5 91Z", c[0]) +
        PG([[42, 63], [50, 82], [58, 63], [54, 61.5], [50, 68], [46, 61.5]], mix(c[0], "#fff", 0.16), 1.2) + L("M50 90V121", K, 1, ' opacity=".55"') +
        RC(38.5, 85, 23, 4.2, 1.5, c[2], 1.1) + RC(48, 84.6, 4, 5, 1, mix(c[2], "#fff", 0.35), 0.9) + L("M34 116Q50 122 66 116", c[2], 1.5);
    },
    dress: function (c, d) {
      var s = PO(TB, c[0]) + PO("M42.5 63.5Q50 69 57.5 63.5", "none", 1) + PO("M38.5 89Q50 94 61.5 89L68.5 111Q50 117 31.5 111Z", c[1]);
      s += L("M43 92L40.5 112M47 93L45.5 114M53 93L54.5 114M57 92L59.5 112", K, 1, ' opacity=".22"') + L("M32 109Q50 115 68 109", c[2], 2.2);
      s += PO("M39 88Q50 93 61 88V91Q50 96 39 91Z", c[2], 1.1);
      s += PG([[50, 68], [44.5, 65], [44.5, 71]], c[2], 1) + PG([[50, 68], [55.5, 65], [55.5, 71]], c[2], 1) + CI(50, 68, 1.8, mix(c[2], "#fff", 0.3), 1);
      return s;
    },
    armor: function (c, d) {
      return PO(TB, c[1]) + PO("M40 65Q50 62 60 65L59 84Q50 88.5 41 84Z", c[0]) + L("M41 66Q50 63 59 66", c[2], 1.4) + CI(50, 74, 2.6, c[2], 1) + L("M45 79Q50 83 55 79", c[2], 1.2) +
        PO("M40 92L60 92L58 104L50 107L42 104Z", c[1], 1.3) + PO("M38 91.5H62V95.5H38Z", c[2], 1.2) + CI(50, 93.5, 2.2, mix(c[2], "#fff", 0.4), 1) +
        PO("M39 96L47 98L44 111L35 106Z", c[0], 1.3) + PO("M61 96L53 98L56 111L65 106Z", c[0], 1.3) +
        EL(36.5, 67.5, 7.2, 6, c[0], 1.4) + L("M31 68Q36.5 63.5 42 68", c[2], 1.5) + EL(63.5, 67.5, 7.2, 6, c[0], 1.4) + L("M58 68Q63.5 63.5 69 68", c[2], 1.5);
    },
    robe: function (c, d) {
      return PO(TB, c[0]) + PO("M38.5 90Q50 95.5 61.5 90L71 124Q50 131 29 124Z", c[0]) + PO("M47.5 91Q50 92 52.5 91L54.5 126Q50 128 45.5 126Z", c[1], 1.1) +
        PG([[42, 63.5], [50, 80], [58, 63.5], [54.5, 62], [50, 68], [45.5, 62]], c[1], 1.1) + RC(38.5, 83.5, 23, 5.4, 1.6, c[2], 1.2) + PG([[50, 86], [45, 96], [48, 96]], c[2], 1) + PG([[50, 86], [55, 96], [52, 96]], c[2], 1) +
        L("M32 121Q50 127.5 68 121", c[2], 1.6);
    },
    tank: function (c, d) {
      return PO(TB, d.sk) + PO("M41.5 66.5Q50 63.5 58.5 66.5L59.5 92Q50 95.5 40.5 92Z", c[0]) + PG([[50, 72], [53, 79], [50, 86], [47, 79]], c[2], 0.9) + L("M40.5 89.5Q50 93 59.5 89.5", c[2], 1.8) +
        L("M44 65.5Q50 70 56 65.5", d.sk, 2.4);
    },
    tee: function (c, d) {
      return PO(TB, c[0]) + L("M39.5 75Q50 79 60.5 75", c[2], 2.2) + L("M39.5 79.5Q50 83.5 60.5 79.5", c[2], 1.2) + PO("M44 63Q50 68 56 63", "none", 1);
    },
    overall: function (c, d) {
      return PO(TB, c[1]) + PO("M42.5 76H57.5L59.5 94Q50 97.5 40.5 94Z", c[0]) + limb([[43, 76], [42, 64.5]], 2.8, c[0]) + limb([[57, 76], [58, 64.5]], 2.8, c[0]) +
        CI(43, 77.5, 1.2, c[2], 0.8) + CI(57, 77.5, 1.2, c[2], 0.8) + RC(46, 82, 8, 6, 1.4, mix(c[0], "#000", 0.12), 1);
    },
    apron: function (c, d) {
      return PO(TB, c[0]) + PO("M42.5 71H57.5L61 101Q50 104.5 39 101Z", c[1]) + limb([[43, 71], [41.5, 64]], 2, c[2]) + limb([[57, 71], [58.5, 64]], 2, c[2]) + RC(45.5, 86, 9, 7, 1.5, mix(c[1], "#000", 0.08), 1) + L("M39.5 79H60.5", c[2], 1.6);
    },
    haori: function (c, d) {
      return PO(TB, c[1]) + RC(39, 85.5, 22, 5.6, 1.5, c[2], 1.2) + PO("M38.5 65Q43.5 63 47.5 64.5L46 108Q40 110 33.5 106Z", c[0]) + PO("M61.5 65Q56.5 63 52.5 64.5L54 108Q60 110 66.5 106Z", c[0]) +
        L("M47.5 64.5L46 108M52.5 64.5L54 108", c[2], 2) + P("M35.5 98L45.3 100L45.2 104L34.5 102Z M64.5 98L54.7 100L54.8 104L65.5 102Z", c[2], ' opacity=".7"');
    }
  };

  /* ---------- 持ちもの（手の位置が原点、上向き） ---------- */
  var BLADE = "#e9f0fa";
  var PR = {
    sword: function (q) { return PG([[-2.6, -5], [2.6, -5], [2.1, -38], [0, -46], [-2.1, -38]], BLADE, 1.3) + L("M0 -8V-38", "#a9b8d0", 1) + PO("M-8 -5.5H8V-2.4H-8Z", q.a, 1.2) + PO("M-1.8 -2.4H1.8V7H-1.8Z", mix(q.a, "#000", 0.45), 1.1) + CI(0, 8.6, 2.1, q.a, 1.1); },
    rapier: function (q) { return PG([[-1.2, -5], [1.2, -5], [0.7, -50], [0, -54], [-0.7, -50]], BLADE, 1.1) + L("M-9 -5Q0 -12 9 -5", q.a, 2.2) + PO("M-8 -5.5Q0 2 8 -5.5", q.a, 1) + PO("M-1.6 -3H1.6V7H-1.6Z", mix(q.a, "#000", 0.4), 1) + CI(0, 8.6, 2, q.a, 1); },
    greatsword: function (q) {
      var f = q.fire ? '<path class="jka-tw" style="animation-delay:.2s" d="M-5 -30Q-11 -40 -4 -50Q-6 -42 -1 -46Q-3 -38 0 -34Z" fill="' + q.fire + '"/><path class="jka-tw" style="animation-delay:.6s" d="M5 -20Q10 -32 4 -42Q6 -34 1 -38Q3 -28 0 -24Z" fill="' + q.fire + '"/>' : "";
      return PG([[-5, -6], [5, -6], [4.5, -42], [0, -56], [-4.5, -42]], BLADE, 1.4) + L("M0 -10V-46", "#a9b8d0", 1.4) + (q.fire ? P("M-3.2 -10L3.2 -10L2.8 -42L0 -50L-2.8 -42Z", q.fire, ' opacity=".35"') : "") + PO("M-10 -6.5Q0 -11 10 -6.5L8 -2.5H-8Z", q.a, 1.3) + PO("M-2 -2.5H2V10H-2Z", mix(q.a, "#000", 0.45), 1.1) + CI(0, 11.6, 2.5, q.a, 1.1) + f;
    },
    katana: function (q) { return PO("M-1.7 -6L1.7 -6Q3.4 -30 1 -54L-0.6 -56Q-1.6 -30 -1.7 -6Z", BLADE, 1.2) + EL(0, -6, 4.6, 1.7, q.a, 1.1) + PO("M-1.9 -4.5H1.9V8H-1.9Z", mix(q.a, "#000", 0.5), 1.1); },
    staff: function (q) { return PO("M-1.4 -40H1.4V28H-1.4Z", "#8a5a3c", 1) + PO("M-5 -44Q-6 -34 0 -32Q6 -34 5 -44", q.a, 1.2) + '<circle cx="0" cy="-46" r="7.6" fill="' + q.a + '" opacity=".28"/>' + CI(0, -46, 4.7, mix(q.a, "#fff", 0.45), 1.2) + CI(-1.4, -47.4, 1.2, "#fff", 0); },
    wand: function (q) { return PO("M-1.1 -22H1.1V8H-1.1Z", "#7a5a8a", 0.9) + '<path class="jka-tw" d="M0 -32Q0 -26 6 -26Q0 -26 0 -20Q0 -26 -6 -26Q0 -26 0 -32Z" fill="' + q.a + '" stroke="' + K + '" stroke-width="1"/>'; },
    bow: function (q) { return L("M2 -36Q-20 0 2 36", K, 4.2) + L("M2 -36Q-20 0 2 36", q.w || "#a8703f", 2.6) + L("M2 -36L2 36", "#fff", 0.8) + RC(-3.4, -4, 5.2, 8, 1.5, q.a, 1); },
    spear: function (q) { return PO("M-1.3 -58H1.3V30H-1.3Z", "#7a5a3c", 1) + PG([[0, -82], [4.4, -66], [0, -58], [-4.4, -66]], BLADE, 1.2) + PG([[-1.8, -58], [1.8, -58], [3.5, -50], [-3.5, -50]], q.a, 1); },
    guitar: function (q) { return PO("M-1.7 -40H1.7V-4H-1.7Z", "#6b4a34", 1) + RC(-3, -47, 6, 8, 1.5, q.a, 1) + L("M-0.9 -38V-4M0.9 -38V-4", "#e8e8f0", 0.5) +
        PO("M-11 10Q-14 -1 -5 -3Q0 -5 5 -3Q14 -1 11 10Q15.5 18 7 21Q0 23.5 -7 21Q-15.5 18 -11 10Z", q.m, 1.4) + EL(0, 9, 4.2, 2.4, "#fff", 0.8, 0).replace('fill="#fff"', 'fill="#fff" opacity=".85"') + L("M-5 15H5", "#e8e8f0", 1.4); },
    mic: function (q) { return PO("M-2 -3H2L1.4 13H-1.4Z", "#3a3a4f", 1.1) + CI(0, -7, 4.6, "#c9d2e0", 1.2) + L("M-3 -8H3M-2.6 -5.6H2.6", "#8592a8", 0.7) + RC(-2.6, -1.5, 5.2, 2.2, 0.8, q.a, 0.8); },
    umbrella: function (q) { return L("M0 -22V15Q0 21 -5 20", "#3b3b4f", 2) + PO("M-24 -22Q-21 -50 0 -52Q21 -50 24 -22Q18 -27 12 -22Q6 -27 0 -22Q-6 -27 -12 -22Q-18 -27 -24 -22Z", q.m, 1.4) + L("M0 -52V-23M-12 -22Q-12 -40 -2 -51M12 -22Q12 -40 2 -51", K, 0.8, ' opacity=".4"') + CI(0, -53, 1.4, K, 0); },
    board: function (q) { return RC(-3.8, -21, 7.6, 42, 3.8, q.m, 1.4) + RC(-3.8, -11, 7.6, 7, 0, q.a, 0).replace(/rx="0"/, 'rx="0" opacity=".9"') + CI(6, -13, 2.6, "#f4f4f8", 1.1) + CI(6, 13, 2.6, "#f4f4f8", 1.1); },
    camera: function (q) { return PO("M-9 -7L-4 -7L-3 -9.5H3L4 -7H9Q10 -7 10 -5V6Q10 7.4 8.6 7.4H-8.6Q-10 7.4 -10 6V-5Q-10 -7 -9 -7Z", "#3f3f58", 1.3) + CI(0, 0, 4.7, "#9fd0ff", 1.3) + CI(-1.3, -1.4, 1.2, "#fff", 0) + RC(5.6, -5.6, 2.8, 2, 0.6, q.a, 0.6) + L("M-9 -6Q-14 -20 -6 -26M9 -6Q14 -20 6 -26", q.a, 1.2); },
    lantern: function (q) { return L("M0 -12V5", K, 1.2) + '<circle cx="0" cy="13" r="14" fill="#ffe58a" opacity=".35"/>' + PO("M-4 4.5H4L3 7H-3Z", "#4a3a3a", 1) + RC(-4.6, 6.6, 9.2, 12, 3, q.a, 1.3) + EL(0, 12.6, 2.2, 3.4, "#fff2b0", 0) + PO("M-3.4 18.5H3.4L2.6 21H-2.6Z", "#4a3a3a", 1); },
    shield: function (q) { return PO("M-12 -14H12V3Q12 16 0 23Q-12 16 -12 3Z", q.m, 1.6) + PO("M-8 -10H8V3Q8 12 0 17Q-8 12 -8 3Z", q.a, 1) + L("M0 -9V15M-7 0H7", mix(q.a, "#fff", 0.5), 1.2); },
    book: function (q) { return RC(-8, -12, 16, 23, 1.6, q.m, 1.3) + RC(-6.4, -10.5, 13.4, 20.4, 1, "#f9f4e6", 0.6) + RC(-8, -12, 3.4, 23, 1.2, mix(q.m, "#000", 0.2), 1) + L("M-2 -6H5M-2 -2.5H5", "#a89f8a", 0.8) + PG([[2.5, -12], [5.5, -12], [5.5, -6], [4, -8], [2.5, -6]], q.a, 0.7); },
    tray: function (q) { return EL(0, -6, 13, 2.6, "#f4f4fa", 1.3) + RC(-3.6, -15, 7.2, 9, 2, q.a, 1.2) + L("M3.6 -13Q7.6 -12 3.6 -9", K, 1) + L("M-1 -18Q-3 -21 -1 -24M2 -18Q0 -21 2 -24", "#ffffff", 1, ' opacity=".8"'); },
    fan: function (q) { return PO("M0 4L-19 -22Q0 -34 19 -22Z", q.a, 1.3) + L("M0 4L-11 -27M0 4V-30M0 4L11 -27M0 4L-16 -25M0 4L16 -25", mix(q.a, "#000", 0.35), 0.8) + P("M-19 -22Q0 -34 19 -22L17 -19Q0 -30 -17 -19Z", mix(q.a, "#fff", 0.5), ' opacity=".7"'); },
    pad: function (q) { return RC(-10, -5.5, 20, 11, 5, q.m, 1.3) + L("M-6 -1H-2M-4 -3V1", "#fff", 1.2) + CI(4, -2, 1.1, q.a, 0.6) + CI(7, 1, 1.1, "#fff", 0.6); },
    phone: function (q) { return RC(-3.6, -8, 7.2, 13, 1.6, "#3a3a4f", 1.1) + RC(-2.6, -6.6, 5.2, 9.6, 0.8, "#8fd0ff", 0); },
    bouquet: function (q) { var s = L("M0 2L-6 -14M0 2L0 -18M0 2L6 -14", "#4e9b57", 1.5); [[-6, -16, q.a], [0, -21, "#fff"], [6, -16, mix(q.a, "#ffd23f", 0.5)]].forEach(function (f) { s += CI(f[0], f[1], 4.3, f[2], 1.1) + CI(f[0], f[1], 1.5, "#ffd23f", 0); }); return s + PG([[-4, 2], [4, 2], [2, 10], [-2, 10]], "#f6efe0", 1); },
    wrench: function (q) { return PO("M-2 -6H2V14H-2Z", "#b7c1d1", 1.1) + PO("M-5 -6Q-6 -15 0 -16Q6 -15 5 -6L2.6 -6L2.6 -10L-2.6 -10L-2.6 -6Z", "#b7c1d1", 1.2) + RC(-2.4, 8, 4.8, 5, 1, q.a, 0.8); },
    bottle: function (q) { return RC(-3.6, -10, 7.2, 15, 2.4, "#bfe6ff", 1.2) + RC(-2.6, -13, 5.2, 3.4, 1, q.a, 1) + P("M-3 -3H3V3H-3Z", q.a, ' opacity=".5"'); },
    map: function (q) { return RC(-10, -8, 20, 16, 1.6, "#f7e8bf", 1.2) + L("M-6 -3Q-1 -6 3 -2T7 3M-6 3H1", "#b48a4a", 0.9) + CI(5, -3, 1.3, "#e5484d", 0) + RC(-11, -9, 3, 18, 1.4, "#d9b878", 1); },
    orb: function (q) { return '<circle cx="0" cy="-11" r="11" fill="' + q.a + '" opacity=".28"/>' + CI(0, -11, 5.4, mix(q.a, "#fff", 0.45), 1.2) + CI(-1.6, -12.6, 1.4, "#fff", 0); }
  };

  /* ---------- アクセサリー（b=うしろ f=まえ） ---------- */
  var AC = {
    cape: function (d) { var cc = d.cc || d.c[2]; return { b: PO("M39 66Q25 92 22 119Q45 128 71 116Q69 90 61 66Z", cc, 1.5) + P("M39 66Q28 90 26 114Q34 96 43 72Z", mix(cc, "#000", 0.22)) + L("M24 116Q46 124 68 114", mix(cc, "#fff", 0.35), 1.4), f: CI(42, 66, 2.2, d.c[2] === cc ? "#ffd23f" : d.c[2], 1) + CI(58, 66, 2.2, d.c[2] === cc ? "#ffd23f" : d.c[2], 1) + L("M42 66Q50 69 58 66", d.c[2], 1.4) }; },
    wingA: function (d) {
      var w = "M58 72C68 56 84 44 96 46C99 54 92 60 95 66C93 72 89 74 89 80C85 84 81 84 79 90C72 91 66 87 60 84Z", wi = "M60 75C70 63 82 55 92 54C90 62 86 66 86 72C80 75 74 77 66 81Z", rb = "";
      if (d.rb) rb = L("M96 47C99 54 92 60 95 66", "#ff7aa8", 1.6) + L("M93 48C96 54 89 60 92 66", "#ffd23f", 1.3) + L("M90 50C93 56 87 60 89 66", "#7be0a0", 1.3) + L("M87 52C89 57 84 61 86 66", "#7ab8ff", 1.3);
      var one = PO(w, d.wc || "#fff", 1.5) + P(wi, mix(d.wc || "#fff", "#ffe6f3", 0.6), ' opacity=".9"') + rb + L("M62 76C72 68 82 62 90 60", mix(d.wc || "#fff", "#8ea0c0", 0.45), 0.9);
      return { b: one + MR(one), f: "" };
    },
    wingD: function (d) {
      var one = PO("M58 72L70 40L75 52L83 32L87 47L97 30L95 60L91 71L94 84L81 77L75 88L69 78L60 82Z", d.wc || "#c8321e", 1.5) + L("M60 74L70 40M60 74L83 32M60 74L97 30", mix(d.wc || "#c8321e", "#000", 0.4), 1.4) + P("M75 52L80 58L75 70L69 62Z", mix(d.wc || "#c8321e", "#ffd23f", 0.3), ' opacity=".55"');
      return { b: one + MR(one), f: "" };
    },
    backpack: function (d) { return { b: RC(33, 66, 34, 32, 7, d.bp || d.c[2], 1.5) + RC(36, 88, 28, 8, 3, mix(d.bp || d.c[2], "#000", 0.15), 1), f: L("M43 65.5L41.5 86M57 65.5L58.5 86", mix(d.bp || d.c[2], "#000", 0.25), 2.2) }; },
    headphones: function (d) { var a = d.c[2]; return { b: "", f: L("M31 46Q30 14 50 14Q70 14 69 46", K, 4.6) + L("M31 46Q30 14 50 14Q70 14 69 46", a, 2.6) + EL(30.5, 46.5, 4.2, 6.6, a, 1.4) + EL(69.5, 46.5, 4.2, 6.6, a, 1.4) + EL(30.5, 46.5, 1.8, 3.2, mix(a, "#fff", 0.45), 0) + EL(69.5, 46.5, 1.8, 3.2, mix(a, "#fff", 0.45), 0) }; },
    cap: function (d) { var a = d.hat || d.c[2]; return { b: "", f: PO("M30.5 34C30.5 15 69.5 15 69.5 34Q50 30 30.5 34Z", a, 1.5) + PO("M58 31.5Q79 29 82 36Q68 40 56 36.5Z", mix(a, "#000", 0.15), 1.4) + CI(50, 21, 2.2, "#fff", 0) + L("M50 15.5V29", mix(a, "#000", 0.25), 0.8) }; },
    beanie: function (d) { var a = d.hat || d.c[2]; return { b: "", f: PO("M30 35C29 12 71 12 70 35Q50 31 30 35Z", a, 1.5) + PO("M29.5 32Q50 27 70.5 32L71 38Q50 33 29 38Z", mix(a, "#fff", 0.25), 1.3) + CI(50, 12.5, 3.2, mix(a, "#fff", 0.35), 1.2) }; },
    beret: function (d) { var a = d.hat || d.c[2]; return { b: "", f: PO("M28 30C26 12 60 8 70 22C72 30 60 32 50 31C40 33 30 34 28 30Z", a, 1.5) + L("M62 12L64 6", a, 2) + L("M62 12L64 6", K, 0.8) }; },
    safari: function (d) { var a = d.hat || "#d8b46a"; return { b: "", f: PO("M31 32C29 10 71 10 69 32Z", a, 1.5) + PO("M19 33Q50 26 81 33Q78 40 50 38Q22 40 19 33Z", mix(a, "#000", 0.08), 1.5) + RC(30.5, 26.5, 39, 4.5, 0, d.c[2], 1) }; },
    witch: function (d) { var a = d.hat || d.c[0]; return { b: "", f: PO("M14 30Q50 20 86 30Q88 39 50 37Q12 39 14 30Z", a, 1.6) + PO("M30 30Q34 12 44 -4Q52 -12 66 -14Q56 -6 60 10Q64 20 70 30Q50 26 30 30Z", a, 1.6) + PO("M31 27Q50 22 69.5 27L70 31Q50 27 30.5 31Z", d.c[2], 1.1) + '<path class="jka-tw" d="M50 5Q50 10 55 10Q50 10 50 15Q50 10 45 10Q50 10 50 5Z" fill="#ffd93b"/>' }; },
    goggles: function (d) { var a = d.c[2]; return { b: "", f: L("M31 27Q50 21 69 27", K, 4.4) + L("M31 27Q50 21 69 27", "#6b4a34", 2.6) + CI(42, 24.5, 5.4, "#4a3b3b", 1.3) + CI(58, 24.5, 5.4, "#4a3b3b", 1.3) + CI(42, 24.5, 3.5, mix(a, "#9fd0ff", 0.5), 0.8) + CI(58, 24.5, 3.5, mix(a, "#9fd0ff", 0.5), 0.8) + CI(41, 23.4, 1, "#fff", 0) + CI(57, 23.4, 1, "#fff", 0) }; },
    glasses: function () { return { b: "", f: RC(33.2, 39.6, 15.4, 11.4, 4.6, "#cfe8ff", 1.3).replace('fill="#cfe8ff"', 'fill="#cfe8ff" fill-opacity=".22"') + RC(51.4, 39.6, 15.4, 11.4, 4.6, "#cfe8ff", 1.3).replace('fill="#cfe8ff"', 'fill="#cfe8ff" fill-opacity=".22"') + L("M48.6 44H51.4", K, 1.3) + L("M33.2 43L30.6 41.6M66.8 43L69.4 41.6", K, 1.2) }; },
    scarf: function (d) { var a = d.sf || d.c[2]; return { b: "", f: PO("M37 63Q50 71 63 63L64 68Q50 77 36 68Z", a, 1.5) + PO("M56 68L64 72Q76 86 84 84Q80 96 70 92Q64 84 54 74Z", a, 1.4) + L("M60 72Q70 80 80 87", mix(a, "#fff", 0.4), 1) }; },
    foxmask: function () { return { b: "", f: PO("M60 20Q70 18 72 26Q74 36 68 38Q62 36 60 30Z", "#fff", 1.3) + PG([[62, 20], [63, 12], [68, 19]], "#fff", 1.1) + L("M63.5 24Q66 28 64.5 32", "#e5484d", 1.4) + L("M67 23Q69 27 68 31", "#e5484d", 1.4) + CI(66.5, 34.4, 1, K, 0) }; },
    catears: function (d) { var a = d.hat || d.c[0]; return { b: "", f: PO("M33 30L34 8L47 20Z", a, 1.5) + PO("M67 30L66 8L53 20Z", a, 1.5) + P("M36.5 24L37 14L43 20Z M63.5 24L63 14L57 20Z", "#ff9fc4") }; },
    horns: function (d) { var a = d.horn || "#ffd23f"; return { b: "", f: PO("M36 22Q30 12 32 3Q40 8 44 19Z", a, 1.4) + PO("M64 22Q70 12 68 3Q60 8 56 19Z", a, 1.4) }; },
    halo: function () { return { b: "", f: '<ellipse cx="50" cy="6" rx="14" ry="3.6" fill="none" stroke="#ffd93b" stroke-width="3.4" opacity=".95"/><ellipse cx="50" cy="6" rx="14" ry="3.6" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>' }; },
    crown: function (d) { var a = d.crn || "#ffd93b"; return { b: "", f: PO("M36 22L39 8L45 16L50 5L55 16L61 8L64 22Q50 18 36 22Z", a, 1.4) + CI(50, 15, 1.6, d.c[2], 0.8) + CI(39, 11, 1, "#fff", 0) + CI(61, 11, 1, "#fff", 0) }; },
    tiara: function (d) { var a = d.crn || "#dff1ff"; return { b: "", f: PO("M38 24L41 13L46 20L50 11L54 20L59 13L62 24Q50 20 38 24Z", a, 1.3) + CI(50, 17.5, 1.6, "#7ab8ff", 0.8) }; },
    ribbon: function (d) { var a = d.rbn || d.c[2]; return { b: "", f: PG([[62, 22], [72, 14], [73, 27]], a, 1.2) + PG([[62, 22], [70, 32], [60, 30]], a, 1.2) + CI(62, 22, 2.4, mix(a, "#fff", 0.35), 1.1) }; },
    band: function (d) { var a = d.c[2]; return { b: "", f: PO("M30 32Q50 24 70 32L70.5 37Q50 30 29.5 37Z", a, 1.3) + P("M66 33.5L74 34L72 41Z", a) }; },
    earring: function (d) { return { b: "", f: CI(31, 53, 1.8, "#ffd93b", 0.9) + CI(69, 53, 1.8, "#ffd93b", 0.9) }; },
    sunhead: function () { return { b: "", f: PO("M35 27Q50 22 65 27L66 31Q50 27 34 31Z", "#3a3a4f", 1.1) + L("M50 24.5V28.5", K, 1) }; },
    elfear: function () { return { b: PG([[30, 43], [19, 39], [30, 52]], "#ffe0cc", 1.3) + PG([[70, 43], [81, 39], [70, 52]], "#ffe0cc", 1.3), f: "" }; },
    sheath: function (d) { return { b: "", f: '<g transform="rotate(-62 60 92)">' + PO("M58 89H80V94.5H58Z", "#3a3350", 1.2) + RC(52, 88.4, 6.5, 7, 2, d.c[2], 1.1) + '</g>' }; },
    petals: function () { return { b: "", f: "" }; }
  };

  /* ---------- 演出（まわりに舞うもの） ---------- */
  var FXS = {
    flame: function (c) { return P("M0 -1Q.9 -.2 .5 .5Q0 1.1 -.5 .5Q-.9 -.2 0 -1Z", c); },
    drop: function (c) { return P("M0 -1C.7 -.2 .8 .5 0 .8C-.8 .5 -.7 -.2 0 -1Z", c); },
    bolt: function (c) { return P("M.3 -1L-.5 .1L0 .1L-.3 1L.6 -.2L.1 -.2Z", c); },
    leaf: function (c) { return P("M0 -1Q.9 -.3 0 1Q-.9 -.3 0 -1Z", c); },
    snow: function (c) { return L("M0 -1V1M-.87 -.5L.87 .5M-.87 .5L.87 -.5", c, 0.28); },
    star: function (c) { return P("M0 -1Q0 0 1 0Q0 0 0 1Q0 0 -1 0Q0 0 0 -1Z", c); },
    petal: function (c) { return P("M0 -1Q.8 -.3 0 1Q-.8 -.3 0 -1Z", c); }
  };
  var FXPOS = [[12, 34, 5, 0], [88, 30, 4.5, 0.4], [9, 76, 4, 0.8], [91, 82, 5, 1.2], [17, 118, 4.5, 0.6], [85, 116, 4, 1], [26, 14, 4, 1.4], [76, 12, 4.5, 0.2], [50, 4, 3.6, 0.9]];
  function fxLayer(t, col, n) {
    var s = "", i, cols = Array.isArray(col) ? col : [col];
    for (i = 0; i < n; i++) {
      var p = FXPOS[i], rot = (i * 47) % 90 - 30;
      s += '<g transform="translate(' + p[0] + " " + p[1] + ") rotate(" + rot + ") scale(" + p[2] + ')"><g class="jka-tw" style="animation-delay:' + p[3] + 's">' + FXS[t](cols[i % cols.length]) + "</g></g>";
    }
    return s;
  }

  /* ---------- キャラデータ ---------- */
  // c=[メイン,サブ,アクセント,下半身,くつ] sk=肌 h=髪 hs=髪型 e=[虹彩色,目つき] m=口 o=服 sl=そで lg=脚 st=足の開き po=ポーズ pr=[持ち物,手,角度,倍率,色ヒント] ac=アクセ
  var D = [
    { id: "n01", n: "ソラ", r: "N", f: "風をきって坂道ダッシュ。宿題は、あとで。", sk: "#f6d3b6", h: "#2f3c66", hs: "spiky", e: ["#4a90e0", "sharp"], m: "smirk", o: "hoodie", c: ["#ff7a59", "#fff4ea", "#2b2340", "#3c4a6e", "#f2f2f2"], po: 0, pr: ["board", "r", 6, 1, "#4ad0c0"], ac: ["cap"], hat: "#2b2340", lean: 2 },
    { id: "n02", n: "ミオ", r: "N", f: "ずっとイヤホン。呼ぶと3回目で気づく。", sk: "#fbdcc8", h: "#8b6de0", hs: "twin", e: ["#b06ae8", "calm"], m: "smile", o: "hoodie", c: ["#5b4a9e", "#fff", "#ffd93b", "#2f2a4a", "#ff8fb6"], lg: "shorts", po: 0, pr: ["phone", "r", 0, 1], ac: ["headphones"], lean: 0 },
    { id: "n03", n: "カイト", r: "N", f: "文化祭ライブに向けて、指が痛くなるまで特訓中。", sk: "#f2cdb0", h: "#3b2b2b", hs: "wolf", e: ["#e0553a", "sharp"], m: "open", o: "jacket", c: ["#3d4b8f", "#f4f4f8", "#ffb02e", "#22233a", "#e8e8ee"], po: 9, pr: ["guitar", "c", -24, 1, "#e5484d"], st: 1, lean: -2 },
    { id: "n04", n: "リン", r: "N", f: "ラテアートは3回に1回だけ成功する。", sk: "#fbdcc8", h: "#a8543a", hs: "bob", e: ["#8a5a3c", "bright"], m: "smile", o: "apron", c: ["#7a4a3a", "#fff8ee", "#c98a5a", "#3a2f4d", "#5a3d34"], po: 3, pr: ["tray", "r", 0, 1, "#f2a05a"], ac: ["ribbon"], rbn: "#c98a5a", lean: 0 },
    { id: "n05", n: "ダイチ", r: "N", f: "焚き火の前だと、なぜかよくしゃべる。", sk: "#e7b58f", h: "#7a5230", hs: "short", e: ["#5a8a3c", "calm"], m: "smile", o: "jacket", c: ["#4f7a4a", "#e8dfc8", "#e8a23a", "#5a4a3a", "#7a5a3a"], bt: "#7a5a3a", po: 0, pr: ["lantern", "r", 0, 1, "#ff9a3a"], ac: ["beanie", "backpack"], hat: "#e8a23a", bp: "#8a6a3a", lean: 0 },
    { id: "n06", n: "ナナ", r: "N", f: "今日もベストショットを探して街を歩く。", sk: "#fbdcc8", h: "#4a3328", hs: "long", e: ["#7a5a3c", "bright"], m: "smile", o: "dress", c: ["#f4ecdd", "#cf5a6a", "#ffd0a0", "#fff", "#ffffff"], lg: "skirtsock", po: 9, pr: ["camera", "c", 0, 1, "#ff8a5a"], ac: ["beret"], hat: "#cf5a6a", lean: 0 },
    { id: "n07", n: "ヒビキ", r: "N", f: "マイク片手に、韻をふむのが日課。", sk: "#e7b58f", h: "#d9dfe8", hs: "sweep", e: ["#3ac0d0", "sharp"], m: "open", o: "tank", c: ["#2b2b3d", "#fff", "#ffd93b", "#5a6a8a", "#ffd93b"], sl: "none", lg: "pants", po: 3, pr: ["mic", "r", 0, 1.1, "#ffd93b"], ac: ["earring", "sunhead"], st: 1, lean: 4 },
    { id: "n08", n: "ユズ", r: "N", f: "雨の日ほどテンションが上がるタイプ。", sk: "#fbdcc8", h: "#c47a3a", hs: "bob", e: ["#e0a030", "bright"], m: "open", o: "coat", c: ["#ffd23f", "#fff", "#2f80ed", "#fff", "#2f80ed"], bt: "#3a7be0", lg: "robe", po: 0, pr: ["umbrella", "r", 12, 0.8, "#5b9bff"], lean: 0 },
    { id: "n09", n: "トウマ", r: "N", f: "本を読み出すと、声をかけても届かない。", sk: "#f6d3b6", h: "#262638", hs: "sweep", e: ["#6a7ad8", "calm"], m: "flat", o: "jacket", tie: 1, c: ["#2f3e5c", "#ffffff", "#c9364a", "#5a6478", "#2b2340"], po: 9, pr: ["book", "c", 0, 1, "#c9364a"], ac: ["glasses"], lean: 0 },
    { id: "n10", n: "サキ", r: "N", f: "マフラーの巻き方には、ちょっとうるさい。", sk: "#fbdcc8", h: "#8a5a3a", hs: "pony", e: ["#c45a6a", "sharp"], m: "smirk", o: "jacket", tie: 1, c: ["#3a3f58", "#fff", "#e5484d", "#4a4f6a", "#ffffff"], lg: "skirtsock", po: 1, ac: ["scarf"], sf: "#e5484d", st: 1, lean: -2 },
    { id: "n11", n: "レイジ", r: "N", f: "無口でクール。でも猫には話しかける。", sk: "#f2cdb0", h: "#1f1f2b", hs: "wolf", e: ["#c03a4a", "sharp"], m: "flat", o: "coat", c: ["#2a2a38", "#e8e8f0", "#8a8fa8", "#22222e", "#2a2a38"], lg: "robe", po: 7, ac: ["earring", "scarf"], sf: "#8a8fa8", st: 1, lean: 0 },
    { id: "n12", n: "アカリ", r: "N", f: "リズムに乗れば、どこでもステージ。", sk: "#f6d3b6", h: "#e8743a", hs: "bun", e: ["#ff8a3a", "wink"], m: "open", o: "tank", c: ["#ff5a8a", "#fff", "#fff", "#2b2b3d", "#ffffff"], sl: "none", lg: "shortsock", po: 5, ac: ["band"], st: 2, lean: 3 },
    { id: "n13", n: "テツ", r: "N", f: "直せないものは、たぶんこの世にない。", sk: "#e0a880", h: "#c99a4a", hs: "spiky", e: ["#5a8ad0", "bright"], m: "smirk", o: "overall", c: ["#3c6ea8", "#f4f0e6", "#ffb02e", "#3c6ea8", "#6a4a34"], bt: "#6a4a34", sl: "short", po: 0, pr: ["wrench", "r", 18, 1.1, "#e5484d"], ac: ["goggles"], st: 1, lean: -2 },
    { id: "n14", n: "モモ", r: "N", f: "お祭りの夜にだけ、本気を出す。", sk: "#fbdcc8", h: "#f0a0b8", hs: "long", e: ["#e0507a", "bright"], m: "smile", o: "haori", sl: "wide", c: ["#e8506a", "#fff3f6", "#ffd23f", "#3a2f4d", "#d8b078"], lg: "shorts", po: 3, pr: ["fan", "r", 0, 0.9, "#ffb0c8"], ac: ["foxmask"], lean: 0 },
    { id: "n15", n: "ジン", r: "N", f: "矢を放つ前の静けさが、いちばん好き。", sk: "#f2cdb0", h: "#20202e", hs: "pony", e: ["#4a4a6a", "calm"], m: "flat", o: "haori", sl: "wide", c: ["#f5f5ee", "#f5f5ee", "#2b2f45", "#2b2f45", "#f5f5ee"], lg: "hakama", po: 0, pr: ["bow", "r", 0, 1.05, "#2b2f45"], lean: 0 },
    { id: "n16", n: "エマ", r: "N", f: "地図のはしっこまで行ってみたい。", sk: "#f6d3b6", h: "#e6b95a", hs: "pony", e: ["#3aa080", "bright"], m: "smile", o: "jacket", c: ["#c8a862", "#fff8e6", "#4f7a4a", "#8a6a3a", "#6a4a34"], bt: "#6a4a34", lg: "shorts", po: 9, pr: ["map", "c", 0, 1, "#c8a862"], ac: ["safari"], hat: "#d8b46a", lean: 0 },
    { id: "n17", n: "ハル", r: "N", f: "花のことなら、朝までだって語れる。", sk: "#f6d3b6", h: "#3e6b4a", hs: "short", e: ["#48a06a", "calm"], m: "smile", o: "apron", c: ["#8fc9a0", "#f4efe0", "#e5567a", "#4a5a4a", "#f2f2f2"], po: 3, pr: ["bouquet", "r", 0, 1, "#ff7aa8"], lean: 0 },
    { id: "n18", n: "ケント", r: "N", f: "毎朝5キロ。ゴール後のパンが目的。", sk: "#e0a880", h: "#c8523a", hs: "spiky", e: ["#e07a3a", "bright"], m: "open", o: "tee", sl: "short", c: ["#f4f4f8", "#fff", "#e5484d", "#2b3a6a", "#e5484d"], lg: "shorts", po: 4, pr: ["bottle", "r", 10, 1, "#2f9bff"], ac: ["band"], st: 2, lean: -6 },
    { id: "n19", n: "ルカ", r: "N", f: "ゴーグルの下の目は、いつも空を見ている。", sk: "#fbdcc8", h: "#cfd8e6", hs: "bob", e: ["#5ab0e8", "sharp"], m: "smirk", o: "jacket", c: ["#8a5a3c", "#efe6d8", "#f4f4f8", "#3a3f58", "#3a2f2f"], bt: "#3a2f2f", po: 1, ac: ["goggles", "scarf"], sf: "#f4f4f8", st: 1, lean: -2 },
    { id: "n20", n: "シオン", r: "N", f: "夜ふかしは得意。朝は、ぜんぜんダメ。", sk: "#fbdcc8", h: "#3a3560", hs: "long", e: ["#8a7ae8", "calm"], m: "flat", o: "hoodie", c: ["#2f2f48", "#fff", "#ff8fb6", "#22223a", "#ff8fb6"], lg: "shorts", po: 9, pr: ["pad", "c", 0, 1, "#ff8fb6"], ac: ["catears"], hat: "#2f2f48", lean: 0 },
    // レア（8）
    { id: "r01", n: "ホムラ", r: "R", f: "剣に宿る炎は、やる気のバロメーター。", sk: "#f2cdb0", h: "#e5482d", hs: "spiky", e: ["#ffb02e", "sharp"], m: "smirk", o: "coat", c: ["#b5261e", "#2b2340", "#ffb02e", "#2b2340", "#3a2f4d"], lg: "robe", po: 4, pr: ["greatsword", "r", 24, 1.05, "#ffb02e", "#ff7a2b"], ac: ["scarf"], sf: "#ff5a2b", st: 1, lean: -4, bg: "#ff7a2b", fx: ["flame", ["#ff7a2b", "#ffb02e"], 6] },
    { id: "r02", n: "シズク", r: "R", f: "しずかな水面のように、迷いなく杖をふる。", sk: "#fbdcc8", h: "#79c6f0", hs: "long", e: ["#2a7bd6", "calm"], m: "smile", o: "robe", sl: "wide", c: ["#2f6fd0", "#e8f6ff", "#7be0ff", "#2f6fd0", "#e8f6ff"], po: 0, pr: ["staff", "r", 0, 1, "#43c8ff"], ac: ["tiara"], crn: "#dff1ff", lean: 0, bg: "#43a8ff", fx: ["drop", ["#7be0ff", "#bfeeff"], 6] },
    { id: "r03", n: "ライカ", r: "R", f: "走れば雷鳴、止まれば静電気。", sk: "#f6d3b6", h: "#ffd93b", hs: "pony", e: ["#f0b400", "sharp"], m: "open", o: "jacket", sl: "short", c: ["#23233d", "#f4f4f8", "#ffe45c", "#23233d", "#ffe45c"], lg: "shorts", bt: "#ffe45c", po: 4, pr: ["spear", "r", 28, 0.9, "#ffe45c"], ac: ["band"], st: 2, lean: -5, bg: "#ffd93b", fx: ["bolt", ["#ffe45c", "#fff"], 6] },
    { id: "r04", n: "エルナ", r: "R", f: "森の声を聞き分ける、風のような弓使い。", sk: "#ffe0cc", h: "#8fe0a8", hs: "long", e: ["#3ab86a", "sharp"], m: "smirk", o: "jacket", c: ["#3f8a55", "#f0ecd8", "#e8c86a", "#5a4a3a", "#6a4a34"], bt: "#6a4a34", cc: "#2f7a4a", po: 0, pr: ["bow", "r", 0, 1.05, "#e8c86a"], ac: ["cape", "elfear"], st: 1, lean: -2, bg: "#48c878", fx: ["leaf", ["#7be09a", "#b6f0c0"], 6] },
    { id: "r05", n: "ユキノ", r: "R", f: "凍てつく剣さばき。笑うと粉雪が舞う。", sk: "#fff0e6", h: "#e6f0ff", hs: "long", e: ["#6ab0ff", "sharp"], m: "smirk", o: "dress", c: ["#e4eeff", "#a8c4f0", "#7ab8ff", "#fff", "#ffffff"], lg: "skirtsock", cc: "#8fb8f0", po: 4, pr: ["rapier", "r", 22, 1, "#7ab8ff"], ac: ["cape", "tiara"], crn: "#cfe8ff", lean: -3, bg: "#8fc4ff", fx: ["snow", ["#ffffff", "#cfe8ff"], 7] },
    { id: "r06", n: "ヨル", r: "R", f: "星の動きで明日を占う、夜の魔女。", sk: "#fbdcc8", h: "#3a2a6a", hs: "bob", e: ["#ffd93b", "calm"], m: "smirk", o: "dress", c: ["#46318a", "#2c1f5e", "#ffd93b", "#fff", "#ffffff"], lg: "skirtsock", cc: "#5a3ea8", hat: "#46318a", po: 3, pr: ["wand", "r", 0, 1, "#ffd93b"], ac: ["cape", "witch"], lean: 2, bg: "#8a6cf0", fx: ["star", ["#ffd93b", "#fff", "#c9b8ff"], 7] },
    { id: "r07", n: "サクヤ", r: "R", f: "扇をひらけば、桜ふぶきが舞いおどる。", sk: "#fff0e6", h: "#f2a0c0", hs: "long", e: ["#e0507a", "bright"], m: "smile", o: "haori", sl: "wide", c: ["#ffb8d0", "#fff8fb", "#d94f7f", "#8a3a6a", "#f4dfe6"], lg: "hakama", po: 3, pr: ["fan", "r", 0, 1, "#ff8fb6"], ac: ["ribbon"], rbn: "#d94f7f", lean: 2, bg: "#ff8fb6", fx: ["petal", ["#ffb8d0", "#ff8fb6", "#fff"], 8] },
    { id: "r08", n: "シロガネ", r: "R", f: "折れない剣と盾で、みんなの前に立つ騎士。", sk: "#f2cdb0", h: "#dfe6ef", hs: "short", e: ["#4a7fd8", "sharp"], m: "smirk", o: "armor", sl: "long", c: ["#cfd8e6", "#8ea0bd", "#e5b83a", "#5a6b8a", "#8ea0bd"], gl: "#cfd8e6", cc: "#c9364a", bt: "#8ea0bd", po: 4, pr: ["sword", "r", 26, 1.05, "#e5b83a"], ac: ["cape"], st: 1, lean: -2, bg: "#7a9ae0", fx: ["star", ["#ffe27a", "#fff", "#bcd0ff"], 6], shield: 1 },
    // スーパーレア（2）
    { id: "s01", n: "ニジカ", r: "SR", f: "七色の翼で歌えば、空にきらめく虹がかかる。", sk: "#fff0e6", h: "#ffb3e6", hs: "twin", e: ["#7ab8ff", "bright"], m: "open", o: "dress", c: ["#ffffff", "#ffd6f0", "#ff7aa8", "#fff", "#ffffff"], lg: "skirtsock", wc: "#ffffff", rb: 1, po: 3, pr: ["mic", "r", 0, 1.15, "#ff7aa8"], ac: ["wingA", "halo", "ribbon"], rbn: "#7ab8ff", st: 2, lean: 3, bg: "#ff9fd8", fx: ["star", ["#ff7aa8", "#ffd93b", "#7be0a0", "#7ab8ff", "#fff"], 9] },
    { id: "s02", n: "アカツキ", r: "SR", f: "夜明けを呼ぶ竜の剣士。その一閃は朝日より熱い。", sk: "#f2cdb0", h: "#7a1d2f", hs: "wolf", e: ["#ffce3a", "sharp"], m: "smirk", o: "coat", c: ["#2b1f3a", "#ff5a2e", "#ffc93b", "#22182e", "#ffc93b"], lg: "robe", wc: "#d8402a", horn: "#ffc93b", po: 4, pr: ["greatsword", "r", 24, 1.15, "#ffc93b", "#ff7a2b"], ac: ["wingD", "horns"], st: 1, lean: -5, bg: "#ff7a2b", fx: ["flame", ["#ff7a2b", "#ffc93b", "#fff2b0"], 9] }
  ];

  var BYID = {}, BYR = { N: [], R: [], SR: [] };
  D.forEach(function (d) { BYID[d.id] = d; BYR[d.r].push(d.id); });

  /* ---------- 組み立て ---------- */
  function build(d) {
    var c = d.c, i, back = "", front = "", s = "", hd = HAIR[d.hs](), hc = d.h, q = { m: d.pm || c[0], a: c[2], b: c[1], w: null };
    (d.ac || []).forEach(function (k) { var o = AC[k](d); back += o.b; front += o.f; });
    var pr = d.pr, prop = "", pos = POSE[d.po], armL = arm("l", d.po, d), armR = arm("r", d.po, d);
    if (pr) {
      var Q = { m: pr[4] || c[0], a: pr[4] || c[2], fire: pr[5] || null, w: null };
      if (pr[0] === "sword" || pr[0] === "rapier") Q.a = pr[4] || c[2];
      if (pr[0] === "bow") Q.w = "#a8703f";
      var hp = pr[1] === "c" ? [50, 82] : pr[1] === "l" ? armL.hand : armR.hand;
      prop = '<g transform="translate(' + hp[0] + " " + hp[1] + ") rotate(" + (pr[2] || 0) + ") scale(" + (pr[3] || 1) + ')">' + PR[pr[0]](Q) + "</g>";
    }
    var shield = "";
    if (d.shield) { var hl = armL.hand; shield = '<g transform="translate(' + (hl[0] - 3) + " " + (hl[1] - 4) + ') rotate(-8) scale(.95)">' + PR.shield({ m: c[0], a: c[2] }) + "</g>"; }
    // 背面
    s += back + hd.b;
    // 体
    s += legs(d);
    s += OUT[d.o](c, d);
    if (d.o === "hoodie") s += "";
    // 腕（クロス以外はそのまま）
    s += armR.arm + armL.arm;
    s += prop;
    s += hand(armR.hand, d) + hand(armL.hand, d) + shield;
    // 首・頭
    s += '<rect x="46.4" y="58" width="7.2" height="8" fill="' + mix(d.sk, "#a05a4a", 0.22) + '"/>';
    s += EL(31, 46.5, 2.6, 4, d.sk, 1.3) + EL(69, 46.5, 2.6, 4, d.sk, 1.3);
    s += PO("M30.6 41C30.6 26 40 22 50 22C60 22 69.4 26 69.4 41C69.4 51 62.5 60 50 62.4C37.5 60 30.6 51 30.6 41Z", d.sk, 1.7);
    s += EL(37.2, 52.2, 3.6, 1.7, "#ff8fa3", 0).replace("/>", ' opacity=".38"/>') + EL(62.8, 52.2, 3.6, 1.7, "#ff8fa3", 0).replace("/>", ' opacity=".38"/>');
    s += L("M50 49.6l-.9 1.6h1.7", mix(d.sk, "#a05a4a", 0.5), 0.8);
    var t = d.e[1];
    s += eye(t, d.e[0], 41.2, 45, -1, hc) + eye(t, d.e[0], 58.8, 45, 1, hc) + mouth(d.m);
    // 髪（前）
    s += PO(hd.f, hc, 1.7) + L("M35.5 26Q50 16.5 64.5 26", "#fff", 2.2, ' opacity=".34"');
    if (d.hs === "twin") s += CI(31, 29, 3.2, d.c[2], 1.1) + CI(69, 29, 3.2, d.c[2], 1.1);
    if (d.hs === "pony") s += CI(62.5, 21.5, 3, d.c[2], 1.1);
    if (d.hs === "bun") s += CI(50, 17, 2.6, d.c[2], 1.1);
    s += front;
    return s;
  }

  function frame(d, inner) {
    var id = "jf" + (++uid), r = d.r, b = d.bg || d.c[0], defs = "", bg, deco = "", fx = "", sub = "";
    if (r === "N") {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mix(b, "#ffffff", 0.9) + '"/><stop offset="1" stop-color="' + mix(b, "#ffffff", 0.66) + '"/></linearGradient><clipPath id="' + id + 'c"><rect width="100" height="150" rx="14"/></clipPath>';
      bg = '<rect width="100" height="150" rx="14" fill="url(#' + id + 'g)"/><g clip-path="url(#' + id + 'c)"><circle cx="50" cy="76" r="46" fill="#fff" opacity=".5"/><path d="M-10 60L60 -10M10 80L80 10M40 110L110 40" stroke="#fff" stroke-width="7" opacity=".28"/><ellipse cx="50" cy="146" rx="42" ry="9" fill="' + mix(b, "#000", 0.2) + '" opacity=".16"/></g>';
      deco = '<rect x="0.8" y="0.8" width="98.4" height="148.4" rx="13.4" fill="none" stroke="' + mix(b, "#ffffff", 0.2) + '" stroke-width="1.6"/>';
      return "<defs>" + defs + "</defs>" + bg + '<g clip-path="url(#' + id + 'c)">' + inner + "</g>" + deco;
    }
    if (r === "R") {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(b, "#ffffff", 0.82) + '"/><stop offset="1" stop-color="#a9c4f7"/></linearGradient><radialGradient id="' + id + 'r"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="' + mix(b, "#ffffff", 0.45) + '" stop-opacity=".5"/><stop offset="1" stop-color="' + b + '" stop-opacity="0"/></radialGradient><clipPath id="' + id + 'c"><rect width="100" height="150" rx="14"/></clipPath>';
      bg = '<rect width="100" height="150" rx="14" fill="url(#' + id + 'g)"/><g clip-path="url(#' + id + 'c)"><circle cx="50" cy="80" r="62" fill="url(#' + id + 'r)"/><path d="M-10 40L70 -20M-10 90L110 0M20 150L110 60" stroke="#fff" stroke-width="6" opacity=".25"/>' +
        '<ellipse cx="50" cy="143" rx="36" ry="7.5" fill="none" stroke="#5b8def" stroke-width="1.8" opacity=".85"/><ellipse cx="50" cy="143" rx="27" ry="5" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="3 3" opacity=".9"/></g>';
      deco = '<rect x="2" y="2" width="96" height="146" rx="12.6" fill="none" stroke="#5b8def" stroke-width="3"/><rect x="5.6" y="5.6" width="88.8" height="138.8" rx="10" fill="none" stroke="#fff" stroke-width="1.2" opacity=".9"/>' +
        sp(10, 12, 5.5, "#fff", 0) + sp(90, 20, 4.5, "#fff", 0.5) + sp(9, 96, 4, "#fff", 1) + sp(91, 132, 5.5, "#fff", 1.4);
      if (d.fx) fx = fxLayer(d.fx[0], d.fx[1], d.fx[2]);
      return "<defs>" + defs + "</defs>" + bg + '<g clip-path="url(#' + id + 'c)">' + inner + fx + "</g>" + deco;
    }
    var rays = ""; for (var k = 0; k < 14; k++) { var a0 = k * Math.PI / 7; rays += '<polygon points="50,80 ' + (50 + 130 * Math.cos(a0 - 0.1)).toFixed(1) + "," + (80 + 130 * Math.sin(a0 - 0.1)).toFixed(1) + " " + (50 + 130 * Math.cos(a0 + 0.1)).toFixed(1) + "," + (80 + 130 * Math.sin(a0 + 0.1)).toFixed(1) + '"/>'; }
    defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c2"/><stop offset=".5" stop-color="#ffd76a"/><stop offset="1" stop-color="' + mix(b, "#ff9fc4", 0.5) + '"/></linearGradient><linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a0"/><stop offset=".5" stop-color="#e5a100"/><stop offset="1" stop-color="#fff2a0"/></linearGradient><radialGradient id="' + id + 'r"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".6" stop-color="#fff6c2" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="' + id + 'c"><rect width="100" height="150" rx="14"/></clipPath>';
    bg = '<rect width="100" height="150" rx="14" fill="url(#' + id + 'g)"/><g clip-path="url(#' + id + 'c)"><g class="jka-spin" fill="#fff" opacity=".42">' + rays + '</g><circle cx="50" cy="80" r="64" fill="url(#' + id + 'r)"/>' +
      '<ellipse cx="50" cy="143" rx="38" ry="8" fill="none" stroke="#e5a100" stroke-width="2"/><ellipse cx="50" cy="143" rx="29" ry="5.4" fill="none" stroke="#fff" stroke-width="1.4"/></g>';
    deco = '<rect x="2.4" y="2.4" width="95.2" height="145.2" rx="12.4" fill="none" stroke="url(#' + id + 'b)" stroke-width="4.6"/><rect x="7" y="7" width="86" height="136" rx="9" fill="none" stroke="#fff" stroke-width="1.4" opacity=".9"/>' +
      sp(11, 13, 7, "#fff", 0) + sp(89, 16, 5, "#fff5b0", 0.3) + sp(8, 75, 4, "#fff", 0.8) + sp(93, 80, 5, "#fff", 1.1) + sp(13, 138, 6, "#fff5b0", 0.6) + sp(87, 138, 7, "#fff", 1.5) + sp(30, 8, 3.4, "#fff", 1.2) + sp(72, 143, 3.4, "#fff", 0.2);
    if (d.fx) fx = fxLayer(d.fx[0], d.fx[1], d.fx[2]);
    return "<defs>" + defs + "</defs>" + bg + '<g clip-path="url(#' + id + 'c)">' + inner + fx + "</g>" + deco;
  }

  function figure(d) { return '<g transform="translate(2 9) scale(.96) rotate(' + (d.lean || 0) + ' 50 140)">' + build(d) + "</g>"; }
  function svg(id, size, o) {
    var d = BYID[id]; if (!d) return "";
    o = o || {}; var w = size || 64;
    if (o.bare) return '<svg class="jka jka-' + d.r.toLowerCase() + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 3 100 147" width="' + w + '" height="' + Math.round(w * 1.47) + '" role="img" aria-label="' + d.n + '">' + EL(50, 146, 30, 4.5, "#000", 0).replace("/>", ' opacity=".14"/>') + figure(d) + "</svg>";
    return '<svg class="jka jka-' + d.r.toLowerCase() + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="' + w + '" height="' + Math.round(w * 1.5) + '" role="img" aria-label="' + d.n + '">' + frame(d, figure(d)) + "</svg>";
  }
  function sil(id, size) {
    var d = BYID[id]; if (!d) return "";
    var w = size || 64;
    return '<svg class="jka jka-sil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="' + w + '" height="' + Math.round(w * 1.5) + '" aria-hidden="true"><rect width="100" height="150" rx="14" fill="#e6e9f1"/>' + figure(d) + "</svg>";
  }
  window.JKAvatars = { list: D, get: function (id) { return BYID[id] || null; }, byRarity: BYR, svg: svg, sil: sil, RARITY: { N: "ノーマル", R: "レア", SR: "スーパーレア" } };
})();
