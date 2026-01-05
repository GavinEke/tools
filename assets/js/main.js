document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const toolsList = document.getElementById('tools-list');
  const loadingIndicator = document.getElementById('loading');

  let allTools = [];

  fetch('data/tools.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load tools data');
      }
      return response.json();
    })
    .then(tools => {
      allTools = tools;
      renderTools(tools);
      loadingIndicator.style.display = 'none';
    })
    .catch(error => {
      console.error('Error loading tools:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        loadingIndicator.innerHTML = 'Unable to load tools. <br><br><strong>Note:</strong> This website requires a web server to function properly (browsers block fetch() requests when opening files directly). <br><br>To view locally, run: <code>python3 -m http.server 8080</code> in this directory, then open <a href="http://localhost:8080">http://localhost:8080</a>';
      } else {
        loadingIndicator.textContent = 'Error loading tools. Please refresh the page.';
      }
    });

  searchInput.addEventListener('input', debounce(function(e) {
    const query = e.target.value.toLowerCase().trim();
    const filtered = filterTools(allTools, query);
    renderTools(filtered);
  }, 300));

  function filterTools(tools, query) {
    if (!query) {
      return tools;
    }

    return tools.filter(tool => {
      const nameMatch = tool.name.toLowerCase().includes(query);
      const descMatch = tool.description.toLowerCase().includes(query);
      const tagMatch = tool.tags.some(tag => tag.toLowerCase().includes(query));
      return nameMatch || descMatch || tagMatch;
    });
  }

  function renderTools(tools) {
    if (tools.length === 0) {
      toolsList.innerHTML = '<div class="no-results">No tools found matching your search.</div>';
      return;
    }

    toolsList.innerHTML = tools.map(tool => `
      <a href="${tool.path}" class="tool-card">
        <h3>${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.description)}</p>
        <div class="tool-tags">
          ${tool.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </a>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
});
