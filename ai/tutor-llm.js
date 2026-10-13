/* 解説AI先生：AIに渡すプロンプトと、出力のチェック（ブラウザ・Node 共通）。
 * girls-chat の学び：小さいモデルは指示を破りやすい → 低めの温度・出力チェック・言い直し・だめなら資料だけ表示。 */
(function (G) {
  'use strict';
  var MODELS = [
    { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'ふつう（1.5B・約1GB）', size: '約1GB' },
    { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: '軽い（0.5B・約400MB）', size: '約400MB' }
  ];
  var PASSAGE_MAX = 380;
  function clip(s, n) { s = String(s || '').replace(/\n+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }
  function messages(ch, question, hits) {
    var sys = 'あなたは「' + ch.name + '」。' + ch.persona + '\n' +
      'ルール：\n' +
      '・下の【資料】に書いてあることだけを使って、【質問】に答える。自分の知識で付け足さない。\n' +
      '・資料に答えが書いていないときは「ポータルの資料には載ってないみたい」とだけ言う。\n' +
      '・2〜4文で短く。タメ口で、キャラの話し方で。敬語（です・ます）は使わない。\n' +
      '・使った資料の番号を、文の終わりに[1]のようにつける。\n' +
      '・日本語だけで書く。病名・用語・数字をでっちあげない。';
    var ctx = hits.map(function (h, i) { return '[' + (i + 1) + '] ' + h.doc.t + '\n' + clip(h.doc.x, PASSAGE_MAX); }).join('\n\n');
    return [
      { role: 'system', content: sys },
      { role: 'user', content: '【資料】\n[1] 生理学 資料 体温\n体温は視床下部の体温調節中枢で一定に保たれる。\n\n【質問】体温を調節してるのはどこ？' },
      { role: 'assistant', content: (ch.example && ch.example[0]) || '体温は視床下部の体温調節中枢がコントロールしてるよ[1]。' },
      { role: 'user', content: '【資料】\n' + ctx + '\n\n【質問】' + question }
    ];
  }
  var OK_KATA = 'ポータル イメージ ポイント セット チェック パターン ルール ワード キーワード'.split(' ');
  function newKatakana(t, ctx) {
    var ws = t.match(/[ァ-ヶー]{3,}/g) || [];
    return ws.filter(function (w) { return ctx.indexOf(w) < 0 && !OK_KATA.some(function (k) { return k.indexOf(w) >= 0 || w.indexOf(k) >= 0; }); });
  }
  function clean(t) { return String(t || '').replace(/^\s*(解説AI|AI|先生|ひなた先生|ひなた|白石ミオ|ミオ)[:：]\s*/, '').replace(/\n{3,}/g, '\n\n').trim(); }
  // だめな出力ならその理由を返す（なければ null）
  function problem(t, question, hits) {
    if (!t || t.length < 8) return 'empty';
    if (/[你们这吗么说个這們]|[a-zA-Z]{12,}/.test(t)) return 'lang';
    if (t.length > 420) return 'long';
    if (/申し訳|アシスタント|AIとして|言語モデル/.test(t)) return 'assistant';
    var ctx = question + ' ' + hits.map(function (h) { return h.doc.t + ' ' + h.doc.x; }).join(' ');
    if (newKatakana(t, ctx).length) return 'invented';
    if (((t.match(/(です|ます|ました|ません)[。！!]?/g) || []).length) >= 2) return 'keigo'; // 弱い問題：言い直し後なら受け入れる
    if (!/\[\d\]/.test(t) && !/載ってない|見当たら/.test(t)) return 'nocite';
    return null;
  }
  G.AITutorLLM = { MODELS: MODELS, messages: messages, problem: problem, clean: clean, newKatakana: newKatakana,
    params: { temperature: 0.3, top_p: 0.9, repetition_penalty: 1.1, max_tokens: 220 } };
  if (typeof module !== 'undefined') module.exports = G.AITutorLLM;
})(typeof window !== 'undefined' ? window : globalThis);
