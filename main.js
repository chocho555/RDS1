/* ═══════════════════════════════════════════════════════════
   LAYER 1 — 무한 스크롤 배경 (원본 로직 그대로)
   휠 스크롤 → 배경 탐색
═══════════════════════════════════════════════════════════ */
const canvas   = document.getElementById('canvas');
const viewport = document.getElementById('viewport');
const hint     = document.getElementById('ui-hint');

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
let scrollRafId = null;
let hintHidden = false;

function applyCanvasTransform() {
  canvas.style.transform = `translate(${x}px, ${y}px)`;
}

function wrap() {
  if (x > -TILE_W + window.innerWidth)      x -= TILE_W;
  if (x < -TILE_W * 2 + window.innerWidth)  x += TILE_W;
  if (y > -TILE_H + window.innerHeight)     y -= TILE_H;
  if (y < -TILE_H * 2 + window.innerHeight) y += TILE_H;
}

function scrollInertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  x += velX; y += velY;
  wrap();
  applyCanvasTransform();
  scrollRafId = requestAnimationFrame(scrollInertia);
}

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

/* 휠: 배경 탐색 전용 */
window.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(scrollRafId);
  let dx = e.deltaX, dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 20;  dy *= 20;  }
  if (e.deltaMode === 2) { dx *= 400; dy *= 400; }
  velX -= dx * 0.1; velY -= dy * 0.1;
  const MAX = 10;
  velX = Math.max(-MAX, Math.min(MAX, velX));
  velY = Math.max(-MAX, Math.min(MAX, velY));
  x += velX; y += velY;
  wrap();
  applyCanvasTransform();
  hideHint();
  scrollRafId = requestAnimationFrame(scrollInertia);
}, { passive: false });

applyCanvasTransform();


/* ═══════════════════════════════════════════════════════════
   LAYER 2 — 패럴랙스 조각 (드래그로 흩어짐)
   마우스 클릭+드래그 → 조각들이 각자 다른 속도로 이동
═══════════════════════════════════════════════════════════ */

/*
  조각 정의: 첨부 이미지의 직사각형 구조를 비율(0~1)로 표현
  x, y  : 화면 기준 좌상단 위치 비율
  w, h  : 화면 기준 크기 비율
  speed : 패럴랙스 속도 계수 (클수록 더 멀리 이동)
*/
const SHARDS = [
  { x:0.04, y:0.02, w:0.06, h:0.28, speed: 0.6  },
  { x:0.10, y:0.02, w:0.05, h:0.20, speed: 1.4  },
  { x:0.11, y:0.05, w:0.12, h:0.40, speed: 1.0  },
  { x:0.23, y:0.16, w:0.08, h:0.22, speed: 0.5  },
  { x:0.26, y:0.03, w:0.14, h:0.36, speed: 1.6  },
  { x:0.36, y:0.03, w:0.08, h:0.14, speed: 0.9  },
  { x:0.36, y:0.20, w:0.08, h:0.20, speed: 1.2  },
  { x:0.44, y:0.40, w:0.07, h:0.24, speed: 0.7  },
  { x:0.46, y:0.40, w:0.12, h:0.32, speed: 1.3  },
  { x:0.47, y:0.02, w:0.10, h:0.28, speed: 1.7  },
  { x:0.50, y:0.05, w:0.05, h:0.15, speed: 0.4  },
  { x:0.58, y:0.02, w:0.05, h:0.20, speed: 1.1  },
  { x:0.60, y:0.06, w:0.12, h:0.36, speed: 0.8  },
  { x:0.70, y:0.02, w:0.07, h:0.18, speed: 0.6  },
  { x:0.70, y:0.13, w:0.10, h:0.30, speed: 1.5  },
  { x:0.74, y:0.35, w:0.06, h:0.16, speed: 1.0  },
  { x:0.76, y:0.40, w:0.08, h:0.24, speed: 0.75 },
  { x:0.80, y:0.50, w:0.06, h:0.24, speed: 1.2  },
  { x:0.84, y:0.08, w:0.08, h:0.26, speed: 0.9  },
  { x:0.87, y:0.02, w:0.07, h:0.17, speed: 1.6  },
  { x:0.02, y:0.38, w:0.06, h:0.15, speed: 0.55 },
  { x:0.02, y:0.58, w:0.06, h:0.22, speed: 1.1  },
  { x:0.03, y:0.80, w:0.08, h:0.12, speed: 0.8  },
  { x:0.13, y:0.50, w:0.12, h:0.36, speed: 1.25 },
  { x:0.26, y:0.53, w:0.08, h:0.24, speed: 0.65 },
  { x:0.36, y:0.46, w:0.08, h:0.16, speed: 1.45 },
  { x:0.56, y:0.53, w:0.14, h:0.40, speed: 0.95 },
  { x:0.66, y:0.56, w:0.05, h:0.15, speed: 1.1  },
  { x:0.89, y:0.70, w:0.08, h:0.22, speed: 0.8  },
];

const shardsEl = document.getElementById('shards');

function buildShards() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  shardsEl.innerHTML = '';

  SHARDS.forEach(s => {
    const el = document.createElement('div');
    el.className = 'shard';

    const px = s.x * W;
    const py = s.y * H;
    const pw = s.w * W;
    const ph = s.h * H;

    el.style.left   = px + 'px';
    el.style.top    = py + 'px';
    el.style.width  = pw + 'px';
    el.style.height = ph + 'px';

    /* 배경을 화면 전체 기준으로 맞춰 클리핑 */
    el.style.backgroundSize     = `${W}px ${H}px`;
    el.style.backgroundPosition = `-${px}px -${py}px`;

    el.dataset.speed = s.speed;
    el.dataset.ox    = px;
    el.dataset.oy    = py;

    shardsEl.appendChild(el);
  });
}

buildShards();

/* 드래그 상태 */
let dragOffX = 0, dragOffY = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;

function applyShardOffset(ox, oy) {
  document.querySelectorAll('.shard').forEach(el => {
    const speed = parseFloat(el.dataset.speed);
    const origX = parseFloat(el.dataset.ox);
    const origY = parseFloat(el.dataset.oy);
    const dx = ox * speed;
    const dy = oy * speed;
    el.style.transform          = `translate(${dx}px, ${dy}px)`;
    el.style.backgroundPosition = `${-(origX - dx)}px ${-(origY - dy)}px`;
  });
}

/* 마우스 드래그: 조각 흩어짐 전용 */
document.addEventListener('mousedown', e => {
  isDragging  = true;
  dragStartX  = e.clientX - dragOffX;
  dragStartY  = e.clientY - dragOffY;
  document.body.style.cursor = 'grabbing';
  hideHint();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  dragOffX = e.clientX - dragStartX;
  dragOffY = e.clientY - dragStartY;
  applyShardOffset(dragOffX, dragOffY);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = '';
  /* 드래그 놓으면 조각 원위치로 복귀 */
  dragOffX = 0;
  dragOffY = 0;
  document.querySelectorAll('.shard').forEach(el => {
    el.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    el.style.transform  = 'translate(0px, 0px)';
    const origX = parseFloat(el.dataset.ox);
    const origY = parseFloat(el.dataset.oy);
    el.style.backgroundPosition = `-${origX}px -${origY}px`;
  });
  setTimeout(() => {
    document.querySelectorAll('.shard').forEach(el => {
      el.style.transition = '';
    });
  }, 800);
});

window.addEventListener('resize', () => {
  buildShards();
  applyShardOffset(dragOffX, dragOffY);
});
