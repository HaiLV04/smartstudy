(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Con ___ đang bay trên bầu trời. | chim | cá | rắn | ốc",
    "Ghép từ: 'Học' + ___ = một từ có nghĩa | sinh | bơi | ăn | ngủ",
    "Mặt Trời mọc ở hướng ___. | Đông | Tây | Nam | Bắc",
    "Ghép từ: 'Bút' + ___ = một từ có nghĩa | chì | bàn | ghế | sách",
    "Con ___ kêu 'gâu gâu'. | chó | mèo | gà | vịt",
    "Ghép từ: 'Xe' + ___ = một từ có nghĩa | đạp | bàn | ghế | núi",
    "Mùa ___ trời rất lạnh, hay có gió mùa Đông Bắc. | đông | hè | xuân | thu",
    "Ghép từ: 'Cây' + ___ = một từ có nghĩa (dụng cụ để viết) | bút | ghế | bàn | núi",
  ].join("\n");

  const WING_EMOJI = ["🕊️", "🦋", "🪁", "✈️", "🎈", "🦅", "🌤️", "🍃"];
  // Các emoji vốn "quay mặt/mũi" sang phải theo mặc định (VD: máy bay ✈️ luôn chúc mũi lên phía
  // trên-bên-phải) cần lật ngang để không bị "bay lùi" khi từ di chuyển từ phải sang trái.
  const RIGHT_FACING_EMOJI = new Set(["✈️"]);

  const stage = document.getElementById("flyStage");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const timerFill = document.getElementById("timerFill");

  let quizPool = SA.Quiz.load("tunguibietbay", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = false;
  let activeAnims = [];
  let questionTimeout = null;

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
    stage.querySelectorAll(".flyword").forEach(f => f.remove());
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function finishQuestion(correctIndex, chosenEl) {
    if (answered) return;
    answered = true;
    clearTimeout(questionTimeout);

    const words = Array.from(stage.querySelectorAll(".flyword"));
    words.forEach(w => {
      const idx = Number(w.dataset.idx);
      const anim = activeAnims.find(a => a.el === w);
      if (anim) { try { anim.anim.pause(); } catch (e) {} }
      if (idx === correctIndex) w.classList.add("correct-pick");
      else if (w === chosenEl) w.classList.add("wrong-pick");
    });

    if (chosenEl && Number(chosenEl.dataset.idx) === correctIndex) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Chính xác!";
    } else if (chosenEl) {
      SA.beep("wrong");
      qBanner.textContent = "❌ Chưa đúng, từ đúng đã được đánh dấu xanh.";
    } else {
      SA.beep("wrong");
      qBanner.textContent = "⏰ Hết giờ! Từ đúng đã được đánh dấu xanh.";
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
    const laneHeight = (stageHeight - 60) / laneCount;

    item.options.forEach((opt, i) => {
      const el = document.createElement("div");
      el.className = "flyword";
      el.dataset.idx = i;
      const emoji = WING_EMOJI[(i + quizIndex) % WING_EMOJI.length];
      const wingClass = "wing" + (RIGHT_FACING_EMOJI.has(emoji) ? " flip-face" : "");
      el.innerHTML = `<span class="${wingClass}">${emoji}</span><span class="label">${escapeHtml(opt)}</span>`;
      stage.appendChild(el);

      const topY = 56 + laneHeight * i + (laneHeight - 40) / 2 + (Math.random() * 16 - 8);
      el.style.top = Math.max(50, Math.min(stageHeight - 46, topY)) + "px";

      const elWidth = el.offsetWidth || 140;
      const startX = stageWidth + elWidth;
      const endX = -elWidth - 20;
      el.style.left = startX + "px";

      const duration = 4600 + Math.random() * 1600;
      const delay = i * 260 + Math.random() * 200;
      const bob = 14 + Math.random() * 10;

      const anim = el.animate([
        { transform: `translateX(0px) translateY(0px)`, offset: 0 },
        { transform: `translateX(${(endX - startX) * 0.5}px) translateY(${-bob}px)`, offset: 0.5 },
        { transform: `translateX(${endX - startX}px) translateY(0px)`, offset: 1 },
      ], { duration, delay, easing: "linear", fill: "forwards" });

      const timer = setTimeout(() => { if (el.parentNode && !el.classList.contains("correct-pick") && !el.classList.contains("wrong-pick")) el.remove(); }, delay + duration + 60);
      activeAnims.push({ el, anim, timer });

      el.addEventListener("click", () => finishQuestion(item.correct, el));
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
    SA.Quiz.save("tunguibietbay", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  updateProgress();
})();
