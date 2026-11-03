(() => {
  const STORAGE_KEY = "sa_anhtuongtac_data";

  const DEFAULT_HOTSPOTS_TEXT = [
    "Cây xanh | Cây xanh hấp thụ khí gì để quang hợp? | Khí CO2 (cacbonic) | Khí Oxy | Khí Nitơ",
    "Ngôi nhà | Nhà truyền thống của người Việt xưa thường được làm chủ yếu từ vật liệu gì? | Gỗ và tre | Bê tông cốt thép | Kính | Nhựa",
    "Ô tô | Ô tô chạy bằng động cơ đốt trong sử dụng nguồn năng lượng phổ biến nào? | Xăng hoặc dầu | Ánh sáng mặt trăng | Gió | Nước",
    "Chim | Chim thuộc lớp động vật nào trong sinh học? | Lớp Chim (Aves) | Lớp Thú | Lớp Bò sát | Lớp Cá",
    "Mây | Mây trên bầu trời được hình thành chủ yếu từ đâu? | Hơi nước ngưng tụ | Khói bụi | Cát mịn | Muối biển",
    "Mặt Trời | Trong hệ Mặt Trời, Mặt Trời được xếp là loại thiên thể nào? | Một ngôi sao | Một hành tinh | Một vệ tinh | Một sao chổi",
  ].join("\n");

  // Preset pin positions (percent), matched near the themed decoration.
  const PRESET_POS = [
    { left: 13, top: 60 }, // cây
    { left: 46, top: 52 }, // nhà
    { left: 70, top: 84 }, // ô tô
    { left: 60, top: 27 }, // chim
    { left: 30, top: 16 }, // mây
    { left: 84, top: 13 }, // mặt trời
  ];

  const DECORATIONS = [
    { emoji: "☀️", left: 84, top: 8 },
    { emoji: "☁️", left: 30, top: 10 },
    { emoji: "☁️", left: 55, top: 6 },
    { emoji: "🌳", left: 13, top: 52 },
    { emoji: "🏠", left: 46, top: 42 },
    { emoji: "🚗", left: 70, top: 76 },
    { emoji: "🐦", left: 60, top: 20 },
  ];

  const scene = document.getElementById("scene");
  const panel = document.getElementById("hotspotPanel");
  const progressText = document.getElementById("progressText");

  let hotspots = []; // [{label, q, options[], correct}]
  let doneFlags = [];
  let celebrated = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function parseHotspots(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 6);
    const out = [];
    for (const line of lines) {
      const parts = line.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length < 4) continue; // label + question + correct + at least 1 wrong
      const [label, q, ...opts] = parts;
      out.push({ label, q, options: opts, correct: 0 });
    }
    return out;
  }

  function serializeHotspots(list) {
    return list.map(h => [h.label, h.options[h.correct], ...h.options.filter((_, i) => i !== h.correct)].join(" | ")).join("\n");
  }

  function save(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (e) { return null; }
  }

  function shuffledHotspot(h) {
    const correctText = h.options[h.correct];
    const opts = SA.shuffle(h.options);
    return { label: h.label, q: h.q, options: opts, correct: opts.indexOf(correctText) };
  }

  function buildScene() {
    scene.innerHTML = "";
    DECORATIONS.forEach(d => {
      const el = document.createElement("div");
      el.className = "scene-deco";
      el.style.left = d.left + "%";
      el.style.top = d.top + "%";
      el.style.transform = "translate(-50%,-50%)";
      el.textContent = d.emoji;
      scene.appendChild(el);
    });

    doneFlags = hotspots.map(() => false);
    celebrated = false;

    hotspots.forEach((h, i) => {
      const pos = PRESET_POS[i] || { left: 50, top: 50 };
      const pin = document.createElement("div");
      pin.className = "scene-pin";
      pin.style.left = pos.left + "%";
      pin.style.top = pos.top + "%";
      pin.dataset.idx = i;
      pin.innerHTML = `📍<span class="pin-badge">${i + 1}</span>`;
      pin.title = h.label;
      pin.addEventListener("click", () => openHotspot(i));
      scene.appendChild(pin);
    });

    updateProgress();
    renderEmptyPanel();
  }

  function renderEmptyPanel() {
    panel.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🖼️</div>
        <p>Chọn một điểm 📍 trên hình để bắt đầu khám phá!</p>
      </div>`;
  }

  function updateProgress() {
    const done = doneFlags.filter(Boolean).length;
    progressText.textContent = `${done}/${hotspots.length}`;
  }

  function pinEl(idx) { return scene.querySelector(`.scene-pin[data-idx="${idx}"]`); }

  function openHotspot(idx) {
    if (doneFlags[idx]) { renderQuestion(idx, true); return; }
    renderQuestion(idx, false);
  }

  function renderQuestion(idx, alreadyDone) {
    const raw = hotspots[idx];
    const item = shuffledHotspot(raw);
    const keys = ["A", "B", "C", "D", "E", "F"];
    panel.innerHTML = `
      <div class="question-box">
        <div class="hotspot-label">📍 ${idx + 1}. ${escapeHtml(item.label)}${alreadyDone ? " — ✅ đã hoàn thành" : ""}</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid">
          ${item.options.map((opt, i) => `
            <button class="answer-btn" data-idx="${i}" ${alreadyDone ? "disabled" : ""}>
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </button>`).join("")}
        </div>
      </div>`;

    if (alreadyDone) return;

    panel.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        const isCorrect = i === item.correct;
        panel.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });

        if (isCorrect) {
          SA.beep("correct");
          doneFlags[idx] = true;
          const pin = pinEl(idx);
          if (pin) pin.classList.add("done");
          updateProgress();
          SA.toast("✅ Chính xác! Điểm khám phá đã hoàn thành.");
          if (doneFlags.every(Boolean) && !celebrated) {
            celebrated = true;
            setTimeout(() => SA.confetti(130), 300);
          }
        } else {
          SA.beep("wrong");
          setTimeout(() => { if (!doneFlags[idx]) renderQuestion(idx, false); }, 1200);
        }
      });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("hotspotInput").value = serializeHotspots(hotspots);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newHotspots = parseHotspots(document.getElementById("hotspotInput").value);
    if (newHotspots.length < 1) { SA.toast("Cần ít nhất 1 điểm khám phá hợp lệ!"); return; }
    hotspots = newHotspots;
    save(hotspots);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu! Bắt đầu lại các điểm khám phá.");
    buildScene();
  });

  document.getElementById("restartBtn").addEventListener("click", buildScene);

  const saved = load();
  hotspots = saved || parseHotspots(DEFAULT_HOTSPOTS_TEXT);

  buildScene();
})();
