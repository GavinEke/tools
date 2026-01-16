(() => {
  const logInput = document.getElementById('log-input');
  const extractBtn = document.getElementById('extract-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultsSection = document.getElementById('results-section');
  const ipList = document.getElementById('ip-list');
  const domainList = document.getElementById('domain-list');
  const urlList = document.getElementById('url-list');

  // Valid top-level domains
  const validTlds = new Set(['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'biz', 'info', 'name', 'pro', 'aero', 'coop', 'museum', 'travel', 'cat', 'jobs', 'mobi', 'tel', 'asia', 'eu', 'me', 'tv', 'cc', 'ws', 'bz', 'nu', 'sh', 'xxx', 'arpa', 'africa', 'coop', 'jobs', 'mobi', 'name', 'post', 'pro', 'tel', 'travel', 'xxx', 'edu', 'gov', 'int', 'mil', 'arpa']);

  // Regex patterns
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  const urlRegex = /[a-zA-Z][a-zA-Z0-9]*:\/\/[^\s]+/g;
  const potentialDomainRegex = /\b([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.([a-zA-Z]{2,})\b/g;

  function extractIOCs(text) {
    const ips = new Set();
    const domains = new Set();
    const urls = new Set();

    // Extract IPs
    let match;
    while ((match = ipRegex.exec(text)) !== null) {
      ips.add(match[0]);
    }

    // Extract URLs
    while ((match = urlRegex.exec(text)) !== null) {
      urls.add(match[0]);
    }

    // Extract domains (excluding IPs and URLs)
    const cleanedText = text.replace(ipRegex, '').replace(urlRegex, '');
    while ((match = potentialDomainRegex.exec(cleanedText)) !== null) {
      const fullMatch = match[0];
      const tld = match[2].toLowerCase();
      if (validTlds.has(tld)) {
        domains.add(fullMatch);
      }
    }

    return { ips: Array.from(ips), domains: Array.from(domains), urls: Array.from(urls) };
  }

  function renderResults(results) {
    // IPs
    ipList.innerHTML = '';
    if (results.ips.length > 0) {
      results.ips.forEach(ip => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.textContent = ip;
        ipList.appendChild(item);
      });
    } else {
      ipList.innerHTML = '<div class="list-group-item text-muted">No IPs found</div>';
    }

    // Domains
    domainList.innerHTML = '';
    if (results.domains.length > 0) {
      results.domains.forEach(domain => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.textContent = domain;
        domainList.appendChild(item);
      });
    } else {
      domainList.innerHTML = '<div class="list-group-item text-muted">No domains found</div>';
    }

    // URLs
    urlList.innerHTML = '';
    if (results.urls.length > 0) {
      results.urls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.textContent = url;
        urlList.appendChild(item);
      });
    } else {
      urlList.innerHTML = '<div class="list-group-item text-muted">No URLs found</div>';
    }

    resultsSection.style.display = 'block';
  }

  extractBtn.addEventListener('click', () => {
    const fileInput = document.getElementById('log-file');
    const file = fileInput.files[0];
    const text = logInput.value.trim();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileText = e.target.result;
        const results = extractIOCs(fileText);
        renderResults(results);
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      };
      reader.readAsText(file);
    } else if (text) {
      const results = extractIOCs(text);
      renderResults(results);
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  clearBtn.addEventListener('click', () => {
    document.getElementById('log-file').value = '';
    logInput.value = '';
    resultsSection.style.display = 'none';
  });
})();