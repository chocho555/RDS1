/* =====================================================
   print.js
   - main.html에서 저장한 실제 캡처 이미지들을
     A4 landscape 전체에 가로로 꽉 차게 배치한다.
   ===================================================== */

let pagesRoot = document.getElementById('print-pages');

if (!pagesRoot) {
  pagesRoot = document.createElement('main');
  pagesRoot.id = 'print-pages';
  document.body.appendChild(pagesRoot);
}

const CAPTURE_STORE_KEY = 'hanPanelCaptures';
const CAPTURE_PRINT_TRANSFER_KEY = 'hanPanelCapturesForPrint';

function getAfterUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('after') || 'index.html';
}

function readCaptures() {
  const keys = [
    CAPTURE_PRINT_TRANSFER_KEY,
    CAPTURE_STORE_KEY
  ];

  const stores = [
    sessionStorage,
    localStorage
  ];

  for (const key of keys) {
    for (const store of stores) {
      try {
        const parsed = JSON.parse(store.getItem(key) || '[]');

        if (Array.isArray(parsed) && parsed.length) {
          return parsed;
        }
      } catch (err) {}
    }
  }

  return [];
}

function createPage(capture, index) {
  const page = document.createElement('section');
  page.className = 'print-page';

  const frame = document.createElement('div');
  frame.className = 'print-frame';

  const img = document.createElement('img');
  img.className = 'print-capture';
  img.alt = `captured panel scene ${index + 1}`;
  img.src = capture.imageDataUrl || '';

  frame.appendChild(img);
  page.appendChild(frame);

  return page;
}

function clearSavedCaptures() {
  try {
    localStorage.removeItem(CAPTURE_STORE_KEY);
  } catch (err) {}

  try {
    localStorage.removeItem(CAPTURE_PRINT_TRANSFER_KEY);
  } catch (err) {}

  try {
    sessionStorage.removeItem(CAPTURE_STORE_KEY);
  } catch (err) {}

  try {
    sessionStorage.removeItem(CAPTURE_PRINT_TRANSFER_KEY);
  } catch (err) {}

  try {
    sessionStorage.removeItem('hanPrintView');
  } catch (err) {}
}

const captures = readCaptures().filter(item => {
  return item && item.imageDataUrl;
});

if (captures.length) {
  captures.forEach((capture, index) => {
    pagesRoot.appendChild(createPage(capture, index));
  });
} else {
  const empty = document.createElement('section');
  empty.className = 'print-page print-empty';

  empty.innerHTML = `
    <div class="print-empty-message">
      No captured panel scenes.
    </div>
  `;

  pagesRoot.appendChild(empty);
}

window.addEventListener('load', () => {
  document.body.classList.add('ready');

  setTimeout(() => {
    window.print();
  }, 400);
});

window.addEventListener('afterprint', () => {
  clearSavedCaptures();

  const afterUrl = getAfterUrl();

  setTimeout(() => {
    window.location.href = afterUrl;
  }, 250);
});
