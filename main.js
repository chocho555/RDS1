/* =====================================================
   main.js — 패럴랙스 3레이어 + 슬라이드쇼 마스크
   ===================================================== */

/* ── 요소 참조 ── */
const viewport   = document.getElementById('viewport');
const layerBg    = document.getElementById('layer-bg');
const layerSlide = document.getElementById('layer-slideshow');
const layerFg    = document.getElementById('layer-fg');
const hint       = document.getElementById('ui-hint');

/* =====================================================
   1. 배경 타일 세팅 (무한 루프 3×3)
   ===================================================== */
const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;   /* 4800px */
const TILE_H = IMG_H * SCALE;   /* 3000px */

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
   2. 슬라이드쇼 세팅
   ===================================================== */
const canvas = document.getElementById('slideshow-canvas');
const ctx    = canvas.getContext('2d');
const wrap   = document.getElementById('slideshow-wrap');

/* 슬라이드쇼 크기 = 배경 이미지와 동일 */
const SW = IMG_W * SCALE;
const SH = IMG_H * SCALE;
canvas.width  = SW;
canvas.height = SH;
wrap.style.width  = SW + 'px';
wrap.style.height = SH + 'px';

/*
  ★ 슬라이드쇼 이미지 경로 목록
  실제 이미지 파일 50장으로 교체하세요
  예) 'images/slides/001.jpg', 'images/slides/002.jpg', ...
*/
const SLIDE_SRCS = Array.from({ length: 50 }, (_, i) =>
  `images/slides/${String(i + 1).padStart(3, '0')}.jpg`
);

/*
  ★ 전환 속도 (ms)
  낮출수록 빠름 — 80~200 권장
*/
const SLIDE_INTERVAL = 120;

const slideImgs = [];
let slidesLoaded = 0;
let currentSlide = 0;
let slideTimer   = null;

/* 이미지 프리로드 */
SLIDE_SRCS.forEach((src, i) => {
  const img = new Image();
  img.onload = () => {
    slidesLoaded++;
    if (slidesLoaded === SLIDE_SRCS.length) startSlideshow();
  };
  img.onerror = () => { slidesLoaded++; }; /* 없는 파일은 건너뜀 */
  img.src = src;
  slideImgs.push(img);
});

function drawSlide() {
  ctx.clearRect(0, 0, SW, SH);
  const img = slideImgs[currentSlide];
  if (img && img.complete && img.naturalWidth) {
    /* cover 방식으로 캔버스 꽉 채우기 */
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(SW / iw, SH / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (SW - dw) / 2, dy = (SH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    /* 이미지 없을 때 — 진한 회색 채우기 (플레이스홀더) */
    ctx.fillStyle = `hsl(${currentSlide * 7}, 20%, 30%)`;
    ctx.fillRect(0, 0, SW, SH);
  }
}

function startSlideshow() {
  drawSlide();
  slideTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % slideImgs.length;
    drawSlide();
  }, SLIDE_INTERVAL);
}

/* 이미지가 없어도 플레이스홀더로 미리 시작 */
setTimeout(() => {
  if (!slideTimer) {
    slideTimer = setInterval(() => {
      currentSlide = (currentSlide + 1) % Math.max(slideImgs.length, 1);
      drawSlide();
    }, SLIDE_INTERVAL);
    drawSlide();
  }
}, 300);

/* =====================================================
   3. 패럴랙스 스크롤
   ===================================================== */

/*
  속도 배율:
  BG   0.3  → 가장 느림  (가장 멀리 있는 느낌)
  SLIDE 0.6 → 중간
  FG   1.0  → 화면과 1:1 (가장 앞)
*/
const SPEED = { bg: 0.3, slide: 0.6, fg: 1.0 };

let scrollX = 0, scrollY = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function applyParallax() {
  /* 배경: 무한 루프 wrap */
  let bgX = scrollX * SPEED.bg;
  let bgY = scrollY * SPEED.bg;
  if (bgX > 0)       bgX -= TILE_W;
  if (bgX < -TILE_W) bgX += TILE_W;
  if (bgY > 0)       bgY -= TILE_H;
  if (bgY < -TILE_H) bgY += TILE_H;
  layerBg.style.transform = `translate(${bgX}px, ${bgY}px)`;

  /* 슬라이드쇼 레이어 */
  layerSlide.style.transform =
    `translate(${scrollX * SPEED.slide}px, ${scrollY * SPEED.slide}px)`;

  /* 전경 */
  layerFg.style.transform =
    `translate(${scrollX * SPEED.fg}px, ${scrollY * SPEED.fg}px)`;
}

function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  scrollX += velX; scrollY += velY;
  applyParallax();
  rafId = requestAnimationFrame(inertia);
}

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

/* 휠 스크롤 */
const SCROLL_SPEED = 1.2;
window.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(rafId);

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
  rafId = requestAnimationFrame(inertia);
}, { passive: false });

/* 터치 스크롤 */
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
  touchPrevX = cx; touchPrevY = cy;
  scrollX += velX; scrollY += velY;
  applyParallax();
}, { passive: false });

document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
});

/* =====================================================
   4. 전경 사진 팝업
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
    let left = rect.right + 12;
    let top  = rect.top;
    if (left + 280 > window.innerWidth)  left = rect.left - 272;
    if (top  + 140 > window.innerHeight) top  = window.innerHeight - 150;
    popup.style.left    = left + 'px';
    popup.style.top     = top  + 'px';
    popup.style.display = 'block';
    e.stopPropagation();
  });
});

popupClose.addEventListener('click', () => { popup.style.display = 'none'; });
document.addEventListener('click', e => {
  if (!e.target.closest('#popup') && !e.target.closest('.photo-item'))
    popup.style.display = 'none';
});

/* ── 초기 렌더링 ── */
applyParallax();
