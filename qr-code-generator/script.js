(() => {
  let currentTheme = "light";
  const THEME_KEY = "site-theme";
  let currentQRDataURL = null;

  function getOptions() {
    const size = parseInt(document.getElementById("qr-size").value, 10);
    const errorLevel = document.querySelector(
      'input[name="error-level"]:checked',
    ).value;

    return {
      width: size,
      height: size,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: errorLevel,
    };
  }

  function generateQRCode(shouldScroll = false) {
    const text = document.getElementById("qr-text").value.trim();
    if (!text) {
      alert("Please enter some text to generate a QR code");
      return;
    }

    const qrCanvas = document.getElementById("qr-canvas");
    qrCanvas.innerHTML = ""; // Clear previous QR code

    const canvas = document.createElement("canvas");
    canvas.id = "qr-code-canvas";
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    qrCanvas.appendChild(canvas);

    const options = getOptions();

    QRCode.toCanvas(canvas, text, options, (error, canvas) => {
      if (error) {
        console.error(error);
        alert("Failed to generate QR code. Please try again.");
        return;
      }

      currentQRDataURL = canvas.toDataURL("image/png");
      document.getElementById("qr-result").style.display = "block";

      if (shouldScroll) {
        document
          .getElementById("qr-result")
          .scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function downloadQRCode() {
    if (!currentQRDataURL) return;

    const format = document.getElementById("qr-format").value;
    const link = document.createElement("a");

    if (format === "png") {
      link.download = "qr-code.png";
      link.href = currentQRDataURL;
    } else {
      // Convert PNG to other formats using a temporary canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        link.download = `qr-code.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      };
      img.src = currentQRDataURL;
      return;
    }

    link.click();
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
      .getElementById("generate-btn")
      .addEventListener("click", () => generateQRCode(true));
    document
      .getElementById("regenerate-btn")
      .addEventListener("click", () => generateQRCode(true));
    document
      .getElementById("download-btn")
      .addEventListener("click", downloadQRCode);

    // Auto-generate on page load with default text (no scrolling)
    setTimeout(() => {
      if (document.getElementById("qr-text").value.trim()) {
        generateQRCode(false);
      }
    }, 200);
  }

  document.addEventListener("DOMContentLoaded", init);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
