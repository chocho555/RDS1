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

/* ── 조각 데이터 ── */
const PIECES = [
  {id:1,  x:103,  y:2066, w:438,  h:654},
  {id:2,  x:2149, y:317,  w:816,  h:545},
  {id:3,  x:582,  y:203,  w:336,  h:228},
  {id:4,  x:1843, y:2170, w:487,  h:730},
  {id:5,  x:3716, y:428,  w:348,  h:521},
  {id:6,  x:2891, y:2561, w:482,  h:323},
  {id:7,  x:3371, y:2562, w:302,  h:437},
  {id:8,  x:4147, y:1008, w:460,  h:306},
  {id:9,  x:0,    y:0,    w:209,  h:306},
  {id:10, x:3232, y:2137, w:457,  h:306},
  {id:11, x:434,  y:1008, w:661,  h:985},
  {id:12, x:2110, y:1884, w:443,  h:293},
  {id:13, x:1949, y:990,  w:383,  h:257},
  {id:14, x:960,  y:2249, w:292,  h:197},
  {id:15, x:2813, y:2642, w:338,  h:226},
  {id:16, x:1661, y:1238, w:444,  h:296},
  {id:17, x:0,    y:821,  w:440,  h:293},
  {id:18, x:1501, y:26,   w:650,  h:432},
  {id:19, x:749,  y:426,  w:382,  h:254},
  {id:20, x:4108, y:2170, w:277,  h:181},
  {id:21, x:1252, y:1883, w:322,  h:481},
  {id:22, x:3811, y:2352, w:469,  h:308},
  {id:23, x:4460, y:26,   w:338,  h:395},
  {id:24, x:4312, y:420,  w:350,  h:230},
  {id:25, x:749,  y:2759, w:220,  h:149},
  {id:26, x:749,  y:2525, w:356,  h:239},
  {id:27, x:3594, y:2659, w:433,  h:290},
  {id:28, x:538,  y:2267, w:218,  h:318},
  {id:29, x:462,  y:614,  w:286,  h:187},
  {id:30, x:2611, y:2448, w:287,  h:194},
  {id:31, x:3203, y:0,    w:514,  h:768},
  {id:32, x:3841, y:1238, w:265,  h:401},
  {id:33, x:4312, y:1556, w:487,  h:331},
  {id:34, x:3595, y:1841, w:444,  h:298},
  {id:35, x:2615, y:1115, w:1103, h:734},
];

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
      el.dataset.title = `조각 ${p.id}`;
      el.dataset.desc  = '설명을 입력하세요.';

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

/* ── 팝업 시스템 (다중 팝업) ── */
document.addEventListener('click', e => {
  const piece = e.target.closest('.piece');
  if (!piece) return;

  const rect = piece.getBoundingClientRect();
  let left = rect.right + 12;
  let top  = rect.top;
  if (left + 270 > window.innerWidth)  left = rect.left - 272;
  if (top  + 120 > window.innerHeight) top  = window.innerHeight - 130;
  if (left < 8) left = 8;
  if (top  < 8) top  = 8;

  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `
    <p class="popup-title">${piece.dataset.title}</p>
    <p class="popup-desc">${piece.dataset.desc}</p>
  `;
  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
  document.body.appendChild(popup);

  /* 30초 후 자동 제거 */
  setTimeout(() => popup.remove(), 30000);

  e.stopPropagation();
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
