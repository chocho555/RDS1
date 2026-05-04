const panels = document.querySelectorAll('.panel');
const stage = document.querySelector('.stage');

let activePanel = null;
let startX = 0;
let startY = 0;
let startLeft = 0;
let startTop = 0;

panels.forEach(panel => {
  panel.addEventListener('mousedown', e => {
    activePanel = panel;

    startX = e.clientX;
    startY = e.clientY;

    startLeft = panel.offsetLeft;
    startTop = panel.offsetTop;

    e.preventDefault();
  });
});

document.addEventListener('mousemove', e => {
  if (!activePanel) return;

  const stageRect = stage.getBoundingClientRect();

  if (activePanel.classList.contains('vertical')) {
    const dx = e.clientX - startX;
    let newLeft = startLeft + dx;

    newLeft = Math.max(0, Math.min(newLeft, stageRect.width - activePanel.offsetWidth));
    activePanel.style.left = `${newLeft}px`;
  }

  if (activePanel.classList.contains('horizontal')) {
    const dy = e.clientY - startY;
    let newTop = startTop + dy;

    newTop = Math.max(0, Math.min(newTop, stageRect.height - activePanel.offsetHeight));
    activePanel.style.top = `${newTop}px`;
  }
});

document.addEventListener('mouseup', () => {
  activePanel = null;
});
