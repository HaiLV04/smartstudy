(() => {
  const DEFAULT_QUIZ_TEXT = [
    "5 + 6 = ? | 11 | 10 | 12 | 9",
    "Thủ đô nước Pháp là gì? | Paris | London | Rome | Berlin",
    "Nước nào phát minh ra giấy? | Trung Quốc | Ai Cập | Hy Lạp | Ấn Độ",
    "9 x 3 = ? | 27 | 24 | 21 | 18",
    "Con vật nào biết bay trong các loài sau? | Dơi | Cá voi | Rắn | Cá sấu",
    "Mặt Trăng quay quanh hành tinh nào? | Trái Đất | Sao Hoả | Mặt Trời | Sao Kim",
    "100 : 4 = ? | 25 | 20 | 24 | 30",
    "Loài hoa nào là quốc hoa của Việt Nam? | Hoa sen | Hoa đào | Hoa mai | Hoa hồng",
  ].join("\n");

  const FRUIT_EMOJI = ["🍉", "🍊", "🍋", "🍇", "🍓", "🍎", "🥝", "🍑"];

  const stage = document.getElementById("fruitStage");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const timerFill = document.getElementById("timerFill");

  let quizPool = SA.Quiz.load("chemhoaqua", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = false;
  let activeAnims = [];
  let questionTimeout = null;
  let timerAnim = null;

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
    if (timerAnim) { try { timerAnim.cancel(); } catch (e) {} }
    stage.querySelectorAll(".fruit").forEach(f => f.remove());
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function finishQuestion(correctIndex, chosenEl) {
    if (answered) return;
    answered = true;
    clearTimeout(questionTimeout);
    if (timerAnim) { try { timerAnim.cancel(); } catch (e) {} }

    const fruits = Array.from(stage.querySelectorAll(".fruit"));
    fruits.forEach(f => {
      const idx = Number(f.dataset.idx);
      const anim = activeAnims.find(a => a.el === f);
      if (anim) { try { anim.anim.pause(); } catch (e) {} }
      if (idx === correctIndex) f.classList.add("sliced");
      else if (f === chosenEl) f.classList.add("wrong-pick");
    });

    if (chosenEl && Number(chosenEl.dataset.idx) === correctIndex) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Chính xác!";
    } else if (chosenEl) {
      SA.beep("wrong");
      qBanner.textContent = "❌ Chưa đúng, đáp án đúng đã được đánh dấu xanh.";
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
    const laneWidth = stageWidth / laneCount;

    item.options.forEach((opt, i) => {
      const el = document.createElement("div");
      el.className = "fruit";
      el.dataset.idx = i;
      const emoji = FRUIT_EMOJI[(i + quizIndex) % FRUIT_EMOJI.length];
      el.innerHTML = `<div class="emoji">${emoji}</div><div class="label">${escapeHtml(opt)}</div>`;
      const laneX = laneWidth * i + (laneWidth - 108) / 2 + (Math.random() * 20 - 10);
      el.style.left = Math.max(4, Math.min(stageWidth - 112, laneX)) + "px";
      stage.appendChild(el);

      const riseHeight = stageHeight + 140;
      const duration = 4200 + Math.random() * 900;
      const delay = i * 220 + Math.random() * 150;
      const sway = (Math.random() * 40 - 20);

      const anim = el.animate([
        { transform: `translateY(0px) translateX(0px) rotate(0deg)`, offset: 0 },
        { transform: `translateY(${-riseHeight * 0.55}px) translateX(${sway}px) rotate(${sway > 0 ? 15 : -15}deg)`, offset: 0.5 },
        { transform: `translateY(${-riseHeight}px) translateX(${sway * 1.6}px) rotate(${sway > 0 ? 40 : -40}deg)`, offset: 1 },
      ], { duration, delay, easing: "cubic-bezier(.33,.65,.4,1)", fill: "forwards" });

      const timer = setTimeout(() => { if (el.parentNode && !el.classList.contains("sliced") && !el.classList.contains("wrong-pick")) el.remove(); }, delay + duration + 60);
      activeAnims.push({ el, anim, timer });

      el.addEventListener("click", () => finishQuestion(item.correct, el));
    });

    // Thời gian tối đa cho mỗi câu
    const totalTime = 5600;
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
    SA.Quiz.save("chemhoaqua", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  updateProgress();
})();
