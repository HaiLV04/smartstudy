(() => {
  const DEFAULT_QUIZ_TEXT = [
    "8 + 7 = ? | 15 | 14 | 16 | 13",
    "Thủ đô của nước Anh là gì? | London | Paris | Berlin | Madrid",
    "Ai là tác giả của 'Truyện Kiều'? | Nguyễn Du | Hồ Xuân Hương | Nguyễn Trãi | Nguyễn Đình Chiểu",
    "Nước chiếm bao nhiêu phần trăm bề mặt Trái Đất? | 71% | 50% | 90% | 30%",
    "Hành tinh nào được gọi là 'hành tinh đỏ'? | Sao Hoả | Sao Kim | Sao Mộc | Sao Thổ",
    "6 x 9 = ? | 54 | 56 | 48 | 45",
    "Vịnh nào là di sản thiên nhiên thế giới ở Việt Nam? | Vịnh Hạ Long | Vịnh Cam Ranh | Vịnh Vân Phong | Vịnh Thái Lan",
    "Cơ quan nào bơm máu đi khắp cơ thể? | Tim | Phổi | Gan | Thận",
    "144 : 12 = ? | 12 | 10 | 14 | 11",
    "Loài hoa nào nở vào mùa xuân miền Bắc Việt Nam? | Hoa đào | Hoa mai | Hoa phượng | Hoa sen",
  ].join("\n");

  const stage = document.getElementById("bubbleStage");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const timerFill = document.getElementById("timerFill");

  let quizPool = SA.Quiz.load("bong-bong", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
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
    stage.querySelectorAll(".bubble").forEach(f => f.remove());
    stage.querySelectorAll(".particle").forEach(p => p.remove());
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function burstParticles(el) {
    const stageRect = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - stageRect.left;
    const y = r.top + r.height / 2 - stageRect.top;
    const colors = ["#ffffff", "#bae6fd", "#7dd3fc", "#38bdf8"];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = 4 + Math.random() * 6;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.background = colors[i % colors.length];
      stage.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 50;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const anim = p.animate([
        { transform: "translate(0px,0px) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 },
      ], { duration: 500 + Math.random() * 300, easing: "ease-out" });
      anim.onfinish = () => p.remove();
    }
  }

  function finishQuestion(correctIndex, chosenEl) {
    if (answered) return;
    answered = true;
    clearTimeout(questionTimeout);

    const bubbles = Array.from(stage.querySelectorAll(".bubble"));
    bubbles.forEach(f => {
      const idx = Number(f.dataset.idx);
      const anim = activeAnims.find(a => a.el === f);
      if (anim) { try { anim.anim.pause(); } catch (e) {} }
      if (idx === correctIndex) {
        if (f === chosenEl) f.classList.add("popped");
        else f.classList.add("reveal-correct");
      } else if (f === chosenEl) {
        f.classList.add("wrong-pick");
      }
    });

    if (chosenEl && Number(chosenEl.dataset.idx) === correctIndex) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Vỡ đúng bong bóng! Chính xác!";
    } else if (chosenEl) {
      SA.beep("wrong");
      qBanner.textContent = "❌ Vỡ nhầm bong bóng rồi! Đáp án đúng đã được đánh dấu xanh.";
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
      el.className = "bubble";
      el.dataset.idx = i;
      el.innerHTML = `<div class="orb"></div><div class="label">${escapeHtml(opt)}</div>`;
      const laneX = laneWidth * i + (laneWidth - 100) / 2 + (Math.random() * 20 - 10);
      el.style.left = Math.max(4, Math.min(stageWidth - 104, laneX)) + "px";
      stage.appendChild(el);

      const riseHeight = stageHeight + 150;
      const duration = 4600 + Math.random() * 1100;
      const delay = i * 240 + Math.random() * 180;
      const sway = (Math.random() * 44 - 22);

      const anim = el.animate([
        { transform: "translateY(0px) translateX(0px)", offset: 0 },
        { transform: `translateY(${-riseHeight * 0.35}px) translateX(${sway * 0.5}px)`, offset: 0.35 },
        { transform: `translateY(${-riseHeight * 0.7}px) translateX(${-sway * 0.5}px)`, offset: 0.7 },
        { transform: `translateY(${-riseHeight}px) translateX(${sway}px)`, offset: 1 },
      ], { duration, delay, easing: "ease-in-out", fill: "forwards" });

      const timer = setTimeout(() => { if (el.parentNode && !el.classList.contains("popped") && !el.classList.contains("wrong-pick") && !el.classList.contains("reveal-correct")) el.remove(); }, delay + duration + 60);
      activeAnims.push({ el, anim, timer });

      el.addEventListener("click", () => {
        if (answered) return;
        burstParticles(el);
        finishQuestion(item.correct, el);
      });
    });

    const totalTime = 5800;
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
    SA.Quiz.save("bong-bong", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  updateProgress();
})();
