// Sample question set
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
let userAnswers = Array(total).fill(null);
let correct = 0, wrong = 0;

// Timer
let timePerQuestion = 60;
let timeLeft = timePerQuestion;
let timerInterval = null;

// DOM refs
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

// SVG circle (timer)
const circleEl = document.getElementById('circle');
const radius = 45;
const circumference = 2 * Math.PI * radius;
circleEl.style.strokeDasharray = circumference;

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
    d.addEventListener('click',()=>{ goTo(i); });
    qList.appendChild(d);
  }
}

function renderQuestion(i){
  idx = i;
  const item = questions[idx];
  qNumber.innerText = `Savol ${idx+1}`;
  qText.innerText = item.q;
  qIndex.innerText = idx+1;
  const progress = Math.round(((idx)/total)*100);
  progressBar.style.width = progress + '%';

  answersDiv.innerHTML='';
  item.choices.forEach((c, ci)=>{
    const b = document.createElement('div');
    b.className = 'ans';
    b.innerHTML = `<span class="label">${String.fromCharCode(65+ci)}.</span><span>${c.replace(/^\w\.\s*/,'')}</span>`;
    if(userAnswers[idx]!==null){ b.classList.add('disabled'); }
    b.addEventListener('click',()=> selectAnswer(ci, b));
    answersDiv.appendChild(b);
  });

  Array.from(qList.children).forEach((n,ii)=>{ n.classList.toggle('active', ii===idx); });

  resetTimer();
  startTimer();

  correctCount.innerText = correct;
  wrongCount.innerText = wrong;
}

function selectAnswer(choiceIndex, btnEl){
  if(userAnswers[idx]!==null) return;
  stopTimer();
  userAnswers[idx]=choiceIndex;
  const isCorrect = choiceIndex === questions[idx].a;
  if(isCorrect){ correct++; btnEl.classList.add('correct'); }
  else { wrong++; btnEl.classList.add('wrong');
    const nodes = answersDiv.querySelectorAll('.ans');
    nodes[questions[idx].a].classList.add('correct');
  }
  Array.from(answersDiv.children).forEach(n=>n.classList.add('disabled'));
  updateCounters();
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

// 🔵 faqat SVG circle uchun
function updateCircle(){
  const percent = timeLeft / timePerQuestion;
  circleEl.style.strokeDashoffset = circumference * (1 - percent);
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
}

nextBtn.addEventListener('click',()=>{ nextQuestion(); });
retryBtn.addEventListener('click',()=>{ location.reload(); });

// init
init();
