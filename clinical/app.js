const els = {
  loading: document.getElementById("loading-view"),
  home: document.getElementById("home-view"),
  selector: document.getElementById("selector-view"),
  quiz: document.getElementById("quiz-view"),
  result: document.getElementById("result-view"),
  topics: document.getElementById("topics-view"),
  topicDetail: document.getElementById("topic-detail-view"),
  findings: document.getElementById("findings-view"),
  error: document.getElementById("error-view"),
  homeLogo: document.getElementById("home-logo"),
  headerTotal: document.getElementById("header-total"),
  generalCount: document.getElementById("general-count"),
  specificCount: document.getElementById("specific-count"),
  historySummary: document.getElementById("history-summary"),
  reviewSavedButton: document.getElementById("review-saved-button"),
  reviewCount: document.getElementById("review-count"),
  openTopicsButton: document.getElementById("open-topics-button"),
  openFindingsButton: document.getElementById("open-findings-button"),
  selectorBack: document.getElementById("selector-back"),
  selectorKicker: document.getElementById("selector-kicker"),
  selectorTitle: document.getElementById("selector-title"),
  selectorDescription: document.getElementById("selector-description"),
  roundGrid: document.getElementById("round-grid"),
  countPanel: document.getElementById("count-panel"),
  startButton: document.getElementById("start-button"),
  quitButton: document.getElementById("quit-button"),
  progressCurrent: document.getElementById("progress-current"),
  progressTotal: document.getElementById("progress-total"),
  progressBar: document.getElementById("progress-bar"),
  sourceBadge: document.getElementById("source-badge"),
  multiNote: document.getElementById("multi-note"),
  questionText: document.getElementById("question-text"),
  questionImage: document.getElementById("question-image"),
  choices: document.getElementById("choices"),
  submitAnswerButton: document.getElementById("submit-answer-button"),
  feedback: document.getElementById("feedback"),
  feedbackIcon: document.getElementById("feedback-icon"),
  feedbackLabel: document.getElementById("feedback-label"),
  feedbackAnswer: document.getElementById("feedback-answer"),
  feedbackExplanation: document.getElementById("feedback-explanation"),
  relatedTopics: document.getElementById("related-topics"),
  nextButton: document.getElementById("next-button"),
  scoreRing: document.getElementById("score-ring"),
  scorePercent: document.getElementById("score-percent"),
  scoreCorrect: document.getElementById("score-correct"),
  scoreTotal: document.getElementById("score-total"),
  resultMessage: document.getElementById("result-message"),
  retryWrongButton: document.getElementById("retry-wrong-button"),
  backToHomeButton: document.getElementById("back-to-home-button"),
  topicsBack: document.getElementById("topics-back"),
  topicGrid: document.getElementById("topic-grid"),
  topicDetailBack: document.getElementById("topic-detail-back"),
  topicTitle: document.getElementById("topic-title"),
  topicSummary: document.getElementById("topic-summary"),
  topicFindings: document.getElementById("topic-findings"),
  topicConnections: document.getElementById("topic-connections"),
  topicPoints: document.getElementById("topic-points"),
  topicTrap: document.getElementById("topic-trap"),
  topicQuizButton: document.getElementById("topic-quiz-button"),
  findingsBack: document.getElementById("findings-back"),
  findingTabs: document.getElementById("finding-tabs"),
  findingCategoryKicker: document.getElementById("finding-category-kicker"),
  findingCategoryTitle: document.getElementById("finding-category-title"),
  findingCount: document.getElementById("finding-count"),
  findingGrid: document.getElementById("finding-grid"),
  resetHistoryButton: document.getElementById("reset-history-button"),
};

const TOPICS = [
  {
    id: "parkinson",
    title: "パーキンソン病",
    summary: "中脳の黒質にあるドパミン神経が減少し、大脳基底核による運動調節がうまくいかなくなる進行性の神経変性疾患です。単なる筋力低下ではなく、動作を始める・大きく続けることが難しくなります。",
    findings: [
      "安静時振戦：何もしていない時に目立ち、手指では丸薬丸め様振戦になる",
      "筋強剛：歯車様または鉛管様の抵抗を触れる",
      "無動・寡動：動作が遅く小さくなり、小刻み歩行、すり足、すくみ足がみられる",
      "仮面様顔貌、小声、小字症、前傾姿勢、姿勢反射障害などを伴う",
    ],
    connections: [
      "黒質ドパミン低下 → 大脳基底核の運動調節が乱れる → 無動・寡動",
      "歩幅が小さくなる → 重心に足が追いつかない → 加速歩行・突進現象",
      "姿勢反射障害 → 立ち直りにくい → 転倒しやすい",
      "便秘・起立性低血圧など、自律神経症状を伴うこともある",
    ],
    points: [
      "四大症状は安静時振戦・筋強剛・無動／寡動・姿勢反射障害",
      "前傾姿勢、小刻み歩行、加速歩行、すくみ足をセットで覚える",
      "振戦は動作時より安静時に目立つ",
    ],
    trap: "マン・ウェルニッケ姿勢は片麻痺、失調性歩行は小脳障害です。パーキンソン病と姿勢・歩行の名前を入れ替えた選択肢に注意。",
  },
  {
    id: "diabetes",
    title: "糖尿病",
    summary: "インスリンの分泌不足または作用不足によって、慢性的な高血糖が続く代謝疾患です。高血糖そのものだけでなく、急性合併症・慢性合併症・低血糖への対応まで広く問われます。",
    findings: [
      "典型症状は口渇、多飲、多尿、体重減少。初期には無症状のことも多い",
      "糖尿病型の目安：空腹時血糖126mg/dL以上、随時または75gOGTT2時間値200mg/dL以上、HbA1c 6.5％以上",
      "低血糖では冷汗、振戦、動悸などの自律神経症状から、意識障害へ進むことがある",
      "慢性合併症は網膜症・腎症・神経障害。足の感覚低下や潰瘍にも注意",
    ],
    connections: [
      "高血糖 → 尿へ糖が出る → 浸透圧利尿 → 多尿・脱水・口渇",
      "インスリン不足が強い → 脂肪分解・ケトン体増加 → ケトアシドーシス・クスマウル呼吸",
      "末梢神経障害 → 痛みや傷に気づきにくい → 糖尿病足病変",
      "動脈硬化が進みやすく、心筋梗塞・脳梗塞の危険も高くなる",
    ],
    points: [
      "三大合併症は網膜症・腎症・神経障害",
      "HbA1c 6.5％以上は糖尿病型の判定基準の一つ。血糖値と組み合わせて判断する",
      "低血糖では発汗・頻脈・眠気がみられ、糖分を補給する",
    ],
    trap: "糖尿病性ケトアシドーシスではクスマウル呼吸。低血糖時にインスリンを追加しないこと。",
  },
  {
    id: "rheumatoid",
    title: "関節リウマチ",
    summary: "免疫の異常によって滑膜に慢性炎症が起こり、関節の腫れや痛みから骨・軟骨の破壊へ進む全身性疾患です。手指の変形だけでなく、好発関節・血液検査・画像所見を一続きで整理します。",
    findings: [
      "朝のこわばりと、手関節・MCP・PIP関節を中心とする腫脹・圧痛",
      "左右対称の多発関節炎が典型だが、初期には左右差や少数関節の場合もある",
      "進行すると尺側偏位、スワンネック変形、ボタン穴変形がみられる",
      "RF・抗CCP抗体、CRP・赤沈を確認し、画像では骨びらんや関節裂隙狭小化をみる",
    ],
    connections: [
      "滑膜炎 → パンヌス形成 → 軟骨・骨の破壊 → 関節変形",
      "環軸関節炎 → 環軸関節亜脱臼 → 頸髄障害の危険",
      "関節外では皮下結節、肺病変、眼・口腔乾燥などを伴うことがある",
      "RFや抗CCP抗体は重要だが、陽性だけで確定・陰性だけで除外はできない",
    ],
    points: [
      "慢性の滑膜炎を主体とし、女性に多い",
      "MCP・PIP関節、手関節、環軸関節が重要",
      "進行すると骨びらんや関節裂隙狭小化を生じる",
    ],
    trap: "DIP関節のヘバーデン結節や骨棘形成は変形性関節症側の所見です。RF陽性だけで関節リウマチと確定するわけでもありません。",
  },
  {
    id: "copd",
    title: "COPD・肺気腫",
    summary: "主に長期の喫煙によって気道や肺胞が傷つき、息を吐き出しにくくなる慢性疾患です。慢性気管支炎や肺気腫の変化が重なり、気流制限は完全には元へ戻りません。",
    findings: [
      "労作時呼吸困難、慢性の咳・痰。進行すると日常動作でも息切れする",
      "呼気延長、喘鳴、口すぼめ呼吸、呼吸音低下がみられる",
      "肺過膨張による樽状胸。打診では含気増加のため過共鳴音になる",
      "呼吸機能検査では閉塞性障害を示し、1秒率が低下する",
    ],
    connections: [
      "気道狭窄・分泌物増加 → 呼気の流れが妨げられる → 呼気延長・喘鳴",
      "肺胞壁破壊 → 弾性収縮力低下 → 空気が残る → 肺過膨張・樽状胸",
      "換気障害が進む → 低酸素血症・高二酸化炭素血症",
      "慢性低酸素 → 肺高血圧 → 肺性心につながることがある",
    ],
    points: [
      "最大の原因は長期の喫煙",
      "呼気延長、樽状胸、呼吸音低下がみられる",
      "閉塞性換気障害なので1秒率が低下する",
    ],
    trap: "吸気延長・呼吸音増強・打診で濁音、という入れ替えに注意。拘束性障害ではなく閉塞性障害です。",
  },
  {
    id: "thyroid",
    title: "甲状腺疾患",
    summary: "甲状腺ホルモンは全身の代謝を調節します。バセドウ病による機能亢進と、橋本病などによる機能低下を『代謝が上がる／下がる』の対比で整理すると理解しやすくなります。",
    findings: [
      "機能亢進：頻脈、発汗、暑がり、手指振戦、体重減少、下痢傾向",
      "バセドウ病：びまん性甲状腺腫、眼球突出を伴うことがある",
      "機能低下：徐脈、寒がり、体重増加、便秘、皮膚乾燥、意欲低下",
      "機能低下では圧痕を残さない粘液水腫がみられる",
    ],
    connections: [
      "バセドウ病：TSH受容体抗体が甲状腺を刺激 → 甲状腺ホルモン過剰",
      "橋本病：自己免疫による慢性炎症・組織破壊 → 機能低下へ進むことがある",
      "原発性機能亢進ではFT4・FT3上昇、TSH低下。原発性機能低下では逆になる",
      "代謝亢進 → 酸素消費・熱産生増加 → 暑がり、発汗、頻脈、体重減少",
    ],
    points: [
      "バセドウ病：頻脈、発汗、振戦、体重減少、眼球突出",
      "橋本病：徐脈、寒がり、便秘、皮膚乾燥、意欲低下",
      "原発性の亢進はTSH低下、原発性の低下はTSH上昇",
    ],
    trap: "亢進症と低下症の症状を一つだけ逆にした選択肢が多く出ます。脈拍・体温感覚・体重変化を軸に判定。",
  },
  {
    id: "heart-failure",
    title: "心不全",
    summary: "心臓のポンプ機能が低下し、全身に必要な血液を送れない、または血液が心臓の手前でうっ滞する状態です。左心不全の肺うっ血と、右心不全の体静脈うっ血を分けて考えます。",
    findings: [
      "左心不全：労作時呼吸困難、起坐呼吸、発作性夜間呼吸困難、肺水腫",
      "右心不全：下腿浮腫、頸静脈怒張、肝腫大、腹水、体重増加",
      "心拍出量低下では倦怠感、四肢冷感、乏尿などがみられる",
      "検査ではBNP／NT-proBNP上昇、胸部X線の心拡大・肺うっ血、心エコーなどを確認する",
    ],
    connections: [
      "左室から送り出せない → 肺静脈側にうっ血 → 呼吸困難・起坐呼吸",
      "右室から送り出せない → 体静脈側にうっ血 → 浮腫・頸静脈怒張・肝腫大",
      "心拍出量低下 → 腎血流低下 → RAAS活性化 → 水・Na貯留 → うっ血が悪化",
      "心不全は心筋梗塞、弁膜症、高血圧、心筋症など多くの心疾患の終末像になりうる",
    ],
    points: [
      "左心不全：肺うっ血、呼吸困難、起坐呼吸",
      "右心不全：浮腫、頸静脈怒張、肝腫大",
      "NYHA分類は身体活動による症状の程度を表す",
    ],
    trap: "重症うっ血性心不全では仰臥位より起坐位が楽になります。肺症状と末梢うっ血を混同しないこと。",
  },
  {
    id: "hepatitis",
    title: "ウイルス性肝炎",
    summary: "肝炎ウイルスによって肝細胞に炎症・障害が起こる病気です。A〜E型は同じ『肝炎』でも、感染経路と慢性化のしやすさが異なります。",
    findings: [
      "倦怠感、食欲不振、悪心、黄疸、褐色尿、肝腫大など。無症状の場合もある",
      "肝細胞障害ではAST・ALTが上昇する",
      "重症化すると凝固因子産生低下によるPT延長や意識障害が問題になる",
      "慢性肝炎では症状が乏しくても、線維化が進行していることがある",
    ],
    connections: [
      "A型・E型：主に経口感染 → 急性肝炎。通常は慢性化しない",
      "B型・C型：血液・体液を介して感染 → 慢性化することがある",
      "D型は単独では増殖できず、B型肝炎ウイルスの存在が必要",
      "慢性肝炎 → 線維化 → 肝硬変 → 肝細胞癌の危険が高まる",
    ],
    points: [
      "A型は主に経口感染し、原則として慢性化しない",
      "B型・C型は血液などを介して感染する",
      "B型・C型の慢性化は肝硬変・肝細胞癌につながる",
    ],
    trap: "HBs抗原とHBs抗体、HBe抗原の意味を入れ替えた選択肢に注意。A型を慢性化するとする記述は誤りです。",
  },
  {
    id: "cirrhosis",
    title: "肝硬変・門脈圧亢進",
    summary: "慢性的な肝障害によって線維化と再生結節が進み、肝臓が硬く変形した状態です。『肝機能低下』と『門脈圧亢進』という二つの結果から所見を整理します。",
    findings: [
      "肝機能低下：黄疸、低アルブミン血症、浮腫、出血傾向",
      "門脈圧亢進：食道・胃静脈瘤、脾腫、腹壁静脈怒張、腹水",
      "くも状血管腫、手掌紅斑、女性化乳房などがみられる",
      "肝性脳症では意識障害や羽ばたき振戦がみられる",
    ],
    connections: [
      "肝内の血流抵抗上昇 → 門脈圧亢進 → 側副血行路形成 → 静脈瘤・腹壁静脈怒張",
      "アルブミン低下＋門脈圧亢進 → 血管外へ水分が移動 → 腹水・浮腫",
      "脾腫・脾機能亢進 → 血小板減少",
      "アンモニア処理低下・門脈体循環シャント → 肝性脳症",
    ],
    points: [
      "門脈圧亢進から食道静脈瘤・脾腫・腹壁静脈怒張",
      "くも状血管腫、手掌紅斑、女性化乳房",
      "肝性脳症では羽ばたき振戦がみられる",
    ],
    trap: "腹壁静脈怒張や食道静脈瘤は局所の病気ではなく、門脈圧亢進から生じる所見です。",
  },
  {
    id: "hypertension",
    title: "高血圧",
    summary: "血圧が慢性的に高い状態で、多くは自覚症状に乏しいまま血管や臓器を傷めます。診断値だけでなく、測定場所による基準の違いと標的臓器障害が重要です。",
    findings: [
      "多くは無症状。頭痛やめまいの有無だけでは診断できない",
      "高血圧の目安：診察室血圧140/90mmHg以上、家庭血圧135/85mmHg以上",
      "長期化すると左室肥大、眼底変化、腎機能低下などがみられる",
      "家庭血圧では白衣高血圧や仮面高血圧の把握にも役立つ",
    ],
    connections: [
      "高い圧が持続 → 血管内皮障害・動脈硬化 → 脳卒中・虚血性心疾患",
      "左室が高い圧に逆らって収縮 → 左室肥大 → 心不全につながる",
      "腎障害は高血圧の結果にも原因にもなり、悪循環をつくる",
      "食塩過多、肥満、運動不足、過量飲酒などが血圧上昇に関係する",
    ],
    points: [
      "診察室血圧では140/90mmHg以上が高血圧の目安",
      "生活習慣では減塩（食塩6g/日未満）、適正体重、有酸素運動が基本",
      "脳卒中・虚血性心疾患・腎障害の重要な危険因子",
    ],
    trap: "家庭血圧の基準は診察室血圧より低く設定されます。食塩摂取量10gを目標とする記述は多すぎます。",
  },
  {
    id: "ischemic-heart",
    title: "心筋梗塞・狭心症",
    summary: "冠動脈の血流が不足して心筋が酸素不足になる病気です。狭心症は一過性の虚血、心筋梗塞は虚血が長く続いて心筋壊死に至った状態として区別します。",
    findings: [
      "安定狭心症：労作で胸部圧迫感が出現し、安静やニトログリセリンで軽快しやすい",
      "心筋梗塞：強い胸痛が長く続き、冷汗、悪心、呼吸困難を伴うことがある",
      "心電図では病型や時期に応じてST変化、異常Q波などがみられる",
      "心筋梗塞ではトロポニンやCK-MBなどの心筋壊死マーカーが上昇する",
    ],
    connections: [
      "冠動脈硬化 → プラーク破綻 → 血栓形成 → 急性冠症候群",
      "虚血が一過性 → 狭心症。虚血が持続して壊死 → 心筋梗塞",
      "高血圧、糖尿病、脂質異常症、喫煙は共通する重要な危険因子",
      "心筋梗塞後は不整脈、心不全、心原性ショック、心破裂などに注意する",
    ],
    points: [
      "狭心症は一過性虚血、心筋梗塞は心筋壊死を伴う",
      "心筋梗塞ではトロポニンやCKが上昇する",
      "心室細動、心不全、心室中隔穿孔などを合併する",
    ],
    trap: "狭心症では通常、心筋壊死マーカーは著明に上がりません。胸痛が長く続き冷汗を伴えば心筋梗塞を疑います。",
  },
];

const FINDING_CATEGORIES = [
  { id: "gait", label: "歩行", lead: "歩き方の特徴" },
  { id: "posture", label: "姿勢", lead: "体の構え・楽になる体位" },
  { id: "facies", label: "顔貌", lead: "顔つき・眼やまぶたの変化" },
  { id: "breathing", label: "呼吸", lead: "呼吸の深さ・速さ・リズム" },
  { id: "edema", label: "浮腫", lead: "むくみ方・左右差・随伴所見" },
  { id: "skin", label: "皮膚所見", lead: "色・発疹・血管の変化" },
  { id: "labs", label: "検査値", lead: "数値の組み合わせ" },
];

const FINDINGS = [
  {
    category: "gait",
    title: "小刻み歩行・すくみ足・加速歩行",
    diseases: "パーキンソン病",
    clue: "歩幅が小さく、歩き始めに足が出にくい。前方へ重心が移ると足が追いつこうとして次第に速くなる。",
    distinguish: "安静時振戦、筋強剛、無動・寡動、前傾姿勢を一緒に探す。片麻痺のぶん回し歩行とは分ける。",
    keywords: ["小刻み", "すくみ", "加速歩行", "すり足"],
    topicIds: ["parkinson"],
  },
  {
    category: "gait",
    title: "マン・ウェルニッケ歩行",
    diseases: "痙性片麻痺（脳卒中後など）",
    clue: "麻痺側の上肢を曲げ、下肢を伸ばしたまま外側へ円を描くように振り出す。",
    distinguish: "片側の上肢屈曲・下肢伸展が軸。両側性の小刻み歩行ならパーキンソン病を考える。",
    keywords: ["マン・ウェルニッケ", "マンウェルニッケ"],
    topicIds: [],
  },
  {
    category: "gait",
    title: "失調性歩行",
    diseases: "小脳障害など",
    clue: "足幅を広く取り、ふらつきながら歩く。直線歩行や継ぎ足歩行が難しい。",
    distinguish: "小脳性は開眼でも不安定。深部感覚障害では閉眼で悪化するロンベルグ徴候が手掛かり。",
    keywords: ["失調性歩行", "失調歩行"],
    topicIds: [],
  },
  {
    category: "gait",
    title: "トレンデレンブルグ歩行",
    diseases: "中殿筋など股関節外転筋の機能不全",
    clue: "患側で片脚立ちになると反対側の骨盤が下がり、体幹を患側へ傾けて歩く。",
    distinguish: "下垂足で足先を高く上げる鶏歩ではない。骨盤の左右差と体幹の傾きに注目する。",
    keywords: ["トレンデレンブルグ", "Trendelenburg"],
    topicIds: [],
  },
  {
    category: "gait",
    title: "間欠性跛行",
    diseases: "末梢動脈疾患／腰部脊柱管狭窄症",
    clue: "歩くと下肢の痛みやしびれが出て、休むと再び歩けるようになる。",
    distinguish: "血管性は立ち止まるだけで軽快しやすく、冷感や脈拍低下を伴う。神経性は前屈・座位で軽快しやすい。",
    keywords: ["間欠性跛行"],
    topicIds: [],
  },
  {
    category: "posture",
    title: "前傾姿勢",
    diseases: "パーキンソン病",
    clue: "頭と体幹を前に曲げ、肘や膝も軽く屈曲した姿勢になる。",
    distinguish: "小刻み歩行、すくみ足、仮面様顔貌、安静時振戦がそろうかを見る。",
    keywords: ["前傾姿勢"],
    topicIds: ["parkinson"],
  },
  {
    category: "posture",
    title: "マン・ウェルニッケ姿勢",
    diseases: "痙性片麻痺",
    clue: "麻痺側の上肢は屈曲、下肢は伸展優位になる典型的な片麻痺姿勢。",
    distinguish: "姿勢と歩行を同じ名前で結ぶ。パーキンソン病の前傾姿勢と混同しない。",
    keywords: ["マン・ウェルニッケ", "マンウェルニッケ"],
    topicIds: [],
  },
  {
    category: "posture",
    title: "後弓反張",
    diseases: "破傷風・強い髄膜刺激など",
    clue: "全身の伸筋が強く緊張し、頭部と踵を支点に体幹が弓なりに反る。",
    distinguish: "項部硬直やけいれんなどを確認する。単なる腰椎前弯の増強ではない。",
    keywords: ["後弓反張"],
    topicIds: [],
  },
  {
    category: "posture",
    title: "起坐位で呼吸が楽になる",
    diseases: "左心不全・肺うっ血",
    clue: "仰向けで息苦しくなり、上体を起こすと呼吸が楽になる起坐呼吸。",
    distinguish: "夜間の呼吸困難、湿性ラ音、肺水腫を伴えば左心不全を考える。下腿浮腫だけなら右心不全側も確認する。",
    keywords: ["起坐呼吸", "起坐位"],
    topicIds: ["heart-failure"],
  },
  {
    category: "facies",
    title: "仮面様顔貌",
    diseases: "パーキンソン病",
    clue: "表情が乏しく、まばたきが減って顔が仮面のように見える。",
    distinguish: "無動・寡動の一部として捉え、小声、小字症、小刻み歩行を一緒に探す。",
    keywords: ["仮面様顔貌", "仮面様"],
    topicIds: ["parkinson"],
  },
  {
    category: "facies",
    title: "満月様顔貌",
    diseases: "クッシング症候群",
    clue: "顔が丸く赤みを帯びやすい。中心性肥満、野牛肩、四肢の筋萎縮を伴う。",
    distinguish: "紫色皮膚線条、高血圧、高血糖など副腎皮質ホルモン過剰の所見を組み合わせる。",
    keywords: ["満月様顔貌", "満月様", "中心性肥満"],
    topicIds: [],
  },
  {
    category: "facies",
    title: "眼球突出",
    diseases: "バセドウ病",
    clue: "甲状腺眼症によって眼球が前方へ突出する。びまん性甲状腺腫を伴うことがある。",
    distinguish: "頻脈、発汗、手指振戦、体重減少など代謝亢進の所見を探す。橋本病の機能低下とは逆。",
    keywords: ["眼球突出"],
    topicIds: ["thyroid"],
  },
  {
    category: "facies",
    title: "粘液水腫様の顔貌",
    diseases: "甲状腺機能低下症",
    clue: "顔や眼瞼が腫れぼったく、皮膚は乾燥して表情や反応がゆっくりになる。",
    distinguish: "徐脈、寒がり、便秘、体重増加、圧痕を残さない浮腫を組み合わせる。",
    keywords: ["粘液水腫"],
    topicIds: ["thyroid"],
  },
  {
    category: "facies",
    title: "眼瞼下垂",
    diseases: "重症筋無力症・動眼神経麻痺・Horner症候群など",
    clue: "上眼瞼が下がって目が開きにくい。片側か両側か、日内変動や複視の有無をみる。",
    distinguish: "重症筋無力症は易疲労性があり瞳孔は保たれる。動眼神経麻痺は散瞳、Horner症候群は縮瞳が手掛かり。",
    keywords: ["眼瞼下垂"],
    topicIds: [],
  },
  {
    category: "breathing",
    title: "呼気延長・喘鳴・樽状胸",
    diseases: "COPD・肺気腫",
    clue: "息を吐き切りにくく呼気が長い。肺過膨張が進むと樽状胸や呼吸音低下がみられる。",
    distinguish: "喫煙歴と1秒率低下を確認する。打診は濁音ではなく過共鳴音になりやすい。",
    keywords: ["呼気延長", "樽状胸", "肺気腫"],
    topicIds: ["copd"],
  },
  {
    category: "breathing",
    title: "クスマウル呼吸",
    diseases: "代謝性アシドーシス・糖尿病性ケトアシドーシス",
    clue: "深く大きな呼吸が規則的に続く。酸を呼気で補正しようとする呼吸。",
    distinguish: "糖尿病、脱水、意識障害、ケトン体などを確認する。周期的に無呼吸が入る呼吸ではない。",
    keywords: ["クスマウル", "Kussmaul"],
    topicIds: ["diabetes"],
  },
  {
    category: "breathing",
    title: "チェーン・ストークス呼吸",
    diseases: "重症心不全・中枢神経障害など",
    clue: "呼吸が徐々に深くなり、次第に浅くなって無呼吸へ移る周期を繰り返す。",
    distinguish: "深さが増減する規則的な周期が特徴。深大呼吸が連続するクスマウル呼吸と分ける。",
    keywords: ["チェーン・ストークス", "チェーンストークス", "Cheyne"],
    topicIds: ["heart-failure"],
  },
  {
    category: "breathing",
    title: "ビオー呼吸",
    diseases: "髄膜炎・延髄障害など",
    clue: "ほぼ同じ深さの呼吸が数回続いた後、不規則に無呼吸が入る。",
    distinguish: "深さが徐々に増減するチェーン・ストークス呼吸とは異なり、リズムが不規則。",
    keywords: ["ビオー", "Biot"],
    topicIds: [],
  },
  {
    category: "edema",
    title: "両側性の圧痕性浮腫",
    diseases: "心不全・腎疾患・肝硬変など",
    clue: "指で押した跡が残る浮腫。両下肢に対称なら全身性の水・Na貯留や低蛋白を考える。",
    distinguish: "呼吸困難・頸静脈怒張なら心臓、蛋白尿なら腎臓、腹水・肝所見なら肝臓をたどる。",
    keywords: ["圧痕性", "圧痕", "下腿浮腫"],
    topicIds: ["heart-failure", "cirrhosis"],
  },
  {
    category: "edema",
    title: "非圧痕性浮腫",
    diseases: "甲状腺機能低下症の粘液水腫・リンパ浮腫",
    clue: "押してもへこみが残りにくい。粘液水腫ではムコ多糖類の蓄積が関係する。",
    distinguish: "寒がり、徐脈、便秘なら甲状腺機能低下。局所の慢性腫脹ならリンパ流障害も考える。",
    keywords: ["非圧痕性", "粘液水腫"],
    topicIds: ["thyroid"],
  },
  {
    category: "edema",
    title: "片側の下腿腫脹",
    diseases: "深部静脈血栓症（DVT）など",
    clue: "片側だけ急に腫れ、痛み・熱感・左右差を伴うと静脈血栓を疑う。",
    distinguish: "両側性の全身性浮腫と分ける。突然の呼吸困難や胸痛が加われば肺血栓塞栓症を警戒する。",
    keywords: ["深部静脈血栓", "片側", "下腿腫脹"],
    topicIds: [],
  },
  {
    category: "edema",
    title: "腹水＋下腿浮腫",
    diseases: "肝硬変・右心不全など",
    clue: "腹腔内と下肢に水分がたまる。肝硬変では門脈圧亢進と低アルブミン血症が重なる。",
    distinguish: "食道静脈瘤・脾腫・手掌紅斑なら肝硬変、頸静脈怒張・肝腫大なら右心不全を考える。",
    keywords: ["腹水", "下腿浮腫", "頸静脈怒張"],
    topicIds: ["cirrhosis", "heart-failure"],
  },
  {
    category: "skin",
    title: "黄疸",
    diseases: "肝細胞障害・胆道閉塞・溶血など",
    clue: "ビリルビン増加で皮膚や眼球結膜が黄色くなる。褐色尿や便色の変化も確認する。",
    distinguish: "AST・ALT、胆道系酵素、ビリルビン分画を組み合わせ、肝前性・肝性・肝後性を考える。",
    keywords: ["黄疸", "ビリルビン"],
    topicIds: ["hepatitis", "cirrhosis"],
  },
  {
    category: "skin",
    title: "くも状血管腫・手掌紅斑",
    diseases: "肝硬変・慢性肝障害",
    clue: "体幹や顔面の放射状血管拡張、手掌の赤みは慢性肝障害でみられる代表所見。",
    distinguish: "腹水、脾腫、食道静脈瘤、女性化乳房など門脈圧亢進・肝機能低下の所見と結ぶ。",
    keywords: ["くも状血管腫", "手掌紅斑"],
    topicIds: ["cirrhosis"],
  },
  {
    category: "skin",
    title: "蝶形紅斑",
    diseases: "全身性エリテマトーデス（SLE）",
    clue: "頬から鼻根部に蝶が羽を広げたような紅斑がみられる。日光で悪化しやすい。",
    distinguish: "関節症状、腎障害、血球減少、抗核抗体など全身所見と組み合わせる。",
    keywords: ["蝶形紅斑"],
    topicIds: [],
  },
  {
    category: "skin",
    title: "皮膚の色素沈着",
    diseases: "アジソン病",
    clue: "ACTH上昇に関連し、露出部・摩擦部や口腔粘膜などの色素沈着が目立つ。",
    distinguish: "低血圧、倦怠感、体重減少、低Na血症・高K血症を伴うかを見る。",
    keywords: ["色素沈着", "アジソン"],
    topicIds: [],
  },
  {
    category: "skin",
    title: "レイノー現象",
    diseases: "全身性強皮症などの膠原病／一次性レイノー",
    clue: "寒冷や緊張で指先が白色・青紫色・赤色へ変化し、しびれや痛みを伴う。",
    distinguish: "皮膚硬化、指尖潰瘍、関節症状などがあれば基礎疾患を探す。単独なら一次性もある。",
    keywords: ["レイノー", "Raynaud"],
    topicIds: [],
  },
  {
    category: "labs",
    title: "血糖値・HbA1c上昇",
    diseases: "糖尿病",
    clue: "血糖はその時点、HbA1cは過去1〜2か月程度の平均的な血糖状態を反映する。",
    distinguish: "HbA1cだけで決めず、空腹時・随時血糖や75gOGTT、症状、再検査を組み合わせる。",
    keywords: ["HbA1c", "血糖", "75gOGTT"],
    topicIds: ["diabetes"],
  },
  {
    category: "labs",
    title: "トロポニン・CK-MB上昇",
    diseases: "急性心筋梗塞などの心筋障害",
    clue: "心筋細胞が傷害されると血中へ流出する。特に心筋トロポニンは重要な心筋壊死マーカー。",
    distinguish: "上昇だけで病名を決めず、胸痛、時間経過、心電図変化と合わせて心筋梗塞を判断する。",
    keywords: ["トロポニン", "CK-MB", "心筋逸脱酵素"],
    topicIds: ["ischemic-heart"],
  },
  {
    category: "labs",
    title: "AST・ALT上昇",
    diseases: "肝細胞障害",
    clue: "肝細胞が障害されると上昇する。ALTは肝臓との結びつきが比較的強く、ASTは心筋・骨格筋にもある。",
    distinguish: "黄疸、ウイルスマーカー、胆道系酵素、飲酒歴などを加えて原因を絞る。",
    keywords: ["AST", "ALT", "肝逸脱酵素"],
    topicIds: ["hepatitis", "cirrhosis"],
  },
  {
    category: "labs",
    title: "抗CCP抗体・RF・炎症反応",
    diseases: "関節リウマチ",
    clue: "抗CCP抗体やRFは診断の手掛かり、CRPなどは炎症の程度を追う手掛かりになる。",
    distinguish: "検査陽性だけで確定しない。朝のこわばり、MCP・PIP関節の腫脹、画像所見と合わせる。",
    keywords: ["抗CCP", "RF", "リウマトイド因子", "CRP"],
    topicIds: ["rheumatoid"],
  },
  {
    category: "labs",
    title: "TSHとFT4・FT3の組み合わせ",
    diseases: "甲状腺機能亢進症／低下症",
    clue: "原発性の機能亢進ではFT4・FT3上昇、TSH低下。原発性の機能低下では逆になる。",
    distinguish: "TSHだけを暗記せず、下垂体からの刺激と甲状腺ホルモンの負のフィードバックで考える。",
    keywords: ["TSH", "FT4", "FT3", "甲状腺ホルモン"],
    topicIds: ["thyroid"],
  },
  {
    category: "labs",
    title: "1秒率低下",
    diseases: "COPDなどの閉塞性換気障害",
    clue: "努力性肺活量のうち最初の1秒で吐けた割合が低下し、息を速く吐き出しにくいことを示す。",
    distinguish: "閉塞性では1秒率低下。拘束性では肺活量低下が中心になるため、指標を入れ替えない。",
    keywords: ["1秒率", "閉塞性換気障害"],
    topicIds: ["copd"],
  },
  {
    category: "labs",
    title: "BNP・NT-proBNP上昇",
    diseases: "心不全など心臓への負荷",
    clue: "心室への圧・容量負荷で上昇し、呼吸困難が心不全によるものか考える手掛かりになる。",
    distinguish: "腎機能や年齢などでも変動する。症状、身体所見、胸部X線、心エコーと組み合わせる。",
    keywords: ["BNP", "NT-proBNP"],
    topicIds: ["heart-failure"],
  },
];

const TOPIC_MAP = new Map(TOPICS.map((topic) => [topic.id, topic]));
const FINDING_CATEGORY_MAP = new Map(FINDING_CATEGORIES.map((category) => [category.id, category]));
const HISTORY_KEY = "j-clinical-kokushi-history-v1";
const views = [els.loading, els.home, els.selector, els.quiz, els.result, els.topics, els.topicDetail, els.findings, els.error];

let questions = [];
let queue = [];
let position = 0;
let selected = new Set();
let answered = false;
let correctCount = 0;
let wrongQuestions = [];
let activeMode = "random";
let activeTopicId = null;
let topicBackTarget = "topics";
let activeFindingCategory = "gait";
let history = readHistory();

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  } catch {
    return {};
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character]));
}

function show(view) {
  views.forEach((item) => item.classList.add("is-hidden"));
  view.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function weakQuestions() {
  return questions.filter((question) => {
    const stats = history[question.id];
    return stats && stats.wrong > 0 && stats.correct / stats.attempts < 0.7;
  });
}

function updateHistorySummary() {
  const attempted = Object.keys(history).filter((id) => questions.some((question) => question.id === id)).length;
  const weak = weakQuestions().length;
  els.historySummary.innerHTML = attempted
    ? `<strong>${attempted}</strong>問に挑戦<br>苦手 ${weak}問`
    : "まだ記録はありません";
  els.reviewCount.textContent = weak ? `${weak}問` : "";
  els.reviewSavedButton.classList.toggle("is-hidden", weak === 0);
  els.resetHistoryButton.classList.toggle("is-hidden", attempted === 0);
}

function goHome() {
  updateHistorySummary();
  show(els.home);
}

function populateHome() {
  const general = questions.filter((question) => question.section === "総論").length;
  const specific = questions.filter((question) => question.section === "各論").length;
  els.headerTotal.textContent = `${questions.length}問収録`;
  els.generalCount.textContent = `${general}問`;
  els.specificCount.textContent = `${specific}問`;
  updateHistorySummary();
}

function populateRounds() {
  const exams = [...new Set(questions.map((question) => question.exam))].sort((a, b) => a - b);
  els.roundGrid.replaceChildren();
  exams.forEach((exam) => {
    const count = questions.filter((question) => question.exam === exam).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "round-card";
    button.innerHTML = `<strong>第${exam}回</strong><small>${count}問</small><span aria-hidden="true">→</span>`;
    button.addEventListener("click", () => {
      const items = questions
        .filter((question) => question.exam === exam)
        .sort((a, b) => a.number - b.number);
      startQuiz(items);
    });
    els.roundGrid.appendChild(button);
  });
}

function openSelector(mode) {
  activeMode = mode;
  const roundMode = mode === "round";
  els.roundGrid.classList.toggle("is-hidden", !roundMode);
  els.countPanel.classList.toggle("is-hidden", roundMode);
  if (roundMode) {
    els.selectorKicker.textContent = "回数別";
    els.selectorTitle.textContent = "何回を解く？";
    els.selectorDescription.textContent = "選んだ回の問題を、問題番号順に通して解きます。";
  } else if (mode === "general") {
    els.selectorKicker.textContent = "総論";
    els.selectorTitle.textContent = "診察・検査をまとめて";
    els.selectorDescription.textContent = "視診、触診、聴診、生命徴候、感覚・反射などからランダムに出題します。";
  } else if (mode === "specific") {
    els.selectorKicker.textContent = "各論";
    els.selectorTitle.textContent = "主要疾患をまとめて";
    els.selectorDescription.textContent = "臓器別に小分けせず、各論全体からランダムに出題します。";
  } else {
    els.selectorKicker.textContent = "全問ランダム";
    els.selectorTitle.textContent = "総論も各論も混ぜる";
    els.selectorDescription.textContent = "第18〜34回の全393問からランダムに出題します。";
  }
  show(els.selector);
}

function selectedCount() {
  return document.querySelector('input[name="count"]:checked').value;
}

function startSelectedMode() {
  let pool = questions;
  if (activeMode === "general") pool = questions.filter((question) => question.section === "総論");
  if (activeMode === "specific") pool = questions.filter((question) => question.section === "各論");
  pool = shuffled(pool);
  const requested = selectedCount();
  if (requested !== "all") pool = pool.slice(0, Number(requested));
  startQuiz(pool);
}

function startQuiz(items) {
  if (!items.length) return;
  queue = items;
  position = 0;
  correctCount = 0;
  wrongQuestions = [];
  show(els.quiz);
  renderQuestion();
}

function renderQuestion() {
  const question = queue[position];
  selected = new Set();
  answered = false;
  const isMulti = question.answers.length > 1;

  els.progressCurrent.textContent = String(position + 1);
  els.progressTotal.textContent = String(queue.length);
  els.progressBar.style.width = `${((position + 1) / queue.length) * 100}%`;
  els.sourceBadge.textContent = `第${question.exam}回・問題${question.number}`;
  els.questionText.textContent = question.question;
  els.multiNote.textContent = "該当するものをすべて選択";
  els.multiNote.classList.toggle("is-hidden", !isMulti);
  els.submitAnswerButton.classList.remove("is-hidden");
  els.submitAnswerButton.disabled = true;
  els.feedback.className = "feedback is-hidden";
  els.relatedTopics.classList.add("is-hidden");
  els.choices.replaceChildren();

  if (question.image) {
    els.questionImage.src = question.image;
    els.questionImage.classList.remove("is-hidden");
  } else {
    els.questionImage.removeAttribute("src");
    els.questionImage.classList.add("is-hidden");
  }

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.dataset.index = String(index);
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<span class="choice-number">${index + 1}</span><span>${escapeHtml(choice)}</span>`;
    button.addEventListener("click", () => choose(index, isMulti, button));
    els.choices.appendChild(button);
  });
}

function choose(index, isMulti, button) {
  if (answered) return;
  if (!isMulti) {
    [...els.choices.children].forEach((choiceButton) => {
      choiceButton.classList.remove("is-selected");
      choiceButton.setAttribute("aria-pressed", "false");
    });
    selected = new Set([index]);
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
  } else if (selected.has(index)) {
    selected.delete(index);
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  } else {
    selected.add(index);
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
  }
  els.submitAnswerButton.disabled = selected.size === 0;
}

function setsMatch(a, b) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

function renderRelatedTopics(question) {
  const relevant = question.topicIds.map((id) => TOPIC_MAP.get(id)).filter(Boolean);
  els.relatedTopics.replaceChildren();
  if (!relevant.length) {
    els.relatedTopics.classList.add("is-hidden");
    return;
  }
  const label = document.createElement("span");
  label.textContent = "頻出疾患まとめ";
  els.relatedTopics.appendChild(label);
  relevant.forEach((topic) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${topic.title}を見る →`;
    button.addEventListener("click", () => openTopic(topic.id, "quiz"));
    els.relatedTopics.appendChild(button);
  });
  els.relatedTopics.classList.remove("is-hidden");
}

function submitAnswer() {
  if (answered || selected.size === 0) return;
  answered = true;
  const question = queue[position];
  const answers = new Set(question.answers);
  const correct = setsMatch(selected, answers);
  const stats = history[question.id] || { attempts: 0, correct: 0, wrong: 0 };
  stats.attempts += 1;
  if (correct) {
    stats.correct += 1;
    correctCount += 1;
  } else {
    stats.wrong += 1;
    wrongQuestions.push(question);
  }
  history[question.id] = stats;
  saveHistory();

  [...els.choices.children].forEach((button, index) => {
    button.disabled = true;
    button.classList.remove("is-selected");
    if (answers.has(index)) button.classList.add("is-correct");
    else if (selected.has(index)) button.classList.add("is-wrong");
  });

  els.submitAnswerButton.classList.add("is-hidden");
  els.feedback.className = `feedback ${correct ? "is-correct" : "is-wrong"}`;
  els.feedbackIcon.textContent = correct ? "✓" : "×";
  els.feedbackLabel.textContent = correct ? "正解" : "不正解";
  els.feedbackAnswer.textContent = `正解：${question.answers.map((index) => `${index + 1}．${question.choices[index]}`).join("／")}`;
  els.feedbackExplanation.textContent = question.explanation;
  renderRelatedTopics(question);
  els.nextButton.textContent = position === queue.length - 1 ? "結果を見る" : "次の問題へ";
  els.feedback.classList.remove("is-hidden");
  els.nextButton.focus({ preventScroll: true });
}

function nextQuestion() {
  if (position < queue.length - 1) {
    position += 1;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  showResult();
}

function showResult() {
  const percent = Math.round((correctCount / queue.length) * 100);
  els.scorePercent.textContent = String(percent);
  els.scoreCorrect.textContent = String(correctCount);
  els.scoreTotal.textContent = String(queue.length);
  els.scoreRing.style.background = `conic-gradient(var(--teal) ${percent * 3.6}deg, #dfeae7 0deg)`;
  els.resultMessage.textContent = percent === 100
    ? "全問正解。"
    : percent >= 80
      ? "あと少し。間違えた問題だけ確認しよう。"
      : "間違えた問題から、もう一度。";
  els.retryWrongButton.classList.toggle("is-hidden", wrongQuestions.length === 0);
  show(els.result);
}

function populateTopics() {
  els.topicGrid.replaceChildren();
  TOPICS.forEach((topic, index) => {
    const count = questions.filter((question) => question.topicIds.includes(topic.id)).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "topic-card";
    button.innerHTML = `
      <span class="topic-rank">${String(index + 1).padStart(2, "0")}</span>
      <span><strong>${escapeHtml(topic.title)}</strong><small>関連 ${count}問</small></span>
      <span aria-hidden="true">→</span>
    `;
    button.addEventListener("click", () => openTopic(topic.id, "topics"));
    els.topicGrid.appendChild(button);
  });
}

function normalizeSearchText(value) {
  return String(value).normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}

function relatedQuestionsForFinding(finding) {
  const keywords = finding.keywords.map(normalizeSearchText);
  const directMatches = questions.filter((question) => {
    const searchable = normalizeSearchText([
      question.question,
      ...question.choices,
      question.explanation,
    ].join(" "));
    return keywords.some((keyword) => searchable.includes(keyword));
  });
  if (directMatches.length) return directMatches;
  return questions.filter((question) => finding.topicIds.some((topicId) => question.topicIds.includes(topicId)));
}

function renderFindings() {
  const category = FINDING_CATEGORY_MAP.get(activeFindingCategory);
  const items = FINDINGS.filter((finding) => finding.category === activeFindingCategory);
  els.findingCategoryKicker.textContent = category.label;
  els.findingCategoryTitle.textContent = category.lead;
  els.findingCount.textContent = `${items.length}項目`;
  [...els.findingTabs.children].forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeFindingCategory));
  });
  els.findingGrid.replaceChildren();

  items.forEach((finding) => {
    const related = relatedQuestionsForFinding(finding);
    const article = document.createElement("article");
    article.className = "finding-card";
    article.innerHTML = `
      <div class="finding-card-top">
        <h3>${escapeHtml(finding.title)}</h3>
        <span class="finding-question-count">関連 ${related.length}問</span>
      </div>
      <p class="finding-diseases"><span>考える</span>${escapeHtml(finding.diseases)}</p>
      <p class="finding-clue">${escapeHtml(finding.clue)}</p>
      <div class="finding-distinguish">
        <strong>見分けるポイント</strong>
        <p>${escapeHtml(finding.distinguish)}</p>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "finding-actions";
    finding.topicIds.forEach((topicId) => {
      const topic = TOPIC_MAP.get(topicId);
      if (!topic) return;
      const topicButton = document.createElement("button");
      topicButton.type = "button";
      topicButton.className = "finding-action";
      topicButton.textContent = `${topic.title}のまとめ`;
      topicButton.addEventListener("click", () => openTopic(topicId, "findings"));
      actions.appendChild(topicButton);
    });
    if (related.length) {
      const quizButton = document.createElement("button");
      quizButton.type = "button";
      quizButton.className = "finding-action quiz-link";
      quizButton.textContent = `関連過去問 ${related.length}問を解く →`;
      quizButton.addEventListener("click", () => startQuiz(shuffled(related)));
      actions.appendChild(quizButton);
    }
    article.appendChild(actions);
    els.findingGrid.appendChild(article);
  });
}

function populateFindings() {
  els.findingTabs.replaceChildren();
  FINDING_CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "finding-tab";
    button.dataset.category = category.id;
    button.textContent = category.label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      activeFindingCategory = category.id;
      renderFindings();
    });
    els.findingTabs.appendChild(button);
  });
  renderFindings();
}

function openTopic(topicId, backTarget = "topics") {
  const topic = TOPIC_MAP.get(topicId);
  if (!topic) return;
  activeTopicId = topicId;
  topicBackTarget = backTarget;
  const relatedCount = questions.filter((question) => question.topicIds.includes(topicId)).length;
  els.topicTitle.textContent = topic.title;
  els.topicSummary.textContent = topic.summary;
  els.topicFindings.replaceChildren();
  topic.findings.forEach((finding) => {
    const item = document.createElement("li");
    item.textContent = finding;
    els.topicFindings.appendChild(item);
  });
  els.topicConnections.replaceChildren();
  topic.connections.forEach((connection) => {
    const item = document.createElement("li");
    item.textContent = connection;
    els.topicConnections.appendChild(item);
  });
  els.topicPoints.replaceChildren();
  topic.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    els.topicPoints.appendChild(item);
  });
  els.topicTrap.textContent = topic.trap;
  els.topicQuizButton.textContent = `関連過去問 ${relatedCount}問を解く`;
  els.topicDetailBack.textContent = backTarget === "quiz"
    ? "← 解答画面へ"
    : backTarget === "findings"
      ? "← 所見から逆引きへ"
      : "← 頻出疾患一覧へ";
  show(els.topicDetail);
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => openSelector(button.dataset.mode));
});

els.homeLogo.addEventListener("click", goHome);
els.selectorBack.addEventListener("click", goHome);
els.startButton.addEventListener("click", startSelectedMode);
els.reviewSavedButton.addEventListener("click", () => startQuiz(shuffled(weakQuestions())));
els.openTopicsButton.addEventListener("click", () => show(els.topics));
els.openFindingsButton.addEventListener("click", () => show(els.findings));
els.topicsBack.addEventListener("click", goHome);
els.findingsBack.addEventListener("click", goHome);
els.topicDetailBack.addEventListener("click", () => {
  if (topicBackTarget === "quiz") show(els.quiz);
  else if (topicBackTarget === "findings") show(els.findings);
  else show(els.topics);
});
els.topicQuizButton.addEventListener("click", () => {
  const items = questions.filter((question) => question.topicIds.includes(activeTopicId));
  startQuiz(shuffled(items));
});
els.quitButton.addEventListener("click", goHome);
els.submitAnswerButton.addEventListener("click", submitAnswer);
els.nextButton.addEventListener("click", nextQuestion);
els.retryWrongButton.addEventListener("click", () => startQuiz(shuffled(wrongQuestions)));
els.backToHomeButton.addEventListener("click", goHome);
els.resetHistoryButton.addEventListener("click", () => {
  if (!window.confirm("この端末の学習記録をすべて消しますか？")) return;
  history = {};
  localStorage.removeItem(HISTORY_KEY);
  updateHistorySummary();
});

fetch("./questions.json")
  .then((response) => {
    if (!response.ok) throw new Error("questions unavailable");
    return response.json();
  })
  .then((data) => {
    questions = data;
    populateHome();
    populateRounds();
    populateTopics();
    populateFindings();
    show(els.home);
  })
  .catch(() => show(els.error));
