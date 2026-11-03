(() => {
  const DEFAULT_QUIZ_TEXT = [
    "3 + 4 x 2 = ? | 11 | 14 | 10 | 9",
    "Thủ đô của Hàn Quốc là gì? | Seoul | Tokyo | Bắc Kinh | Bangkok",
    "Ai là chủ tịch nước đầu tiên của Việt Nam? | Hồ Chí Minh | Tôn Đức Thắng | Trường Chinh | Phạm Văn Đồng",
    "Cá heo là loài động vật gì? | Động vật có vú | Loài cá | Loài bò sát | Loài lưỡng cư",
    "Việt Nam có bao nhiêu mùa trong năm ở miền Bắc? | 4 mùa | 2 mùa | 3 mùa | 1 mùa",
    "72 : 8 = ? | 9 | 8 | 10 | 7",
    "Ai được mệnh danh là 'thần đồng' cờ vua nhỏ tuổi nhất Việt Nam?  | Nguyễn Anh Khôi | Lê Quang Liêm | Nguyễn Ngọc Trường Sơn | Đào Thiên Hải",
    "Loài cây nào sống được dưới nước? | Bèo | Xương rồng | Thông | Bàng",
    "13 x 3 = ? | 39 | 36 | 42 | 33",
    "Biển nào bao quanh phía Đông Việt Nam? | Biển Đông | Biển Đen | Biển Đỏ | Biển Caspi",
  ].join("\n");

  const FISH_EMOJI = ["🐟", "🐠", "🐡", "🦈", "🐬"];

  const stage = document.getElementById("pondStage");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const timerFill = document.getElementById("timerFill");
  const hookEl = document.getElementById("hook");

  let quizPool = SA.Quiz.load("cau-ca", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = false;
  let activeAnims = [];
  let questionTimeout = null;
  let hookTimer = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreEl.textContent = score;
  }

  function clearStage() {
    activeAnims.forEach(a => { try { a.anim.cancel(); } catch (e) {} clearTimeout(a.timer); });
    activeAnims = [];
    clearTimeout(questionTimeout);
    clearTimeout(hookTimer);
    hookEl.style.display = "none";
    stage.querySelectorAll(".fish").forEach(f => f.remove());
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function showHook(el) {
    const stageRect = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - stageRect.left;
    const y = r.top + r.height / 2 - stageRect.top;
    hookEl.style.left = x + "px";
    hookEl.style.top = (y - 40) + "px";
    hookEl.style.display = "block";
    hookEl.style.opacity = "1";
    try {
      hookEl.animate([
        { transform: "translate(-50%,-140%)", opacity: 0 },
        { transform: "translate(-50%,-100%)", opacity: 1 },
        { transform: "translate(-50%,-100%)", opacity: 1 },
        { transform: "translate(-50%,-260%)", opacity: 0 },
      ], { duration: 700, easing: "ease-in-out" });
    } catch (e) {}
    clearTimeout(hookTimer);
    hookTimer = setTimeout(() => { hookEl.style.display = "none"; }, 700);
  }

  function finishQuestion(correctIndex, chosenEl) {
    if (answered) return;
    answered = true;
    clearTimeout(questionTimeout);

    const fishes = Array.from(stage.querySelectorAll(".fish"));
    fishes.forEach(f => {
      const idx = Number(f.dataset.idx);
      const anim = activeAnims.find(a => a.el === f);
      if (anim) { try { anim.anim.pause(); } catch (e) {} }
      if (idx === correctIndex) f.classList.add("caught");
      else if (f === chosenEl) f.classList.add("wrong-pick");
    });

    if (chosenEl && Number(chosenEl.dataset.idx) === correctIndex) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Câu trúng rồi! Chính xác!";
    } else if (chosenEl) {
      SA.beep("wrong");
      qBanner.textContent = "❌ Câu nhầm cá rồi! Đáp án đúng đã được đánh dấu xanh.";
    } else {
      SA.beep("wrong");
      qBanner.textContent = "⏰ Hết giờ! Đáp án đúng đã được đánh dấu xanh.";
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
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;
    answered = false;
    qBanner.textContent = item.q;
    updateProgress();

    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const laneCount = item.options.length;
    const laneHeight = stageHeight / laneCount;

    item.options.forEach((opt, i) => {
      const el = document.createElement("div");
      el.className = "fish";
      el.dataset.idx = i;
      const emoji = FISH_EMOJI[(i + quizIndex) % FISH_EMOJI.length];
      el.innerHTML = `<div class="emoji">${emoji}</div><div class="label">${escapeHtml(opt)}</div>`;

      const direction = Math.random() > 0.5 ? "ltr" : "rtl";
      if (direction === "ltr") el.classList.add("swim-right");

      const laneY = laneHeight * i + Math.max(0, (laneHeight - 80) / 2) + (Math.random() * 16 - 8);
      el.style.top = Math.max(6, Math.min(stageHeight - 86, laneY)) + "px";

      const startX = direction === "ltr" ? -140 : stageWidth + 20;
      const endX = direction === "ltr" ? stageWidth + 20 : -140;
      el.style.left = startX + "px";
      stage.appendChild(el);

      const duration = 4400 + Math.random() * 1200;
      const delay = i * 260 + Math.random() * 220;
      const sway = 12 + Math.random() * 12;
      const dx = endX - startX;

      const anim = el.animate([
        { transform: "translate(0px,0px)", offset: 0 },
        { transform: `translate(${dx * 0.33}px, ${-sway}px)`, offset: 0.33 },
        { transform: `translate(${dx * 0.66}px, ${sway}px)`, offset: 0.66 },
        { transform: `translate(${dx}px, 0px)`, offset: 1 },
      ], { duration, delay, easing: "linear", fill: "forwards" });

      const timer = setTimeout(() => { if (el.parentNode && !el.classList.contains("caught") && !el.classList.contains("wrong-pick")) el.remove(); }, delay + duration + 60);
      activeAnims.push({ el, anim, timer });

      el.addEventListener("click", () => {
        if (answered) return;
        showHook(el);
        finishQuestion(item.correct, el);
      });
    });

    const totalTime = 6200;
    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    requestAnimationFrame(() => {
      timerFill.style.transition = `width ${totalTime}ms linear`;
      timerFill.style.width = "0%";
    });

    questionTimeout = setTimeout(() => finishQuestion(item.correct, null), totalTime);
  }

  function startGame() {
    score = 0;
    clearStage();
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
    SA.Quiz.save("cau-ca", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  updateProgress();
})();
