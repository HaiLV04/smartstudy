(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Đà Nẵng | Huế",
    "7 x 8 = ? | 56 | 54 | 64 | 48",
    "Hành tinh nào được gọi là Hành tinh Đỏ? | Sao Hoả | Sao Kim | Sao Thổ | Sao Mộc",
    "Tác giả của truyện Kiều là ai? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Tố Hữu",
    "Sông nào dài nhất Việt Nam? | Sông Mê Kông | Sông Hồng | Sông Đà | Sông Mã",
    "Nước đóng băng ở nhiệt độ nào? | 0°C | 100°C | -10°C | 10°C",
    "Từ nào là tính từ trong câu 'Bông hoa rất đẹp'? | Đẹp | Bông | Hoa | Rất",
    "1 giờ có bao nhiêu phút? | 60 phút | 100 phút | 24 phút | 30 phút",
  ].join("\n");

  const LETTERS = ["A", "B", "C", "D"];

  const questionText = document.getElementById("questionText");
  const questionArea = document.getElementById("questionArea");
  const qProgressEl = document.getElementById("qProgress");

  function toExactly4(items) {
    const kept = [];
    let dropped = 0;
    items.forEach(it => {
      if (!it.options || it.options.length < 4) { dropped++; return; }
      const correctText = it.options[it.correct];
      const opts = it.options.slice(0, 4);
      let correctIdx = opts.indexOf(correctText);
      if (correctIdx === -1) { opts[0] = correctText; correctIdx = 0; }
      kept.push({ q: it.q, options: opts, correct: correctIdx });
    });
    return { kept, dropped };
  }

  let quizPool = toExactly4(SA.Quiz.load("che-do-giay", SA.Quiz.parse(DEFAULT_QUIZ_TEXT))).kept;
  if (quizPool.length < 1) quizPool = toExactly4(SA.Quiz.parse(DEFAULT_QUIZ_TEXT)).kept;

  let quizQueue = [];
  let quizIndex = 0;
  let currentItem = null;
  let counts = [0, 0, 0, 0];
  let finalized = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function syncCountDisplays() {
    LETTERS.forEach((_, i) => {
      const input = document.getElementById("countInput" + i);
      if (input) input.value = counts[i];
    });
  }

  function renderQuestion() {
    if (quizIndex >= quizQueue.length) {
      questionText.textContent = "";
      questionArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">🗳️</div>
          <h3>Đã hoàn thành hết bộ câu hỏi kiểm phiếu!</h3>
          <p>Bạn có thể bấm "Chơi lại" để bắt đầu vòng kiểm phiếu mới.</p>
          <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
        </div>`;
      document.getElementById("playAgainBtn").addEventListener("click", startGame);
      return;
    }
    finalized = false;
    counts = [0, 0, 0, 0];
    currentItem = SA.Quiz.shuffled([quizQueue[quizIndex]])[0];
    updateProgress();

    questionText.textContent = currentItem.q;
    questionArea.innerHTML = `
      <div class="tally-grid" id="tallyGrid">
        ${currentItem.options.map((opt, i) => `
          <div class="tally-card" data-idx="${i}">
            <div class="tally-letter">${LETTERS[i]}</div>
            <div class="tally-opt-text">${escapeHtml(opt)}</div>
            <input type="number" min="0" step="1" class="tally-count-input" id="countInput${i}" value="0">
            <button class="btn btn-outline tally-tap-btn" data-tap="${i}">👆 +1 thẻ</button>
          </div>`).join("")}
      </div>
      <div class="tally-actions">
        <button class="btn btn-primary btn-lg" id="finalizeBtn">✅ Chốt kết quả</button>
      </div>`;

    LETTERS.forEach((_, i) => {
      const input = document.getElementById("countInput" + i);
      input.addEventListener("input", () => {
        let v = parseInt(input.value, 10);
        if (isNaN(v) || v < 0) v = 0;
        counts[i] = v;
      });
    });
    questionArea.querySelectorAll("[data-tap]").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.tap);
        counts[i]++;
        syncCountDisplays();
      });
    });
    document.getElementById("finalizeBtn").addEventListener("click", finalizeTally);
  }

  function finalizeTally() {
    if (finalized) return;
    finalized = true;
    syncCountDisplays();
    const total = counts.reduce((a, b) => a + b, 0);
    const maxCount = Math.max(1, ...counts);
    const correctCount = counts[currentItem.correct] || 0;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    document.querySelectorAll(".tally-card").forEach(card => {
      const i = Number(card.dataset.idx);
      card.classList.add("revealed");
      card.classList.add(i === currentItem.correct ? "correct-card" : "wrong-card");
      const input = document.getElementById("countInput" + i);
      if (input) input.disabled = true;
    });
    document.querySelectorAll("[data-tap]").forEach(btn => btn.disabled = true);
    document.getElementById("finalizeBtn").remove();

    if (total > 0 && pct >= 50) { SA.beep("correct"); SA.confetti(50); }
    else SA.beep("wrong");

    const chartHtml = `
      <div class="barchart">
        ${LETTERS.map((letter, i) => {
          const widthPct = Math.round((counts[i] / maxCount) * 100);
          const isCorrect = i === currentItem.correct;
          return `
          <div class="barchart-row">
            <div class="barchart-label">${letter}</div>
            <div class="barchart-track"><div class="barchart-fill ${isCorrect ? "correct-fill" : ""}" style="width:${widthPct}%;"></div></div>
            <div class="barchart-val">${counts[i]}</div>
          </div>`;
        }).join("")}
      </div>
      <div class="cdg-summary">
        Đáp án đúng: <b>${LETTERS[currentItem.correct]}. ${escapeHtml(currentItem.options[currentItem.correct])}</b><br>
        ${total > 0 ? `${correctCount}/${total} học sinh giơ đúng thẻ (${pct}%)` : "Chưa ghi nhận số liệu nào."}
      </div>
      <div class="tally-actions">
        <button class="btn btn-primary btn-lg" id="nextQBtn">➡️ Câu tiếp theo</button>
      </div>`;
    questionArea.insertAdjacentHTML("beforeend", chartHtml);
    quizIndex++;
    updateProgress();
    document.getElementById("nextQBtn").addEventListener("click", renderQuestion);
  }

  function startGame() {
    newQueue();
    updateProgress();
    renderQuestion();
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const parsed = SA.Quiz.parse(document.getElementById("quizInput").value);
    const { kept, dropped } = toExactly4(parsed);
    if (kept.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi có đủ 4 đáp án!"); return; }
    quizPool = kept;
    SA.Quiz.save("che-do-giay", quizPool);
    SA.closeModal("settingsModal");
    SA.toast(dropped > 0 ? `Đã lưu! Bỏ qua ${dropped} câu không đủ 4 đáp án.` : "Đã lưu! Bắt đầu vòng mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
