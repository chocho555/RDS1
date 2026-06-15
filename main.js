/* =====================================================
   main.js
   ===================================================== */

const layerBg  = document.getElementById('layer-bg');
const layerMid = document.getElementById('layer-mid');
const hint     = document.getElementById('ui-hint');

const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;  /* 4800px */
const TILE_H = IMG_H * SCALE;  /* 3000px */

/* ── 배경 타일 (3×3) ── */
layerBg.style.width  = TILE_W * 3 + 'px';
layerBg.style.height = TILE_H * 3 + 'px';
document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* ── 중경 레이어: 3×3 복제로 무한 루프 ── */
layerMid.style.width  = TILE_W * 3 + 'px';
layerMid.style.height = TILE_H * 3 + 'px';

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const offsetX = col * TILE_W;
    const offsetY = row * TILE_H;

    PIECES.forEach(p => {
      const el = document.createElement('div');
      el.className = 'piece';
      el.style.left   = (offsetX + p.x) + 'px';
      el.style.top    = (offsetY + p.y) + 'px';
      el.style.width  = p.w + 'px';
      el.style.height = p.h + 'px';
      el.dataset.id    = p.id;
      el.dataset.title = p.title;
      el.dataset.desc  = p.desc;

      const img = document.createElement('img');
      img.src = `images/조각/조각${p.id}.png`;
      img.style.width      = TILE_W + 'px';
      img.style.height     = TILE_H + 'px';
      img.style.marginLeft = -p.x + 'px';
      img.style.marginTop  = -p.y + 'px';
      img.draggable = false;

      el.appendChild(img);
      layerMid.appendChild(el);
    });
  }
}

/* ── 패럴랙스 ── */
const SPEED_BG  = 0.2;
const SPEED_MID = 0.6;

let x = 0, y = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function wrap(val, size) {
  return ((val % size) + size) % size - size;
}

function applyParallax() {
  layerBg.style.transform  = `translate(${wrap(x * SPEED_BG,  TILE_W)}px, ${wrap(y * SPEED_BG,  TILE_H)}px)`;
  layerMid.style.transform = `translate(${wrap(x * SPEED_MID, TILE_W)}px, ${wrap(y * SPEED_MID, TILE_H)}px)`;
}

function inertia() {
  if (Math.abs(velX) < 0.3 && Math.abs(velY) < 0.3) { velX = velY = 0; return; }
  velX *= 0.92; velY *= 0.92;
  x += velX; y += velY;
  applyParallax();
  rafId = requestAnimationFrame(inertia);
}

function hideHint() {
  if (!hintHidden) { hint.classList.add('hidden'); hintHidden = true; }
}

window.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(rafId);
  let dx = e.deltaX, dy = e.deltaY;
  if (e.deltaMode === 1) { dx *= 20;  dy *= 20;  }
  if (e.deltaMode === 2) { dx *= 400; dy *= 400; }
  velX -= dx * 0.1; velY -= dy * 0.1;
  const MAX = 10;
  velX = Math.max(-MAX, Math.min(MAX, velX));
  velY = Math.max(-MAX, Math.min(MAX, velY));
  x += velX; y += velY;
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
  velX = (cx - touchPrevX) * 0.1;
  velY = (cy - touchPrevY) * 0.1;
  touchPrevX = cx; touchPrevY = cy;
  x += velX; y += velY;
  applyParallax();
}, { passive: false });
document.addEventListener('touchend', () => {
  rafId = requestAnimationFrame(inertia);
});

applyParallax();

/* ── 팝업 시스템 (1번 클릭: title, 2번 클릭: desc) ── */
const clickState = new Map();  // id → 'title' | 'desc'
const piecePopup = new Map();  // id → 현재 띄워진 popup 엘리먼트

document.addEventListener('click', e => {
  const piece = e.target.closest('.piece');

  if (piece) {
    const id    = piece.dataset.id;
    const title = piece.dataset.title;
    const desc  = piece.dataset.desc;
    const state = clickState.get(id);
    let text = '';

    if (!state) {
      text = title;
      clickState.set(id, 'title');


    } else if (state === 'title' && desc) {
      text = desc;
      clickState.set(id, 'desc');
    } else {
      return;
    }

    if (!text) return;

    const prev = piecePopup.get(id);
    if (prev) prev.remove();

    const rect = piece.getBoundingClientRect();
    let left = rect.right + 12;
    let top  = rect.top;
    if (left + 270 > window.innerWidth)  left = rect.left - 272;
    if (top  + 120 > window.innerHeight) top  = window.innerHeight - 130;
    if (left < 8) left = 8;
    if (top  < 8) top  = 8;

    if (state === 'title') top += 30;

    /* 기존 팝업들과 겹치지 않도록 위치 조정 */
    const POPUP_H = 80;
    let attempts = 0;
    let overlap = true;
    while (overlap && attempts < 20) {
      overlap = false;
      document.querySelectorAll('.popup').forEach(p => {
        const pt = parseInt(p.style.top);
        const pl = parseInt(p.style.left);
        if (Math.abs(top - pt) < POPUP_H && Math.abs(left - pl) < 280) {
          top = pt + POPUP_H + 8;
          overlap = true;
        }
      });
      attempts++;
    }
    if (top + POPUP_H > window.innerHeight) top = window.innerHeight - POPUP_H - 8;

    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `<p class="popup-text">${text.replace(/\n/g, '<br>')}</p>`;
    popup.style.left = left + 'px';
    popup.style.top  = top  + 'px';
    document.body.appendChild(popup);

    piecePopup.set(id, popup);
    const timer = setTimeout(() => {
      popup.remove();
      piecePopup.delete(id);
    }, 20000);
    popup.dataset.timer = timer;

  } else {
    document.querySelectorAll('.popup').forEach(p => {
      clearTimeout(p.dataset.timer);
      p.remove();
    });
    clickState.clear();
    piecePopup.clear();
  }
});

/* ── 판 시스템 ── */
const panels = [
  document.getElementById('panel-a'),
  document.getElementById('panel-b'),
  document.getElementById('panel-c'),
  document.getElementById('panel-d'),
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showPanels() {
  panels.forEach(p => p.style.display = 'none');
  const picked = shuffle(panels).slice(0, 2);
  picked.forEach(p => p.style.display = 'block');
  setTimeout(() => { picked.forEach(p => p.style.display = 'none'); }, 10000);
}

setInterval(showPanels, 60000);
