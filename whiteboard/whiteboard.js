(function () {
  const canvas = document.getElementById('whiteboard');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('color-picker');
  const penSizeSelect = document.getElementById('pen-size');
  const clearBtn = document.getElementById('clear-btn');

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  const STORAGE_KEY = 'whiteboard-data';

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
      } catch (e) {
        console.warn('Failed to load saved whiteboard data:', e);
      }
    }
  }

  // Save current state to localStorage
  function saveCurrentState() {
    const data = {
      imageData: canvas.toDataURL(),
      color: colorPicker.value,
      penSize: penSizeSelect.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Set initial canvas background to white
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load saved data after canvas initialization
  loadSavedData();

  // Set initial pen properties (may be overridden by saved data)
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = penSizeSelect.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function startDrawing(e) {
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
      (e.clientY - rect.top) * (canvas.height / rect.height)
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCurrentState();
  }

  // Event listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  colorPicker.addEventListener('change', updatePenColor);
  penSizeSelect.addEventListener('change', updatePenSize);
  clearBtn.addEventListener('click', clearCanvas);
})();