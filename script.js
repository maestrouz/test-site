// === Savollar ro‘yxati (misol uchun) ===
  const questions = [
    { text: "O‘zbekiston poytaxti qaysi?", answers: ["Toshkent", "Samarqand", "Buxoro", "Xiva"], correct: 0 },
    { text: "H2O bu nima?", answers: ["Kislorod", "Vodorod", "Suv", "Azot"], correct: 2 },
    { text: "2 + 2 * 2 = ?", answers: ["6", "8", "4", "10"], correct: 0 }
  ];

  let currentIndex = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let timer;
  let timeLeft = 60;

  const qText = document.getElementById("qText");
  const qNumber = document.getElementById("qNumber");
  const answersDiv = document.getElementById("answers");
  const qTotal = document.getElementById("qTotal");
  const timeLeftEl = document.getElementById("timeLeft");
  const correctEl = document.getElementById("correctCount");
  const wrongEl = document.getElementById("wrongCount");
  const resultBox = document.getElementById("resultBox");

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

    answersDiv.innerHTML = "";
    q.answers.forEach((ans, i) => {
      let btn = document.createElement("button");
      btn.className = "btn";
      btn.innerText = ans;
      btn.onclick = () => checkAnswer(i);
      answersDiv.appendChild(btn);
    });

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

    timer = setInterval(() => {
      timeLeft--;
      timeLeftEl.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        wrongCount++;
        wrongEl.innerText = wrongCount;
        currentIndex++;
        loadQuestion();
      }
    }, 1000);
  }

  // === Natijani ko‘rsatish va PHP ga yuborish ===
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

    const tg = window.Telegram.WebApp;
    tg.ready();

    let user = tg.initDataUnsafe?.user || {};
    let userId = user.id || null;
    let username = user.username || "NoUsername";
    let fullname = (user.first_name || "") + " " + (user.last_name || "");

    // === Backendga yuborish ===
    fetch("bot.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        username: username,
        fullname: fullname.trim(),
        correct: correct,
        wrong: wrong,
        total: total
      })
    })
      .then(res => res.json())
      .then(data => console.log("✅ Natija yuborildi:", data))
      .catch(err => console.error("❌ Xato:", err));
  }

  // === Qayta boshlash ===
  document.getElementById("retryBtn").onclick = () => {
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    correctEl.innerText = "0";
    wrongEl.innerText = "0";
    document.querySelector(".question-area").style.display = "block";
    resultBox.style.display = "none";
    loadQuestion();
  };