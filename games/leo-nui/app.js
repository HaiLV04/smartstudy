(() => {
  const DEFAULT_QUIZ_TEXT = [
    "9 x 9 bằng bao nhiêu? | 81 | 72 | 90 | 88",
    "Đỉnh núi cao nhất thế giới tên là gì? | Everest | Fansipan | K2 | Kilimanjaro",
    "Nước ta có bao nhiêu mùa trong năm (miền Bắc)? | 4 mùa | 2 mùa | 3 mùa | 5 mùa",
    "Ai là tác giả của tác phẩm 'Dế Mèn phiêu lưu ký'? | Tô Hoài | Nam Cao | Nguyễn Nhật Ánh | Tố Hữu",
    "12 : 4 + 3 bằng bao nhiêu? | 6 | 5 | 7 | 9",
    "Hành tinh nào được gọi là 'hành tinh đỏ'? | Sao Hoả | Sao Kim | Sao Thổ | Sao Mộc",
    "Chất nào cây cần để quang hợp ngoài ánh sáng và nước? | Khí CO2 | Khí Oxy | Khí Nitơ | Khí Hydro",
    "Vịnh Hạ Long thuộc tỉnh/thành nào? | Quảng Ninh | Hải Phòng | Đà Nẵng | Nha Trang",
    "15 x 2 - 10 bằng bao nhiêu? | 20 | 25 | 30 | 15",
    "Ai là người lãnh đạo cuộc khởi nghĩa Hai Bà Trưng? | Hai Bà Trưng | Bà Triệu | Lê Lợi | Quang Trung",
  ].join("\n");

  const climber = document.getElementById("climber");
  const altitudeFill = document.getElementById("altitudeFill");
  const mountainFlag = document.getElementById("mountainFlag");
  const questionArea = document.getElementById("questionArea");
  const stepStat = document.getElementById("stepStat");
  const altStat = document.getElementById("altStat");
  const streakStat = document.getElementById("streakStat");

  let quizPool = SA.Quiz.load("leonui", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let height = 0; // 0..TOTAL_STEPS float
  let streak = 0;
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function totalSteps() { return Math.max(1, quizQueue.length); }

  function refreshClimber() {
    const f = Math.max(0, Math.min(1, height / totalSteps()));
    const leftPct = 8 + f * 42;
    const bottomPct = 2 + f * 88;
    climber.style.left = leftPct + "%";
    climber.style.bottom = bottomPct + "%";
    altitudeFill.style.height = (f * 100) + "%";
    stepStat.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    altStat.textContent = Math.round(f * 100) + "%";
    streakStat.textContent = streak;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function startGame() {
    height = 0; streak = 0; gameOver = false;
    mountainFlag.classList.remove("show");
    newQueue();
    refreshClimber();
    nextQuestion();
  }

  function summit() {
    gameOver = true;
    mountainFlag.classList.add("show");
    SA.confetti(140);
    SA.beep("correct");
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🚩</div>
        <h3>Chinh phục đỉnh núi thành công!</h3>
        <p>Cả lớp đã trả lời đúng ${quizQueue.length} câu hỏi và lên tới đỉnh. Xuất sắc lắm!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Leo lại từ đầu</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function notReachedSummit() {
    gameOver = true;
    SA.beep("wrong");
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">⛺</div>
        <h3>Chưa lên tới đỉnh!</h3>
        <p>Cả lớp đã trả lời hết ${quizQueue.length} câu hỏi nhưng câu cuối chưa chính xác nên chưa cắm được cờ. Hãy thử leo lại nhé!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Leo lại từ đầu</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
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
          streak++;
          height = Math.min(totalSteps(), height + 1);
        } else {
          SA.beep("wrong");
          streak = 0;
          height = Math.max(0, height - 0.5);
        }
        refreshClimber();

        setTimeout(() => {
          if (quizIndex >= quizQueue.length) {
            if (isCorrect) summit(); else notReachedSummit();
            return;
          }
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
    SA.Quiz.save("leonui", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu leo lại từ đầu.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
