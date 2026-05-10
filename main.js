/* ═══════════════════════════════════════════════════════════════
   설정
═══════════════════════════════════════════════════════════════ */

const BG_IMAGE   = 'images/bg/사문디_배경.jpg';
const IMG_W      = 4000;
const IMG_H      = 2500;

const SHARD_DEFS = [
  { x:0.00, y:0.00, w:0.06, h:0.30, speed: 0.6  },
  { x:0.10, y:0.00, w:0.05, h:0.22, speed: 1.4  },
  { x:0.10, y:0.05, w:0.12, h:0.42, speed: 1.0  },
  { x:0.23, y:0.16, w:0.08, h:0.22, speed: 0.5  },
  { x:0.26, y:0.02, w:0.14, h:0.36, speed: 1.6  },
  { x:0.36, y:0.02, w:0.08, h:0.14, speed: 0.9  },
  { x:0.36, y:0.20, w:0.08, h:0.20, speed: 1.2  },
  { x:0.44, y:0.42, w:0.07, h:0.24, speed: 0.7  },
  { x:0.45, y:0.40, w:0.12, h:0.34, speed: 1.3  },
  { x:0.47, y:0.00, w:0.10, h:0.30, speed: 1.7  },
  { x:0.50, y:0.04, w:0.05, h:0.16, speed: 0.4  },
  { x:0.58, y:0.00, w:0.05, h:0.20, speed: 1.1  },
  { x:0.60, y:0.05, w:0.12, h:0.36, speed: 0.8  },
  { x:0.70, y:0.00, w:0.07, h:0.18, speed: 0.6  },
  { x:0.70, y:0.12, w:0.10, h:0.30, speed: 1.5  },
  { x:0.74, y:0.34, w:0.06, h:0.16, speed: 1.0  },
  { x:0.76, y:0.40, w:0.08, h:0.24, speed: 0.75 },
  { x:0.80, y:0.50, w:0.06, h:0.24, speed: 1.2  },
  { x:0.84, y:0.06, w:0.08, h:0.26, speed: 0.9  },
  { x:0.87, y:0.00, w:0.07, h:0.17, speed: 1.6  },
  { x:0.00, y:0.36, w:0.06, h:0.15, speed: 0.55 },
  { x:0.00, y:0.56, w:0.06, h:0.22, speed: 1.1  },
  { x:0.02, y:0.80, w:0.08, h:0.20, speed: 0.8  },
  { x:0.12, y:0.50, w:0.12, h:0.36, speed: 1.25 },
  { x:0.26, y:0.52, w:0.08, h:0.24, speed: 0.65 },
  { x:0.36, y:0.46, w:0.08, h:0.16, speed: 1.45 },
  { x:0.56, y:0.52, w:0.14, h:0.40, speed: 0.95 },
  { x:0.66, y:0.55, w:0.05, h:0.15, speed: 1.1  },
  { x:0.88, y:0.70, w:0.10, h:0.30, speed: 0.8  },
];

/* ═══════════════════════════════════════════════════════════════
   화면에 이미지를 cover로 맞출 때의 실제 렌더 크기 계산
   → 조각들의 backgroundSize / backgroundPosition 기준
═══════════════════════════════════════════════════════════════ */

function getCoverSize(vw, vh) {
  const imgRatio    = IMG_W / IMG_H;
  const screenRatio = vw / vh;
  let renderW, renderH;
  if (screenRatio > imgRatio) {
    renderW = vw;
    renderH = vw / imgRatio;
  } else {
    renderH = vh;
    renderW = vh * imgRatio;
  }
  const offsetX = (vw - renderW) / 2;
  const offsetY = (vh - renderH) / 2;
  return { renderW, renderH, offsetX, offsetY };
}

/* ═══════════════════════════════════════════════════════════════
   조각 생성
═══════════════════════════════════════════════════════════════ */

const shardsEl    = document.getElementById('shards');
const scrollLayer = document.getElementById('scroll-layer');
const hint        = document.getElementById('ui-hint');

let shards = [];

function buildShards() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { renderW, renderH, offsetX, offsetY } = getCoverSize(vw, vh);

  shardsEl.innerHTML = '';
  shards = [];

  SHARD_DEFS.forEach(def => {
    const el = document.createElement('div');
    el.className = 'shard';

    /* 조각 위치/크기: 화면 기준 비율 */
    const px = def.x * vw;
    const py = def.y * vh;
    const pw = def.w * vw;
    const ph = def.h * vh;

    el.style.left   = px + 'px';
    el.style.top    = py + 'px';
    el.style.width  = pw + 'px';
    el.style.height = ph + 'px';

    /* backgroundSize: cover 기준 렌더 크기 */
    el.style.backgroundImage    = `url('${BG_IMAGE}')`;
    el.style.backgroundSize     = `${renderW}px ${renderH}px`;
    /* backgroundPosition: cover 오프셋 + 조각 위치 보정 */
    el.style.backgroundPosition = `${offsetX - px}px ${offsetY - py}px`;

    shardsEl.appendChild(el);
    shards.push({ el, px, py, speed: def.speed, offsetX, offsetY, renderW, renderH });
  });
}

buildShards();

/* ═══════════════════════════════════════════════════════════════
   드래그 → 조각 쪼개짐
═══════════════════════════════════════════════════════════════ */

let isDragging  = false;
let dragStartX  = 0;
let dragStartY  = 0;
let currentOffX = 0;
let currentOffY = 0;
let returnRaf   = null;

function applyShards(ox, oy) {
  shards.forEach(s => {
    const dx = ox * s.speed;
    const dy = oy * s.speed;
    s.el.style.transform = `translate(${dx}px, ${dy}px)`;
    /* 배경도 조각과 함께 이동해서 이미지가 잘리지 않게 */
    s.el.style.backgroundPosition =
      `${s.offsetX - s.px + dx + bgX}px ${s.offsetY - s.py + dy + bgY}px`;
  });
}

function returnToOrigin() {
  const ease = 0.12;
  currentOffX *= (1 - ease);
  currentOffY *= (1 - ease);

  if (Math.abs(currentOffX) < 0.3 && Math.abs(currentOffY) < 0.3) {
    currentOffX = 0;
    currentOffY = 0;
    applyShards(0, 0);
    return;
  }

  applyShards(currentOffX, currentOffY);
  returnRaf = requestAnimationFrame(returnToOrigin);
}

scrollLayer.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX - currentOffX;
  dragStartY = e.clientY - currentOffY;
  cancelAnimationFrame(returnRaf);
  scrollLayer.classList.add('dragging');
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  currentOffX = e.clientX - dragStartX;
  currentOffY = e.clientY - dragStartY;
  applyShards(currentOffX, currentOffY);
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  scrollLayer.classList.remove('dragging');
  returnRaf = requestAnimationFrame(returnToOrigin);
});

/* ═══════════════════════════════════════════════════════════════
   휠 스크롤 → 배경 탐색
═══════════════════════════════════════════════════════════════ */

let bgX = 0;
let bgY = 0;
let scrollVelX = 0;
let scrollVelY = 0;
let scrollRafId = null;
let hintHidden = false;

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

function updateBgPositions() {
  shards.forEach(s => {
    const dx = currentOffX * s.speed;
    const dy = currentOffY * s.speed;
    s.el.style.backgroundPosition =
      `${s.offsetX - s.px + dx + bgX}px ${s.offsetY - s.py + dy + bgY}px`;
  });
}

function wrapBg() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { renderW, renderH } = getCoverSize(vw, vh);
  if (bgX >  renderW / 2) bgX -= renderW;
  if (bgX < -renderW / 2) bgX += renderW;
  if (bgY >  renderH / 2) bgY -= renderH;
  if (bgY < -renderH / 2) bgY += renderH;
}

function scrollInertia() {
  if (Math.abs(scrollVelX) < 0.3 && Math.abs(scrollVelY) < 0.3) {
    scrollVelX = scrollVelY = 0;
    return;
  }
  scrollVelX *= 0.92;
  scrollVelY *= 0.92;
  bgX += scrollVelX;
  bgY += scrollVelY;
  wrapBg();
  updateBgPositions();
  scrollRafId = requestAnimationFrame(scrollInertia);
}

window.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(scrollRafId);

  let dx = e.deltaX, dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 20;  dy *= 20;  }
  if (e.deltaMode === 2) { dx *= 400; dy *= 400; }

  scrollVelX -= dx * 0.1;
  scrollVelY -= dy * 0.1;
  const MAX = 10;
  scrollVelX = Math.max(-MAX, Math.min(MAX, scrollVelX));
  scrollVelY = Math.max(-MAX, Math.min(MAX, scrollVelY));

  bgX += scrollVelX;
  bgY += scrollVelY;
  wrapBg();
  updateBgPositions();
  hideHint();
  scrollRafId = requestAnimationFrame(scrollInertia);
}, { passive: false });

/* ═══════════════════════════════════════════════════════════════
   리사이즈
═══════════════════════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  buildShards();
  updateBgPositions();
});
