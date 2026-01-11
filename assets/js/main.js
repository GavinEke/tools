let tools = [];

async function loadTools() {
  try {
    const response = await fetch('data/tools.json');
    tools = await response.json();
  } catch (error) {
    console.error('Failed to load tools:', error);
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function createToolCard(tool) {
  return `
    <div class="col-md-6 col-lg-4" data-name="${tool.name.toLowerCase()}" data-description="${tool.description.toLowerCase()}" data-category="${tool.category.toLowerCase()}">
      <a href="${tool.href}" class="card tool-card h-100 text-decoration-none">
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <div class="tool-icon me-3">${tool.icon}</div>
            <h3 class="h5 card-title fw-semibold mb-0">${tool.name}</h3>
          </div>
          <p class="card-text text-body-secondary">${tool.description}</p>
        </div>
      </a>
    </div>
  `;
}

function createRecentToolCard(tool) {
  return `
    <div class="col-md-6 col-lg-4 col-xl">
      <a href="${tool.href}" class="card tool-card h-100 text-decoration-none">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="tool-icon">${tool.icon}</div>
            <span class="badge bg-light text-body-secondary small">${formatDate(tool.dateAdded)}</span>
          </div>
          <h3 class="h6 card-title fw-semibold mb-1">${tool.name}</h3>
          <p class="card-text text-body-secondary small mb-0">${tool.description}</p>
        </div>
      </a>
    </div>
  `;
}

function createUpdatedToolCard(tool) {
  return `
    <div class="col-md-6 col-lg-4 col-xl">
      <a href="${tool.href}" class="card tool-card h-100 text-decoration-none">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="tool-icon">${tool.icon}</div>
            <span class="badge bg-light text-body-secondary small">${formatDate(tool.dateUpdated)}</span>
          </div>
          <h3 class="h6 card-title fw-semibold mb-1">${tool.name}</h3>
          <p class="card-text text-body-secondary small mb-0">${tool.description}</p>
        </div>
      </a>
    </div>
  `;
}

function initRecentlyAdded() {
  const recentContainer = document.getElementById('recent-tools');
  const sortedTools = [...tools].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  const recentTools = sortedTools.slice(0, 5);
  recentContainer.innerHTML = recentTools.map(createRecentToolCard).join('');
}

function initRecentlyUpdated() {
  const updatedContainer = document.getElementById('updated-tools');
  const updatedTools = tools
    .filter(t => t.dateUpdated)
    .sort((a, b) => new Date(b.dateUpdated) - new Date(a.dateUpdated))
    .slice(0, 5);
  updatedContainer.innerHTML = updatedTools.map(createUpdatedToolCard).join('');
}

function initAllTools(totalTools) {
  const allToolsContainer = document.getElementById('all-tools');
  allToolsContainer.innerHTML = tools.map(createToolCard).join('');
  const allToolsSection = document.querySelector('section:nth-of-type(3) h2');
  allToolsSection.textContent = `All Tools (${totalTools})`;
}

function filterTools(query, totalTools) {
  const lowerQuery = query.toLowerCase().trim();
  const allToolCards = document.querySelectorAll('#all-tools > div');
  const allToolsSection = document.querySelector('section:nth-of-type(3) h2');
  const noResults = document.getElementById('no-results');
  const resultsCount = document.getElementById('search-results-count');
  const recentSection = document.getElementById('recent-section');
  const updatedSection = document.getElementById('updated-section');

  let visibleCount = 0;

  allToolCards.forEach(card => {
    const name = card.dataset.name || '';
    const description = card.dataset.description || '';
    const category = card.dataset.category || '';
    const matches = !lowerQuery || name.includes(lowerQuery) || description.toLowerCase().includes(lowerQuery) || category.includes(lowerQuery);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  if (lowerQuery) {
    recentSection.style.display = 'none';
    updatedSection.style.display = 'none';
    allToolsSection.textContent = `Search Results (${visibleCount})`;
    noResults.classList.toggle('d-none', visibleCount > 0);
    resultsCount.textContent = visibleCount === tools.length ? '' : `Showing ${visibleCount} of ${tools.length} tools`;
  } else {
    recentSection.style.display = '';
    updatedSection.style.display = '';
    allToolsSection.textContent = `All Tools (${totalTools})`;
    noResults.classList.add('d-none');
    resultsCount.textContent = '';
  }
}

function initSearch(totalTools) {
  const searchInput = document.getElementById('tool-search');
  const clearBtn = document.getElementById('clear-search');

  searchInput.addEventListener('input', () => {
    const hasValue = searchInput.value.length > 0;
    clearBtn.classList.toggle('d-none', !hasValue);
    filterTools(searchInput.value, totalTools);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.add('d-none');
    filterTools('', totalTools);
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      clearBtn.classList.add('d-none');
      filterTools('', totalTools);
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
})();
