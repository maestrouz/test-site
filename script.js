// === Telegram WebApp ===
const tg = window.Telegram.WebApp;
tg.ready();

// === Savollar ro‘yxati ===
const questions = [
  {
    q: "O‘zbekiston poytaxti qaysi?",
    options: ["Toshkent", "Samarqand", "Buxoro", "Xiva"],
    correct: 0
  },
  {
    q: "H2O bu nima?",
    options: ["Kislorod", "Vodorod", "Suv", "Azot"],
    correct: 2
  },
  {
    q: "2 + 2 * 2 = ?",
    options: ["6", "8", "4", "10"],
    correct: 0
  }
];

// === O‘zgaruvchilar ===
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let timer;
let timeLeft = 60;

// === HTML elementlar ===
const qText = document.getElementById("qText");
const qNumber = document.getElementById("qNumber");
const qIndex = document.getElementById("qIndex");
const qTotal = document.getElementById("qTotal");
const totalCount = document.getElementById("totalCount");
const answersDiv = document.getElementById("answers");
const timeEl = document.getElementById("timeLeft");
const circle = document.getElementById("circle");
const correctEl = document.getElementById("correctCount");
const wrongEl = document.getElementById("wrongCount");
const resultBox = document.getElementById("resultBox");
const finalScore = document.getElementById("finalScore");
const finalDetail = document.getElementById("finalDetail");
const retryBtn = document.getElementById("retryBtn");

// === Boshlanish ===
qTotal.textContent = questions.length;
totalCount.textContent = questions.length;
loadQuestion();

// === Savolni yuklash ===
function loadQuestion() {
  if (currentIndex >= questions.length) {
    showResult();
    return;
  }

  let q = questions[currentIndex];
  qText.textContent = q.q;
  qNumber.textContent = currentIndex + 1;
  qIndex.textContent = currentIndex + 1;

  // Javoblarni chiqarish
  answersDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    let btn = document.createElement("button");
    btn.className = "btn btn--ghost";
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(i);
    answersDiv.appendChild(btn);
  });

  // Progress bar
  document.getElementById("progressBar").style.width =
    (currentIndex / questions.length) * 100 + "%";

  // Timer
  resetTimer();
}

// === Javobni tekshirish ===
function checkAnswer(i) {
  let q = questions[currentIndex];
  if (i === q.correct) {
    correctCount++;
    correctEl.textContent = correctCount;
  } else {
    wrongCount++;
    wrongEl.textContent = wrongCount;
  }
  currentIndex++;
  loadQuestion();
}

// === Timer boshqarish ===
function resetTimer() {
  clearInterval(timer);
  timeLeft = 60;
  timeEl.textContent = timeLeft;
  updateCircle();

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    updateCircle();

    if (timeLeft <= 0) {
      clearInterval(timer);
      wrongCount++;
      wrongEl.textContent = wrongCount;
      currentIndex++;
      loadQuestion();
    }
  }, 1000);
}

function updateCircle() {
  let circumference = 2 * Math.PI * 45;
  let offset = circumference - (timeLeft / 60) * circumference;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;
}

// === Natijani ko‘rsatish ===
function showResult() {
  clearInterval(timer);
  document.querySelector(".question-area").style.display = "none";
  resultBox.style.display = "block";

  let total = questions.length;

  finalScore.textContent = `${correctCount} / ${total}`;
  finalDetail.textContent =
    `✅ To‘g‘ri: ${correctCount} ta\n❌ Noto‘g‘ri: ${wrongCount} ta\n📌 Jami: ${total}`;

  // === Telegram foydalanuvchi ma’lumotlari ===
  let user = tg.initDataUnsafe?.user || {};
  let userId = user.id || null;
  let username = user.username || "NoUsername";
  let fullname = (user.first_name || "") + " " + (user.last_name || "");

  // === Backendga yuborish (bot.php) ===
  fetch("bot.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      username: username,
      fullname: fullname.trim(),
      correct: correctCount,
      wrong: wrongCount,
      total: total
    })
  })
    .then(res => res.json())
    .then(data => console.log("✅ Natija yuborildi:", data))
    .catch(err => console.error("❌ Xato:", err));
}

// === Qayta boshlash tugmasi ===
retryBtn.onclick = () => {
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  correctEl.textContent = "0";
  wrongEl.textContent = "0";
  document.querySelector(".question-area").style.display = "flex";
  resultBox.style.display = "none";
  loadQuestion();
};
