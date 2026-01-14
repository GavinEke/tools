(() => {
  const inputHar = document.getElementById('input-har');
  const harFile = document.getElementById('har-file');
  const analyseBtn = document.getElementById('analyse-btn');
  const clearBtn = document.getElementById('clear-btn');
  const summarySection = document.getElementById('summary-section');
  const requestsSection = document.getElementById('requests-section');
  const totalRequests = document.getElementById('total-requests');
  const totalSize = document.getElementById('total-size');
  const loadTime = document.getElementById('load-time');
  const errors = document.getElementById('errors');
  const requestsBody = document.getElementById('requests-body');
  const filterStatus = document.getElementById('filter-status');
  const filterUrl = document.getElementById('filter-url');
  const requestModal = new bootstrap.Modal(document.getElementById('requestModal'));
  const requestDetails = document.getElementById('request-details');

  let harData = null;

  // Parse HAR file
  function parseHar(harText) {
    try {
      const data = JSON.parse(harText);
      if (!data.log || !data.log.entries) {
        throw new Error('Invalid HAR format: missing log.entries');
      }
      return data;
    } catch (e) {
      throw new Error('Invalid HAR file: ' + e.message);
    }
  }

  // Format file size
  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Format time
  function formatTime(ms) {
    if (ms < 1000) return ms + ' ms';
    return (ms / 1000).toFixed(2) + ' s';
  }

  // Get status badge class
  function getStatusBadgeClass(status) {
    if (status >= 200 && status < 300) return 'bg-success';
    if (status >= 300 && status < 400) return 'bg-info';
    if (status >= 400 && status < 500) return 'bg-warning';
    if (status >= 500) return 'bg-danger';
    return 'bg-secondary';
  }

  // Calculate total load time
  function calculateLoadTime(entries) {
    if (entries.length === 0) return 0;
    const startTime = Math.min(...entries.map(e => new Date(e.startedDateTime).getTime()));
    const endTime = Math.max(...entries.map(e => {
      const start = new Date(e.startedDateTime).getTime();
      return start + (e.time || 0);
    }));
    return endTime - startTime;
  }

  // Analyse HAR data
  function analyseHar(data) {
    const entries = data.log.entries;
    const summary = {
      totalRequests: entries.length,
      totalSize: entries.reduce((sum, entry) => {
        return sum + (entry.response.content.size || 0);
      }, 0),
      loadTime: calculateLoadTime(entries),
      errors: entries.filter(entry => entry.response.status >= 400).length
    };

    return { summary, entries };
  }

  // Render summary
  function renderSummary(summary) {
    totalRequests.textContent = summary.totalRequests;
    totalSize.textContent = formatSize(summary.totalSize);
    loadTime.textContent = formatTime(summary.loadTime);
    errors.textContent = summary.errors;
    summarySection.classList.remove('d-none');
  }

  // Render requests table
  function renderRequests(entries) {
    requestsBody.innerHTML = '';

    entries.forEach((entry, index) => {
      const row = document.createElement('tr');

      const method = entry.request.method;
      const url = entry.request.url;
      const status = entry.response.status;
      const size = entry.response.content.size || 0;
      const time = entry.time || 0;

      row.innerHTML = `
        <td><span class="badge bg-secondary">${method}</span></td>
        <td class="text-truncate" style="max-width: 300px;" title="${url}">${url}</td>
        <td><span class="badge ${getStatusBadgeClass(status)}">${status}</span></td>
        <td>${formatSize(size)}</td>
        <td>${formatTime(time)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="showRequestDetails(${index})">Details</button>
        </td>
      `;

      requestsBody.appendChild(row);
    });

    requestsSection.classList.remove('d-none');
  }

  // Show request details
  window.showRequestDetails = function(index) {
    const entry = harData.log.entries[index];

    const detailsHtml = `
      <div class="row">
        <div class="col-md-6">
          <h6>Request</h6>
          <p><strong>Method:</strong> ${entry.request.method}</p>
          <p><strong>URL:</strong> <code>${entry.request.url}</code></p>
          <p><strong>Headers:</strong></p>
          <ul class="list-unstyled small">
            ${entry.request.headers.map(h => `<li><code>${h.name}: ${h.value}</code></li>`).join('')}
          </ul>
        </div>
        <div class="col-md-6">
          <h6>Response</h6>
          <p><strong>Status:</strong> ${entry.response.status} ${entry.response.statusText}</p>
          <p><strong>Size:</strong> ${formatSize(entry.response.content.size || 0)}</p>
          <p><strong>Time:</strong> ${formatTime(entry.time || 0)}</p>
          <p><strong>Headers:</strong></p>
          <ul class="list-unstyled small">
            ${entry.response.headers.map(h => `<li><code>${h.name}: ${h.value}</code></li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="mt-3">
        <h6>Timings</h6>
        <div class="row text-center small">
          <div class="col"><strong>Blocked:</strong><br>${formatTime(entry.timings.blocked || 0)}</div>
          <div class="col"><strong>DNS:</strong><br>${formatTime(entry.timings.dns || 0)}</div>
          <div class="col"><strong>Connect:</strong><br>${formatTime(entry.timings.connect || 0)}</div>
          <div class="col"><strong>Send:</strong><br>${formatTime(entry.timings.send || 0)}</div>
          <div class="col"><strong>Wait:</strong><br>${formatTime(entry.timings.wait || 0)}</div>
          <div class="col"><strong>Receive:</strong><br>${formatTime(entry.timings.receive || 0)}</div>
        </div>
      </div>
    `;

    requestDetails.innerHTML = detailsHtml;
    requestModal.show();
  };

  // Filter requests
  function filterRequests() {
    const statusFilter = filterStatus.value;
    const urlFilter = filterUrl.value.toLowerCase();

    const rows = requestsBody.querySelectorAll('tr');
    rows.forEach(row => {
      const status = row.cells[2].textContent.trim();
      const url = row.cells[1].textContent.toLowerCase();

      const statusMatch = !statusFilter || status === statusFilter;
      const urlMatch = !urlFilter || url.includes(urlFilter);

      row.style.display = statusMatch && urlMatch ? '' : 'none';
    });
  }

  // Handle file upload
  harFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        inputHar.value = e.target.result;
      };
      reader.readAsText(file);
    }
  });

  // Analyse button click
  analyseBtn.addEventListener('click', () => {
    const harText = inputHar.value.trim();
    if (!harText) {
      alert('Please provide HAR file content');
      return;
    }

    try {
      harData = parseHar(harText);
      const { summary, entries } = analyseHar(harData);

      renderSummary(summary);
      renderRequests(entries);
    } catch (error) {
      alert('Error analysing HAR file: ' + error.message);
    }
  });

  // Clear button click
  clearBtn.addEventListener('click', () => {
    inputHar.value = '';
    harFile.value = '';
    harData = null;
    summarySection.classList.add('d-none');
    requestsSection.classList.add('d-none');
    filterStatus.value = '';
    filterUrl.value = '';
  });

  // Filter events
  filterStatus.addEventListener('change', filterRequests);
  filterUrl.addEventListener('input', filterRequests);
})();