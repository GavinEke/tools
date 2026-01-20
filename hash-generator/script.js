(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const MD5_ROUNDS = [
    [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22],
    [5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20],
    [4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23],
    [6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21],
  ];

  const MD5_K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  function md5_f(x, y, z) {
    return (x & y) | (~x & z);
  }
  function md5_g(x, y, z) {
    return (x & z) | (y & ~z);
  }
  function md5_h(x, y, z) {
    return x ^ y ^ z;
  }
  function md5_i(x, y, z) {
    return y ^ (x | ~z);
  }

  function leftRotate(x, n) {
    return (x << n) | (x >>> (32 - n));
  }

  function md5Round(a, b, c, d, x, s, t, func) {
    return leftRotate((func(b, c, d) + a + x + t) | 0, s) + b;
  }

  function md5ProcessBlock(block, state) {
    let a = state[0],
      b = state[1],
      c = state[2],
      d = state[3];

    a = md5Round(a, b, c, d, block[0], 7, MD5_K[0], md5_f);
    d = md5Round(d, a, b, c, block[1], 12, MD5_K[1], md5_f);
    c = md5Round(c, d, a, b, block[2], 17, MD5_K[2], md5_f);
    b = md5Round(b, c, d, a, block[3], 22, MD5_K[3], md5_f);
    a = md5Round(a, b, c, d, block[4], 7, MD5_K[4], md5_f);
    d = md5Round(d, a, b, c, block[5], 12, MD5_K[5], md5_f);
    c = md5Round(c, d, a, b, block[6], 17, MD5_K[6], md5_f);
    b = md5Round(b, c, d, a, block[7], 22, MD5_K[7], md5_f);
    a = md5Round(a, b, c, d, block[8], 7, MD5_K[8], md5_f);
    d = md5Round(d, a, b, c, block[9], 12, MD5_K[9], md5_f);
    c = md5Round(c, d, a, b, block[10], 17, MD5_K[10], md5_f);
    b = md5Round(b, c, d, a, block[11], 22, MD5_K[11], md5_f);
    a = md5Round(a, b, c, d, block[12], 7, MD5_K[12], md5_f);
    d = md5Round(d, a, b, c, block[13], 12, MD5_K[13], md5_f);
    c = md5Round(c, d, a, b, block[14], 17, MD5_K[14], md5_f);
    b = md5Round(b, c, d, a, block[15], 22, MD5_K[15], md5_f);

    a = md5Round(a, b, c, d, block[1], 5, MD5_K[16], md5_g);
    d = md5Round(d, a, b, c, block[6], 9, MD5_K[17], md5_g);
    c = md5Round(c, d, a, b, block[11], 14, MD5_K[18], md5_g);
    b = md5Round(b, c, d, a, block[0], 20, MD5_K[19], md5_g);
    a = md5Round(a, b, c, d, block[5], 5, MD5_K[20], md5_g);
    d = md5Round(d, a, b, c, block[10], 9, MD5_K[21], md5_g);
    c = md5Round(c, d, a, b, block[15], 14, MD5_K[22], md5_g);
    b = md5Round(b, c, d, a, block[4], 20, MD5_K[23], md5_g);
    a = md5Round(a, b, c, d, block[9], 5, MD5_K[24], md5_g);
    d = md5Round(d, a, b, c, block[14], 9, MD5_K[25], md5_g);
    c = md5Round(c, d, a, b, block[3], 14, MD5_K[26], md5_g);
    b = md5Round(b, c, d, a, block[8], 20, MD5_K[27], md5_g);
    a = md5Round(a, b, c, d, block[13], 5, MD5_K[28], md5_g);
    d = md5Round(d, a, b, c, block[2], 9, MD5_K[29], md5_g);
    c = md5Round(c, d, a, b, block[7], 14, MD5_K[30], md5_g);
    b = md5Round(b, c, d, a, block[12], 20, MD5_K[31], md5_g);

    a = md5Round(a, b, c, d, block[5], 4, MD5_K[32], md5_h);
    d = md5Round(d, a, b, c, block[8], 11, MD5_K[33], md5_h);
    c = md5Round(c, d, a, b, block[11], 16, MD5_K[34], md5_h);
    b = md5Round(b, c, d, a, block[14], 23, MD5_K[35], md5_h);
    a = md5Round(a, b, c, d, block[1], 4, MD5_K[36], md5_h);
    d = md5Round(d, a, b, c, block[4], 11, MD5_K[37], md5_h);
    c = md5Round(c, d, a, b, block[7], 16, MD5_K[38], md5_h);
    b = md5Round(b, c, d, a, block[10], 23, MD5_K[39], md5_h);
    a = md5Round(a, b, c, d, block[13], 4, MD5_K[40], md5_h);
    d = md5Round(d, a, b, c, block[0], 11, MD5_K[41], md5_h);
    c = md5Round(c, d, a, b, block[3], 16, MD5_K[42], md5_h);
    b = md5Round(b, c, d, a, block[6], 23, MD5_K[43], md5_h);
    a = md5Round(a, b, c, d, block[9], 4, MD5_K[44], md5_h);
    d = md5Round(d, a, b, c, block[12], 11, MD5_K[45], md5_h);
    c = md5Round(c, d, a, b, block[15], 16, MD5_K[46], md5_h);
    b = md5Round(b, c, d, a, block[2], 23, MD5_K[47], md5_h);

    a = md5Round(a, b, c, d, block[0], 6, MD5_K[48], md5_i);
    d = md5Round(d, a, b, c, block[7], 10, MD5_K[49], md5_i);
    c = md5Round(c, d, a, b, block[14], 15, MD5_K[50], md5_i);
    b = md5Round(b, c, d, a, block[5], 21, MD5_K[51], md5_i);
    a = md5Round(a, b, c, d, block[12], 6, MD5_K[52], md5_i);
    d = md5Round(d, a, b, c, block[3], 10, MD5_K[53], md5_i);
    c = md5Round(c, d, a, b, block[10], 15, MD5_K[54], md5_i);
    b = md5Round(b, c, d, a, block[1], 21, MD5_K[55], md5_i);
    a = md5Round(a, b, c, d, block[8], 6, MD5_K[56], md5_i);
    d = md5Round(d, a, b, c, block[15], 10, MD5_K[57], md5_i);
    c = md5Round(c, d, a, b, block[6], 15, MD5_K[58], md5_i);
    b = md5Round(b, c, d, a, block[13], 21, MD5_K[59], md5_i);
    a = md5Round(a, b, c, d, block[4], 6, MD5_K[60], md5_i);
    d = md5Round(d, a, b, c, block[11], 10, MD5_K[61], md5_i);
    c = md5Round(c, d, a, b, block[2], 15, MD5_K[62], md5_i);
    b = md5Round(b, c, d, a, block[9], 21, MD5_K[63], md5_i);

    state[0] = (state[0] + a) | 0;
    state[1] = (state[1] + b) | 0;
    state[2] = (state[2] + c) | 0;
    state[3] = (state[3] + d) | 0;
  }

  function toLE32(num) {
    return [
      num & 0xff,
      (num >> 8) & 0xff,
      (num >> 16) & 0xff,
      (num >> 24) & 0xff,
    ];
  }

  function fromLE32(bytes) {
    return (
      (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
    );
  }

  function toHex(bytes) {
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function md5(input) {
    const isString = typeof input === "string";
    const data = isString
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
    const bitLength = data.length * 8;

    let padded = [...data];
    padded.push(0x80);

    while (padded.length % 64 !== 56) {
      padded.push(0);
    }

    const lengthBytes = toLE32(bitLength);
    padded.push(...lengthBytes);
    padded.push(...toLE32(bitLength >>> 32));

    let state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

    for (let i = 0; i < padded.length; i += 64) {
      const block = [];
      for (let j = 0; j < 16; j++) {
        const idx = i + j * 4;
        block.push(
          fromLE32([
            padded[idx],
            padded[idx + 1],
            padded[idx + 2],
            padded[idx + 3],
          ]),
        );
      }
      md5ProcessBlock(block, state);
    }

    const result = [
      ...toLE32(state[0]),
      ...toLE32(state[1]),
      ...toLE32(state[2]),
      ...toLE32(state[3]),
    ];

    return toHex(result);
  }

  async function sha256(input) {
    const isString = typeof input === "string";
    const data = isString
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function sha384(input) {
    const isString = typeof input === "string";
    const data = isString
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
    const hashBuffer = await crypto.subtle.digest("SHA-384", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function sha512(input) {
    const isString = typeof input === "string";
    const data = isString
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function sha1(input) {
    const isString = typeof input === "string";
    const data = isString
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function generateHashes(input) {
    const [md5Result, sha1Result, sha256Result, sha384Result, sha512Result] =
      await Promise.all([
        Promise.resolve(md5(input)),
        sha1(input),
        sha256(input),
        sha384(input),
        sha512(input),
      ]);

    return [
      { name: "MD5", hash: md5Result, length: 128 },
      { name: "SHA-1", hash: sha1Result, length: 160 },
      { name: "SHA-256", hash: sha256Result, length: 256 },
      { name: "SHA-384", hash: sha384Result, length: 384 },
      { name: "SHA-512", hash: sha512Result, length: 512 },
    ];
  }

  function createHashOutput(hash) {
    return `
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-medium mb-0">${hash.name}</label>
          <span class="badge bg-light text-body-secondary">${hash.length}-bit</span>
        </div>
        <div class="input-group">
          <input type="text" class="form-control font-monospace" value="${hash.hash}" readonly id="hash-${hash.name.toLowerCase().replace("-", "-")}">
          <button type="button" class="btn btn-outline-secondary copy-hash-btn" data-target="hash-${hash.name.toLowerCase().replace("-", "-")}" title="Copy to clipboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  async function displayResults(input) {
    const hashes = await generateHashes(input);
    const container = document.getElementById("hash-outputs");
    container.innerHTML = hashes.map(createHashOutput).join("");
    document.getElementById("hash-results").classList.remove("d-none");
  }

  async function generateHashesHandler() {
    const textInput = document.getElementById("hash-input").value;
    const fileInput = document.getElementById("file-input").files[0];
    const activeTab = document.querySelector("#input-tabs .nav-link.active").id;

    if (activeTab === "text-tab" && textInput) {
      await displayResults(textInput);
    } else if (activeTab === "file-tab" && fileInput) {
      const arrayBuffer = await fileInput.arrayBuffer();
      await displayResults(arrayBuffer);
    } else {
      document.getElementById("hash-results").classList.add("d-none");
    }
  }

  function clearInput() {
    document.getElementById("hash-input").value = "";
    document.getElementById("file-input").value = "";
    document.getElementById("file-info").classList.add("d-none");
    document.getElementById("hash-results").classList.add("d-none");
  }

  async function copyToClipboard(targetId) {
    const input = document.getElementById(targetId);
    try {
      await navigator.clipboard.writeText(input.value);
      const btn = input.nextElementSibling;
      const originalTitle = btn.getAttribute("title");
      btn.setAttribute("title", "Copied!");
      setTimeout(() => btn.setAttribute("title", originalTitle), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.bsTheme = theme;
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
  }

  function init() {
    const themeData = localStorage.getItem(THEME_KEY);
    if (themeData) {
      try {
        const data = JSON.parse(themeData);
        if (data.theme) currentTheme = data.theme;
      } catch (e) {
        console.warn("Failed to load theme:", e);
      }
    }
    setTheme(currentTheme);

    document
      .getElementById("generate-btn")
      .addEventListener("click", generateHashesHandler);
    document.getElementById("clear-btn").addEventListener("click", clearInput);

    document.getElementById("hash-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        generateHashesHandler();
      }
    });

    document.getElementById("file-input").addEventListener("change", () => {
      const file = document.getElementById("file-input").files[0];
      const fileInfo = document.getElementById("file-info");
      if (file) {
        fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fileInfo.classList.remove("d-none");
      } else {
        fileInfo.classList.add("d-none");
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest(".copy-hash-btn")) {
        const btn = e.target.closest(".copy-hash-btn");
        copyToClipboard(btn.dataset.target);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
