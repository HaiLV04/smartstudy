(() => {
  const DEFAULT_QUIZ_TEXT = [
    "6 x 7 = ? | 42 | 40 | 36 | 48",
    "Việt Nam có bao nhiêu tỉnh thành hiện nay (trước sáp nhập 2025)? | 63 | 54 | 58 | 61",
    "Chất khí nào con người cần để hô hấp? | Oxy | Nitơ | CO2 | Hydro",
    "Ai là người phát minh ra bóng đèn điện? | Thomas Edison | Isaac Newton | Albert Einstein | Nikola Tesla",
    "Núi nào cao nhất thế giới? | Everest | Fansipan | Kilimanjaro | Phú Sĩ",
    "100 : 5 = ? | 20 | 25 | 15 | 10",
    "Tác phẩm 'Dế Mèn phiêu lưu ký' do ai sáng tác? | Tô Hoài | Nam Cao | Nguyễn Nhật Ánh | Xuân Quỳnh",
    "Đại dương nào lớn nhất thế giới? | Thái Bình Dương | Đại Tây Dương | Ấn Độ Dương | Bắc Băng Dương",
    "Hình có 3 cạnh gọi là hình gì? | Tam giác | Tứ giác | Ngũ giác | Lục giác",
    "Con vật nào được coi là 'chúa tể sơn lâm'? | Hổ | Voi | Sư tử | Gấu",
  ].join("\n");

  const stage = document.getElementById("courtStage");
  const qBanner = document.getElementById("qBanner");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const startBtn = document.getElementById("startBtn");
  const ball = document.getElementById("ball");

  let quizPool = SA.Quiz.load("bong-ro", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = true;
  let currentItem = null;
  let hoopEls = [];
  let ballAnim = null;

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

  // Giới hạn tối đa 4 rổ hiển thị, luôn giữ đáp án đúng
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

  function hoopPercent(i, count) {
    let leftArr, topArr;
    if (count === 2) { leftArr = [24, 76]; topArr = [16, 16]; }
    else if (count === 3) { leftArr = [16, 50, 84]; topArr = [14, 8, 14]; }
    else { leftArr = [10, 37, 63, 90]; topArr = [16, 8, 8, 16]; }
    return { left: leftArr[i], top: topArr[i] };
  }

  function clearStage() {
    hoopEls.forEach(h => h.remove());
    hoopEls = [];
    if (ballAnim) { try { ballAnim.cancel(); } catch (e) {} ballAnim = null; }
    ball.style.display = "none";
  }

  function buildHoops(item) {
    const w = stage.clientWidth, h = stage.clientHeight;
    hoopEls = item.options.map((opt, i) => {
      const pos = hoopPercent(i, item.options.length);
      const el = document.createElement("div");
      el.className = "hoop";
      el.dataset.idx = i;
      el.style.left = (w * pos.left / 100) + "px";
      el.style.top = (h * pos.top / 100) + "px";
      el.innerHTML = `
        <div class="backboard"></div>
        <div class="rim"></div>
        <div class="net"></div>
        <div class="label">${escapeHtml(opt)}</div>`;
      stage.appendChild(el);
      el.addEventListener("click", () => handleShoot(i, el));
      return el;
    });
  }

  function getCenter(el) {
    const stageRect = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - stageRect.left, y: r.top + r.height / 8 - stageRect.top };
  }

  function handleShoot(idx, hoopEl) {
    if (answered) return;
    answered = true;

    const shooterCenter = { x: stage.clientWidth / 2, y: stage.clientHeight - 46 };
    const target = getCenter(hoopEl);
    const dx = target.x - shooterCenter.x;
    const dy = target.y - shooterCenter.y;
    const arcHeight = 170 + Math.random() * 30;
    const isCorrect = idx === currentItem.correct;

    ball.style.left = shooterCenter.x + "px";
    ball.style.top = shooterCenter.y + "px";
    ball.style.display = "block";

    let keyframes;
    if (isCorrect) {
      keyframes = [
        { transform: "translate(0px,0px) scale(1) rotate(0deg)", offset: 0 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - arcHeight}px) scale(0.85) rotate(200deg)`, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.55) rotate(380deg)`, offset: 1 },
      ];
    } else {
      const missOffset = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 20);
      keyframes = [
        { transform: "translate(0px,0px) scale(1) rotate(0deg)", offset: 0 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - arcHeight}px) scale(0.85) rotate(200deg)`, offset: 0.55 },
        { transform: `translate(${dx + missOffset * 0.4}px, ${dy - 6}px) scale(0.6) rotate(340deg)`, offset: 0.8 },
        { transform: `translate(${dx + missOffset}px, ${dy + 110}px) scale(0.5) rotate(520deg)`, offset: 1 },
      ];
    }

    ballAnim = ball.animate(keyframes, { duration: 750, easing: "ease-in", fill: "forwards" });
    ballAnim.onfinish = () => {
      revealResult(idx, hoopEl, isCorrect);
    };
  }

  function revealResult(idx, hoopEl, isCorrect) {
    ball.style.display = "none";
    hoopEls.forEach(h => {
      const hi = Number(h.dataset.idx);
      if (hi === currentItem.correct) h.classList.add("correct-flash");
      else if (h === hoopEl) h.classList.add("wrong-flash");
    });

    if (isCorrect) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Vào rổ! Chính xác!";
    } else {
      SA.beep("wrong");
      qBanner.textContent = `❌ Trượt rồi! Đáp án đúng là: ${currentItem.options[currentItem.correct]}`;
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
    hoopEls.forEach(h => {
      if (Number(h.dataset.idx) === currentItem.correct) h.classList.add("correct-flash");
    });
    SA.beep("wrong");
    qBanner.textContent = `⏰ Hết giờ! Đáp án đúng là: ${currentItem.options[currentItem.correct]}`;
    updateProgress();
    setTimeout(() => {
      clearStage();
      askQuestion();
    }, 1700);
  }

  let questionTimeout = null;

  function askQuestion() {
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    let item = SA.Quiz.shuffled([raw])[0];
    item = limitOptions(item, 4);
    currentItem = item;
    quizIndex++;
    answered = false;
    qBanner.textContent = item.q;
    updateProgress();
    buildHoops(item);
    clearTimeout(questionTimeout);
    questionTimeout = setTimeout(timeoutQuestion, 9000);
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
    SA.Quiz.save("bong-ro", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  updateProgress();
})();
