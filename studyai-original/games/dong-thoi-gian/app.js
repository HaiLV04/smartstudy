(() => {
  const DEFAULT_EVENTS_TEXT = [
    "Năm 1010 — Vua Lý Thái Tổ dời đô về Thăng Long",
    "Năm 1428 — Lê Lợi lên ngôi, lập ra nhà Hậu Lê",
    "Năm 1802 — Nguyễn Ánh lên ngôi, lập ra triều Nguyễn",
    "Năm 1930 — Thành lập Đảng Cộng sản Việt Nam",
    "Năm 1945 — Cách mạng Tháng Tám thành công",
    "Năm 1954 — Chiến thắng Điện Biên Phủ",
    "Năm 1975 — Giải phóng miền Nam, thống nhất đất nước",
    "Năm 1986 — Bắt đầu công cuộc Đổi mới",
  ].join("\n");

  const CARD_STEP = 72; // height (56) + margin-bottom (16)

  const container = document.getElementById("timelineContainer");
  const statusEl = document.getElementById("timelineStatus");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function parseEvents(text) {
    return text.split("\n").map(l => l.trim()).filter(Boolean);
  }
  function loadEvents() {
    try {
      const raw = localStorage.getItem("sa_events_dongthoigian");
      if (!raw) return parseEvents(DEFAULT_EVENTS_TEXT);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length >= 2 ? parsed : parseEvents(DEFAULT_EVENTS_TEXT);
    } catch (e) { return parseEvents(DEFAULT_EVENTS_TEXT); }
  }
  function saveEvents(events) { localStorage.setItem("sa_events_dongthoigian", JSON.stringify(events)); }

  let events = loadEvents();   // events[i] is correct-position text; key === correct index
  let order = [];              // order[displayPos] = key (original correct index)
  let cardEls = {};            // key -> element
  let checked = false;

  function layout(animate) {
    order.forEach((key, pos) => {
      const el = cardEls[key];
      if (!el) return;
      if (!animate) el.style.transition = "none";
      el.style.top = (pos * CARD_STEP) + "px";
      if (!animate) {
        // force reflow then restore transition
        void el.offsetHeight;
        el.style.transition = "";
      }
    });
  }

  function buildGame() {
    checked = false;
    statusEl.textContent = "Kéo thẻ để sắp xếp, sau đó bấm kiểm tra.";
    container.style.height = (events.length * CARD_STEP - 16) + "px";
    order = SA.shuffle(events.map((_, i) => i));
    cardEls = {};

    container.innerHTML = "";
    order.forEach((key) => {
      const el = document.createElement("div");
      el.className = "timeline-card";
      el.dataset.key = key;
      el.innerHTML = `
        <span class="tl-handle">⠿</span>
        <span class="tl-num">?</span>
        <span class="tl-text">${escapeHtml(events[key])}</span>`;
      container.appendChild(el);
      cardEls[key] = el;
      attachDrag(el, key);
    });
    layout(false);
  }

  function attachDrag(el, key) {
    let dragging = false;
    let startY = 0;
    let startTop = 0;
    const maxTop = (events.length - 1) * CARD_STEP;

    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      startY = e.clientY;
      startTop = parseFloat(el.style.top) || 0;
      el.classList.add("dragging");
      el.classList.remove("correct", "incorrect");
      checked = false;
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      let newTop = startTop + (e.clientY - startY);
      newTop = Math.max(0, Math.min(maxTop, newTop));
      el.style.top = newTop + "px";

      const targetPos = Math.round(newTop / CARD_STEP);
      const currentPos = order.indexOf(key);
      if (targetPos !== currentPos && targetPos >= 0 && targetPos < order.length) {
        order.splice(currentPos, 1);
        order.splice(targetPos, 0, key);
        order.forEach((k, pos) => { if (k !== key) cardEls[k].style.top = (pos * CARD_STEP) + "px"; });
      }
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("dragging");
      const pos = order.indexOf(key);
      el.style.top = (pos * CARD_STEP) + "px";
    }

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
  }

  function checkOrder() {
    checked = true;
    let correctCount = 0;
    order.forEach((key, pos) => {
      const el = cardEls[key];
      el.classList.remove("correct", "incorrect");
      el.querySelector(".tl-num").textContent = pos + 1;
      if (key === pos) {
        el.classList.add("correct");
        correctCount++;
      } else {
        el.classList.add("incorrect");
      }
    });

    if (correctCount === order.length) {
      SA.beep("correct");
      SA.confetti(150);
      statusEl.textContent = `🎉 Chính xác hoàn toàn! Bạn đã sắp xếp đúng cả ${order.length} sự kiện.`;
      setTimeout(() => SA.toast("🎉 Dòng thời gian đã đúng thứ tự!"), 200);
    } else {
      SA.beep("wrong");
      statusEl.textContent = `Đúng vị trí: ${correctCount}/${order.length}. Hãy kéo lại thẻ màu đỏ rồi kiểm tra tiếp!`;
    }
  }

  document.getElementById("checkOrderBtn").addEventListener("click", checkOrder);

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("eventsInput").value = events.join("\n");
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newEvents = parseEvents(document.getElementById("eventsInput").value);
    if (newEvents.length < 2) { SA.toast("Cần ít nhất 2 sự kiện hợp lệ!"); return; }
    events = newEvents;
    saveEvents(events);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Sự kiện đã được xáo trộn lại.");
    buildGame();
  });

  document.getElementById("restartBtn").addEventListener("click", buildGame);

  buildGame();
})();
