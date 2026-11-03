(() => {
  const DEFAULT_PAIRS_TEXT = [
    "Thủ đô Việt Nam | Hà Nội",
    "Tác giả Truyện Kiều | Nguyễn Du",
    "Hành tinh có màu đỏ | Sao Hoả",
    "1 giờ có bao nhiêu phút | 60 phút",
    "Quốc hoa Việt Nam | Hoa Sen",
    "3 x 4 bằng bao nhiêu | 12",
    "Nước đóng băng ở nhiệt độ nào | 0°C",
    "Thủ đô Nhật Bản | Tokyo",
  ].join("\n");

  const memoryGrid = document.getElementById("memoryGrid");
  const matchedCountEl = document.getElementById("matchedCount");
  const totalPairsEl = document.getElementById("totalPairs");
  const attemptCountEl = document.getElementById("attemptCount");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function parsePairs(text) {
    return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const parts = line.split("|").map(s => s.trim());
      return { left: parts[0] || "", right: parts[1] || "" };
    }).filter(p => p.left && p.right);
  }
  function serializePairs(pairs) { return pairs.map(p => `${p.left} | ${p.right}`).join("\n"); }
  function loadPairs() {
    try {
      const raw = localStorage.getItem("sa_pairs_ghepcap");
      if (!raw) return parsePairs(DEFAULT_PAIRS_TEXT);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : parsePairs(DEFAULT_PAIRS_TEXT);
    } catch (e) { return parsePairs(DEFAULT_PAIRS_TEXT); }
  }
  function savePairs(pairs) { localStorage.setItem("sa_pairs_ghepcap", JSON.stringify(pairs)); }

  let pairs = loadPairs();
  let cards = [];       // {pairIdx, side, text, matched}
  let flippedIdx = [];  // indices of currently face-up (unmatched) cards
  let matchedPairs = 0;
  let attempts = 0;
  let locked = false;   // true while resolving a mismatched pair

  function buildGame() {
    matchedPairs = 0;
    attempts = 0;
    flippedIdx = [];
    locked = false;
    matchedCountEl.textContent = 0;
    totalPairsEl.textContent = pairs.length;
    attemptCountEl.textContent = 0;

    const deck = [];
    pairs.forEach((p, i) => {
      deck.push({ pairIdx: i, side: "left", text: p.left, matched: false });
      deck.push({ pairIdx: i, side: "right", text: p.right, matched: false });
    });
    cards = SA.shuffle(deck);

    const cols = cards.length <= 12 ? 4 : cards.length <= 20 ? 5 : 6;
    memoryGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    memoryGrid.innerHTML = cards.map((c, i) => `
      <div class="mem-card" data-idx="${i}">
        <div class="mem-card-inner">
          <div class="mem-face back-of-card">❓</div>
          <div class="mem-face front-of-card">${escapeHtml(c.text)}</div>
        </div>
      </div>`).join("");

    memoryGrid.querySelectorAll(".mem-card").forEach(el => {
      el.addEventListener("click", () => onCardClick(Number(el.dataset.idx)));
    });
  }

  function cardEl(idx) { return memoryGrid.querySelector(`.mem-card[data-idx="${idx}"]`); }

  function onCardClick(idx) {
    if (locked) return;
    const card = cards[idx];
    if (card.matched) return;
    if (flippedIdx.includes(idx)) return;
    if (flippedIdx.length >= 2) return;

    cardEl(idx).classList.add("flipped");
    flippedIdx.push(idx);

    if (flippedIdx.length === 2) {
      attempts++;
      attemptCountEl.textContent = attempts;
      const [i1, i2] = flippedIdx;
      const c1 = cards[i1], c2 = cards[i2];
      const isMatch = c1.pairIdx === c2.pairIdx && c1.side !== c2.side;

      if (isMatch) {
        locked = true;
        setTimeout(() => {
          c1.matched = true; c2.matched = true;
          cardEl(i1).classList.add("matched");
          cardEl(i2).classList.add("matched");
          matchedPairs++;
          matchedCountEl.textContent = matchedPairs;
          SA.beep("correct");
          flippedIdx = [];
          locked = false;
          if (matchedPairs === pairs.length) {
            SA.confetti(150);
            setTimeout(() => SA.toast(`🎉 Hoàn thành! Bạn đã ghép hết ${pairs.length} cặp trong ${attempts} lượt.`), 200);
          }
        }, 350);
      } else {
        locked = true;
        SA.beep("wrong");
        cardEl(i1).classList.add("wrong-shake");
        cardEl(i2).classList.add("wrong-shake");
        setTimeout(() => {
          cardEl(i1).classList.remove("flipped", "wrong-shake");
          cardEl(i2).classList.remove("flipped", "wrong-shake");
          flippedIdx = [];
          locked = false;
        }, 800);
      }
    }
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("pairsInput").value = serializePairs(pairs);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newPairs = parsePairs(document.getElementById("pairsInput").value);
    if (newPairs.length < 2) { SA.toast("Cần ít nhất 2 cặp thẻ hợp lệ!"); return; }
    pairs = newPairs;
    savePairs(pairs);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    buildGame();
  });

  document.getElementById("restartBtn").addEventListener("click", buildGame);

  buildGame();
})();
