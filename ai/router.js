/* 解説AI：メッセージの振り分け（勉強の質問／続きの質問／おしゃべり／はげまし／見つからない）。ブラウザ・Node 共通。 */
(function (G) {
  'use strict';
  var ENCOURAGE = /(無理|むり|ムリ)(かも|だ|や|ぽ|ゲー|すぎ|ゃ)|^(無理|むり|ムリ)[ー〜！!。]*$|落ちそう|落ちる気|落ちたら|受から(ない|へん|ん)|合格(でき|する自信)|自信(ない|が?無い|なくな)|やる気(が)?(出|で)(ない|へん|ん)|もう(やだ|いや|嫌)|くじけ|挫け|諦め|あきらめ|向いてない|ダメかも|だめかも|不安で|こわい|怖い|間に合わ(ない|へん|ん)/;
  // 勉強の質問っぽい言葉（あれば、おしゃべりより勉強として扱う）
  var STUDY = /病気|疾患|症状|所見|徴候|障害|麻痺|原因|検査|治療|診断|神経|筋|骨|関節|靱帯|靭帯|血管|動脈|静脈|臓|ホルモン|分泌|反射|機能|働き|仕組み|しくみ|違い|支配|作用|受容|細胞|血液|呼吸|循環|代謝|消化|吸収|過去問|国試|解剖|生理|臨床/;
  // おしゃべりの意図（talk-engine.js の detect の名前）
  var SOCIAL = ['greet', 'bye', 'thanks', 'sorry', 'howareyou', 'name', 'aiq', 'keigo', 'tsukkomi', 'praise', 'insult', 'laugh', 'aizuchi', 'age', 'where', 'likeme', 'myname', 'setname', 'mylikes', 'hobby', 'imfine'];
  var CHAT = ['food', 'weather', 'animal', 'happy', 'sad', 'tired', 'work', 'activity', 'setlike', 'fav', 'dislike', 'whatdoing', 'dontknow'];
  function create(opt) { // opt: {search(q)->{kws,hits}, norm, detect, FOLLOW, calls}
    var big = function (kws) { return kws.filter(function (k) { return Array.from(k).length >= 2 && !opt.FOLLOW.test(k); }); };
    function route(q, st) { // st: {lastTurn, lastHits, lastQ}
      var r = opt.search(q), b = big(r.kws), hits = r.hits.filter(function (h) { return h.cov >= 0.4; });
      var inTop = function (n, field) { return hits.slice(0, n).some(function (h) { var t = opt.norm(field === 't' ? h.doc.t : h.doc.t + ' ' + h.doc.x); return b.some(function (k) { return t.indexOf(k) >= 0; }); }); };
      var strong = hits.length > 0 && hits[0].cov >= 0.5 && (!b.length || inTop(3));
      var intent = opt.detect(opt.talkNorm(q));
      var studyLast = st.lastTurn === 'study' && st.lastHits;
      var out = function (kind) { return { kind: kind, intent: intent, r: r, strong: strong }; };
      if (ENCOURAGE.test(q)) return out('encourage');
      if (studyLast) {
        if (!b.length && (opt.FOLLOW.test(q) || ['clarify', 'why', 'dontknow'].indexOf(intent) >= 0)) return out('follow');
        if (opt.FOLLOW.test(q) && Array.from(q).length <= 40) {
          var lt = opt.norm(st.lastHits.map(function (h) { return h.doc.t + ' ' + h.doc.x; }).join(' ') + ' ' + st.lastQ);
          if (b.every(function (k) { return lt.indexOf(k) >= 0; })) return out('follow');
        }
      }
      var cue = STUDY.test(q);
      if (cue && intent !== 'tired') return out(strong ? 'study' : (b.length ? 'notfound' : 'talk'));
      if (SOCIAL.indexOf(intent) >= 0) return out(strong && Array.from(q).length > 14 ? 'study' : 'talk');
      if (CHAT.indexOf(intent) >= 0) return out(strong && inTop(3, 't') ? 'study' : 'talk');
      if (strong) return out('study');
      if (studyLast && Array.from(q).length <= 20 && opt.FOLLOW.test(q)) return out('follow');
      if (!b.length || !hits.length || !inTop(6)) return out('talk'); // 勉強の言葉が資料にまったく出てこない → おしゃべり
      return out('notfound');
    }
    return { route: route };
  }
  G.AITutorRouter = { create: create, ENCOURAGE: ENCOURAGE };
  if (typeof module !== 'undefined') module.exports = G.AITutorRouter;
})(typeof window !== 'undefined' ? window : globalThis);
