# 解剖学 問題データ

- 本番データ: 親ディレクトリの `questions.json`（526問）
- スキーマ例:
```json
{
  "exam": 34,
  "fiscalYear": 2025,
  "number": 1,
  "question": "設問文",
  "choices": ["選択肢1","選択肢2","選択肢3","選択肢4","選択肢5"],
  "answers": [0],
  "sourcePage": 1,
  "sourceColumn": 1,
  "explanation": "解説"
}
```
- `answers` は 0 始まりのインデックス配列（複数正解可）
- 追加・差し替え後はブラウザを再読み込みしてください
