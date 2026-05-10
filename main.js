/* =====================================================
   main.js
   ===================================================== */

const layerBg  = document.getElementById('layer-bg');
const layerMid = document.getElementById('layer-mid');
const hint     = document.getElementById('ui-hint');

/* ── 타일 크기 ── */
const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;  /* 4800px */
const TILE_H = IMG_H * SCALE;  /* 3000px */

/* 배경 타일 세팅 */
layerBg.style.width  = TILE_W * 3 + 'px';
layerBg.style.height = TILE_H * 3 + 'px';
document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* 중경 레이어 크기 = 타일 1장 */
layerMid.style.width  = TILE_W + 'px';
layerMid.style.height = TILE_H + 'px';

/* ── 패럴랙스 속도 ── */
const SPEED_BG  = 0.2;
const SPEED_MID = 0.6;

let x = 0, y = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

/*
  무한 루프: modulo로 타일 1장 범위 안에서 순환
  배경(3×3 타일)과 중경(1장, 반복) 모두 같은 방식으로 wrap
*/
function wrap(val, size) {
  return ((val % size) + size) % size - size;
}

function applyParallax() {
  /* 배경: 3×3 타일 무한 루프 */
  const bgX = wrap(x * SPEED_BG,  TILE_W);
  const bgY = wrap(y * SPEED_BG,  TILE_H);
  layerBg.style.transform = `translate(${bgX}px, ${bgY}px)`;

  /*
    중경: 조각들이 배치된 레이어
    패럴랙스 속도로 움직이되, 타일 크기만큼 wrap해서 무한 반복
  */
  const midX = wrap(x * SPEED_MID, TILE_W);
  const midY = wrap(y * SPEED_MID, TILE_H);
  layerMid.style.transform = `translate(${midX}px, ${midY}px)`;
}

function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  x += velX; y += velY;
  applyParallax();
  rafId = requestAnimationFrame(inertia);
}

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

window.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(rafId);
  let dx = e.deltaX, dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 20;  dy *= 20;  }
  if (e.deltaMode === 2) { dx *= 400; dy *= 400; }
  velX -= dx * 0.1; velY -= dy * 0.1;
  const MAX = 10;
  velX = Math.max(-MAX, Math.min(MAX, velX));
  velY = Math.max(-MAX, Math.min(MAX, velY));
  x += velX; y += velY;
  applyParallax();
  hideHint();
  rafId = requestAnimationFrame(inertia);
}, { passive: false });

let touchPrevX = 0, touchPrevY = 0;
document.addEventListener('touchstart', e => {
  touchPrevX = e.touches[0].clientX;
  touchPrevY = e.touches[0].clientY;
  velX = velY = 0;
  cancelAnimationFrame(rafId);
  hideHint();
}, { passive: true });
document.addEventListener('touchmove', e => {
  e.preventDefault();
  const cx = e.touches[0].clientX, cy = e.touches[0].clientY;
  velX = (cx - touchPrevX) * 0.1;
  velY = (cy - touchPrevY) * 0.1;
  touchPrevX = cx; touchPrevY = cy;
  x += velX; y += velY;
  applyParallax();
}, { passive: false });
document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
});

applyParallax();

/* ── 조각 클릭 팝업 ── */
const popup      = document.getElementById('popup');
const popupClose = document.getElementById('popup-close');
const popupTitle = document.getElementById('popup-title');
const popupDesc  = document.getElementById('popup-desc');

document.querySelectorAll('.piece').forEach(el => {
  el.addEventListener('click', e => {
    popupTitle.textContent = el.dataset.title;
    popupDesc.textContent  = el.dataset.desc;
    const rect = el.getBoundingClientRect();
    let left = rect.right + 12, top = rect.top;
    if (left + 280 > window.innerWidth)  left = rect.left - 272;
    if (top  + 140 > window.innerHeight) top  = window.innerHeight - 150;
    if (left < 0) left = 8;
    popup.style.left    = left + 'px';
    popup.style.top     = top  + 'px';
    popup.style.display = 'block';
    e.stopPropagation();
  });
});

popupClose.addEventListener('click', () => { popup.style.display = 'none'; });
document.addEventListener('click', e => {
  if (!e.target.closest('#popup') && !e.target.closest('.piece'))
    popup.style.display = 'none';
});

/* ── 판 시스템 ── */
const panels = [
  document.getElementById('panel-a'),
  document.getElementById('panel-b'),
  document.getElementById('panel-c'),
  document.getElementById('panel-d'),
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showPanels() {
  panels.forEach(p => p.style.display = 'none');
  const picked = shuffle(panels).slice(0, 2);
  picked.forEach(p => p.style.display = 'block');
  setTimeout(() => { picked.forEach(p => p.style.display = 'none'); }, 10000);
}

setInterval(showPanels, 60000);
