(() => {
  const DEFAULT_QUIZ_TEXT = [
    "4 x 5 = ? | 20 | 24 | 18 | 16",
    "Việt Nam có bờ biển dài khoảng bao nhiêu km? | Hơn 3.000 km | Hơn 1.000 km | Hơn 5.000 km | Hơn 500 km",
    "Ai viết bản Tuyên ngôn độc lập của Việt Nam? | Hồ Chí Minh | Võ Nguyên Giáp | Phạm Văn Đồng | Trường Chinh",
    "10 - 4 + 2 = ? | 8 | 6 | 7 | 9",
    "Loài chim nào không biết bay? | Chim cánh cụt | Đại bàng | Chim sẻ | Bồ câu",
    "Mấy mùa trong năm ở miền Bắc Việt Nam? | 4 mùa | 2 mùa | 3 mùa | 5 mùa",
    "3 x 3 x 3 = ? | 27 | 9 | 18 | 24",
    "Cơ quan nào bơm máu đi khắp cơ thể? | Tim | Phổi | Gan | Thận",
  ].join("\n");

  const TOTAL_STEPS = 8;

  const runnerA = document.getElementById("runnerA");
  const runnerB = document.getElementById("runnerB");
  const stepAEl = document.getElementById("teamAStep");
  const stepBEl = document.getElementById("teamBStep");
  const teamALabelEl = document.getElementById("teamALabel");
  const teamBLabelEl = document.getElementById("teamBLabel");
  const turnBanner = document.getElementById("turnBanner");
  const questionArea = document.getElementById("questionArea");
  const starsA = document.getElementById("starsA");
  const starsB = document.getElementById("starsB");

  let teamA = localStorage.getItem("sa_race_teamA") || "Đội A";
  let teamB = localStorage.getItem("sa_race_teamB") || "Đội B";
  let quizPool = SA.Quiz.load("duangoisao", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let stepA = 0, stepB = 0;
  let turn = "A";
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function fillStars(el) {
    el.innerHTML = "";
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const s = document.createElement("span");
      s.textContent = "⭐";
      el.appendChild(s);
    }
  }

  function refreshLabels() {
    teamALabelEl.textContent = "🔵 " + teamA;
    teamBLabelEl.textContent = "🟠 " + teamB;
  }

  function pctFor(step) { return 4 + (step / TOTAL_STEPS) * 90; }

  function refreshTrack() {
    runnerA.style.left = pctFor(stepA) + "%";
    runnerB.style.left = pctFor(stepB) + "%";
    stepAEl.textContent = `${stepA}/${TOTAL_STEPS}`;
    stepBEl.textContent = `${stepB}/${TOTAL_STEPS}`;
  }

  function newQueue() { quizQueue = SA.shuffle(quizPool); quizIndex = 0; }

  function startGame() {
    stepA = 0; stepB = 0; turn = "A"; gameOver = false;
    fillStars(starsA); fillStars(starsB);
    newQueue();
    refreshTrack();
    nextQuestion();
  }

  function endGame(winnerTeam) {
    gameOver = true;
    SA.confetti(120);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏆</div>
        <h3>${escapeHtml(winnerTeam)} về đích đầu tiên!</h3>
        <p>Chúc mừng đội chiến thắng. Bấm "Chơi lại" để bắt đầu ván mới.</p>
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
          if (turn === "A") stepA = Math.min(TOTAL_STEPS, stepA + 1);
          else stepB = Math.min(TOTAL_STEPS, stepB + 1);
        } else {
          SA.beep("wrong");
        }
        refreshTrack();

        setTimeout(() => {
          if (stepA >= TOTAL_STEPS) { endGame(teamA); return; }
          if (stepB >= TOTAL_STEPS) { endGame(teamB); return; }
          turn = turn === "A" ? "B" : "A";
          nextQuestion();
        }, 800);
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
    localStorage.setItem("sa_race_teamA", teamA);
    localStorage.setItem("sa_race_teamB", teamB);
    SA.Quiz.save("duangoisao", quizPool);
    refreshLabels();
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  refreshLabels();
  startGame();
})();
