# 学習資料QAレポート（生理学・一般臨床医学）

- 対象: `physiology-guide/`（生理学 学習資料）、`clinical-guide/`（一般臨床医学 学習資料）
- 対象外: 過去問クイズアプリ本体（資料内の確認用短文のみ検査）
- 実施日: 2026-09-23（JST）

## サマリー

| 区分 | 件数 |
|---|---:|
| 誤字脱字（修正済） | 19 |
| 誤字脱字（要確認・未修正） | 1 |
| 番号被り（修正済） | 28 |
| 番号被り（残・実質false positive） | 2 |
| 記号かぶり（真の選択肢衝突） | 0 |
| 記号かぶり（穴埋め形式の同一番号再掲・意図的・未変更） | 233 |

生理学ガイド（`physiology-guide/content.js`, `deepdive.js`）からは、明らかな誤字・番号被り・記号かぶりは検出されなかった。

## 検査方法

1. `_qa/detect_guide_issues.py` で構造化データ（見出し番号・ノート先頭番号・同一ノート内の同一記号）を走査
2. 既知OCRパターン（漢字間空白、長音符のダッシュ化、`X腺`、`がとうか` 等）をスクリプト検出
3. イントロ・視診・感覚・疾患各論など高頻度セクションを人手サンプリング
4. 修正後に再走査。`node --check` でJS構文を確認（すべてOK）

## 修正一覧（誤字脱字）

| ファイル | 位置 | 修正前 → 修正後 | 備考 |
|---|---|---|---|
| `clinical-guide/content.js` | intro / note:n12 | `プライバシ―` → `プライバシー` | 長音符がダッシュ(―) |
| `clinical-guide/content.js` | intro（2箇所） | `主 訴` → `主訴` | OCR空白 |
| `clinical-guide/content.js` | sensation（複数） | `感 覚` → `感覚` | OCR空白 |
| `clinical-guide/content.js` | sensation | `があ るがとうか判断できる` → `があるかどうか判断できる` | OCR崩れ |
| `clinical-guide/content.js` | inspection | `肥 満度` → `肥満度` | OCR空白 |
| `clinical-guide/content.js` | inspection | `神 経` / `麻 痺` → `神経` / `麻痺` | OCR空白 |
| `clinical-guide/content.js` | vitals | `洞性不 整脈` / `脈拍 数` → `洞性不整脈` / `脈拍数` | OCR空白 |
| `clinical-guide/content.js` | palpation | `右側副部` → `右側腹部` | 誤字 |
| `clinical-guide/content.js` | intro | `診察 の意義` → `診察の意義` | OCR空白 |
| `clinical-guide/content.js` | inspection 見出し | `１ ０ ．`等 → `１０．`等 | OCR番号空白 |
| `clinical-guide/content.js` | intro | `２ ． 問診の内容` → `２．問診の内容` | OCR空白 |
| `clinical-guide/content.js` | inspection | `８ ． 頭部・顔面の視診` → `８．頭部・顔面の視診` | OCR空白 |
| `clinical-guide/content.js` | inspection | `ベル現象 と は？` → `ベル現象とは？` | OCR空白 |
| `clinical-guide/content.js` | inspection | `ヘバーデン 結 節` → `ヘバーデン結節` | OCR空白 |
| `clinical-guide/content.js` | inspection | `尖 足` / `踵 足` → `尖足` / `踵足` | OCR空白 |
| `clinical-guide/content.js` | intro | `ど のように` → `どのように` | OCR空白 |
| `clinical-guide/disease-content.js` | digestive / 潰瘍性大腸炎 | `X腺` → `X線` | OCR誤字 |
| `clinical-guide/disease-content.js` | metabolic / 糖尿病 | `ａ．急性ａ．・` → `ａ．急性・` | 記号「ａ．」重複 |
| `clinical-guide/disease-content.js` | neurology 表 | `治 療` → `治療` | OCR空白 |

## 修正一覧（番号被り・記号不一致）

| ファイル | 位置 | 修正前 → 修正後 | 備考 |
|---|---|---|---|
| `clinical-guide/content.js` | intro | `１．問診の意義と方法` → `（１）問診の意義と方法` | 同章内「１．」重複 |
| `clinical-guide/content.js` | inspection / 末梢性麻痺 | 設問③なのに答が`②` → 答も`③` | 穴埋め番号不一致 |
| `clinical-guide/content.js` | inspection | 見出し`……顔面神経麻痺の徴候……`を挿入 | 眼所見と顔面麻痺の番号衝突を分離 |
| `clinical-guide/content.js` | inspection / 顔面麻痺 | `②〜⑤` → `①〜④` | 分離後に振り直し |
| `clinical-guide/content.js` | inspection | 見出し`……クローヌス……`を挿入（本文末尾混入を除去） | トーヌス節との番号再掲を分離 |
| `clinical-guide/content.js` | symptoms / 髄膜刺激 | 2つ目の`②` → `③` | ブルジンスキー説明の番号重複 |
| `clinical-guide/disease-content.js` | cardiovascular / 心筋梗塞 | `③症状`以降を`④〜⑦`へ繰下げ | `③危険因子`との重複 |
| `clinical-guide/disease-content.js` | digestive / 潰瘍性大腸炎 | `④予後` → `⑤予後` | `④検査`との重複 |
| `clinical-guide/disease-content.js` | metabolic / 糖尿病 | `⑥治療での注意点` → `⑦` | `⑥合併症`との重複 |
| `clinical-guide/disease-content.js` | metabolic / 壊血病 | `①症状` → `②症状` | `①原因`との重複 |
| `clinical-guide/disease-content.js` | metabolic / くる病・骨軟化症 | `③くる病`以降を繰下げ | `③病態`との重複 |
| `clinical-guide/disease-content.js` | hematology / 溶血性貧血 | `②症状`以降を繰下げ | `②分類`との重複 |
| `clinical-guide/disease-content.js` | neurology / アルツハイマー型 | `①病態`→`④`、`②分類`→`⑤` | 診断基準①②③の後の再掲 |
| `clinical-guide/disease-content.js` | neurology / パーキンソン病 | `②好発`以降を繰下げ | `②病態`との重複 |
| `clinical-guide/disease-content.js` | neurology / ALS | `③比較的保たれやすい`→`④`、`④経過`→`⑤` | `③症状`との重複 |
| `clinical-guide/disease-content.js` | renal / 前立腺肥大症 | `③治療` → `④治療` | `③診断`との重複 |

※食道癌の「④予後」を誤って⑤へ繰り下げた件は検出し、**④へ差し戻し済み**（当該節は①〜④で正当）。

## 未修正・残件

| ファイル | 位置 | 内容 | 判断 |
|---|---|---|---|
| `clinical-guide/content.js` | palpation / キュンメル | `キュンメル ：臍部下すぐ右側…` | Kümmell点の表記として妥当な可能性が高く**未修正**（要確認） |
| `clinical-guide/disease-content.js` | hematology / 溶血性貧血 | `②の作用は肝臓も…` | 脾機能②への参照文。項目番号の重複ではない |
| `clinical-guide/disease-content.js` | renal / 膀胱炎節末 | `①糸球体腎炎…②尿管…③尿路結石` | 血尿の鑑別列挙。膀胱炎①定義との衝突ではない |
| `clinical-guide/*` | 穴埋めノート全般 | `①質問 ①答え` 形式 | 学習用穴埋めの同一番号再掲（約233件）。選択肢かぶりではないため**変更なし** |

曖昧な医学表現の書き換えは行っていない（上記キュンメルのみフラグ）。

## 再走査結果

- 真の番号被り（同一見出し配下の項目番号衝突）: **0件**（残2件は参照文・列挙のfalse positive）
- 真の選択肢記号かぶり: **0件**
- 穴埋め形式の同一番号再掲: 意図的形式として残置（233件）
- JS構文: `clinical-guide/content.js`, `clinical-guide/disease-content.js`, `physiology-guide/content.js`, `physiology-guide/deepdive.js` すべて `node --check` OK

## 編集したファイル

- `clinical-guide/content.js`
- `clinical-guide/disease-content.js`
- `_qa/detect_guide_issues.py`（検出器）
- `_qa/apply_guide_fixes.py`（修正スクリプト）
- `_qa/applied-fixes.json`（修正ログ）
- `_qa/guide-qa-report.md`（本レポート）
