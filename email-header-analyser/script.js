(function () {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const inputHeaders = document.getElementById("input-headers");
  const analyzeBtn = document.getElementById("analyze-btn");
  const clearBtn = document.getElementById("clear-btn");
  const outputSection = document.getElementById("output-section");
  const analysisResults = document.getElementById("analysis-results");
  const copyBtn = document.getElementById("copy-btn");

  // Decode MIME encoded words
  function decodeMime(value) {
    // Simple regex for =?charset?encoding?encoded?=
    const mimeRegex = /=(\?[^?]*\?[^?]*\?[^?]*\?=)/g;
    return value.replace(mimeRegex, (match) => {
      try {
        // Basic decoding for UTF-8 B (base64)
        const parts = match.slice(1, -1).split("?");
        if (parts.length === 3 && parts[1].toUpperCase() === "B") {
          return atob(parts[2]);
        }
        if (parts.length === 3 && parts[1].toUpperCase() === "Q") {
          // Quoted-printable, but simple replace
          return decodeURIComponent(parts[2].replace(/=/g, "%"));
        }
      } catch (e) {}
      return match;
    });
  }

  function analyzeHeaders() {
    const text = inputHeaders.value.trim();
    if (!text) return;

    // Unfold headers: remove CRLF followed by WSP
    const unfolded = text.replace(/\r?\n[ \t]+/g, " ");
    const lines = unfolded.split("\n");
    const headers = [];

    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        headers.push({ key, value });
      }
    });

    if (headers.length === 0) return;

    // Categorize headers
    const basicHeaders = [
      "From",
      "To",
      "Cc",
      "Bcc",
      "Subject",
      "Date",
      "Message-ID",
    ];
    const authHeaders = [
      "Authentication-Results",
      "DKIM-Signature",
      "Received-SPF",
      "ARC-Authentication-Results",
    ];
    const receivedHeaders = headers.filter(
      (h) => h.key.toLowerCase() === "received",
    );

    const basic = headers.filter((h) => basicHeaders.includes(h.key));
    const auth = headers.filter((h) => authHeaders.includes(h.key));
    const others = headers.filter(
      (h) =>
        !basicHeaders.includes(h.key) &&
        !authHeaders.includes(h.key) &&
        h.key.toLowerCase() !== "received",
    );

    // Build HTML
    let html = "";

    // Basic Info
    if (basic.length > 0) {
      html += "<h6>Basic Information</h6>";
      html +=
        '<div class="table-responsive mb-4"><table class="table table-sm"><tbody>';
      basic.forEach((header) => {
        const decodedValue = decodeMime(header.value);
        html += `<tr><td><strong>${header.key}</strong></td><td>${decodedValue}</td></tr>`;
      });
      html += "</tbody></table></div>";
    }

    // Authentication
    if (auth.length > 0) {
      html += "<h6>Authentication Results</h6>";
      html +=
        '<div class="table-responsive mb-4"><table class="table table-sm"><tbody>';
      auth.forEach((header) => {
        html += `<tr><td><strong>${header.key}</strong></td><td>${header.value}</td></tr>`;
      });
      html += "</tbody></table></div>";
    }

    // Mail Path (Received)
    if (receivedHeaders.length > 0) {
      html += "<h6>Mail Path</h6>";
      html += '<ol class="mb-4">';
      receivedHeaders.reverse().forEach((header) => {
        // Reverse to show chronological order
        html += `<li>${header.value}</li>`;
      });
      html += "</ol>";
    }

    // All Headers
    html += "<h6>All Headers</h6>";
    html +=
      '<div class="table-responsive"><table class="table table-striped table-sm"><thead><tr><th>Header</th><th>Value</th></tr></thead><tbody>';
    headers.forEach((header) => {
      html += `<tr><td>${header.key}</td><td>${header.value}</td></tr>`;
    });
    html += "</tbody></table></div>";

    analysisResults.innerHTML = html;
    outputSection.classList.remove("d-none");
    outputSection.scrollIntoView({ behavior: "smooth" });
  }

  function clearAll() {
    inputHeaders.value = "";
    analysisResults.innerHTML = "";
    outputSection.classList.add("d-none");
  }

  function copyHeaders() {
    const text = inputHeaders.value;
    navigator.clipboard.writeText(text).then(() => {
      // Optionally show feedback
    });
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.bsTheme = theme;
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
  }

  const themeData = localStorage.getItem(THEME_KEY);
  if (themeData) {
    try {
      const data = JSON.parse(themeData);
      if (data.theme) currentTheme = data.theme;
    } catch (e) {
      console.warn("Failed to load theme:", e);
    }
  }
  setTheme(currentTheme);

  analyzeBtn.addEventListener("click", analyzeHeaders);
  clearBtn.addEventListener("click", clearAll);
  copyBtn.addEventListener("click", copyHeaders);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
