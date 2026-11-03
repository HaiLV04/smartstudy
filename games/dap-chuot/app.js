(() => {
  const DEFAULT_QUIZ_TEXT = [
    "7 x 8 = ? | 56 | 54 | 63 | 48",
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP.HCM | Đà Nẵng | Huế",
    "Sông nào dài nhất Việt Nam? | Sông Mê Kông | Sông Hồng | Sông Đà | Sông Mã",
    "Ai là tác giả của Truyện Kiều? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Nguyễn Đình Chiểu",
    "Nước nào có diện tích lớn nhất thế giới? | Nga | Trung Quốc | Canada | Mỹ",
    "Chất nào cần thiết để cây quang hợp? | Ánh sáng | Bóng tối | Muối | Đường",
    "Năm 1945, Việt Nam giành độc lập vào ngày nào? | 2/9 | 30/4 | 1/5 | 19/8",
    "Hành tinh nào gần Mặt Trời nhất? | Sao Thuỷ | Sao Kim | Trái Đất | Sao Hoả",
    "15 - 9 = ? | 6 | 5 | 7 | 8",
    "Đơn vị đo nhiệt độ phổ biến là gì? | Độ C | Kg | Lít | Mét",
  ].join("\n");

  const MOLE_EMOJI = ["🐹", "🦫"];
  const HOLE_COUNT = 9;
  const POP_DURATION = 1200;
  const SPAWN_GAP = 620;
  const MAX_CONCURRENT = 3;

  const grid = document.getElementById("moleGrid");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const timerFill = document.getElementById("timerFill");

  let quizPool = SA.Quiz.load("dap-chuot", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = true; // true until game started
  let holeEls = [];
  let occupied = new Set();
  let activeMoles = []; // {el, hideTimer, holeIdx, anim, optIdx}
  let bag = [];
  let spawnTimer = null;
  let questionTimeout = null;
  let currentItem = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function buildHoles() {
    grid.innerHTML = "";
    holeEls = [];
    for (let i = 0; i < HOLE_COUNT; i++) {
      const hole = document.createElement("div");
      hole.className = "mole-hole";
      hole.dataset.idx = i;
      grid.appendChild(hole);
      holeEls.push(hole);
    }
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreEl.textContent = score;
  }

  function clearStage() {
    clearTimeout(spawnTimer);
    clearTimeout(questionTimeout);
    activeMoles.forEach(m => {
      clearTimeout(m.hideTimer);
      try { m.anim.cancel(); } catch (e) {}
      if (m.el.parentNode) m.el.remove();
    });
    activeMoles = [];
    occupied = new Set();
    bag = [];
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function nextBagIndex(optionsCount) {
    if (bag.length === 0) bag = SA.shuffle(Array.from({ length: optionsCount }, (_, i) => i));
    return bag.shift();
  }

  function pickEmptyHole() {
    const free = [];
    for (let i = 0; i < HOLE_COUNT; i++) if (!occupied.has(i)) free.push(i);
    if (free.length === 0) return -1;
    return free[Math.floor(Math.random() * free.length)];
  }

  function spawnPop() {
    if (answered) return;
    if (occupied.size < MAX_CONCURRENT) {
      const holeIdx = pickEmptyHole();
      if (holeIdx !== -1) {
        const optIdx = nextBagIndex(currentItem.options.length);
        const hole = holeEls[holeIdx];
        const el = document.createElement("div");
        el.className = "mole";
        const emoji = MOLE_EMOJI[Math.floor(Math.random() * MOLE_EMOJI.length)];
        el.innerHTML = `<div class="emoji">${emoji}</div><div class="label">${escapeHtml(currentItem.options[optIdx])}</div>`;
        hole.appendChild(el);
        occupied.add(holeIdx);

        const anim = el.animate([
          { transform: "translateY(0px)", offset: 0 },
          { transform: "translateY(-96px)", offset: 0.18 },
          { transform: "translateY(-96px)", offset: 0.82 },
          { transform: "translateY(0px)", offset: 1 },
        ], { duration: POP_DURATION, easing: "ease", fill: "forwards" });

        const record = { el, holeIdx, anim, optIdx, hideTimer: null };
        record.hideTimer = setTimeout(() => {
          if (answered) return;
          if (el.parentNode) el.remove();
          occupied.delete(holeIdx);
          activeMoles = activeMoles.filter(m => m !== record);
        }, POP_DURATION);
        activeMoles.push(record);

        el.addEventListener("click", () => {
          if (answered) return;
          finishQuestion(currentItem.correct, el, optIdx);
        });
      }
    }
    spawnTimer = setTimeout(spawnPop, SPAWN_GAP);
  }

  function finishQuestion(correctIndex, chosenEl, chosenOptIdx) {
    if (answered) return;
    answered = true;
    clearTimeout(spawnTimer);
    clearTimeout(questionTimeout);
    activeMoles.forEach(m => { clearTimeout(m.hideTimer); try { m.anim.pause(); } catch (e) {} });

    activeMoles.forEach(m => {
      if (m.optIdx === correctIndex) m.el.classList.add("correct-hit");
      else if (m.el === chosenEl) m.el.classList.add("wrong-hit");
    });

    const correctText = escapeHtml(currentItem.options[correctIndex]);
    if (chosenEl && chosenOptIdx === correctIndex) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Chính xác!";
    } else if (chosenEl) {
      SA.beep("wrong");
      qBanner.textContent = `❌ Chưa đúng! Đáp án đúng là: ${currentItem.options[correctIndex]}`;
    } else {
      SA.beep("wrong");
      qBanner.textContent = `⏰ Hết giờ! Đáp án đúng là: ${currentItem.options[correctIndex]}`;
    }
    updateProgress();

    questionTimeout = setTimeout(() => {
      clearStage();
      askQuestion();
    }, 1700);
  }

  function askQuestion() {
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    currentItem = SA.Quiz.shuffled([raw])[0];
    quizIndex++;
    answered = false;
    qBanner.textContent = currentItem.q;
    updateProgress();

    const totalTime = 6000 + currentItem.options.length * 1500;
    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    requestAnimationFrame(() => {
      timerFill.style.transition = `width ${totalTime}ms linear`;
      timerFill.style.width = "0%";
    });

    questionTimeout = setTimeout(() => finishQuestion(currentItem.correct, null), totalTime);
    spawnTimer = setTimeout(spawnPop, 300);
  }

  function startGame() {
    score = 0;
    clearStage();
    buildHoles();
    newQueue();
    updateProgress();
    startBtn.textContent = "🔄 Chơi lại";
    askQuestion();
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("dap-chuot", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  buildHoles();
  updateProgress();
})();
