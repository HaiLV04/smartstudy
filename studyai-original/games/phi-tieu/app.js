(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Thủ đô của Nhật Bản là gì? | Tokyo | Osaka | Kyoto | Seoul",
    "9 x 9 = ? | 81 | 72 | 90 | 79",
    "Ai viết bài thơ 'Nam quốc sơn hà'? | Lý Thường Kiệt | Trần Hưng Đạo | Nguyễn Trãi | Lê Lợi",
    "Kim loại nào nhẹ nhất trong các kim loại sau? | Nhôm | Sắt | Đồng | Chì",
    "Việt Nam giành huy chương vàng Olympic đầu tiên ở môn nào? | Bắn súng | Bơi lội | Điền kinh | Cầu lông",
    "1 giờ có bao nhiêu phút? | 60 | 100 | 30 | 24",
    "Sa mạc lớn nhất thế giới là gì? | Sahara | Gobi | Kalahari | Atacama",
    "Cơ quan nào giúp con người hô hấp? | Phổi | Tim | Gan | Dạ dày",
    "20 - 7 = ? | 13 | 12 | 14 | 15",
    "Loài chim nào không biết bay? | Đà điểu | Đại bàng | Chim sẻ | Bồ câu",
  ].join("\n");

  const stage = document.getElementById("dartStage");
  const board = document.getElementById("dartBoard");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const timerFill = document.getElementById("timerFill");
  const dartEl = document.getElementById("flyingDart");

  let quizPool = SA.Quiz.load("phi-tieu", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = true;
  let currentItem = null;
  let zoneEls = [];
  let dartAnim = null;
  let questionTimeout = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreEl.textContent = score;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  // Giới hạn tối đa 5 vị trí trên bia, luôn giữ đáp án đúng
  function limitOptions(item, max) {
    if (item.options.length <= max) return item;
    const correctText = item.options[item.correct];
    let opts = item.options.slice();
    opts.splice(item.correct, 1);
    opts = SA.shuffle(opts).slice(0, max - 1);
    const insertPos = Math.floor(Math.random() * (opts.length + 1));
    opts.splice(insertPos, 0, correctText);
    return { q: item.q, options: opts, correct: insertPos };
  }

  function boardCenter() {
    return { x: stage.clientWidth / 2, y: stage.clientHeight * 0.56 };
  }

  function clearStage() {
    zoneEls.forEach(z => z.remove());
    zoneEls = [];
    if (dartAnim) { try { dartAnim.cancel(); } catch (e) {} dartAnim = null; }
    dartEl.style.display = "none";
    document.querySelectorAll(".confetti-burst").forEach(p => p.remove());
  }

  function buildZones(item) {
    const center = boardCenter();
    const radius = 128;
    const count = item.options.length;
    const angleStart = -90;
    zoneEls = item.options.map((opt, i) => {
      const angle = (angleStart + (360 / count) * i) * Math.PI / 180;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      const el = document.createElement("div");
      el.className = "dart-zone";
      el.dataset.idx = i;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.innerHTML = `<div class="pin">${escapeHtml(opt)}</div>`;
      stage.appendChild(el);
      el.addEventListener("click", () => handleThrow(i, el));
      return el;
    });
  }

  function burstConfettiAt(x, y) {
    const colors = ["#0ea5a4", "#2563eb", "#f97316", "#facc15", "#db2777", "#22c55e"];
    for (let i = 0; i < 22; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-burst";
      piece.style.left = x + "px";
      piece.style.top = y + "px";
      piece.style.background = colors[i % colors.length];
      stage.appendChild(piece);
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const anim = piece.animate([
        { transform: "translate(0px,0px) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
      ], { duration: 650 + Math.random() * 300, easing: "ease-out" });
      anim.onfinish = () => piece.remove();
    }
  }

  function handleThrow(idx, zoneEl) {
    if (answered) return;
    answered = true;
    clearTimeout(questionTimeout);

    const start = { x: stage.clientWidth / 2, y: stage.clientHeight - 26 };
    const target = { x: parseFloat(zoneEl.style.left), y: parseFloat(zoneEl.style.top) };
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const isCorrect = idx === currentItem.correct;

    dartEl.style.left = start.x + "px";
    dartEl.style.top = start.y + "px";
    dartEl.style.display = "block";

    const wobble = isCorrect ? 0 : (Math.random() > 0.5 ? 18 : -18);
    const keyframes = [
      { transform: "translate(-50%,-50%) translate(0px,0px) scale(0.6) rotate(0deg)", offset: 0 },
      { transform: `translate(-50%,-50%) translate(${dx * 0.6}px, ${dy * 0.6 - 40}px) scale(0.85) rotate(140deg)`, offset: 0.6 },
      { transform: `translate(-50%,-50%) translate(${dx + wobble}px, ${dy}px) scale(1) rotate(260deg)`, offset: 1 },
    ];

    dartAnim = dartEl.animate(keyframes, { duration: 520, easing: "ease-in", fill: "forwards" });
    dartAnim.onfinish = () => revealResult(idx, zoneEl, isCorrect, target);
  }

  function revealResult(idx, zoneEl, isCorrect, target) {
    zoneEls.forEach(z => {
      const zi = Number(z.dataset.idx);
      if (zi === currentItem.correct) z.classList.add("correct-flash");
      else if (z === zoneEl) z.classList.add("wrong-flash");
    });

    if (isCorrect) {
      score++;
      SA.beep("correct");
      burstConfettiAt(target.x, target.y);
      SA.confetti(40);
      qBanner.textContent = "✅ Trúng đích! Chính xác!";
    } else {
      SA.beep("wrong");
      qBanner.textContent = `❌ Trượt đích! Đáp án đúng là: ${currentItem.options[currentItem.correct]}`;
    }
    updateProgress();

    setTimeout(() => {
      clearStage();
      askQuestion();
    }, 1700);
  }

  function timeoutQuestion() {
    if (answered) return;
    answered = true;
    zoneEls.forEach(z => {
      if (Number(z.dataset.idx) === currentItem.correct) z.classList.add("correct-flash");
    });
    SA.beep("wrong");
    qBanner.textContent = `⏰ Hết giờ! Đáp án đúng là: ${currentItem.options[currentItem.correct]}`;
    updateProgress();
    setTimeout(() => {
      clearStage();
      askQuestion();
    }, 1700);
  }

  function askQuestion() {
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    let item = SA.Quiz.shuffled([raw])[0];
    item = limitOptions(item, 5);
    currentItem = item;
    quizIndex++;
    answered = false;
    qBanner.textContent = item.q;
    updateProgress();
    buildZones(item);

    const totalTime = 9000;
    timerFill.style.transition = "none";
    timerFill.style.width = "100%";
    requestAnimationFrame(() => {
      timerFill.style.transition = `width ${totalTime}ms linear`;
      timerFill.style.width = "0%";
    });
    clearTimeout(questionTimeout);
    questionTimeout = setTimeout(timeoutQuestion, totalTime);
  }

  function startGame() {
    score = 0;
    clearTimeout(questionTimeout);
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
    SA.Quiz.save("phi-tieu", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  updateProgress();
})();
