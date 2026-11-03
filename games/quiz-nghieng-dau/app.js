(() => {
  const DEFAULT_QUIZ_TEXT = [
    "Trái Đất quay quanh Mặt Trời, đúng hay sai? | Đúng | Sai",
    "2 + 2 = 5, đúng hay sai? | Sai | Đúng",
    "Hà Nội có phải là thủ đô của Việt Nam không? | Đúng | Sai",
    "Cá thở bằng mang hay bằng phổi? | Mang | Phổi",
    "Số 7 là số chẵn hay số lẻ? | Lẻ | Chẵn",
    "Truyện Kiều do Nguyễn Du hay Nguyễn Trãi sáng tác? | Nguyễn Du | Nguyễn Trãi",
    "Ở áp suất thường, nước sôi ở 100°C hay 50°C? | 100°C | 50°C",
    "Sông Cửu Long chảy qua miền Bắc hay miền Nam Việt Nam? | Miền Nam | Miền Bắc",
    "Con voi hay con kiến nặng hơn? | Con voi | Con kiến",
    "1 tuần có 7 ngày hay 10 ngày? | 7 ngày | 10 ngày",
  ].join("\n");

  const TILT_THRESHOLD = 15;   // độ nghiêng để tính là 1 lựa chọn
  const RESET_THRESHOLD = 6;   // phải về gần thẳng đứng dưới mức này mới cho phép nghiêng tiếp

  const questionArea = document.getElementById("questionArea");
  const qProgressEl = document.getElementById("qProgress");
  const qProgressLine = document.getElementById("qProgressLine");
  const scoreValEl = document.getElementById("scoreVal");
  const enableTiltBtn = document.getElementById("enableTiltBtn");
  const tiltStatus = document.getElementById("tiltStatus");

  function truncateTo2(items) {
    // Đảm bảo mỗi câu chỉ có đúng 2 đáp án (đúng + đáp án sai đầu tiên)
    return items
      .filter(it => it.options && it.options.length >= 2)
      .map(it => ({ q: it.q, options: [it.options[it.correct], it.options.find((_, i) => i !== it.correct)], correct: 0 }));
  }

  let quizPool = truncateTo2(SA.Quiz.load("quiz-nghieng-dau", SA.Quiz.parse(DEFAULT_QUIZ_TEXT)));

  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let currentItem = null;
  let answered = false;
  let tiltEnabled = false;
  let canRegister = true; // debounce: cho phép ghi nhận nghiêng mới

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    qProgressLine.textContent = `Câu ${Math.min(quizIndex + 1, quizQueue.length)}/${quizQueue.length}`;
    scoreValEl.textContent = score;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
    score = 0;
  }

  function renderQuestion() {
    if (quizIndex >= quizQueue.length) {
      questionArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">🎉</div>
          <h3>Hoàn thành bộ câu hỏi!</h3>
          <p>Bạn trả lời đúng ${score}/${quizQueue.length} câu.</p>
          <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
        </div>`;
      document.getElementById("playAgainBtn").addEventListener("click", startGame);
      return;
    }
    answered = false;
    canRegister = true;
    currentItem = SA.Quiz.shuffled([quizQueue[quizIndex]])[0];
    updateProgress();

    questionArea.innerHTML = `
      <div class="qhq-question">${escapeHtml(currentItem.q)}</div>
      <div class="tilt-zones">
        <div class="tilt-zone" data-idx="0" id="zoneLeft">
          <div class="side-label">⬅️ Trái</div>
          <div class="opt-text">${escapeHtml(currentItem.options[0])}</div>
        </div>
        <div class="tilt-indicator-wrap">
          <div class="tilt-track" id="tiltTrack">
            <div class="tilt-ball" id="tiltBall">🧑</div>
          </div>
        </div>
        <div class="tilt-zone" data-idx="1" id="zoneRight">
          <div class="side-label">➡️ Phải</div>
          <div class="opt-text">${escapeHtml(currentItem.options[1])}</div>
        </div>
      </div>`;

    document.getElementById("zoneLeft").addEventListener("click", () => chooseAnswer(0));
    document.getElementById("zoneRight").addEventListener("click", () => chooseAnswer(1));
  }

  function chooseAnswer(idx) {
    if (answered || quizIndex >= quizQueue.length) return;
    answered = true;
    const isCorrect = idx === currentItem.correct;
    const zones = [document.getElementById("zoneLeft"), document.getElementById("zoneRight")];
    zones.forEach((z, i) => {
      z.classList.add("disabled");
      if (i === currentItem.correct) z.classList.add("correct");
      else if (i === idx) z.classList.add("wrong");
    });
    if (isCorrect) { score++; SA.beep("correct"); SA.confetti(50); }
    else SA.beep("wrong");
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

  /* ---------- Cảm biến nghiêng (deviceorientation) ---------- */
  function updateTiltVisual(gamma) {
    const ball = document.getElementById("tiltBall");
    if (!ball) return;
    const clamped = Math.max(-45, Math.min(45, gamma));
    const translateX = (clamped / 45) * 55; // px trong track rộng ~180px
    const rotate = clamped * 0.6;
    ball.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
  }

  function handleOrientation(evt) {
    const gamma = evt.gamma; // -90 (nghiêng trái) .. 90 (nghiêng phải)
    if (typeof gamma !== "number") return;
    updateTiltVisual(gamma);

    if (answered) return;

    if (canRegister && Math.abs(gamma) > TILT_THRESHOLD) {
      canRegister = false;
      const idx = gamma < 0 ? 0 : 1; // âm = nghiêng trái, dương = nghiêng phải
      chooseAnswer(idx);
    } else if (!canRegister && Math.abs(gamma) < RESET_THRESHOLD) {
      canRegister = true;
    }
  }

  function activateTiltListening() {
    tiltEnabled = true;
    window.addEventListener("deviceorientation", handleOrientation);
    tiltStatus.textContent = "Cảm biến: đang hoạt động — nghiêng thiết bị để chọn!";
    enableTiltBtn.textContent = "📱 Cảm biến đã bật";
    enableTiltBtn.disabled = true;
  }

  enableTiltBtn.addEventListener("click", () => {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then(state => {
            if (state === "granted") {
              activateTiltListening();
              SA.toast("Đã bật cảm biến nghiêng!");
            } else {
              tiltStatus.textContent = "Cảm biến: chưa cấp quyền — vẫn chơi được bằng cách bấm chọn.";
              SA.toast("Bạn có thể chọn đáp án bằng cách bấm vào ô Trái/Phải.");
            }
          })
          .catch(() => {
            tiltStatus.textContent = "Cảm biến: không khả dụng — hãy bấm chọn đáp án như bình thường.";
          });
      } else if (typeof window.DeviceOrientationEvent !== "undefined") {
        // Android / trình duyệt không cần xin quyền riêng
        activateTiltListening();
        SA.toast("Đã bật cảm biến nghiêng!");
      } else {
        tiltStatus.textContent = "Thiết bị này không có cảm biến nghiêng — hãy bấm chọn đáp án như bình thường.";
      }
    } catch (e) {
      tiltStatus.textContent = "Cảm biến: không khả dụng — hãy bấm chọn đáp án như bình thường.";
    }
  });

  /* ---------- Settings ---------- */
  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const parsed = SA.Quiz.parse(document.getElementById("quizInput").value);
    const newQuiz = truncateTo2(parsed);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ (2 đáp án)!"); return; }
    quizPool = newQuiz;
    SA.Quiz.save("quiz-nghieng-dau", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
