(() => {
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async function encodeInput() {
    const textInput = document.getElementById('encode-text-input').value;
    const fileInput = document.getElementById('encode-file-input').files[0];
    const activeTab = document.querySelector('#encode-input-tabs .nav-link.active').id;

    let encoded = '';
    let inputType = '';

    if (activeTab === 'encode-text-tab' && textInput) {
      encoded = btoa(textInput);
      inputType = 'text';
    } else if (activeTab === 'encode-file-tab' && fileInput) {
      const arrayBuffer = await fileInput.arrayBuffer();
      encoded = arrayBufferToBase64(arrayBuffer);
      inputType = 'file';
    }

    if (encoded) {
      document.getElementById('encode-output').textContent = encoded;
      document.getElementById('encode-stats').textContent = `Encoded ${inputType} (${encoded.length} characters)`;
      document.getElementById('encode-stats').classList.remove('d-none');
      document.getElementById('encode-output-container').classList.remove('text-body-secondary');
    } else {
      document.getElementById('encode-output').textContent = 'Base64 output will appear here';
      document.getElementById('encode-stats').classList.add('d-none');
      document.getElementById('encode-output-container').classList.add('text-body-secondary');
    }
  }

  function decodeInput() {
    const base64Input = document.getElementById('decode-input').value.trim();

    if (!base64Input) {
      document.getElementById('decode-output').textContent = 'Decoded output will appear here';
      document.getElementById('decode-stats').classList.add('d-none');
      document.getElementById('decode-output-container').classList.add('text-body-secondary');
      document.getElementById('decode-download-btn').classList.add('d-none');
      return;
    }

    try {
      const decoded = atob(base64Input);
      // Check if it's printable text or binary
      const isText = /^[\x20-\x7E\t\n\r]*$/.test(decoded) && decoded.length > 0;

      if (isText) {
        document.getElementById('decode-output').textContent = decoded;
        document.getElementById('decode-stats').textContent = `Decoded text (${decoded.length} characters)`;
        document.getElementById('decode-download-btn').classList.add('d-none');
      } else {
        document.getElementById('decode-output').textContent = `Binary data detected (${decoded.length} bytes). Use download button.`;
        document.getElementById('decode-stats').textContent = `Decoded binary (${decoded.length} bytes)`;
        document.getElementById('decode-download-btn').classList.remove('d-none');
      }
      document.getElementById('decode-stats').classList.remove('d-none');
      document.getElementById('decode-output-container').classList.remove('text-body-secondary');
    } catch (err) {
      document.getElementById('decode-output').textContent = 'Error: Invalid Base64 string';
      document.getElementById('decode-stats').textContent = 'Invalid Base64 input';
      document.getElementById('decode-stats').classList.remove('d-none');
      document.getElementById('decode-output-container').classList.remove('text-body-secondary');
      document.getElementById('decode-download-btn').classList.add('d-none');
    }
  }

  function clearEncode() {
    document.getElementById('encode-text-input').value = '';
    document.getElementById('encode-file-input').value = '';
    document.getElementById('encode-file-info').classList.add('d-none');
    document.getElementById('encode-output').textContent = 'Base64 output will appear here';
    document.getElementById('encode-stats').classList.add('d-none');
    document.getElementById('encode-output-container').classList.add('text-body-secondary');
  }

  function clearDecode() {
    document.getElementById('decode-input').value = '';
    document.getElementById('decode-output').textContent = 'Decoded output will appear here';
    document.getElementById('decode-stats').classList.add('d-none');
    document.getElementById('decode-output-container').classList.add('text-body-secondary');
    document.getElementById('decode-download-btn').classList.add('d-none');
  }

  async function copyEncodeToClipboard() {
    const output = document.getElementById('encode-output').textContent;
    if (output !== 'Base64 output will appear here') {
      try {
        await navigator.clipboard.writeText(output);
        const btn = document.getElementById('encode-copy-btn');
        const originalTitle = btn.getAttribute('title');
        btn.setAttribute('title', 'Copied!');
        setTimeout(() => btn.setAttribute('title', originalTitle), 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }

  async function copyDecodeToClipboard() {
    const output = document.getElementById('decode-output').textContent;
    if (output !== 'Decoded output will appear here' && !output.startsWith('Error:')) {
      try {
        await navigator.clipboard.writeText(output);
        const btn = document.getElementById('decode-copy-btn');
        const originalTitle = btn.getAttribute('title');
        btn.setAttribute('title', 'Copied!');
        setTimeout(() => btn.setAttribute('title', originalTitle), 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }

  function downloadEncodeOutput() {
    const output = document.getElementById('encode-output').textContent;
    if (output !== 'Base64 output will appear here') {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'base64-encoded.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  function downloadDecodeOutput() {
    const base64Input = document.getElementById('decode-input').value.trim();
    if (base64Input) {
      try {
        const buffer = base64ToArrayBuffer(base64Input);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded-binary.bin';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download:', err);
      }
    }
  }

  function init() {
    // Encode
    document.getElementById('encode-btn').addEventListener('click', encodeInput);
    document.getElementById('encode-clear-btn').addEventListener('click', clearEncode);
    document.getElementById('encode-copy-btn').addEventListener('click', copyEncodeToClipboard);
    document.getElementById('encode-download-btn').addEventListener('click', downloadEncodeOutput);

    document.getElementById('encode-text-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        encodeInput();
      }
    });

    document.getElementById('encode-file-input').addEventListener('change', () => {
      const file = document.getElementById('encode-file-input').files[0];
      const fileInfo = document.getElementById('encode-file-info');
      if (file) {
        fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fileInfo.classList.remove('d-none');
      } else {
        fileInfo.classList.add('d-none');
      }
    });

    // Decode
    document.getElementById('decode-btn').addEventListener('click', decodeInput);
    document.getElementById('decode-clear-btn').addEventListener('click', clearDecode);
    document.getElementById('decode-copy-btn').addEventListener('click', copyDecodeToClipboard);
    document.getElementById('decode-download-btn').addEventListener('click', downloadDecodeOutput);

    document.getElementById('decode-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        decodeInput();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();