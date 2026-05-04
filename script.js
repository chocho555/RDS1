const leftPanel = document.querySelector('.left');
const rightPanel = document.querySelector('.right');

const gapWidth = 20;

let leftRatio = 0.5;
let targetRatio = 0.5;
let velocity = 0;

function updatePanels() {
  const totalWidth = window.innerWidth;
  const usableWidth = totalWidth - gapWidth;

  // 아주 느리고 묵직한 쫀득 모션
  const force = (targetRatio - leftRatio) * 0.015;
  velocity += force;
  velocity *= 0.88;

  leftRatio += velocity;

  leftRatio = Math.max(0.001, Math.min(0.999, leftRatio));

  const leftWidth = usableWidth * leftRatio;
  const rightWidth = usableWidth - leftWidth;

  leftPanel.style.width = `${leftWidth}px`;
  rightPanel.style.left = `${leftWidth + gapWidth}px`;
  rightPanel.style.width = `${rightWidth}px`;

  requestAnimationFrame(updatePanels);
}

leftPanel.addEventListener('mouseenter', () => {
  targetRatio = 0.995;
});

rightPanel.addEventListener('mouseenter', () => {
  targetRatio = 0.005;
});

updatePanels();

// 얼마나 줄어들지 (0.92 = 위아래 8% 보임)
const minScale = 0.92;

// 가운데일수록 덜 줄고, 끝으로 갈수록 더 줄어듦
const centerDist = Math.abs(leftRatio - 0.5) * 2; // 0~1
const scaleY = 1 - (1 - minScale) * centerDist;

// 적용
leftPanel.style.transform = `scaleY(${scaleY})`;
rightPanel.style.transform = `scaleY(${scaleY})`;
