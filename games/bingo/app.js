(() => {
  const DEFAULT_TERMS = [
    "Số nguyên tố", "Phân số", "Hình tam giác", "Chu vi", "Diện tích",
    "Danh từ", "Động từ", "Tính từ", "Câu ghép", "Vần điệu",
    "Quang hợp", "Trọng lực", "Nguyên tử", "Dòng điện", "Hệ Mặt Trời",
    "Vua Hùng", "Sông Hồng", "Đồng bằng", "Thủ đô", "Núi Fansipan",
  ];

  const STORAGE_KEY = "sa_bingo_terms";

  const bingoGrid = document.getElementById("bingoGrid");
  const currentTermEl = document.getElementById("currentTerm");
  const calledListEl = document.getElementById("calledList");
  const callBtn = document.getElementById("callBtn");

  let terms = loadTerms();
  let gridSize = 4;
  let card = []; // array of {term, marked}
  let callPool = [];
  let callIdx = 0;
  let calledSet = new Set();
  let calledOrder = [];
  let gameOver = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function loadTerms() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_TERMS.slice();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length >= 16 ? parsed : DEFAULT_TERMS.slice();
    } catch (e) { return DEFAULT_TERMS.slice(); }
  }

  function saveTerms(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function parseTermsText(text) {
    return text.split("\n").map(s => s.trim()).filter(Boolean);
  }

  function buildCard() {
    gridSize = terms.length >= 25 ? 5 : 4;
    const cellCount = gridSize * gridSize;
    const pool = SA.shuffle(terms);
    const chosen = pool.slice(0, cellCount);
    card = chosen.map(t => ({ term: t, marked: false }));
  }

  function renderGrid() {
    bingoGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    bingoGrid.innerHTML = card.map((cell, i) => `
      <div class="bingo-cell ${cell.marked ? "marked" : ""}" data-idx="${i}">${escapeHtml(cell.term)}</div>
    `).join("");
    bingoGrid.querySelectorAll(".bingo-cell").forEach(el => {
      el.addEventListener("click", () => toggleCell(Number(el.dataset.idx)));
    });
  }

  function toggleCell(idx) {
    if (gameOver) return;
    const cell = card[idx];
    if (!cell.marked && !calledSet.has(cell.term)) {
      SA.toast("Từ này chưa được gọi!");
      return;
    }
    cell.marked = !cell.marked;
    renderGrid();
    checkBingo();
  }

  function checkBingo() {
    const lines = [];
    for (let r = 0; r < gridSize; r++) {
      lines.push(Array.from({ length: gridSize }, (_, c) => r * gridSize + c));
    }
    for (let c = 0; c < gridSize; c++) {
      lines.push(Array.from({ length: gridSize }, (_, r) => r * gridSize + c));
    }
    lines.push(Array.from({ length: gridSize }, (_, i) => i * gridSize + i));
    lines.push(Array.from({ length: gridSize }, (_, i) => i * gridSize + (gridSize - 1 - i)));

    const winLine = lines.find(line => line.every(idx => card[idx].marked));
    if (winLine) {
      gameOver = true;
      SA.beep("correct");
      SA.confetti(160);
      callBtn.disabled = true;
      winLine.forEach(idx => {
        const el = bingoGrid.querySelector(`.bingo-cell[data-idx="${idx}"]`);
        if (el) el.classList.add("win-line");
      });
      currentTermEl.innerHTML = "🎉 BINGO!";
      SA.toast("🎉 Chúc mừng! Đã hoàn thành 1 hàng Bingo!");
    }
  }

  function newCallPool() {
    callPool = SA.shuffle(terms);
    callIdx = 0;
  }

  function renderCalledList() {
    calledListEl.innerHTML = calledOrder.map(t => `<span class="called-chip">${escapeHtml(t)}</span>`).join("");
  }

  function callNext() {
    if (gameOver) return;
    if (callIdx >= callPool.length) {
      newCallPool();
      SA.toast("Đã gọi hết danh sách — bắt đầu vòng gọi mới!");
    }
    const term = callPool[callIdx];
    callIdx++;
    calledSet.add(term);
    calledOrder.unshift(term);
    currentTermEl.textContent = term;
    SA.beep("correct");
    renderCalledList();
  }

  function startGame() {
    terms = loadTerms();
    buildCard();
    calledSet = new Set();
    calledOrder = [];
    gameOver = false;
    callBtn.disabled = false;
    newCallPool();
    currentTermEl.textContent = "—";
    renderGrid();
    renderCalledList();
  }

  callBtn.addEventListener("click", callNext);

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("termsInput").value = terms.join("\n");
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newTerms = parseTermsText(document.getElementById("termsInput").value);
    if (newTerms.length < 16) { SA.toast("Cần ít nhất 16 từ để tạo bảng Bingo!"); return; }
    terms = newTerms;
    saveTerms(terms);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván Bingo mới.");
    startGame();
  });

  document.getElementById("restartBtn").addEventListener("click", startGame);

  startGame();
})();
