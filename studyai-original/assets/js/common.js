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
  function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
  function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

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
   Tự động gắn thanh "Nạp nhanh bộ đề Lớp 1" vào ô soạn câu hỏi
   ============================================================ */
document.addEventListener("DOMContentLoaded", function() {
  function initGrade1Selector() {
    var quizInput = document.getElementById("quizInput");
    if (!quizInput || quizInput.dataset.hasGrade1Select) return;
    quizInput.dataset.hasGrade1Select = "true";

    var wrap = document.createElement("div");
    wrap.className = "grade1-quick-select";
    wrap.style.cssText = "margin-bottom:10px; padding:10px 14px; background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; box-shadow:0 2px 4px rgba(37,99,235,0.06);";

    var label = document.createElement("span");
    label.style.cssText = "font-size:0.85rem; font-weight:800; color:#1e40af; display:flex; align-items:center; gap:6px;";
    label.innerHTML = "⚡ Nạp nhanh đề Lớp 1:";

    var select = document.createElement("select");
    select.style.cssText = "flex:1; min-width:240px; padding:8px 12px; font-size:0.85rem; border-radius:8px; border:1px solid #93c5fd; background:#fff; font-weight:700; color:#0f172a; cursor:pointer;";
    
    var optionsHtml = '<option value="">-- Chọn chuyên đề Lớp 1 chuẩn có sẵn --</option>';
    if (window.GRADE1_QUESTIONS && Array.isArray(window.GRADE1_QUESTIONS)) {
      window.GRADE1_QUESTIONS.forEach(function(t) {
        optionsHtml += '<option value="' + t.id + '">' + t.icon + ' [' + t.subject + ' 1] ' + t.title + ' (' + t.questions.length + ' câu)</option>';
      });
    }
    select.innerHTML = optionsHtml;

    select.addEventListener("change", function() {
      var selectedId = select.value;
      if (!selectedId || !window.GRADE1_QUESTIONS) return;
      var topic = window.GRADE1_QUESTIONS.find(function(t) { return t.id === selectedId; });
      if (topic) {
        quizInput.value = topic.questions.join("\n");
        if (window.SA && SA.toast) {
          SA.toast("Đã nạp " + topic.questions.length + " câu " + topic.title + "!");
        }
      }
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    quizInput.parentNode.insertBefore(wrap, quizInput);
  }

  if (!window.GRADE1_QUESTIONS) {
    var script = document.createElement("script");
    var isSubGame = window.location.pathname.indexOf("/games/") !== -1;
    script.src = isSubGame ? "../../assets/js/grade1-questions.js" : "assets/js/grade1-questions.js";
    script.onload = initGrade1Selector;
    document.head.appendChild(script);
  } else {
    initGrade1Selector();
  }
});
