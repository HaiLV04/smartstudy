(() => {
  const DEFAULT_REGIONS = ["Châu Á", "Châu Âu", "Châu Phi", "Châu Mỹ", "Châu Đại Dương", "Châu Nam Cực"];
  const DEFAULT_QUIZ_TEXT = [
    "Châu lục nào có diện tích lớn nhất thế giới? | Châu Á | Châu Âu | Châu Phi | Châu Mỹ",
    "Châu lục nào được mệnh danh là 'lục địa già'? | Châu Âu | Châu Á | Châu Phi | Châu Mỹ",
    "Sa mạc Sahara nằm ở châu lục nào? | Châu Phi | Châu Á | Châu Âu | Châu Đại Dương",
    "Châu lục nào có dân số đông nhất thế giới? | Châu Á | Châu Phi | Châu Âu | Châu Mỹ",
    "Châu lục nào gần như bị băng bao phủ quanh năm? | Châu Nam Cực | Châu Á | Châu Âu | Châu Mỹ",
    "Australia là quốc gia - lục địa nằm trọn vẹn ở châu lục nào? | Châu Đại Dương | Châu Á | Châu Phi | Châu Mỹ",
    "Rừng mưa Amazon nổi tiếng nằm chủ yếu ở châu lục nào? | Châu Mỹ | Châu Á | Châu Phi | Châu Âu",
    "Tháp Eiffel nằm ở châu lục nào? | Châu Âu | Châu Á | Châu Phi | Châu Mỹ",
    "Kim tự tháp Ai Cập thuộc châu lục nào? | Châu Phi | Châu Á | Châu Âu | Châu Mỹ",
    "Việt Nam thuộc châu lục nào? | Châu Á | Châu Âu | Châu Phi | Châu Mỹ",
  ].join("\n");

  const COLORS = ["#0ea5a4", "#2563eb", "#f97316", "#db2777", "#7c3aed", "#eab308", "#059669", "#0284c7", "#ef4444", "#14b8a6", "#6366f1", "#84cc16"];
  const BLOBS = [
    "63% 37% 54% 46% / 55% 48% 52% 45%",
    "42% 58% 62% 38% / 45% 55% 45% 55%",
    "50% 50% 50% 50% / 60% 40% 60% 40%",
    "70% 30% 40% 60% / 40% 60% 40% 60%",
    "35% 65% 55% 45% / 65% 35% 55% 45%",
    "58% 42% 45% 55% / 40% 45% 55% 60%",
  ];

  const scoreEl = document.getElementById("score");
  const qProgressEl = document.getElementById("qProgress");
  const qBanner = document.getElementById("qBanner");
  const mapBoard = document.getElementById("mapBoard");
  const startBtn = document.getElementById("startBtn");

  function loadRegions() {
    try {
      const raw = localStorage.getItem("sa_bandodialy_regions");
      if (!raw) return DEFAULT_REGIONS.slice();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length >= 2 ? parsed : DEFAULT_REGIONS.slice();
    } catch (e) { return DEFAULT_REGIONS.slice(); }
  }
  function saveRegions(regions) { localStorage.setItem("sa_bandodialy_regions", JSON.stringify(regions)); }

  let regions = loadRegions();
  let quizPool = SA.Quiz.load("bandodialy", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let quizQueue = [];
  let quizIndex = 0;
  let score = 0;
  let answered = false;
  let questionTimeout = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function norm(s) { return String(s).trim().toLowerCase(); }

  function validQuestions() {
    const regionSet = regions.map(norm);
    return quizPool.filter(it => regionSet.includes(norm(it.options[it.correct])));
  }

  function drawMap() {
    mapBoard.innerHTML = regions.map((name, i) => `
      <div class="region-blob" data-name="${escapeHtml(name)}" style="background:${COLORS[i % COLORS.length]}; border-radius:${BLOBS[i % BLOBS.length]};">
        ${escapeHtml(name)}
      </div>`).join("");
  }

  function updateProgress() {
    qProgressEl.textContent = `${Math.min(quizIndex, quizQueue.length)}/${quizQueue.length}`;
    scoreEl.textContent = score;
  }

  function newQueue() {
    quizQueue = SA.shuffle(validQuestions());
    quizIndex = 0;
  }

  function clearBoardState() {
    mapBoard.querySelectorAll(".region-blob").forEach(b => {
      b.classList.remove("correct-pick", "wrong-pick", "disabled-blob");
    });
    clearTimeout(questionTimeout);
  }

  function finishQuestion(correctName, clickedEl) {
    if (answered) return;
    answered = true;
    clearTimeout(questionTimeout);

    mapBoard.querySelectorAll(".region-blob").forEach(b => {
      b.classList.add("disabled-blob");
      if (norm(b.dataset.name) === norm(correctName)) b.classList.add("correct-pick");
      else if (b === clickedEl) b.classList.add("wrong-pick");
    });

    if (clickedEl && norm(clickedEl.dataset.name) === norm(correctName)) {
      score++;
      SA.beep("correct");
      SA.confetti(60);
      qBanner.textContent = "✅ Chính xác!";
    } else {
      SA.beep("wrong");
      qBanner.textContent = `❌ Chưa đúng. Đáp án đúng là "${correctName}" (đã tô xanh trên bản đồ).`;
    }
    updateProgress();

    questionTimeout = setTimeout(() => {
      clearBoardState();
      askQuestion();
    }, 1900);
  }

  function askQuestion() {
    if (!quizQueue.length) {
      qBanner.textContent = "⚠️ Không có câu hỏi nào khớp với tên vùng trên bản đồ. Hãy vào Soạn bản đồ & câu hỏi để chỉnh lại.";
      return;
    }
    if (quizIndex >= quizQueue.length) newQueue();
    const item = quizQueue[quizIndex];
    quizIndex++;
    answered = false;
    qBanner.textContent = item.q;
    updateProgress();

    mapBoard.querySelectorAll(".region-blob").forEach(b => {
      b.onclick = () => finishQuestion(item.options[item.correct], b);
    });
  }

  function startGame() {
    score = 0;
    clearBoardState();
    drawMap();
    newQueue();
    updateProgress();
    startBtn.textContent = "🔄 Chơi lại";
    if (!quizQueue.length) {
      qBanner.textContent = "⚠️ Không có câu hỏi nào khớp với tên vùng trên bản đồ. Hãy vào Soạn bản đồ & câu hỏi để chỉnh lại.";
      return;
    }
    askQuestion();
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("regionsInput").value = regions.join("\n");
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newRegions = document.getElementById("regionsInput").value.split("\n").map(s => s.trim()).filter(Boolean);
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newRegions.length < 2) { SA.toast("Cần ít nhất 2 tên vùng!"); return; }
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    regions = newRegions;
    quizPool = newQuiz;
    saveRegions(regions);
    SA.Quiz.save("bandodialy", quizPool);
    SA.closeModal("settingsModal");
    const matched = validQuestions().length;
    if (matched === 0) SA.toast("Đã lưu, nhưng chưa có câu hỏi nào khớp tên vùng — hãy kiểm tra lại!");
    else SA.toast(`Đã lưu! ${matched}/${quizPool.length} câu hỏi khớp với bản đồ.`);
    startGame();
  });

  startBtn.addEventListener("click", startGame);
  drawMap();
  updateProgress();
})();
