(() => {
  const DEFAULT_TOPIC = "Việt Nam";
  const DEFAULT_BRANCHES_TEXT = [
    "Địa lý | Diện tích khoảng 331.212 km², 63 tỉnh thành, Giáp Biển Đông",
    "Lịch sử | Thời đại Hùng Vương, Kháng chiến chống Pháp, Kháng chiến chống Mỹ",
    "Văn hoá | Áo dài, Tết Nguyên Đán, Đờn ca tài tử",
    "Con người | Hơn 100 triệu dân, 54 dân tộc anh em",
    "Ẩm thực | Phở, Bánh mì, Bún chả",
    "Kinh tế | Nông nghiệp lúa nước, Xuất khẩu dệt may, Du lịch biển",
  ].join("\n");

  const STORAGE_KEY = "sa_sodotuduy_data";

  const stage = document.getElementById("mindmapStage");
  const svg = document.getElementById("mmLines");
  const progressText = document.getElementById("progressText");

  let topic = DEFAULT_TOPIC;
  let branches = []; // [{main, subs:[string,...]}]
  let subState = []; // parallel: [{revealed:boolean}] per flattened sub, indexed by branchIdx/subIdx
  let totalSubs = 0;
  let revealedCount = 0;
  let completed = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function parseMindMap(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const out = [];
    for (const line of lines) {
      const idx = line.indexOf("|");
      let main, subsRaw;
      if (idx === -1) { main = line; subsRaw = ""; }
      else { main = line.slice(0, idx).trim(); subsRaw = line.slice(idx + 1).trim(); }
      if (!main) continue;
      const subs = subsRaw.split(",").map(s => s.trim()).filter(Boolean);
      out.push({ main, subs });
    }
    return out;
  }

  function serializeMindMap(list) {
    return list.map(b => b.main + " | " + b.subs.join(", ")).join("\n");
  }

  function save(newTopic, newBranches) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ topic: newTopic, branches: newBranches }));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.topic === "string" && Array.isArray(parsed.branches) && parsed.branches.length) return parsed;
      return null;
    } catch (e) { return null; }
  }

  function nodePos(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180;
    return { left: 50 + radius * Math.cos(rad), top: 50 + radius * Math.sin(rad) };
  }

  function buildStage() {
    stage.querySelectorAll(".mm-node").forEach(n => n.remove());
    svg.innerHTML = "";
    subState = [];
    totalSubs = 0;
    revealedCount = 0;
    completed = false;

    // Center node
    const center = document.createElement("div");
    center.className = "mm-node mm-center";
    center.style.left = "50%";
    center.style.top = "50%";
    center.textContent = topic;
    stage.appendChild(center);

    const n = branches.length;
    branches.forEach((branch, bi) => {
      const mainAngle = -90 + (bi * 360) / n;
      const mainPos = nodePos(mainAngle, 30);
      const mainEl = document.createElement("div");
      mainEl.className = "mm-node mm-main";
      mainEl.style.left = mainPos.left + "%";
      mainEl.style.top = mainPos.top + "%";
      mainEl.textContent = branch.main;
      stage.appendChild(mainEl);

      drawLine(50, 50, mainPos.left, mainPos.top);

      const m = branch.subs.length;
      const spread = m > 1 ? Math.min(75, 20 * (m - 1)) : 0;
      subState[bi] = [];
      branch.subs.forEach((subText, si) => {
        const subAngle = m > 1 ? mainAngle - spread / 2 + (spread * si) / (m - 1) : mainAngle;
        const subPos = nodePos(subAngle, 45);
        const subEl = document.createElement("div");
        subEl.className = "mm-node mm-sub";
        subEl.style.left = subPos.left + "%";
        subEl.style.top = subPos.top + "%";
        subEl.textContent = "❓";
        subEl.dataset.bi = bi;
        subEl.dataset.si = si;
        subEl.title = "Bấm để mở nhánh";
        stage.appendChild(subEl);
        subState[bi][si] = { revealed: false, el: subEl, text: subText };
        totalSubs++;

        drawLine(mainPos.left, mainPos.top, subPos.left, subPos.top, true);

        subEl.addEventListener("click", () => revealSub(bi, si));
      });
    });

    updateProgress();
  }

  function drawLine(x1, y1, x2, y2, dashed) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", dashed ? "#cbd5e1" : "#93c5fd");
    line.setAttribute("stroke-width", dashed ? "0.4" : "0.6");
    if (dashed) line.setAttribute("stroke-dasharray", "1.5,1.5");
    line.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(line);
  }

  function revealSub(bi, si) {
    const st = subState[bi][si];
    if (!st || st.revealed) return;
    const el = st.el;
    el.classList.add("flip-out");
    setTimeout(() => {
      el.textContent = st.text;
      el.classList.remove("flip-out");
      el.classList.add("revealed");
      el.title = "";
      st.revealed = true;
      revealedCount++;
      SA.beep("correct");
      updateProgress();
      if (revealedCount >= totalSubs && !completed) {
        completed = true;
        SA.confetti(120);
        SA.toast("🎉 Đã mở hết sơ đồ tư duy!");
      }
    }, 180);
  }

  function updateProgress() {
    progressText.textContent = `${revealedCount}/${totalSubs}`;
  }

  function revealAll() {
    branches.forEach((branch, bi) => {
      branch.subs.forEach((subText, si) => {
        const st = subState[bi][si];
        if (st && !st.revealed) {
          st.el.textContent = st.text;
          st.el.classList.remove("flip-out");
          st.el.classList.add("revealed");
          st.el.title = "";
          st.revealed = true;
          revealedCount++;
        }
      });
    });
    updateProgress();
    if (totalSubs > 0 && !completed) {
      completed = true;
      SA.confetti(120);
      SA.toast("🎉 Đã hiện toàn bộ sơ đồ tư duy!");
    }
  }

  function resetAll() {
    buildStage();
    SA.toast("Đã đặt lại sơ đồ — các nhánh phụ đã được ẩn.");
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("topicInput").value = topic;
    document.getElementById("branchInput").value = serializeMindMap(branches);
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newTopic = document.getElementById("topicInput").value.trim() || DEFAULT_TOPIC;
    const newBranches = parseMindMap(document.getElementById("branchInput").value);
    if (newBranches.length < 1) { SA.toast("Cần ít nhất 1 nhánh chính hợp lệ!"); return; }
    topic = newTopic;
    branches = newBranches;
    save(topic, branches);
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu sơ đồ tư duy mới!");
    buildStage();
  });

  document.getElementById("revealAllBtn").addEventListener("click", revealAll);
  document.getElementById("resetBtn").addEventListener("click", resetAll);

  const saved = load();
  if (saved) { topic = saved.topic; branches = saved.branches; }
  else { topic = DEFAULT_TOPIC; branches = parseMindMap(DEFAULT_BRANCHES_TEXT); }

  buildStage();
})();
