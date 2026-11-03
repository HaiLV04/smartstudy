(() => {
  const STORAGE_KEY = "hanhtrinh-hoctap";

  const DEFAULT_JOURNEY_TEXT = [
    "## Chặng 1: Khởi động cùng Toán học",
    "6 x 7 bằng bao nhiêu? | 42 | 36 | 48 | 40",
    "Một hình vuông có mấy cạnh bằng nhau? | 4 | 3 | 2 | 5",
    "100 : 4 bằng bao nhiêu? | 25 | 20 | 30 | 24",
    "## Chặng 2: Khám phá Địa lý Việt Nam",
    "Việt Nam có đường bờ biển dài khoảng bao nhiêu km? | Hơn 3.260 km | Khoảng 500 km | Khoảng 1.000 km | Khoảng 2.000 km",
    "Dãy núi nào được coi là nóc nhà Đông Dương (có đỉnh Fansipan)? | Hoàng Liên Sơn | Trường Sơn | Tam Đảo | Ngũ Hành Sơn",
    "Đồng bằng nào lớn nhất miền Nam Việt Nam? | Đồng bằng sông Cửu Long | Đồng bằng sông Hồng | Đồng bằng duyên hải miền Trung | Đồng bằng Thanh Hoá",
    "## Chặng 3: Thử thách Lịch sử & Văn học",
    "Ai là tác giả của Truyện Kiều? | Nguyễn Du | Nguyễn Trãi | Hồ Xuân Hương | Nguyễn Đình Chiểu",
    "Chiến thắng Điện Biên Phủ diễn ra vào năm nào? | 1954 | 1945 | 1975 | 1930",
    "Bài thơ \"Nam quốc sơn hà\" thường được xem là bản tuyên ngôn độc lập đầu tiên của nước ta, tương truyền gắn với ai? | Lý Thường Kiệt | Trần Hưng Đạo | Lê Lợi | Quang Trung",
  ].join("\n");

  const journeyTrack = document.getElementById("journeyTrack");
  const stageArea = document.getElementById("stageArea");

  let stages = []; // [{title, questions:[{q,options[],correct}]}]
  let stageStatus = []; // 'done' | 'current' | 'locked'
  let activeQuizIdx = -1;
  let quizQueue = [];
  let quizPos = 0;
  let quizCorrect = 0;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function parseJourney(text) {
    const lines = text.split("\n");
    const out = [];
    let current = null;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("##")) {
        const title = line.replace(/^#+/, "").trim();
        if (!title) continue;
        current = { title, questions: [] };
        out.push(current);
        continue;
      }
      if (!current) continue;
      const parts = line.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length < 3) continue;
      const [q, ...opts] = parts;
      current.questions.push({ q, options: opts, correct: 0 });
    }
    return out.filter(s => s.questions.length > 0);
  }

  function serializeJourney(list) {
    return list.map(s => {
      const qLines = s.questions.map(q => [q.q, q.options[q.correct], ...q.options.filter((_, i) => i !== q.correct)].join(" | "));
      return "## " + s.title + "\n" + qLines.join("\n");
    }).join("\n");
  }

  function resetProgress() {
    stageStatus = stages.map((_, i) => (i === 0 ? "current" : "locked"));
  }

  function renderTrack() {
    journeyTrack.innerHTML = "";
    stages.forEach((s, i) => {
      const node = document.createElement("div");
      node.className = "stage-node " + stageStatus[i];
      const icon = stageStatus[i] === "done" ? "✅" : stageStatus[i] === "locked" ? "🔒" : "🚩";
      node.innerHTML = `<div class="stage-flag">${icon}</div><div class="stage-name">${escapeHtml(s.title)}</div>`;
      if (stageStatus[i] === "current" || stageStatus[i] === "done") {
        node.addEventListener("click", () => beginStage(i));
      }
      journeyTrack.appendChild(node);
    });
  }

  function renderIntro() {
    stageArea.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🧭</div>
        <p>Bấm vào chặng đang mở (🚩) trên hành trình để bắt đầu chinh phục!</p>
      </div>`;
  }

  function beginStage(idx) {
    activeQuizIdx = idx;
    quizQueue = SA.Quiz.shuffled(stages[idx].questions);
    quizPos = 0;
    quizCorrect = 0;
    askStageQuestion();
  }

  function askStageQuestion() {
    const stage = stages[activeQuizIdx];
    const item = quizQueue[quizPos];
    const keys = ["A", "B", "C", "D", "E", "F"];
    stageArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">${escapeHtml(stage.title)} — Câu ${quizPos + 1}/${quizQueue.length}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid">
          ${item.options.map((opt, i) => `
            <button class="answer-btn" data-idx="${i}">
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </button>`).join("")}
        </div>
      </div>`;

    stageArea.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        const isCorrect = i === item.correct;
        stageArea.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });
        if (isCorrect) { SA.beep("correct"); quizCorrect++; }
        else { SA.beep("wrong"); }

        setTimeout(() => {
          quizPos++;
          if (quizPos >= quizQueue.length) finishStage();
          else askStageQuestion();
        }, 900);
      }, { once: true });
    });
  }

  function finishStage() {
    const idx = activeQuizIdx;
    stageStatus[idx] = "done";
    const isLast = idx === stages.length - 1;
    if (!isLast) stageStatus[idx + 1] = "current";
    renderTrack();

    if (isLast) {
      SA.confetti(160);
      stageArea.innerHTML = `
        <div class="result-box">
          <div class="emoji journey-final">🏆🗺️🎉</div>
          <h3>Hoàn thành hành trình học tập!</h3>
          <p>Cả lớp đã đi qua tất cả ${stages.length} chặng. Đúng ${quizCorrect}/${quizQueue.length} câu ở chặng cuối.</p>
          <button class="btn btn-primary btn-lg" id="journeyRestartBtn">🔄 Làm lại từ đầu</button>
        </div>`;
      document.getElementById("journeyRestartBtn").addEventListener("click", () => { resetProgress(); renderTrack(); renderIntro(); });
    } else {
      SA.confetti(50);
      stageArea.innerHTML = `
        <div class="result-box">
          <div class="emoji">🚩</div>
          <h3>Hoàn thành ${escapeHtml(stages[idx].title)}!</h3>
          <p>Đúng ${quizCorrect}/${quizQueue.length} câu. Chặng tiếp theo đã được mở khoá.</p>
          <button class="btn btn-primary btn-lg" id="stageContinueBtn">➡️ Tiếp tục hành trình</button>
        </div>`;
      document.getElementById("stageContinueBtn").addEventListener("click", renderIntro);
    }
  }

  function startFresh() {
    resetProgress();
    renderTrack();
    renderIntro();
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("journeyInput").value = serializeJourney(stages);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newStages = parseJourney(document.getElementById("journeyInput").value);
    if (newStages.length < 1) { SA.toast("Cần ít nhất 1 chặng có câu hỏi hợp lệ (bắt đầu bằng dòng \"## Tên chặng\")!"); return; }
    stages = newStages;
    SA.Quiz.save(STORAGE_KEY, stages);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu hành trình mới!");
    startFresh();
  });

  document.getElementById("restartBtn").addEventListener("click", startFresh);

  stages = SA.Quiz.load(STORAGE_KEY, null);
  if (!Array.isArray(stages) || !stages.length || !stages[0].questions) {
    stages = parseJourney(DEFAULT_JOURNEY_TEXT);
  }

  startFresh();
})();
