/* =====================================================
   main.js
   ===================================================== */

const canvas   = document.getElementById('canvas');
const viewport = document.getElementById('viewport');
const hint     = document.getElementById('ui-hint');
const coordsEl = document.getElementById('ui-coords');

/* ── 타일 크기 설정 ───────────────────────────────
   이미지 원본: 4000 × 2500px
   SCALE 값을 높이면 더 크게 확대됨 (= 더 좁은 시야)
   SCALE 1.0 = 원본 크기, 1.5 = 1.5배 확대
─────────────────────────────────────────────────── */
const IMG_W = 4000;
const IMG_H = 2500;
const SCALE = 1.5;

const TILE_W = IMG_W * SCALE;   /* 타일 1장 너비 = 6000px */
const TILE_H = IMG_H * SCALE;   /* 타일 1장 높이 = 3750px */

/* 캔버스 = 타일 3×3 */
canvas.style.width  = TILE_W * 3 + 'px';
canvas.style.height = TILE_H * 3 + 'px';

/* 타일 크기 적용 */
document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* ── 시작 위치: 중앙 타일의 중심이 화면 중앙에 오도록 ── */
let x = -(TILE_W - window.innerWidth)  / 2 - TILE_W;
let y = -(TILE_H - window.innerHeight) / 2 - TILE_H;

let isDragging = false;
let startX = 0, startY = 0;
let velX = 0, velY = 0;
let prevX = 0, prevY = 0;
let rafId = null;
let hintHidden = false;

/* ── 캔버스 이동 적용 ─────────────────────────────  */
function applyTransform() {
  canvas.style.transform = `translate(${x}px, ${y}px)`;
  coordsEl.textContent =
    `${Math.round((((-x) % TILE_W) + TILE_W) % TILE_W)} / ` +
    `${Math.round((((-y) % TILE_H) + TILE_H) % TILE_H)}`;
}

/* ── 무한 루프: 타일 1장 크기 벗어나면 snap ─────────
   눈에 보이는 변화 없이 위치 초기화
─────────────────────────────────────────────────── */
function wrapPosition() {
  if (x > -TILE_W + window.innerWidth)  x -= TILE_W;
  if (x < -TILE_W * 2 + window.innerWidth) x += TILE_W;
  if (y > -TILE_H + window.innerHeight) y -= TILE_H;
  if (y < -TILE_H * 2 + window.innerHeight) y += TILE_H;
}

/* ── 드래그 시작 ──────────────────────────────────  */
function onDown(cx, cy) {
  isDragging = true;
  startX = cx - x;
  startY = cy - y;
  prevX = cx;
  prevY = cy;
  velX = velY = 0;
  document.body.classList.add('dragging');
  cancelAnimationFrame(rafId);
  if (!hintHidden) {
    hint.classList.add('hidden');
    hintHidden = true;
  }
}

/* ── 드래그 중 ────────────────────────────────────  */
function onMove(cx, cy) {
  if (!isDragging) return;
  velX = cx - prevX;
  velY = cy - prevY;
  prevX = cx;
  prevY = cy;
  x = cx - startX;
  y = cy - startY;
  wrapPosition();
  applyTransform();
}

/* ── 드래그 끝 ────────────────────────────────────  */
function onUp() {
  if (!isDragging) return;
  isDragging = false;
  document.body.classList.remove('dragging');
  inertia();
}

/* ── 관성 이동 ────────────────────────────────────
   0.91 = 감속 계수 (낮추면 빨리 멈춤, 높이면 오래 미끄러짐)
─────────────────────────────────────────────────── */
function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) return;
  velX *= 0.91;
  velY *= 0.91;
  x += velX;
  y += velY;
  wrapPosition();
  applyTransform();
  rafId = requestAnimationFrame(inertia);
}

/* ── 마우스 이벤트 ────────────────────────────────  */
document.addEventListener('mousedown',  e => onDown(e.clientX, e.clientY));
document.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY));
document.addEventListener('mouseup',    onUp);
document.addEventListener('mouseleave', onUp);

/* ── 터치 이벤트 (모바일) ─────────────────────────  */
document.addEventListener('touchstart', e => {
  onDown(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

document.addEventListener('touchmove', e => {
  e.preventDefault();
  onMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

document.addEventListener('touchend', onUp);

/* ── 초기 렌더링 ──────────────────────────────────  */
applyTransform();
