const leftPanel = document.querySelector('.left');
const rightPanel = document.querySelector('.right');

const gapWidth = 20;

let leftRatio = 0.5;
let targetRatio = 0.5;

function updatePanels() {
  const totalWidth = window.innerWidth;
  const usableWidth = totalWidth - gapWidth;

  leftRatio += (targetRatio - leftRatio) * 0.008;

  const leftWidth = usableWidth * leftRatio;
  const rightWidth = usableWidth - leftWidth;

  leftPanel.style.width = `${leftWidth}px`;
  rightPanel.style.width = `${rightWidth}px`;

  requestAnimationFrame(updatePanels);
}

leftPanel.addEventListener('mouseenter', () => {
  targetRatio = 0.995;
});

rightPanel.addEventListener('mouseenter', () => {
  targetRatio = 0.005;
});

window.addEventListener('resize', updatePanels);

updatePanels();
