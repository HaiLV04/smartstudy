(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Đà Nẵng | Huế",
    "5 x 6 = ? | 30 | 25 | 36",
    "Hành tinh nào được gọi là Hành tinh Đỏ? | Sao Hoả | Sao Kim | Trái Đất | Sao Thổ",
    "Nước nào có diện tích lớn nhất thế giới? | Nga | Canada | Trung Quốc | Mỹ",
    "Số nào là số nguyên tố? | 7 | 8 | 9",
    "Tác giả của Truyện Kiều là ai? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Tố Hữu",
    "1 giờ có bao nhiêu phút? | 60 | 100 | 24",
    "Con vật nào được gọi là chúa tể sơn lâm? | Hổ | Voi | Gấu | Sói",
  ].join("\n");

  const SLOT_SYMBOLS = ["🍒", "🍋", "⭐", "🔔", "💎", "7️⃣", "🍉", "🍇", "🎲", "🍀", "🍊", "🔥"];

  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const qBanner = document.getElementById("qBanner");
  const slotReels = document.getElementById("slotReels");
  const slotResult = document.getElementById("slotResult");
  const startBtn = document.getElementById("startBtn");

  let quizPool = SA.Quiz.load("slotmayman", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let uiState = "idle"; // idle | ready | spinning | await-pick
  let answeredThisSpin = false;
  let pendingSpinHandler = null;
  let activeTimers = [];
  let questionTimeout = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function clearActiveTimers() {
    activeTimers.forEach(id => { clearInterval(id); clearTimeout(id); });
    activeTimers = [];
    clearTimeout(questionTimeout);
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreEl.textContent = score;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function buildReelData(item) {
    const reelCount = Math.min(4, item.options.length);
    const correctText = item.options[item.correct];
    const wrongs = item.options.filter((_, i) => i !== item.correct);
    const chosenWrongs = SA.shuffle(wrongs).slice(0, Math.max(0, reelCount - 1));
    const reelTexts = SA.shuffle([correctText, ...chosenWrongs]);
    return reelTexts.map(t => ({ text: t, correct: t === correctText }));
  }

  function buildReelsPlaceholder(count) {
    slotReels.innerHTML = Array.from({ length: count }, () => `<div class="reel">❔</div>`).join("");
  }

  function setUiState(state) {
    uiState = state;
    if (state === "idle") { startBtn.textContent = "🎰 Bắt đầu"; startBtn.disabled = false; }
    else if (state === "ready") { startBtn.textContent = "🎰 Quay"; startBtn.disabled = false; }
    else if (state === "spinning") { startBtn.textContent = "🎰 Đang quay..."; startBtn.disabled = true; }
    else if (state === "await-pick") { startBtn.textContent = "👉 Hãy chọn 1 ô đáp án"; startBtn.disabled = true; }
  }

  function pickReel(el) {
    if (answeredThisSpin) return;
    answeredThisSpin = true;
    const reelEls = Array.from(slotReels.querySelectorAll(".reel"));
    reelEls.forEach(r => { r.onclick = null; r.classList.add("disabled-reel"); });
    const isCorrect = el.dataset.correct === "1";
    reelEls.forEach(r => { if (r.dataset.correct === "1") r.classList.add("correct-pick"); });

    if (isCorrect) {
      score++;
      SA.beep("correct");
      SA.confetti(90);
      slotResult.textContent = "🎉 JACKPOT! Chính xác!";
    } else {
      el.classList.add("wrong-pick");
      SA.beep("wrong");
      slotResult.textContent = "❌ Chưa đúng — đáp án đúng đã được tô xanh.";
    }
    updateProgress();

    questionTimeout = setTimeout(() => { askQuestion(); }, 2100);
    activeTimers.push(questionTimeout);
  }

  function spin(reelData) {
    setUiState("spinning");
    answeredThisSpin = false;
    slotResult.textContent = "";
    const reelEls = Array.from(slotReels.querySelectorAll(".reel"));
    reelEls.forEach((el, i) => {
      el.classList.add("spinning");
      el.classList.remove("settled", "correct-pick", "wrong-pick", "disabled-reel");
      el.onclick = null;
      const cycleId = setInterval(() => {
        el.textContent = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      }, 80);
      activeTimers.push(cycleId);
      const stopDelay = 900 + i * 380 + Math.random() * 150;
      const stopId = setTimeout(() => {
        clearInterval(cycleId);
        el.classList.remove("spinning");
        el.classList.add("settled");
        el.textContent = escapeHtml(reelData[i].text);
        el.dataset.correct = reelData[i].correct ? "1" : "0";
        if (i === reelEls.length - 1) {
          setUiState("await-pick");
          reelEls.forEach(r => { r.onclick = () => pickReel(r); });
        }
      }, stopDelay);
      activeTimers.push(stopId);
    });
  }

  function askQuestion() {
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;
    updateProgress();
    qBanner.textContent = item.q;
    slotResult.textContent = "";
    const reelData = buildReelData(item);
    buildReelsPlaceholder(reelData.length);
    setUiState("ready");
    pendingSpinHandler = () => spin(reelData);
  }

  function startGame() {
    score = 0;
    clearActiveTimers();
    newQueue();
    updateProgress();
    askQuestion();
  }

  startBtn.addEventListener("click", () => {
    if (uiState === "idle") startGame();
    else if (uiState === "ready" && pendingSpinHandler) pendingSpinHandler();
  });

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("slotmayman", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    clearActiveTimers();
    setUiState("idle");
    startGame();
  });

  updateProgress();
})();
