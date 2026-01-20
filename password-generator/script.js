(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
  const NUMBER_CHARS = "0123456789";
  const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const AMBIGUOUS_CHARS = "0OIl1";

  function getRandomChar(str) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return str[array[0] % str.length];
  }

  function shuffleString(str) {
    const array = str.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  }

  function generatePassword(length, options) {
    let chars = "";
    let password = "";
    let requiredChars = "";

    if (options.uppercase) {
      chars += UPPERCASE_CHARS;
      requiredChars += getRandomChar(UPPERCASE_CHARS);
    }
    if (options.lowercase) {
      chars += LOWERCASE_CHARS;
      requiredChars += getRandomChar(LOWERCASE_CHARS);
    }
    if (options.numbers) {
      chars += NUMBER_CHARS;
      requiredChars += getRandomChar(NUMBER_CHARS);
    }
    if (options.symbols) {
      chars += SYMBOL_CHARS;
      requiredChars += getRandomChar(SYMBOL_CHARS);
    }

    if (options.avoidAmbiguous) {
      chars = chars
        .split("")
        .filter((c) => !AMBIGUOUS_CHARS.includes(c))
        .join("");
    }

    if (!chars) {
      return "";
    }

    for (let i = requiredChars.length; i < length; i++) {
      password += getRandomChar(chars);
    }

    password += requiredChars;
    password = shuffleString(password);

    return password.substring(0, length);
  }

  function calculateEntropy(password) {
    const length = password.length;
    let charsetSize = 0;

    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;

    if (charsetSize === 0) return 0;

    const entropy = length * Math.log2(charsetSize);
    return Math.round(entropy);
  }

  function getStrengthLevel(entropy) {
    if (entropy < 40)
      return { level: 0, text: "Very Weak", color: "bg-danger" };
    if (entropy < 60) return { level: 25, text: "Weak", color: "bg-warning" };
    if (entropy < 80) return { level: 50, text: "Fair", color: "bg-info" };
    if (entropy < 100)
      return { level: 75, text: "Strong", color: "bg-primary" };
    return { level: 100, text: "Very Strong", color: "bg-success" };
  }

  function getOptions() {
    return {
      uppercase: document.getElementById("include-uppercase").checked,
      lowercase: document.getElementById("include-lowercase").checked,
      numbers: document.getElementById("include-numbers").checked,
      symbols: document.getElementById("include-symbols").checked,
      avoidAmbiguous: document.getElementById("avoid-ambiguous").checked,
    };
  }

  function generateAndDisplay() {
    const length = parseInt(
      document.getElementById("password-length").value,
      10,
    );
    const options = getOptions();
    const password = generatePassword(length, options);

    if (!password) {
      alert("Please select at least one character type");
      return;
    }

    document.getElementById("generated-password").value = password;

    const entropy = calculateEntropy(password);
    const strength = getStrengthLevel(entropy);

    const strengthBar = document.getElementById("strength-bar");
    strengthBar.style.width = strength.level + "%";
    strengthBar.className = "progress-bar " + strength.color;
    document.getElementById("strength-text").textContent =
      `${strength.text} (${entropy} bits of entropy)`;
  }

  async function copyToClipboard() {
    const password = document.getElementById("generated-password").value;
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      const copyBtn = document.getElementById("copy-btn");
      const originalTitle = copyBtn.getAttribute("title");
      copyBtn.setAttribute("title", "Copied!");
      setTimeout(() => copyBtn.setAttribute("title", originalTitle), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function updateLengthDisplay() {
    document.getElementById("length-display").textContent =
      document.getElementById("password-length").value;
  }

  function clearPassword() {
    document.getElementById("generated-password").value = "";
    document.getElementById("strength-bar").style.width = "0%";
    document.getElementById("strength-bar").className = "progress-bar";
    document.getElementById("strength-text").textContent =
      "Select options and generate a password";
  }

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.bsTheme = theme;
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
  }

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

  function init() {
    document
      .getElementById("password-length")
      .addEventListener("input", updateLengthDisplay);
    document
      .getElementById("generate-btn")
      .addEventListener("click", generateAndDisplay);
    document
      .getElementById("regenerate-btn")
      .addEventListener("click", generateAndDisplay);
    document
      .getElementById("copy-btn")
      .addEventListener("click", copyToClipboard);
    document
      .getElementById("clear-btn")
      .addEventListener("click", clearPassword);
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
