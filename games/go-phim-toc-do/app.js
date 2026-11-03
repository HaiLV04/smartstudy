(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Gõ nhanh đáp án của: 2 + 2 = ? | 4 | 3 | 5",
    "Thủ đô của Việt Nam là? | Hà Nội | Huế | Đà Nẵng",
    "7 x 8 = ? | 56 | 54 | 64",
    "Nước đóng băng ở bao nhiêu độ C? | 0 | 100 | 10",
    "Tác giả Truyện Kiều là ai (viết ngắn gọn họ tên)? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương",
    "Hành tinh gần Mặt Trời nhất là? | Sao Thủy | Sao Kim | Trái Đất",
    "10 - 3 = ? | 7 | 6 | 8",
    "Con vật nào có 8 chân? | Nhện | Kiến | Ong",
  ].join("\n");

  const gamePanel = document.getElementById("gamePanel");
  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");

  let quizPool = SA.Quiz.load("gophimtocdo", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let queue = [];
  let index = 0;
  let score = 0;
  let attempts = 0;
  let times = [];
  let startTime = 0;
  let timerInterval = null;
  let answered = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(index, queue.length)}/${queue.length}`;
    scoreEl.textContent = score;
  }

  function stopTimer() { clearInterval(timerInterval); timerInterval = null; }

  function renderQuestion() {
    if (index >= queue.length) { renderSummary(); return; }
    const item = queue[index];
    index++;
    answered = false;
    updateProgress();

    gamePanel.innerHTML = `
      <div class="type-prompt">${escapeHtml(item.q)}</div>
      <div class="type-timer" id="typeTimer">0.0s</div>
      <form id="typeForm" autocomplete="off">
        <div class="type-input-row">
          <input type="text" id="typeInput" placeholder="Gõ đáp án ở đây..." autocomplete="off" spellcheck="false">
          <button type="submit" class="btn btn-primary" id="submitBtn">Nộp</button>
        </div>
      </form>
      <div class="type-feedback" id="typeFeedback"></div>
    `;

    const timerEl = document.getElementById("typeTimer");
    const input = document.getElementById("typeInput");
    const form = document.getElementById("typeForm");

    startTime = performance.now();
    stopTimer();
    timerInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      timerEl.textContent = elapsed.toFixed(1) + "s";
    }, 100);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitAnswer(item, input.value);
    });

    input.focus();
  }

  function submitAnswer(item, typedRaw) {
    if (answered) return;
    answered = true;
    stopTimer();
    const elapsed = (performance.now() - startTime) / 1000;
    const typed = String(typedRaw).trim();
    const correctText = item.options[item.correct];
    const isCorrect = typed.length > 0 && typed.toLowerCase() === correctText.trim().toLowerCase();
    attempts++;

    const input = document.getElementById("typeInput");
    const submitBtn = document.getElementById("submitBtn");
    const feedback = document.getElementById("typeFeedback");
    if (input) input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (isCorrect) {
      score++;
      times.push(elapsed);
      SA.beep("correct");
      SA.confetti(50);
      feedback.className = "type-feedback ok";
      feedback.textContent = `✅ Chính xác! Thời gian: ${elapsed.toFixed(2)}s`;
    } else {
      SA.beep("wrong");
      feedback.className = "type-feedback bad";
      feedback.textContent = `❌ Chưa đúng. Đáp án đúng: "${correctText}" — Thời gian: ${elapsed.toFixed(2)}s`;
    }
    updateProgress();

    const nextLabel = index >= queue.length ? "📊 Xem kết quả" : "➡️ Câu tiếp theo";
    feedback.insertAdjacentHTML("afterend", `
      <div class="type-footer"><button class="btn btn-primary btn-lg" id="nextBtn">${nextLabel}</button></div>
    `);
    document.getElementById("nextBtn").addEventListener("click", renderQuestion);
  }

  function renderSummary() {
    const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : "—";
    gamePanel.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏁</div>
        <h3>Hoàn thành thử thách!</h3>
        <div class="summary-grid">
          <div class="summary-tile"><b>${score}</b><span>Câu trả lời đúng</span></div>
          <div class="summary-tile"><b>${attempts}</b><span>Tổng số câu</span></div>
          <div class="summary-tile"><b>${avg}${times.length ? "s" : ""}</b><span>Thời gian TB / câu đúng</span></div>
        </div>
        <button class="btn btn-primary btn-lg" id="restartBtn">🔄 Chơi lại</button>
      </div>
    `;
    document.getElementById("restartBtn").addEventListener("click", startGame);
  }

  function startGame() {
    score = 0;
    attempts = 0;
    times = [];
    queue = SA.shuffle(quizPool);
    index = 0;
    stopTimer();
    updateProgress();
    renderQuestion();
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("gophimtocdo", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    stopTimer();
    startGame();
  });

  document.getElementById("startBtn").addEventListener("click", startGame);
  updateProgress();
})();
