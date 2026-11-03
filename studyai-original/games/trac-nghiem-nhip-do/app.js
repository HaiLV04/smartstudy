(() => {
  const DEFAULT_QUIZ_TEXT = [
    "6 x 7 = ? | 42 | 48 | 36 | 40",
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Huế | Đà Nẵng",
    "Nước sôi ở bao nhiêu độ C (ở áp suất thường)? | 100 độ C | 90 độ C | 80 độ C | 120 độ C",
    "Ai là tác giả bài thơ 'Bánh trôi nước'? | Hồ Xuân Hương | Nguyễn Du | Bà Huyện Thanh Quan | Xuân Quỳnh",
    "Việt Nam giáp biển nào? | Biển Đông | Biển Đỏ | Biển Đen | Địa Trung Hải",
    "8 + 9 = ? | 17 | 16 | 18 | 15",
    "Hành tinh nào được gọi là 'Hành tinh Đỏ'? | Sao Hoả | Sao Kim | Sao Mộc | Sao Thổ",
    "Cây lúa thuộc nhóm cây gì? | Cây lương thực | Cây công nghiệp | Cây ăn quả | Cây cảnh",
    "1 mét bằng bao nhiêu xăng-ti-mét? | 100 | 10 | 1000 | 50",
    "Đâu là thủ đô của Hàn Quốc? | Seoul | Tokyo | Bắc Kinh | Bangkok",
  ].join("\n");

  const DEFAULT_SECONDS = 15;
  const CIRC = 2 * Math.PI * 66;

  const qProgressEl = document.getElementById("qProgress");
  const ringFg = document.getElementById("ringFg");
  const ringNum = document.getElementById("ringNum");
  const questionText = document.getElementById("questionText");
  const optionsGrid = document.getElementById("optionsGrid");
  const startTimerBtn = document.getElementById("startTimerBtn");
  const stopRevealBtn = document.getElementById("stopRevealBtn");
  const nextBtn = document.getElementById("nextBtn");

  ringFg.style.strokeDasharray = String(CIRC);
  ringFg.style.strokeDashoffset = "0";

  let quizPool = SA.Quiz.load("trac-nghiem-nhip-do", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let seconds = Number(localStorage.getItem("sa_tnd_seconds")) || DEFAULT_SECONDS;
  let quizQueue = [];
  let qIndex = 0;
  let currentItem = null;
  let timerInterval = null;
  let timerStartTs = 0;
  let timerRunning = false;
  let revealedNow = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    qIndex = 0;
  }

  function updateProgress() {
    qProgressEl.textContent = `Câu ${Math.min(qIndex + 1, quizQueue.length)}/${quizQueue.length}`;
  }

  function resetRing() {
    ringFg.style.transition = "none";
    ringFg.style.strokeDashoffset = "0";
    ringFg.classList.remove("urgent");
    ringNum.textContent = seconds;
  }

  function askQuestion() {
    stopTimerInterval();
    revealedNow = false;
    timerRunning = false;
    if (qIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[qIndex];
    currentItem = SA.Quiz.shuffled([raw])[0];
    updateProgress();
    resetRing();

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionText.textContent = currentItem.q;
    optionsGrid.innerHTML = currentItem.options.map((opt, i) => `
      <div class="tnd-opt" data-idx="${i}">
        <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
      </div>`).join("");

    startTimerBtn.classList.remove("hidden");
    stopRevealBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
  }

  function stopTimerInterval() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    startTimerBtn.classList.add("hidden");
    stopRevealBtn.classList.remove("hidden");
    timerStartTs = Date.now();
    const totalMs = seconds * 1000;
    ringFg.style.transition = "none";
    ringFg.style.strokeDashoffset = "0";

    timerInterval = setInterval(() => {
      const elapsed = Date.now() - timerStartTs;
      const remainMs = Math.max(0, totalMs - elapsed);
      const remainSec = Math.ceil(remainMs / 1000);
      ringNum.textContent = remainSec;
      const frac = remainMs / totalMs;
      ringFg.style.transition = "stroke-dashoffset 0.15s linear, stroke 0.3s ease";
      ringFg.style.strokeDashoffset = String(CIRC * (1 - frac));
      if (frac <= 0.25) ringFg.classList.add("urgent");
      if (remainMs <= 0) {
        revealAnswer();
      }
    }, 100);
  }

  function revealAnswer() {
    if (revealedNow) return;
    revealedNow = true;
    timerRunning = false;
    stopTimerInterval();
    SA.beep("correct");
    ringNum.textContent = "0";
    const correctEl = optionsGrid.querySelector(`.tnd-opt[data-idx="${currentItem.correct}"]`);
    if (correctEl) correctEl.classList.add("correct-reveal");
    stopRevealBtn.classList.add("hidden");
    startTimerBtn.classList.add("hidden");
    nextBtn.classList.remove("hidden");
  }

  startTimerBtn.addEventListener("click", startTimer);
  stopRevealBtn.addEventListener("click", revealAnswer);
  nextBtn.addEventListener("click", () => {
    qIndex++;
    askQuestion();
  });

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    document.getElementById("secondsInput").value = seconds;
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    let sec = Math.round(Number(document.getElementById("secondsInput").value));
    if (Number.isNaN(sec) || sec < 3) sec = DEFAULT_SECONDS;
    quizPool = newQuiz;
    seconds = sec;
    SA.Quiz.save("trac-nghiem-nhip-do", quizPool);
    localStorage.setItem("sa_tnd_seconds", String(seconds));
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu lại từ câu 1.");
    stopTimerInterval();
    newQueue();
    askQuestion();
  });

  document.getElementById("restartBtn").addEventListener("click", () => {
    stopTimerInterval();
    newQueue();
    askQuestion();
  });

  newQueue();
  askQuestion();
})();
