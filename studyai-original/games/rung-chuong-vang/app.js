(() => {
  const DEFAULT_QUIZ_TEXT = [
    "5 + 7 = ? | 12 | 13 | 11 | 10",
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Đà Nẵng | Huế",
    "Nước chiếm bao nhiêu % bề mặt Trái Đất? | 71% | 50% | 90% | 60%",
    "Ai là tác giả truyện Kiều? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Tố Hữu",
    "9 x 8 = ? | 72 | 64 | 81 | 76",
    "Hành tinh nào gần Mặt Trời nhất? | Sao Thuỷ | Sao Kim | Trái Đất | Sao Hoả",
    "Việt Nam có bao nhiêu mùa trong năm (miền Bắc)? | 4 | 2 | 3 | 5",
    "Đơn vị đo cường độ dòng điện là gì? | Ampe | Vôn | Oát | Ôm",
    "16 : 4 x 3 = ? | 12 | 9 | 16 | 4",
    "Ai là vị vua đầu tiên của nhà Nguyễn? | Gia Long | Minh Mạng | Tự Đức | Bảo Đại",
    "Chất nào cần thiết cho quang hợp cùng nước và ánh sáng? | Khí CO2 | Khí Oxi | Khí Nitơ | Khí Hidro",
    "100 - 37 = ? | 63 | 67 | 73 | 57",
    "Dãy núi nào dài nhất Việt Nam? | Trường Sơn | Hoàng Liên Sơn | Bạch Mã | Tam Đảo",
    "Số nguyên tố nhỏ nhất là số nào? | 2 | 1 | 0 | 3",
    "Hồ nào lớn nhất Việt Nam (hồ tự nhiên)? | Hồ Ba Bể | Hồ Tây | Hồ Gươm | Hồ Xuân Hương",
  ].join("\n");

  const DEFAULT_START = 30;

  const roundVal = document.getElementById("roundVal");
  const remainVal = document.getElementById("remainVal");
  const questionArea = document.getElementById("questionArea");

  let quizPool = SA.Quiz.load("rung-chuong-vang", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let startCount = Number(localStorage.getItem("sa_rcv_startCount")) || DEFAULT_START;
  let quizQueue = [];
  let roundIdx = 0;
  let remaining = startCount;
  let gameOver = false;
  let revealed = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateBoard() {
    roundVal.textContent = `${Math.min(roundIdx + 1, quizQueue.length)}/${quizQueue.length}`;
    remainVal.textContent = remaining;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    roundIdx = 0;
  }

  function startGame() {
    remaining = startCount;
    gameOver = false;
    newQueue();
    updateBoard();
    askQuestion();
  }

  function noSurvivors() {
    gameOver = true;
    questionArea.innerHTML = `
      <div class="rcv-final">
        <div class="emoji">😢</div>
        <h3>Chưa ai về đích...</h3>
        <p>Tất cả học sinh đã bị loại ở vòng ${roundIdx}. Cùng ôn lại kiến thức và thử sức lần nữa nhé!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function goldenBell() {
    gameOver = true;
    SA.confetti(150);
    questionArea.innerHTML = `
      <div class="rcv-final win">
        <div class="emoji">🔔</div>
        <h3>Rung chuông vàng!</h3>
        <p>${remaining} học sinh đã xuất sắc vượt qua toàn bộ ${quizQueue.length} câu hỏi và giành vòng nguyệt quế!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function askQuestion() {
    if (gameOver) return;
    if (roundIdx >= quizQueue.length) { goldenBell(); return; }
    revealed = false;
    const raw = quizQueue[roundIdx];
    const item = SA.Quiz.shuffled([raw])[0];
    updateBoard();

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">Vòng ${roundIdx + 1}/${quizQueue.length} — còn ${remaining} học sinh</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="rcv-options">
          ${item.options.map((opt, i) => `
            <div class="rcv-opt" data-idx="${i}">
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </div>`).join("")}
        </div>
        <div style="text-align:center; margin-top:26px;">
          <button class="btn btn-primary btn-lg" id="revealBtn">🔔 Hiện đáp án đúng</button>
        </div>
      </div>`;

    document.getElementById("revealBtn").addEventListener("click", () => {
      if (revealed) return;
      revealed = true;
      SA.beep("correct");
      const correctEl = questionArea.querySelector(`.rcv-opt[data-idx="${item.correct}"]`);
      if (correctEl) correctEl.classList.add("revealed-correct");
      showConfirmBox();
    });
  }

  function showConfirmBox() {
    const box = document.createElement("div");
    box.className = "rcv-confirm-box";
    box.innerHTML = `
      <label class="field-label">Có bao nhiêu học sinh trả lời ĐÚNG ở vòng này? (tối đa ${remaining})</label>
      <input type="number" id="correctCountInput" min="0" max="${remaining}" value="${remaining}">
      <p class="field-hint">Số này sẽ trở thành số học sinh còn lại bước vào vòng sau.</p>
      <button class="btn btn-primary btn-lg" id="confirmCountBtn" style="margin-top:12px;">✅ Xác nhận & câu tiếp theo</button>
    `;
    questionArea.appendChild(box);
    const input = document.getElementById("correctCountInput");
    input.focus();
    input.select();

    document.getElementById("confirmCountBtn").addEventListener("click", () => {
      let val = Math.round(Number(input.value));
      if (Number.isNaN(val) || val < 0) val = 0;
      if (val > remaining) val = remaining;
      remaining = val;
      roundIdx++;
      updateBoard();
      if (remaining <= 0) { noSurvivors(); return; }
      askQuestion();
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    document.getElementById("startCountInput").value = startCount;
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 2) { SA.toast("Cần ít nhất 2 câu hỏi hợp lệ!"); return; }
    let sc = Math.round(Number(document.getElementById("startCountInput").value));
    if (Number.isNaN(sc) || sc < 1) sc = DEFAULT_START;
    quizPool = newQuiz;
    startCount = sc;
    SA.Quiz.save("rung-chuong-vang", quizPool);
    localStorage.setItem("sa_rcv_startCount", String(startCount));
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
