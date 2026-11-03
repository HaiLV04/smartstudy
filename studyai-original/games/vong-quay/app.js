(() => {
  const DEFAULT_NAMES = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "An", "Bình", "Chi", "Duy"];
  const DEFAULT_QUIZ_TEXT = [
    "Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Đà Nẵng | Huế",
    "1 + 2 x 3 bằng bao nhiêu? | 7 | 9 | 6 | 5",
    "Hành tinh nào gần Mặt Trời nhất? | Sao Thủy | Sao Kim | Trái Đất | Sao Hoả",
    "Tác giả của truyện Kiều là ai? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Tố Hữu",
    "Nước nào có diện tích lớn nhất thế giới? | Nga | Trung Quốc | Canada | Mỹ",
    "Số nào là số nguyên tố? | 7 | 8 | 9 | 10",
    "Con vật nào được gọi là chúa tể sơn lâm? | Hổ | Voi | Gấu | Sói",
    "1 giờ có bao nhiêu phút? | 60 | 100 | 24 | 30",
  ].join("\n");

  const colors = ["#0ea5a4", "#2563eb", "#f97316", "#db2777", "#7c3aed", "#eab308", "#059669", "#0284c7", "#ef4444", "#14b8a6"];

  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  const pickedBanner = document.getElementById("pickedBanner");
  const questionArea = document.getElementById("questionArea");
  const classScoreEl = document.getElementById("classScore");
  const qProgressEl = document.getElementById("qProgress");

  let names = SA.Names.load("vongquay", DEFAULT_NAMES);
  let quizPool = SA.Quiz.load("vongquay", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = SA.shuffle(quizPool);
  let quizIndex = 0;
  let classScore = 0;
  let currentRotation = 0;
  let spinning = false;

  function drawWheel() {
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    const segAngle = (Math.PI * 2) / names.length;
    ctx.clearRect(0, 0, size, size);
    names.forEach((name, i) => {
      const start = i * segAngle;
      const end = start + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "700 15px 'Be Vietnam Pro', sans-serif";
      const label = name.length > 12 ? name.slice(0, 11) + "…" : name;
      ctx.fillText(label, r - 14, 5);
      ctx.restore();
    });
  }

  function renderQuestionEmpty() {
    questionArea.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🎡</div>
        <p>Hãy quay vòng quay để chọn học sinh, sau đó câu hỏi sẽ hiện ra ở đây.</p>
      </div>`;
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    classScoreEl.textContent = classScore;
  }

  function showQuestion() {
    if (quizIndex >= quizQueue.length) {
      quizQueue = SA.shuffle(quizPool);
      quizIndex = 0;
    }
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;
    updateProgress();

    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
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

    questionArea.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        const isCorrect = idx === item.correct;
        questionArea.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });
        if (isCorrect) { classScore++; SA.beep("correct"); SA.confetti(50); }
        else SA.beep("wrong");
        updateProgress();

        const nextBtnHtml = `<div style="text-align:center; margin-top:22px;">
          <button class="btn btn-primary btn-lg" id="nextQBtn">🎡 Quay tiếp →</button>
        </div>`;
        questionArea.insertAdjacentHTML("beforeend", nextBtnHtml);
        document.getElementById("nextQBtn").addEventListener("click", () => {
          renderQuestionEmpty();
          pickedBanner.classList.remove("show");
        });
      }, { once: true });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function spin() {
    if (spinning || names.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    pickedBanner.classList.remove("show");

    const segAngleDeg = 360 / names.length;
    const targetIndex = Math.floor(Math.random() * names.length);
    // Trong hệ toạ độ canvas, góc 0° nằm ở hướng 3 giờ (phải), không phải hướng 12 giờ (trên) —
    // trong khi kim chỉ (.wheel-pointer) lại đặt cố định ở đúng vị trí 12 giờ. Vì vậy phải cộng
    // thêm độ lệch 270° (= 360° - 90°) khi quy đổi góc tâm ô sang góc cần xoay, nếu không bánh xe
    // sẽ dừng lệch 90° so với ô thực sự được chọn (kim chỉ trỏ sai tên).
    const targetCenterDeg = targetIndex * segAngleDeg + segAngleDeg / 2;
    const POINTER_ANGLE_DEG = 270; // vị trí kim chỉ (12 giờ) tính theo góc canvas
    const alignDeg = ((POINTER_ANGLE_DEG - targetCenterDeg) % 360 + 360) % 360;
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const finalRotation = currentRotation + extraSpins * 360 + alignDeg - (currentRotation % 360);

    canvas.style.transform = `rotate(${finalRotation}deg)`;
    currentRotation = finalRotation;

    setTimeout(() => {
      spinning = false;
      spinBtn.disabled = false;
      const picked = names[targetIndex];
      pickedBanner.textContent = `🎉 Đã chọn: ${picked}`;
      pickedBanner.classList.add("show");
      questionArea.innerHTML = `
        <div class="result-box" style="padding:20px 10px;">
          <div class="emoji">🙋</div>
          <h3>${escapeHtml(picked)} hãy trả lời câu hỏi!</h3>
          <p>Bấm nút bên dưới để hiện câu hỏi trắc nghiệm.</p>
          <button class="btn btn-primary btn-lg" id="showQBtn">👀 Hiện câu hỏi</button>
        </div>`;
      document.getElementById("showQBtn").addEventListener("click", showQuestion);
    }, 4300);
  }

  function loadSettingsIntoModal() {
    document.getElementById("namesInput").value = names.join("\n");
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
  }

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newNames = SA.Names.parseText(document.getElementById("namesInput").value);
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newNames.length < 2) { SA.toast("Cần ít nhất 2 tên trong danh sách!"); return; }
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    names = newNames;
    quizPool = newQuiz;
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
    SA.Names.save("vongquay", names);
    SA.Quiz.save("vongquay", quizPool);
    drawWheel();
    updateProgress();
    renderQuestionEmpty();
    pickedBanner.classList.remove("show");
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu thay đổi!");
  });

  document.querySelector('[onclick="SA.openModal(\'settingsModal\')"]').addEventListener("click", loadSettingsIntoModal);

  spinBtn.addEventListener("click", spin);

  drawWheel();
  updateProgress();
})();
