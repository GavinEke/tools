(() => {
  const colorPicker = document.getElementById('color-picker');
  const colorSwatch = document.getElementById('color-swatch');
  const hexInput = document.getElementById('hex-input');
  const rgbInput = document.getElementById('rgb-input');
  const hslInput = document.getElementById('hsl-input');
  const copyHexBtn = document.getElementById('copy-hex');
  const copyRgbBtn = document.getElementById('copy-rgb');
  const copyHslBtn = document.getElementById('copy-hsl');

  // Color conversion functions
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function parseRgbString(rgbStr) {
    const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    } : null;
  }

  function parseHslString(hslStr) {
    const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    return match ? {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    } : null;
  }

  // Update all inputs based on hex value
  function updateFromHex(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hexInput.value = hex.toLowerCase();
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    colorPicker.value = hex;
    colorSwatch.style.backgroundColor = hex;
  }

  // Update all inputs based on RGB value
  function updateFromRgb(rgbStr) {
    const rgb = parseRgbString(rgbStr);
    if (!rgb) return;

    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    hexInput.value = hex.toLowerCase();
    rgbInput.value = rgbStr;
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    colorPicker.value = hex;
    colorSwatch.style.backgroundColor = hex;
  }

  // Update all inputs based on HSL value
  function updateFromHsl(hslStr) {
    const hsl = parseHslString(hslStr);
    if (!hsl) return;

    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    hexInput.value = hex.toLowerCase();
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value = hslStr;
    colorPicker.value = hex;
    colorSwatch.style.backgroundColor = hex;
  }

  // Event listeners
  colorPicker.addEventListener('input', (e) => {
    updateFromHex(e.target.value);
  });

  hexInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#?[0-9a-fA-F]{6}$/.test(hex)) {
      updateFromHex(hex.startsWith('#') ? hex : '#' + hex);
    }
  });

  rgbInput.addEventListener('input', (e) => {
    const rgbStr = e.target.value;
    if (/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(rgbStr)) {
      updateFromRgb(rgbStr);
    }
  });

  hslInput.addEventListener('input', (e) => {
    const hslStr = e.target.value;
    if (/^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/.test(hslStr)) {
      updateFromHsl(hslStr);
    }
  });

  // Copy functions
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  copyHexBtn.addEventListener('click', () => {
    copyToClipboard(hexInput.value);
  });

  copyRgbBtn.addEventListener('click', () => {
    copyToClipboard(rgbInput.value);
  });

  copyHslBtn.addEventListener('click', () => {
    copyToClipboard(hslInput.value);
  });

  // Initialize with default color
  updateFromHex('#2563eb');
})();