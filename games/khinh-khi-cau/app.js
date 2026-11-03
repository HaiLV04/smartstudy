(() => {
  const DEFAULT_QUIZ_TEXT = [
    "8 x 6 bằng bao nhiêu? | 48 | 56 | 42 | 40",
    "Khinh khí cầu bay được là nhờ khí gì nhẹ hơn không khí? | Khí nóng/Heli | Khí CO2 | Khí Nitơ | Khí Clo",
    "Sông Cửu Long còn có tên gọi khác là gì? | Sông Mê Kông | Sông Hồng | Sông Mã | Sông Đà",
    "100 chia 4 bằng bao nhiêu? | 25 | 20 | 30 | 24",
    "Ai là người đầu tiên đặt chân lên Mặt Trăng? | Neil Armstrong | Yuri Gagarin | Buzz Aldrin | Gagarin Yuri",
    "Trạng ngữ trong câu dùng để làm gì? | Bổ sung ý nghĩa cho câu | Làm chủ ngữ | Làm vị ngữ | Làm tân ngữ",
    "Số nào chia hết cho cả 2 và 3? | 12 | 10 | 9 | 8",
    "Hồ nào lớn nhất Việt Nam? | Hồ Ba Bể | Hồ Gươm | Hồ Tây | Hồ Xuân Hương",
  ].join("\n");

  const WIN_ALT = 95;
  const balloon = document.getElementById("balloon");
  const stormFill = document.getElementById("stormFill");
  const skyWrap = document.getElementById("skyWrap");
  const questionArea = document.getElementById("questionArea");
  const qStat = document.getElementById("qStat");
  const altStat = document.getElementById("altStat");
  const gapStat = document.getElementById("gapStat");

  let quizPool = SA.Quiz.load("khinhkhicau", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let balloonAlt = 30;
  let stormAlt = 0;
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function refreshSky() {
    const balloonClamped = Math.max(3, Math.min(97, balloonAlt));
    balloon.style.bottom = balloonClamped + "%";
    stormFill.style.height = Math.max(0, Math.min(100, stormAlt)) + "%";
    qStat.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    altStat.textContent = Math.round(Math.max(0, Math.min(100, balloonAlt))) + "%";
    gapStat.textContent = Math.round(Math.max(0, balloonAlt - stormAlt)) + "%";
  }

  function dropSandbag() {
    const bag = document.createElement("div");
    bag.className = "sandbag-drop";
    bag.textContent = "⚖️";
    bag.style.left = "50%";
    bag.style.bottom = Math.max(3, Math.min(97, balloonAlt)) + "%";
    skyWrap.appendChild(bag);
    const anim = bag.animate(
      [
        { transform: "translate(-50%, 0)", opacity: 1 },
        { transform: "translate(-50%, 220px)", opacity: 0 },
      ],
      { duration: 900, easing: "ease-in" }
    );
    anim.onfinish = () => bag.remove();
  }

  function newQueue() { quizQueue = SA.shuffle(quizPool); quizIndex = 0; }

  function startGame() {
    balloonAlt = 30; stormAlt = 0; gameOver = false;
    newQueue();
    refreshSky();
    nextQuestion();
  }

  function winGame(reason) {
    gameOver = true;
    SA.confetti(140);
    SA.beep("correct");
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🎈</div>
        <h3>Giải cứu thành công!</h3>
        <p>${escapeHtml(reason)}</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function loseGame() {
    gameOver = true;
    SA.beep("wrong");
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">⛈️</div>
        <h3>Rất tiếc, cơn bão đã bắt kịp!</h3>
        <p>Khinh khí cầu chưa kịp thoát khỏi cơn bão. Cùng thử lại để giải cứu lần nữa nhé!</p>
        <button class="btn btn-primary btn-lg" id="retryBtn">🔄 Thử lại</button>
      </div>`;
    document.getElementById("retryBtn").addEventListener("click", startGame);
  }

  function nextQuestion() {
    if (gameOver) return;
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box" style="padding-top:0;">
        <div class="question-progress">Câu ${quizIndex + 1}/${quizQueue.length}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid" style="grid-template-columns:1fr;">
          ${item.options.map((opt, i) => `
            <button class="answer-btn" data-idx="${i}">
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </button>`).join("")}
        </div>
      </div>`;

    questionArea.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        const isCorrect = idx === item.correct;
        questionArea.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });

        quizIndex++;
        if (isCorrect) {
          SA.beep("correct");
          balloonAlt = Math.min(100, balloonAlt + 15);
          stormAlt = Math.min(100, stormAlt + 3);
          dropSandbag();
        } else {
          SA.beep("wrong");
          balloonAlt = Math.max(0, balloonAlt - 4);
          stormAlt = Math.min(100, stormAlt + 11);
        }
        refreshSky();

        setTimeout(() => {
          if (stormAlt >= balloonAlt) { loseGame(); return; }
          if (balloonAlt >= WIN_ALT) { winGame("Khinh khí cầu đã bay lên đủ cao và thoát khỏi cơn bão!"); return; }
          if (quizIndex >= quizQueue.length) { winGame(`Đã trả lời hết ${quizQueue.length} câu hỏi và vẫn an toàn trên cao!`); return; }
          nextQuestion();
        }, 900);
      }, { once: true });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 2) { SA.toast("Cần ít nhất 2 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("khinhkhicau", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
