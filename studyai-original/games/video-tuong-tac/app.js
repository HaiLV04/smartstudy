(() => {
  const STORAGE_KEY = "sa_video_tuongtac_data";
  const API_LOAD_TIMEOUT_MS = 9000;
  const POLL_INTERVAL_MS = 250;

  const DEFAULT_TIMED_TEXT = [
    "10 | Hình khối nào có 6 mặt hình vuông bằng nhau? | Hình lập phương | Hình cầu | Hình trụ | Hình chóp",
    "25 | Thủ đô của Việt Nam là gì? | Hà Nội | Đà Nẵng | TP. Hồ Chí Minh | Huế",
    "40 | 9 x 3 bằng bao nhiêu? | 27 | 24 | 21 | 30",
  ].join("\n");

  const placeholderState = document.getElementById("placeholderState");
  const playerArea = document.getElementById("playerArea");
  const errorState = document.getElementById("errorState");
  const errorText = document.getElementById("errorText");
  const ytWrap = document.getElementById("ytWrap");
  const overlay = document.getElementById("videoOverlay");
  const timerChip = document.getElementById("timerChip");
  const scoreRow = document.getElementById("scoreRow");
  const progressText = document.getElementById("progressText");

  let videoId = "";
  let timedQuestions = []; // [{sec, q, options[], correct}]
  let player = null;
  let pollTimer = null;
  let askedIdx = new Set();
  let correctCount = 0;
  let apiReady = false;
  let apiLoadTimer = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function extractYouTubeId(input) {
    const raw = (input || "").trim();
    if (!raw) return "";
    const m = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    return raw; // let it try as-is (may simply fail to load, handled gracefully)
  }

  function parseTimedQuestions(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const out = [];
    for (const line of lines) {
      const parts = line.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length < 4) continue; // giây + câu hỏi + đúng + ít nhất 1 sai
      const sec = parseInt(parts[0], 10);
      if (!Number.isFinite(sec) || sec < 0) continue;
      const q = parts[1];
      const opts = parts.slice(2);
      out.push({ sec, q, options: opts, correct: 0 });
    }
    out.sort((a, b) => a.sec - b.sec);
    return out;
  }

  function serializeTimedQuestions(list) {
    return list.map(t => [t.sec, t.q, t.options[t.correct], ...t.options.filter((_, i) => i !== t.correct)].join(" | ")).join("\n");
  }

  function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.videoId === "string" && Array.isArray(parsed.questions)) return parsed;
      return null;
    } catch (e) { return null; }
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  }

  function showState(name) {
    placeholderState.classList.toggle("hidden", name !== "placeholder");
    playerArea.classList.toggle("hidden", name !== "player");
    errorState.classList.toggle("hidden", name !== "error");
    scoreRow.style.display = name === "player" ? "flex" : "none";
  }

  function showError(msg) {
    errorText.textContent = msg;
    showState("error");
  }

  function updateProgress() {
    progressText.textContent = `${correctCount}/${timedQuestions.length}`;
  }

  function loadYouTubeApi(onReady) {
    if (window.YT && window.YT.Player) { onReady(); return; }
    const existing = document.getElementById("sa-yt-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "sa-yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => showError("Không thể tải trình phát YouTube — vui lòng kiểm tra kết nối mạng và thử lại.");
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      if (apiLoadTimer) clearTimeout(apiLoadTimer);
      onReady();
    };
    apiLoadTimer = setTimeout(() => {
      if (!apiReady) showError("Không thể tải trình phát video (mất quá nhiều thời gian). Vui lòng kiểm tra kết nối mạng và thử lại.");
    }, API_LOAD_TIMEOUT_MS);
  }

  function startVideo() {
    if (!videoId) { showState("placeholder"); return; }
    showState("player");
    askedIdx = new Set();
    correctCount = 0;
    updateProgress();
    overlay.classList.add("hidden");
    overlay.innerHTML = "";
    timerChip.classList.remove("hidden");
    timerChip.textContent = "▶ Đang phát...";

    loadYouTubeApi(() => {
      try {
        if (player && player.destroy) { player.destroy(); player = null; }
        document.getElementById("ytPlayer").outerHTML = '<div id="ytPlayer"></div>';
        player = new YT.Player("ytPlayer", {
          videoId: videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: () => { startPolling(); },
            onStateChange: onPlayerStateChange,
            onError: () => showError("Không thể phát video này — vui lòng kiểm tra lại ID video YouTube trong phần cài đặt."),
          },
        });
      } catch (e) {
        showError("Đã có lỗi khi khởi tạo trình phát video.");
      }
    });
  }

  function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.ENDED) {
      stopPolling();
      timerChip.textContent = "🏁 Video đã kết thúc";
      if (timedQuestions.length > 0) {
        SA.toast(`Video kết thúc — trả lời đúng ${correctCount}/${timedQuestions.length} câu.`);
        if (correctCount === timedQuestions.length) SA.confetti(100);
      }
    } else if (e.data === YT.PlayerState.PLAYING) {
      timerChip.textContent = "▶ Đang phát...";
      startPolling();
    } else if (e.data === YT.PlayerState.PAUSED) {
      timerChip.textContent = "⏸ Tạm dừng";
    }
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(pollTime, POLL_INTERVAL_MS);
  }
  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  function pollTime() {
    if (!player || !player.getCurrentTime) return;
    let t;
    try { t = player.getCurrentTime(); } catch (e) { return; }
    timerChip.textContent = "▶ " + fmtTime(Math.floor(t));
    for (let i = 0; i < timedQuestions.length; i++) {
      if (askedIdx.has(i)) continue;
      if (t >= timedQuestions[i].sec) {
        askedIdx.add(i);
        askQuestion(i);
        break;
      }
    }
  }

  function askQuestion(idx) {
    stopPolling();
    try { player.pauseVideo(); } catch (e) { /* ignore */ }
    const raw = timedQuestions[idx];
    const correctText = raw.options[raw.correct];
    const opts = SA.shuffle(raw.options);
    const item = { q: raw.q, options: opts, correct: opts.indexOf(correctText) };
    const keys = ["A", "B", "C", "D", "E", "F"];

    overlay.innerHTML = `
      <div class="question-box">
        <div class="question-progress" style="color:#facc15;">⏱ Giây ${raw.sec} — Dừng video để trả lời</div>
        <div class="question-text">${escapeHtml(item.q)}</div>
        <div class="answer-grid">
          ${item.options.map((opt, i) => `
            <button class="answer-btn" data-idx="${i}">
              <span class="opt-key">${keys[i]}</span> ${escapeHtml(opt)}
            </button>`).join("")}
        </div>
      </div>`;
    overlay.classList.remove("hidden");

    overlay.querySelectorAll(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        const isCorrect = i === item.correct;
        overlay.querySelectorAll(".answer-btn").forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.idx) === item.correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });
        if (isCorrect) { SA.beep("correct"); correctCount++; }
        else { SA.beep("wrong"); }
        updateProgress();

        setTimeout(() => {
          overlay.classList.add("hidden");
          overlay.innerHTML = "";
          try { player.playVideo(); } catch (e) { /* ignore */ }
        }, 1300);
      }, { once: true });
    });
  }

  document.getElementById("openSettingsBtn").addEventListener("click", openSettings);
  document.getElementById("openSettingsFromEmptyBtn").addEventListener("click", openSettings);

  function openSettings() {
    document.getElementById("videoIdInput").value = videoId;
    document.getElementById("timedQInput").value = serializeTimedQuestions(timedQuestions);
    SA.openModal("settingsModal");
  }

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const idRaw = document.getElementById("videoIdInput").value.trim();
    const newId = extractYouTubeId(idRaw);
    const newQs = parseTimedQuestions(document.getElementById("timedQInput").value);

    stopPolling();
    if (player && player.destroy) { try { player.destroy(); } catch (e) {} player = null; }

    videoId = newId;
    timedQuestions = newQs;
    save({ videoId, questions: timedQuestions });
    SA.closeModal("settingsModal");

    if (!videoId) {
      showState("placeholder");
      SA.toast("Đã lưu — chưa có video nào được cấu hình.");
      return;
    }
    SA.toast("Đã lưu! Đang tải video...");
    startVideo();
  });

  const saved = load();
  if (saved) {
    videoId = saved.videoId || "";
    timedQuestions = Array.isArray(saved.questions) ? saved.questions : [];
  } else {
    videoId = "";
    timedQuestions = parseTimedQuestions(DEFAULT_TIMED_TEXT);
    save({ videoId, questions: timedQuestions });
  }

  if (videoId) startVideo();
  else showState("placeholder");
})();
