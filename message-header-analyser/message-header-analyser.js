(function() {
  const inputHeaders = document.getElementById('input-headers');
  const analyzeBtn = document.getElementById('analyze-btn');
  const clearBtn = document.getElementById('clear-btn');
  const outputSection = document.getElementById('output-section');
  const headersBody = document.getElementById('headers-body');
  const copyBtn = document.getElementById('copy-btn');

  function analyzeHeaders() {
    const text = inputHeaders.value.trim();
    if (!text) return;

    // Unfold headers: remove CRLF followed by WSP
    const unfolded = text.replace(/\r?\n[ \t]+/g, ' ');
    const lines = unfolded.split('\n');
    const headers = [];

    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        headers.push({ key, value });
      }
    });

    if (headers.length === 0) return;

    // Clear previous results
    headersBody.innerHTML = '';

    // Add rows
    headers.forEach(header => {
      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      keyCell.textContent = header.key;
      const valueCell = document.createElement('td');
      valueCell.textContent = header.value;
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      headersBody.appendChild(row);
    });

    outputSection.classList.remove('d-none');
  }

  function clearAll() {
    inputHeaders.value = '';
    headersBody.innerHTML = '';
    outputSection.classList.add('d-none');
  }

  function copyHeaders() {
    const rows = Array.from(headersBody.querySelectorAll('tr'));
    const text = rows.map(row => {
      const cells = row.querySelectorAll('td');
      return `${cells[0].textContent}: ${cells[1].textContent}`;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      // Optionally show feedback
    });
  }

  analyzeBtn.addEventListener('click', analyzeHeaders);
  clearBtn.addEventListener('click', clearAll);
  copyBtn.addEventListener('click', copyHeaders);
})();