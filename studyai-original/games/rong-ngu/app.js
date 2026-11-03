(() => {
  const DEFAULT_THRESHOLD = 35;
  const WAKE_SUSTAIN_MS = 1000;   // phải ồn liên tục hơn 1s mới đánh thức rồng
  const SLEEP_SUSTAIN_MS = 2000;  // phải yên tĩnh liên tục hơn 2s mới ngủ lại

  const rnStage = document.getElementById("rnStage");
  const rnStatus = document.getElementById("rnStatus");
  const rnMeterFill = document.getElementById("rnMeterFill");
  const rnVolNum = document.getElementById("rnVolNum");
  const rnThresholdMark = document.getElementById("rnThresholdMark");
  const startListenBtn = document.getElementById("startListenBtn");
  const stopBtn = document.getElementById("stopBtn");
  const rnMicError = document.getElementById("rnMicError");

  let threshold = Number(localStorage.getItem("sa_rongngu_threshold")) || DEFAULT_THRESHOLD;
  let audioCtx = null;
  let analyser = null;
  let mediaStream = null;
  let dataArray = null;
  let rafId = null;
  let listening = false;
  let awake = false;
  let aboveSince = null;
  let belowSince = null;

  function positionThresholdMark() {
    rnThresholdMark.style.left = `calc(${threshold}% - 1.5px)`;
  }

  function showMicError(msg) {
    rnMicError.textContent = msg;
    rnMicError.classList.add("show");
  }

  function hideMicError() {
    rnMicError.classList.remove("show");
    rnMicError.textContent = "";
  }

  function setAwake(state) {
    if (awake === state) return;
    awake = state;
    if (state) {
      rnStage.classList.add("awake");
      rnStatus.textContent = "🔥 Lớp đang quá ồn — hãy nhắc các bạn giữ trật tự!";
      try { SA.beep("wrong"); } catch (e) { /* ignore */ }
    } else {
      rnStage.classList.remove("awake");
      rnStatus.textContent = "😴 Lớp đang trật tự, rồng ngủ ngon.";
    }
  }

  function computeVolume() {
    // dataArray là dữ liệu miền thời gian (byte, 0-255, tâm ở 128) — tính RMS quanh tâm
    analyser.getByteTimeDomainData(dataArray);
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const centered = (dataArray[i] - 128) / 128;
      sumSquares += centered * centered;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    // Khuếch đại nhẹ để dải giá trị thực tế nằm trong khoảng dễ đọc 0-100
    let vol = Math.min(100, Math.round(rms * 100 * 3.2));
    return vol;
  }

  function loop() {
    if (!listening) return;
    const vol = computeVolume();
    rnMeterFill.style.width = vol + "%";
    rnVolNum.textContent = vol + "%";

    const now = performance.now();
    if (vol >= threshold) {
      belowSince = null;
      if (aboveSince === null) aboveSince = now;
      if (!awake && now - aboveSince >= WAKE_SUSTAIN_MS) setAwake(true);
    } else {
      aboveSince = null;
      if (belowSince === null) belowSince = now;
      if (awake && now - belowSince >= SLEEP_SUSTAIN_MS) setAwake(false);
    }

    rafId = requestAnimationFrame(loop);
  }

  async function startListening() {
    hideMicError();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showMicError("⚠️ Trình duyệt này không hỗ trợ truy cập micro (có thể do trang chưa chạy ở chế độ an toàn HTTPS, hoặc trình duyệt quá cũ). Các phần khác của trang vẫn hoạt động bình thường.");
      return;
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      showMicError("⚠️ Không thể truy cập micro (có thể bạn đã từ chối quyền, hoặc thiết bị không có micro). Hãy cấp quyền micro cho trang này trong cài đặt trình duyệt rồi thử lại — trang vẫn dùng được bình thường, chỉ tính năng đo tiếng ồn tạm ẩn.");
      return;
    }
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      dataArray = new Uint8Array(analyser.fftSize);
      source.connect(analyser);
    } catch (err) {
      showMicError("⚠️ Có lỗi khi khởi tạo bộ phân tích âm thanh trên trình duyệt này. Trang vẫn dùng được bình thường, chỉ tính năng đo tiếng ồn tạm không hoạt động.");
      stopMicTracks();
      return;
    }

    listening = true;
    aboveSince = null;
    belowSince = null;
    setAwake(false);
    startListenBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");
    rnStatus.textContent = "😴 Đang lắng nghe... lớp đang trật tự, rồng ngủ ngon.";
    loop();
  }

  function stopMicTracks() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => { try { t.stop(); } catch (e) {} });
      mediaStream = null;
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
    }
  }

  function stopListening() {
    listening = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    stopMicTracks();
    setAwake(false);
    rnMeterFill.style.width = "0%";
    rnVolNum.textContent = "0%";
    rnStatus.textContent = "Chưa bắt đầu lắng nghe";
    startListenBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
  }

  startListenBtn.addEventListener("click", startListening);
  stopBtn.addEventListener("click", stopListening);

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("thresholdSlider").value = threshold;
    document.getElementById("thresholdVal").textContent = threshold;
    SA.openModal("settingsModal");
  });

  document.getElementById("thresholdSlider").addEventListener("input", (e) => {
    document.getElementById("thresholdVal").textContent = e.target.value;
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const val = Math.round(Number(document.getElementById("thresholdSlider").value));
    threshold = Number.isNaN(val) ? DEFAULT_THRESHOLD : val;
    localStorage.setItem("sa_rongngu_threshold", String(threshold));
    positionThresholdMark();
    SA.closeModal("settingsModal");
    SA.toast("Đã lưu ngưỡng tiếng ồn!");
  });

  positionThresholdMark();
  stopBtn.classList.add("hidden");

  window.addEventListener("beforeunload", stopMicTracks);
})();
