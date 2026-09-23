const els = {
  loading: document.getElementById("loading-view"),
  setup: document.getElementById("setup-view"),
  quiz: document.getElementById("quiz-view"),
  result: document.getElementById("result-view"),
  error: document.getElementById("error-view"),
  headerTotal: document.getElementById("header-total"),
  examSelect: document.getElementById("exam-select"),
  historySummary: document.getElementById("history-summary"),
  startButton: document.getElementById("start-button"),
  reviewSavedButton: document.getElementById("review-saved-button"),
  quitButton: document.getElementById("quit-button"),
  progressCurrent: document.getElementById("progress-current"),
  progressTotal: document.getElementById("progress-total"),
  progressBar: document.getElementById("progress-bar"),
  sourceBadge: document.getElementById("source-badge"),
  multiNote: document.getElementById("multi-note"),
  questionText: document.getElementById("question-text"),
  choices: document.getElementById("choices"),
  submitAnswerButton: document.getElementById("submit-answer-button"),
  feedback: document.getElementById("feedback"),
  feedbackIcon: document.getElementById("feedback-icon"),
  feedbackLabel: document.getElementById("feedback-label"),
  feedbackAnswer: document.getElementById("feedback-answer"),
  feedbackExplanation: document.getElementById("feedback-explanation"),
  nextButton: document.getElementById("next-button"),
  scoreRing: document.getElementById("score-ring"),
  scorePercent: document.getElementById("score-percent"),
  scoreCorrect: document.getElementById("score-correct"),
  scoreTotal: document.getElementById("score-total"),
  resultMessage: document.getElementById("result-message"),
  retryWrongButton: document.getElementById("retry-wrong-button"),
  backToSetupButton: document.getElementById("back-to-setup-button"),
  resetHistoryButton: document.getElementById("reset-history-button"),
};

const HISTORY_KEY = "j-physiology-kokushi-history-v1";
let questions = [];
let queue = [];
let position = 0;
let selected = new Set();
let answered = false;
let correctCount = 0;
let wrongQuestions = [];
let history = readHistory();

function questionId(question) {
  return `${question.exam}-${question.number}`;
}

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

function show(view) {
  [els.loading, els.setup, els.quiz, els.result, els.error].forEach((item) => item.classList.add("is-hidden"));
  view.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function populateSetup() {
  const exams = [...new Set(questions.map((question) => question.exam))].sort((a, b) => b - a);
  exams.forEach((exam) => {
    const count = questions.filter((question) => question.exam === exam).length;
    const option = document.createElement("option");
    option.value = String(exam);
    option.textContent = `第${exam}回（${count}問）`;
    els.examSelect.appendChild(option);
  });
  els.headerTotal.textContent = `${questions.length}問収録`;
  updateHistorySummary();
}

function updateHistorySummary() {
  const attempted = Object.keys(history).length;
  const weak = questions.filter((question) => {
    const stats = history[questionId(question)];
    return stats && stats.wrong > 0 && stats.correct / stats.attempts < 0.7;
  }).length;

  els.historySummary.innerHTML = attempted
    ? `<strong>${attempted}</strong>問に挑戦<br>苦手 ${weak}問`
    : "まだ記録はありません";
  els.reviewSavedButton.classList.toggle("is-hidden", weak === 0);
  els.resetHistoryButton.classList.toggle("is-hidden", attempted === 0);
}

function selectedCount() {
  return document.querySelector('input[name="count"]:checked').value;
}

function startFromSetup() {
  const exam = els.examSelect.value;
  let pool = exam === "all" ? questions : questions.filter((question) => question.exam === Number(exam));
  const requested = selectedCount();
  if (requested !== "all") pool = shuffled(pool).slice(0, Number(requested));
  else pool = shuffled(pool);
  startQuiz(pool);
}

function startSavedReview() {
  const pool = questions.filter((question) => {
    const stats = history[questionId(question)];
    return stats && stats.wrong > 0 && stats.correct / stats.attempts < 0.7;
  });
  startQuiz(shuffled(pool));
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
  els.multiNote.classList.toggle("is-hidden", !isMulti);
  els.submitAnswerButton.classList.remove("is-hidden");
  els.submitAnswerButton.disabled = true;
  els.feedback.className = "feedback is-hidden";
  els.choices.replaceChildren();

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

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character]));
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

function submitAnswer() {
  if (answered || selected.size === 0) return;
  answered = true;
  const question = queue[position];
  const answers = new Set(question.answers);
  const correct = setsMatch(selected, answers);
  const id = questionId(question);
  const stats = history[id] || { attempts: 0, correct: 0, wrong: 0 };
  stats.attempts += 1;
  if (correct) {
    stats.correct += 1;
    correctCount += 1;
  } else {
    stats.wrong += 1;
    wrongQuestions.push(question);
  }
  history[id] = stats;
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
  els.feedbackExplanation.textContent = question.explanation || "正解の選択肢と設問の条件をセットで覚えましょう。";
  els.nextButton.textContent = position === queue.length - 1 ? "結果を見る" : "次の問題へ";
  els.feedback.classList.remove("is-hidden");
  els.nextButton.focus({ preventScroll: true });
}

function nextQuestion() {
  if (position < queue.length - 1) {
    position += 1;
    renderQuestion();
    return;
  }
  showResult();
}

function showResult() {
  const percent = Math.round((correctCount / queue.length) * 100);
  els.scorePercent.textContent = String(percent);
  els.scoreCorrect.textContent = String(correctCount);
  els.scoreTotal.textContent = String(queue.length);
  els.scoreRing.style.background = `conic-gradient(var(--blue) ${percent * 3.6}deg, #e7ecf4 0deg)`;
  els.resultMessage.textContent = percent === 100
    ? "全問正解。"
    : percent >= 80
      ? "あと少し。間違えた問題だけ確認しよう。"
      : "間違えた問題から、もう一度。";
  els.retryWrongButton.classList.toggle("is-hidden", wrongQuestions.length === 0);
  show(els.result);
}

els.startButton.addEventListener("click", startFromSetup);
els.reviewSavedButton.addEventListener("click", startSavedReview);
els.submitAnswerButton.addEventListener("click", submitAnswer);
els.nextButton.addEventListener("click", nextQuestion);
els.retryWrongButton.addEventListener("click", () => startQuiz(shuffled(wrongQuestions)));
els.backToSetupButton.addEventListener("click", () => {
  updateHistorySummary();
  show(els.setup);
});
els.quitButton.addEventListener("click", () => {
  updateHistorySummary();
  show(els.setup);
});
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
    populateSetup();
    show(els.setup);
  })
  .catch(() => show(els.error));
