(() => {
  function parseUserAgent(ua) {
    const result = {
      browser: 'Unknown',
      version: 'Unknown',
      engine: 'Unknown',
      os: 'Unknown',
      device: 'Desktop',
      mobile: false
    };

    // Browser detection
    if (ua.includes('Firefox') && !ua.includes('Seamonkey')) {
      result.browser = 'Firefox';
      const match = ua.match(/Firefox\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Gecko';
    } else if (ua.includes('Seamonkey')) {
      result.browser = 'SeaMonkey';
      const match = ua.match(/Seamonkey\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Gecko';
    } else if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) {
      result.browser = 'Chrome';
      const match = ua.match(/Chrome\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Blink';
    } else if (ua.includes('Chromium')) {
      result.browser = 'Chromium';
      const match = ua.match(/Chromium\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Blink';
    } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Chromium')) {
      result.browser = 'Safari';
      const match = ua.match(/Version\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'WebKit';
    } else if (ua.includes('Edg/')) {
      result.browser = 'Edge';
      const match = ua.match(/Edg\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Blink';
    } else if (ua.includes('OPR') || ua.includes('Opera')) {
      result.browser = 'Opera';
      const match = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Blink';
    } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
      result.browser = 'Internet Explorer';
      const match = ua.match(/(?:MSIE |rv:)([\d.]+)/);
      result.version = match ? match[1] : 'Unknown';
      result.engine = 'Trident';
    }

    // Operating System detection
    if (ua.includes('Windows NT 10.0')) {
      result.os = 'Windows 10/11';
    } else if (ua.includes('Windows NT 6.3')) {
      result.os = 'Windows 8.1';
    } else if (ua.includes('Windows NT 6.2')) {
      result.os = 'Windows 8';
    } else if (ua.includes('Windows NT 6.1')) {
      result.os = 'Windows 7';
    } else if (ua.includes('Windows NT 6.0')) {
      result.os = 'Windows Vista';
    } else if (ua.includes('Windows NT 5.1')) {
      result.os = 'Windows XP';
    } else if (ua.includes('Windows')) {
      result.os = 'Windows';
    } else if (ua.includes('Mac OS X')) {
      const match = ua.match(/Mac OS X ([\d_]+)/);
      if (match) {
        result.os = 'macOS ' + match[1].replace(/_/g, '.');
      } else {
        result.os = 'macOS';
      }
    } else if (ua.includes('Linux')) {
      result.os = 'Linux';
    } else if (ua.includes('Android')) {
      const match = ua.match(/Android ([\d.]+)/);
      result.os = match ? 'Android ' + match[1] : 'Android';
      result.mobile = true;
    } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
      const match = ua.match(/OS ([\d_]+)/);
      result.os = 'iOS ' + (match ? match[1].replace(/_/g, '.') : '');
      result.mobile = ua.includes('iPhone') || ua.includes('iPod');
      result.device = ua.includes('iPad') ? 'Tablet' : 'Mobile';
    }

    // Device type detection
    if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) {
      result.device = 'Mobile';
      result.mobile = true;
    } else if (ua.includes('Tablet') || ua.includes('iPad')) {
      result.device = 'Tablet';
      result.mobile = false;
    } else if (ua.includes('TV') || ua.includes('SmartTV')) {
      result.device = 'TV';
      result.mobile = false;
    }

    // Additional mobile detection
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPod')) {
      result.mobile = true;
    }

    return result;
  }

  function displayCurrentUA() {
    const ua = navigator.userAgent;
    document.getElementById('current-ua').value = ua;
  }

  function displayParsedInfo(ua) {
    const parsed = parseUserAgent(ua);

    document.getElementById('parsed-browser').textContent = parsed.browser;
    document.getElementById('parsed-version').textContent = parsed.version;
    document.getElementById('parsed-engine').textContent = parsed.engine;
    document.getElementById('parsed-os').textContent = parsed.os;
    document.getElementById('parsed-device').textContent = parsed.device;
    document.getElementById('parsed-mobile').textContent = parsed.mobile ? 'Yes' : 'No';
  }

  async function copyCurrentUA() {
    const ua = document.getElementById('current-ua').value;
    try {
      await navigator.clipboard.writeText(ua);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function analyzeCustomUA() {
    const ua = document.getElementById('custom-ua').value.trim();
    if (ua) {
      displayParsedInfo(ua);
    }
  }

  function clearCustomUA() {
    document.getElementById('custom-ua').value = '';
    displayCurrentUA();
    displayParsedInfo(navigator.userAgent);
  }

  function loadPresetUA(event) {
    const ua = event.target.closest('.ua-preset').dataset.ua;
    document.getElementById('custom-ua').value = ua;
    displayParsedInfo(ua);
  }

  function init() {
    displayCurrentUA();
    displayParsedInfo(navigator.userAgent);

    document.getElementById('copy-current-btn').addEventListener('click', copyCurrentUA);
    document.getElementById('analyze-btn').addEventListener('click', analyzeCustomUA);
    document.getElementById('clear-btn').addEventListener('click', clearCustomUA);
    document.getElementById('refresh-btn').addEventListener('click', () => {
      displayCurrentUA();
      displayParsedInfo(navigator.userAgent);
    });

    document.querySelectorAll('.ua-preset').forEach(btn => {
      btn.addEventListener('click', loadPresetUA);
    });

    // Allow Enter key to analyze custom UA
    document.getElementById('custom-ua').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        analyzeCustomUA();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();