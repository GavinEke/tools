(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  function parseCSV(csvText, options = {}) {
    const {
      delimiter = ",",
      quoteChar = '"',
      hasHeader = true,
      skipEmpty = false,
    } = options;

    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) return { data: [], headers: [] };

    const parsedLines = [];
    let headers = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (skipEmpty && line === "") continue;

      const parsedLine = parseCSVLine(line, delimiter, quoteChar);
      parsedLines.push(parsedLine);
    }

    if (hasHeader && parsedLines.length > 0) {
      headers = parsedLines.shift();
    } else {
      // Generate numeric headers if no header row
      const maxLength = Math.max(...parsedLines.map((line) => line.length));
      headers = Array.from({ length: maxLength }, (_, i) => `Column${i + 1}`);
    }

    const data = parsedLines.map((line) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = line[index] || "";
      });
      return obj;
    });

    return { data, headers };
  }

  function parseCSVLine(line, delimiter, quoteChar) {
    const result = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === quoteChar) {
        if (inQuotes && nextChar === quoteChar) {
          // Escaped quote
          current += quoteChar;
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        result.push(current);
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  function convertToJSON() {
    const csvText = document.getElementById("csv-input").value.trim();
    if (!csvText) {
      showError("Please enter CSV data");
      return;
    }

    const options = {
      delimiter: document.getElementById("delimiter").value,
      quoteChar: document.getElementById("quote-char").value,
      hasHeader: document.getElementById("has-header").checked,
      skipEmpty: document.getElementById("skip-empty").checked,
    };

    try {
      const { data, headers } = parseCSV(csvText, options);
      const indentationValue = document.getElementById("indentation").value;

      let indentation;
      switch (indentationValue) {
        case "2":
          indentation = "  ";
          break;
        case "4":
          indentation = "    ";
          break;
        case "tab":
          indentation = "\t";
          break;
        case "minified":
        default:
          indentation = "";
          break;
      }

      let jsonOutput;
      if (indentation === "") {
        jsonOutput = JSON.stringify(data);
      } else {
        jsonOutput = JSON.stringify(data, null, indentation);
      }

      document.getElementById("json-output").textContent = jsonOutput;
      document
        .getElementById("json-output")
        .classList.remove("text-body-secondary");

      // Show stats
      const stats = document.getElementById("conversion-stats");
      stats.innerHTML = `Converted ${data.length} rows with ${headers.length} columns`;
      stats.classList.remove("d-none");

      hideError();
    } catch (error) {
      showError("Error parsing CSV: " + error.message);
    }
  }

  function showError(message) {
    const output = document.getElementById("json-output");
    output.textContent = message;
    output.classList.add("text-danger");
    document.getElementById("conversion-stats").classList.add("d-none");
  }

  function hideError() {
    const output = document.getElementById("json-output");
    output.classList.remove("text-danger");
    output.classList.remove("text-body-secondary");
  }

  async function copyToClipboard() {
    const output = document.getElementById("json-output");
    const jsonText = output.textContent;

    if (!jsonText || jsonText === "JSON output will appear here") {
      return;
    }

    try {
      await navigator.clipboard.writeText(jsonText);
      // Visual feedback could be added here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function downloadJSON() {
    const output = document.getElementById("json-output");
    const jsonText = output.textContent;

    if (!jsonText || jsonText === "JSON output will appear here") {
      return;
    }

    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      document.getElementById("file-info").classList.add("d-none");
      return;
    }

    // Show loading state
    const convertBtn = document.getElementById("convert-btn");
    const originalText = convertBtn.textContent;
    convertBtn.textContent = "Loading...";
    convertBtn.disabled = true;

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("csv-input").value = e.target.result;
      document.getElementById("file-info").textContent =
        `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      document.getElementById("file-info").classList.remove("d-none");

      // Restore button state
      convertBtn.textContent = originalText;
      convertBtn.disabled = false;
    };

    reader.onerror = function () {
      showError("Error reading file");
      convertBtn.textContent = originalText;
      convertBtn.disabled = false;
    };

    reader.readAsText(file);
  }

  function clearAll() {
    document.getElementById("csv-input").value = "";
    document.getElementById("csv-file").value = "";
    document.getElementById("file-info").classList.add("d-none");
    document.getElementById("json-output").textContent =
      "JSON output will appear here";
    document.getElementById("json-output").classList.add("text-body-secondary");
    document.getElementById("conversion-stats").classList.add("d-none");
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
    // Event listeners
    document
      .getElementById("convert-btn")
      .addEventListener("click", convertToJSON);
    document
      .getElementById("copy-btn")
      .addEventListener("click", copyToClipboard);
    document
      .getElementById("download-btn")
      .addEventListener("click", downloadJSON);
    document.getElementById("clear-btn").addEventListener("click", clearAll);
    document
      .getElementById("csv-file")
      .addEventListener("change", handleFileUpload);

    // Convert on Enter in textarea
    document.getElementById("csv-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        convertToJSON();
      }
    });

    // Load example data
    const exampleCSV = `name,email,age,city
John Doe,john@example.com,30,New York
Jane Smith,jane@example.com,25,Los Angeles
Bob Johnson,bob@example.com,35,Chicago`;

    document.getElementById("csv-input").value = exampleCSV;
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
