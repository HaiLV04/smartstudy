(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Việt Nam có bao nhiêu tỉnh/thành phố trực thuộc trung ương (trước sáp nhập 2025)? | 63 | 61 | 64 | 58",
    "2 x 8 - 6 bằng bao nhiêu? | 10 | 16 | 12 | 8",
    "Sông nào dài nhất Việt Nam? | Sông Hồng | Sông Mê Kông | Sông Đồng Nai | Sông Mã",
    "Ai là tác giả bài thơ Nam quốc sơn hà (tương truyền)? | Lý Thường Kiệt | Trần Hưng Đạo | Nguyễn Trãi | Lê Lợi",
    "7 x 7 bằng bao nhiêu? | 49 | 42 | 56 | 47",
    "Loài vật nào được mệnh danh là quốc thú của Việt Nam? | Sao la | Voi | Hổ | Gấu trúc",
    "1 thế kỷ có bao nhiêu năm? | 100 | 10 | 1000 | 50",
    "Quả gì có nhiều múi, vị chua ngọt, biểu tượng ngày Tết miền Nam? | Dưa hấu | Bưởi | Cam | Quýt",
  ].join("\n");

  const fillA = document.getElementById("fillA");
  const fillB = document.getElementById("fillB");
  const knot = document.getElementById("ropeKnot");
  const teamALabelEl = document.getElementById("teamALabel");
  const teamBLabelEl = document.getElementById("teamBLabel");
  const turnBanner = document.getElementById("turnBanner");
  const questionArea = document.getElementById("questionArea");

  let teamA = localStorage.getItem("sa_keoco_teamA") || "Đội A";
  let teamB = localStorage.getItem("sa_keoco_teamB") || "Đội B";
  let quizPool = SA.Quiz.load("keoco", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let position = 50; // 0 = Team A wins, 100 = Team B wins
  let turn = "A";
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function refreshLabels() {
    teamALabelEl.textContent = "🔵 " + teamA;
    teamBLabelEl.textContent = "🟠 " + teamB;
  }

  function refreshRope() {
    fillA.style.width = (100 - position) + "%";
    fillB.style.width = position + "%";
    knot.style.left = (100 - position) + "%";
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function startGame() {
    position = 50;
    turn = "A";
    gameOver = false;
    newQueue();
    refreshRope();
    nextQuestion();
  }

  function endGame(winnerTeam) {
    gameOver = true;
    SA.confetti(120);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏆</div>
        <h3>${escapeHtml(winnerTeam)} đã chiến thắng!</h3>
        <p>Đội đã kéo được sợi dây về phía mình. Bấm "Chơi lại" để bắt đầu ván mới.</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    turnBanner.textContent = "Ván đấu kết thúc";
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function nextQuestion() {
    if (gameOver) return;
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;

    const currentTeamName = turn === "A" ? teamA : teamB;
    turnBanner.textContent = `Lượt của ${currentTeamName}`;

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid">
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
          position += turn === "A" ? -12 : 12;
        } else {
          SA.beep("wrong");
          position += turn === "A" ? 8 : -8; // trả lời sai giúp đội kia kéo dây lên
        }
        position = Math.max(0, Math.min(100, position));
        refreshRope();

        setTimeout(() => {
          if (position <= 4) { endGame(teamA); return; }
          if (position >= 96) { endGame(teamB); return; }
          turn = turn === "A" ? "B" : "A";
          nextQuestion();
        }, 900);
      }, { once: true });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("teamAInput").value = teamA;
    document.getElementById("teamBInput").value = teamB;
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    teamA = document.getElementById("teamAInput").value.trim() || "Đội A";
    teamB = document.getElementById("teamBInput").value.trim() || "Đội B";
    quizPool = newQuiz;
    localStorage.setItem("sa_keoco_teamA", teamA);
    localStorage.setItem("sa_keoco_teamB", teamB);
    SA.Quiz.save("keoco", quizPool);
    refreshLabels();
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  refreshLabels();
  startGame();
})();
