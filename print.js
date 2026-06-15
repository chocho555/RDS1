/* =====================================================
   print.js
   - main.html에서 가림막이 뜰 때마다 저장한 장면들을
     A4 landscape 페이지로 다시 구성한 뒤 한 번에 인쇄한다.
   ===================================================== */

const pagesRoot = document.getElementById('print-pages');

const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;
const TILE_H = IMG_H * SCALE;
const CAPTURE_STORE_KEY = 'hanPanelCaptures';
const CAPTURE_PRINT_TRANSFER_KEY = 'hanPanelCapturesForPrint';

function wrap(val, size) {
  return ((val % size) + size) % size - size;
}

function getAfterUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('after') || '';
}

function decodeCapturesFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const packed = params.get('captures');
  if (!packed) return [];

  try {
    let base64 = packed.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const parsed = JSON.parse(atob(base64));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function readCaptures() {
  const fromUrl = decodeCapturesFromUrl();
  if (fromUrl.length) return fromUrl;

  const keys = [CAPTURE_PRINT_TRANSFER_KEY, CAPTURE_STORE_KEY];
  const stores = [sessionStorage, localStorage];

  for (const key of keys) {
    for (const store of stores) {
      try {
        const parsed = JSON.parse(store.getItem(key) || '[]');
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (err) {}
    }
  }

  // 예전 버전에서 sessionStorage에 저장한 단일 장면도 백업으로 지원한다.
  try {
    const single = JSON.parse(sessionStorage.getItem('hanPrintView') || '{}');
    if (single && typeof single === 'object' && Array.isArray(single.panels)) return [single];
  } catch (err) {}

  return [];
}

function createTileLayer(className, tileClassName, transform) {
  const layer = document.createElement('div');
  layer.className = className;
  layer.style.width = TILE_W * 3 + 'px';
  layer.style.height = TILE_H * 3 + 'px';
  layer.style.transform = transform;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const tile = document.createElement('div');
      tile.className = tileClassName;
      tile.style.width = TILE_W + 'px';
      tile.style.height = TILE_H + 'px';
      tile.style.left = col * TILE_W + 'px';
      tile.style.top = row * TILE_H + 'px';
      layer.appendChild(tile);
    }
  }

  return layer;
}

function createPage(capture) {
  const page = document.createElement('section');
  page.className = 'print-page';

  const x = Number.isFinite(capture.x) ? capture.x : 0;
  const y = Number.isFinite(capture.y) ? capture.y : 0;
  const bgSpeed = Number.isFinite(capture.bgSpeed) ? capture.bgSpeed : 0.32;
  const elementSpeed = Number.isFinite(capture.elementSpeed) ? capture.elementSpeed : 0.82;
  const panelIds = Array.isArray(capture.panels) && capture.panels.length ? capture.panels : ['a', 'c'];

  const bgX = wrap(x * bgSpeed, TILE_W);
  const bgY = wrap(y * bgSpeed, TILE_H);
  const elX = wrap(x * elementSpeed, TILE_W);
  const elY = wrap(y * elementSpeed, TILE_H);

  const bgLayer = createTileLayer('print-layer-bg', 'print-tile', `translate(${bgX}px, ${bgY}px)`);
  const elementLayer = createTileLayer('print-layer-elements', 'print-element-tile', `translate(${elX}px, ${elY}px)`);

  page.appendChild(bgLayer);
  page.appendChild(elementLayer);

  ['a', 'b', 'c', 'd'].forEach(id => {
    const panel = document.createElement('div');
    panel.className = 'print-panel';
    panel.dataset.panel = id;
    if (panelIds.includes(id)) panel.classList.add('active');
    page.appendChild(panel);
  });

  return page;
}

function clearSavedCaptures() {
  try { localStorage.removeItem(CAPTURE_STORE_KEY); } catch (err) {}
  try { localStorage.removeItem(CAPTURE_PRINT_TRANSFER_KEY); } catch (err) {}
  try { sessionStorage.removeItem(CAPTURE_STORE_KEY); } catch (err) {}
  try { sessionStorage.removeItem(CAPTURE_PRINT_TRANSFER_KEY); } catch (err) {}
  try { sessionStorage.removeItem('hanPrintView'); } catch (err) {}
}

const captures = readCaptures();

if (captures.length) {
  captures.forEach(capture => pagesRoot.appendChild(createPage(capture)));
} else {
  // 저장된 장면이 없을 때도 검은 페이지 대신 기본 장면 한 장을 만든다.
  pagesRoot.appendChild(createPage({ x: 0, y: 0, panels: ['a', 'c'] }));
}

window.addEventListener('load', () => {
  document.body.classList.add('ready');

  setTimeout(() => {
    window.print();
  }, 500);
});

window.addEventListener('afterprint', () => {
  clearSavedCaptures();

  const afterUrl = getAfterUrl();
  if (afterUrl) {
    setTimeout(() => {
      window.location.href = afterUrl;
    }, 250);
  }
});
