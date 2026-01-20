(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    try {
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
    } catch (e) {
      return atob(base64);
    }
  }

  function formatJson(str) {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return str;
    }
  }

  function formatTimestamp(ts) {
    if (!ts) return "-";
    const date = new Date(ts * 1000);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  }

  function decodeJwt(token) {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      throw new Error(
        "Invalid JWT format. Expected 3 parts separated by dots.",
      );
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let header, payload;
    try {
      header = base64UrlDecode(headerB64);
      payload = base64UrlDecode(payloadB64);
    } catch (e) {
      throw new Error("Failed to decode Base64URL content: " + e.message);
    }

    return {
      header: formatJson(header),
      payload: formatJson(payload),
      signature: signatureB64,
      raw: {
        header: headerB64,
        payload: payloadB64,
        signature: signatureB64,
      },
    };
  }

  function showError(message) {
    const errorContainer = document.getElementById("error-container");
    errorContainer.textContent = message;
    errorContainer.classList.remove("d-none");
    document.getElementById("decoded-result").classList.add("d-none");
  }

  function hideError() {
    document.getElementById("error-container").classList.add("d-none");
  }

  function displayResult(decoded) {
    document.getElementById("header-code").textContent = decoded.header;
    document.getElementById("payload-code").textContent = decoded.payload;
    document.getElementById("signature-code").textContent = decoded.signature;

    const infoTable = document.getElementById("token-info-table");
    let headerObj, payloadObj;
    try {
      headerObj = JSON.parse(decoded.header);
      payloadObj = JSON.parse(decoded.payload);
    } catch (e) {
      headerObj = {};
      payloadObj = {};
    }

    const alg = headerObj.alg || "-";
    const typ = headerObj.typ || "-";
    const sub = payloadObj.sub || "-";
    const iss = payloadObj.iss || payloadObj.issuer || "-";
    const exp = payloadObj.exp ? formatTimestamp(payloadObj.exp) : "-";
    const iat = payloadObj.iat ? formatTimestamp(payloadObj.iat) : "-";
    const aud = payloadObj.aud || payloadObj.audience || "-";

    infoTable.innerHTML = `
      <tr>
        <td class="text-muted" style="width: 140px;">Algorithm</td>
        <td><code>${alg}</code></td>
      </tr>
      <tr>
        <td class="text-muted">Type</td>
        <td><code>${typ}</code></td>
      </tr>
      <tr>
        <td class="text-muted">Subject</td>
        <td>${sub}</td>
      </tr>
      <tr>
        <td class="text-muted">Issuer</td>
        <td>${iss}</td>
      </tr>
      <tr>
        <td class="text-muted">Audience</td>
        <td>${Array.isArray(aud) ? aud.join(", ") : aud}</td>
      </tr>
      <tr>
        <td class="text-muted">Issued At</td>
        <td>${iat}</td>
      </tr>
      <tr>
        <td class="text-muted">Expires</td>
        <td>${exp}</td>
      </tr>
    `;

    document.getElementById("decoded-result").classList.remove("d-none");
  }

  function decodeToken() {
    const token = document.getElementById("jwt-input").value.trim();
    if (!token) {
      showError("Please enter a JWT token to decode.");
      return;
    }

    hideError();

    try {
      const decoded = decodeJwt(token);
      displayResult(decoded);
    } catch (e) {
      showError(e.message);
    }
  }

  function clearInput() {
    document.getElementById("jwt-input").value = "";
    hideError();
    document.getElementById("decoded-result").classList.add("d-none");
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

  function init() {
    document
      .getElementById("decode-btn")
      .addEventListener("click", decodeToken);
    document.getElementById("clear-btn").addEventListener("click", clearInput);

    document.getElementById("jwt-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        decodeToken();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
