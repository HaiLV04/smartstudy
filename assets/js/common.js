/* ============================================================
   StudyAI — thư viện dùng chung cho các trò chơi
   Không cần đăng nhập / không cần máy chủ: mọi bộ câu hỏi được
   lưu ngay trên trình duyệt của giáo viên (localStorage).
   ============================================================ */

const SA = (() => {

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById("sa-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "sa-toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- Confetti (nhẹ, thuần CSS/JS, không cần thư viện ngoài) ---------- */
  function confetti(count = 80) {
    const colors = ["#0ea5a4", "#2563eb", "#f97316", "#facc15", "#db2777", "#22c55e"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      const size = 6 + Math.random() * 6;
      piece.style.width = size + "px";
      piece.style.height = size * 0.4 + "px";
      piece.style.background = colors[i % colors.length];
      piece.style.left = Math.random() * 100 + "vw";
      const duration = 2200 + Math.random() * 1800;
      const rotate = Math.random() * 360;
      piece.style.transform = `rotate(${rotate}deg)`;
      document.body.appendChild(piece);
      const anim = piece.animate(
        [
          { transform: `translateY(0) rotate(${rotate}deg)`, opacity: 1 },
          { transform: `translateY(${window.innerHeight + 40}px) rotate(${rotate + 360}deg)`, opacity: 0.9 },
        ],
        { duration, easing: "cubic-bezier(.2,.6,.4,1)" }
      );
      anim.onfinish = () => piece.remove();
    }
  }

  /* ---------- Âm thanh phản hồi (WebAudio, không cần file mp3) ---------- */
  let actx = null;
  function beep(type = "correct") {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.connect(g);
      g.connect(actx.destination);
      const now = actx.currentTime;
      if (type === "correct") {
        o.frequency.setValueAtTime(660, now);
        o.frequency.setValueAtTime(880, now + 0.1);
        g.gain.setValueAtTime(0.15, now);
      } else {
        o.frequency.setValueAtTime(220, now);
        o.frequency.setValueAtTime(160, now + 0.12);
        g.gain.setValueAtTime(0.12, now);
      }
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o.start(now);
      o.stop(now + 0.35);
    } catch (e) { /* ignore audio errors (autoplay policies, etc.) */ }
  }

  /* ---------- Modal helpers ---------- */
  function openModal(id) { 
    var el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
    if (window.initGrade1Selector) {
      try { window.initGrade1Selector(); } catch(e) {}
    }
  }
  function closeModal(id) { 
    var el = document.getElementById(id);
    if (el) el.classList.add("hidden"); 
  }

  /* ---------- Tiện ích mảng ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ============================================================
     Ngân hàng câu hỏi trắc nghiệm
     Định dạng văn bản mỗi dòng:
       Câu hỏi | Đáp án đúng | Đáp án sai 1 | Đáp án sai 2 | Đáp án sai 3
     (có thể chỉ cần 1 đáp án sai, tối thiểu 2 lựa chọn)
     ============================================================ */
  const Quiz = {
    parse(text) {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      const items = [];
      for (const line of lines) {
        const parts = line.split("|").map(s => s.trim()).filter(s => s.length > 0);
        if (parts.length < 3) continue; // cần ít nhất câu hỏi + 2 đáp án
        const [q, ...opts] = parts;
        items.push({ q, options: opts, correct: 0 });
      }
      return items;
    },
    serialize(items) {
      return items.map(it => [it.q, it.options[it.correct], ...it.options.filter((_, i) => i !== it.correct)].join(" | ")).join("\n");
    },
    save(key, items) {
      localStorage.setItem("sa_quiz_" + key, JSON.stringify(items));
    },
    load(key, fallback) {
      try {
        const raw = localStorage.getItem("sa_quiz_" + key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : fallback;
      } catch (e) { return fallback; }
    },
    /** Trả về bản sao câu hỏi đã xáo trộn vị trí đáp án, correct được cập nhật lại theo vị trí mới */
    shuffled(items) {
      return items.map(it => {
        const correctText = it.options[it.correct];
        const opts = shuffle(it.options);
        return { q: it.q, options: opts, correct: opts.indexOf(correctText) };
      });
    }
  };

  /* ---------- Danh sách tên (đội / học sinh) ---------- */
  const Names = {
    save(key, names) { localStorage.setItem("sa_names_" + key, JSON.stringify(names)); },
    load(key, fallback) {
      try {
        const raw = localStorage.getItem("sa_names_" + key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : fallback;
      } catch (e) { return fallback; }
    },
    parseText(text) {
      return text.split("\n").map(s => s.trim()).filter(Boolean);
    }
  };

  return { toast, confetti, beep, openModal, closeModal, shuffle, Quiz, Names };
})();



/* ============================================================
   BỘ CHỌN ĐỀ LỚP 1 THEO TUẦN (SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG)
   Thiết kế chia riêng Môn Toán & Tiếng Việt, chọn tuần trực quan
   ============================================================ */
document.addEventListener("DOMContentLoaded", function() {
  function initGrade1Selector() {
    var quizInput = document.getElementById("quizInput");
    if (!quizInput || quizInput.dataset.hasGrade1Picker) return;
    quizInput.dataset.hasGrade1Picker = "true";

    var kntt = window.GRADE1_KNTT || { toan: [], tiengViet: [] };

    // Create main container box
    var box = document.createElement("div");
    box.className = "kntt-picker-box";
    box.style.cssText = "margin-bottom:14px; padding:14px; background:#f8fafc; border:2px solid #38bdf8; border-radius:14px; display:flex; flex-direction:column; gap:10px; box-shadow:0 4px 12px rgba(14,165,233,0.1);";

    // 1. Subject Tabs (Toán vs Tiếng Việt)
    var subTabs = document.createElement("div");
    subTabs.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:10px;";

    var btnToan = document.createElement("button");
    btnToan.type = "button";
    btnToan.innerHTML = "📘 <b>MÔN TOÁN 1</b> <span style='font-size:0.75rem; opacity:0.9;'>(35 Tuần)</span>";
    btnToan.style.cssText = "padding:10px 14px; border-radius:10px; border:2px solid #0284c7; background:#0284c7; color:#fff; font-size:0.92rem; font-weight:800; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:6px;";

    var btnTV = document.createElement("button");
    btnTV.type = "button";
    btnTV.innerHTML = "📕 <b>TIẾNG VIỆT 1</b> <span style='font-size:0.75rem; opacity:0.9;'>(35 Tuần)</span>";
    btnTV.style.cssText = "padding:10px 14px; border-radius:10px; border:2px solid #cbd5e1; background:#ffffff; color:#334155; font-size:0.92rem; font-weight:800; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:6px;";

    subTabs.appendChild(btnToan);
    subTabs.appendChild(btnTV);

    // 2. Semester Bar (Học kì 1 vs Học kì 2)
    var semBar = document.createElement("div");
    semBar.style.cssText = "display:flex; gap:8px; align-items:center; background:#e2e8f0; padding:4px; border-radius:8px;";

    var btnSem1 = document.createElement("button");
    btnSem1.type = "button";
    btnSem1.textContent = "📅 Học kì 1 (Tuần 1 đến 18)";
    btnSem1.style.cssText = "flex:1; padding:7px; border-radius:6px; border:none; background:#ffffff; color:#0f172a; font-weight:800; font-size:0.82rem; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.1);";

    var btnSem2 = document.createElement("button");
    btnSem2.type = "button";
    btnSem2.textContent = "📅 Học kì 2 (Tuần 19 đến 35)";
    btnSem2.style.cssText = "flex:1; padding:7px; border-radius:6px; border:none; background:transparent; color:#64748b; font-weight:700; font-size:0.82rem; cursor:pointer;";

    semBar.appendChild(btnSem1);
    semBar.appendChild(btnSem2);

    // 3. Grid of Weeks buttons (Tuần 1 -> 18 hoặc 19 -> 35)
    var gridLabel = document.createElement("div");
    gridLabel.style.cssText = "font-size:0.8rem; font-weight:800; color:#475569; display:flex; justify-content:space-between; align-items:center;";
    gridLabel.innerHTML = "<span>👉 Bấm vào số tuần để nạp nhanh đề:</span> <span id='knttCurrentSubjectHint' style='color:#0284c7; font-weight:900;'>MÔN TOÁN 1</span>";

    var weeksGrid = document.createElement("div");
    weeksGrid.style.cssText = "display:grid; grid-template-columns:repeat(auto-fill, minmax(52px, 1fr)); gap:6px;";

    // 4. Selected Week Information Card
    var infoCard = document.createElement("div");
    infoCard.style.cssText = "background:#ffffff; border:1.5px solid #0284c7; border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:6px; transition:all 0.2s;";

    // State
    var currentSub = "toan"; // "toan" or "tiengViet"
    var currentSem = 1;      // 1 or 2
    var selectedWeekObj = null;

    function updateView() {
      // Update Subject Tabs styling
      if (currentSub === "toan") {
        btnToan.style.background = "#0284c7";
        btnToan.style.color = "#ffffff";
        btnToan.style.borderColor = "#0284c7";
        btnTV.style.background = "#ffffff";
        btnTV.style.color = "#334155";
        btnTV.style.borderColor = "#cbd5e1";
        document.getElementById("knttCurrentSubjectHint").textContent = "MÔN TOÁN 1";
        document.getElementById("knttCurrentSubjectHint").style.color = "#0284c7";
        infoCard.style.borderColor = "#0284c7";
      } else {
        btnTV.style.background = "#dc2626";
        btnTV.style.color = "#ffffff";
        btnTV.style.borderColor = "#dc2626";
        btnToan.style.background = "#ffffff";
        btnToan.style.color = "#334155";
        btnToan.style.borderColor = "#cbd5e1";
        document.getElementById("knttCurrentSubjectHint").textContent = "MÔN TIẾNG VIỆT 1";
        document.getElementById("knttCurrentSubjectHint").style.color = "#dc2626";
        infoCard.style.borderColor = "#dc2626";
      }

      // Update Semester Bar styling
      if (currentSem === 1) {
        btnSem1.style.background = "#ffffff";
        btnSem1.style.color = "#0f172a";
        btnSem1.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        btnSem2.style.background = "transparent";
        btnSem2.style.color = "#64748b";
        btnSem2.style.boxShadow = "none";
      } else {
        btnSem2.style.background = "#ffffff";
        btnSem2.style.color = "#0f172a";
        btnSem2.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        btnSem1.style.background = "transparent";
        btnSem1.style.color = "#64748b";
        btnSem1.style.boxShadow = "none";
      }

      // Filter weeks list
      var sourceList = currentSub === "toan" ? (kntt.toan || []) : (kntt.tiengViet || []);
      var weeksInSem = sourceList.filter(function(w) { return w.semester === currentSem; });

      // Render week buttons
      weeksGrid.innerHTML = "";
      weeksInSem.forEach(function(w) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "T." + w.week;
        btn.title = w.title;

        var isSelected = selectedWeekObj && selectedWeekObj.week === w.week && selectedWeekObj.subject === w.subject;
        var activeColor = currentSub === "toan" ? "#0284c7" : "#dc2626";

        if (isSelected) {
          btn.style.cssText = "padding:8px 4px; border-radius:8px; border:2px solid " + activeColor + "; background:" + activeColor + "; color:#fff; font-weight:900; font-size:0.85rem; cursor:pointer; transform:scale(1.05); box-shadow:0 3px 6px rgba(0,0,0,0.15);";
        } else {
          btn.style.cssText = "padding:8px 4px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; font-weight:700; font-size:0.82rem; cursor:pointer; transition:all 0.1s;";
          btn.onmouseenter = function() { btn.style.background = "#f1f5f9"; btn.style.borderColor = activeColor; };
          btn.onmouseleave = function() { btn.style.background = "#ffffff"; btn.style.borderColor = "#cbd5e1"; };
        }

        btn.addEventListener("click", function() {
          selectWeek(w);
        });

        weeksGrid.appendChild(btn);
      });

      // Render info card
      if (!selectedWeekObj || selectedWeekObj.semester !== currentSem || (currentSub === "toan" ? selectedWeekObj.subject !== "Toán" : selectedWeekObj.subject !== "Tiếng Việt")) {
        if (weeksInSem.length > 0) {
          selectWeek(weeksInSem[0], false);
        }
      } else {
        renderInfoCard();
      }
    }

    function selectWeek(w, autoFillTextarea) {
      if (autoFillTextarea === undefined) autoFillTextarea = true;
      selectedWeekObj = w;

      if (autoFillTextarea) {
        quizInput.value = w.questions.join("\n");
        if (window.SA && SA.toast) {
          SA.toast("✅ Đã nạp Tuần " + w.week + " (" + w.subject + "): " + w.questions.length + " câu hỏi!");
        }
      }

      renderInfoCard();

      // Highlight active button
      Array.prototype.slice.call(weeksGrid.children).forEach(function(child) {
        if (child.textContent === "T." + w.week) {
          var activeColor = currentSub === "toan" ? "#0284c7" : "#dc2626";
          child.style.border = "2px solid " + activeColor;
          child.style.background = activeColor;
          child.style.color = "#ffffff";
          child.style.fontWeight = "900";
        } else {
          child.style.border = "1px solid #cbd5e1";
          child.style.background = "#ffffff";
          child.style.color = "#334155";
          child.style.fontWeight = "700";
        }
      });
    }

    function renderInfoCard() {
      if (!selectedWeekObj) {
        infoCard.innerHTML = "<div style='color:#64748b; font-size:0.85rem;'>Chưa chọn tuần học.</div>";
        return;
      }

      var w = selectedWeekObj;
      var themeColor = currentSub === "toan" ? "#0284c7" : "#dc2626";

      infoCard.innerHTML = 
        "<div style='display:flex; justify-content:space-between; align-items:flex-start; gap:8px;'>" +
          "<div>" +
            "<div style='font-size:0.75rem; font-weight:800; color:" + themeColor + "; text-transform:uppercase;'>" +
              w.subject + " 1 • HỌC KÌ " + w.semester + " • " + w.icon + " TUẦN " + w.week +
            "</div>" +
            "<div style='font-size:0.98rem; font-weight:800; color:#0f172a; margin:3px 0 2px;'>" + w.title + "</div>" +
            "<div style='font-size:0.8rem; color:#64748b;'>" + (w.lesson || '') + "</div>" +
          "</div>" +
          "<span style='background:#f1f5f9; color:#475569; font-size:0.75rem; font-weight:800; padding:4px 8px; border-radius:6px; white-space:nowrap;'>" +
            w.questions.length + " câu hỏi" +
          "</span>" +
        "</div>" +
        "<div style='display:flex; gap:8px; margin-top:8px; align-items:center;'>" +
          "<button type='button' id='knttManualFillBtn' style='flex:1; padding:7px 12px; background:" + themeColor + "; color:#fff; border:none; border-radius:6px; font-weight:800; font-size:0.82rem; cursor:pointer;'>" +
            "⚡ Nạp lại tuần này vào khung soạn đề" +
          "</button>" +
          "<button type='button' id='knttTogglePrevBtn' style='padding:7px 12px; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; border-radius:6px; font-weight:700; font-size:0.82rem; cursor:pointer;'>" +
            "👁️ Xem câu hỏi" +
          "</button>" +
        "</div>" +
        "<div id='knttPreviewList' style='display:none; margin-top:8px; padding:8px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; max-height:140px; overflow-y:auto; font-size:0.76rem; font-family:monospace; line-height:1.4; color:#334155;'>" +
          w.questions.map(function(q, idx) { return (idx + 1) + ". " + q; }).join("<br>") +
        "</div>";

      document.getElementById("knttManualFillBtn").addEventListener("click", function() {
        quizInput.value = w.questions.join("\n");
        if (window.SA && SA.toast) {
          SA.toast("✅ Đã nạp " + w.title + "!");
        }
      });

      var prevBtn = document.getElementById("knttTogglePrevBtn");
      var prevList = document.getElementById("knttPreviewList");
      prevBtn.addEventListener("click", function() {
        var isHidden = prevList.style.display === "none";
        prevList.style.display = isHidden ? "block" : "none";
        prevBtn.textContent = isHidden ? "✕ Đóng xem" : "👁️ Xem câu hỏi";
      });
    }

    // Events
    btnToan.addEventListener("click", function() {
      currentSub = "toan";
      updateView();
    });

    btnTV.addEventListener("click", function() {
      currentSub = "tiengViet";
      updateView();
    });

    btnSem1.addEventListener("click", function() {
      currentSem = 1;
      updateView();
    });

    btnSem2.addEventListener("click", function() {
      currentSem = 2;
      updateView();
    });

    // Assemble components into box
    box.appendChild(subTabs);
    box.appendChild(semBar);
    box.appendChild(gridLabel);
    box.appendChild(weeksGrid);
    box.appendChild(infoCard);

    // Insert directly before quizInput
    quizInput.parentNode.insertBefore(box, quizInput);

    // Initial render
    updateView();
  }

  window.initGrade1Selector = initGrade1Selector;

  // Ensure grade1-kntt.js is loaded
  function loadScript(src, cb) {
    var p = window.location.pathname.toLowerCase();
    var isSubGame = p.indexOf("/games/") !== -1 || p.indexOf("\\games\\") !== -1;
    var script = document.createElement("script");
    script.src = isSubGame ? "../../" + src : src;
    script.onload = cb;
    document.head.appendChild(script);
  }

  if (!window.GRADE1_KNTT) {
    loadScript("assets/js/grade1-kntt.js", initGrade1Selector);
  } else {
    initGrade1Selector();
  }
});
