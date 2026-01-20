(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const inputText = document.getElementById("input-text");
  const caseSelect = document.getElementById("case-select");
  const convertBtn = document.getElementById("convert-btn");
  const clearBtn = document.getElementById("clear-btn");
  const outputSection = document.getElementById("output-section");
  const outputText = document.getElementById("output-text");
  const copyBtn = document.getElementById("copy-btn");

  // Conversion functions
  const toUppercase = (str) => str.toUpperCase();

  const toLowercase = (str) => str.toLowerCase();

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toCamelCase = (str) => {
    const words = str
      .toLowerCase()
      .split(/[-_\s]+/)
      .filter((word) => word.length > 0);
    if (words.length === 0) return "";
    return (
      words[0] +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
    );
  };

  const toPascalCase = (str) => {
    const words = str
      .toLowerCase()
      .split(/[-_\s]+/)
      .filter((word) => word.length > 0);
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };

  const toSnakeCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[-_\s]+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const toKebabCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[-_\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const toConstantCase = (str) => {
    return str
      .toUpperCase()
      .replace(/[-_\s]+/g, "_")
      .replace(/[^A-Z0-9_]/g, "");
  };

  const converters = {
    uppercase: toUppercase,
    lowercase: toLowercase,
    "title-case": toTitleCase,
    "camel-case": toCamelCase,
    "pascal-case": toPascalCase,
    "snake-case": toSnakeCase,
    "kebab-case": toKebabCase,
    "constant-case": toConstantCase,
  };

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
  convertBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text) return;

    const caseType = caseSelect.value;
    const converter = converters[caseType];
    const result = converter(text);

    outputText.value = result;
    outputSection.classList.remove("d-none");
  });

  clearBtn.addEventListener("click", () => {
    inputText.value = "";
    outputText.value = "";
    outputSection.classList.add("d-none");
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(outputText.value);
      // Could add a toast notification here, but keeping simple
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
