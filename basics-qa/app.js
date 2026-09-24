(function () {
  "use strict";

  var ALL = Array.isArray(window.BASICS_QA) ? window.BASICS_QA.slice() : [];

  var state = {
    topic: "全部",
    deck: [],
    index: 0,
    revealed: false
  };

  var els = {
    headerTotal: document.getElementById("header-total"),
    setupView: document.getElementById("setup-view"),
    drillView: document.getElementById("drill-view"),
    doneView: document.getElementById("done-view"),
    setupCount: document.getElementById("setup-count"),
    startButton: document.getElementById("start-button"),
    quitButton: document.getElementById("quit-button"),
    progressCurrent: document.getElementById("progress-current"),
    progressTotal: document.getElementById("progress-total"),
    progressBar: document.getElementById("progress-bar"),
    topicBadge: document.getElementById("topic-badge"),
    questionText: document.getElementById("question-text"),
    revealButton: document.getElementById("reveal-button"),
    revealPanel: document.getElementById("reveal-panel"),
    answerText: document.getElementById("answer-text"),
    whyText: document.getElementById("why-text"),
    nextButton: document.getElementById("next-button"),
    doneCount: document.getElementById("done-count"),
    restartButton: document.getElementById("restart-button"),
    backSetupButton: document.getElementById("back-setup-button")
  };

  function shuffle(list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function filterByTopic(topic) {
    if (topic === "全部") return ALL.slice();
    return ALL.filter(function (q) {
      return q.topic === topic;
    });
  }

  function selectedTopic() {
    var checked = document.querySelector('input[name="topic"]:checked');
    return checked ? checked.value : "全部";
  }

  function showView(name) {
    els.setupView.classList.toggle("is-hidden", name !== "setup");
    els.drillView.classList.toggle("is-hidden", name !== "drill");
    els.doneView.classList.toggle("is-hidden", name !== "done");
  }

  function updateSetupCopy() {
    var topic = selectedTopic();
    var count = filterByTopic(topic).length;
    els.setupCount.textContent =
      topic === "全部"
        ? "血液＋免疫＋細胞・全" + count + "問（シャッフル出題）"
        : topic + "・" + count + "問（シャッフル出題）";
    els.headerTotal.textContent = ALL.length + "問";
  }

  function renderCard() {
    var q = state.deck[state.index];
    if (!q) return;

    els.progressCurrent.textContent = String(state.index + 1);
    els.progressTotal.textContent = String(state.deck.length);
    els.progressBar.style.width =
      ((state.index + 1) / state.deck.length) * 100 + "%";
    els.topicBadge.textContent = q.topic;
    els.questionText.textContent = q.question;

    els.answerText.textContent = q.answer;
    els.whyText.textContent = q.why;

    state.revealed = false;
    els.revealPanel.classList.add("is-hidden");
    els.revealButton.classList.remove("is-hidden");
    els.revealButton.focus();
  }

  function startDrill(topic) {
    state.topic = topic || selectedTopic();
    state.deck = shuffle(filterByTopic(state.topic));
    state.index = 0;
    state.revealed = false;

    if (!state.deck.length) {
      updateSetupCopy();
      showView("setup");
      return;
    }

    showView("drill");
    renderCard();
  }

  function reveal() {
    state.revealed = true;
    els.revealButton.classList.add("is-hidden");
    els.revealPanel.classList.remove("is-hidden");
    els.nextButton.focus();
  }

  function next() {
    if (!state.revealed) {
      reveal();
      return;
    }
    if (state.index >= state.deck.length - 1) {
      els.doneCount.textContent = String(state.deck.length);
      showView("done");
      els.restartButton.focus();
      return;
    }
    state.index += 1;
    renderCard();
  }

  function quitToSetup() {
    showView("setup");
    updateSetupCopy();
  }

  document.querySelectorAll('input[name="topic"]').forEach(function (input) {
    input.addEventListener("change", updateSetupCopy);
  });

  els.startButton.addEventListener("click", function () {
    startDrill(selectedTopic());
  });
  els.revealButton.addEventListener("click", reveal);
  els.nextButton.addEventListener("click", next);
  els.quitButton.addEventListener("click", quitToSetup);
  els.restartButton.addEventListener("click", function () {
    startDrill(state.topic);
  });
  els.backSetupButton.addEventListener("click", quitToSetup);

  updateSetupCopy();
  showView("setup");
})();
