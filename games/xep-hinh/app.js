(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Việt Nam có bao nhiêu tỉnh/thành phố trực thuộc trung ương (trước sáp nhập 2025)? | 63 | 61 | 64 | 58",
    "8 x 7 bằng bao nhiêu? | 56 | 54 | 64 | 48",
    "Thủ đô của nước Pháp là gì? | Paris | London | Berlin | Roma",
    "Hành tinh nào gần Mặt Trời nhất? | Sao Thuỷ | Sao Kim | Trái Đất | Sao Hoả",
    "Tác giả bài thơ 'Nam quốc sơn hà' (tương truyền) là ai? | Lý Thường Kiệt | Trần Hưng Đạo | Nguyễn Trãi | Lê Lợi",
    "Nước sôi ở nhiệt độ bao nhiêu độ C (áp suất thường)? | 100°C | 90°C | 80°C | 120°C",
    "Con vật nào được mệnh danh là 'chúa tể rừng xanh'? | Hổ | Sư tử | Voi | Gấu",
    "1 thế kỷ có bao nhiêu năm? | 100 năm | 10 năm | 1000 năm | 50 năm",
    "Từ nào là danh từ trong câu 'Em bé đang chơi bóng'? | bóng | đang | chơi | em",
    "Sông nào dài nhất Việt Nam? | Sông Mê Kông | Sông Hồng | Sông Đồng Nai | Sông Mã",
    "Công thức hoá học của nước là gì? | H2O | CO2 | O2 | NaCl",
    "Ai là người phát minh ra bóng đèn điện? | Thomas Edison | Isaac Newton | Albert Einstein | Nikola Tesla",
  ].join("\n");

  const PIECE_ORDER = ["body", "finL", "finR", "stripe", "window", "nose", "flame", "sparkles"];
  const rocketStage = document.getElementById("rocketStage");
  const pieceCountEl = document.getElementById("pieceCount");
  const pieceTotalEl = document.getElementById("pieceTotal");
  const questionArea = document.getElementById("questionArea");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  let quizPool = SA.Quiz.load("xephinh", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let piecesPlaced = 0;
  let gameOver = false;

  function pieceEl(name) { return rocketStage.querySelector(`.rocket-piece[data-piece="${name}"]`); }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function resetRocket() {
    PIECE_ORDER.forEach(name => pieceEl(name).classList.remove("revealed"));
  }

  function startGame() {
    piecesPlaced = 0;
    gameOver = false;
    pieceCountEl.textContent = 0;
    pieceTotalEl.textContent = PIECE_ORDER.length;
    resetRocket();
    newQueue();
    nextQuestion();
  }

  function revealNextPiece() {
    if (piecesPlaced >= PIECE_ORDER.length) return;
    const name = PIECE_ORDER[piecesPlaced];
    pieceEl(name).classList.add("revealed");
    piecesPlaced++;
    pieceCountEl.textContent = piecesPlaced;
  }

  function finishGame() {
    gameOver = true;
    SA.confetti(160);
    questionArea.innerHTML = `
      <div class="result-box xh-result">
        <div class="emoji">🚀</div>
        <h3>Hoàn thành bức tranh tên lửa!</h3>
        <p>Bạn đã trả lời đúng đủ để ráp hết ${PIECE_ORDER.length} mảnh ghép. Tuyệt vời!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function nextQuestion() {
    if (gameOver) return;
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box" style="padding-top:0;">
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid" style="grid-template-columns: 1fr;">
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

        if (isCorrect) {
          SA.beep("correct");
          revealNextPiece();
        } else {
          SA.beep("wrong");
        }

        setTimeout(() => {
          if (piecesPlaced >= PIECE_ORDER.length) { finishGame(); return; }
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
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("xephinh", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
