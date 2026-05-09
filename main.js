/* =====================================================
   main.js
   ===================================================== */

const canvas   = document.getElementById('canvas');
const viewport = document.getElementById('viewport');
const hint     = document.getElementById('ui-hint');
const coordsEl = document.getElementById('ui-coords');

/* ── 타일 크기 설정 ───────────────────────────────
   SCALE 값을 높이면 더 확대됨 (= 더 좁은 시야)
─────────────────────────────────────────────────── */
const IMG_W = 4000;
const IMG_H = 2500;
const SCALE = 1.4;   /* ★ 확대 배율 조절 */

const TILE_W = IMG_W * SCALE;
const TILE_H = IMG_H * SCALE;

/* 캔버스 = 타일 3×3 */
canvas.style.width  = TILE_W * 3 + 'px';
canvas.style.height = TILE_H * 3 + 'px';

/* 타일 크기 + 위치 적용 */
document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* ── 시작 위치: 중앙 타일 중심이 화면 중앙에 오도록 ── */
let x = -(TILE_W - window.innerWidth)  / 2 - TILE_W;
let y = -(TILE_H - window.innerHeight) / 2 - TILE_H;

let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

/* ── 캔버스 이동 적용 ──────────────────────────── */
function applyTransform() {
  canvas.style.transform = `translate(${x}px, ${y}px)`;
  coordsEl.textContent =
    `${Math.round((((-x) % TILE_W) + TILE_W) % TILE_W)} / ` +
    `${Math.round((((-y) % TILE_H) + TILE_H) % TILE_H)}`;
}

/* ── 무한 루프: 타일 1장 크기 벗어나면 snap ────── */
function wrapPosition() {
  if (x > -TILE_W + window.innerWidth)      x -= TILE_W;
  if (x < -TILE_W * 2 + window.innerWidth)  x += TILE_W;
  if (y > -TILE_H + window.innerHeight)     y -= TILE_H;
  if (y < -TILE_H * 2 + window.innerHeight) y += TILE_H;
}

/* ── 관성 이동 ─────────────────────────────────
   0.92 = 감속 계수 (낮추면 빨리 멈춤, 높이면 오래 미끄러짐)
──────────────────────────────────────────────── */
function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) {
    velX = velY = 0;
    return;
  }
  velX *= 0.9.5;
  velY *= 0.9.5;
  x += velX;
  y += velY;
  wrapPosition();
  applyTransform();
  rafId = requestAnimationFrame(inertia);
}

function hideHint() {
  if (!hintHidden) {
    hint.classList.add('hidden');
    hintHidden = true;
  }
}

/* ── 휠 스크롤 (모든 방향) ──────────────────────
   trackpad: deltaX + deltaY 동시 지원 (2D 스크롤)
   마우스 휠: deltaY 만 있으므로 상하 이동
   SPEED 로 감도 조절
──────────────────────────────────────────────── */
const SPEED = 0.1.5;  /* ★ 스크롤 감도 (높이면 더 빠름) */

window.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(rafId);

  /* 단위 정규화 (line / page 모드 대응) */
  let dx = e.deltaX;
  let dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 20;  dy *= 20;  }
  if (e.deltaMode === 2) { dx *= 400; dy *= 400; }

  /* 속도 누적 */
  velX -= dx * SPEED;
  velY -= dy * SPEED;

  /* 속도 상한 (너무 빠르게 튀는 것 방지) */
  const MAX = 60;
  velX = Math.max(-MAX, Math.min(MAX, velX));
  velY = Math.max(-MAX, Math.min(MAX, velY));

  x += velX;
  y += velY;
  wrapPosition();
  applyTransform();
  hideHint();

  rafId = requestAnimationFrame(inertia);
}, { passive: false });

/* ── 터치 스크롤 (모바일) ───────────────────────  */
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
  const cx = e.touches[0].clientX;
  const cy = e.touches[0].clientY;
  velX = cx - touchPrevX;
  velY = cy - touchPrevY;
  touchPrevX = cx;
  touchPrevY = cy;
  x += velX;
  y += velY;
  wrapPosition();
  applyTransform();
}, { passive: false });

document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
});

/* ── 초기 렌더링 ──────────────────────────────── */
applyTransform();
