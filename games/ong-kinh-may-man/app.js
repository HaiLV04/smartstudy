(() => {
  const DEFAULT_NAMES = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "An", "Bình", "Chi", "Duy"];
  const DEFAULT_QUIZ_TEXT = [
    "5 + 7 = ? | 12 | 11 | 13 | 10",
    "Việt Nam có bao nhiêu mùa ở miền Bắc? | 4 mùa | 2 mùa | 3 mùa | 5 mùa",
    "Ai là người phát minh ra bóng đèn điện? | Thomas Edison | Isaac Newton | Albert Einstein | Nikola Tesla",
    "Chất nào cây xanh hấp thụ để quang hợp? | Khí CO2 | Khí Oxy | Khí Nitơ | Khí Hydro",
    "Thủ đô nước Pháp là thành phố nào? | Paris | London | Rome | Berlin",
    "Từ nào đồng nghĩa với 'chăm chỉ'? | Siêng năng | Lười biếng | Nhút nhát | Vui vẻ",
    "10 x 10 = ? | 100 | 110 | 90 | 1000",
    "Núi nào cao nhất thế giới? | Everest | Fansipan | Kilimanjaro | Andes",
  ].join("\n");

  const lensHolder = document.getElementById("lensHolder");
  const lensVideo = document.getElementById("lensVideo");
  const lensPlaceholder = document.getElementById("lensPlaceholder");
  const lensFlash = document.getElementById("lensFlash");
  const camBtn = document.getElementById("camBtn");
  const camStatus = document.getElementById("camStatus");
  const captureBtn = document.getElementById("captureBtn");
  const pickedBanner = document.getElementById("pickedBanner");
  const questionArea = document.getElementById("questionArea");
  const classScoreEl = document.getElementById("classScore");
  const qProgressEl = document.getElementById("qProgress");

  let names = SA.Names.load("ong-kinh-may-man", DEFAULT_NAMES);
  let quizPool = SA.Quiz.load("ong-kinh-may-man", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = SA.shuffle(quizPool);
  let quizIndex = 0;
  let classScore = 0;
  let capturing = false;
  let cameraStream = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    classScoreEl.textContent = classScore;
  }

  function renderQuestionEmpty() {
    questionArea.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📸</div>
        <p>Hãy bấm "Chụp!" để ống kính may mắn chọn ngẫu nhiên một học sinh, sau đó câu hỏi sẽ hiện ra ở đây.</p>
      </div>`;
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
          <button class="btn btn-primary btn-lg" id="nextQBtn">📸 Chụp tiếp →</button>
        </div>`;
        questionArea.insertAdjacentHTML("beforeend", nextBtnHtml);
        document.getElementById("nextQBtn").addEventListener("click", () => {
          renderQuestionEmpty();
          pickedBanner.classList.remove("show");
        });
      }, { once: true });
    });
  }

  function doCapture() {
    if (capturing || names.length < 2) return;
    capturing = true;
    captureBtn.disabled = true;
    pickedBanner.classList.remove("show");

    lensFlash.classList.remove("flashing");
    // force reflow so the animation can retrigger every capture
    void lensFlash.offsetWidth;
    lensFlash.classList.add("flashing");

    setTimeout(() => {
      capturing = false;
      captureBtn.disabled = false;
      const picked = names[Math.floor(Math.random() * names.length)];
      pickedBanner.textContent = `🎉 Đã chọn: ${picked}!`;
      pickedBanner.classList.add("show");
      SA.beep("correct");
      questionArea.innerHTML = `
        <div class="result-box" style="padding:20px 10px;">
          <div class="emoji">🙋</div>
          <h3>${escapeHtml(picked)} hãy trả lời câu hỏi!</h3>
          <p>Bấm nút bên dưới để hiện câu hỏi trắc nghiệm.</p>
          <button class="btn btn-primary btn-lg" id="showQBtn">👀 Hiện câu hỏi</button>
        </div>`;
      document.getElementById("showQBtn").addEventListener("click", showQuestion);
    }, 500);
  }

  /* ---------- Camera trang trí (tuỳ chọn, không phân tích ảnh) ---------- */
  async function enableDecorativeCamera() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      camStatus.textContent = "Camera: trình duyệt này không hỗ trợ — dùng ảnh trang trí thay thế.";
      return;
    }
    try {
      camBtn.disabled = true;
      camStatus.textContent = "Camera: đang xin quyền truy cập...";
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      lensVideo.srcObject = cameraStream;
      lensVideo.classList.add("active");
      lensPlaceholder.classList.add("hidden-lens");
      camStatus.textContent = "Camera: đang bật (chỉ để trang trí, không phân tích ảnh).";
      camBtn.textContent = "🎥 Camera đã bật";
    } catch (e) {
      camStatus.textContent = "Camera: không thể truy cập (từ chối quyền hoặc không có camera) — dùng ảnh trang trí thay thế.";
      camBtn.disabled = false;
    }
  }

  camBtn.addEventListener("click", enableDecorativeCamera);
  captureBtn.addEventListener("click", doCapture);

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
    SA.Names.save("ong-kinh-may-man", names);
    SA.Quiz.save("ong-kinh-may-man", quizPool);
    updateProgress();
    renderQuestionEmpty();
    pickedBanner.classList.remove("show");
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu thay đổi!");
  });

  document.querySelector('[onclick="SA.openModal(\'settingsModal\')"]').addEventListener("click", loadSettingsIntoModal);

  updateProgress();
})();
