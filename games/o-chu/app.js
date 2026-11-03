(() => {
  const DEFAULT_WORDS = ["TOAN HOC", "VAT LY", "HOA HOC", "SINH HOC", "LICH SU", "DIA LY", "TIN HOC", "AM NHAC"];

  const gridEl = document.getElementById("ochuGrid");
  const wordListEl = document.getElementById("wordList");
  const statusEl = document.getElementById("ochuStatus");

  function stripDiacritics(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D");
  }
  function normalizeWord(str) {
    return stripDiacritics(str).toUpperCase().replace(/[^A-Z]/g, "");
  }

  function loadWords() {
    try {
      const raw = localStorage.getItem("sa_ochu_words");
      if (!raw) return DEFAULT_WORDS.slice();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_WORDS.slice();
    } catch (e) { return DEFAULT_WORDS.slice(); }
  }
  function saveWords(words) { localStorage.setItem("sa_ochu_words", JSON.stringify(words)); }

  let originalWords = loadWords();
  let size = 12;
  let grid = [];
  let placements = []; // {word, display, cells:[{r,c}], found}
  let foundCount = 0;

  const DIRECTIONS = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
  const FILLER = "ABCDEGHIKLMNOPQRSTUVXY";

  function tryBuild(gridSize, words) {
    const g = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    const result = [];
    const sorted = words.slice().sort((a, b) => b.norm.length - a.norm.length);
    for (const w of sorted) {
      const word = w.norm;
      if (!word || word.length > gridSize) continue;
      let placed = false;
      for (let attempt = 0; attempt < 300 && !placed; attempt++) {
        const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const r0 = Math.floor(Math.random() * gridSize);
        const c0 = Math.floor(Math.random() * gridSize);
        const cells = [];
        let ok = true;
        for (let i = 0; i < word.length; i++) {
          const r = r0 + dir[0] * i, c = c0 + dir[1] * i;
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) { ok = false; break; }
          const existing = g[r][c];
          if (existing && existing !== word[i]) { ok = false; break; }
          cells.push({ r, c });
        }
        if (ok) {
          cells.forEach((cell, i) => { g[cell.r][cell.c] = word[i]; });
          result.push({ word, display: w.display, cells, found: false });
          placed = true;
        }
      }
    }
    for (let r = 0; r < gridSize; r++) for (let c = 0; c < gridSize; c++) {
      if (!g[r][c]) g[r][c] = FILLER[Math.floor(Math.random() * FILLER.length)];
    }
    return { g, result };
  }

  function buildPuzzle() {
    const normed = originalWords.map(w => ({ display: w, norm: normalizeWord(w) })).filter(w => w.norm.length >= 2);
    const longest = Math.max(...normed.map(w => w.norm.length), 6);
    let bestSize = Math.min(16, Math.max(10, longest + 2));
    let best = null;
    for (const trySize of [bestSize, bestSize + 2, bestSize + 4]) {
      const attempt = tryBuild(Math.min(trySize, 18), normed);
      if (!best || attempt.result.length > best.result.length) { best = attempt; size = Math.min(trySize, 18); }
      if (attempt.result.length === normed.length) break;
    }
    grid = best.g;
    placements = best.result;
    foundCount = 0;
    renderGrid();
    renderWordList();
    updateStatus();
  }

  function renderGrid() {
    gridEl.style.gridTemplateColumns = `repeat(${size}, minmax(22px, 34px))`;
    gridEl.innerHTML = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "ochu-cell";
        cell.dataset.r = r; cell.dataset.c = c;
        cell.textContent = grid[r][c];
        gridEl.appendChild(cell);
      }
    }
  }

  function renderWordList() {
    wordListEl.innerHTML = placements.map(p => `<div class="word-item" data-word="${p.word}">${escapeHtml(p.display)}</div>`).join("")
      || `<div class="empty-state" style="padding:10px;">Không thể xếp từ nào — hãy thử từ ngắn hơn.</div>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function updateStatus() {
    statusEl.textContent = `Đã tìm ${foundCount}/${placements.length} từ`;
    if (placements.length && foundCount === placements.length) {
      SA.confetti(140);
      statusEl.textContent = `🎉 Hoàn thành! Đã tìm hết ${placements.length} từ.`;
    }
  }

  function cellEl(r, c) { return gridEl.querySelector(`.ochu-cell[data-r="${r}"][data-c="${c}"]`); }

  /* ---------- Selection logic ---------- */
  let selecting = false;
  let startCell = null;
  let currentPath = [];

  function clearSelectingClass() {
    gridEl.querySelectorAll(".ochu-cell.selecting").forEach(el => el.classList.remove("selecting"));
  }

  function computePath(r0, c0, r1, c1) {
    const dr = r1 - r0, dc = c1 - c0;
    if (dr === 0 && dc === 0) return [{ r: r0, c: c0 }];
    const isStraight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!isStraight) return null;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const sr = dr === 0 ? 0 : dr / Math.abs(dr);
    const sc = dc === 0 ? 0 : dc / Math.abs(dc);
    const path = [];
    for (let i = 0; i <= steps; i++) path.push({ r: r0 + sr * i, c: c0 + sc * i });
    return path;
  }

  function pathToString(path) { return path.map(p => grid[p.r][p.c]).join(""); }

  function tryMatch(path) {
    const str = pathToString(path);
    const rev = str.split("").reverse().join("");
    const match = placements.find(p => !p.found && (p.word === str || p.word === rev));
    if (match) {
      match.found = true;
      foundCount++;
      path.forEach(p => cellEl(p.r, p.c).classList.add("found"));
      const li = wordListEl.querySelector(`.word-item[data-word="${match.word}"]`);
      if (li) li.classList.add("found");
      SA.beep("correct");
      updateStatus();
    }
  }

  function startSelect(r, c) {
    selecting = true;
    startCell = { r, c };
    currentPath = [{ r, c }];
    clearSelectingClass();
    cellEl(r, c).classList.add("selecting");
  }
  function moveSelect(r, c) {
    if (!selecting) return;
    const path = computePath(startCell.r, startCell.c, r, c);
    if (!path) return;
    clearSelectingClass();
    currentPath = path;
    path.forEach(p => { const el = cellEl(p.r, p.c); if (el) el.classList.add("selecting"); });
  }
  function endSelect() {
    if (!selecting) return;
    selecting = false;
    if (currentPath.length > 1) tryMatch(currentPath);
    clearSelectingClass();
    currentPath.forEach(p => { const el = cellEl(p.r, p.c); if (el && el.classList.contains("found")) return; });
  }

  gridEl.addEventListener("mousedown", (e) => {
    const t = e.target.closest(".ochu-cell");
    if (!t) return;
    startSelect(Number(t.dataset.r), Number(t.dataset.c));
  });
  gridEl.addEventListener("mouseover", (e) => {
    const t = e.target.closest(".ochu-cell");
    if (!t) return;
    moveSelect(Number(t.dataset.r), Number(t.dataset.c));
  });
  document.addEventListener("mouseup", endSelect);

  gridEl.addEventListener("touchstart", (e) => {
    const t = e.target.closest(".ochu-cell");
    if (!t) return;
    e.preventDefault();
    startSelect(Number(t.dataset.r), Number(t.dataset.c));
  }, { passive: false });
  gridEl.addEventListener("touchmove", (e) => {
    if (!selecting) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const t = el && el.closest(".ochu-cell");
    if (!t) return;
    moveSelect(Number(t.dataset.r), Number(t.dataset.c));
  }, { passive: false });
  document.addEventListener("touchend", endSelect);

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("wordsInput").value = originalWords.join("\n");
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const words = document.getElementById("wordsInput").value.split("\n").map(w => w.trim()).filter(Boolean);
    if (words.length < 1) { SA.toast("Cần ít nhất 1 từ!"); return; }
    originalWords = words;
    saveWords(words);
    SA.closeModal("settingsModal");
    SA.toast("Đã tạo ô chữ mới!");
    buildPuzzle();
  });

  document.getElementById("newPuzzleBtn").addEventListener("click", buildPuzzle);

  buildPuzzle();
})();
