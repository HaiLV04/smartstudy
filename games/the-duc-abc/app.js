(() => {
  const DEFAULT_QUIZ_TEXT = [
    "5 x 4 = ? | 20 | 24 | 16",
    "Thủ đô của Việt Nam là gì? | Hà Nội | Huế | TP. Hồ Chí Minh",
    "Hành tinh nào gần Mặt Trời nhất? | Sao Thủy | Sao Kim | Trái Đất",
    "Từ nào là danh từ? | Học sinh | Chạy | Đẹp",
    "Con vật nào đẻ trứng? | Gà | Chó | Mèo",
    "1 mét bằng bao nhiêu xăng-ti-mét? | 100 cm | 10 cm | 1000 cm",
    "Mùa nào lạnh nhất ở miền Bắc Việt Nam? | Mùa đông | Mùa hè | Mùa xuân",
    "Ai là tác giả của truyện Kiều? | Nguyễn Du | Hồ Xuân Hương | Nguyễn Trãi",
    "Nước chiếm bao nhiêu phần trăm bề mặt Trái Đất? | 71% | 50% | 30%",
    "9 : 3 = ? | 3 | 6 | 2",
  ].join("\n");

  const MAX_OPTS = 3;
  const POSE_EMOJI = ["🙆", "🙋", "🏃"];
  const POSE_LABEL = ["A", "B", "C"];

  const questionText = document.getElementById("questionText");
  const instructionText = document.getElementById("instructionText");
  const questionArea = document.getElementById("questionArea");
  const qProgressEl = document.getElementById("qProgress");
  const scoreValEl = document.getElementById("scoreVal");

  function truncateToMax3(items) {
    return items
      .filter(it => it.options && it.options.length >= 2)
      .map(it => {
        const correctText = it.options[it.correct];
        const opts = it.options.slice(0, MAX_OPTS);
        let correctIdx = opts.indexOf(correctText);
        if (correctIdx === -1) { opts[0] = correctText; correctIdx = 0; }
        return { q: it.q, options: opts, correct: correctIdx };
      });
  }

  let quizPool = truncateToMax3(SA.Quiz.load("the-duc-abc", SA.Quiz.parse(DEFAULT_QUIZ_TEXT)));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let currentItem = null;
  let answered = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreValEl.textContent = score;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
    score = 0;
  }

  function renderQuestion() {
    if (quizIndex >= quizQueue.length) {
      questionText.textContent = "";
      instructionText.textContent = "";
      questionArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">🏆</div>
          <h3>Hoàn thành bài thể dục ABC!</h3>
          <p>Bạn trả lời đúng ${score}/${quizQueue.length} câu.</p>
          <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
        </div>`;
      document.getElementById("playAgainBtn").addEventListener("click", startGame);
      return;
    }
    answered = false;
    currentItem = SA.Quiz.shuffled([quizQueue[quizIndex]])[0];
    updateProgress();

    const letters = POSE_LABEL.slice(0, currentItem.options.length).join(", ");
    questionText.textContent = currentItem.q;
    instructionText.textContent = `Câu trả lời đúng là ${letters}? Làm động tác tương ứng rồi bấm vào biểu tượng đó!`;

    const gridClass = currentItem.options.length <= 2 ? "pose-grid opts-2" : "pose-grid";
    questionArea.innerHTML = `
      <div class="${gridClass}" id="poseGrid">
        ${currentItem.options.map((opt, i) => `
          <div class="pose-card" data-idx="${i}">
            <div class="pose-letter">${POSE_LABEL[i]}</div>
            <div class="pose-emoji">${POSE_EMOJI[i]}</div>
            <div class="pose-text">${escapeHtml(opt)}</div>
          </div>`).join("")}
      </div>`;

    questionArea.querySelectorAll(".pose-card").forEach(card => {
      card.addEventListener("click", () => chooseAnswer(Number(card.dataset.idx)));
    });
  }

  function chooseAnswer(idx) {
    if (answered) return;
    answered = true;
    const isCorrect = idx === currentItem.correct;
    const cards = questionArea.querySelectorAll(".pose-card");
    cards.forEach(c => {
      c.classList.add("disabled");
      const i = Number(c.dataset.idx);
      if (i === currentItem.correct) c.classList.add("correct");
      else if (i === idx) c.classList.add("wrong");
    });
    const chosenCard = questionArea.querySelector(`.pose-card[data-idx="${idx}"]`);
    if (isCorrect) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      if (chosenCard) chosenCard.classList.add("bounce");
    } else {
      SA.beep("wrong");
    }
    quizIndex++;
    updateProgress();

    const nextHtml = `<div style="text-align:center; margin-top:20px;">
      <button class="btn btn-primary btn-lg" id="nextQBtn">➡️ Câu tiếp theo</button>
    </div>`;
    questionArea.insertAdjacentHTML("beforeend", nextHtml);
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
    const newQuiz = truncateToMax3(parsed);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("the-duc-abc", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
