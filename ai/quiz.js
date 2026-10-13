/* 解説AI：問題モードの言葉の判定（ブラウザ・Node 共通） */
(function (G) {
  'use strict';
  var Q = /(問題|もんだい|モンダイ|クイズ|くいず|過去問)\s*(を|が)?\s*(出|だ|ダ)(し|せ|して|してよ|してや|してーや|してくれ|すか)|(問題|もんだい|クイズ|過去問)\s*(ちょうだい|頂戴|くれ|ほしい|欲しい|やりたい|解きたい|ときたい|やる|解く|とく|しよ|やろ|いこ|行こ)|出題して|テストして|試して(みて|ほしい|や)?$|練習(したい|させて|しよ|する)|^(なんか|何か)?(1|一|ひと)問|1問(だけ)?(やる|いく|ちょうだい|だして|出して)|もう(1|一|いち)問|同じ分野|^次(の問題|いこ|いって|へ)?[！!。]*$|^つぎ[！!。]*$|^ネクスト|クイズ(して|やろ|しよ)|問題(だして|出して)|^.{1,20}の(問題|過去問|クイズ)[!！。]*$/;
  var SUBJ = [[/解剖/, 'anatomy'], [/生理/, 'physiology'], [/臨床|一般臨床|病気|疾患/, 'clinical']];
  function parse(t) {
    if (!Q.test(t)) return null;
    var subj = ''; SUBJ.forEach(function (p) { if (!subj && p[0].test(t)) subj = p[1]; });
    var m = t.match(/^(.{1,20}?)(の|に関する|について)(問題|もんだい|過去問|クイズ|1問|一問)/);
    var topic = m ? m[1].replace(/^(なんか|何か|じゃあ|ほな|ほんなら|では|よし)、?/, '').replace(/(解剖学?|生理学?|一般臨床医学?|臨床)$/, '').trim() : '';
    var kind = /^次|^つぎ|^ネクスト|次の問題/.test(t) ? 'next' : /同じ分野|もう(1|一|いち)問/.test(t) ? 'same' : 'new';
    if (kind !== 'new' || /^(なんか|何か|適当|ランダム|好き|何でも|なんでも)$/.test(topic)) topic = '';
    return { subj: subj, topic: topic, kind: kind };
  }
  // 問題中の答え：番号・丸数字・選択肢の文字
  function answerOf(t, choices) {
    var s = String(t).normalize('NFKC').trim().replace(/[。！!]$/, '');
    var m = s.match(/^([1-9])(番|ばん)?(かな|やな|だと思う|で)?[?？]?$/) || s.match(/^答えは?([1-9])/);
    if (m) { var n = +m[1] - 1; return n < choices.length ? n : -1; }
    var c = '①②③④⑤'.indexOf(s.charAt(0)); if (c >= 0 && s.length <= 3) return c;
    var nn = function (x) { return String(x).normalize('NFKC').replace(/\s/g, ''); };
    for (var i = 0; i < choices.length; i++) if (nn(choices[i]) && (nn(s) === nn(choices[i]) || (nn(s).length >= 2 && nn(choices[i]).indexOf(nn(s)) === 0 && nn(s).length >= nn(choices[i]).length * 0.6))) return i;
    return null;
  }
  var CMD = {
    reveal: /答え(教えて|おしえて|を?見せて|みせて|は[?？]?$|なに|何)|正解(は|教えて|おしえて)|ギブ|降参|こうさん|わから(ん|ない)から答え/,
    hint: /ヒント|ひんと|手がかり/,
    again: /^もう(一|1|いっ)(回|かい|度)|^もっかい|^もう一度/,
    summary: /まとめて|まとめ(を)?(見せて|教えて)|要点/,
    memo: /覚え方|おぼえかた|語呂|ゴロ|ごろあわせ|暗記法|覚えられ(へん|ない|ん)/
  };
  function command(t) { for (var k in CMD) if (CMD[k].test(t)) return k; return null; }
  G.AITutorQuiz = { parse: parse, answerOf: answerOf, command: command, Q: Q };
  if (typeof module !== 'undefined') module.exports = G.AITutorQuiz;
})(typeof window !== 'undefined' ? window : globalThis);
