/* =====================================================
   main.js
   ===================================================== */

/* ── 요소 참조 ── */
const layerBg    = document.getElementById('layer-bg');
const layerSlide = document.getElementById('layer-slideshow');
const layerFg    = document.getElementById('layer-fg');
const hint       = document.getElementById('ui-hint');

/* =====================================================
   1. 배경 타일 (무한 루프 3×3)
   ===================================================== */
const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;
const TILE_H = IMG_H * SCALE;

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
   2. 슬라이드쇼 — 빨간 마스크 안에만 표시
   Canvas 2개를 사용:
     maskCanvas: 요소1_mask.png 를 그려서 마스크로 사용
     slideCanvas: 슬라이드 이미지를 그린 뒤
                  destination-in 으로 마스크 모양만 남김
   ===================================================== */
const slideCanvas = document.getElementById('slideshow-canvas');
const slideCtx    = slideCanvas.getContext('2d');
const wrap        = document.getElementById('slideshow-wrap');

const SW = TILE_W;
const SH = TILE_H;
slideCanvas.width  = SW;
slideCanvas.height = SH;
wrap.style.width   = SW + 'px';
wrap.style.height  = SH + 'px';

/* 마스크 이미지 로드 */
const maskImg = new Image();
maskImg.src = 'images/요소1_mask.png';

/*
  슬라이드 이미지 경로
  images/slides/001.jpg ~ 050.jpg
  ★ 실제 파일로 교체하세요
*/
const SLIDE_SRCS = Array.from({ length: 50 }, (_, i) =>
  `images/slides/${String(i + 1).padStart(3, '0')}.jpg`
);
const SLIDE_INTERVAL = 120; /* ms — 낮출수록 빠름 */

const slideImgs  = [];
let slidesLoaded = 0;
let currentSlide = 0;
let slideTimer   = null;

function drawSlide() {
  slideCtx.clearRect(0, 0, SW, SH);

  /* ① 슬라이드 이미지 그리기 */
  const img = slideImgs[currentSlide];
  if (img && img.complete && img.naturalWidth) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const sc = Math.max(SW / iw, SH / ih);
    const dw = iw * sc, dh = ih * sc;
    slideCtx.drawImage(img, (SW - dw) / 2, (SH - dh) / 2, dw, dh);
  } else {
    /* 플레이스홀더: 슬라이드별 다른 색 */
    slideCtx.fillStyle = `hsl(${currentSlide * 7}, 40%, 40%)`;
    slideCtx.fillRect(0, 0, SW, SH);
  }

  /*
    ② destination-in 합성:
    "이미 그려진 내용" × "새로 그리는 알파"
    → 마스크 PNG의 불투명한 픽셀(빨간/선)만 남고 나머지는 투명
  */
  if (maskImg.complete && maskImg.naturalWidth) {
    slideCtx.globalCompositeOperation = 'destination-in';
    slideCtx.drawImage(maskImg, 0, 0, SW, SH);
    slideCtx.globalCompositeOperation = 'source-over'; /* 원상복구 */
  }
}

function startSlideshow() {
  drawSlide();
  slideTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % slideImgs.length;
    drawSlide();
  }, SLIDE_INTERVAL);
}

/* 이미지 프리로드 */
SLIDE_SRCS.forEach(src => {
  const img = new Image();
  img.onload = () => {
    slidesLoaded++;
    if (slidesLoaded === SLIDE_SRCS.length) startSlideshow();
  };
  img.onerror = () => { slidesLoaded++; };
  img.src = src;
  slideImgs.push(img);
});

/* 마스크 로드 완료 후 + 이미지 없어도 플레이스홀더로 시작 */
maskImg.onload = () => {
  if (!slideTimer) {
    drawSlide();
    slideTimer = setInterval(() => {
      currentSlide = (currentSlide + 1) % Math.max(slideImgs.length, 1);
      drawSlide();
    }, SLIDE_INTERVAL);
  }
};

/* =====================================================
   3. 패럴랙스 스크롤
   배경 0.3x / 슬라이드 0.6x / 전경 1.0x
   ===================================================== */
const SPEED = { bg: 0.3, slide: 0.6, fg: 1.0 };

let scrollX = 0, scrollY = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function applyParallax() {
  /* 배경 무한 루프 */
  let bgX = scrollX * SPEED.bg;
  let bgY = scrollY * SPEED.bg;
  if (bgX > 0)       bgX -= TILE_W;
  if (bgX < -TILE_W) bgX += TILE_W;
  if (bgY > 0)       bgY -= TILE_H;
  if (bgY < -TILE_H) bgY += TILE_H;
  layerBg.style.transform    = `translate(${bgX}px, ${bgY}px)`;

  /* 슬라이드쇼 레이어 */
  layerSlide.style.transform =
    `translate(${scrollX * SPEED.slide}px, ${scrollY * SPEED.slide}px)`;

  /* 전경 */
  layerFg.style.transform    =
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
  scrollX += velX; scrollY += velY;
  applyParallax();
}, { passive: false });

document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
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
