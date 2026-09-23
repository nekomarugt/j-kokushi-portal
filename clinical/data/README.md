# 一般臨床医学 問題データ

- 本番データ: 親ディレクトリの `questions.json`（393問）
- スキーマ例:
```json
{
  "id": "34-12",
  "exam": 34,
  "number": 12,
  "section": "総論",
  "category": "視診",
  "question": "設問文",
  "choices": ["A","B","C","D","E"],
  "answers": [1],
  "image": null,
  "topicIds": ["parkinson"],
  "explanation": "解説"
}
```
- 画像は `assets/` 配下、`image` は `./assets/....png` 形式
