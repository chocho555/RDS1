const canvas  = document.getElementById('canvas');
const viewport = document.getElementById('viewport');
const hint    = document.getElementById('ui-hint');

const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;
const TILE_H = IMG_H * SCALE;

canvas.style.width  = TILE_W * 3 + 'px';
canvas.style.height = TILE_H * 3 + 'px';

document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

let x = -(TILE_W - window.innerWidth)  / 2 - TILE_W;
let y = -(TILE_H - window.innerHeight) / 2 - TILE_H;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function applyTransform() {
  canvas.style.transform = `translate(${x}px, ${y}px)`;
}

function wrap() {
  if (x > -TILE_W + window.innerWidth)      x -= TILE_W;
  if (x < -TILE_W * 2 + window.innerWidth)  x += TILE_W;
  if (y > -TILE_H + window.innerHeight)     y -= TILE_H;
  if (y < -TILE_H * 2 + window.innerHeight) y += TILE_H;
}

function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  x += velX; y += velY;
  wrap();
  applyTransform();
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
  velX -= dx * 1.2; velY -= dy * 1.2;
  const MAX = 60;
  velX = Math.max(-MAX, Math.min(MAX, velX));
  velY = Math.max(-MAX, Math.min(MAX, velY));
  x += velX; y += velY;
  wrap();
  applyTransform();
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
  velX = cx - touchPrevX; velY = cy - touchPrevY;
  touchPrevX = cx; touchPrevY = cy;
  x += velX; y += velY;
  wrap();
  applyTransform();
}, { passive: false });
document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
});

applyTransform();
