(() => {
  const DEFAULT_TEAMS = ["Đội Trí Tuệ", "Đội Sáng Tạo", "Đội Tiên Phong"];
  const DEFAULT_QUIZ_TEXT = [
    "Việt Nam có bao nhiêu dân tộc anh em? | 54 | 53 | 50 | 63",
    "6 x 9 = ? | 54 | 56 | 48 | 63",
    "Ai là người phát minh ra bóng đèn điện? | Thomas Edison | Isaac Newton | Nikola Tesla | Albert Einstein",
    "Sông Cửu Long còn gọi là sông gì? | Sông Mê Kông | Sông Hồng | Sông Đồng Nai | Sông Mã",
    "144 : 12 = ? | 12 | 11 | 14 | 10",
    "Tác phẩm 'Dế Mèn phiêu lưu ký' của tác giả nào? | Tô Hoài | Nam Cao | Ngô Tất Tố | Nguyễn Nhật Ánh",
    "Hành tinh nào có vành đai nổi tiếng nhất Hệ Mặt Trời? | Sao Thổ | Sao Mộc | Sao Hoả | Sao Kim",
    "13 x 4 = ? | 52 | 48 | 56 | 44",
    "Thành phố nào được gọi là 'Thành phố hoa phượng đỏ'? | Hải Phòng | Đà Nẵng | Huế | Vinh",
    "Chất nào cây cần hấp thụ từ đất để phát triển? | Nước và khoáng chất | Khí Oxy | Ánh sáng | Khí CO2",
    "17 + 25 = ? | 42 | 41 | 43 | 40",
    "Ai là vị tướng chỉ huy chiến thắng Điện Biên Phủ? | Võ Nguyên Giáp | Hồ Chí Minh | Trường Chinh | Lê Duẩn",
  ].join("\n");

  const START_POINTS = 100;
  const MIN_WAGER_CAP = 10;

  const teamScoreboard = document.getElementById("teamScoreboard");
  const roundBanner = document.getElementById("roundBanner");
  const questionArea = document.getElementById("questionArea");

  let teamNames = SA.Names.load("daugia", DEFAULT_TEAMS).slice(0, 6);
  if (teamNames.length < 2) teamNames = DEFAULT_TEAMS.slice(0, 2);
  let quizPool = SA.Quiz.load("daugia", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let teams = [];
  let quizQueue = [];
  let quizIndex = 0;
  let turnIdx = 0;
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function renderScoreboard() {
    teamScoreboard.innerHTML = teams.map((t, i) => `
      <div class="team-chip ${i === turnIdx && !gameOver ? "active" : ""}">
        <span class="t-name">${escapeHtml(t.name)}</span>
        <span class="t-pts">${t.points} điểm</span>
      </div>`).join("");
  }

  function startGame() {
    teams = teamNames.map(n => ({ name: n, points: START_POINTS }));
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
    turnIdx = 0;
    gameOver = false;
    renderScoreboard();
    nextRound();
  }

  function nextRound() {
    if (gameOver) return;
    if (quizIndex >= quizQueue.length) { endGame(); return; }
    const team = teams[turnIdx];
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];

    renderScoreboard();
    roundBanner.innerHTML = `Câu ${quizIndex + 1}/${quizQueue.length} — Lượt đặt cược của <b>${escapeHtml(team.name)}</b>`;

    const maxWager = team.points;
    const minWager = maxWager > 0 ? Math.min(MIN_WAGER_CAP, maxWager) : 0;
    const defaultWager = Math.min(20, maxWager);

    questionArea.innerHTML = `
      <div class="wager-box">
        <div class="question-text">${escapeHtml(item.q)}</div>
        <p class="wager-hint" style="margin-top:14px;">Đội đang có <b>${team.points}</b> điểm. Hãy đặt cược trước khi xem các đáp án!</p>
        <div class="wager-row">
          <input type="number" id="wagerInput" min="${minWager}" max="${maxWager}" value="${defaultWager}" ${maxWager <= 0 ? "disabled" : ""}>
          <button class="btn btn-primary btn-lg" id="confirmWagerBtn">✅ Xác nhận cược</button>
        </div>
        <p class="wager-hint">Cược tối thiểu ${minWager} — tối đa ${maxWager} điểm.</p>
      </div>`;

    document.getElementById("confirmWagerBtn").addEventListener("click", () => {
      const input = document.getElementById("wagerInput");
      let wager = Math.round(Number(input.value));
      if (Number.isNaN(wager)) wager = minWager;
      wager = Math.max(minWager, Math.min(maxWager, wager));
      revealOptions(item, team, wager);
    }, { once: true });
  }

  function revealOptions(item, team, wager) {
    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">${escapeHtml(team.name)} đã cược <b>${wager}</b> điểm — chọn đáp án đúng!</div>
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
          team.points += wager;
          SA.toast(`✅ ${team.name} trả lời đúng! +${wager} điểm`);
        } else {
          SA.beep("wrong");
          team.points = Math.max(0, team.points - wager);
          SA.toast(`❌ ${team.name} trả lời sai! -${wager} điểm`);
        }
        renderScoreboard();

        setTimeout(() => {
          quizIndex++;
          turnIdx = (turnIdx + 1) % teams.length;
          nextRound();
        }, 1300);
      }, { once: true });
    });
  }

  function endGame() {
    gameOver = true;
    SA.confetti(140);
    const ranking = teams.slice().sort((a, b) => b.points - a.points);
    const medals = ["🥇", "🥈", "🥉", "🎗️", "🎗️", "🎗️"];
    roundBanner.textContent = "Đã hết câu hỏi — Kết quả chung cuộc!";
    renderScoreboard();
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏆</div>
        <h3>${escapeHtml(ranking[0].name)} chiến thắng chung cuộc!</h3>
        <div class="podium-list">
          ${ranking.map((t, i) => `
            <div class="podium-row">
              <span>${medals[i] || "🎗️"}</span>
              <span style="flex:1;">${escapeHtml(t.name)}</span>
              <span>${t.points} điểm</span>
            </div>`).join("")}
        </div>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("teamsInput").value = teamNames.join("\n");
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    let newTeams = SA.Names.parseText(document.getElementById("teamsInput").value).slice(0, 6);
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newTeams.length < 2) { SA.toast("Cần ít nhất 2 đội chơi!"); return; }
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    teamNames = newTeams;
    quizPool = newQuiz;
    SA.Names.save("daugia", teamNames);
    SA.Quiz.save("daugia", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
