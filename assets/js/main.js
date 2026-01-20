let tools = [];
let currentCategory = "all";

async function loadTools() {
  try {
    const response = await fetch("_data/tools.json");
    tools = await response.json();
  } catch (error) {
    console.error("Failed to load tools:", error);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sanitizeSvg(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  // Remove dangerous elements
  const dangerousElements = doc.querySelectorAll(
    'script, iframe, object, embed, form, input, button, a[href^="javascript:"]',
  );
  dangerousElements.forEach((el) => el.remove());
  // Remove event handler attributes
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("on")) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.documentElement ? doc.documentElement.outerHTML : "";
}

function createToolCard(tool) {
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4";
  col.setAttribute("data-name", tool.name.toLowerCase());
  col.setAttribute("data-description", tool.description.toLowerCase());
  col.setAttribute("data-category", tool.category.toLowerCase());

  const a = document.createElement("a");
  a.href = tool.href;
  a.className = "card tool-card h-100 text-decoration-none";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const dFlex = document.createElement("div");
  dFlex.className = "d-flex align-items-center mb-3";

  const toolIcon = document.createElement("div");
  toolIcon.className = "tool-icon me-3";
  toolIcon.innerHTML = sanitizeSvg(tool.icon);

  const h3 = document.createElement("h3");
  h3.className = "h5 card-title fw-semibold mb-0";
  h3.textContent = tool.name;

  dFlex.appendChild(toolIcon);
  dFlex.appendChild(h3);

  const p = document.createElement("p");
  p.className = "card-text text-body-secondary";
  p.textContent = tool.description;

  cardBody.appendChild(dFlex);
  cardBody.appendChild(p);

  a.appendChild(cardBody);
  col.appendChild(a);

  return col;
}

function createRecentToolCard(tool) {
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4 col-xl";

  const a = document.createElement("a");
  a.href = tool.href;
  a.className = "card tool-card h-100 text-decoration-none";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const dFlex = document.createElement("div");
  dFlex.className = "d-flex justify-content-between align-items-start mb-2";

  const toolIcon = document.createElement("div");
  toolIcon.className = "tool-icon";
  toolIcon.innerHTML = sanitizeSvg(tool.icon);

  const span = document.createElement("span");
  span.className = "badge bg-secondary small";
  span.textContent = formatDate(tool.dateAdded);

  dFlex.appendChild(toolIcon);
  dFlex.appendChild(span);

  const h3 = document.createElement("h3");
  h3.className = "h6 card-title fw-semibold mb-1";
  h3.textContent = tool.name;

  const p = document.createElement("p");
  p.className = "card-text text-body-secondary small mb-0";
  p.textContent = tool.description;

  cardBody.appendChild(dFlex);
  cardBody.appendChild(h3);
  cardBody.appendChild(p);

  a.appendChild(cardBody);
  col.appendChild(a);

  return col;
}

function createUpdatedToolCard(tool) {
  const col = document.createElement("div");
  col.className = "col-md-6 col-lg-4 col-xl";

  const a = document.createElement("a");
  a.href = tool.href;
  a.className = "card tool-card h-100 text-decoration-none";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const dFlex = document.createElement("div");
  dFlex.className = "d-flex justify-content-between align-items-start mb-2";

  const toolIcon = document.createElement("div");
  toolIcon.className = "tool-icon";
  toolIcon.innerHTML = sanitizeSvg(tool.icon);

  const span = document.createElement("span");
  span.className = "badge bg-secondary small";
  span.textContent = formatDate(tool.dateUpdated);

  dFlex.appendChild(toolIcon);
  dFlex.appendChild(span);

  const h3 = document.createElement("h3");
  h3.className = "h6 card-title fw-semibold mb-1";
  h3.textContent = tool.name;

  const p = document.createElement("p");
  p.className = "card-text text-body-secondary small mb-0";
  p.textContent = tool.description;

  cardBody.appendChild(dFlex);
  cardBody.appendChild(h3);
  cardBody.appendChild(p);

  a.appendChild(cardBody);
  col.appendChild(a);

  return col;
}

function initRecentlyAdded() {
  const recentContainer = document.getElementById("recent-tools");
  const sortedTools = [...tools].sort(
    (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded),
  );
  const recentTools = sortedTools.slice(0, 5);
  recentContainer.innerHTML = "";
  recentTools.forEach((tool) =>
    recentContainer.appendChild(createRecentToolCard(tool)),
  );
}

function initRecentlyUpdated() {
  const updatedContainer = document.getElementById("updated-tools");
  const updatedTools = tools
    .filter((t) => t.dateUpdated)
    .sort((a, b) => new Date(b.dateUpdated) - new Date(a.dateUpdated))
    .slice(0, 5);
  updatedContainer.innerHTML = "";
  updatedTools.forEach((tool) =>
    updatedContainer.appendChild(createUpdatedToolCard(tool)),
  );
}

function initAllTools(totalTools) {
  const allToolsContainer = document.getElementById("all-tools");
  allToolsContainer.innerHTML = "";
  tools.forEach((tool) => allToolsContainer.appendChild(createToolCard(tool)));
  const allToolsSection = document.querySelector("section:nth-of-type(3) h2");
  allToolsSection.textContent = `All Tools (${totalTools})`;
}

function filterTools(query, category, totalTools) {
  const lowerQuery = query.toLowerCase().trim();
  const allToolCards = document.querySelectorAll("#all-tools > div");
  const allToolsSection = document.querySelector("section:nth-of-type(3) h2");
  const noResults = document.getElementById("no-results");
  const resultsCount = document.getElementById("search-results-count");
  const recentSection = document.getElementById("recent-section");
  const updatedSection = document.getElementById("updated-section");

  let visibleCount = 0;

  allToolCards.forEach((card) => {
    const name = card.dataset.name || "";
    const description = card.dataset.description || "";
    const cardCategory = card.dataset.category || "";
    const queryMatches =
      !lowerQuery ||
      name.includes(lowerQuery) ||
      description.toLowerCase().includes(lowerQuery) ||
      cardCategory.includes(lowerQuery);
    const categoryMatches = category === "all" || cardCategory === category;
    const matches = queryMatches && categoryMatches;
    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });

  const isFiltered = lowerQuery || category !== "all";

  if (isFiltered) {
    recentSection.style.display = "none";
    updatedSection.style.display = "none";
    if (lowerQuery) {
      allToolsSection.textContent = `Search Results (${visibleCount})`;
    } else {
      allToolsSection.textContent = `All Tools (${visibleCount})`;
    }
    noResults.classList.toggle("d-none", visibleCount > 0);
    resultsCount.textContent =
      visibleCount === tools.length
        ? ""
        : `Showing ${visibleCount} of ${tools.length} tools`;
  } else {
    recentSection.style.display = "";
    updatedSection.style.display = "";
    allToolsSection.textContent = `All Tools (${totalTools})`;
    noResults.classList.add("d-none");
    resultsCount.textContent = "";
  }
}

function initCategoryFilters(totalTools) {
  const categoryButtons = document.querySelectorAll("#category-filters button");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.category;
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const searchInput = document.getElementById("tool-search");
      filterTools(searchInput.value, currentCategory, totalTools);
    });
  });
}

function initSearch(totalTools) {
  const searchInput = document.getElementById("tool-search");
  const clearBtn = document.getElementById("clear-search");

  searchInput.addEventListener("input", () => {
    const hasValue = searchInput.value.length > 0;
    clearBtn.classList.toggle("d-none", !hasValue);
    filterTools(searchInput.value, currentCategory, totalTools);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("d-none");
    filterTools("", currentCategory, totalTools);
    searchInput.focus();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      clearBtn.classList.add("d-none");
      filterTools("", currentCategory, totalTools);
    }
  });
}

(async () => {
  await loadTools();
  const totalTools = tools.length;
  initRecentlyAdded();
  initRecentlyUpdated();
  initAllTools(totalTools);
  initSearch(totalTools);
  initCategoryFilters(totalTools);
})();

(function () {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";

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

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
