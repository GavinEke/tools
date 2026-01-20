(() => {
  const API_URL = "https://ipapi.co/json/";
  let currentTheme = "light";
  const THEME_KEY = "site-theme";

  function isValidIp(ip) {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern =
      /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  async function lookupIp(ip) {
    const url = ip ? `https://ipapi.co/${ip}/json/` : API_URL;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.reason || "Failed to look up IP");
    }
    return response.json();
  }

  function displayResults(data) {
    document.getElementById("result-ip").textContent = data.ip || "N/A";
    document.getElementById("result-version").textContent =
      data.version || "N/A";
    document.getElementById("result-hostname").textContent =
      data.hostname || "N/A";
    document.getElementById("result-asn").textContent = data.asn
      ? `AS${data.asn}`
      : "N/A";
    document.getElementById("result-isp").textContent =
      data.org || data.isp || "N/A";
    document.getElementById("result-org").textContent = data.org || "N/A";

    document.getElementById("result-country").textContent = data.country_name
      ? `${getCountryFlag(data.country_code)} ${data.country_name}`
      : "N/A";
    document.getElementById("result-region").textContent = data.region || "N/A";
    document.getElementById("result-city").textContent = data.city || "N/A";
    document.getElementById("result-postal").textContent = data.postal || "N/A";
    document.getElementById("result-timezone").textContent =
      data.timezone || "N/A";
    document.getElementById("result-utc-offset").textContent =
      data.utc_offset || "N/A";

    if (data.latitude && data.longitude) {
      document.getElementById("result-coords").textContent =
        `${data.latitude}, ${data.longitude}`;
      updateMap(
        data.latitude,
        data.longitude,
        data.city || data.region || data.country_name || "Unknown",
      );
    } else {
      document.getElementById("result-coords").textContent = "N/A";
    }

    document.getElementById("results").classList.remove("d-none");
  }

  function getCountryFlag(countryCode) {
    if (!countryCode) return "";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  function updateMap(lat, lon, label) {
    const mapFrame = document.getElementById("map-frame");
    const encodedLabel = encodeURIComponent(label);
    mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
  }

  function showError(message) {
    const errorEl = document.getElementById("error");
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }

  function hideError() {
    document.getElementById("error").classList.add("d-none");
  }

  function showLoading() {
    document.getElementById("loading").classList.remove("d-none");
    document.getElementById("results").classList.add("d-none");
    hideError();
  }

  function hideLoading() {
    document.getElementById("loading").classList.add("d-none");
  }

  async function handleLookup() {
    const ipInput = document.getElementById("ip-input").value.trim();

    if (ipInput && !isValidIp(ipInput)) {
      showError("Please enter a valid IP address");
      return;
    }

    showLoading();

    try {
      const data = await lookupIp(ipInput);
      hideLoading();
      displayResults(data);
    } catch (error) {
      hideLoading();
      showError(
        error.message || "Failed to look up IP address. Please try again.",
      );
    }
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
      .getElementById("lookup-btn")
      .addEventListener("click", handleLookup);
    document.getElementById("ip-input").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleLookup();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
