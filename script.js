// === Savollar ro‘yxati ===
  const questions = [
    {
      text: "O‘zbekiston poytaxti qaysi?",
      answers: ["Toshkent", "Samarqand", "Buxoro", "Xiva"],
      correct: 0
    },
    {
      text: "H2O bu nima?",
      answers: ["Kislorod", "Vodorod", "Suv", "Azot"],
      correct: 2
    },
    {
      text: "2 + 2 * 2 = ?",
      answers: ["6", "8", "4", "10"],
      correct: 0
    }
  ];

  // === Telegram WebApp ma'lumotlari ===
  const tg = window.Telegram.WebApp;
  tg.ready();

  let userId = tg.initDataUnsafe?.user?.id;
  let fullname = (tg.initDataUnsafe?.user?.first_name || "") + " " + (tg.initDataUnsafe?.user?.last_name || "");
  let username = tg.initDataUnsafe?.user?.username || "NoUsername";

  // === Test o'zgaruvchilari ===
  let currentIndex = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let timer;
  let timeLeft = 60;

  // === HTML elementlarni olish ===
  const qText = document.getElementById("qText");
  const qNumber = document.getElementById("qNumber");
  const answersDiv = document.getElementById("answers");
  const qIndex = document.getElementById("qIndex");
  const qTotal = document.getElementById("qTotal");
  const totalCount = document.getElementById("totalCount");
  const progressBar = document.getElementById("progressBar");
  const timeLeftEl = document.getElementById("timeLeft");
  const circle = document.getElementById("circle");
  const correctEl = document.getElementById("correctCount");
  const wrongEl = document.getElementById("wrongCount");
  const resultBox = document.getElementById("resultBox");

  // Boshlanish
  totalCount.innerText = questions.length;
  qTotal.innerText = questions.length;
  loadQuestion();

  // === Savolni yuklash ===
  function loadQuestion() {
    if (currentIndex >= questions.length) {
      showResult();
      return;
    }

    let q = questions[currentIndex];
    qText.innerText = q.text;
    qNumber.innerText = currentIndex + 1;
    qIndex.innerText = currentIndex + 1;

    answersDiv.innerHTML = "";
    q.answers.forEach((ans, i) => {
      let btn = document.createElement("button");
      btn.className = "btn btn--ghost";
      btn.innerText = ans;
      btn.onclick = () => checkAnswer(i);
      answersDiv.appendChild(btn);
    });

    // Progress bar
    progressBar.style.width = ((currentIndex) / questions.length) * 100 + "%";

    // Timer
    resetTimer();
  }

  // === Javobni tekshirish ===
  function checkAnswer(index) {
    let q = questions[currentIndex];
    if (index === q.correct) {
      correctCount++;
      correctEl.innerText = correctCount;
    } else {
      wrongCount++;
      wrongEl.innerText = wrongCount;
    }

    currentIndex++;
    loadQuestion();
  }

  // === Timer boshqarish ===
  function resetTimer() {
    clearInterval(timer);
    timeLeft = 60;
    timeLeftEl.innerText = timeLeft;
    updateCircle();

    timer = setInterval(() => {
      timeLeft--;
      timeLeftEl.innerText = timeLeft;
      updateCircle();

      if (timeLeft <= 0) {
        clearInterval(timer);
        wrongCount++;
        wrongEl.innerText = wrongCount;
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

    let correct = correctCount;
    let wrong = wrongCount;
    let total = questions.length;

    document.getElementById("finalScore").innerText = `${correct} / ${total}`;
    document.getElementById("finalDetail").innerText =
      `✅ To‘g‘ri: ${correct} ta\n❌ Noto‘g‘ri: ${wrong} ta\n📌 Jami savol: ${total}`;

    // === Natijani botga yuborish ===
    sendResult(correct, wrong, total);
  }

  // === Natijani botga yuborish ===
  function sendResult(correct, wrong, total) {
    const BOT_TOKEN = "7990072466:AAF8ru8yUdtnygvbVQRomFVZdVBKtn0g5uU";
    const ADMINS = [975029364]; // Admin ID lar

    let msg =
      `📊 Test natijasi:%0A%0A` +
      `👤 ${fullname} (@${username})%0A🆔 ID: ${userId}%0A%0A` +
      `✅ To‘g‘ri: ${correct}%0A❌ Noto‘g‘ri: ${wrong}%0A📌 Jami: ${total}%0A` +
      `⭐ Ball: ${Math.round((correct / total) * 100)}%`;

    // Foydalanuvchiga yuborish
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${userId}&text=${msg}`);

    // Adminlarga yuborish
    ADMINS.forEach(admin => {
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${admin}&text=📢 Yangi natija!%0A%0A${msg}`);
    });
  }

  // === Qayta boshlash ===
  document.getElementById("retryBtn").onclick = () => {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    correctEl.innerText = "0";
    wrongEl.innerText = "0";
    document.querySelector(".question-area").style.display = "flex";
    resultBox.style.display = "none";
    loadQuestion();
  };