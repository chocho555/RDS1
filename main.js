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
