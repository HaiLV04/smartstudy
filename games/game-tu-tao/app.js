(() => {
  const STORAGE_KEY = "sa_gtt_html_game-tu-tao";

  const frameWrap = document.getElementById("frameWrap");
  const statusChip = document.getElementById("statusChip");

  const EXAMPLE_SNIPPET = `<!doctype html>
<html>
<head>
<style>
  body { font-family: sans-serif; text-align: center; padding: 40px; background: #eef4ff; }
  button { font-size: 1.2rem; padding: 12px 24px; border-radius: 10px; border: none;
           background: #2563eb; color: #fff; cursor: pointer; }
  #count { font-size: 2.5rem; font-weight: 800; margin: 20px 0; color: #0f172a; }
</style>
</head>
<body>
  <h2>Ví dụ: đếm số lần bấm</h2>
  <div id="count">0</div>
  <button onclick="document.getElementById('count').textContent = Number(document.getElementById('count').textContent) + 1">
    Bấm vào đây!
  </button>
</body>
</html>`;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  }

  function loadHtml() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) { return ""; }
  }

  function saveHtml(html) {
    try { localStorage.setItem(STORAGE_KEY, html); } catch (e) { /* ignore quota errors */ }
  }

  function renderEmptyState() {
    statusChip.textContent = "Chưa có nội dung";
    frameWrap.innerHTML = `
      <div class="gtt-empty">
        <div class="emoji">🧩</div>
        <h3>Chưa có trò chơi nào được dán vào đây</h3>
        <p>Đây là công cụ giúp bạn nhúng một đoạn HTML/CSS/JS tự soạn (một mini-game hoặc nội dung tương tác đơn giản) vào website. Bấm nút <b>"⚙️ Dán mã HTML"</b> ở trên, dán đoạn mã tự chứa của bạn vào ô soạn thảo rồi lưu lại — nội dung sẽ hiển thị an toàn ngay bên dưới.</p>
        <p style="font-weight:700; color:var(--ink-700);">Ví dụ đoạn mã đơn giản bạn có thể sao chép để thử:</p>
        <pre class="gtt-example">${escapeHtml(EXAMPLE_SNIPPET)}</pre>
      </div>`;
  }

  function renderIframe(html) {
    statusChip.textContent = "Đang hiển thị nội dung đã lưu";
    frameWrap.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.setAttribute("title", "Nội dung trò chơi tự tạo");
    iframe.srcdoc = html;
    frameWrap.appendChild(iframe);
  }

  function refresh() {
    const html = loadHtml();
    if (html && html.trim()) renderIframe(html);
    else renderEmptyState();
  }

  document.getElementById("openSettingsBtn").addEventListener("click", () => {
    document.getElementById("htmlInput").value = loadHtml();
    SA.openModal("settingsModal");
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const html = document.getElementById("htmlInput").value;
    saveHtml(html);
    SA.closeModal("settingsModal");
    SA.toast(html.trim() ? "Đã lưu và hiển thị nội dung!" : "Đã xoá nội dung, quay về trạng thái trống.");
    refresh();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    saveHtml("");
    SA.toast("Đã xoá nội dung đã dán.");
    refresh();
  });

  refresh();
})();
