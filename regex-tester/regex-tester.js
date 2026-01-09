(() => {
  let debounceTimer;

  function getRegexFlags() {
    const flags = [];
    if (document.getElementById('flag-global').checked) flags.push('g');
    if (document.getElementById('flag-case-insensitive').checked) flags.push('i');
    if (document.getElementById('flag-multiline').checked) flags.push('m');
    if (document.getElementById('flag-dot-all').checked) flags.push('s');
    return flags.join('');
  }

  function testRegex() {
    const pattern = document.getElementById('regex-pattern').value;
    const testString = document.getElementById('test-string').value;
    const flags = getRegexFlags();

    const errorElement = document.getElementById('regex-error');
    const resultsElement = document.getElementById('match-results');
    const detailsElement = document.getElementById('match-details');

    // Clear previous results
    errorElement.classList.add('d-none');
    resultsElement.innerHTML = '';
    detailsElement.classList.add('d-none');

    if (!pattern) {
      resultsElement.innerHTML = '<div class="text-body-secondary">Enter a regex pattern to begin testing</div>';
      return;
    }

    if (!testString) {
      resultsElement.innerHTML = '<div class="text-body-secondary">Enter text to test against the regex pattern</div>';
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [...testString.matchAll(regex)];

      if (matches.length === 0) {
        resultsElement.innerHTML = '<div class="alert alert-info">No matches found</div>';
        return;
      }

      // Show summary
      const matchCount = matches.length;
      const uniqueMatches = new Set(matches.map(match => match[0])).size;
      resultsElement.innerHTML = `
        <div class="alert alert-success">
          Found ${matchCount} match${matchCount !== 1 ? 'es' : ''}${uniqueMatches !== matchCount ? ` (${uniqueMatches} unique)` : ''}
        </div>
      `;

      // Show detailed results
      const matchList = document.getElementById('match-list');
      matchList.innerHTML = '';

      matches.forEach((match, index) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'mb-3 p-3 border rounded';

        let html = `<h6>Match ${index + 1}</h6>`;
        html += `<div class="mb-2"><strong>Full Match:</strong> <code>${escapeHtml(match[0])}</code></div>`;

        if (match.length > 1) {
          html += '<div class="mb-2"><strong>Capture Groups:</strong></div>';
          html += '<ul class="list-unstyled ms-3">';
          for (let i = 1; i < match.length; i++) {
            const group = match[i];
            html += `<li>Group ${i}: <code>${group !== undefined ? escapeHtml(group) : '(undefined)'}</code></li>`;
          }
          html += '</ul>';
        }

        html += `<div class="mb-2"><strong>Position:</strong> ${match.index} to ${match.index + match[0].length}</div>`;

        matchDiv.innerHTML = html;
        matchList.appendChild(matchDiv);
      });

      detailsElement.classList.remove('d-none');

    } catch (error) {
      errorElement.textContent = `Invalid regex: ${error.message}`;
      errorElement.classList.remove('d-none');
      resultsElement.innerHTML = '<div class="text-body-secondary">Fix the regex pattern to see results</div>';
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function debounceTestRegex() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(testRegex, 300);
  }

  function init() {
    // Add event listeners
    document.getElementById('regex-pattern').addEventListener('input', debounceTestRegex);
    document.getElementById('test-string').addEventListener('input', debounceTestRegex);

    // Flag checkboxes
    const flags = ['flag-global', 'flag-case-insensitive', 'flag-multiline', 'flag-dot-all'];
    flags.forEach(flagId => {
      document.getElementById(flagId).addEventListener('change', testRegex);
    });

    // Initial test with example
    document.getElementById('regex-pattern').value = '\\b\\w+@\\w+\\.\\w+\\b';
    document.getElementById('test-string').value = 'Contact me at john@example.com or support@company.org for help.';
    testRegex();
  }

  document.addEventListener('DOMContentLoaded', init);
})();