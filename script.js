
    // Sample question set — o'zingiz o'zgartirishingiz mumkin
    const questions = [
      {id:1, q: "O'zbekiston poytaxti qaysi shahar?", choices: ["A. Toshkent","B. Samarqand","C. Buxoro"], a:0},
      {id:2, q: "Kimyoda suvning formulasi nima?", choices: ["A. CO2","B. H2O","C. O2"], a:1},
      {id:3, q: "HTML nima uchun ishlatiladi?", choices: ["A. Sahifa tuzilishi","B. Stil berish","C. Ma'lumotlar bazasi"], a:0},
      {id:4, q: "Yerning quyosh atrofidagi bir aylanib chiqishi necha kun davom etadi (taxminan)?", choices: ["A. 365 kun","B. 30 kun","C. 7 kun"], a:0},
      {id:5, q: "JavaScript qaysi sohada ishlatiladi?", choices: ["A. Frontend va interaktivlik","B. Faqat backend","C. Grafik dizayn"], a:0}
    ];

    // State
    let idx = 0;
    let total = questions.length;
    let userAnswers = Array(total).fill(null); // null = not answered, otherwise index
    let correct = 0, wrong = 0;

    // Timer
    let timePerQuestion = 60; // seconds
    let timeLeft = timePerQuestion;
    let timerInterval = null;

    // DOM refs
    const qText = document.getElementById('qText');
    const qNumber = document.getElementById('qNumber');
    const answersDiv = document.getElementById('answers');
    const timeLeftEl = document.getElementById('timeLeft');
    const timeCircle = document.getElementById('timeCircle');
    const qIndex = document.getElementById('qIndex');
    const qTotal = document.getElementById('qTotal');
    const progressBar = document.getElementById('progressBar');
    const correctCount = document.getElementById('correctCount');
    const wrongCount = document.getElementById('wrongCount');
    const qList = document.getElementById('qList');
    const resultBox = document.getElementById('resultBox');
    const finalScore = document.getElementById('finalScore');
    const finalDetail = document.getElementById('finalDetail');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const retryBtn = document.getElementById('retryBtn');
    const totalCount = document.getElementById('totalCount');

    // Init UI
    function init(){
      total = questions.length;
      document.getElementById('qTotal').innerText = total;
      totalCount.innerText = total;
      buildQuestionDots();
      renderQuestion(0);
    }

    function buildQuestionDots(){
      qList.innerHTML = '';
      for(let i=0;i<total;i++){
        const d = document.createElement('div');
        
        d.className='q-dot';
        d.innerText = i+1;
        d.addEventListener('click',()=>{ if(userAnswers[i]===null) { goTo(i); } else { goTo(i); } });
        qList.appendChild(d);
      }
    }

    function renderQuestion(i){
      idx = i;
      const item = questions[idx];
      qNumber.innerText = `Savol ${idx+1}`;
      qText.innerText = item.q;
      qIndex.innerText = idx+1;
      // progress
      const progress = Math.round(((idx)/total)*100);
      progressBar.style.width = progress + '%';

      // answers
      answersDiv.innerHTML='';
      item.choices.forEach((c, ci)=>{
        const b = document.createElement('div');
        b.className = 'ans';
        b.innerHTML = `<span class="label">${String.fromCharCode(65+ci)}.</span><span>${c.replace(/^\w\.\s*/,'')}</span>`;
        if(userAnswers[idx]!==null){ b.classList.add('disabled'); }
        b.addEventListener('click',()=> selectAnswer(ci, b));
        answersDiv.appendChild(b);
      });

      // update dots
      Array.from(qList.children).forEach((n,ii)=>{ n.classList.toggle('active', ii===idx); });

      // start timer
      resetTimer();
      startTimer();

      // update counters
      correctCount.innerText = correct;
      wrongCount.innerText = wrong;
    }

    function selectAnswer(choiceIndex, btnEl){
      if(userAnswers[idx]!==null) return; // already answered
      stopTimer();
      userAnswers[idx]=choiceIndex;
      const isCorrect = choiceIndex === questions[idx].a;
      if(isCorrect){ correct++; btnEl.classList.add('correct'); }
      else { wrong++; btnEl.classList.add('wrong');
        // highlight correct
        const nodes = answersDiv.querySelectorAll('.ans');
        nodes[questions[idx].a].classList.add('correct');
      }
      // disable all
      Array.from(answersDiv.children).forEach(n=>n.classList.add('disabled'));
      updateCounters();
      // auto move after short delay
      setTimeout(()=>{ nextQuestion(); }, 900);
    }

    function updateCounters(){
      correctCount.innerText = correct;
      wrongCount.innerText = wrong;
    }

    function startTimer(){
      timeLeft = timePerQuestion;
      timeLeftEl.innerText = timeLeft;
      updateCircle();
      timerInterval = setInterval(()=>{
        timeLeft -= 1;
        if(timeLeft<=0){
          timeLeft = 0;
          timeLeftEl.innerText = timeLeft;
          updateCircle();
          // time ran out -> mark wrong and move on
          stopTimer();
          handleTimeOut();
        } else {
          timeLeftEl.innerText = timeLeft;
          updateCircle();
        }
      },1000);
    }

    function resetTimer(){ stopTimer(); timeLeft = timePerQuestion; timeLeftEl.innerText = timeLeft; updateCircle(); }
    function stopTimer(){ if(timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

    function updateCircle(){
      const pct = Math.round(((timePerQuestion - timeLeft)/timePerQuestion)*100);
      // use css var to fill conic-gradient
      const fill = Math.round(((timeLeft)/timePerQuestion)*100);
      // set --p for visual progress from 0-100 inverse so remaining portion shown
      timeCircle.style.setProperty('--p', (Math.max(0, (timeLeft/timePerQuestion))*100) + '%');
    }

    function handleTimeOut(){
      // If user didn't answer, treat as wrong
      if(userAnswers[idx]===null){
        userAnswers[idx]=null; // explicitly mark
        wrong++;
        // visually highlight correct answer
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

    function prevQuestion(){
      if(idx>0) renderQuestion(idx-1);
    }

    function goTo(i){ renderQuestion(i); }

    function finishTest(){
      stopTimer();
      // compute score — number of correct answers
      const answeredCorrect = correct; // we updated correct as we went
      resultBox.classList.add('show');
      finalScore.innerText = `${answeredCorrect} / ${total}`;
      const percent = Math.round((answeredCorrect/total)*100);
      finalDetail.innerText = `To‘g‘ri javoblar: ${answeredCorrect}. Foiz: ${percent}%`;
      // hide main interactive area by slightly dimming card contents (we'll simply hide controls & question area)
      document.querySelector('.question-area').style.display='none';
      document.querySelector('.topbar').style.display='none';
    }

    // prevBtn.addEventListener('click',()=>{ prevQuestion(); });
    nextBtn.addEventListener('click',()=>{ nextQuestion(); });
    retryBtn.addEventListener('click',()=>{ location.reload(); });

    // init
    init();
