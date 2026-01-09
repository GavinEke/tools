(() => {
  let savedMarkdown = '# Hello World\n\nThis is a **markdown** preview tool.';

  function updatePreview() {
    const input = document.getElementById('markdown-input');
    if (input) {
      savedMarkdown = input.value;
      const preview = document.getElementById('preview-output');
      if (preview) {
        try {
          preview.innerHTML = marked.parse(savedMarkdown);
        } catch (e) {
          preview.innerHTML = '<p class="text-danger">Error parsing markdown: ' + e.message + '</p>';
        }
      }
    }
  }

  function setViewMode(mode) {
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
    setViewMode('split');

    document.getElementById('view-split').addEventListener('change', () => setViewMode('split'));
    document.getElementById('view-edit').addEventListener('change', () => setViewMode('edit'));
    document.getElementById('view-preview').addEventListener('change', () => setViewMode('preview'));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
