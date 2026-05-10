const scene = document.getElementById('scene');
const hint  = document.getElementById('hint');

/* ── 직사각형 조각 정의 ──────────────────────────────────────
   x, y : 화면 기준 비율 위치 (0~1)
   w, h  : 화면 기준 비율 크기 (0~1)
   speed : 패럴랙스 속도 계수 (클수록 더 많이 움직임)
──────────────────────────────────────────────────────────── */
const RECTS = [
  { x:0.04, y:0.05, w:0.06, h:0.28, speed:0.80 },
  { x:0.11, y:0.08, w:0.12, h:0.38, speed:1.30 },
  { x:0.12, y:0.02, w:0.10, h:0.22, speed:1.00 },
  { x:0.24, y:0.18, w:0.08, h:0.20, speed:0.60 },
  { x:0.26, y:0.04, w:0.14, h:0.35, speed:1.50 },
  { x:0.36, y:0.10, w:0.08, h:0.18, speed:0.90 },
  { x:0.44, y:0.42, w:0.12, h:0.30, speed:1.20 },
  { x:0.44, y:0.46, w:0.07, h:0.22, speed:0.70 },
  { x:0.47, y:0.02, w:0.10, h:0.28, speed:1.60 },
  { x:0.50, y:0.06, w:0.05, h:0.14, speed:0.50 },
  { x:0.60, y:0.08, w:0.12, h:0.35, speed:1.10 },
  { x:0.62, y:0.03, w:0.05, h:0.18, speed:0.85 },
  { x:0.70, y:0.15, w:0.10, h:0.28, speed:1.40 },
  { x:0.72, y:0.02, w:0.07, h:0.16, speed:0.65 },
  { x:0.74, y:0.48, w:0.08, h:0.22, speed:1.00 },
  { x:0.78, y:0.42, w:0.05, h:0.14, speed:0.75 },
  { x:0.82, y:0.55, w:0.06, h:0.22, speed:1.30 },
  { x:0.86, y:0.10, w:0.08, h:0.25, speed:0.90 },
  { x:0.88, y:0.03, w:0.07, h:0.16, speed:1.50 },
  { x:0.02, y:0.40, w:0.06, h:0.14, speed:0.60 },
  { x:0.02, y:0.60, w:0.06, h:0.20, speed:1.10 },
  { x:0.03, y:0.82, w:0.08, h:0.10, speed:0.80 },
  { x:0.13, y:0.52, w:0.12, h:0.35, speed:1.20 },
  { x:0.26, y:0.55, w:0.08, h:0.22, speed:0.70 },
  { x:0.36, y:0.48, w:0.08, h:0.15, speed:1.40 },
  { x:0.58, y:0.55, w:0.14, h:0.38, speed:0.95 },
  { x:0.66, y:0.58, w:0.05, h:0.14, speed:1.10 },
  { x:0.90, y:0.72, w:0.08, h:0.20, speed:0.80 },
];

/* ── 조각 DOM 생성 ────────────────────────────────────────── */
function buildPieces() {
  const W = window.innerWidth;
  const H = window.innerHeight;

  RECTS.forEach(r => {
    const el = document.createElement('div');
    el.className = 'piece';

    const px = r.x * W;
    const py = r.y * H;
    const pw = r.w * W;
    const ph = r.h * H;

    el.style.left   = px + 'px';
    el.style.top    = py + 'px';
    el.style.width  = pw + 'px';
    el.style.height = ph + 'px';

    /* 배경 이미지를 전체 화면 기준으로 정렬 */
    el.style.backgroundSize     = W + 'px ' + H + 'px';
    el.style.backgroundPosition = `-${px}px -${py}px`;

    el.dataset.speed = r.speed;
    el.dataset.ox    = px;
    el.dataset.oy    = py;

    scene.appendChild(el);
  });
}

buildPieces();

const pieces = document.querySelectorAll('.piece');

/* ── 패럴랙스 적용 ───────────────────────────────────────── */
function applyOffset(ox, oy) {
  pieces.forEach(el => {
    const speed = parseFloat(el.dataset.speed);
    const origX = parseFloat(el.dataset.ox);
    const origY = parseFloat(el.dataset.oy);
    const dx = ox * speed;
    const dy = oy * speed;
    el.style.transform          = `translate(${dx}px, ${dy}px)`;
    el.style.backgroundPosition = `${-(origX - dx)}px ${-(origY - dy)}px`;
  });
}

/* ── 상태 ─────────────────────────────────────────────────── */
let offsetX = 0, offsetY = 0;
let velX = 0, velY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;
let rafId = null;
let hintHidden = false;

function hideHint() {
  if (!hintHidden) {
    hint.classList.add('hidden');
    hintHidden = true;
  }
}

/* ── 관성 루프 ───────────────────────────────────────────── */
function inertia() {
  if (Math.abs(velX) < 0.2 && Math.abs(velY) < 0.2) {
    velX = velY = 0;
    return;
  }
  velX *= 0.90;
  velY *= 0.90;
  offsetX += velX;
  offsetY += velY;
  applyOffset(offsetX, offsetY);
  rafId = requestAnimationFrame(inertia);
}

/* ── 마우스 이벤트 ───────────────────────────────────────── */
document.addEventListener('mousedown', e => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  velX = velY = 0;
  cancelAnimationFrame(rafId);
  document.body.classList.add('dragging');
  hideHint();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  velX = e.clientX - lastX;
  velY = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  offsetX += velX;
  offsetY += velY;
  applyOffset(offsetX, offsetY);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.classList.remove('dragging');
  rafId = requestAnimationFrame(inertia);
});

/* ── 터치 이벤트 ─────────────────────────────────────────── */
document.addEventListener('touchstart', e => {
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
  velX = velY = 0;
  cancelAnimationFrame(rafId);
  hideHint();
}, { passive: true });

document.addEventListener('touchmove', e => {
  e.preventDefault();
  const cx = e.touches[0].clientX;
  const cy = e.touches[0].clientY;
  velX = cx - lastX;
  velY = cy - lastY;
  lastX = cx;
  lastY = cy;
  offsetX += velX;
  offsetY += velY;
  applyOffset(offsetX, offsetY);
}, { passive: false });

document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
});

/* ── 리사이즈 대응 ───────────────────────────────────────── */
window.addEventListener('resize', () => {
  scene.innerHTML = '';
  buildPieces();
  applyOffset(offsetX, offsetY);
});
