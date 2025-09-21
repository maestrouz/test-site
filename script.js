// script.js (joylashtiring va hozirgi faylni almashtiring)
(() => {
  // Sample question set
  let questions = [
    {id:1, q: "O'zbekiston poytaxti qaysi shahar?", choices: ["A. Toshkent","B. Samarqand","C. Buxoro"], a:0},
    {id:2, q: "Kimyoda suvning formulasi nima?", choices: ["A. CO2","B. H2O","C. O2"], a:1},
    {id:3, q: "HTML nima uchun ishlatiladi?", choices: ["A. Sahifa tuzilishi","B. Stil berish","C. Ma'lumotlar bazasi"], a:0},
    {id:4, q: "Yerning quyosh atrofidagi bir aylanib chiqishi necha kun davom etadi (taxminan)?", choices: ["A. 365 kun","B. 30 kun","C. 7 kun"], a:0},
    {id:5, q: "JavaScript qaysi sohada ishlatiladi?", choices: ["A. Frontend va interaktivlik","B. Faqat backend","C. Grafik dizayn"], a:0}
  ];

  // State
  let idx = 0;
  let total = questions.length;
  let userAnswers = Array(total).fill(null);
  let correct = 0, wrong = 0;

  // Timer
  let timePerQuestion = 60;
  let timeLeft = timePerQuestion;
  let timerInterval = null;

  // DOM refs (hamma elementlar HTML ichida joylashgan)
  const qText = document.getElementById('qText');
  const qNumber = document.getElementById('qNumber');
  const answersDiv = document.getElementById('answers');
  const timeLeftEl = document.getElementById('timeLeft');
  const qIndex = document.getElementById('qIndex');
  const qTotal = document.getElementById('qTotal');
  const progressBar = document.getElementById('progressBar');
  const correctCount = document.getElementById('correctCount');
  const wrongCount = document.getElementById('wrongCount');
  const qList = document.getElementById('qList');
  const resultBox = document.getElementById('resultBox');
  const finalScore = document.getElementById('finalScore');
  const finalDetail = document.getElementById('finalDetail');
  const nextBtn = document.getElementById('nextBtn');
  const retryBtn = document.getElementById('retryBtn');
  const totalCount = document.getElementById('totalCount');

  // Telegram WebApp (XATOSIZ olish — agar WebApp ichida bo'lmasa null bo'ladi)
  const tg = window.Telegram?.WebApp ?? null;

  // SVG circle (timer) — null tekshiruv bilan ishlatiladi
  const circleEl = document.getElementById('circle');
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  if (circleEl) {
    circleEl.style.strokeDasharray = String(circumference);
    circleEl.style.strokeDashoffset = String(0);
  }

  // Init UI
  function init(){
    questions = shuffle(questions);
    total = questions.length;
    if (qTotal) qTotal.innerText = total;
    if (totalCount) totalCount.innerText = total;
    buildQuestionDots();
    renderQuestion(0);
  }

  function shuffle(array){
    for (let i = array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function buildQuestionDots(){
    if (!qList) return;
    qList.innerHTML = '';
    for(let i=0;i<total;i++){
      const d = document.createElement('div');
      d.className='q-dot';
      d.innerText = i+1;
      // Eslatma: bosilganda o'tish oldingizcha bloklangan CSS bilan ishlaydi
      qList.appendChild(d);
    }
  }

  function renderQuestion(i){
    idx = i;
    const item = questions[idx];
    if (!item) return;
    if (qNumber) qNumber.innerText = `Savol ${idx+1}`;
    if (qText) qText.innerText = item.q;
    if (qIndex) qIndex.innerText = idx+1;
    if (progressBar) progressBar.style.width = Math.round(((idx)/total)*100) + '%';

    // answers
    if (!answersDiv) return;
    answersDiv.innerHTML='';
    item.choices.forEach((c, ci)=>{
      const b = document.createElement('div');
      b.className = 'ans';
      b.innerHTML = `<span class="label">${String.fromCharCode(65+ci)}.</span><span>${c.replace(/^\w\.\s*/,'')}</span>`;
      if(userAnswers[idx]!==null) b.classList.add('disabled');
      b.addEventListener('click',()=> selectAnswer(ci, b));
      answersDiv.appendChild(b);
    });

    // update dots
    if (qList) Array.from(qList.children).forEach((n,ii)=>{ n.classList.toggle('active', ii===idx); });

    resetTimer();
    startTimer();

    if (correctCount) correctCount.innerText = correct;
    if (wrongCount) wrongCount.innerText = wrong;
  }

  function selectAnswer(choiceIndex, btnEl){
    if(userAnswers[idx]!==null) return;
    stopTimer();
    userAnswers[idx]=choiceIndex;
    const isCorrect = choiceIndex === questions[idx].a;
    if(isCorrect){
      correct++;
      btnEl.classList.add('correct');
    } else {
      wrong++;
      btnEl.classList.add('wrong');
      const nodes = answersDiv.querySelectorAll('.ans');
      if (nodes[questions[idx].a]) nodes[questions[idx].a].classList.add('correct');
    }
    Array.from(answersDiv.children).forEach(n=>n.classList.add('disabled'));
    updateCounters();
    setTimeout(()=>{ nextQuestion(); }, 900);
  }

  function updateCounters(){
    if (correctCount) correctCount.innerText = correct;
    if (wrongCount) wrongCount.innerText = wrong;
  }

  function startTimer(){
    stopTimer();
    timeLeft = timePerQuestion;
    if (timeLeftEl) timeLeftEl.innerText = timeLeft;
    updateCircle();
    timerInterval = setInterval(()=>{
      timeLeft -= 1;
      if(timeLeft<=0){
        timeLeft = 0;
        if (timeLeftEl) timeLeftEl.innerText = timeLeft;
        updateCircle();
        stopTimer();
        handleTimeOut();
      } else {
        if (timeLeftEl) timeLeftEl.innerText = timeLeft;
        updateCircle();
      }
    },1000);
  }

  function resetTimer(){
    stopTimer();
    timeLeft = timePerQuestion;
    if (timeLeftEl) timeLeftEl.innerText = timeLeft;
    updateCircle();
  }

  function stopTimer(){
    if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  }

  // updateCircle — faqat SVG bilan ishlaydi (agar circle mavjud bo'lsa)
  function updateCircle(){
    if (!circleEl) {
      // Agar SVG yo'q bo'lsa eski conic CSS ishlovchi holatda ham qo'yish kerak bo'lsa bu yerga qo'shing.
      return;
    }
    const percent = Math.max(0, Math.min(1, timeLeft / timePerQuestion));
    circleEl.style.strokeDashoffset = String(circumference * (1 - percent));
  }

  function handleTimeOut(){
    if(userAnswers[idx]===null){
      userAnswers[idx]=null;
      wrong++;
      const nodes = answersDiv.querySelectorAll('.ans');
      nodes.forEach(n=>n.classList.add('disabled'));
      if(nodes[questions[idx].a]) nodes[questions[idx].a].classList.add('correct');
      updateCounters();
      setTimeout(()=>{ nextQuestion(); }, 900);
    }
  }

  function nextQuestion(){
    if(idx < total-1){ renderQuestion(idx+1); }
    else { finishTest(); }
  }

  function goTo(i){ renderQuestion(i); }

  function finishTest(){
  stopTimer();
  const answeredCorrect = correct;
  resultBox.classList.add('show');
  finalScore.innerText = `${answeredCorrect} / ${total}`;
  const percent = Math.round((answeredCorrect/total)*100);
  finalDetail.innerText = `To‘g‘ri javoblar: ${answeredCorrect}. Foiz: ${percent}%`;
  document.querySelector('.question-area').style.display='none';
  document.querySelector('.topbar').style.display='none';

  // 📤 Telegram botga natijani yuborish
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.sendData(JSON.stringify({
      score: answeredCorrect,
      total: total
    }));
    
    // 🔒 Yopishdan oldin yuborishga vaqt beramiz
    setTimeout(() => {
      tg.close();
    }, 1000);
  }
}
    
    // ❌ tg.close() ni darhol yozmang
    // ✅ yuborishga vaqt beramiz
    setTimeout(() => {
      tg.close();
    }, 1000); 
  }
}


  // event listeners (agar elementlar mavjud bo'lsa)
  if (nextBtn) nextBtn.addEventListener('click',()=>{ nextQuestion(); });
  if (retryBtn) retryBtn.addEventListener('click',()=>{ location.reload(); });

  // start
  init();

  // debug: agar savollar ko'rinmasa, konsolni tekshiring
  // console.log('quiz initialized', { total, tgPresent: !!tg, circlePresent: !!circleEl });
})();
