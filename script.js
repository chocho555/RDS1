const leftPanel = document.querySelector('.left');
const rightPanel = document.querySelector('.right');

const gapWidth = 20;

let leftRatio = 0.5;
let targetRatio = 0.5;

let velocity = 0; // 🔥 속도 추가

function updatePanels() {
  const totalWidth = window.innerWidth;
  const usableWidth = totalWidth - gapWidth;

  // 🔥 스프링 물리 느낌
  const force = (targetRatio - leftRatio) * 0.08; // 당기는 힘
  velocity += force;
  velocity *= 0.75; // 감쇠 (쫀득함 핵심)

  leftRatio += velocity;

  // 범위 제한
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
