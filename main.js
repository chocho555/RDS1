/* =====================================================
   main.js
   ===================================================== */

const world      = document.getElementById('world');
const tileCanvas = document.getElementById('tile-canvas');
const ctx        = tileCanvas.getContext('2d');
const hint       = document.getElementById('ui-hint');
const coordsEl   = document.getElementById('ui-coords');
const popup      = document.getElementById('popup');

/* ── 월드 크기 ── */
const WORLD_W = 3600;
const WORLD_H = 1800;

/* ── 배경 이미지 로드 ── */
const bgImg = new Image();
bgImg.src = 'images/bg/사문디_배경.jpg';

/* =====================================================
   1. 타일 생성 — 다양한 크기의 격자
   ===================================================== */

/*
  기본 셀 크기: 80~200px 사이 랜덤
  세 가지 크기 그룹을 섞어서 다양한 느낌을 줍니다
  - 작은 타일: 60~100px
  - 중간 타일: 100~160px
  - 큰 타일:   160~240px
*/
const SIZE_GROUPS = [
  { min: 60,  max: 100, weight: 4 },
  { min: 100, max: 160, weight: 3 },
  { min: 160, max: 240, weight: 2 },
];

function randSize() {
  const totalWeight = SIZE_GROUPS.reduce((s, g) => s + g.weight, 0);
  let r = Math.random() * totalWeight;
  for (const g of SIZE_GROUPS) {
    r -= g.weight;
    if (r <= 0) return Math.round(g.min + Math.random() * (g.max - g.min));
  }
  return 120;
}

/* 타일 배열 생성 */
const tiles = [];

let rowY = 0;
while (rowY < WORLD_H) {
  const rowH = randSize();
  let colX = 0;
  while (colX < WORLD_W) {
    const colW = randSize();
    tiles.push({
      x: colX, y: rowY,
      w: colW, h: rowH,
      /* 슬라이드 오프셋: 양수 = 오른쪽, 음수 = 왼쪽으로 밀림 */
      offsetX: 0,
      /* 드래그 상태 */
      dragging: false,
      startMouseX: 0,
      startOffsetX: 0,
      /* 밀려난 기준 (절반 이상 밀리면 완전히 사라짐) */
      gone: false,
    });
    colX += colW;
  }
  rowY += rowH;
}

/* =====================================================
   2. Canvas 렌더링
   ===================================================== */

tileCanvas.width  = WORLD_W;
tileCanvas.height = WORLD_H;

/* 배경 이미지를 월드 크기에 맞게 스케일 계산 */
let bgScaleX = 1, bgScaleY = 1;
bgImg.onload = () => {
  bgScaleX = WORLD_W / bgImg.naturalWidth;
  bgScaleY = WORLD_H / bgImg.naturalHeight;
  drawTiles();
};

function drawTiles() {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);

  for (const t of tiles) {
    if (t.gone) continue;

    const drawX = t.x + t.offsetX;

    ctx.save();
    /* 타일 영역으로 클리핑 — 이 밖으로 이미지가 삐져나오지 않음 */
    ctx.beginPath();
    ctx.rect(t.x, t.y, t.w, t.h);
    ctx.clip();

    if (bgImg.complete && bgImg.naturalWidth) {
      /* 배경 이미지에서 해당 타일 영역만 잘라 그림 */
      ctx.drawImage(
        bgImg,
        t.x / bgScaleX, t.y / bgScaleY,       /* 소스 위치 */
        t.w / bgScaleX, t.h / bgScaleY,        /* 소스 크기 */
        drawX, t.y, t.w, t.h                   /* 캔버스 위치/크기 */
      );
    } else {
      /* 이미지 로드 전: 회색 채우기 */
      ctx.fillStyle = '#d0cdc8';
      ctx.fillRect(drawX, t.y, t.w, t.h);
    }

    /* 타일 경계선 — 얇고 연하게 */
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(drawX + 0.25, t.y + 0.25, t.w - 0.5, t.h - 0.5);

    ctx.restore();
  }
}

/* =====================================================
   3. 월드 스크롤 (휠)
   ===================================================== */

let worldX = 0, worldY = 0;
let velX = 0, velY = 0;
let scrollRaf = null;
let hintHidden = false;

function applyWorldTransform() {
  world.style.transform = `translate(${worldX}px, ${worldY}px)`;
  coordsEl.textContent  = `${Math.round(-worldX)} / ${Math.round(-worldY)}`;
}

function clampWorld() {
  worldX = Math.max(-(WORLD_W - window.innerWidth),  Math.min(0, worldX));
  worldY = Math.max(-(WORLD_H - window.innerHeight), Math.min(0, worldY));
}

function scrollInertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  worldX += velX; worldY += velY;
  clampWorld();
  applyWorldTransform();
  scrollRaf = requestAnimationFrame(scrollInertia);
}

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

const SCROLL_SPEED = 1.2;
window.addEventListener('wheel', e => {
  /* 타일 드래그 중엔 월드 스크롤 막기 */
  if (activeTile) return;
  e.preventDefault();
  cancelAnimationFrame(scrollRaf);

  let dx = e.deltaX, dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 20;  dy *= 20;  }
  if (e.deltaMode === 2) { dx *= 400; dy *= 400; }

  velX -= dx * SCROLL_SPEED;
  velY -= dy * SCROLL_SPEED;
  const MAX = 60;
  velX = Math.max(-MAX, Math.min(MAX, velX));
  velY = Math.max(-MAX, Math.min(MAX, velY));

  worldX += velX; worldY += velY;
  clampWorld();
  applyWorldTransform();
  hideHint();
  scrollRaf = requestAnimationFrame(scrollInertia);
}, { passive: false });

/* =====================================================
   4. 타일 드래그 (슬라이드)
   ===================================================== */

let activeTile   = null;   /* 현재 드래그 중인 타일 */
let dragStartX   = 0;
let tileRaf      = null;

/* 화면 좌표 → 월드 좌표 변환 */
function toWorldX(screenX) { return screenX - worldX; }
function toWorldY(screenY) { return screenY - worldY; }

/* 마우스/터치 위치에서 타일 찾기 */
function getTileAt(wx, wy) {
  /* 뒤에서부터 탐색 (나중에 그려진 타일이 위에 있음) */
  for (let i = tiles.length - 1; i >= 0; i--) {
    const t = tiles[i];
    if (t.gone) continue;
    if (wx >= t.x && wx <= t.x + t.w &&
        wy >= t.y && wy <= t.y + t.h) return t;
  }
  return null;
}

tileCanvas.addEventListener('mousedown', e => {
  const wx = toWorldX(e.clientX);
  const wy = toWorldY(e.clientY);
  const t  = getTileAt(wx, wy);
  if (!t) return;

  activeTile = t;
  dragStartX = e.clientX - t.offsetX;
  t.dragging = true;
  tileCanvas.classList.add('grabbing');
  cancelAnimationFrame(scrollRaf); /* 드래그 중 스크롤 관성 멈춤 */
  hideHint();
});

window.addEventListener('mousemove', e => {
  if (!activeTile) return;
  activeTile.offsetX = e.clientX - dragStartX;
  checkGone(activeTile);
  drawTiles();
});

window.addEventListener('mouseup', e => {
  if (!activeTile) return;
  finishTileDrag(activeTile, e.clientX);
  activeTile = null;
  tileCanvas.classList.remove('grabbing');
});

/* 터치 */
tileCanvas.addEventListener('touchstart', e => {
  e.stopPropagation();
  const t0  = e.touches[0];
  const wx  = toWorldX(t0.clientX);
  const wy  = toWorldY(t0.clientY);
  const t   = getTileAt(wx, wy);
  if (!t) return;
  activeTile = t;
  dragStartX = t0.clientX - t.offsetX;
  t.dragging = true;
  hideHint();
}, { passive: true });

window.addEventListener('touchmove', e => {
  if (!activeTile) return;
  e.preventDefault();
  activeTile.offsetX = e.touches[0].clientX - dragStartX;
  checkGone(activeTile);
  drawTiles();
}, { passive: false });

window.addEventListener('touchend', e => {
  if (!activeTile) return;
  finishTileDrag(activeTile, e.changedTouches[0].clientX);
  activeTile = null;
});

/*
  타일이 절반(w/2) 이상 밀리면 gone 처리
  → 아래 사진이 완전히 드러남
*/
function checkGone(t) {
  if (Math.abs(t.offsetX) > t.w * 0.5) t.gone = true;
}

/*
  드래그 끝:
  - 절반 미만이면 snap back (제자리로)
  - 절반 이상이면 슬라이드 아웃 애니메이션 후 gone
*/
function finishTileDrag(t, finalX) {
  t.dragging = false;
  if (t.gone) {
    slideOut(t);
  } else {
    snapBack(t);
  }
}

function snapBack(t) {
  const from = t.offsetX;
  const start = performance.now();
  const dur   = 280;
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    t.offsetX = from * (1 - ease);
    drawTiles();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function slideOut(t) {
  const from  = t.offsetX;
  /* 방향에 따라 화면 밖으로 */
  const to    = t.offsetX > 0 ? WORLD_W : -WORLD_W;
  const start = performance.now();
  const dur   = 320;
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    t.offsetX = from + (to - from) * ease;
    drawTiles();
    if (p < 1) requestAnimationFrame(step);
    else { t.gone = true; drawTiles(); }
  }
  requestAnimationFrame(step);
}

/* =====================================================
   5. 사진 클릭 팝업
   ===================================================== */

const popupEl    = document.getElementById('popup');
const popupClose = document.getElementById('popup-close');
const popupTitle = document.getElementById('popup-title');
const popupDesc  = document.getElementById('popup-desc');

document.querySelectorAll('.photo-item').forEach(el => {
  el.addEventListener('click', e => {
    /* 타일이 아직 덮고 있으면 무시 */
    const wx = toWorldX(e.clientX);
    const wy = toWorldY(e.clientY);
    if (getTileAt(wx, wy)) return;

    popupTitle.textContent = el.dataset.title;
    popupDesc.textContent  = el.dataset.desc;

    const rect = el.getBoundingClientRect();
    let left = rect.right + 12;
    let top  = rect.top;
    if (left + 280 > window.innerWidth)  left = rect.left - 272;
    if (top  + 140 > window.innerHeight) top  = window.innerHeight - 150;
    popupEl.style.left    = left + 'px';
    popupEl.style.top     = top  + 'px';
    popupEl.style.display = 'block';
    e.stopPropagation();
  });
});

popupClose.addEventListener('click', () => { popupEl.style.display = 'none'; });
document.addEventListener('click',   e => {
  if (!e.target.closest('#popup') && !e.target.closest('.photo-item'))
    popupEl.style.display = 'none';
});

/* ── 초기 렌더링 ── */
applyWorldTransform();
drawTiles();
