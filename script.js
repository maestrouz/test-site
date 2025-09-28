const tg = window.Telegram.WebApp;
tg.ready();

// ==== Savollar ro‘yxati ====
const questions = [
  {
    q: "1) Quyosh tizimida nechta sayyora bor?",
    options: ["7", "8", "9", "10"],
    correct: 1
  },
  {
    q: "2) H2O formulasi qaysi moddaga tegishli?",
    options: ["Oqsil", "Suv", "Kislorod", "Vodorod"],
    correct: 1
  },
  {
    q: "3) HTML nima uchun ishlatiladi?",
    options: [
      "Ma’lumotlar bazasi",
      "Veb sahifa tuzilishi",
      "Rasmlarni tahrirlash",
      "Serverni sozlash"
    ],
    correct: 1
  }
];

let current = 0;
let correctCount = 0;
let wrongCount = 0;
let timer;
let timeLeft = 60;

// ==== HTML elementlar ====
const qText = document.getElementById("qText");
const answersDiv = document.getElementById("answers");
const qIndex = document.getElementById("qIndex");
const qTotal = document.getElementById("qTotal");
const timeEl = document.getElementById("timeLeft");
const correctEl = document.getElementById("correctCount");
const wrongEl = document.getElementById("wrongCount");
const resultBox = document.getElementById("resultBox");
const finalScore = document.getElementById("finalScore");
const finalDetail = document.getElementById("finalDetail");
const nextBtn = document.getElementById("nextBtn");

// ==== Testni boshlash ====
qTotal.textContent = questions.length;
loadQuestion();

// ==== Savolni yuklash ====
function loadQuestion() {
  if (current >= questions.length) {
    endQuiz();
    return;
  }

  let q = questions[current];
  qIndex.textContent = current + 1;
  qText.textContent = q.q;
  answersDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    let btn = document.createElement("button");
    btn.className = "btn btn--ghost";
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(i);
    answersDiv.appendChild(btn);
  });

  resetTimer();
}

// ==== Javobni tekshirish ====
function checkAnswer(i) {
  let q = questions[current];
  if (i === q.correct) {
    correctCount++;
    correctEl.textContent = correctCount;
  } else {
    wrongCount++;
    wrongEl.textContent = wrongCount;
  }
  current++;
  loadQuestion();
}

// ==== Taymer ====
function resetTimer() {
  clearInterval(timer);
  timeLeft = 60;
  timeEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      wrongCount++;
      wrongEl.textContent = wrongCount;
      current++;
      loadQuestion();
    }
  }, 1000);
}

// ==== Test tugashi ====
function endQuiz() {
  clearInterval(timer);
  document.querySelector(".question-area").style.display = "none";
  resultBox.style.display = "block";

  finalScore.textContent = `${correctCount} / ${questions.length}`;
  finalDetail.innerHTML = `
    ✅ To‘g‘ri: ${correctCount}<br>
    ❌ Noto‘g‘ri: ${wrongCount}<br>
    📊 Jami: ${questions.length}
  `;

  // Botga natijani yuborish
  fetch("bot.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: tg.initDataUnsafe?.user?.id,
      fullname: tg.initDataUnsafe?.user?.first_name + " " + (tg.initDataUnsafe?.user?.last_name || ""),
      username: tg.initDataUnsafe?.user?.username || "",
      correct: correctCount,
      wrong: wrongCount,
      total: questions.length
    })
  });
}
