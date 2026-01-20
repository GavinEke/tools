(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  function generateUUIDv4() {
    // Use crypto.randomUUID() if available (modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback implementation for older browsers
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  function generateUUID() {
    const uuid = generateUUIDv4();
    const output = document.getElementById("uuid-output");
    output.value = uuid;
    return uuid;
  }

  async function copyToClipboard() {
    const output = document.getElementById("uuid-output");
    const uuid = output.value;

    if (!uuid) {
      return;
    }

    try {
      await navigator.clipboard.writeText(uuid);
      const btn = document.getElementById("copy-btn");
      const originalTitle = btn.getAttribute("title");
      btn.setAttribute("title", "Copied!");
      setTimeout(() => btn.setAttribute("title", originalTitle), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function clearOutput() {
    const output = document.getElementById("uuid-output");
    output.value = "";
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
      .getElementById("generate-btn")
      .addEventListener("click", generateUUID);
    document
      .getElementById("copy-btn")
      .addEventListener("click", copyToClipboard);
    document.getElementById("clear-btn").addEventListener("click", clearOutput);

    // Generate a UUID on page load
    generateUUID();
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
