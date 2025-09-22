(() => {
  let questions = [
    {id:1, q: "O'zbekiston poytaxti qaysi shahar?", choices: ["A. Toshkent","B. Samarqand","C. Buxoro"], a:0},
    {id:2, q: "Kimyoda suvning formulasi nima?", choices: ["A. CO2","B. H2O","C. O2"], a:1},
    {id:3, q: "HTML nima uchun ishlatiladi?", choices: ["A. Sahifa tuzilishi","B. Stil berish","C. Ma'lumotlar bazasi"], a:0},
    {id:4, q: "Yerning quyosh atrofidagi bir aylanib chiqishi necha kun davom etadi (taxminan)?", choices: ["A. 365 kun","B. 30 kun","C. 7 kun"], a:0},
    {id:5, q: "JavaScript qaysi sohada ishlatiladi?", choices: ["A. Frontend va interaktivlik","B. Faqat backend","C. Grafik dizayn"], a:0}
  ];

  let idx = 0;
  let total = questions.length;
  let userAnswers = Array(total).fill(null);
  let correct = 0, wrong = 0;
  let timePerQuestion = 60;
  let timeLeft = timePerQuestion;
  let timerInterval = null;

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

  const tg = window.Telegram?.WebApp ?? null;

  const circleEl = document.getElementById('circle');
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  if (circleEl) {
    circleEl.style.strokeDasharray = String(circumference);
    circleEl.style.strokeDashoffset = String(0);
  }

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

  function updateCircle(){
    if (!circleEl) return;
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

  function finishTest(){
    stopTimer();
    resultBox.classList.add('show');
    finalScore.innerText = `${correct} / ${total}`;
    const percent = Math.round((correct/total)*100);
    finalDetail.innerText = `To‘g‘ri javoblar: ${correct}. Foiz: ${percent}%`;
    document.querySelector('.question-area').style.display='none';
    document.querySelector('.topbar').style.display='none';

    const payload = { score: correct, total: total, percent: percent };
    const chatId = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) 
                    ? tg.initDataUnsafe.user.id 
                    : null;

    if (chatId) {
      const serverURL = 'https://68c836c45881f.clouduz.ru/Request/Request.php'; // <-- To‘g‘ri server URL bilan almashtiring
      const body = {
        secret: 'x7k9pQz2mW8rT5vY3nL0jF', // <-- PHPdagi secret bilan bir xil qiling
        chat_id: chatId,
        data: payload
      };

      fetch(serverURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then(res => {
        console.log('Server HTTP status:', res.status);
        return res.text();
      })
      .then(resp => {
        console.log('Server response:', resp);
        if (resp === "OK") {
          console.log("Natija muvaffaqiyatli yuborildi!");
        } else {
          console.error('Server response error:', resp);
        }
      })
      .catch(err => console.error('Fetch error:', err));
    } else {
      console.error('Chat ID topilmadi! tg.initDataUnsafe:', tg.initDataUnsafe);
    }

    if (tg && typeof tg.close === 'function') {
      setTimeout(() => { tg.close(); }, 1800);
    }
  }

  if (nextBtn) nextBtn.addEventListener('click',()=>{ nextQuestion(); });
  if (retryBtn) retryBtn.addEventListener('click',()=>{ location.reload(); });

  init();
})();