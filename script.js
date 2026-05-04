const stage = document.querySelector('.stage');
const leftPanel = document.querySelector('.left');
const rightPanel = document.querySelector('.right');
const gap = document.querySelector('.gap');

let gapX = window.innerWidth / 2; // 시작 위치 (가운데)
const gapWidth = 80;

let timer = null;

function updateLayout() {
  gap.style.left = `${gapX}px`;

  leftPanel.style.width = `${gapX}px`;

  rightPanel.style.width = `${window.innerWidth - (gapX + gapWidth)}px`;
}

// 초기 세팅
updateLayout();

// 호버 시간 → 위치 이동
stage.addEventListener('mouseenter', () => {
  timer = setInterval(() => {
    gapX += 5; // 👉 이동 속도 (조절 가능)
    
    // 화면 밖 안 나가게 제한
    const max = window.innerWidth - gapWidth;
    if (gapX > max) gapX = max;

    updateLayout();
  }, 60);
});

stage.addEventListener('mouseleave', () => {
  clearInterval(timer);
});
