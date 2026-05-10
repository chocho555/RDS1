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
const TILE_W = IMG_W * SCALE;
const TILE_H = IMG_H * SCALE;

[layerBg, layerMid].forEach(layer => {
  layer.style.width  = TILE_W * 3 + 'px';
  layer.style.height = TILE_H * 3 + 'px';
});

document.querySelectorAll('.tile, .mid-tile').forEach((tile, i) => {
  const idx = i % 9;
  const col = idx % 3, row = Math.floor(idx / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* ── 패럴랙스 속도 ── */
const SPEED_BG  = 0.2;
const SPEED_MID = 0.6;

let x = 0, y = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function wrap(val, size) {
  return ((val % size) + size) % size - size;
}

function applyParallax() {
  layerBg.style.transform  = `translate(${wrap(x * SPEED_BG,  TILE_W)}px, ${wrap(y * SPEED_BG,  TILE_H)}px)`;
  layerMid.style.transform = `translate(${wrap(x * SPEED_MID, TILE_W)}px, ${wrap(y * SPEED_MID, TILE_H)}px)`;
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

/* =====================================================
   판 시스템
   - 1분마다 4개 중 랜덤 2개를 10초간 표시
   ===================================================== */
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
  setTimeout(() => {
    picked.forEach(p => p.style.display = 'none');
  }, 10000);
}

/* 1분마다 반복 */
setInterval(showPanels, 60000);
