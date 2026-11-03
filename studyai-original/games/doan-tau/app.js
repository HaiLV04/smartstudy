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

  const trainTrack = document.getElementById("trainTrack");
  const answerPool = document.getElementById("answerPool");
  const matchedCountEl = document.getElementById("matchedCount");
  const totalCountEl = document.getElementById("totalCount");

  function parsePairs(text) {
    return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const parts = line.split("|").map(s => s.trim());
      return { q: parts[0] || "", a: parts[1] || "" };
    }).filter(p => p.q && p.a);
  }
  function serializePairs(pairs) { return pairs.map(p => `${p.q} | ${p.a}`).join("\n"); }
  function loadPairs() {
    try {
      const raw = localStorage.getItem("sa_pairs_doantau");
      if (!raw) return parsePairs(DEFAULT_PAIRS_TEXT);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : parsePairs(DEFAULT_PAIRS_TEXT);
    } catch (e) { return parsePairs(DEFAULT_PAIRS_TEXT); }
  }
  function savePairs(pairs) { localStorage.setItem("sa_pairs_doantau", JSON.stringify(pairs)); }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  let pairs = loadPairs();
  let matchedCount = 0;

  function buildGame() {
    matchedCount = 0;
    totalCountEl.textContent = pairs.length;
    matchedCountEl.textContent = 0;

    trainTrack.innerHTML = pairs.map((p, i) => `
      <div class="wagon-row">
        <div class="loco">${i === 0 ? "🚂" : "🚃"}</div>
        <div class="q-wagon" data-qidx="${i}">
          <span class="q-text">${escapeHtml(p.q)}</span>
          <div class="drop-slot" data-qidx="${i}">Thả đáp án vào đây</div>
        </div>
      </div>`).join("");

    const shuffledAnswers = SA.shuffle(pairs.map((p, i) => ({ text: p.a, qidx: i })));
    answerPool.innerHTML = "";
    shuffledAnswers.forEach(ans => {
      const el = document.createElement("div");
      el.className = "a-wagon";
      el.textContent = ans.text;
      el.dataset.qidx = ans.qidx;
      answerPool.appendChild(el);
      attachDrag(el);
    });
  }

  function attachDrag(el) {
    let offsetX = 0, offsetY = 0;
    let dragging = false;

    el.addEventListener("pointerdown", (e) => {
      if (el.classList.contains("matched-hidden")) return;
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

      document.querySelectorAll(".drop-slot.hover-target").forEach(s => s.classList.remove("hover-target"));
      el.style.pointerEvents = "none";
      const under = document.elementFromPoint(e.clientX, e.clientY);
      el.style.pointerEvents = "";
      const slot = under && under.closest(".drop-slot");
      if (slot && !slot.classList.contains("matched")) slot.classList.add("hover-target");
    });

    el.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      el.style.pointerEvents = "";
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const slot = under && under.closest(".drop-slot");
      document.querySelectorAll(".drop-slot.hover-target").forEach(s => s.classList.remove("hover-target"));

      if (slot && !slot.classList.contains("matched")) {
        const targetIdx = Number(slot.dataset.qidx);
        const answerIdx = Number(el.dataset.qidx);
        if (targetIdx === answerIdx) {
          slot.textContent = el.textContent;
          slot.classList.add("matched");
          slot.closest(".q-wagon").classList.add("matched");
          el.remove();
          matchedCount++;
          matchedCountEl.textContent = matchedCount;
          SA.beep("correct");
          if (matchedCount === pairs.length) {
            SA.confetti(140);
            setTimeout(() => SA.toast("🎉 Đoàn tàu đã hoàn thành!"), 200);
          }
          return;
        } else {
          SA.beep("wrong");
          el.classList.add("wrong-shake");
          setTimeout(() => el.classList.remove("wrong-shake"), 400);
        }
      }
      // trả toa về vị trí cũ trong pool
      resetWagonPosition(el);
    });
  }

  function resetWagonPosition(el) {
    el.style.position = "";
    el.style.left = ""; el.style.top = ""; el.style.width = "";
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("pairsInput").value = serializePairs(pairs);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newPairs = parsePairs(document.getElementById("pairsInput").value);
    if (newPairs.length < 2) { SA.toast("Cần ít nhất 2 cặp câu hỏi hợp lệ!"); return; }
    pairs = newPairs;
    savePairs(pairs);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu ván mới.");
    buildGame();
  });

  document.getElementById("restartBtn").addEventListener("click", buildGame);

  buildGame();
})();
