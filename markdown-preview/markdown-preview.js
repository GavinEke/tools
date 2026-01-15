(() => {
  const STORAGE_KEY = 'markdown-preview-data';
  let savedMarkdown = '# Hello World\n\nThis is a **markdown** preview tool.';
  let savedViewMode = 'split';

  // Load saved data from localStorage
  function loadSavedData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.markdown) {
          savedMarkdown = data.markdown;
        }
        if (data.viewMode) {
          savedViewMode = data.viewMode;
        }
      } catch (e) {
        console.warn('Failed to load saved markdown preview data:', e);
      }
    }
  }

  // Save current state to localStorage
  function saveCurrentState() {
    const data = {
      markdown: savedMarkdown,
      viewMode: savedViewMode
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Simple HTML sanitizer to prevent XSS
  function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove script tags and their contents
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remove event handlers and dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      // Remove event handler attributes
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        // Remove dangerous URLs
        if (attr.name === 'href' || attr.name === 'src') {
          const value = attr.value.toLowerCase();
          if (value.startsWith('javascript:') || value.startsWith('data:') || value.startsWith('vbscript:')) {
            el.removeAttribute(attr.name);
          }
        }
      });
    });

    return temp.innerHTML;
  }

  function updatePreview() {
    const input = document.getElementById('markdown-input');
    if (input) {
      savedMarkdown = input.value;
      saveCurrentState();
      const preview = document.getElementById('preview-output');
      if (preview) {
        try {
          const parsedHtml = marked.parse(savedMarkdown);
          preview.innerHTML = sanitizeHtml(parsedHtml);
        } catch (e) {
          const p = document.createElement('p');
          p.className = 'text-danger';
          p.textContent = 'Error parsing markdown: ' + e.message;
          preview.innerHTML = '';
          preview.appendChild(p);
        }
      }
    }
  }

  function setViewMode(mode) {
    savedViewMode = mode;
    saveCurrentState();

    const container = document.getElementById('editor-container');
    container.innerHTML = '';
    container.className = '';

    const textareaCol = document.createElement('div');
    const previewCol = document.createElement('div');

    const textareaWrapper = document.createElement('div');
    textareaWrapper.className = 'h-100';
    textareaWrapper.innerHTML = '<label for="markdown-input" class="form-label fw-medium">Markdown</label><textarea class="form-control font-monospace h-100" id="markdown-input" rows="20" placeholder="Enter Markdown here...">' + savedMarkdown.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</textarea>';

    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'h-100';
    previewWrapper.innerHTML = '<label class="form-label fw-medium">Preview</label><div class="card h-100"><div class="card-body" id="preview-output" style="overflow-y: auto;"></div></div>';

    textareaCol.appendChild(textareaWrapper);
    previewCol.appendChild(previewWrapper);

    switch (mode) {
      case 'split':
        container.className = 'row g-3';
        textareaCol.className = 'col-md-6';
        previewCol.className = 'col-md-6';
        break;
      case 'edit':
        textareaCol.className = 'col-12';
        previewCol.className = 'd-none';
        break;
      case 'preview':
        textareaCol.className = 'd-none';
        previewCol.className = 'col-12';
        break;
    }

    container.appendChild(textareaCol);
    container.appendChild(previewCol);

    document.getElementById('markdown-input').addEventListener('input', updatePreview);
    updatePreview();
  }

  function init() {
    loadSavedData();

    // Set up event listeners first
    document.getElementById('view-split').addEventListener('change', () => setViewMode('split'));
    document.getElementById('view-edit').addEventListener('change', () => setViewMode('edit'));
    document.getElementById('view-preview').addEventListener('change', () => setViewMode('preview'));

    // Set the correct radio button and initialize view mode
    const radioButton = document.getElementById('view-' + savedViewMode);
    if (radioButton) {
      radioButton.checked = true;
    }

    setViewMode(savedViewMode);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
