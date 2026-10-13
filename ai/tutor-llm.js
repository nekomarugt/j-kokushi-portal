/* 解説AI：AIに渡すプロンプトと、出力のチェック（ブラウザ・Node 共通）。
 * 小さいモデル対策：低めの温度・くり返し罰・短い上限・ループ検出（途中で止めて切りつめ）・同じ文の重複除去・言い直し。 */
(function (G) {
  'use strict';
  var MODELS = [
    { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'ふつう（1.5B・約1GB）', size: '約1GB' },
    { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: '軽い（0.5B・約400MB）', size: '約400MB' }
  ];
  var PASSAGE_MAX = 360;
  function clip(s, n) { s = String(s || '').replace(/\n+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }

  // ---- 続きの質問（「噛み砕いて」「もっと詳しく」「試験では？」など） ----
  var FOLLOW = /(噛み?砕|かみくだ|かみ砕|簡単に|かんたんに|わかりやす|分かりやす|やさしく|易しく|もっと|もう?ちょ[っい]|もーちょ|もう少し|もうすこし|くわしく|詳しく|詳細|例え|たとえ|喩え|例えば|たとえば|具体的|どういうこと|どゆこと|どういう意味|つまり|要するに|ようわから|よくわから|わから[んへな]|分から[んへな]|わかんな|むず[いか]|難し|なんで|なんで[やな]ん|なぜ|どうして|試験|国試|出題|覚え方|おぼえかた|まとめて|もう一回|もういっかい|もう一度|言い換え|ってこと|ほんま|ほんとに|それって|それは|さっきの|今の|意味|いみ)/;
  function followMode(q) {
    if (/(試験|国試|出題|覚え方|おぼえかた)/.test(q)) return 'exam';
    if (/(例え|たとえ|喩え|比喩)/.test(q)) return 'analogy';
    if (/(くわしく|詳しく|詳細|もっと教え|深く)/.test(q) && !/(噛|かみ|簡単|かんたん|わかりやす|やさし)/.test(q)) return 'detail';
    return 'simple';
  }
  var MODE = {
    normal: '次の形で、全部で4〜5行に短くまとめる：\n【ひとことで】1文\n【ポイント】・で始まる短い行を2〜3個\n【試験では】1文（資料に試験の話がなければこの行は書かない）',
    simple: '【まとめ】を、中学生にもわかるやさしい言葉で2〜3文に言い直す（資料番号をつける）。専門用語は1つだけ使って、意味をそえる。わかりやすくなるなら、最後に「たとえるなら：」で始まる身近なたとえを1文だけ足してもいい（その行には番号をつけない）。',
    analogy: '【まとめ】の【ひとことで】を、やさしい言葉で1〜2文に言い直す（資料番号をつける）。そのあと「たとえるなら：」で始まる行を1つだけ書き、ふだんの生活にあるもの（家・道具・乗り物・食べ物など）にたとえる。たとえの行に番号はつけない。',
    detail: '資料に書いてあることを、もう少しくわしく。・で始まる短い行を3〜4個。資料にない話は足さない。',
    exam: '試験でどう出るか、どこをまちがえやすいかを、資料にもとづいて・で始まる短い行2〜3個で。'
  };
  function messages(ch, question, hits, mode, material) {
    mode = MODE[mode] ? mode : 'normal';
    var sys = 'あなたは「' + ch.name + '」。' + ch.persona + '\n' +
      'ルール：\n' +
      '・【まとめ】と【資料】に書いてあることだけを使う。自分の知識で付け足さない。\n' +
      '・資料に答えが書いていないときは「ポータルの資料には載ってないみたい」とだけ言う。\n' +
      '・たとえ話は「たとえるなら：」の行だけで使う。それ以外の文は資料の言葉で説明する。\n' +
      '・同じ文や同じ言い回しをくり返さない。\n' +
      '・タメ口で、キャラの話し方で。敬語（です・ます）は使わない。\n' +
      '・使った資料の番号を、行の終わりに[1]のようにつける。\n' +
      '・日本語だけで書く。病名・用語・数字をでっちあげない。' + (ch.styleLine ? '\n・話し方の例：「' + ch.styleLine + '」' : '');
    var ctx = hits.map(function (h, i) { return '[' + (i + 1) + '] ' + h.doc.t + '\n' + clip(h.doc.x, material ? 220 : PASSAGE_MAX); }).join('\n\n');
    var m = [{ role: 'system', content: sys }];
    if (ch.rewriteEx) m.push(
      { role: 'user', content: '【まとめ】\n【ひとことで】体温は視床下部の体温調節中枢で一定に保たれる。[1]\n【ポイント】\n・暑いと発汗、寒いとふるえで調整する。[1]\n\n【質問】体温の調節（噛み砕いて）\n【答え方】' + MODE.simple },
      { role: 'assistant', content: ch.rewriteEx });
    m.push({ role: 'user', content: (material ? '【まとめ】\n' + material + '\n\n' : '') + '【資料】\n' + ctx + '\n\n【質問】' + question + '\n【答え方】' + MODE[mode] });
    return m;
  }

  // ---- 資料にない文を落とす（漢字・カタカナの2文字の組が資料にどれだけあるか） ----
  function grams(s) { var g = [], m = String(s).normalize('NFKC').match(/[\u4e00-\u9fffァ-ヶー⁺⁻₀-₉A-Za-z0-9]{2,}/g) || []; m.forEach(function (w) { for (var i = 0; i + 1 < w.length; i++) g.push(w.substr(i, 2)); }); return g; }
  function ground(t, ctxText) {
    var c = String(ctxText).normalize('NFKC');
    return String(t).split('\n').map(function (line) {
      if (/^たとえるなら[:：]/.test(line.replace(/^【たとえるなら】/, 'たとえるなら：'))) return line.replace(/^【たとえるなら】\s*/, 'たとえるなら：');
      return (line.match(/[^。！？!?]+[。！？!?]?/g) || [line]).filter(function (sen) {
        var g = grams(sen.replace(/\[\d\]|【[^】]+】/g, '')); if (!g.length) return true;
        var hit = g.filter(function (x) { return c.indexOf(x) >= 0; }).length;
        return hit / g.length >= 0.5;
      }).join('');
    }).filter(function (l) { return l.replace(/【[^】]+】|[・\s]/g, '').length > 0 || /^【/.test(l); }).join('\n');
  }
  // ---- ループ検出・重複除去 ----
  function sentences(t) { return String(t).match(/[^。！？!?\n]+[。！？!?]?|\n/g) || []; }
  var keyOf = function (s) { return s.replace(/\[\d\]|[\s・、。！？!?「」]/g, ''); };
  // 生成中のテキストがループしていれば true
  function looping(t) {
    var seen = Object.create(null), ss = sentences(t);
    for (var i = 0; i < ss.length; i++) {
      var k = keyOf(ss[i]); if (k.length < 6) continue;
      if (seen[k]) return true; seen[k] = 1;
    }
    var s = t.replace(/\s/g, '');
    if (s.length > 60) { // 同じ12文字が3回以上
      var cnt = Object.create(null);
      for (var j = 0; j + 12 <= s.length; j += 3) { var g = s.substr(j, 12); if ((cnt[g] = (cnt[g] || 0) + 1) >= 3) return true; }
    }
    return false;
  }
  // 同じ文（ほぼ同じ文）を消し、途中で切れた最後の文を落とす
  function dedupe(t, cut) {
    var out = [], seen = Object.create(null), ss = sentences(t);
    if (cut && ss.length && !/[。！？!?\]\n]$/.test(ss[ss.length - 1])) ss.pop();
    for (var i = 0; i < ss.length; i++) {
      var k = keyOf(ss[i]);
      if (k.length >= 4) { if (seen[k]) continue; seen[k] = 1; }
      out.push(ss[i]);
    }
    return out.join('').replace(/\n{2,}/g, '\n').replace(/^\n+|\n+$/g, '').replace(/(【[^】]+】)\s*(?=【|$)/g, '');
  }
  var OK_KATA = 'ポータル イメージ ポイント セット チェック パターン ルール ワード キーワード'.split(' ');
  function newKatakana(t, ctx) {
    var ws = t.match(/[ァ-ヶー]{3,}/g) || [];
    return ws.filter(function (w) { return ctx.indexOf(w) < 0 && !OK_KATA.some(function (k) { return k.indexOf(w) >= 0 || w.indexOf(k) >= 0; }); });
  }
  function clean(t, cut, ctxText) {
    t = String(t || '').replace(/^\s*(解説AI|AI|先生|ひなた先生|ひなた|白石ミオ|ミオ)[:：]\s*/, '').replace(/【(質問|資料|答え方|まとめ)】[\s\S]*$/, '');
    t = dedupe(t, cut);
    if (ctxText) t = dedupe(ground(t, ctxText), false);
    return t.split('\n').filter(function (l) { return !/^\s*(\[\d\]\s*)+[。.]?\s*$/.test(l); }).join('\n').trim();
  }
  // だめな出力ならその理由を返す（なければ null）
  // 用語の取りちがい防止：神経・筋・骨・血管・ホルモンなどの名前は、まとめ（ひとことで・ポイント）に出てくるものだけ
  var TERM = /[\u4e00-\u9fffァ-ヶー]{1,8}(神経|筋|骨|動脈|静脈|ホルモン|腺|症候群|病|症)/g;
  var LEAK = /汗|ふるえ|視床下部|体温|エアコン/; // お手本（rewriteEx）の中身がまぎれこんだもの
  function problem(t, question, hits, core) {
    if (!t || t.replace(/【[^】]+】|\[\d\]|\s/g, '').length < 10) return 'short';
    if (/身近なもの|短い1文|答え方|資料番号|番号をつけ|たとえの行|【まとめ】/.test(t)) return 'template';
    if (/[你们这吗么说个這們]|[a-zA-Z]{12,}/.test(t)) return 'lang';
    if (t.length > 420) return 'long';
    if (looping(t)) return 'loop';
    if (/申し訳|アシスタント|AIとして|言語モデル/.test(t)) return 'assistant';
    var ctx = question + ' ' + hits.map(function (h) { return h.doc.t + ' ' + h.doc.x; }).join(' ');
    if (t.replace(/たとえるなら[:：][^\n]*/g, '').replace(/【[^】]+】|\[\d\]|\s/g, '').length < 10) return 'short';
    var an = t.match(/たとえるなら[:：][^\n]*/g) || [];
    if (an.length > 1 || an.some(function (a) { return a.length > 90 || /エアコン|設定温度/.test(a); })) return 'analogy';
    var fact = t.replace(/たとえるなら[:：][^\n]*/g, '');
    if (newKatakana(fact, ctx).length) return 'invented';
    var lk = t.match(LEAK); if (lk && ctx.indexOf(lk[0]) < 0) return 'leak';
    if (core) { var bad = (fact.match(TERM) || []).filter(function (w) { return core.indexOf(w) < 0 && question.indexOf(w) < 0; }); if (bad.length) return 'term:' + bad[0]; }
    if (((t.match(/(です|ます|ました|ません)[。！!]?/g) || []).length) >= 2) return 'keigo'; // 弱い問題：言い直し後なら受け入れる
    if (!/\[\d\]/.test(fact) && !/載ってない|見当たら/.test(t)) return 'nocite';
    return null;
  }
  G.AITutorLLM = { MODELS: MODELS, ground: ground, ctxOf: function (q, hits, extra) { return q + ' ' + (extra || '') + ' ' + hits.map(function (h) { return h.doc.t + ' ' + h.doc.x; }).join(' '); }, messages: messages, problem: problem, clean: clean, looping: looping, dedupe: dedupe, newKatakana: newKatakana,
    FOLLOW: FOLLOW, followMode: followMode,
    params: { temperature: 0.3, top_p: 0.85, repetition_penalty: 1.15, frequency_penalty: 0.3, presence_penalty: 0.1, max_tokens: 200, stop: ['【質問】', '【資料】', '【答え方】', '【まとめ】', '\n\n\n'] } };
  if (typeof module !== 'undefined') module.exports = G.AITutorLLM;
})(typeof window !== 'undefined' ? window : globalThis);
