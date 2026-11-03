(() => {
  const DEFAULT_CODE = "HOCSINH";
  const DEFAULT_QUIZ_TEXT = [
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Đà Nẵng | Huế",
    "5 + 7 = ? | 12 | 11 | 13 | 10",
    "Hành tinh nào gần Mặt Trời nhất? | Sao Thủy | Sao Kim | Trái Đất | Sao Hoả",
    "Tác giả của Truyện Kiều là ai? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Tố Hữu",
    "Nước nào có diện tích lớn nhất thế giới? | Nga | Trung Quốc | Canada | Mỹ",
    "Số nào là số nguyên tố? | 7 | 8 | 9 | 10",
    "Con vật nào được gọi là chúa tể sơn lâm? | Hổ | Voi | Gấu | Sói",
    "1 giờ có bao nhiêu phút? | 60 | 100 | 24 | 30",
    "Quốc hoa của Việt Nam là hoa gì? | Hoa sen | Hoa đào | Hoa mai | Hoa hồng",
    "9 x 3 = ? | 27 | 24 | 21 | 18",
  ].join("\n");

  const lockDisplay = document.getElementById("lockDisplay");
  const quizArea = document.getElementById("quizArea");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");

  function loadCode() {
    try {
      const raw = localStorage.getItem("sa_khoabimat_code");
      return raw && raw.trim() ? raw.trim() : DEFAULT_CODE;
    } catch (e) { return DEFAULT_CODE; }
  }
  function saveCode(code) { localStorage.setItem("sa_khoabimat_code", code); }

  let secretCode = loadCode();
  let quizPool = SA.Quiz.load("khoabimat", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let codeChars = [];
  let revealedFlags = [];
  let quizQueue = [];
  let quizIndex = 0;
  let gameWon = false;
  let started = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function setupCode() {
    codeChars = secretCode.split("");
    revealedFlags = codeChars.map(() => false);
  }

  function totalLockable() { return codeChars.filter(c => c !== " ").length; }
  function revealedCount() { return codeChars.reduce((acc, c, i) => acc + (c !== " " && revealedFlags[i] ? 1 : 0), 0); }
  function isFullyRevealed() { return totalLockable() > 0 && revealedCount() === totalLockable(); }

  function revealNext() {
    for (let i = 0; i < codeChars.length; i++) {
      if (codeChars[i] !== " " && !revealedFlags[i]) { revealedFlags[i] = true; return true; }
    }
    return false;
  }

  function drawLock() {
    lockDisplay.innerHTML = codeChars.map((c, i) => {
      if (c === " ") return `<div class="lock-spacer"></div>`;
      const revealed = revealedFlags[i];
      return `<div class="lock-box ${revealed ? "revealed" : ""}">${revealed ? escapeHtml(c.toUpperCase()) : "•"}</div>`;
    }).join("");
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreEl.textContent = `${revealedCount()}/${totalLockable()}`;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function showWinScreen() {
    gameWon = true;
    quizArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🔓</div>
        <h3>Đã mở khoá!</h3>
        <div class="win-code">${escapeHtml(secretCode.toUpperCase())}</div>
        <p>Chúc mừng cả lớp đã phá giải thành công mã bí mật!</p>
        <button class="btn btn-primary btn-lg" id="restartBtn">🔄 Chơi lại</button>
      </div>
    `;
    document.getElementById("restartBtn").addEventListener("click", startGame);
    SA.confetti(160);
  }

  function askQuestion() {
    if (gameWon) return;
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;
    updateProgress();

    const keys = ["A", "B", "C", "D", "E", "F"];
    quizArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">Câu hỏi ${quizIndex}/${quizQueue.length}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid">
          ${item.options.map((opt, i) => `
            <button class="answer-btn" data-idx="${i}">
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </button>`).join("")}
        </div>
      </div>`;

    quizArea.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        const isCorrect = idx === item.correct;
        quizArea.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });

        if (isCorrect) {
          revealNext();
          drawLock();
          SA.beep("correct");
          SA.confetti(40);
        } else {
          SA.beep("wrong");
        }
        updateProgress();

        if (isFullyRevealed()) {
          setTimeout(showWinScreen, 900);
          return;
        }

        const nextBtnHtml = `<div class="khoa-footer" style="margin-top:18px;">
          <button class="btn btn-primary btn-lg" id="nextQBtn">➡️ Câu tiếp theo</button>
        </div>`;
        quizArea.insertAdjacentHTML("beforeend", nextBtnHtml);
        document.getElementById("nextQBtn").addEventListener("click", askQuestion);
      }, { once: true });
    });
  }

  function startGame() {
    started = true;
    gameWon = false;
    setupCode();
    newQueue();
    drawLock();
    updateProgress();
    askQuestion();
  }

  document.getElementById("startBtn").addEventListener("click", startGame);

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("codeInput").value = secretCode;
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newCode = document.getElementById("codeInput").value.trim();
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newCode.length < 2) { SA.toast("Mã bí mật cần ít nhất 2 ký tự!"); return; }
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    secretCode = newCode;
    quizPool = newQuiz;
    saveCode(secretCode);
    SA.Quiz.save("khoabimat", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  setupCode();
  drawLock();
  updateProgress();
})();
