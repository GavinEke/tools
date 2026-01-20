(function () {
  const canvas = document.getElementById("whiteboard");
  const ctx = canvas.getContext("2d");
  const colorPicker = document.getElementById("color-picker");
  const penSizeSelect = document.getElementById("pen-size");
  const clearBtn = document.getElementById("clear-btn");
  const stickerToolbar = document.getElementById("sticker-toolbar");

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let selectedSticker = null;
  let stickers = [];
  let draggedSticker = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let currentTheme = "light";

  const STORAGE_KEY = "whiteboard-data";
  const THEME_KEY = "site-theme";

  const stickerIcons = {
    router: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m1-7v3h2l-3 3l-3-3h2v-3m-6 0h3v2l3-3l-3-3v2H5m6 0V8H9l3-3l3 3h-2v3m6 0h-3V9l-3 3l3 3v-2h3"/></svg>`,
    switch: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M13 18h1a1 1 0 0 1 1 1h7v2h-7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1H2v-2h7a1 1 0 0 1 1-1h1v-2H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3zm0-12h1V4h-1zM9 4v2h2V4zm0 4v2h2V8zm0 4v2h2v-2z"/></svg>`,
    "wireless-ap": `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M4.93 4.93A9.97 9.97 0 0 0 2 12c0 2.76 1.12 5.26 2.93 7.07l1.41-1.41A7.94 7.94 0 0 1 4 12c0-2.21.89-4.22 2.34-5.66zm14.14 0l-1.41 1.41A7.96 7.96 0 0 1 20 12c0 2.22-.89 4.22-2.34 5.66l1.41 1.41A9.97 9.97 0 0 0 22 12c0-2.76-1.12-5.26-2.93-7.07M7.76 7.76A5.98 5.98 0 0 0 6 12c0 1.65.67 3.15 1.76 4.24l1.41-1.41A4 4 0 0 1 8 12c0-1.11.45-2.11 1.17-2.83zm8.48 0l-1.41 1.41A4 4 0 0 1 16 12c0 1.11-.45 2.11-1.17 2.83l1.41 1.41A5.98 5.98 0 0 0 18 12c0-1.65-.67-3.15-1.76-4.24M12 10a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2"/></svg>`,
    firewall: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="m22.14 15.34l-.02.01c.23.28.43.59.58.92l.09.19c.71 1.69.21 3.64-1.1 4.86c-1.19 1.09-2.85 1.38-4.39 1.18c-1.46-.18-2.8-1.1-3.57-2.37c-.23-.39-.43-.83-.53-1.28c-.13-.35-.17-.73-.2-1.1c-.09-1.6.55-3.3 1.76-4.3c-.55 1.21-.42 2.72.39 3.77l.11.13c.14.12.31.15.47.09c.15-.06.27-.21.27-.37l-.07-.24c-.88-2.33-.14-5.03 1.73-6.56c.51-.42 1.14-.8 1.8-.97c-.68 1.36-.46 3.14.63 4.2c.46.5 1.02.79 1.49 1.23zM19.86 20l-.01-.03c.45-.39.7-1.06.68-1.66L20.5 18c-.2-1-1.07-1.34-1.63-2.07l-.43-.78c-.22.5-.24.97-.15 1.51c.1.57.32 1.06.21 1.65c-.16.65-.67 1.3-1.56 1.51c.5.49 1.31.88 2.12.6c.26-.07.59-.26.8-.42M3 16h8.06L11 17c0 1.41.36 2.73 1 3.88V21H3zm-1-6h6v5H2zm7 0h6v.07A8.03 8.03 0 0 0 11.25 15H9zM3 4h8v5H3zm9 0h9v5h-9z"/></svg>`,
    server: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M4 1h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m0 8h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1m0 8h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1M9 5h1V3H9zm0 8h1v-2H9zm0 8h1v-2H9zM5 3v2h2V3zm0 8v2h2v-2zm0 8v2h2v-2z"/></svg>`,
    computer: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v10H4m16 2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4c-1.11 0-2 .89-2 2v10a2 2 0 0 0 2 2H0v2h24v-2z"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/></svg>`,
  };

  // Load saved data from localStorage
  function loadSavedData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.imageData) {
          const img = new Image();
          img.onload = function () {
            ctx.drawImage(img, 0, 0);
          };
          img.src = data.imageData;
        }
        if (data.color) {
          colorPicker.value = data.color;
        }
        if (data.penSize) {
          penSizeSelect.value = data.penSize;
        }
        if (data.stickers) {
          stickers = data.stickers;
          renderStickers();
        }
      } catch (e) {
        console.warn("Failed to load saved whiteboard data:", e);
      }
    }
    if (!savedData || !JSON.parse(savedData).imageData) {
      ctx.fillStyle = currentTheme === "dark" ? "#1a1a1a" : "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Save current state to localStorage
  function saveCurrentState() {
    const data = {
      imageData: canvas.toDataURL(),
      color: colorPicker.value,
      penSize: penSizeSelect.value,
      stickers: stickers,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function setTheme(theme) {
    const oldTheme = currentTheme;
    currentTheme = theme;
    document.documentElement.dataset.bsTheme = theme;
    // Convert canvas background if changing theme
    if (oldTheme !== theme) {
      const bgColor = theme === "dark" ? [26, 26, 26] : [255, 255, 255];
      const oldBgColor = oldTheme === "dark" ? [26, 26, 26] : [255, 255, 255];
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (
          data[i] === oldBgColor[0] &&
          data[i + 1] === oldBgColor[1] &&
          data[i + 2] === oldBgColor[2]
        ) {
          data[i] = bgColor[0];
          data[i + 1] = bgColor[1];
          data[i + 2] = bgColor[2];
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
    localStorage.setItem(THEME_KEY, JSON.stringify({ theme }));
  }

  // Load saved data after canvas initialization
  loadSavedData();

  // Load theme
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

  // Render stickers from loaded data
  function renderStickers() {
    stickers.forEach((sticker) => {
      createStickerElement(sticker);
    });
  }

  function createStickerElement(sticker) {
    const stickerEl = document.createElement("div");
    stickerEl.className = "sticker";
    stickerEl.style.position = "absolute";
    stickerEl.style.left = `${sticker.x}px`;
    stickerEl.style.top = `${sticker.y}px`;
    stickerEl.style.cursor = "move";
    stickerEl.innerHTML = stickerIcons[sticker.type];
    stickerEl.addEventListener("mousedown", startDrag);
    stickerEl.addEventListener("dblclick", function () {
      const index = Array.from(document.querySelectorAll(".sticker")).indexOf(
        stickerEl,
      );
      if (index !== -1) {
        stickers.splice(index, 1);
        stickerEl.remove();
        saveCurrentState();
      }
    });
    document.querySelector(".border.rounded").appendChild(stickerEl);
  }

  // Set initial pen properties (may be overridden by saved data)
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = penSizeSelect.value;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  function startDrawing(e) {
    if (selectedSticker) {
      const [x, y] = getMousePos(e);
      placeSticker(x, y);
      return;
    }
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
  }

  function draw(e) {
    if (!isDrawing) return;
    const [x, y] = getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
  }

  function stopDrawing() {
    isDrawing = false;
    // Save the drawing state after finishing a stroke
    saveCurrentState();
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
      (e.clientX - rect.left) * (canvas.width / rect.width),
      (e.clientY - rect.top) * (canvas.height / rect.height),
    ];
  }

  function updatePenColor() {
    ctx.strokeStyle = colorPicker.value;
    saveCurrentState();
  }

  function updatePenSize() {
    ctx.lineWidth = penSizeSelect.value;
    saveCurrentState();
  }

  function clearCanvas() {
    ctx.fillStyle = currentTheme === "dark" ? "#1a1a1a" : "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stickers = [];
    document.querySelectorAll(".sticker").forEach((el) => el.remove());
    saveCurrentState();
  }

  function selectSticker(type) {
    selectedSticker = type;
    document
      .querySelectorAll(".sticker-btn")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");
  }

  function placeSticker(x, y) {
    if (!selectedSticker) return;
    const sticker = { type: selectedSticker, x: x - 32, y: y - 32 };
    stickers.push(sticker);
    createStickerElement(sticker);
    selectedSticker = null;
    document
      .querySelectorAll(".sticker-btn")
      .forEach((btn) => btn.classList.remove("active"));
    saveCurrentState();
  }

  function startDrag(e) {
    draggedSticker = e.target.closest(".sticker");
    const rect = draggedSticker.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  }

  function drag(e) {
    if (!draggedSticker) return;
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffsetX;
    const y = e.clientY - canvasRect.top - dragOffsetY;
    draggedSticker.style.left = `${x}px`;
    draggedSticker.style.top = `${y}px`;
  }

  function stopDrag() {
    if (draggedSticker) {
      const index = Array.from(document.querySelectorAll(".sticker")).indexOf(
        draggedSticker,
      );
      if (index !== -1) {
        stickers[index].x = parseFloat(draggedSticker.style.left);
        stickers[index].y = parseFloat(draggedSticker.style.top);
        saveCurrentState();
      }
    }
    draggedSticker = null;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  }

  // Event listeners
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  colorPicker.addEventListener("change", updatePenColor);
  penSizeSelect.addEventListener("change", updatePenSize);
  clearBtn.addEventListener("click", clearCanvas);

  stickerToolbar.addEventListener("click", function (e) {
    if (e.target.closest(".sticker-btn")) {
      const type = e.target.closest(".sticker-btn").dataset.sticker;
      selectSticker(type);
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });
})();
