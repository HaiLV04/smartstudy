(() => {
  const DEFAULT_CARDS_TEXT = [
    "Thủ đô của Việt Nam | Hà Nội",
    "Thủ đô của Nhật Bản | Tokyo",
    "Công thức tính diện tích hình tròn | S = π × r²",
    "Nguyên tố hoá học có ký hiệu O | Oxy",
    "1 km bằng bao nhiêu mét | 1000 mét",
    "Tác giả Truyện Kiều | Nguyễn Du",
    "Hành tinh có màu đỏ trong hệ Mặt Trời | Sao Hoả",
    "Đơn vị đo cường độ dòng điện | Ampe (A)",
    "Thủ đô của Hàn Quốc | Seoul",
    "Số nguyên tố nhỏ nhất | 2",
  ].join("\n");

  const flashCard = document.getElementById("flashCard");
  const frontText = document.getElementById("frontText");
  const backText = document.getElementById("backText");
  const flashActions = document.getElementById("flashActions");
  const knownCountEl = document.getElementById("knownCount");
  const totalCountEl = document.getElementById("totalCount");
  const deckDots = document.getElementById("deckDots");

  function parseCards(text) {
    return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const parts = line.split("|").map(s => s.trim());
      return { front: parts[0] || "", back: parts[1] || "" };
    }).filter(c => c.front && c.back);
  }
  function serializeCards(cards) { return cards.map(c => `${c.front} | ${c.back}`).join("\n"); }
  function loadCards() {
    try {
      const raw = localStorage.getItem("sa_cards_thelat");
      if (!raw) return parseCards(DEFAULT_CARDS_TEXT);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : parseCards(DEFAULT_CARDS_TEXT);
    } catch (e) { return parseCards(DEFAULT_CARDS_TEXT); }
  }
  function saveCards(cards) { localStorage.setItem("sa_cards_thelat", JSON.stringify(cards)); }

  let deck = loadCards();
  let queue = [];
  let knownCount = 0;
  let flipped = false;
  let current = null;

  function renderDots() {
    deckDots.innerHTML = "";
    for (let i = 0; i < deck.length; i++) {
      const dot = document.createElement("div");
      dot.className = "deck-dot" + (i < knownCount ? " known" : "");
      deckDots.appendChild(dot);
    }
  }

  function updateCounts() {
    knownCountEl.textContent = knownCount;
    totalCountEl.textContent = deck.length;
    renderDots();
  }

  function startSession() {
    queue = SA.shuffle(deck);
    knownCount = 0;
    flipped = false;
    updateCounts();
    nextCard();
  }

  function finishSession() {
    SA.confetti(120);
    document.querySelector(".flash-card-holder").innerHTML = `
      <div class="result-box">
        <div class="emoji">🎉</div>
        <h3>Đã học hết bộ thẻ!</h3>
        <p>Bạn đã thuộc tất cả ${deck.length} thẻ. Rất tuyệt vời!</p>
        <button class="btn btn-primary btn-lg" id="restartAfterDone">🔄 Học lại từ đầu</button>
      </div>`;
    flashActions.style.display = "none";
    document.getElementById("restartAfterDone").addEventListener("click", () => location.reload());
  }

  function nextCard() {
    if (queue.length === 0) { finishSession(); return; }
    current = queue.shift();
    flipped = false;
    flashCard.classList.remove("flipped");
    frontText.textContent = current.front;
    backText.textContent = current.back;
    flashActions.style.display = "none";
  }

  flashCard.addEventListener("click", () => {
    if (!current) return;
    flipped = !flipped;
    flashCard.classList.toggle("flipped", flipped);
    if (flipped) setTimeout(() => { flashActions.style.display = "flex"; }, 300);
    else flashActions.style.display = "none";
  });

  document.getElementById("knowBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    knownCount++;
    SA.beep("correct");
    updateCounts();
    nextCard();
  });

  document.getElementById("dontKnowBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    queue.push(current);
    SA.beep("wrong");
    nextCard();
  });

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("cardsInput").value = serializeCards(deck);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newCards = parseCards(document.getElementById("cardsInput").value);
    if (newCards.length < 1) { SA.toast("Cần ít nhất 1 thẻ hợp lệ!"); return; }
    deck = newCards;
    saveCards(deck);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu bộ thẻ mới!");
    startSession();
  });

  document.getElementById("restartBtn").addEventListener("click", startSession);

  startSession();
})();
