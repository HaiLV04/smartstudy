(() => {
  const DEFAULT_QUIZ_TEXT = [
    "2 + 2 = ? | 4 | 3 | 5 | 6",
    "Con vật nào được gọi là chúa tể sơn lâm? | Hổ | Voi | Sư tử | Gấu",
    "Việt Nam có bao nhiêu mùa ở miền Bắc? | 4 | 2 | 3 | 5",
    "7 x 6 = ? | 42 | 36 | 48 | 40",
    "Thủ đô của Nhật Bản là gì? | Tokyo | Osaka | Kyoto | Seoul",
    "Ai là tác giả của bài thơ 'Lượm'? | Tố Hữu | Xuân Diệu | Huy Cận | Nguyễn Du",
    "Công thức hoá học của nước là gì? | H2O | CO2 | O2 | NaCl",
    "Dòng sông nào dài nhất thế giới? | Sông Nile | Sông Amazon | Sông Mê Kông | Sông Trường Giang",
    "Định luật bảo toàn năng lượng thuộc lĩnh vực nào? | Vật lý | Hoá học | Sinh học | Địa lý",
    "1 giờ có bao nhiêu giây? | 3600 | 60 | 1000 | 600",
    "Núi nào cao nhất thế giới? | Everest | Fansipan | K2 | Kilimanjaro",
    "Trong Toán học, số Pi xấp xỉ bằng bao nhiêu? | 3.14 | 2.71 | 1.61 | 3.41",
  ].join("\n");

  const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000];
  const N = LADDER.length;

  const ladderEl = document.getElementById("ladderEl");
  const questionArea = document.getElementById("questionArea");
  const btn5050 = document.getElementById("btn5050");
  const btnPhone = document.getElementById("btnPhone");
  const btnAudience = document.getElementById("btnAudience");

  let quizPool = SA.Quiz.load("ai-la-trieu-phu", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let ladderQueue = [];
  let currentIdx = 0;
  let gameOver = false;
  let answered = false;
  let usedLifelines = { fifty: false, phone: false, audience: false };
  let eliminatedIdx = [];

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function fmtPoints(n) {
    return n.toLocaleString("vi-VN") + " điểm";
  }

  function buildQueue() {
    let pool = SA.shuffle(quizPool);
    if (pool.length < N) {
      const original = pool.slice();
      let padded = false;
      while (pool.length < N) {
        pool = pool.concat(original);
        padded = true;
      }
      pool = pool.slice(0, N);
      if (padded) SA.toast("⚠️ Chưa đủ 10 câu, một số câu sẽ được lặp lại để đủ nấc thang.");
    } else {
      pool = pool.slice(0, N);
    }
    ladderQueue = pool;
  }

  function renderLadder() {
    ladderEl.innerHTML = "";
    for (let i = 0; i < N; i++) {
      const row = document.createElement("div");
      let cls = "tp-rung";
      if (i < currentIdx) cls += " done";
      else if (i === currentIdx) cls += " current";
      row.className = cls;
      row.innerHTML = `<span class="num">Câu ${i + 1}</span><span>${fmtPoints(LADDER[i])}</span>`;
      ladderEl.appendChild(row);
    }
  }

  function resetLifelines() {
    usedLifelines = { fifty: false, phone: false, audience: false };
    btn5050.disabled = false;
    btnPhone.disabled = false;
    btnAudience.disabled = false;
    btn5050.textContent = "🎯 50:50";
    btnPhone.textContent = "📞 Gọi điện thoại";
    btnAudience.textContent = "🙋 Hỏi ý kiến lớp";
  }

  function startGame() {
    currentIdx = 0;
    gameOver = false;
    buildQueue();
    resetLifelines();
    renderLadder();
    askQuestion();
  }

  function endGame(won) {
    gameOver = true;
    let wonAmount = 0;
    if (won) {
      wonAmount = LADDER[N - 1];
      SA.confetti(160);
      questionArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">👑</div>
          <h3>Chúc mừng — Triệu phú tri thức!</h3>
          <p>Đã trả lời đúng toàn bộ ${N} câu hỏi và chinh phục mốc ${fmtPoints(wonAmount)}!</p>
          <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
        </div>`;
    } else {
      wonAmount = currentIdx > 0 ? LADDER[currentIdx - 1] : 0;
      questionArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">💔</div>
          <h3>Trả lời sai — dừng cuộc chơi</h3>
          <p>Đã dừng lại ở câu ${currentIdx + 1}. Mốc điểm đạt được: <b>${fmtPoints(wonAmount)}</b>.</p>
          <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
        </div>`;
    }
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function askQuestion() {
    if (gameOver) return;
    answered = false;
    eliminatedIdx = [];
    const raw = ladderQueue[currentIdx];
    const item = SA.Quiz.shuffled([raw])[0];
    currentQuestionItem = item;
    renderLadder();

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">Câu ${currentIdx + 1}/${N} — mốc ${fmtPoints(LADDER[currentIdx])}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid" id="tpOptionsGrid">
          ${item.options.map((opt, i) => `
            <button class="answer-btn tp-opt" data-idx="${i}">
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </button>`).join("")}
        </div>
      </div>`;

    questionArea.querySelectorAll(".tp-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const idx = Number(btn.dataset.idx);
        const isCorrect = idx === item.correct;
        questionArea.querySelectorAll(".tp-opt").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });

        if (isCorrect) {
          SA.beep("correct");
          setTimeout(() => {
            currentIdx++;
            if (currentIdx >= N) endGame(true);
            else { resetLifelinesUiOnly(); askQuestion(); }
          }, 1300);
        } else {
          SA.beep("wrong");
          setTimeout(() => endGame(false), 1400);
        }
      });
    });
  }

  // Lifelines chỉ dùng được 1 lần cho CẢ VÁN chơi (không reset theo từng câu)
  function resetLifelinesUiOnly() { /* giữ nguyên trạng thái đã dùng — không làm gì thêm */ }

  let currentQuestionItem = null;

  btn5050.addEventListener("click", () => {
    if (usedLifelines.fifty || gameOver || answered || !currentQuestionItem) return;
    usedLifelines.fifty = true;
    btn5050.disabled = true;
    const item = currentQuestionItem;
    const wrongIdxs = item.options.map((_, i) => i).filter(i => i !== item.correct);
    const toRemove = SA.shuffle(wrongIdxs).slice(0, Math.max(0, item.options.length - 2));
    eliminatedIdx = toRemove;
    toRemove.forEach(i => {
      const el = questionArea.querySelector(`.tp-opt[data-idx="${i}"]`);
      if (el) { el.classList.add("eliminated"); el.disabled = true; }
    });
    SA.toast("Đã loại bỏ 2 đáp án sai!");
  });

  btnPhone.addEventListener("click", () => {
    if (usedLifelines.phone || gameOver || answered || !currentQuestionItem) return;
    usedLifelines.phone = true;
    btnPhone.disabled = true;
    const item = currentQuestionItem;
    const wrongCandidates = item.options
      .map((_, i) => i)
      .filter(i => i !== item.correct && !eliminatedIdx.includes(i));
    const namedWrong = wrongCandidates.length
      ? item.options[SA.shuffle(wrongCandidates)[0]]
      : item.options.find((_, i) => i !== item.correct);
    const box = document.createElement("div");
    box.className = "tp-hint-box";
    box.textContent = `📞 Người thân nói: "Tôi khá chắc đáp án KHÔNG phải là '${namedWrong}' đâu, con thử cân nhắc các đáp án còn lại xem sao."`;
    questionArea.appendChild(box);
  });

  btnAudience.addEventListener("click", () => {
    if (usedLifelines.audience || gameOver || answered || !currentQuestionItem) return;
    usedLifelines.audience = true;
    btnAudience.disabled = true;
    const item = currentQuestionItem;
    const keys = ["A", "B", "C", "D", "E", "F"];
    const activeIdxs = item.options.map((_, i) => i).filter(i => !eliminatedIdx.includes(i));
    // Trọng số cao hơn hẳn cho đáp án đúng, còn lại chia ngẫu nhiên
    const weights = activeIdxs.map(i => i === item.correct ? (55 + Math.random() * 25) : Math.random() * 20 + 5);
    const total = weights.reduce((a, b) => a + b, 0);
    const pcts = weights.map(w => Math.round((w / total) * 100));
    // Điều chỉnh để tổng đúng 100
    let diff = 100 - pcts.reduce((a, b) => a + b, 0);
    pcts[0] += diff;

    const box = document.createElement("div");
    box.className = "tp-audience";
    box.innerHTML = `<div class="field-label" style="text-align:center; margin-bottom:10px;">🙋 Kết quả bình chọn của lớp</div>` +
      activeIdxs.map((idx, k) => `
        <div class="tp-audience-row">
          <span class="key">${keys[idx]}</span>
          <div class="tp-audience-bar-track"><div class="tp-audience-bar-fill" data-pct="${pcts[k]}"></div></div>
          <span class="pct">${pcts[k]}%</span>
        </div>`).join("");
    questionArea.appendChild(box);
    requestAnimationFrame(() => {
      box.querySelectorAll(".tp-audience-bar-fill").forEach(el => {
        el.style.width = el.dataset.pct + "%";
      });
    });
  });

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 2) { SA.toast("Cần ít nhất 2 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("ai-la-trieu-phu", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
