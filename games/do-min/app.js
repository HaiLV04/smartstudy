(() => {
  const DEFAULT_QUIZ_TEXT = [
    "6 x 6 = ? | 36 | 32 | 42 | 30",
    "Việt Nam giáp với mấy nước trên đất liền? | 3 | 2 | 4 | 5",
    "Ai là người tìm ra châu Mỹ? | Christopher Columbus | Marco Polo | Magellan | Vasco da Gama",
    "Nước đóng băng ở bao nhiêu độ C? | 0 độ C | 100 độ C | -10 độ C | 10 độ C",
    "Số nào lớn nhất? | 9 | 7 | 8 | 6",
    "Cây gì được xem là biểu tượng làng quê Việt Nam? | Cây tre | Cây bàng | Cây phượng | Cây đa",
    "12 : 3 = ? | 4 | 3 | 5 | 6",
    "Trong hệ Mặt Trời, hành tinh nào lớn nhất? | Sao Mộc | Trái Đất | Sao Thổ | Sao Hoả",
    "Việt Nam nằm ở châu lục nào? | Châu Á | Châu Âu | Châu Phi | Châu Mỹ",
    "8 + 15 = ? | 23 | 22 | 24 | 21",
  ].join("\n");

  const MAX_LIVES = 3;
  const pathTrack = document.getElementById("pathTrack");
  const questionArea = document.getElementById("questionArea");
  const livesDisplay = document.getElementById("livesDisplay");
  const qProgressEl = document.getElementById("qProgress");

  let quizPool = SA.Quiz.load("domin", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let lives = MAX_LIVES;
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function renderLives() {
    livesDisplay.textContent = "❤️".repeat(lives) + "🖤".repeat(MAX_LIVES - lives);
  }

  function renderPath(currentIdx, boomIdx) {
    pathTrack.innerHTML = "";
    for (let i = 0; i < quizQueue.length; i++) {
      const tile = document.createElement("div");
      let cls = "path-tile";
      let icon = i + 1;
      let isWalker = false;
      if (i < currentIdx) { cls += " done"; icon = "✅"; }
      else if (i === boomIdx) { cls += " boom"; icon = "💥"; }
      else if (i === currentIdx) { cls += " current"; icon = "🚶"; isWalker = true; }
      tile.className = cls;
      // Đường đi tiến từ trái sang phải, nhưng biểu tượng người đi bộ mặc định quay mặt
      // sang trái -> lật ngang để không bị nhìn như đang đi lùi.
      if (isWalker) {
        tile.innerHTML = '<span style="display:inline-block; transform: scaleX(-1);">' + icon + '</span>';
      } else {
        tile.textContent = icon;
      }
      pathTrack.appendChild(tile);
    }
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
  }

  function newQueue() {
    const size = Math.min(10, quizPool.length);
    quizQueue = SA.shuffle(quizPool).slice(0, size);
    quizIndex = 0;
  }

  function startGame() {
    lives = MAX_LIVES;
    gameOver = false;
    newQueue();
    renderLives();
    updateProgress();
    renderPath(0, -1);
    askQuestion();
  }

  function winGame() {
    gameOver = true;
    SA.confetti(120);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🚩</div>
        <h3>Vượt qua bãi mìn thành công!</h3>
        <p>Cả lớp đã trả lời đúng ${quizQueue.length} câu hỏi và về đích an toàn với ${lives} mạng còn lại.</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function loseGame(boomIdx) {
    gameOver = true;
    renderPath(quizIndex - 1, boomIdx);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">💥</div>
        <h3>Rất tiếc, đã hết mạng!</h3>
        <p>Đã vượt qua được ${boomIdx} câu trước khi giẫm phải mìn. Cùng thử lại nhé!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function askQuestion() {
    if (gameOver) return;
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    renderPath(quizIndex, -1);
    updateProgress();

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">Câu ${quizIndex + 1}/${quizQueue.length}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="mine-grid">
          ${item.options.map((opt, i) => `
            <div class="mine-cell" data-idx="${i}">
              <span class="qmark">🧊</span>&nbsp; ${escapeHtml(opt)}
            </div>`).join("")}
        </div>
      </div>`;

    questionArea.querySelectorAll(".mine-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        if (cell.classList.contains("revealed")) return;
        const idx = Number(cell.dataset.idx);
        const isCorrect = idx === item.correct;
        questionArea.querySelectorAll(".mine-cell").forEach(c => c.classList.add("revealed"));

        if (isCorrect) {
          cell.classList.add("safe");
          cell.querySelector(".qmark").textContent = "✅";
          SA.beep("correct");
          quizIndex++;
          setTimeout(() => {
            if (quizIndex >= quizQueue.length) winGame();
            else askQuestion();
          }, 1000);
        } else {
          cell.classList.add("mine");
          cell.querySelector(".qmark").textContent = "💥";
          const correctCell = questionArea.querySelector(`.mine-cell[data-idx="${item.correct}"]`);
          if (correctCell) { correctCell.classList.add("safe"); correctCell.querySelector(".qmark").textContent = "✅"; }
          SA.beep("wrong");
          lives--;
          renderLives();
          quizIndex++;
          setTimeout(() => {
            if (lives <= 0) loseGame(quizIndex);
            else if (quizIndex >= quizQueue.length) winGame();
            else askQuestion();
          }, 1200);
        }
      });
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
    SA.Quiz.save("domin", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
