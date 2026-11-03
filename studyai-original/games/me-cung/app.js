(() => {
  const DEFAULT_QUIZ_TEXT = [
    "5 x 8 = ? | 40 | 45 | 35 | 48",
    "Việt Nam nằm ở khu vực nào của châu Á? | Đông Nam Á | Đông Á | Nam Á | Tây Á",
    "Từ nào là danh từ trong câu 'Con mèo chạy nhanh'? | Con mèo | Chạy | Nhanh | Con",
    "Nước sôi ở bao nhiêu độ C (ở áp suất thường)? | 100 độ C | 0 độ C | 90 độ C | 120 độ C",
    "63 : 9 = ? | 7 | 8 | 6 | 9",
    "Ai là vị vua đầu tiên của nhà Nguyễn? | Gia Long | Minh Mạng | Tự Đức | Bảo Đại",
    "Núi nào cao nhất Việt Nam? | Fansipan | Bạch Mã | Yên Tử | Ba Vì",
    "12 + 9 x 2 = ? | 30 | 42 | 24 | 21",
    "Cây xanh hấp thụ khí gì để quang hợp? | Khí CO2 | Khí O2 | Khí N2 | Khí H2",
    "Châu lục nào lớn nhất thế giới? | Châu Á | Châu Phi | Châu Âu | Châu Mỹ",
  ].join("\n");

  // 3 sơ đồ mê cung 9x9 đã kiểm tra luôn có đường đi từ (0,0) đến (8,8).
  // '.' = đường đi, '#' = tường.
  const MAZES = [
    [".......#.", "######.#.", "...#...#.", "##.#.###.", "...#...#.", ".#####.#.", ".......#.", ".#######.", "........."],
    [".......#.", "######.#.", "...#...#.", ".#.#.###.", ".#...#...", ".#######.", ".#.......", ".#####.#.", ".......#."],
    [".#.......", ".#####.#.", "...#...#.", "##.#.####", "...#.#...", ".###.#.#.", ".#.....#.", ".#######.", "........."],
  ];
  const SIZE = 9;

  const mazeGrid = document.getElementById("mazeGrid");
  const questionArea = document.getElementById("questionArea");
  const dpad = document.getElementById("dpad");
  const moveHint = document.getElementById("moveHint");
  const stepCountEl = document.getElementById("stepCount");
  const correctCountEl = document.getElementById("correctCount");

  let quizPool = SA.Quiz.load("mecung", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let maze = MAZES[0];
  let pos = { r: 0, c: 0 };
  let visited = new Set();
  let stepCount = 0;
  let correctCount = 0;
  let gameOver = false;
  let awaitingDirection = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function isWall(r, c) {
    if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return true;
    return maze[r][c] === "#";
  }

  function key(r, c) { return r + "," + c; }

  function newQueue() { quizQueue = SA.shuffle(quizPool); quizIndex = 0; }

  function renderMaze() {
    mazeGrid.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("div");
        let cls = "maze-cell";
        const wall = maze[r][c] === "#";
        if (wall) cls += " wall";
        else cls += " path";
        if (!wall && visited.has(key(r, c))) cls += " visited";
        if (r === SIZE - 1 && c === SIZE - 1) cls += " end-cell";
        let icon = "";
        if (r === SIZE - 1 && c === SIZE - 1) icon = "🏁";
        if (r === pos.r && c === pos.c) { cls += " current"; icon = "🧑‍🎓"; }
        cell.className = cls;
        cell.textContent = icon;
        mazeGrid.appendChild(cell);
      }
    }
  }

  function updateScoreboard() {
    stepCountEl.textContent = String(stepCount);
    correctCountEl.textContent = String(correctCount);
  }

  function setDpadEnabled(enabled) {
    const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    dpad.querySelectorAll(".dpad-btn").forEach(btn => {
      const dir = btn.dataset.dir;
      const [dr, dc] = dirs[dir];
      const canGo = enabled && !isWall(pos.r + dr, pos.c + dc);
      btn.disabled = !canGo;
    });
  }

  function startGame() {
    maze = MAZES[Math.floor(Math.random() * MAZES.length)];
    pos = { r: 0, c: 0 };
    visited = new Set([key(0, 0)]);
    stepCount = 0;
    correctCount = 0;
    gameOver = false;
    awaitingDirection = false;
    newQueue();
    updateScoreboard();
    renderMaze();
    setDpadEnabled(false);
    moveHint.textContent = "";
    askQuestion();
  }

  function askQuestion() {
    if (gameOver) return;
    awaitingDirection = false;
    setDpadEnabled(false);
    moveHint.textContent = "";
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">Trả lời đúng để mở đường đi tiếp theo</div>
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
          correctCount++;
          updateScoreboard();
          const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
          const hasMove = Object.values(dirs).some(([dr, dc]) => !isWall(pos.r + dr, pos.c + dc));
          if (!hasMove) {
            // Không có hướng hợp lệ (không nên xảy ra trong mê cung liên thông) — an toàn: hỏi câu khác.
            moveHint.textContent = "Không có lối đi — thử câu hỏi khác!";
            setTimeout(askQuestion, 1000);
            return;
          }
          awaitingDirection = true;
          setDpadEnabled(true);
          moveHint.textContent = "🎉 Chính xác! Chọn hướng để di chuyển →";
        } else {
          SA.beep("wrong");
          moveHint.textContent = "Chưa đúng, thử câu khác nhé!";
          setTimeout(askQuestion, 1100);
        }
      }, { once: true });
    });
  }

  function move(dir) {
    if (!awaitingDirection || gameOver) return;
    const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
    const [dr, dc] = dirs[dir];
    const nr = pos.r + dr, nc = pos.c + dc;
    if (isWall(nr, nc)) return;
    pos = { r: nr, c: nc };
    visited.add(key(nr, nc));
    stepCount++;
    updateScoreboard();
    renderMaze();
    setDpadEnabled(false);
    awaitingDirection = false;
    moveHint.textContent = "";

    if (pos.r === SIZE - 1 && pos.c === SIZE - 1) {
      winGame();
    } else {
      setTimeout(askQuestion, 400);
    }
  }

  function winGame() {
    gameOver = true;
    SA.confetti(140);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏁</div>
        <h3>Chúc mừng! Đã thoát khỏi mê cung!</h3>
        <p>Đã đi ${stepCount} bước và trả lời đúng ${correctCount} câu hỏi để tìm đường ra.</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  dpad.querySelectorAll(".dpad-btn").forEach(btn => {
    btn.addEventListener("click", () => move(btn.dataset.dir));
  });

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 2) { SA.toast("Cần ít nhất 2 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("mecung", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu mê cung mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
