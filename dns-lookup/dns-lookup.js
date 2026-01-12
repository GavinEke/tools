(() => {
  const API_URL = 'https://cloudflare-dns.com/dns-query';

  function isValidDomain(domain) {
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(domain) && domain.length <= 253;
  }

  async function lookupDNS(domain, type) {
    const url = `${API_URL}?name=${encodeURIComponent(domain)}&type=${type}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/dns-json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to look up DNS records');
    }
    return response.json();
  }

  function displayResults(data, recordType) {
    const tableBody = document.getElementById('records-table');
    tableBody.innerHTML = '';

    if (!data.Answer || data.Answer.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="4" class="text-center py-4 text-muted">No ${recordType} records found for this domain.</td>`;
      tableBody.appendChild(row);
    } else {
      data.Answer.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="ps-4 fw-medium">${recordType}</td>
          <td>${record.name}</td>
          <td>${record.TTL}</td>
          <td class="text-break">${record.data}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    document.getElementById('results').classList.remove('d-none');
  }

  function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
  }

  function hideError() {
    document.getElementById('error').classList.add('d-none');
  }

  function showLoading() {
    document.getElementById('loading').classList.remove('d-none');
    document.getElementById('results').classList.add('d-none');
    hideError();
  }

  function hideLoading() {
    document.getElementById('loading').classList.add('d-none');
  }

  async function handleLookup() {
    const domainInput = document.getElementById('domain-input').value.trim();
    const recordType = document.getElementById('record-type').value;

    if (!domainInput) {
      showError('Please enter a domain name');
      return;
    }

    if (!isValidDomain(domainInput)) {
      showError('Please enter a valid domain name');
      return;
    }

    showLoading();

    try {
      const data = await lookupDNS(domainInput, recordType);
      hideLoading();
      displayResults(data, recordType);
    } catch (error) {
      hideLoading();
      showError(error.message || 'Failed to look up DNS records. Please try again.');
    }
  }

  function init() {
    document.getElementById('lookup-btn').addEventListener('click', handleLookup);
    document.getElementById('domain-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLookup();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();