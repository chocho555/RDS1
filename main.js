/* =====================================================
   main.js
   ===================================================== */

const canvas   = document.getElementById('canvas');
const viewport = document.getElementById('viewport');
const hint     = document.getElementById('ui-hint');
const coordsEl = document.getElementById('ui-coords');

let isDragging = false;
let startX = 0, startY = 0;
let x = 0, y = 0;           /* 현재 캔버스 이동량 */
let velX = 0, velY = 0;     /* 관성용 속도 */
let prevX = 0, prevY = 0;
let rafId = null;
let hintHidden = false;

/* ── 타일 1장 크기 = 뷰포트 크기 ─────────────────── */
function tileW() { return viewport.offsetWidth; }
function tileH() { return viewport.offsetHeight; }

/* ── 캔버스에 이동 적용 + 좌표 갱신 ─────────────── */
function applyTransform() {
  canvas.style.transform = `translate(${x}px, ${y}px)`;
  coordsEl.textContent =
    `${Math.round((((-x) % tileW()) + tileW()) % tileW())} / ` +
    `${Math.round((((-y) % tileH()) + tileH()) % tileH())}`;
}

/* ── 무한 루프 핵심 ───────────────────────────────
   이동량이 타일 1장 크기를 벗어나면
   정확히 1장만큼 snap → 눈에 보이는 변화 없이 위치 초기화
─────────────────────────────────────────────────── */
function wrapPosition() {
  const tw = tileW();
  const th = tileH();
  if (x > 0)    x -= tw;
  if (x < -tw)  x += tw;
  if (y > 0)    y -= th;
  if (y < -th)  y += th;
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
   손을 뗀 뒤 속도가 0.3 이하가 될 때까지 계속 이동
   0.91 = 감속 계수 (낮출수록 빨리 멈춤, 높일수록 오래 미끄러짐)
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
