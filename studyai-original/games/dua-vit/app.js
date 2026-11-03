(() => {
  const DEFAULT_NAMES = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "Tổ 5"];
  const DEFAULT_QUIZ_TEXT = [
    "6 x 7 bằng bao nhiêu? | 42 | 48 | 36 | 40",
    "Thủ đô của nước Pháp là gì? | Paris | London | Berlin | Rome",
    "Con vịt thuộc nhóm động vật nào? | Chim | Bò sát | Lưỡng cư | Côn trùng",
    "Ai là người phát minh ra bóng đèn điện? | Thomas Edison | Isaac Newton | Albert Einstein | Nikola Tesla",
    "Việt Nam giành độc lập vào năm nào? | 1945 | 1954 | 1975 | 1930",
    "Phân số 1/2 bằng bao nhiêu phần trăm? | 50% | 25% | 75% | 10%",
    "Núi nào cao nhất Việt Nam? | Fansipan | Bà Đen | Bạch Mã | Yên Tử",
    "Cây xanh hấp thụ khí gì để quang hợp? | CO2 | Oxy | Nitơ | Hydro",
  ].join("\n");

  const pond = document.getElementById("pond");
  const swimBtn = document.getElementById("swimBtn");
  const winnerBanner = document.getElementById("winnerBanner");
  const questionArea = document.getElementById("questionArea");

  let names = SA.Names.load("duavit", DEFAULT_NAMES);
  let quizPool = SA.Quiz.load("duavit", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));

  let ducks = []; // { name, pos, speed, el, laneInner, finished }
  let racing = false;
  let raceTimer = null;
  const START_POS = 5;
  const FINISH_POS = 96;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function buildPond() {
    pond.innerHTML = "";
    ducks = names.map(name => {
      const lane = document.createElement("div");
      lane.className = "duck-lane";
      const tag = document.createElement("div");
      tag.className = "duck-name-tag";
      tag.textContent = name;
      const inner = document.createElement("div");
      inner.className = "duck-lane-inner";
      inner.innerHTML = `<div class="duck-lane-track"></div><div class="duck-lane-finish"></div>`;
      const runner = document.createElement("div");
      runner.className = "duck-runner";
      runner.textContent = "🦆";
      runner.style.left = START_POS + "%";
      inner.appendChild(runner);
      lane.appendChild(tag);
      lane.appendChild(inner);
      pond.appendChild(lane);
      return { name, pos: START_POS, speed: 0, el: runner, finished: false };
    });
  }

  function resetRace() {
    racing = false;
    clearInterval(raceTimer);
    winnerBanner.classList.remove("show");
    questionArea.innerHTML = "";
    swimBtn.disabled = false;
    swimBtn.textContent = "🌊 Bơi!";
    buildPond();
  }

  function startRace() {
    if (racing || ducks.length < 2) return;
    racing = true;
    swimBtn.disabled = true;
    winnerBanner.classList.remove("show");
    questionArea.innerHTML = "";
    ducks.forEach(d => { d.pos = START_POS; d.finished = false; d.el.classList.remove("winner"); d.el.style.left = START_POS + "%"; });

    raceTimer = setInterval(() => {
      let winner = null;
      ducks.forEach(d => {
        if (d.finished) return;
        d.pos += 0.6 + Math.random() * 2.1;
        if (d.pos >= FINISH_POS) { d.pos = FINISH_POS; d.finished = true; if (!winner) winner = d; }
        d.el.style.left = d.pos + "%";
      });
      if (winner) {
        clearInterval(raceTimer);
        racing = false;
        finishRace(winner);
      }
    }, 90);
  }

  function finishRace(winner) {
    winner.el.classList.add("winner");
    SA.confetti(100);
    SA.beep("correct");
    winnerBanner.textContent = `🏆 Vịt của "${winner.name}" về đích đầu tiên!`;
    winnerBanner.classList.add("show");
    swimBtn.disabled = false;
    swimBtn.textContent = "🌊 Bơi lại từ đầu";
    questionArea.innerHTML = `
      <div class="result-box" style="padding:20px 10px;">
        <div class="emoji">🙋</div>
        <h3>${escapeHtml(winner.name)} hãy trả lời câu hỏi thử thách!</h3>
        <p>Bấm nút bên dưới để hiện câu hỏi trắc nghiệm.</p>
        <button class="btn btn-primary btn-lg" id="showQBtn">👀 Hiện câu hỏi</button>
      </div>`;
    document.getElementById("showQBtn").addEventListener("click", () => showQuestion(winner.name));
  }

  function showQuestion(winnerName) {
    const item = SA.Quiz.shuffled([SA.shuffle(quizPool)[0]])[0];
    const keys = ["A", "B", "C", "D", "E", "F"];
    questionArea.innerHTML = `
      <div class="question-box">
        <div class="question-progress">Câu hỏi dành cho ${escapeHtml(winnerName)}</div>
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
        if (isCorrect) { SA.beep("correct"); SA.confetti(60); } else { SA.beep("wrong"); }

        const feedbackHtml = `<div style="text-align:center; margin-top:18px;">
          <p style="font-weight:700; color:${isCorrect ? "var(--success)" : "var(--danger)"};">
            ${isCorrect ? "🎉 Chính xác! " + escapeHtml(winnerName) + " ghi điểm cho lớp." : "😢 Chưa đúng rồi, cùng xem đáp án đúng nhé."}
          </p>
          <button class="btn btn-primary btn-lg" id="swimAgainBtn">🌊 Bơi ván mới</button>
        </div>`;
        questionArea.insertAdjacentHTML("beforeend", feedbackHtml);
        document.getElementById("swimAgainBtn").addEventListener("click", resetRace);
      }, { once: true });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("namesInput").value = names.join("\n");
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newNames = SA.Names.parseText(document.getElementById("namesInput").value);
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newNames.length < 2) { SA.toast("Cần ít nhất 2 tên trong danh sách!"); return; }
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    names = newNames.slice(0, 10);
    quizPool = newQuiz;
    SA.Names.save("duavit", names);
    SA.Quiz.save("duavit", quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    resetRace();
  });

  document.getElementById("restartBtn").addEventListener("click", resetRace);
  swimBtn.addEventListener("click", startRace);

  buildPond();
})();
