(function() {
  const canvas = document.getElementById('whiteboard');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('color-picker');
  const penSizeSelect = document.getElementById('pen-size');
  const clearBtn = document.getElementById('clear-btn');

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Set initial canvas background to white
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set initial pen properties
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
  }

  function updatePenSize() {
    ctx.lineWidth = penSizeSelect.value;
  }

  function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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