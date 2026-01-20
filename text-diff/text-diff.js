(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  // Simple line-by-line diff algorithm
  function computeDiff(original, modified) {
    const originalLines = original.split("\n");
    const modifiedLines = modified.split("\n");

    // Find the longest common subsequence using dynamic programming
    const matrix = Array(originalLines.length + 1)
      .fill()
      .map(() => Array(modifiedLines.length + 1).fill(0));

    for (let i = 1; i <= originalLines.length; i++) {
      for (let j = 1; j <= modifiedLines.length; j++) {
        if (originalLines[i - 1] === modifiedLines[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }

    // Backtrack to find the diff
    const diff = [];
    let i = originalLines.length;
    let j = modifiedLines.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
        diff.unshift({ type: "unchanged", line: originalLines[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        diff.unshift({ type: "added", line: modifiedLines[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
        diff.unshift({ type: "removed", line: originalLines[i - 1] });
        i--;
      }
    }

    return diff;
  }

  function renderDiff(diff) {
    const output = document.getElementById("diff-output");
    const showAdded = document
      .getElementById("show-added")
      .classList.contains("active");
    const showRemoved = document
      .getElementById("show-removed")
      .classList.contains("active");
    const showUnchanged = document
      .getElementById("show-unchanged")
      .classList.contains("active");

    output.innerHTML = "";

    if (diff.length === 0) {
      output.innerHTML =
        '<div class="text-muted text-center py-4">No differences found.</div>';
      return;
    }

    diff.forEach((item, index) => {
      if (
        (item.type === "added" && !showAdded) ||
        (item.type === "removed" && !showRemoved) ||
        (item.type === "unchanged" && !showUnchanged)
      ) {
        return;
      }

      const div = document.createElement("div");
      div.className = `diff-line diff-${item.type}`;
      div.textContent = item.line || " ";
      output.appendChild(div);
    });

    // Update statistics
    const addedCount = diff.filter((item) => item.type === "added").length;
    const removedCount = diff.filter((item) => item.type === "removed").length;

    document.getElementById("stats-added").textContent = addedCount;
    document.getElementById("stats-removed").textContent = removedCount;
  }

  function performDiff() {
    const original = document.getElementById("original-text").value;
    const modified = document.getElementById("modified-text").value;

    const diff = computeDiff(original, modified);
    renderDiff(diff);
  }

  function swapTexts() {
    const original = document.getElementById("original-text");
    const modified = document.getElementById("modified-text");

    const temp = original.value;
    original.value = modified.value;
    modified.value = temp;

    performDiff();
  }

  function clearAll() {
    document.getElementById("original-text").value = "";
    document.getElementById("modified-text").value = "";
    document.getElementById("diff-output").innerHTML =
      '<div class="text-muted text-center py-4">Click "Compare Texts" to see the differences.</div>';
    document.getElementById("stats-added").textContent = "0";
    document.getElementById("stats-removed").textContent = "0";
  }

  function toggleDiffType(event) {
    event.target.classList.toggle("active");
    const currentDiff = computeDiff(
      document.getElementById("original-text").value,
      document.getElementById("modified-text").value,
    );
    renderDiff(currentDiff);
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
    document.getElementById("diff-btn").addEventListener("click", performDiff);
    document.getElementById("swap-btn").addEventListener("click", swapTexts);
    document.getElementById("clear-btn").addEventListener("click", clearAll);

    document
      .getElementById("show-added")
      .addEventListener("click", toggleDiffType);
    document
      .getElementById("show-removed")
      .addEventListener("click", toggleDiffType);
    document
      .getElementById("show-unchanged")
      .addEventListener("click", toggleDiffType);

    // Auto-diff on input change (with debounce)
    let timeout;
    function debounceDiff() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (
          document.getElementById("original-text").value ||
          document.getElementById("modified-text").value
        ) {
          performDiff();
        }
      }, 300);
    }

    document
      .getElementById("original-text")
      .addEventListener("input", debounceDiff);
    document
      .getElementById("modified-text")
      .addEventListener("input", debounceDiff);
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
