/* =====================================================
   main.js — 최적화 + 슬라이드쇼 무한 루프
   ===================================================== */

const layerBg    = document.getElementById('layer-bg');
const layerSlide = document.getElementById('layer-slideshow');
const layerFg    = document.getElementById('layer-fg');
const hint       = document.getElementById('ui-hint');

/* =====================================================
   1. 타일 크기 세팅
   ===================================================== */
const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;  /* 4800px */
const TILE_H = IMG_H * SCALE;  /* 3000px */

/* 배경 타일 */
layerBg.style.width  = TILE_W * 3 + 'px';
layerBg.style.height = TILE_H * 3 + 'px';
document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* =====================================================
   2. 슬라이드쇼 캔버스 — 3×3 타일로 무한 반복
   ===================================================== */
const wrap   = document.getElementById('slideshow-wrap');
const canvas = document.getElementById('slideshow-canvas');
const ctx    = canvas.getContext('2d');

/* 캔버스 = 배경과 동일한 3×3 크기 */
const CW = TILE_W * 3;
const CH = TILE_H * 3;
canvas.width  = CW;
canvas.height = CH;
wrap.style.width   = CW + 'px';
wrap.style.height  = CH + 'px';
/* 배경 레이어와 동일하게 -1타일 offset에서 시작 */
wrap.style.position = 'absolute';
wrap.style.top      = -TILE_H + 'px';
wrap.style.left     = -TILE_W + 'px';

/* 마스크 이미지 */
const maskImg = new Image();
maskImg.src = 'images/요소1_mask.png';

/*
  슬라이드 이미지 — images/slides/001.jpg ~ 050.jpg
*/
const SLIDE_COUNT    = 50;
const SLIDE_INTERVAL = 120; /* ms, 낮출수록 빠름 */

const slideImgs  = [];
let loadedCount  = 0;
let currentSlide = 0;
let lastDrawTime = 0;
let maskReady    = false;
let slidesReady  = false;

/* 오프스크린 캔버스: 타일 1장 크기로 슬라이드 합성 */
const offscreen = document.createElement('canvas');
offscreen.width  = TILE_W;
offscreen.height = TILE_H;
const offCtx = offscreen.getContext('2d');

function compositeSlide() {
  /* ① 슬라이드 이미지를 오프스크린에 cover로 그림 */
  offCtx.clearRect(0, 0, TILE_W, TILE_H);
  const img = slideImgs[currentSlide];
  if (img && img.complete && img.naturalWidth) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const sc = Math.max(TILE_W / iw, TILE_H / ih);
    const dw = iw * sc, dh = ih * sc;
    offCtx.drawImage(img, (TILE_W - dw) / 2, (TILE_H - dh) / 2, dw, dh);
  }

  /* ② destination-in: 마스크 모양만 남김 */
  if (maskReady) {
    offCtx.globalCompositeOperation = 'destination-in';
    offCtx.drawImage(maskImg, 0, 0, TILE_W, TILE_H);
    offCtx.globalCompositeOperation = 'source-over';
  }
}

function drawTiled() {
  /* 오프스크린(타일 1장)을 3×3으로 타일링 */
  ctx.clearRect(0, 0, CW, CH);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.drawImage(offscreen, col * TILE_W, row * TILE_H);
    }
  }
}

/* 슬라이드쇼 루프 — requestAnimationFrame 기반
   매 프레임 그리지 않고 SLIDE_INTERVAL ms마다만 갱신 → 렉 감소 */
let slideRaf = null;
function slideshowLoop(now) {
  slideRaf = requestAnimationFrame(slideshowLoop);
  if (now - lastDrawTime < SLIDE_INTERVAL) return;
  lastDrawTime = now;
  currentSlide = (currentSlide + 1) % slideImgs.length;
  compositeSlide();
  drawTiled();
}

function tryStart() {
  if (!maskReady || !slidesReady) return;
  compositeSlide();
  drawTiled();
  slideRaf = requestAnimationFrame(slideshowLoop);
}

/* 마스크 로드 */
maskImg.onload = () => { maskReady = true; tryStart(); };

/* 슬라이드 이미지 프리로드 */
for (let i = 1; i <= SLIDE_COUNT; i++) {
  const img = new Image();
  const src = `images/slides/${String(i).padStart(3, '0')}.jpg`;
  img.onload  = () => { loadedCount++; if (loadedCount >= SLIDE_COUNT * 0.8) { slidesReady = true; tryStart(); } };
  img.onerror = () => { loadedCount++; if (loadedCount >= SLIDE_COUNT * 0.8) { slidesReady = true; tryStart(); } };
  img.src = src;
  slideImgs.push(img);
}

/* =====================================================
   3. 패럴랙스 스크롤
   ===================================================== */
const SPEED = { bg: 0.3, slide: 0.6, fg: 1.0 };

let scrollX = 0, scrollY = 0;
let velX = 0, velY = 0;
let scrollRaf = null;
let hintHidden = false;
let needsRender = false;

function wrapBg(val, size) {
  /* 무한 루프: 타일 1장 크기 넘으면 snap */
  if (val > 0)      return val - size;
  if (val < -size)  return val + size;
  return val;
}

function applyParallax() {
  const bgX = wrapBg(scrollX * SPEED.bg, TILE_W);
  const bgY = wrapBg(scrollY * SPEED.bg, TILE_H);

  /* 슬라이드쇼도 배경처럼 무한 루프 */
  const slX = wrapBg(scrollX * SPEED.slide, TILE_W);
  const slY = wrapBg(scrollY * SPEED.slide, TILE_H);

  layerBg.style.transform    = `translate(${bgX}px, ${bgY}px)`;
  layerSlide.style.transform = `translate(${slX}px, ${slY}px)`;
  layerFg.style.transform    = `translate(${scrollX * SPEED.fg}px, ${scrollY * SPEED.fg}px)`;
}

function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  scrollX += velX; scrollY += velY;
  applyParallax();
  scrollRaf = requestAnimationFrame(inertia);
}

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

const SCROLL_SPEED = 1.2;
window.addEventListener('wheel', e => {
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
  scrollX += velX; scrollY += velY;
  applyParallax();
  hideHint();
  scrollRaf = requestAnimationFrame(inertia);
}, { passive: false });

let touchPrevX = 0, touchPrevY = 0;
document.addEventListener('touchstart', e => {
  touchPrevX = e.touches[0].clientX;
  touchPrevY = e.touches[0].clientY;
  velX = velY = 0;
  cancelAnimationFrame(scrollRaf);
  hideHint();
}, { passive: true });
document.addEventListener('touchmove', e => {
  e.preventDefault();
  const cx = e.touches[0].clientX, cy = e.touches[0].clientY;
  velX = cx - touchPrevX; velY = cy - touchPrevY;
  touchPrevX = cx; touchPrevY = cy;
  scrollX += velX; scrollY += velY;
  applyParallax();
}, { passive: false });
document.addEventListener('touchend', () => {
  scrollRaf = requestAnimationFrame(inertia);
});

/* =====================================================
   4. 전경 팝업
   ===================================================== */
const popup      = document.getElementById('popup');
const popupClose = document.getElementById('popup-close');
const popupTitle = document.getElementById('popup-title');
const popupDesc  = document.getElementById('popup-desc');

document.querySelectorAll('.photo-item').forEach(el => {
  el.addEventListener('click', e => {
    popupTitle.textContent = el.dataset.title;
    popupDesc.textContent  = el.dataset.desc;
    const rect = el.getBoundingClientRect();
    let left = rect.right + 12, top = rect.top;
    if (left + 280 > window.innerWidth)  left = rect.left - 272;
    if (top  + 140 > window.innerHeight) top  = window.innerHeight - 150;
    popup.style.left = left + 'px';
    popup.style.top  = top  + 'px';
    popup.style.display = 'block';
    e.stopPropagation();
  });
});
popupClose.addEventListener('click', () => { popup.style.display = 'none'; });
document.addEventListener('click', e => {
  if (!e.target.closest('#popup') && !e.target.closest('.photo-item'))
    popup.style.display = 'none';
});

applyParallax();
