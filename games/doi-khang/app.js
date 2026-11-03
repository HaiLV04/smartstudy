(() => {
  const DEFAULT_QUIZ_TEXT = [
    "15 x 3 = ? | 45 | 35 | 48 | 50",
    "Việt Nam có bao nhiêu mùa ở miền Nam? | 2 mùa | 4 mùa | 3 mùa | 1 mùa",
    "Ai là tác giả bài thơ 'Lượm'? | Tố Hữu | Xuân Diệu | Huy Cận | Nguyễn Đình Thi",
    "90 : 6 = ? | 15 | 14 | 16 | 18",
    "Kim loại nào nhẹ nhất trong các kim loại thông thường? | Nhôm | Sắt | Đồng | Chì",
    "Vịnh Hạ Long thuộc tỉnh nào? | Quảng Ninh | Hải Phòng | Nam Định | Thanh Hoá",
    "7² bằng bao nhiêu? | 49 | 36 | 42 | 56",
    "Cơ quan nào lọc máu trong cơ thể người? | Thận | Tim | Phổi | Dạ dày",
    "Ai được xem là 'cha đẻ' của ngành vật lý cổ điển? | Isaac Newton | Albert Einstein | Galileo | Newton Faraday",
    "8 + 6 x 3 = ? | 26 | 42 | 24 | 30",
  ].join("\n");

  const MAX_HP = 100;
  const MIN_DMG = 15, MAX_DMG = 25;

  const nameAEl = document.getElementById("nameA");
  const nameBEl = document.getElementById("nameB");
  const avatarA = document.getElementById("avatarA");
  const avatarB = document.getElementById("avatarB");
  const hpFillA = document.getElementById("hpFillA");
  const hpFillB = document.getElementById("hpFillB");
  const hpTextA = document.getElementById("hpTextA");
  const hpTextB = document.getElementById("hpTextB");
  const turnBanner = document.getElementById("turnBanner");
  const questionArea = document.getElementById("questionArea");

  let nameA = localStorage.getItem("sa_doikhang_nameA") || "Người chơi A";
  let nameB = localStorage.getItem("sa_doikhang_nameB") || "Người chơi B";
  let quizPool = SA.Quiz.load("doikhang", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let hpA = MAX_HP, hpB = MAX_HP;
  let turn = "A";
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function refreshLabels() {
    nameAEl.textContent = nameA;
    nameBEl.textContent = nameB;
  }

  function refreshHp() {
    hpFillA.style.width = Math.max(0, hpA) + "%";
    hpFillB.style.width = Math.max(0, hpB) + "%";
    hpTextA.textContent = Math.max(0, hpA);
    hpTextB.textContent = Math.max(0, hpB);
  }

  function newQueue() { quizQueue = SA.shuffle(quizPool); quizIndex = 0; }

  function startGame() {
    hpA = MAX_HP; hpB = MAX_HP; turn = "A"; gameOver = false;
    newQueue();
    refreshHp();
    avatarA.classList.remove("hit");
    avatarB.classList.remove("hit");
    nextQuestion();
  }

  function endGame(winnerName) {
    gameOver = true;
    SA.confetti(140);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏆</div>
        <h3>${escapeHtml(winnerName)} đã chiến thắng!</h3>
        <p>Đối thủ đã hết máu. Bấm "Chơi lại" để bắt đầu trận đấu mới.</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    turnBanner.textContent = "Trận đấu kết thúc";
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function nextQuestion() {
    if (gameOver) return;
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;

    const currentName = turn === "A" ? nameA : nameB;
    turnBanner.textContent = `⚔️ Lượt của ${currentName}`;

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
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
          const dmg = MIN_DMG + Math.floor(Math.random() * (MAX_DMG - MIN_DMG + 1));
          if (turn === "A") {
            hpB = Math.max(0, hpB - dmg);
            avatarB.classList.remove("hit"); void avatarB.offsetWidth; avatarB.classList.add("hit");
          } else {
            hpA = Math.max(0, hpA - dmg);
            avatarA.classList.remove("hit"); void avatarA.offsetWidth; avatarA.classList.add("hit");
          }
          refreshHp();
        } else {
          SA.beep("wrong");
        }

        setTimeout(() => {
          if (hpA <= 0) { endGame(nameB); return; }
          if (hpB <= 0) { endGame(nameA); return; }
          turn = turn === "A" ? "B" : "A";
          nextQuestion();
        }, 900);
      }, { once: true });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("nameAInput").value = nameA;
    document.getElementById("nameBInput").value = nameB;
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    nameA = document.getElementById("nameAInput").value.trim() || "Người chơi A";
    nameB = document.getElementById("nameBInput").value.trim() || "Người chơi B";
    quizPool = newQuiz;
    localStorage.setItem("sa_doikhang_nameA", nameA);
    localStorage.setItem("sa_doikhang_nameB", nameB);
    SA.Quiz.save("doikhang", quizPool);
    refreshLabels();
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu trận mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  refreshLabels();
  startGame();
})();
