(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const inputJson = document.getElementById("input-json");
  const indentSizeSelect = document.getElementById("indent-size");
  const formatBtn = document.getElementById("format-btn");
  const clearBtn = document.getElementById("clear-btn");
  const outputSection = document.getElementById("output-section");
  const outputJson = document.getElementById("output-json");
  const copyBtn = document.getElementById("copy-btn");

  // JSON formatter
  function formatJson(jsonText, indentType = "2") {
    try {
      const parsed = JSON.parse(jsonText);

      let indent;
      if (indentType === "tab") {
        indent = "\t";
      } else {
        indent = parseInt(indentType);
      }

      return JSON.stringify(parsed, null, indent);
    } catch (e) {
      throw new Error("Invalid JSON: " + e.message);
    }
  }

  // JSON validation
  function validateJson(jsonText) {
    try {
      JSON.parse(jsonText);
      return true;
    } catch (e) {
      return false;
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

  // Event listeners
  formatBtn.addEventListener("click", () => {
    const jsonText = inputJson.value.trim();
    if (!jsonText) return;

    try {
      const indentType = indentSizeSelect.value;
      const formatted = formatJson(jsonText, indentType);
      outputJson.value = formatted;
      outputSection.classList.remove("d-none");
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

  clearBtn.addEventListener("click", () => {
    inputJson.value = "";
    outputJson.value = "";
    outputSection.classList.add("d-none");
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(outputJson.value);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  });

  // Auto-format on input change (optional)
  inputJson.addEventListener("input", () => {
    const jsonText = inputJson.value.trim();
    if (jsonText && validateJson(jsonText)) {
      try {
        const indentType = indentSizeSelect.value;
        const formatted = formatJson(jsonText, indentType);
        outputJson.value = formatted;
        outputSection.classList.remove("d-none");
      } catch (error) {
        // Invalid JSON, don't format
        outputSection.classList.add("d-none");
      }
    } else {
      outputSection.classList.add("d-none");
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
