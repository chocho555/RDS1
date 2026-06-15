/* =====================================================
   main.js
   ===================================================== */

const layerBg       = document.getElementById('layer-bg');
const layerElements = document.getElementById('layer-elements');
const layerMid      = document.getElementById('layer-mid');
const hint     = document.getElementById('ui-hint');

const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;  /* 4800px */
const TILE_H = IMG_H * SCALE;  /* 3000px */

/* ── 레이어 크기 설정 (3×3 반복으로 무한 이동처럼 보이게 함) ── */
[layerBg, layerElements, layerMid].forEach(layer => {
  layer.style.width  = TILE_W * 3 + 'px';
  layer.style.height = TILE_H * 3 + 'px';
});

/* ── 배경 타일 (3×3) ── */
document.querySelectorAll('.tile').forEach((tile, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  tile.style.width  = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left   = col * TILE_W + 'px';
  tile.style.top    = row * TILE_H + 'px';
});

/* ── 요소 PNG 타일 (3×3)
   요소 파일은 투명 PNG이므로 배경 위에 그대로 얹힘 */
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const tile = document.createElement('div');
    tile.className = 'element-tile';
    tile.style.width  = TILE_W + 'px';
    tile.style.height = TILE_H + 'px';
    tile.style.left   = col * TILE_W + 'px';
    tile.style.top    = row * TILE_H + 'px';
    layerElements.appendChild(tile);
  }
}

/* ── 조각 데이터 ── */
const PIECES = [
  {id:1,  x:103,  y:2066, w:438,  h:654,  title:'가림천', desc:'가림판보다 약해 보여 근처를 지날 때 살짝 움츠리게 된다'},
  {id:2,  x:2149, y:317,  w:816,  h:545,  title:'자전거', desc:'흑석동은 지대가 고르지 못한 곳이 많아 이전에는 자전거를 배우기에 좋은 환경이 아니었다'},
  {id:3,  x:582,  y:203,  w:336,  h:228,  title:'동부센트레빌', desc:''},
  {id:4,  x:1843, y:2170, w:487,  h:730,  title:'', desc:'가림판에 드리운 그림자와 전봇대가 합쳐져 있다'},
  {id:5,  x:3716, y:428,  w:348,  h:521,  title:'명수대 아파트', desc:'아파트 글자 거의 떼어져 가고 있다'},
  {id:6,  x:2895, y:2562, w:477,  h:318,  title:'공사판 가림막', desc:''},
  {id:7,  x:3371, y:2562, w:302,  h:437,  title:'명수대 아파트 안에 있는 화분(?)', desc:'계단에 순서대로 놓여져 있다. 이런 화분들이 아파트 안에 꽤 있는데 무엇을 심은 것인지, 언제 심은 것인지 알 수 없다'},
  {id:8,  x:4147, y:1008, w:460,  h:306,  title:'건설 현장', desc:'가장 좋아하는 단계, 파빌리온과 닮아있다'},
  {id:9,  x:0,    y:0,    w:209,  h:306,  title:'명수대 아파트 중정과 복도', desc:'볕이 잘 든다. 예전 아파트들은 중정이 많은데, 복도식 아파트의 단점을 보완하며 채광과 공기 순환이 되었기 때문이라고 한다'},
  {id:10, x:3232, y:2137, w:457,  h:306,  title:'', desc:'공사판 가림막 사이로 보이는'},
  {id:11, x:434,  y:1008, w:661,  h:985,  title:'가장 많이 보이는 하늘', desc:''},
  {id:12, x:2110, y:1884, w:443,  h:293,  title:'작은 틈', desc:''},
  {id:13, x:1949, y:990,  w:383,  h:257,  title:'', desc:'문방구의 뽑기 기계와 자전거들'},
  {id:14, x:960,  y:2249, w:292,  h:197,  title:'명수대 아파트의 중앙 계단', desc:'어느 건물이든 중앙 계단은 가로 폭이 넓어 오르락 내리락 할 때에 기분이 좋다'},
  {id:15, x:4463, y:2776, w:336,  h:223,  title:'오토바이 도난 방지용 철사슬', desc:'보안이 살벌하다. 단순하지만 아주 확실한 기능'},
  {id:16, x:1661, y:1238, w:444,  h:296,  title:'동부센트레빌', desc:''},
  {id:17, x:0,    y:821,  w:440,  h:293,  title:'명수대 아파트 옥상', desc:''},
  {id:18, x:1501, y:26,   w:650,  h:432,  title:'흑석1구역 조합 정상화를 위한 비상대책 위원회', desc:'500% 용적률 추진 및 총회 의결 관련 공개 질의'},
  {id:19, x:749,  y:426,  w:382,  h:254,  title:'명수대 아파트 4층', desc:''},
  {id:20, x:4108, y:2170, w:277,  h:181,  title:'', desc:'명수대 아파트 옥상의 항아리와 장독대들'},
  {id:21, x:1252, y:1883, w:322,  h:481,  title:'옥상에 빨래', desc:''},
  {id:22, x:3811, y:2352, w:469,  h:308,  title:'공사안내판', desc:''},
  {id:23, x:4460, y:26,   w:338,  h:395,  title:'세로', desc:''},
  {id:24, x:4312, y:420,  w:350,  h:230,  title:'흑석빗물펌프장', desc:'흑석동은 지대가 낮아 비가 오면 자주 잠겼었다'},
  {id:25, x:749,  y:2759, w:220,  h:149,  title:'시계와 의자', desc:''},
  {id:26, x:749,  y:2525, w:356,  h:239,  title:'장판 고정', desc:''},
  {id:27, x:3594, y:2659, w:433,  h:290,  title:'명수대 아파트', desc:'층마다 의자들이 있어 계단을 오르다 쉴 수 있다'},
  {id:28, x:538,  y:2267, w:218,  h:318,  title:'명수대 아파트 2층', desc:''},
  {id:29, x:462,  y:614,  w:286,  h:187,  title:'명수대 아파트', desc:'복도 한 켠의 정원,\n의자가 있어 편히 구경할 수 있다'},
  {id:30, x:2611, y:2448, w:287,  h:194,  title:'안전제일', desc:''},
  {id:31, x:3203, y:0,    w:514,  h:768,  title:'명수대 아파트', desc:'층마다 의자들이 있어 계단을 오르다 쉴 수 있다. 이 층은 두 명이 나란히 쉴 수 있다'},
  {id:32, x:3841, y:1238, w:265,  h:401,  title:'나란히나란히', desc:''},
  {id:33, x:4312, y:1556, w:487,  h:331,  title:'깃발', desc:'도로가 들어설 곳을 깃발로 표시해두었다'},
  {id:34, x:3595, y:1841, w:444,  h:298,  title:'시계', desc:''},
  {id:35, x:2615, y:1115, w:1103, h:734,  title:'판', desc:''},
  {id:36, x:1661, y:628,  w:419,  h:281,  title:'', desc:'물병들이 엮여서'},
  {id:37, x:2396, y:2720, w:416,  h:278,  title:'', desc:'가림판 위에 표시해둔 숫자들'},
  {id:38, x:1096, y:802,  w:402,  h:604,  title:'명수대 아파트 옥상의 실내자전거', desc:''},
  {id:39, x:3995, y:60,   w:248,  h:370,  title:'중정과 복도', desc:''},
];

/* ── 클릭 영역 레이어: 3×3 복제로 무한 루프 ── */
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

      // 실제 이미지는 #layer-elements의 elements.png에서 보여주고,
      // 이 div는 팝업을 띄우기 위한 투명 클릭 영역만 담당한다.
      layerMid.appendChild(el);
    });
  }
}


/* ── 오른쪽 위의 작은 돌 전용 이동 영역 ──
   이전 버전은 돌 주변 좌표가 너무 작게 잡혀서 클릭이 빗나갈 수 있었다.
   이번에는 elements.png 원본 좌표 기준으로 돌이 있는 작은 사진 전체를 넓게 잡고,
   아래에서 TILE 크기에 맞춰 자동 변환한다. */
const SOURCE_W = 2000;
const SOURCE_H = 1250;
const SRC_TO_TILE_X = TILE_W / SOURCE_W;
const SRC_TO_TILE_Y = TILE_H / SOURCE_H;

function srcRect(x, y, w, h) {
  return {
    x: x * SRC_TO_TILE_X,
    y: y * SRC_TO_TILE_Y,
    w: w * SRC_TO_TILE_X,
    h: h * SRC_TO_TILE_Y
  };
}

// elements.png 원본 기준 좌표.
// 왼쪽 중하단 사진 안의 두 돌 전체를 넉넉하게 포함한다.
// 특히 사용자가 말한 오른쪽 위 돌을 놓치지 않도록 실제 돌보다 훨씬 크게 잡았다.
const PRINT_TRIGGER_SOURCE_RECTS = [
  { x: 0, y: 790, w: 280, h: 240 }
];

const PRINT_TRIGGER_RECTS = PRINT_TRIGGER_SOURCE_RECTS.map(r => srcRect(r.x, r.y, r.w, r.h));

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const offsetX = col * TILE_W;
    const offsetY = row * TILE_H;

    PRINT_TRIGGER_RECTS.forEach(r => {
      const trigger = document.createElement('div');
      trigger.className = 'piece print-trigger';
      trigger.style.left = (offsetX + r.x) + 'px';
      trigger.style.top = (offsetY + r.y) + 'px';
      trigger.style.width = r.w + 'px';
      trigger.style.height = r.h + 'px';
      trigger.dataset.printTrigger = 'true';
      layerMid.appendChild(trigger);
    });
  }
}

/* ── 레이어별 이동 속도 ──
   배경은 멀리 있는 레이어처럼 천천히,
   요소 PNG는 앞에 있는 레이어처럼 더 빠르게 움직이게 해서 공간감을 만든다.
   숫자 차이를 키울수록 깊이감이 강해진다. */
const BG_SPEED       = 0.32;  // 배경: 느리게
const ELEMENT_SPEED  = 0.82;  // 요소 PNG: 빠르게
const CLICK_SPEED    = ELEMENT_SPEED; // 클릭 영역은 요소 PNG와 반드시 같은 속도

let x = 0, y = 0;
let velX = 0, velY = 0;
let rafId = null;
let hintHidden = false;

function wrap(val, size) {
  return ((val % size) + size) % size - size;
}

function applyParallax() {
  const bgX = wrap(x * BG_SPEED, TILE_W);
  const bgY = wrap(y * BG_SPEED, TILE_H);

  const elX = wrap(x * ELEMENT_SPEED, TILE_W);
  const elY = wrap(y * ELEMENT_SPEED, TILE_H);

  const clickX = wrap(x * CLICK_SPEED, TILE_W);
  const clickY = wrap(y * CLICK_SPEED, TILE_H);

  layerBg.style.transform       = `translate(${bgX}px, ${bgY}px)`;
  layerElements.style.transform = `translate(${elX}px, ${elY}px)`;
  layerMid.style.transform      = `translate(${clickX}px, ${clickY}px)`;
}

function currentClickOffset() {
  return {
    x: wrap(x * CLICK_SPEED, TILE_W),
    y: wrap(y * CLICK_SPEED, TILE_H)
  };
}

function mod(val, size) {
  return ((val % size) + size) % size;
}

function pointHitsPrintStone(clientX, clientY) {
  const offset = currentClickOffset();

  // 화면 좌표를 현재 움직인 elements.png 원본 좌표로 되돌려 계산한다.
  // 이 방식은 투명 div가 클릭되지 않아도, 실제 화면에서 돌 위치를 누르면 감지된다.
  const tileX = mod(clientX - offset.x, TILE_W);
  const tileY = mod(clientY - offset.y, TILE_H);
  const sourceX = tileX / SRC_TO_TILE_X;
  const sourceY = tileY / SRC_TO_TILE_Y;

  return PRINT_TRIGGER_SOURCE_RECTS.some(r => (
    sourceX >= r.x &&
    sourceX <= r.x + r.w &&
    sourceY >= r.y &&
    sourceY <= r.y + r.h
  ));
}

function isPrintStoneEvent(e) {
  return Boolean(e.target.closest('.print-trigger')) || pointHitsPrintStone(e.clientX, e.clientY);
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

/* ── 오른쪽 위의 작은 돌 길게 누르기 → print.html 이동 ──
   짧게 눌러도 글자가 뜨지 않고, 길게 누르면 현재 위치를 저장한 뒤
   가림막이 덮인 print 화면으로 넘어간다. */
const LONG_PRESS_MS = 850;
const LONG_PRESS_MOVE_LIMIT = 14;
let longPressTimer = null;
let longPressStartX = 0;
let longPressStartY = 0;
let longPressTarget = null;
let suppressNextClick = false;

function clearLongPress() {
  if (longPressTimer) clearTimeout(longPressTimer);
  longPressTimer = null;
  longPressTarget = null;
}

let isOpeningPrint = false;

function openPrintPage() {
  if (isOpeningPrint) return;
  isOpeningPrint = true;

  const panelIds = ['a', 'b', 'c', 'd'];
  const pickedPanels = shuffle(panelIds).slice(0, 2);

  try {
    sessionStorage.setItem('hanPrintView', JSON.stringify({
      x,
      y,
      bgSpeed: BG_SPEED,
      elementSpeed: ELEMENT_SPEED,
      panels: pickedPanels
    }));
  } catch (err) {
    // 저장이 막혀도 print.html 이동 자체는 되도록 둔다.
  }

  window.location.assign('print.html');
}

function beginPrintLongPress(clientX, clientY, target) {
  clearLongPress();
  longPressTarget = target || null;
  longPressStartX = clientX;
  longPressStartY = clientY;

  longPressTimer = setTimeout(() => {
    suppressNextClick = true;
    clearLongPress();
    openPrintPage();
  }, LONG_PRESS_MS);
}

document.addEventListener('pointerdown', e => {
  if (!isPrintStoneEvent(e)) return;
  e.preventDefault();
  e.stopPropagation();
  beginPrintLongPress(e.clientX, e.clientY, e.target);
}, { passive: false, capture: true });

// Safari/iOS에서 pointer 이벤트가 불안정할 때를 위한 터치 보강.
document.addEventListener('touchstart', e => {
  const t = e.touches && e.touches[0];
  if (!t || !pointHitsPrintStone(t.clientX, t.clientY)) return;
  e.preventDefault();
  e.stopPropagation();
  beginPrintLongPress(t.clientX, t.clientY, e.target);
}, { passive: false, capture: true });

// 마우스 환경에서 pointer 이벤트가 안 잡히는 경우를 위한 보강.
document.addEventListener('mousedown', e => {
  if (!isPrintStoneEvent(e)) return;
  e.preventDefault();
  e.stopPropagation();
  beginPrintLongPress(e.clientX, e.clientY, e.target);
}, true);

document.addEventListener('pointermove', e => {
  if (!longPressTimer) return;
  const dx = e.clientX - longPressStartX;
  const dy = e.clientY - longPressStartY;
  if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_LIMIT) clearLongPress();
}, { passive: true });

document.addEventListener('pointerup', clearLongPress, { passive: true });
document.addEventListener('pointercancel', clearLongPress, { passive: true });

// 돌은 길게 눌러도, 짧게 클릭해도 print.html로 넘어가게 한다.
// 투명 div 클릭이 빗나가도 화면 좌표를 다시 계산해서 감지한다.
document.addEventListener('click', e => {
  if (suppressNextClick) {
    e.preventDefault();
    e.stopImmediatePropagation();
    suppressNextClick = false;
    return;
  }

  if (isPrintStoneEvent(e)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    clearLongPress();
    openPrintPage();
  }
}, true);

// 돌을 길게 누를 때 브라우저 기본 메뉴가 뜨지 않도록 막음
document.addEventListener('contextmenu', e => {
  if (isPrintStoneEvent(e)) e.preventDefault();
});


/* ── 팝업 시스템 ──
   현재 버전에서는 화면 위 글자가 뜨지 않도록 비활성화했다. */
const ENABLE_POPUPS = false;
const clickState = new Map();  // id → 'title' | 'desc'
const piecePopup = new Map();  // id → 현재 띄워진 popup 엘리먼트

document.addEventListener('click', e => {
  if (!ENABLE_POPUPS) return;
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
/* ── 판 시스템 ── */
const panels = [
  document.getElementById('panel-a'),
  document.getElementById('panel-b'),
  document.getElementById('panel-c'),
  document.getElementById('panel-d'),
];

const BG_IMAGE_SRC = 'images/bg/사문디_배경.jpg';
const ELEMENT_IMAGE_SRC = 'images/elements.png';

const PANEL_IMAGE_SRC = {
  a: 'images/가림막1.png',
  b: 'images/가림막2.png',
  c: 'images/가림막3.png',
  d: 'images/가림막4.png'
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const assetImages = {
  bg: null,
  elements: null,
  panels: {}
};

const assetsReady = Promise.all([
  loadImage(BG_IMAGE_SRC).then(img => {
    assetImages.bg = img;
  }),
  loadImage(ELEMENT_IMAGE_SRC).then(img => {
    assetImages.elements = img;
  }),
  ...Object.entries(PANEL_IMAGE_SRC).map(([id, src]) =>
    loadImage(src).then(img => {
      assetImages.panels[id] = img;
    })
  )
]).catch(err => {
  console.warn('asset preload failed', err);
});

function shuffle(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

const PANEL_INTERVAL_MS = 60000;
const PANEL_VISIBLE_MS = 10000;

const CAPTURE_STORE_KEY = 'hanPanelCaptures';
const CAPTURE_PRINT_TRANSFER_KEY = 'hanPanelCapturesForPrint';
const MAX_CAPTURE_COUNT = 12;

let panelHideTimer = null;
let isRoutingToPrint = false;
let memoryCaptures = [];

function getPanelId(panel) {
  return panel.id.replace('panel-', '');
}

function clearPanels() {
  panels.forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('active-for-print');
  });

  document.body.classList.remove('panel-printing');
}

function readStoredCaptures() {
  if (memoryCaptures.length) return [...memoryCaptures];

  const stores = [sessionStorage, localStorage];

  for (const store of stores) {
    try {
      const parsed = JSON.parse(store.getItem(CAPTURE_STORE_KEY) || '[]');

      if (Array.isArray(parsed) && parsed.length) {
        memoryCaptures = parsed;
        return parsed;
      }
    } catch (err) {}
  }

  return [];
}

function writeStoredCaptures(captures) {
  memoryCaptures = [...captures];
  const data = JSON.stringify(captures);

  try {
    sessionStorage.setItem(CAPTURE_STORE_KEY, data);
  } catch (err) {}

  try {
    localStorage.setItem(CAPTURE_STORE_KEY, data);
  } catch (err) {}
}

function hasStoredCaptures() {
  return readStoredCaptures().length > 0;
}

function drawTiledLayer(ctx, img, offsetX, offsetY) {
  if (!img) return;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const drawX = offsetX + col * TILE_W;
      const drawY = offsetY + row * TILE_H;

      ctx.drawImage(img, drawX, drawY, TILE_W, TILE_H);
    }
  }
}

async function captureCurrentPanelScene(picked) {
  await assetsReady;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1200, Math.round(viewportW * dpr));
  canvas.height = Math.max(850, Math.round(viewportH * dpr));

  const ctx = canvas.getContext('2d', { alpha: false });

  ctx.scale(canvas.width / viewportW, canvas.height / viewportH);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, viewportW, viewportH);

  const bgX = wrap(x * BG_SPEED, TILE_W);
  const bgY = wrap(y * BG_SPEED, TILE_H);

  const elX = wrap(x * ELEMENT_SPEED, TILE_W);
  const elY = wrap(y * ELEMENT_SPEED, TILE_H);

  // 1. 배경 캡처
  drawTiledLayer(ctx, assetImages.bg, bgX, bgY);

  // 2. 요소 PNG 캡처
  drawTiledLayer(ctx, assetImages.elements, elX, elY);

  // 3. 가림막 캡처
  picked.forEach(panel => {
    const panelId = getPanelId(panel);
    const panelImg = assetImages.panels[panelId];

    if (panelImg) {
      ctx.drawImage(panelImg, 0, 0, viewportW, viewportH);
    }
  });

  return canvas.toDataURL('image/jpeg', 0.9);
}

async function savePanelCapture(picked) {
  const captures = readStoredCaptures();

  try {
    const imageDataUrl = await captureCurrentPanelScene(picked);

    captures.push({
      imageDataUrl,
      createdAt: Date.now()
    });

    writeStoredCaptures(captures.slice(-MAX_CAPTURE_COUNT));
  } catch (err) {
    console.warn('capture save failed', err);
  }
}

function routeToPrintBeforeLeaving(afterUrl) {
  const captures = readStoredCaptures();

  if (!captures.length) {
    window.location.href = afterUrl;
    return;
  }

  isRoutingToPrint = true;

  try {
    sessionStorage.setItem(CAPTURE_PRINT_TRANSFER_KEY, JSON.stringify(captures));
  } catch (err) {}

  try {
    localStorage.setItem(CAPTURE_PRINT_TRANSFER_KEY, JSON.stringify(captures));
  } catch (err) {}

  const params = new URLSearchParams();
  params.set('after', afterUrl);

  window.location.href = 'print.html?' + params.toString();
}

function showPanels() {
  clearTimeout(panelHideTimer);
  clearPanels();

  const picked = shuffle(panels).slice(0, 2);

  picked.forEach(panel => {
    panel.style.display = 'block';
    panel.classList.add('active-for-print');
  });

  document.body.classList.add('panel-printing');

  // 가림막이 실제로 화면에 뜬 직후, 그 상태를 캡처한다.
  requestAnimationFrame(() => {
    setTimeout(() => {
      savePanelCapture(picked);
    }, 80);
  });

  panelHideTimer = setTimeout(() => {
    clearPanels();
  }, PANEL_VISIBLE_MS);
}

window.addEventListener('beforeunload', e => {
  if (isRoutingToPrint || !hasStoredCaptures()) return;

  e.preventDefault();
  e.returnValue = '';
});

setInterval(showPanels, PANEL_INTERVAL_MS);

window.routeToPrintBeforeLeaving = routeToPrintBeforeLeaving;

const homeButtonForPrint = document.getElementById('home-btn');

if (homeButtonForPrint) {
  homeButtonForPrint.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();

    routeToPrintBeforeLeaving('index.html');
  }, true);
}
