(() => {
  const STORAGE_PHRASE_KEY = "sa_khobau_phrase";
  const QUIZ_KEY = "san-kho-bau";

  const DEFAULT_PHRASE = "HOC VUI MOI NGAY";
  const DEFAULT_QUIZ_TEXT = [
    "5 x 6 bằng bao nhiêu? | 30 | 25 | 35 | 20",
    "12 + 19 bằng bao nhiêu? | 31 | 29 | 32 | 30",
    "100 chia 5 bằng bao nhiêu? | 20 | 25 | 15 | 10",
    "Từ nào dưới đây là danh từ? | Học sinh | Chạy | Đẹp | Nhanh",
    "Câu \"Trời hôm nay rất đẹp!\" thuộc loại câu gì? | Câu cảm | Câu hỏi | Câu kể | Câu khiến",
    "Nước sôi ở bao nhiêu độ C (áp suất thường)? | 100 độ C | 0 độ C | 50 độ C | 90 độ C",
    "Bộ phận nào của cây thực hiện quang hợp chủ yếu? | Lá | Rễ | Thân | Hoa",
    "Chiến thắng Bạch Đằng nổi tiếng (năm 938) gắn liền với ai? | Ngô Quyền | Lý Thường Kiệt | Trần Hưng Đạo | Quang Trung",
    "Nước Việt Nam Dân chủ Cộng hoà ra đời năm nào? | 1945 | 1954 | 1975 | 1930",
    "Miền Bắc Việt Nam có mấy mùa rõ rệt trong năm? | 4 mùa | 2 mùa | 3 mùa | 1 mùa",
    "Ngọn núi nào cao nhất Việt Nam? | Fansipan | Núi Bà Đen | Ngọc Linh | Yên Tử",
    "Từ tiếng Anh \"Book\" có nghĩa là gì? | Quyển sách | Cái bàn | Cây bút | Cửa sổ",
    "Từ tiếng Anh \"Dog\" có nghĩa là gì? | Con chó | Con mèo | Con gà | Con cá",
    "Nhạc cụ dân tộc nào của Việt Nam chỉ có 1 dây? | Đàn bầu | Đàn piano | Đàn guitar | Đàn violin",
  ].join("\n");

  const letterTray = document.getElementById("letterTray");
  const phraseDisplay = document.getElementById("phraseDisplay");
  const questionArea = document.getElementById("questionArea");
  const progressText = document.getElementById("progressText");

  let phrase = DEFAULT_PHRASE;
  let quizPool = [];
  let letterPositions = []; // indices in phrase that are non-space letters
  let collectedCount = 0;
  let quizQueue = [];
  let quizIndex = 0;
  let celebrated = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function nonSpaceLetterCount(str) {
    return str.replace(/\s/g, "").length;
  }

  function loadPhrase() {
    const raw = localStorage.getItem(STORAGE_PHRASE_KEY);
    return raw && raw.trim() ? raw : DEFAULT_PHRASE;
  }
  function savePhrase(p) { localStorage.setItem(STORAGE_PHRASE_KEY, p); }

  function computeLetterPositions(str) {
    const positions = [];
    for (let i = 0; i < str.length; i++) {
      if (!/\s/.test(str[i])) positions.push(i);
    }
    return positions;
  }

  function renderPhraseShell() {
    phraseDisplay.innerHTML = "";
    for (let i = 0; i < phrase.length; i++) {
      const ch = phrase[i];
      const slot = document.createElement("div");
      if (/\s/.test(ch)) {
        slot.className = "phrase-slot space";
      } else {
        slot.className = "phrase-slot";
        slot.dataset.pos = i;
      }
      phraseDisplay.appendChild(slot);
    }
  }

  function fillPhraseSlot(pos, letter) {
    const slot = phraseDisplay.querySelector(`.phrase-slot[data-pos="${pos}"]`);
    if (slot) {
      slot.textContent = letter.toUpperCase();
      slot.classList.add("filled");
    }
  }

  function addLetterChip(letter) {
    const chip = document.createElement("div");
    chip.className = "letter-chip";
    chip.textContent = letter.toUpperCase();
    letterTray.appendChild(chip);
  }

  function updateProgress() {
    progressText.textContent = `${collectedCount}/${letterPositions.length}`;
  }

  function newQueue() {
    quizQueue = SA.shuffle(quizPool);
    quizIndex = 0;
  }

  function startGame() {
    letterPositions = computeLetterPositions(phrase);
    collectedCount = 0;
    celebrated = false;
    letterTray.innerHTML = "";
    renderPhraseShell();
    updateProgress();
    newQueue();
    askQuestion();
  }

  function askQuestion() {
    if (quizIndex >= quizQueue.length) newQueue();
    const raw = quizQueue[quizIndex];
    const item = SA.Quiz.shuffled([raw])[0];
    quizIndex++;

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
        const i = Number(btn.dataset.idx);
        const isCorrect = i === item.correct;
        questionArea.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });

        if (isCorrect) {
          SA.beep("correct");
          const pos = letterPositions[collectedCount];
          const letter = phrase[pos];
          addLetterChip(letter);
          fillPhraseSlot(pos, letter);
          collectedCount++;
          updateProgress();
        } else {
          SA.beep("wrong");
        }

        setTimeout(() => {
          if (collectedCount >= letterPositions.length) { winGame(); return; }
          askQuestion();
        }, 900);
      }, { once: true });
    });
  }

  function winGame() {
    if (celebrated) return;
    celebrated = true;
    SA.confetti(150);
    questionArea.innerHTML = `
      <div class="result-box">
        <div class="treasure-big">💰✨🏆</div>
        <h3>Kho báu đã được mở!</h3>
        <div class="phrase-final">${escapeHtml(phrase.toUpperCase())}</div>
        <p>Cả lớp đã thu thập đủ ${letterPositions.length} chữ cái để ghép thành từ khoá bí mật!</p>
        <button class="btn btn-primary btn-lg" id="playAgainBtn">🔄 Chơi lại</button>
      </div>`;
    document.getElementById("playAgainBtn").addEventListener("click", startGame);
  }

  function computeWarning(phraseVal, quizText) {
    const required = nonSpaceLetterCount(phraseVal);
    const count = SA.Quiz.parse(quizText).length;
    const warnEl = document.getElementById("quizWarning");
    if (required > 0 && count < required) {
      warnEl.style.display = "block";
      warnEl.textContent = `⚠️ Từ khoá cần ${required} chữ cái nhưng ngân hàng câu hỏi chỉ có ${count} câu hợp lệ. Trò chơi vẫn chạy được (câu hỏi sẽ được lặp lại), nhưng nên bổ sung thêm câu hỏi để đa dạng hơn.`;
    } else {
      warnEl.style.display = "none";
    }
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("phraseInput").value = phrase;
    document.getElementById("quizInput").value = SA.Quiz.serialize(quizPool);
    computeWarning(phrase, document.getElementById("quizInput").value);
    SA.openModal("settingsModal");
  });

  document.getElementById("phraseInput").addEventListener("input", () => {
    computeWarning(document.getElementById("phraseInput").value, document.getElementById("quizInput").value);
  });
  document.getElementById("quizInput").addEventListener("input", () => {
    computeWarning(document.getElementById("phraseInput").value, document.getElementById("quizInput").value);
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newPhraseRaw = document.getElementById("phraseInput").value.trim();
    const newQuiz = SA.Quiz.parse(document.getElementById("quizInput").value);
    if (newQuiz.length < 1) { SA.toast("Cần ít nhất 1 câu hỏi hợp lệ!"); return; }
    if (nonSpaceLetterCount(newPhraseRaw) < 1) { SA.toast("Từ khoá bí mật cần có ít nhất 1 chữ cái!"); return; }
    phrase = newPhraseRaw;
    quizPool = newQuiz;
    savePhrase(phrase);
    SA.Quiz.save(QUIZ_KEY, quizPool);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván săn kho báu mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  phrase = loadPhrase();
  quizPool = SA.Quiz.load(QUIZ_KEY, SA.Quiz.parse(DEFAULT_QUIZ_TEXT));

  startGame();
})();
