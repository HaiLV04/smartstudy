(() => {
  /* ============================================================
     ONLINE-STOPWATCH STYLE DUCK RACE WITH EDUCATIONAL TWIST
     ============================================================ */

  // Vibrant color palette for ducks (up to 50 distinct colors)
  const DUCK_COLORS = [
    "#facc15", "#fb923c", "#38bdf8", "#4ade80", "#f472b6",
    "#a78bfa", "#f87171", "#2dd4bf", "#fbbf24", "#34d399",
    "#60a5fa", "#e879f9", "#f59e0b", "#10b981", "#06b6d4",
    "#8b5cf6", "#ec4899", "#84cc16", "#14b8a6", "#6366f1",
    "#d946ef", "#0ea5e9", "#ef4444", "#eab308", "#22c55e",
    "#a855f7", "#059669", "#0284c7", "#f43f5e", "#78716c"
  ];

  // 33 students of Class 1B1
  const LOP_1B1_NAMES = [
    "Nguyễn Hoàng Anh",
    "Nguyễn Quỳnh Anh",
    "Nguyễn Thiện Nhật Anh",
    "Lê Gia Bảo",
    "Nguyễn Khắc Quốc Bảo",
    "Chu Thị Linh Chi",
    "Hoàng Thùy Dung",
    "Cao Anh Dũng",
    "Phan Nguyễn Bảo Duy",
    "Lê Hà Giang",
    "Hoàng Gia Hân",
    "Nguyễn Mạnh Hoàng",
    "Bùi Quang Huy",
    "Lê Gia Hưng",
    "Nguyễn Anh Khang",
    "Nguyễn Đình Bảo Khang",
    "Nguyễn Xuân Minh Khang",
    "Phạm Nguyên Khang",
    "Võ Tuấn Kiệt",
    "Trần Hương Ly",
    "Lê Hữu Nhật Minh",
    "Nguyễn Phan Hà My",
    "Trương Thị Bảo Ngân",
    "Bùi Khánh Ngọc",
    "Phan Bảo Ngọc",
    "Nguyễn Trọng Nhân",
    "Nguyễn Tuấn Phát",
    "Lê Quốc Phong",
    "Nguyễn Hữu Phúc",
    "Bùi Dương Hoài Thương",
    "Hoàng Minh Trang",
    "Trần Nguyễn Minh Triết",
    "Nguyễn Tường Vy"
  ];

  // Default 23 student names matching Online-Stopwatch sample
  const DEFAULT_23_NAMES = [
    "Minh Khang", "Bảo An", "Gia Huy", "Tú Anh", "Hải Đăng",
    "Hoàng Nam", "Ngọc Diệp", "Quang Vinh", "Thảo My", "Đức Anh",
    "Phương Linh", "Khánh An", "Tuấn Kiệt", "Minh Châu", "Bảo Nam",
    "Thanh Trúc", "Việt Hoàng", "Quỳnh Nga", "Anh Dũng", "Hồng Nhung",
    "Bảo Long", "Bích Phương", "Tiến Phát"
  ];

  const DEFAULT_QUIZ_TEXT = [
    "6 x 7 bằng bao nhiêu? | 42 | 48 | 36 | 40",
    "Thủ đô của nước Pháp là gì? | Paris | London | Berlin | Rome",
    "Con vịt thuộc nhóm động vật nào? | Nhóm Chim | Bò sát | Lưỡng cư | Côn trùng",
    "Ai là người phát minh ra bóng đèn điện? | Thomas Edison | Isaac Newton | Albert Einstein | Nikola Tesla",
    "Việt Nam giành độc lập vào năm nào? | 1945 | 1954 | 1975 | 1930",
    "Phân số 1/2 bằng bao nhiêu phần trăm? | 50% | 25% | 75% | 10%",
    "Núi nào cao nhất Việt Nam? | Fansipan | Bà Đen | Bạch Mã | Yên Tử",
    "Cây xanh hấp thụ khí gì để quang hợp? | Khí CO2 | Khí Oxy | Khí Nitơ | Khí Hydro",
    "Đơn vị đo độ dài em học ở lớp 1 là gì? | Xăng-ti-mét (cm) | Mét (m) | Ki-lô-mét (km) | Ki-lô-gam (kg)"
  ].join("\n");

  // DOM elements
  const canvas = document.getElementById("raceCanvas");
  const ctx = canvas.getContext("2d");
  const arenaWrap = document.getElementById("arenaWrap");
  const swimBtn = document.getElementById("swimBtn");
  const resetBtn = document.getElementById("resetBtn");
  const fullscreenToggleBtn = document.getElementById("fullscreenToggleBtn");
  const hudRacersCount = document.getElementById("hudRacersCount");
  const hudProgressFill = document.getElementById("hudProgressFill");
  const hudTimerBadge = document.getElementById("hudTimerBadge");

  const winnerPanel = document.getElementById("winnerPanel");
  const winnerMainTitle = document.getElementById("winnerMainTitle");
  const podiumRow = document.getElementById("podiumRow");
  const quizQuestionText = document.getElementById("quizQuestionText");
  const quizAnswersGrid = document.getElementById("quizAnswersGrid");
  const quizFeedbackArea = document.getElementById("quizFeedbackArea");
  const quizFeedbackText = document.getElementById("quizFeedbackText");
  const nextRaceBtn = document.getElementById("nextRaceBtn");

  // Settings
  let names = SA.Names.load("duavit", LOP_1B1_NAMES);
  if (names.length === 23 && names[0] === "Minh Khang" && names[1] === "Bảo An") {
    names = LOP_1B1_NAMES;
  }
  let quizPool = SA.Quiz.load("duavit", SA.Quiz.parse(DEFAULT_QUIZ_TEXT));
  let raceDurationSec = parseInt(localStorage.getItem("sa_duavit_duration") || "25");

  // Race Physics & River Constants
  const RIVER_WIDTH = 5500; // Total track length in world coordinates
  const START_X = 120;
  const FINISH_X = RIVER_WIDTH - 250;
  let canvasWidth = 1200;
  let canvasHeight = 520;

  let ducks = [];
  let isRacing = false;
  let raceStartTime = 0;
  let cameraX = 0;
  let targetCameraX = 0;
  let animationFrameId = null;
  let finishedRankings = [];
  let winnerDuck = null;

  // WebAudio Sound Synthesizer
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    try {
      const actx = getAudioContext();
      const now = actx.currentTime;

      if (type === "horn") {
        // Start horn whistle
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === "quack") {
        // Cute duck quack sound
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.1);
        osc.frequency.linearRampToValueAtTime(250, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "splash") {
        // Water splash noise
        const bufferSize = actx.sampleRate * 0.2;
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = actx.createBufferSource();
        noise.buffer = buffer;
        const gain = actx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        noise.connect(gain);
        gain.connect(actx.destination);
        noise.start(now);
      } else if (type === "victory") {
        // Trumpet fanfare chords
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.15, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.6);
        });
      }
    } catch (e) { /* ignore audio policy restrictions */ }
  }

  // Resize canvas to match display size
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvasWidth = rect.width || 1200;
    canvasHeight = rect.height || 520;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }
  window.addEventListener("resize", resizeCanvas);

  // Initialize ducks in the river
  function initDucks() {
    resizeCanvas();
    const riverTop = 70;
    const riverBottom = canvasHeight - 70;
    const riverHeight = riverBottom - riverTop;
    const laneHeight = riverHeight / Math.max(names.length, 1);

    ducks = names.map((name, index) => {
      const color = DUCK_COLORS[index % DUCK_COLORS.length];
      const targetY = riverTop + laneHeight * (index + 0.5) + (Math.random() * 12 - 6);
      return {
        id: index,
        name: name,
        color: color,
        x: START_X + (Math.random() * 40 - 20),
        y: targetY,
        baseY: targetY,
        speed: 1,
        targetSpeed: 1,
        finished: false,
        finishTime: 0,
        rank: 0,
        burstTimer: Math.random() * 100,
        wobble: Math.random() * Math.PI * 2,
        quackCooldown: Math.random() * 200 + 100,
        ripples: []
      };
    });

    hudRacersCount.textContent = `🦆 ${ducks.length} Chú vịt tham gia`;
    hudTimerBadge.textContent = `⏱️ Thời gian: ${raceDurationSec}s`;
    hudProgressFill.style.width = "0%";
    cameraX = 0;
    targetCameraX = 0;
    finishedRankings = [];
    winnerDuck = null;
    isRacing = false;
    winnerPanel.style.display = "none";
    swimBtn.disabled = false;
    swimBtn.textContent = "🌊 XUẤT PHÁT! (BƠI ĐUA)";
  }

  // Draw River Background with grassy banks, ripples, finish line
  function drawRiver(time) {
    const bankHeight = 55;

    // 1. Water gradient background
    const waterGrad = ctx.createLinearGradient(0, bankHeight, 0, canvasHeight - bankHeight);
    waterGrad.addColorStop(0, "#0284c7");
    waterGrad.addColorStop(0.5, "#38bdf8");
    waterGrad.addColorStop(1, "#0369a1");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, bankHeight, canvasWidth, canvasHeight - bankHeight * 2);

    // 2. Animated water ripples & current lines
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 2;
    const rippleSpacing = 160;
    const flowOffset = (time * 120) % rippleSpacing;

    for (let x = -flowOffset - 50; x < canvasWidth + 100; x += rippleSpacing) {
      for (let y = bankHeight + 25; y < canvasHeight - bankHeight - 20; y += 45) {
        const waveX = x + Math.sin(y * 0.05 + time * 3) * 15;
        ctx.beginPath();
        ctx.moveTo(waveX, y);
        ctx.bezierCurveTo(waveX + 30, y - 6, waveX + 50, y + 6, waveX + 80, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Start Line Banner in world coordinates
    const screenStartX = START_X - cameraX;
    if (screenStartX > -100 && screenStartX < canvasWidth + 100) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(screenStartX, bankHeight);
      ctx.lineTo(screenStartX, canvasHeight - bankHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      // Start label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("XUẤT PHÁT", screenStartX - 35, bankHeight + 20);
      ctx.restore();
    }

    // 4. Finish Line Ribbon & Buoys in world coordinates
    const screenFinishX = FINISH_X - cameraX;
    if (screenFinishX > -150 && screenFinishX < canvasWidth + 200) {
      ctx.save();
      // Checkered finish line pattern
      const checkSize = 14;
      const count = Math.ceil((canvasHeight - bankHeight * 2) / checkSize);
      for (let i = 0; i < count; i++) {
        for (let col = 0; col < 2; col++) {
          ctx.fillStyle = (i + col) % 2 === 0 ? "#ffffff" : "#ef4444";
          ctx.fillRect(screenFinishX + col * checkSize, bankHeight + i * checkSize, checkSize, checkSize);
        }
      }
      // Finish line banner text
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 6;
      ctx.font = "900 18px sans-serif";
      ctx.fillText("🏁 ĐÍCH ĐẾN", screenFinishX - 25, bankHeight - 12);
      ctx.restore();
    }

    // 5. Grassy banks (Top & Bottom)
    ctx.save();
    // Top Grass
    const topGrass = ctx.createLinearGradient(0, 0, 0, bankHeight);
    topGrass.addColorStop(0, "#15803d");
    topGrass.addColorStop(0.8, "#22c55e");
    topGrass.addColorStop(1, "#166534");
    ctx.fillStyle = topGrass;
    ctx.fillRect(0, 0, canvasWidth, bankHeight);

    // Riverbank edge soil/reeds
    ctx.fillStyle = "#a16207";
    ctx.fillRect(0, bankHeight - 4, canvasWidth, 6);

    // Bottom Grass
    const botGrass = ctx.createLinearGradient(0, canvasHeight - bankHeight, 0, canvasHeight);
    botGrass.addColorStop(0, "#166534");
    botGrass.addColorStop(0.2, "#22c55e");
    botGrass.addColorStop(1, "#15803d");
    ctx.fillStyle = botGrass;
    ctx.fillRect(0, canvasHeight - bankHeight, canvasWidth, bankHeight);
    ctx.fillStyle = "#a16207";
    ctx.fillRect(0, canvasHeight - bankHeight - 2, canvasWidth, 6);

    // Decorative grass tufts along the banks
    ctx.fillStyle = "#86efac";
    for (let x = 10; x < canvasWidth; x += 40) {
      const h1 = 6 + (Math.sin(x + time) * 3);
      ctx.fillRect(x, bankHeight - h1, 3, h1);
      const h2 = 6 + (Math.cos(x + time) * 3);
      ctx.fillRect(x + 20, canvasHeight - bankHeight - 2, 3, h2);
    }
    ctx.restore();
  }

  // Draw an individual cute rubber duck on Canvas
  function drawDuck(duck, time, isLeader) {
    const screenX = duck.x - cameraX;
    const screenY = duck.y;

    // Skip if offscreen
    if (screenX < -100 || screenX > canvasWidth + 100) return;

    ctx.save();
    ctx.translate(screenX, screenY);

    // Bobbing & tilting animation
    const tilt = Math.sin(time * 7 + duck.wobble) * 0.08;
    const bob = Math.cos(time * 6 + duck.wobble) * 2.5;
    ctx.translate(0, bob);
    ctx.rotate(tilt);

    // 1. Water ripples / wake trail behind the duck
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-16, 10, 16, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-26, 12, 10, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Duck Body
    ctx.fillStyle = duck.color;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1.5;

    // Body oval
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute pointed tail flick
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-24, -3);
    ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing on side (slightly darker shade)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(-3, 6, 9, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Duck Head
    ctx.beginPath();
    ctx.arc(12, -7, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4. Duck Orange Beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.ellipse(23, -5, 6, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c2410c";
    ctx.stroke();

    // 5. Cute Shiny Eye
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(15, -9, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Catchlight dot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(16, -10, 1, 0, Math.PI * 2);
    ctx.fill();

    // 6. Leader Crown or Star if duck is leading
    if (isLeader && !duck.finished) {
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 8;
      ctx.font = "14px sans-serif";
      ctx.fillText("👑", 5, -20);
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // 7. Student Name Pill / Tag (Drawn above duck, no tilt so it stays crisp)
    ctx.save();
    const tagY = screenY + bob - 28;
    ctx.font = "bold 12px sans-serif";
    const textWidth = ctx.measureText(duck.name).width;
    const padX = 8;
    const pillWidth = textWidth + padX * 2;
    const pillHeight = 20;

    // Pill background
    ctx.fillStyle = isLeader ? "rgba(245, 158, 11, 0.95)" : "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = isLeader ? "#fef08a" : "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = isLeader ? 2 : 1;

    roundRect(ctx, screenX - pillWidth / 2, tagY - pillHeight / 2, pillWidth, pillHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = isLeader ? "#0f172a" : "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(duck.name, screenX, tagY);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Main Race Update Loop
  function updateRace(delta, nowSec) {
    if (!isRacing) return;

    const elapsed = (performance.now() - raceStartTime) / 1000;
    const baseSpeed = (FINISH_X - START_X) / (raceDurationSec * 60);

    // Progress percentage
    let maxDuckX = 0;
    let allFinished = true;

    ducks.forEach(duck => {
      if (duck.finished) return;
      allFinished = false;

      // 1. Organic speed variations: Perlin-like wave jitter
      duck.wobble += delta * 6;
      const waveJitter = Math.sin(nowSec * 3 + duck.id * 1.5) * 0.45;

      // 2. Random speed bursts ("Tăng tốc bứt phá!")
      duck.burstTimer -= delta * 60;
      if (duck.burstTimer <= 0) {
        duck.burstTimer = 80 + Math.random() * 140;
        duck.targetSpeed = 1.3 + Math.random() * 1.2; // Speed burst
        if (Math.random() < 0.3) {
          playSound("splash");
        }
      }

      // 3. Quack sounds occasionally
      duck.quackCooldown -= delta * 60;
      if (duck.quackCooldown <= 0) {
        duck.quackCooldown = 250 + Math.random() * 400;
        if (Math.random() < 0.25) {
          playSound("quack");
        }
      }

      // Ease speed towards target speed
      duck.speed += (duck.targetSpeed - duck.speed) * 0.08;
      duck.targetSpeed += (1.0 - duck.targetSpeed) * 0.03; // decay back to 1.0

      // Calculate actual movement this frame
      const currentMove = baseSpeed * (duck.speed + waveJitter);
      duck.x += Math.max(0.4, currentMove);

      // Gentle vertical sway inside river
      duck.y = duck.baseY + Math.sin(nowSec * 2 + duck.id) * 8;

      if (duck.x > maxDuckX) maxDuckX = duck.x;

      // 4. Crossing finish line!
      if (duck.x >= FINISH_X) {
        duck.x = FINISH_X;
        duck.finished = true;
        duck.finishTime = performance.now();
        finishedRankings.push(duck);
        duck.rank = finishedRankings.length;

        // If this is the CHAMPION duck (1st place)
        if (finishedRankings.length === 1) {
          winnerDuck = duck;
          handleWinnerCrossed(duck);
        }
      }
    });

    // Update HUD Progress Bar
    const progressPercent = Math.min(100, Math.max(0, ((maxDuckX - START_X) / (FINISH_X - START_X)) * 100));
    hudProgressFill.style.width = progressPercent.toFixed(1) + "%";

    const remainingSec = Math.max(0, raceDurationSec - elapsed);
    hudTimerBadge.textContent = `⏱️ Còn lại: ${remainingSec.toFixed(1)}s`;

    // Dynamic Camera Tracking: follow the pack leader smoothly
    targetCameraX = Math.max(0, maxDuckX - canvasWidth * 0.55);
    cameraX += (targetCameraX - cameraX) * 0.12;

    // Check if entire race concluded
    if (allFinished || finishedRankings.length >= ducks.length) {
      isRacing = false;
    }
  }

  // Handle Winner Crossing Finish Line
  function handleWinnerCrossed(winner) {
    playSound("victory");
    playSound("quack");
    if (window.SA && SA.confetti) {
      SA.confetti(120);
    }

    // Show celebration banner
    winnerMainTitle.innerHTML = `🏆 Vịt của <span style="color:#38bdf8;">"${escapeHtml(winner.name)}"</span> Về Đích Đầu Tiên!`;
    renderPodium();
    prepareLearningChallenge(winner.name);

    setTimeout(() => {
      winnerPanel.style.display = "block";
      winnerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1200);
  }

  // Render Podium Top 3
  function renderPodium() {
    podiumRow.innerHTML = "";
    const top3 = finishedRankings.slice(0, 3);
    const medals = ["🥇", "🥈", "🥉"];
    const labels = ["Quán Quân (Gọi trả lời)", "Á Quân", "Hạng Ba"];

    top3.forEach((d, idx) => {
      const card = document.createElement("div");
      card.className = `podium-card ${idx === 0 ? "podium-1st" : ""}`;
      card.innerHTML = `
        <div style="font-size:2rem; margin-bottom:4px;">${medals[idx]}</div>
        <div style="font-size:0.8rem; font-weight:800; color:${idx === 0 ? "#f59e0b" : "#94a3b8"}; margin-bottom:4px;">${labels[idx]}</div>
        <div style="font-size:1.15rem; font-weight:900; color:#fff;">${escapeHtml(d.name)}</div>
      `;
      podiumRow.appendChild(card);
    });
  }

  // Prepare Challenge Question for Winner
  function prepareLearningChallenge(winnerName) {
    const item = SA.Quiz.shuffled([SA.shuffle(quizPool)[0]])[0];
    const letters = ["A", "B", "C", "D"];

    quizQuestionText.innerHTML = `🙋 <b>${escapeHtml(winnerName)}</b> hãy trả lời câu hỏi sau: <br><span style="color:#38bdf8; font-size:1.25rem;">"${escapeHtml(item.q)}"</span>`;
    quizAnswersGrid.innerHTML = "";
    quizFeedbackArea.style.display = "none";

    item.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-opt-btn";
      btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span> <span>${escapeHtml(opt)}</span>`;

      btn.addEventListener("click", () => {
        const isCorrect = idx === item.correct;
        const allBtns = quizAnswersGrid.querySelectorAll(".quiz-opt-btn");
        allBtns.forEach(b => b.disabled = true);

        if (isCorrect) {
          btn.classList.add("correct");
          playSound("victory");
          if (window.SA && SA.confetti) SA.confetti(80);
          quizFeedbackText.innerHTML = `🎉 <span style="color:#10b981;">Chính xác tuyệt vời!</span> ${escapeHtml(winnerName)} nhận 10 điểm cho bản thân &amp; tổ!`;
        } else {
          btn.classList.add("wrong");
          allBtns[item.correct].classList.add("correct");
          playSound("horn");
          quizFeedbackText.innerHTML = `😢 <span style="color:#ef4444;">Chưa chính xác!</span> Đáp án đúng là: <b>${escapeHtml(item.options[item.correct])}</b>`;
        }

        quizFeedbackArea.style.display = "block";
      }, { once: true });

      quizAnswersGrid.appendChild(btn);
    });
  }

  // Render Loop
  let lastTimestamp = performance.now();
  function gameLoop(timestamp) {
    const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;
    const nowSec = timestamp / 1000;

    updateRace(delta, nowSec);

    // Render River
    drawRiver(nowSec);

    // Sort ducks by X to find leader
    const sortedDucks = [...ducks].sort((a, b) => a.x - b.x);
    const leaderDuck = sortedDucks[sortedDucks.length - 1];

    // Draw ducks sorted by Y so lower ducks overlap higher ducks naturally
    const ducksByY = [...ducks].sort((a, b) => a.y - b.y);
    ducksByY.forEach(d => {
      drawDuck(d, nowSec, d === leaderDuck);
    });

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Start Race Handler
  function startRace() {
    if (isRacing) return;
    playSound("horn");
    isRacing = true;
    raceStartTime = performance.now();
    finishedRankings = [];
    winnerDuck = null;
    winnerPanel.style.display = "none";
    swimBtn.disabled = true;
    swimBtn.textContent = "🌊 ĐANG BƠI ĐUA...";

    ducks.forEach(d => {
      d.x = START_X + (Math.random() * 30 - 15);
      d.finished = false;
      d.speed = 1.0;
      d.targetSpeed = 1.0;
      d.burstTimer = Math.random() * 60;
    });
  }

  // Reset Race Handler
  function resetRace() {
    isRacing = false;
    finishedRankings = [];
    winnerDuck = null;
    cameraX = 0;
    targetCameraX = 0;
    hudProgressFill.style.width = "0%";
    winnerPanel.style.display = "none";
    swimBtn.disabled = false;
    swimBtn.textContent = "🌊 XUẤT PHÁT! (BƠI ĐUA)";
    initDucks();
  }

  // Fullscreen Toggle
  fullscreenToggleBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      arenaWrap.requestFullscreen().catch(() => {
        arenaWrap.classList.toggle("fullscreen-active");
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      arenaWrap.classList.add("fullscreen-active");
      fullscreenToggleBtn.textContent = "✖ Thoát toàn màn hình";
    } else {
      arenaWrap.classList.remove("fullscreen-active");
      fullscreenToggleBtn.textContent = "⛶ Toàn màn hình";
    }
    setTimeout(resizeCanvas, 100);
  });

  // Event Listeners
  swimBtn.addEventListener("click", startRace);
  resetBtn.addEventListener("click", resetRace);
  nextRaceBtn.addEventListener("click", resetRace);

  // Settings Modal Handlers
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const namesInput = document.getElementById("namesInput");
  const quizInput = document.getElementById("quizInput");

  openSettingsBtn.addEventListener("click", () => {
    namesInput.value = names.join("\n");
    quizInput.value = SA.Quiz.serialize(quizPool);
    SA.openModal("settingsModal");
  });

  // Presets in Modal
  const preset1B1Btn = document.getElementById("preset1B1Btn");
  if (preset1B1Btn) {
    preset1B1Btn.addEventListener("click", () => {
      namesInput.value = LOP_1B1_NAMES.join("\n");
      if (window.SA && SA.toast) SA.toast("✅ Đã nạp 33 bạn học sinh Lớp 1B1!");
    });
  }
  const preset23Btn = document.getElementById("preset23Btn");
  if (preset23Btn) {
    preset23Btn.addEventListener("click", () => {
      namesInput.value = DEFAULT_23_NAMES.join("\n");
      if (window.SA && SA.toast) SA.toast("Đã nạp 23 chú vịt!");
    });
  }
  const preset35Btn = document.getElementById("preset35Btn");
  if (preset35Btn) {
    preset35Btn.addEventListener("click", () => {
      const list35 = [];
      for (let i = 1; i <= 35; i++) list35.push(`Học sinh ${i}`);
      namesInput.value = list35.join("\n");
      if (window.SA && SA.toast) SA.toast("Đã nạp cả lớp 35 bạn!");
    });
  }
  const preset5TeamsBtn = document.getElementById("preset5TeamsBtn");
  if (preset5TeamsBtn) {
    preset5TeamsBtn.addEventListener("click", () => {
      namesInput.value = ["Tổ 1 (Sóc Nâu)", "Tổ 2 (Thỏ Trắng)", "Tổ 3 (Gấu Misa)", "Tổ 4 (Hổ Con)", "Tổ 5 (Sư Tử)"].join("\n");
      if (window.SA && SA.toast) SA.toast("Đã nạp 5 Tổ!");
    });
  }

  // Duration Presets
  document.querySelectorAll(".duration-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".duration-preset").forEach(b => {
        b.style.background = "#334155";
        b.style.borderColor = "#475569";
      });
      btn.style.background = "#0284c7";
      btn.style.borderColor = "#38bdf8";
      raceDurationSec = parseInt(btn.dataset.sec);
      localStorage.setItem("sa_duavit_duration", raceDurationSec.toString());
      hudTimerBadge.textContent = `⏱️ Thời gian: ${raceDurationSec}s`;
    });
  });

  saveSettingsBtn.addEventListener("click", () => {
    const newNames = SA.Names.parseText(namesInput.value);
    const newQuiz = SA.Quiz.parse(quizInput.value);

    if (newNames.length < 2) {
      if (window.SA && SA.toast) SA.toast("Cần ít nhất 2 bạn tham gia đua!");
      return;
    }
    if (newQuiz.length < 1) {
      if (window.SA && SA.toast) SA.toast("Cần ít nhất 1 câu hỏi!");
      return;
    }

    names = newNames.slice(0, 50); // support up to 50 ducks
    quizPool = newQuiz;
    SA.Names.save("duavit", names);
    SA.Quiz.save("duavit", quizPool);
    SA.closeModal("settingsModal");
    if (window.SA && SA.toast) SA.toast("Đã lưu cài đặt! Sẵn sàng đua mới.");
    resetRace();
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[s]));
  }

  // Initialize and run
  initDucks();
  animationFrameId = requestAnimationFrame(gameLoop);
})();
