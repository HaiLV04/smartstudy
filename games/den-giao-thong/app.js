(() => {
  // Định dạng riêng cho game này (không dùng SA.Quiz.parse vì đây là câu Đúng/Sai, không phải trắc nghiệm 4 đáp án):
  // "Nội dung phát biểu | true" hoặc "Nội dung phát biểu | false" — mỗi dòng 1 câu.
  const DEFAULT_TF_TEXT = [
    "Số 7 là một số nguyên tố. | true",
    "Việt Nam có 54 dân tộc anh em. | true",
    "Mặt Trời quay quanh Trái Đất. | false",
    "Nước sôi ở 100 độ C khi ở áp suất bình thường. | true",
    "Hà Nội là thủ đô của Việt Nam. | true",
    "Một tuần có 8 ngày. | false",
    "Cá voi là một loài cá. | false",
    "Chủ tịch Hồ Chí Minh sinh năm 1890. | true",
    "Hình vuông có 4 cạnh bằng nhau. | true",
    "10 cộng 15 bằng 35. | false",
  ].join("\n");

  const ROUND_MS = 4000;
  const GREEN_UNTIL = 0.55;
  const YELLOW_UNTIL = 0.22;

  const bulbRed = document.getElementById("bulbRed");
  const bulbYellow = document.getElementById("bulbYellow");
  const bulbGreen = document.getElementById("bulbGreen");
  const countdownBar = document.getElementById("countdownBar");
  const questionArea = document.getElementById("questionArea");
  const gamePanel = document.getElementById("gamePanel");
  const scoreStat = document.getElementById("scoreStat");
  const qStat = document.getElementById("qStat");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function parseTF(text) {
    return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const idx = line.lastIndexOf("|");
      if (idx < 0) return null;
      const stmt = line.slice(0, idx).trim();
      const ansRaw = line.slice(idx + 1).trim().toLowerCase();
      if (!stmt) return null;
      return { text: stmt, answer: ansRaw === "true" };
    }).filter(Boolean);
  }

  function serializeTF(items) {
    return items.map(it => `${it.text} | ${it.answer ? "true" : "false"}`).join("\n");
  }

  let tfPool = SA.Quiz.load("dengiaothong", parseTF(DEFAULT_TF_TEXT));
  let tfQueue = [];
  let tfIndex = 0;
  let score = 0;
  let gameOver = false;
  let answered = false;
  let timerStart = 0;
  let rafId = null;

  function newQueue() { tfQueue = SA.shuffle(tfPool); tfIndex = 0; }

  function updateStats() {
    scoreStat.textContent = score;
    qStat.textContent = `${Math.min(tfIndex, tfQueue.length)}/${tfQueue.length}`;
  }

  function setPhase(fraction) {
    bulbGreen.classList.toggle("active", fraction > GREEN_UNTIL);
    bulbYellow.classList.toggle("active", fraction <= GREEN_UNTIL && fraction > YELLOW_UNTIL);
    bulbRed.classList.toggle("active", fraction <= YELLOW_UNTIL);
    const color = fraction > GREEN_UNTIL ? "var(--success)" : fraction > YELLOW_UNTIL ? "#facc15" : "var(--danger)";
    countdownBar.style.background = color;
    countdownBar.style.width = Math.max(0, fraction * 100) + "%";
  }

  function stopTimer() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function startTimer(onTimeout) {
    stopTimer();
    timerStart = performance.now();
    function tick(now) {
      const elapsed = now - timerStart;
      const fraction = Math.max(0, 1 - elapsed / ROUND_MS);
      setPhase(fraction);
      if (fraction <= 0) { stopTimer(); onTimeout(); return; }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function startGame() {
    score = 0; gameOver = false;
    newQueue();
    updateStats();
    if (tfQueue.length === 0) {
      questionArea.innerHTML = `<div class="empty-state"><div class="emoji">🚦</div><p>Chưa có phát biểu nào. Hãy soạn câu hỏi trong phần Cài đặt.</p></div>`;
      countdownBar.style.width = "0%";
      return;
    }
    nextStatement();
  }

  function endGame() {
    gameOver = true;
    stopTimer();
    setPhase(0);
    const pct = Math.round((score / tfQueue.length) * 100);
    SA.confetti(score >= tfQueue.length * 0.6 ? 100 : 40);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🚦</div>
        <h3>Hoàn thành!</h3>
        <p>Bạn trả lời đúng ${score}/${tfQueue.length} câu (${pct}%). ${pct >= 80 ? "Xuất sắc!" : pct >= 50 ? "Khá tốt, cố gắng thêm nhé!" : "Cùng luyện tập thêm nào!"}</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function nextStatement() {
    if (gameOver) return;
    if (tfIndex >= tfQueue.length) { endGame(); return; }
    answered = false;
    const item = tfQueue[tfIndex];

    questionArea.innerHTML = `
      <div class="statement-box">
        <div class="question-progress">Câu ${tfIndex + 1}/${tfQueue.length}</div>
        <div class="statement-text">${escapeHtml(item.text)}</div>
        <div class="tf-actions">
          <button class="btn tf-btn tf-true" data-val="true">🟢 Đúng</button>
          <button class="btn tf-btn tf-false" data-val="false">🔴 Sai</button>
        </div>
      </div>`;

    const trueBtn = questionArea.querySelector('[data-val="true"]');
    const falseBtn = questionArea.querySelector('[data-val="false"]');

    function lockButtons() {
      trueBtn.disabled = true;
      falseBtn.disabled = true;
    }

    function resolveRound(userAnswer) {
      if (answered) return;
      answered = true;
      stopTimer();
      lockButtons();
      const isCorrect = userAnswer !== null && userAnswer === item.answer;
      const pickedBtn = userAnswer === true ? trueBtn : userAnswer === false ? falseBtn : null;
      if (isCorrect) {
        score++;
        SA.beep("correct");
        gamePanel.classList.add("flash-correct");
        if (pickedBtn) pickedBtn.classList.add("picked-correct");
      } else {
        SA.beep("wrong");
        gamePanel.classList.add("flash-wrong");
        if (pickedBtn) pickedBtn.classList.add("picked-wrong");
        const correctBtn = item.answer === true ? trueBtn : falseBtn;
        correctBtn.classList.add("picked-correct");
      }
      updateStats();
      setTimeout(() => {
        gamePanel.classList.remove("flash-correct", "flash-wrong");
        tfIndex++;
        nextStatement();
      }, 950);
    }

    trueBtn.addEventListener("click", () => resolveRound(true), { once: true });
    falseBtn.addEventListener("click", () => resolveRound(false), { once: true });

    startTimer(() => resolveRound(null));
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("tfInput").value = serializeTF(tfPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newPool = parseTF(document.getElementById("tfInput").value);
    if (newPool.length < 2) { SA.toast("Cần ít nhất 2 phát biểu hợp lệ!"); return; }
    tfPool = newPool;
    SA.Quiz.save("dengiaothong", tfPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
