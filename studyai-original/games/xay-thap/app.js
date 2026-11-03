(() => {
  const DEFAULT_QUIZ_TEXT = [
    "5 x 9 bằng bao nhiêu? | 45 | 40 | 50 | 54",
    "Kim tự tháp Ai Cập được xây bằng vật liệu chủ yếu nào? | Đá | Gỗ | Gạch nung | Đất sét",
    "Thủ đô của Nhật Bản là gì? | Tokyo | Osaka | Kyoto | Seoul",
    "20 - 8 x 2 bằng bao nhiêu? | 4 | 24 | 12 | 8",
    "Chất nào chiếm phần lớn trong không khí ta hít thở? | Khí Nitơ | Khí Oxy | Khí CO2 | Khí Heli",
    "Ai là tác giả bài thơ 'Lượm'? | Tố Hữu | Xuân Diệu | Huy Cận | Nguyễn Đình Thi",
    "Hình nào có 3 cạnh và 3 góc? | Hình tam giác | Hình vuông | Hình tròn | Hình chữ nhật",
    "Đại dương nào lớn nhất thế giới? | Thái Bình Dương | Đại Tây Dương | Ấn Độ Dương | Bắc Băng Dương",
    "6 x 6 - 6 bằng bao nhiêu? | 30 | 36 | 24 | 42",
    "Cơ quan nào giúp con người hô hấp? | Phổi | Tim | Dạ dày | Gan",
  ].join("\n");

  const COLORS = ["#0ea5a4", "#2563eb", "#f97316", "#db2777", "#7c3aed", "#eab308", "#059669", "#0284c7"];
  const COLLAPSE_THRESHOLD = 3;

  const towerBlocksEl = document.getElementById("towerBlocks");
  const questionArea = document.getElementById("questionArea");
  const qStat = document.getElementById("qStat");
  const blockStat = document.getElementById("blockStat");
  const wobbleStat = document.getElementById("wobbleStat");
  const pips = document.querySelectorAll(".instability-bar .pip");

  let quizPool = SA.Quiz.load("xaythap", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let consecutiveWrong = 0;
  let blocks = []; // {el}
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function refreshStats() {
    qStat.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    blockStat.textContent = blocks.length;
    const labels = ["Ổn định", "Hơi rung", "Rung mạnh!"];
    wobbleStat.textContent = labels[consecutiveWrong] || labels[0];
    pips.forEach((p, i) => p.classList.toggle("on", i < consecutiveWrong));
    towerBlocksEl.classList.remove("wobble-1", "wobble-2");
    if (consecutiveWrong === 1) towerBlocksEl.classList.add("wobble-1");
    else if (consecutiveWrong === 2) towerBlocksEl.classList.add("wobble-2");
  }

  function addBlock() {
    const leanLevel = consecutiveWrong;
    const range = 6 + leanLevel * 14;
    const rotRange = 2 + leanLevel * 6;
    const offsetX = (Math.random() * 2 - 1) * range;
    const rotDeg = (Math.random() * 2 - 1) * rotRange;
    const el = document.createElement("div");
    el.className = "tower-block";
    el.style.background = COLORS[blocks.length % COLORS.length];
    el.style.transform = `translateX(${offsetX}px) rotate(${rotDeg}deg)`;
    el.textContent = "#" + (blocks.length + 1);
    towerBlocksEl.appendChild(el);
    blocks.push({ el });
  }

  function newQueue() { quizQueue = SA.shuffle(quizPool); quizIndex = 0; }

  function startGame() {
    quizIndex = 0; consecutiveWrong = 0; blocks = []; gameOver = false;
    towerBlocksEl.innerHTML = "";
    towerBlocksEl.classList.remove("wobble-1", "wobble-2");
    newQueue();
    refreshStats();
    nextQuestion();
  }

  function collapseTower() {
    gameOver = true;
    SA.beep("wrong");
    const els = Array.from(towerBlocksEl.children);
    els.forEach(el => {
      const dx = (Math.random() * 2 - 1) * 260;
      const dy = 140 + Math.random() * 120;
      const rot = (Math.random() * 2 - 1) * 220;
      const anim = el.animate(
        [
          { transform: el.style.transform, opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 },
        ],
        { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.3,.6,.4,1)" }
      );
      anim.onfinish = () => el.remove();
    });
    setTimeout(() => {
      questionArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">💥</div>
          <h3>Tháp đã đổ sập!</h3>
          <p>Trả lời sai 3 lần liên tiếp khiến tháp mất thăng bằng. Đã xây được ${blocks.length} khối trước khi sập. Cùng xây lại nào!</p>
          <button class="btn btn-primary btn-lg" id="retryBtn">🔄 Xây lại từ đầu</button>
        </div>`;
      document.getElementById("retryBtn").addEventListener("click", startGame);
    }, 500);
  }

  function winGame() {
    gameOver = true;
    SA.confetti(140);
    SA.beep("correct");
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="emoji">🏆</div>
        <h3>Tháp tri thức hoàn thành!</h3>
        <p>Cả lớp đã trả lời đúng đủ ${quizQueue.length} câu hỏi và xây xong tháp gồm ${blocks.length} khối mà không hề đổ sập. Xuất sắc!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Xây tháp mới</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function nextQuestion() {
    if (gameOver) return;
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box" style="padding-top:0;">
        <div class="question-progress">Câu ${quizIndex + 1}/${quizQueue.length}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid" style="grid-template-columns:1fr;">
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

        quizIndex++;
        if (isCorrect) {
          SA.beep("correct");
          addBlock();
          consecutiveWrong = 0;
          refreshStats();
        } else {
          SA.beep("wrong");
          consecutiveWrong++;
          refreshStats();
          if (consecutiveWrong >= COLLAPSE_THRESHOLD) {
            setTimeout(collapseTower, 500);
            return;
          }
        }

        setTimeout(() => {
          if (gameOver) return;
          if (quizIndex >= quizQueue.length) { winGame(); return; }
          nextQuestion();
        }, 900);
      }, { once: true });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 2) { SA.toast("Cần ít nhất 2 câu hỏi hợp lệ!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("xaythap", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu xây tháp mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
