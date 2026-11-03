(() => {
  const DEFAULT_PAIRS_TEXT = [
    "Quang hợp | Quá trình cây xanh dùng ánh sáng để tạo ra chất hữu cơ",
    "Từ đồng nghĩa | Những từ có nghĩa giống nhau hoặc gần giống nhau",
    "Số nguyên tố | Số tự nhiên lớn hơn 1, chỉ chia hết cho 1 và chính nó",
    "Danh từ | Từ chỉ người, sự vật, hiện tượng, khái niệm",
    "Núi lửa | Hiện tượng magma phun trào lên bề mặt Trái Đất",
    "Hình thoi | Tứ giác có bốn cạnh bằng nhau",
    "Thủy triều | Hiện tượng nước biển lên xuống do lực hút của Mặt Trăng",
  ].join("\n");

  const conceptList = document.getElementById("conceptList");
  const chipPool = document.getElementById("chipPool");
  const matchedCountEl = document.getElementById("matchedCount");
  const totalCountEl = document.getElementById("totalCount");

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
      const raw = localStorage.getItem("sa_pairs_keothanoiy");
      if (!raw) return parsePairs(DEFAULT_PAIRS_TEXT);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : parsePairs(DEFAULT_PAIRS_TEXT);
    } catch (e) { return parsePairs(DEFAULT_PAIRS_TEXT); }
  }
  function savePairs(pairs) { localStorage.setItem("sa_pairs_keothanoiy", JSON.stringify(pairs)); }

  let pairs = loadPairs();
  let matchedCount = 0;

  function buildGame() {
    matchedCount = 0;
    totalCountEl.textContent = pairs.length;
    matchedCountEl.textContent = 0;

    conceptList.innerHTML = pairs.map((p, i) => `
      <div class="concept-box" data-qidx="${i}">
        <div class="c-icon">🧩</div>
        <div class="c-label">${escapeHtml(p.left)}</div>
        <div class="c-drop" data-qidx="${i}">Thả ý nghĩa vào đây</div>
      </div>`).join("");

    const shuffledChips = SA.shuffle(pairs.map((p, i) => ({ text: p.right, qidx: i })));
    chipPool.innerHTML = "";
    shuffledChips.forEach(chip => {
      const el = document.createElement("div");
      el.className = "idea-chip";
      el.textContent = chip.text;
      el.dataset.qidx = chip.qidx;
      chipPool.appendChild(el);
      attachDrag(el);
    });
  }

  function attachDrag(el) {
    let offsetX = 0, offsetY = 0;
    let dragging = false;

    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      el.style.width = rect.width + "px";
      el.classList.add("dragging");
      el.style.left = rect.left + "px";
      el.style.top = rect.top + "px";
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      el.style.left = (e.clientX - offsetX) + "px";
      el.style.top = (e.clientY - offsetY) + "px";

      document.querySelectorAll(".c-drop.hover-target").forEach(s => s.classList.remove("hover-target"));
      el.style.pointerEvents = "none";
      const under = document.elementFromPoint(e.clientX, e.clientY);
      el.style.pointerEvents = "";
      const slot = under && under.closest(".c-drop");
      if (slot && !slot.classList.contains("matched")) slot.classList.add("hover-target");
    });

    el.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      el.style.pointerEvents = "";
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const slot = under && under.closest(".c-drop");
      document.querySelectorAll(".c-drop.hover-target").forEach(s => s.classList.remove("hover-target"));

      if (slot && !slot.classList.contains("matched")) {
        const targetIdx = Number(slot.dataset.qidx);
        const chipIdx = Number(el.dataset.qidx);
        if (targetIdx === chipIdx) {
          slot.textContent = el.textContent;
          slot.classList.add("matched");
          slot.closest(".concept-box").classList.add("matched");
          el.remove();
          matchedCount++;
          matchedCountEl.textContent = matchedCount;
          SA.beep("correct");
          if (matchedCount === pairs.length) {
            SA.confetti(140);
            setTimeout(() => SA.toast("🎉 Đã nối đúng hết các ý!"), 200);
          }
          return;
        } else {
          SA.beep("wrong");
          el.classList.add("wrong-shake");
          setTimeout(() => el.classList.remove("wrong-shake"), 400);
        }
      }
      resetChipPosition(el);
    });

    el.addEventListener("pointercancel", () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      resetChipPosition(el);
    });
  }

  function resetChipPosition(el) {
    el.style.position = "";
    el.style.left = ""; el.style.top = ""; el.style.width = "";
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("pairsInput").value = serializePairs(pairs);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newPairs = parsePairs(document.getElementById("pairsInput").value);
    if (newPairs.length < 2) { SA.toast("Cần ít nhất 2 cặp khái niệm hợp lệ!"); return; }
    pairs = newPairs;
    savePairs(pairs);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    buildGame();
  });

  document.getElementById("restartBtn").addEventListener("click", buildGame);

  buildGame();
})();
