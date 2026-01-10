(() => {
  function convertTimestampToDate() {
    const timestamp = parseFloat(document.getElementById('timestamp-input').value);
    const type = document.getElementById('timestamp-type').value;

    if (isNaN(timestamp)) {
      document.getElementById('date-output').innerHTML = '<div class="text-danger">Please enter a valid timestamp</div>';
      return;
    }

    let ms;
    if (type === 'seconds') {
      ms = timestamp * 1000;
    } else {
      ms = timestamp;
    }

    const date = new Date(ms);

    if (isNaN(date.getTime())) {
      document.getElementById('date-output').innerHTML = '<div class="text-danger">Invalid timestamp</div>';
      return;
    }

    const output = `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Local Date & Time</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${date.toLocaleString()}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">UTC Date & Time</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${date.toUTCString()}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">ISO 8601</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${date.toISOString()}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Locale Date String</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${date.toLocaleDateString()}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Locale Time String</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${date.toLocaleTimeString()}" readonly>
        </div>
      </div>
    `;

    document.getElementById('date-output').innerHTML = output;
  }

  function convertDateToTimestamp() {
    const dateInput = document.getElementById('date-input').value;
    const isoInput = document.getElementById('iso-input').value.trim();

    let date;
    if (dateInput) {
      date = new Date(dateInput);
    } else if (isoInput) {
      date = new Date(isoInput);
    } else {
      document.getElementById('timestamp-output').innerHTML = '<div class="text-danger">Please enter a date</div>';
      return;
    }

    if (isNaN(date.getTime())) {
      document.getElementById('timestamp-output').innerHTML = '<div class="text-danger">Invalid date format</div>';
      return;
    }

    const ms = date.getTime();
    const seconds = Math.floor(ms / 1000);

    const output = `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Unix Timestamp (Seconds)</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${seconds}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Unix Timestamp (Milliseconds)</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${ms}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Hexadecimal (Seconds)</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${seconds.toString(16).toUpperCase()}" readonly>
        </div>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">Hexadecimal (Milliseconds)</label>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${ms.toString(16).toUpperCase()}" readonly>
        </div>
      </div>
    `;

    document.getElementById('timestamp-output').innerHTML = output;
  }

  function setCurrentTimestamp() {
    const now = Date.now();
    document.getElementById('timestamp-input').value = Math.floor(now / 1000);
    convertTimestampToDate();
  }

  function setCurrentDate() {
    const now = new Date();
    const iso = now.toISOString().slice(0, 16); // Remove seconds and Z
    document.getElementById('date-input').value = iso;
    convertDateToTimestamp();
  }

  function clearTimestamp() {
    document.getElementById('timestamp-input').value = '';
    document.getElementById('date-output').innerHTML = '<div class="text-body-secondary">Converted date will appear here</div>';
  }

  function clearDate() {
    document.getElementById('date-input').value = '';
    document.getElementById('iso-input').value = '';
    document.getElementById('timestamp-output').innerHTML = '<div class="text-body-secondary">Converted timestamps will appear here</div>';
  }

  function init() {
    document.getElementById('convert-ts-btn').addEventListener('click', convertTimestampToDate);
    document.getElementById('current-ts-btn').addEventListener('click', setCurrentTimestamp);
    document.getElementById('clear-ts-btn').addEventListener('click', clearTimestamp);

    document.getElementById('convert-date-btn').addEventListener('click', convertDateToTimestamp);
    document.getElementById('now-btn').addEventListener('click', setCurrentDate);
    document.getElementById('clear-date-btn').addEventListener('click', clearDate);

    // Auto-convert on input change
    document.getElementById('timestamp-input').addEventListener('input', () => {
      if (document.getElementById('timestamp-input').value) {
        convertTimestampToDate();
      } else {
        clearTimestamp();
      }
    });

    document.getElementById('date-input').addEventListener('input', () => {
      if (document.getElementById('date-input').value) {
        convertDateToTimestamp();
      }
    });

    document.getElementById('iso-input').addEventListener('input', () => {
      if (document.getElementById('iso-input').value) {
        convertDateToTimestamp();
      }
    });

    document.getElementById('timestamp-type').addEventListener('change', () => {
      if (document.getElementById('timestamp-input').value) {
        convertTimestampToDate();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();