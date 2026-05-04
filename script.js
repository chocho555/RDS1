const leftPanel = document.querySelector('.left');
const rightPanel = document.querySelector('.right');

const gapWidth = 80; // 이미지가 보이는 틈 크기
let leftRatio = 0.18; // 처음 왼쪽 판넬 비율
let targetRatio = 0.18;

function updatePanels() {
  const totalWidth = window.innerWidth;
  const usableWidth = totalWidth - gapWidth;

  // 부드럽게 따라가는 모션
  leftRatio += (targetRatio - leftRatio) * 0.06;

  const leftWidth = usableWidth * leftRatio;
  const rightWidth = usableWidth - leftWidth;

  leftPanel.style.width = `${leftWidth}px`;
  rightPanel.style.width = `${rightWidth}px`;

  requestAnimationFrame(updatePanels);
}

leftPanel.addEventListener('mouseenter', () => {
  targetRatio = 0.75; 
});

rightPanel.addEventListener('mouseenter', () => {
  targetRatio = 0.15;
});

window.addEventListener('resize', updatePanels);

updatePanels();
