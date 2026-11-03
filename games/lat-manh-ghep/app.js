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
    "Quốc kỳ Việt Nam có mấy cánh sao? | 5 cánh | 4 cánh | 6 cánh | 3 cánh",
    "9 x 9 bằng bao nhiêu? | 81 | 72 | 90 | 63",
    "Châu lục nào lớn nhất thế giới? | Châu Á | Châu Phi | Châu Âu | Châu Mỹ",
    "Loài hoa nào được coi là quốc hoa của Việt Nam? | Hoa Sen | Hoa Đào | Hoa Mai | Hoa Hồng",
  ].join("\n");

  const MYSTERY_PRESETS = [
    { emoji: "🌟", label: "NGÔI SAO TRI THỨC", bg: "radial-gradient(circle at 50% 25%, #4338ca, #1e1b4b 75%)" },
    { emoji: "🦉", label: "CÚ THÔNG THÁI", bg: "radial-gradient(circle at 50% 25%, #78350f, #292524 75%)" },
    { emoji: "🏆", label: "NHÀ VÔ ĐỊCH", bg: "radial-gradient(circle at 50% 25%, #a16207, #292524 75%)" },
    { emoji: "🦋", label: "BƯỚM XINH", bg: "radial-gradient(circle at 50% 25%, #be185d, #1e1b4b 75%)" },
    { emoji: "🚀", label: "CHINH PHỤC ĐỈNH CAO", bg: "radial-gradient(circle at 50% 25%, #0f2447, #060d1e 75%)" },
  ];

  const TOTAL_TILES = 16;
  const lmStage = document.getElementById("lmStage");
  const lmEmoji = document.getElementById("lmEmoji");
  const lmLabel = document.getElementById("lmLabel");
  const lmTiles = document.getElementById("lmTiles");
  const tileCountEl = document.getElementById("tileCount");
  const tileTotalEl = document.getElementById("tileTotal");
  const statusEl = document.getElementById("lmStatus");
  const questionArea = document.getElementById("questionArea");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  let quizPool = SA.Quiz.load("latmanhghep", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let revealedCount = 0;
  let remainingTiles = TOTAL_TILES;
  let pendingReveal = false;
  let gameOver = false;

  function startGame() {
    revealedCount = 0;
    remainingTiles = TOTAL_TILES;
    pendingReveal = false;
    gameOver = false;
    tileCountEl.textContent = 0;
    tileTotalEl.textContent = TOTAL_TILES;
    statusEl.textContent = "Trả lời đúng để lật mở 1 ô!";

    const preset = MYSTERY_PRESETS[Math.floor(Math.random() * MYSTERY_PRESETS.length)];
    lmStage.style.background = preset.bg;
    lmEmoji.textContent = preset.emoji;
    lmLabel.textContent = preset.label;

    lmTiles.className = "lm-tiles";
    lmTiles.innerHTML = "";
    for (let i = 0; i < TOTAL_TILES; i++) {
      const tile = document.createElement("div");
      tile.className = "lm-tile";
      tile.dataset.idx = i;
      tile.textContent = i + 1;
      tile.addEventListener("click", () => onTileClick(tile));
      lmTiles.appendChild(tile);
    }

    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
    nextQuestion();
  }

  function onTileClick(tile) {
    if (!pendingReveal || tile.classList.contains("revealed")) return;
    tile.classList.add("revealed");
    pendingReveal = false;
    lmTiles.classList.remove("pending");
    revealedCount++;
    remainingTiles--;
    tileCountEl.textContent = revealedCount;
    SA.beep("correct");

    if (remainingTiles <= 0) { finishGame(); return; }
    if (quizIndex >= quizQueue.length) { finishGame(); return; }
    setTimeout(nextQuestion, 450);
  }

  function autoRevealRest(callback) {
    const remaining = Array.from(lmTiles.querySelectorAll(".lm-tile:not(.revealed)"));
    if (remaining.length === 0) { callback(); return; }
    remaining.forEach((tile, i) => {
      setTimeout(() => {
        tile.classList.add("revealed");
        revealedCount++;
        remainingTiles--;
        tileCountEl.textContent = revealedCount;
        if (i === remaining.length - 1) setTimeout(callback, 300);
      }, i * 90);
    });
  }

  function finishGame() {
    gameOver = true;
    pendingReveal = false;
    lmTiles.classList.remove("pending");
    statusEl.textContent = "Đang lật nốt các ô còn lại...";
    autoRevealRest(() => {
      SA.confetti(160);
      statusEl.textContent = "🎉 Đã hoàn thành!";
      questionArea.innerHTML = `
        <div class="result-box lm-result">
          <div class="emoji">🖼️</div>
          <h3>Bức tranh đã được hé lộ hoàn toàn!</h3>
          <p>Bạn đã lật mở ${TOTAL_TILES}/${TOTAL_TILES} ô. Rất tuyệt vời!</p>
          <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
        </div>`;
      document.getElementById("playAgainBtn").addEventListener("click", startGame);
    });
  }

  function nextQuestion() {
    if (gameOver) return;
    if (quizIndex >= quizQueue.length) { finishGame(); return; }
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
          pendingReveal = true;
          lmTiles.classList.add("pending");
          statusEl.textContent = "✅ Đúng rồi! Hãy chọn 1 ô trong lưới để lật mở.";
        } else {
          SA.beep("wrong");
          statusEl.textContent = "❌ Chưa đúng — chuyển sang câu tiếp theo...";
          setTimeout(() => {
            if (quizIndex >= quizQueue.length) { finishGame(); return; }
            nextQuestion();
          }, 900);
        }
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
    SA.Quiz.save("latmanhghep", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
