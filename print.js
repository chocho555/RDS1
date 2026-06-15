/* =====================================================
   print.js
   - main 화면에서 저장한 위치를 그대로 불러온 뒤,
     그 위에 가림막을 덮은 상태로 print 화면을 만든다.
   ===================================================== */

const printLayerBg = document.getElementById('print-layer-bg');
const printLayerElements = document.getElementById('print-layer-elements');

const IMG_W  = 4000;
const IMG_H  = 2500;
const SCALE  = 1.2;
const TILE_W = IMG_W * SCALE;
const TILE_H = IMG_H * SCALE;

const saved = (() => {
  try {
    return JSON.parse(sessionStorage.getItem('hanPrintView') || '{}');
  } catch (e) {
    return {};
  }
})();

const x = Number.isFinite(saved.x) ? saved.x : 0;
const y = Number.isFinite(saved.y) ? saved.y : 0;
const BG_SPEED = Number.isFinite(saved.bgSpeed) ? saved.bgSpeed : 0.32;
const ELEMENT_SPEED = Number.isFinite(saved.elementSpeed) ? saved.elementSpeed : 0.82;
const panels = Array.isArray(saved.panels) && saved.panels.length ? saved.panels : ['a', 'c'];

[printLayerBg, printLayerElements].forEach(layer => {
  layer.style.width = TILE_W * 3 + 'px';
  layer.style.height = TILE_H * 3 + 'px';
});

document.querySelectorAll('.print-tile').forEach((tile, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  tile.style.width = TILE_W + 'px';
  tile.style.height = TILE_H + 'px';
  tile.style.left = col * TILE_W + 'px';
  tile.style.top = row * TILE_H + 'px';
});

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const tile = document.createElement('div');
    tile.className = 'print-element-tile';
    tile.style.width = TILE_W + 'px';
    tile.style.height = TILE_H + 'px';
    tile.style.left = col * TILE_W + 'px';
    tile.style.top = row * TILE_H + 'px';
    printLayerElements.appendChild(tile);
  }
}

function wrap(val, size) {
  return ((val % size) + size) % size - size;
}

const bgX = wrap(x * BG_SPEED, TILE_W);
const bgY = wrap(y * BG_SPEED, TILE_H);
const elX = wrap(x * ELEMENT_SPEED, TILE_W);
const elY = wrap(y * ELEMENT_SPEED, TILE_H);

printLayerBg.style.transform = `translate(${bgX}px, ${bgY}px)`;
printLayerElements.style.transform = `translate(${elX}px, ${elY}px)`;

panels.forEach(id => {
  const panel = document.querySelector(`.print-panel[data-panel="${id}"]`);
  if (panel) panel.classList.add('active');
});

document.getElementById('print-now').addEventListener('click', () => window.print());
document.getElementById('go-back').addEventListener('click', () => {
  window.location.href = 'main.html';
});

window.addEventListener('load', () => {
  document.body.classList.add('ready');

  // 돌을 길게 누른 뒤 바로 인쇄창이 뜨도록 한다.
  // 브라우저 설정에 따라 자동 인쇄가 막히면 오른쪽 아래 print 버튼을 누르면 된다.
  setTimeout(() => {
    window.print();
  }, 450);
});
