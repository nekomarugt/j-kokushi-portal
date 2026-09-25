# 柔道整復師 学習ポータル（セルフホスト版）

ChatGPT Sites 上で公開していた学習ポータル一式を、手元で静的配信できるように移行したコピーです。  
問題文・解説・学習資料は作成者本人のデータをそのまま収録しています。

## 含まれるもの

| パス | 内容 |
|------|------|
| `/` | 3科目ポータル（入口） |
| `/anatomy/` | 解剖学 過去問（第18〜34回・**526問**）＋解説 |
| `/physiology/` | 生理学 過去問（第17〜34回・**482問**） |
| `/clinical/` | 一般臨床医学 過去問（第18〜34回・**393問**）＋頻出疾患・所見逆引き |
| `/anatomy-guide/` | 解剖学 学習資料（**無料**・出題基準別15章／過去問526問から逆引き／印刷用 `print.html`） |
| `/physiology-guide/` | 生理学 学習資料の案内（全文は note 有料） |
| `/clinical-guide/` | 一般臨床医学 学習資料の案内（全文は note 有料） |

学習記録（正誤・苦手）は各過去問アプリが `localStorage` に保存します。過去問は登録・ログイン不要です。学習資料の全文は note（有料）で公開しています。

## 起動方法

```bash
cd /workspace/j-kokushi-portal
python3 -m http.server 8080
```

ブラウザで http://127.0.0.1:8080/ を開いてください。

> `file://` で直接 HTML を開くと `fetch('./questions.json')` が失敗することがあるため、必ず HTTP サーバ経由で開いてください。

## 問題データの場所と編集方法

各クイズアプリの問題バンク:

- `anatomy/questions.json`（526問）
- `physiology/questions.json`（482問）
- `clinical/questions.json`（393問）

スキーマの説明は各アプリの `data/README.md` を参照してください。  
JSON を編集・差し替えたらブラウザを再読み込みすれば反映されます。

### スキーマ（解剖学・生理学）

```json
{
  "exam": 34,
  "fiscalYear": 2025,
  "number": 1,
  "question": "設問文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"],
  "answers": [0],
  "explanation": "解説"
}
```

`answers` は 0 始まりのインデックス配列（複数正解可）。

### スキーマ（一般臨床医学）

```json
{
  "id": "34-12",
  "exam": 34,
  "number": 12,
  "section": "総論",
  "category": "視診",
  "question": "設問文",
  "choices": ["A", "B", "C", "D", "E"],
  "answers": [1],
  "image": null,
  "topicIds": ["parkinson"],
  "explanation": "解説"
}
```

## 注意・免責

- 教員個人制作です。**学校公式ではありません。**
- 国家試験対策・授業復習用の補助教材です。診療・臨床判断の根拠として使用するものではありません。
- 元の ChatGPT Sites からは編集できないため、以降の改修・運用は本ディレクトリ側で行ってください。

## ディレクトリ構成（概要）

```
j-kokushi-portal/
  index.html / styles.css / README.md
  anatomy/           questions.json / app.js / explanations.js / ...
  physiology/        questions.json / app.js / ...
  clinical/          questions.json / app.js / assets/ ...
  physiology-guide/  content.js / deepdive.js / assets/ ...
  clinical-guide/    content.js / disease-content.js / ...
```
