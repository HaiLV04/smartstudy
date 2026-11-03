(() => {
  const DEFAULT_NAMES = ["Đội Sao Vàng", "Đội Sao Xanh", "Đội Sao Đỏ", "Đội Sao Tím"];
  const DEFAULT_QUIZ_TEXT = [
    "9 x 6 = ? | 54 | 56 | 45 | 63",
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Huế | Đà Nẵng",
    "Nước chiếm bao nhiêu % bề mặt Trái Đất? | Khoảng 70% | Khoảng 30% | Khoảng 50% | Khoảng 90%",
    "Ai là tác giả truyện Kiều? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Tố Hữu",
    "100 : 4 = ? | 25 | 20 | 24 | 30",
    "Hành tinh nào được gọi là Hành tinh Đỏ? | Sao Hoả | Sao Kim | Sao Mộc | Sao Thổ",
    "Việt Nam giành độc lập vào năm nào? | 1945 | 1954 | 1975 | 1930",
    "Cơ quan nào giúp con người hô hấp? | Phổi | Tim | Gan | Thận",
    "8 + 7 x 2 = ? | 22 | 30 | 15 | 23",
    "Con sông nào dài nhất thế giới? | Sông Nin | Sông Amazon | Sông Trường Giang | Sông Mê Kông",
  ].join("\n");

  const FINAL_TILE = 20;
  const COLORS = ["#0ea5a4", "#2563eb", "#f97316", "#db2777"];

  const playersBar = document.getElementById("playersBar");
  const boardTrack = document.getElementById("boardTrack");
  const turnBanner = document.getElementById("turnBanner");
  const diceZone = document.getElementById("diceZone");
  const diceFace = document.getElementById("diceFace");
  const rollBtn = document.getElementById("rollBtn");
  const questionArea = document.getElementById("questionArea");

  let names = SA.Names.load("gametheoluot", DEFAULT_NAMES).slice(0, 4);
  if (names.length < 2) names = DEFAULT_NAMES.slice(0, 2);
  let quizPool = SA.Quiz.load("gametheoluot", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let players = [];
  let turnIdx = 0;
  let gameOver = false;
  let rolling = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function isBonusTile(n) { return n > 0 && n < FINAL_TILE && n % 5 === 0; }

  function newQueue() { quizQueue = SA.shuffle(quizPool); quizIndex = 0; }

  function initials(name) {
    const parts = name.trim().split(/\s+/);
    return (parts[parts.length - 1][0] || "?").toUpperCase();
  }

  function renderPlayersBar() {
    playersBar.innerHTML = players.map((p, i) => `
      <div class="player-chip ${i === turnIdx && !gameOver ? "active" : ""}">
        <span class="p-dot" style="background:${p.color};"></span>
        ${escapeHtml(p.name)} — ô ${p.pos}
      </div>`).join("");
  }

  function renderBoard() {
    let html = `<div class="board-tile start"><span class="tile-num">XUẤT PHÁT</span><span class="tile-tag">🏁</span></div>`;
    for (let n = 1; n <= FINAL_TILE; n++) {
      const isFinish = n === FINAL_TILE;
      const bonus = isBonusTile(n);
      const cls = isFinish ? "finish" : (bonus ? "bonus" : "");
      const tag = isFinish ? "🏆" : (bonus ? "💎" : "");
      const tokens = players.filter(p => p.pos === n)
        .map(p => `<span class="token-dot" style="background:${p.color};" title="${escapeHtml(p.name)}">${initials(p.name)}</span>`).join("");
      html += `<div class="board-tile ${cls}">
        <span class="tile-num">${isFinish ? "ĐÍCH" : n}</span>
        <span class="tile-tag">${tag}</span>
        <div class="tile-tokens">${tokens}</div>
      </div>`;
    }
    // players still at start (pos 0)
    const startTokens = players.filter(p => p.pos === 0)
      .map(p => `<span class="token-dot" style="background:${p.color};" title="${escapeHtml(p.name)}">${initials(p.name)}</span>`).join("");
    boardTrack.innerHTML = html;
    const startTile = boardTrack.querySelector(".board-tile.start");
    startTile.insertAdjacentHTML("beforeend", `<div class="tile-tokens">${startTokens}</div>`);
  }

  function refreshAll() { renderPlayersBar(); renderBoard(); }

  function startGame() {
    players = names.map((n, i) => ({ name: n, color: COLORS[i % COLORS.length], pos: 0 }));
    turnIdx = 0;
    gameOver = false;
    rolling = false;
    newQueue();
    diceFace.textContent = "🎲";
    diceFace.classList.remove("rolling");
    rollBtn.disabled = false;
    rollBtn.style.display = "";
    diceZone.style.display = "";
    questionArea.innerHTML = "";
    refreshAll();
    updateTurnBanner();
  }

  function updateTurnBanner() {
    if (gameOver) return;
    turnBanner.textContent = `🎯 Lượt của ${players[turnIdx].name}`;
  }

  function nextTurn() {
    if (gameOver) return;
    turnIdx = (turnIdx + 1) % players.length;
    questionArea.innerHTML = "";
    diceFace.textContent = "🎲";
    diceFace.classList.remove("rolling");
    rollBtn.disabled = false;
    diceZone.style.display = "";
    refreshAll();
    updateTurnBanner();
  }

  function rollDice() {
    if (rolling || gameOver) return;
    rolling = true;
    rollBtn.disabled = true;
    diceFace.classList.add("rolling");
    let ticks = 0;
    const iv = setInterval(() => {
      diceFace.textContent = String(1 + Math.floor(Math.random() * 6));
      ticks++;
      if (ticks > 10) {
        clearInterval(iv);
        diceFace.classList.remove("rolling");
        const value = 1 + Math.floor(Math.random() * 6);
        diceFace.textContent = String(value);
        rolling = false;
        askQuestion(value);
      }
    }, 80);
  }

  function askQuestion(diceValue) {
    if (gameOver) return;
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;

    diceZone.style.display = "none";
    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">${escapeHtml(players[turnIdx].name)} tung được ${diceValue} 🎲 — trả lời đúng để đi ${diceValue} ô!</div>
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

        const player = players[turnIdx];
        if (isCorrect) {
          SA.beep("correct");
          const before = player.pos;
          player.pos = Math.min(FINAL_TILE, player.pos + diceValue);
          refreshAll();
          if (isBonusTile(player.pos) && player.pos !== before) {
            setTimeout(() => {
              SA.toast(`💎 ${player.name} vào ô thưởng! Đi thêm 1 bước.`);
              player.pos = Math.min(FINAL_TILE, player.pos + 1);
              refreshAll();
              setTimeout(() => afterMove(player), 700);
            }, 500);
            return;
          }
          setTimeout(() => afterMove(player), 600);
        } else {
          SA.beep("wrong");
          setTimeout(() => afterMove(player), 800);
        }
      }, { once: true });
    });
  }

  function afterMove(player) {
    if (player.pos >= FINAL_TILE) {
      endGame();
    } else {
      nextTurn();
    }
  }

  function endGame() {
    gameOver = true;
    SA.confetti(140);
    const ranking = players.slice().sort((a, b) => b.pos - a.pos);
    const medals = ["🥇", "🥈", "🥉", "4️⃣"];
    turnBanner.textContent = "Ván đấu kết thúc";
    diceZone.style.display = "none";
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏆</div>
        <h3>${escapeHtml(ranking[0].name)} đã về đích đầu tiên!</h3>
        <div class="podium-list">
          ${ranking.map((p, i) => `
            <div class="podium-row">
              <span>${medals[i] || "🎗️"}</span>
              <span class="p-dot" style="background:${p.color};"></span>
              <span style="flex:1;">${escapeHtml(p.name)}</span>
              <span>Ô ${p.pos}/${FINAL_TILE}</span>
            </div>`).join("")}
        </div>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("namesInput").value = names.join("\n");
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    let newNames = SA.Names.parseText(document.getElementById("namesInput").value).slice(0, 4);
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newNames.length < 2) { SA.toast("Cần ít nhất 2 người chơi/đội!"); return; }
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    names = newNames;
    quizPool = newQuiz;
    SA.Names.save("gametheoluot", names);
    SA.Quiz.save("gametheoluot", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);
  rollBtn.addEventListener("click", rollDice);

  startGame();
})();
