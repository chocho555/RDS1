/* =====================================================
   main.js — 패럴랙스 2레이어 (배경 + 중경)
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

/* 배경 + 중경 레이어 크기 세팅 */
[layerBg, layerMid].forEach(layer => {
  layer.style.width  = TILE_W * 3 + 'px';
  layer.style.height = TILE_H * 3 + 'px';
});

/* 타일 위치/크기 세팅 */
document.querySelectorAll('.tile, .mid-tile').forEach((tile, i) => {
  const idx = i % 9;  /* 레이어당 9장 */
  const col = idx % 3, row = Math.floor(idx / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* ── 패럴랙스 속도 ──
   BG  : 0.2 → 느림 (멀리 있는 느낌)
   MID : 0.6 → 빠름 (앞에 있는 느낌)
   차이가 클수록 깊이감이 강해짐
*/
const SPEED_BG  = 0.2;
const SPEED_MID = 0.6;

/* ── 스크롤 상태 ── */
let x = 0, y = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function wrap(val, size) {
  if (val > 0)      return val - size;
  if (val < -size)  return val + size;
  return val;
}

function applyParallax() {
  const bgX  = wrap(x * SPEED_BG,  TILE_W);
  const bgY  = wrap(y * SPEED_BG,  TILE_H);
  const midX = wrap(x * SPEED_MID, TILE_W);
  const midY = wrap(y * SPEED_MID, TILE_H);

  layerBg.style.transform  = `translate(${bgX}px,  ${bgY}px)`;
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

/* ── 휠 스크롤 ── */
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

/* ── 터치 ── */
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
