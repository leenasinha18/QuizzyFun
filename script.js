const questions = [
  {
    questionText: "Which language runs in a web browser?",
    answerChoices: ["Java", "C", "Python", "JavaScript"],
    correctAnswer: 3,
    explanation:
      "JavaScript is the scripting language that runs in web browsers.",
  },
  {
    questionText: "What does CSS stand for?",
    answerChoices: [
      "Central Style Sheets",
      "Cascading Style Sheets",
      "Cascading Simple Sheets",
      "Cars SUVs Sailboats",
    ],
    correctAnswer: 1,
    explanation:
      "CSS stands for Cascading Style Sheets and it`s used for styling HTML.",
  },
  {
    questionText: "Which HTML element do we put the JavaScript in?",
    answerChoices: [
      "&lt;script&gt;",
      "&lt;js&gt;",
      "&lt;javascript&gt;",
      "&lt;scripting&gt;",
    ],
    correctAnswer: 0,
    explanation: "The <script> tag is used to include JavaScript in HTML.",
  },
  {
    questionText: "Which operator is used to assign a value to a variable?",
    answerChoices: ["-", "x", "=", "-"],
    correctAnswer: 3,
    explanation: "The = operator assigns a value to a variable.",
  },
  {
    questionText:
      "Which built-in method removes the last element from an array in JavaScript?",
    answerChoices: ["pop()", "last()", "remove()", "shift()"],
    correctAnswer: 0,
    explanation: "pop() removes the last element from an array.",
  },
];

// Variables as per pseudocode
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswers = Array(questions.length).fill(null); // store chosen index or null
const timerLimit = 10; // seconds, per question
let quizCompleted = false;

// Internal timer state
let remaining = timerLimit;
let timerInterval = null;

// DOM refs
const qTotal = document.getElementById("qTotal");
const qIndex = document.getElementById("qIndex");
const questionText = document.getElementById("questionText");
const choicesEl = document.getElementById("choices");
const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const reviewArea = document.getElementById("reviewArea");
const finalCard = document.getElementById("finalCard");
const quizCard = document.getElementById("quizCard");
const scoreHeading = document.getElementById("scoreHeading");
const percentText = document.getElementById("percentText");
const reviewList = document.getElementById("reviewList");
const retryBtn = document.getElementById("retryBtn");

qTotal.textContent = questions.length;
document.getElementById("timerLimitDisplay").textContent = timerLimit + "s";

// Render a question
function renderQuestion() {
  const q = questions[currentQuestionIndex];
  qIndex.textContent = currentQuestionIndex + 1;
  questionText.innerHTML = q.questionText
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // progress
  const percent = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = percent + "%";

  // render choices
  choicesEl.innerHTML = "";
  q.answerChoices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.innerHTML = choice;
    btn.dataset.index = i;
    if (selectedAnswers[currentQuestionIndex] !== null)
      btn.classList.add("disabled");
    if (selectedAnswers[currentQuestionIndex] === i)
      btn.classList.add("selected");
    btn.addEventListener("click", () => selectChoice(i));
    choicesEl.appendChild(btn);
  });

  // update prev/next
  prevBtn.disabled = currentQuestionIndex === 0;
  prevBtn.classList.toggle("ghost", currentQuestionIndex !== 0);
  nextBtn.textContent =
    currentQuestionIndex === questions.length - 1 ? "Finish" : "Next";

  // show explanation only if answered
  renderReviewArea();

  // reset & start timer
  resetTimer();
  startTimer();
}

function renderReviewArea() {
  const ans = selectedAnswers[currentQuestionIndex];
  if (ans === null) {
    reviewArea.innerHTML =
      '<div class="small">Select an answer (auto-advanced when timer ends)</div>';
  } else {
    const correct = questions[currentQuestionIndex].correctAnswer;
    const ok = ans === correct;
    reviewArea.innerHTML = `<div class="explanation">Your answer: <strong>${
      questions[currentQuestionIndex].answerChoices[ans]
    }</strong><br>Correct answer: <strong>${
      questions[currentQuestionIndex].answerChoices[correct]
    }</strong><br><em>${
      ok ? "Correct 🎉" : "Incorrect"
    }</em><div style="margin-top:8px">${
      questions[currentQuestionIndex].explanation || ""
    }</div></div>`;
  }
}

// Confetti popper animation
function showConfetti() {
  const confettiColors = [
    "#4f46e5",
    "#06b6d4",
    "#22c55e",
    "#fbbf24",
    "#ef4444",
    "#a21caf",
  ];
  const confettiCount = 32;
  const confettiContainer = document.createElement("div");
  confettiContainer.style.position = "fixed";
  confettiContainer.style.left = 0;
  confettiContainer.style.top = 0;
  confettiContainer.style.width = "100vw";
  confettiContainer.style.height = "100vh";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.zIndex = 9999;
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < confettiCount; i++) {
    const conf = document.createElement("div");
    const size = Math.random() * 10 + 8;
    conf.style.position = "absolute";
    conf.style.width = `${size}px`;
    conf.style.height = `${size * 0.6}px`;
    conf.style.background =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    conf.style.left = `${Math.random() * 100}%`;
    conf.style.top = "-20px";
    conf.style.borderRadius = "2px";
    conf.style.opacity = 0.85;
    conf.style.transform = `rotate(${Math.random() * 360}deg)`;
    conf.style.transition = "transform 2.2s, top 2.2s, opacity 2.2s"; // slowed down
    confettiContainer.appendChild(conf);
    setTimeout(() => {
      conf.style.top = `${80 + Math.random() * 15}vh`;
      conf.style.transform += ` translateY(60vh) rotate(${
        Math.random() * 360
      }deg)`;
      conf.style.opacity = 0;
    }, 10);
    setTimeout(() => {
      conf.remove();
      if (i === confettiCount - 1) confettiContainer.remove();
    }, 2600); // slowed down
  }
}

function selectChoice(choiceIndex) {
  if (selectedAnswers[currentQuestionIndex] !== null) return; // don't change after selection
  selectedAnswers[currentQuestionIndex] = choiceIndex;

  // mark selected UI
  Array.from(choicesEl.children).forEach((btn) => {
    btn.classList.add("disabled");
    if (+btn.dataset.index === choiceIndex) btn.classList.add("selected");
  });

  // scoring
  const correct = questions[currentQuestionIndex].correctAnswer;
  if (choiceIndex === correct) {
    score += 1;
    showConfetti(); // show animated poppers
  }

  // stop timer & show explanation
  stopTimer();
  renderReviewArea();

  // auto advance after a short delay so user can see feedback
  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1)
      gotoQuestion(currentQuestionIndex + 1);
    else finishQuiz();
  }, 900);
}

function gotoQuestion(idx) {
  if (idx < 0 || idx >= questions.length) return;
  currentQuestionIndex = idx;
  renderQuestion();
}

// Timer helpers
function startTimer() {
  remaining = timerLimit;
  timerEl.textContent = remaining + "s";
  timerInterval = setInterval(() => {
    remaining -= 1;
    timerEl.textContent = remaining + "s";
    if (remaining <= 0) {
      // time up: if not answered, record null and move on
      stopTimer();
      if (selectedAnswers[currentQuestionIndex] === null) {
        // leave as null (treated as incorrect); show explanation
        renderReviewArea();
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1)
            gotoQuestion(currentQuestionIndex + 1);
          else finishQuiz();
        }, 800);
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
function resetTimer() {
  stopTimer();
  remaining = timerLimit;
  timerEl.textContent = remaining + "s";
}

function finishQuiz() {
  quizCompleted = true;
  stopTimer();
  // final progress bar
  progressBar.style.width = "100%";
  // compute score: already incremented on correct selection; unanswered or wrong won't add
  quizCard.style.display = "none";
  finalCard.style.display = "block";
  scoreHeading.textContent = `You scored ${score} / ${questions.length}`;
  const percent = Math.round((score / questions.length) * 100);
  percentText.textContent = `Percentage: ${percent}%`;

  // build review list
  reviewList.innerHTML = "";
  questions.forEach((q, i) => {
    const chosen = selectedAnswers[i];
    const correct = q.correctAnswer;
    const li = document.createElement("div");
    li.style.padding = "10px 0";
    li.innerHTML = `<div style="font-weight:600">Q${i + 1}. ${
      q.questionText
    }</div>
          <div class="small">Your answer: ${
            chosen === null ? "<em>Unanswered</em>" : q.answerChoices[chosen]
          }</div>
          <div class="small">Correct answer: ${q.answerChoices[correct]}</div>
          <div class="explanation">${q.explanation || ""}</div>`;
    reviewList.appendChild(li);
  });
}

// Event listeners
prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) gotoQuestion(currentQuestionIndex - 1);
});
nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1)
    gotoQuestion(currentQuestionIndex + 1);
  else finishQuiz();
});

retryBtn.addEventListener("click", () => {
  // reset everything
  currentQuestionIndex = 0;
  score = 0;
  selectedAnswers = Array(questions.length).fill(null);
  quizCompleted = false;
  finalCard.style.display = "none";
  quizCard.style.display = "block";
  progressBar.style.width = "0%";
  renderQuestion();
});

// start
renderQuestion();
