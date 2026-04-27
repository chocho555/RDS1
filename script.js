const columns = document.querySelectorAll('.column');

const images = [
  './JPG/img1.JPG',
  './JPG/img2.JPG',
  './JPG/img3.JPG',
  './JPG/img4.JPG',
  './JPG/img5.JPG',
  './JPG/img6.JPG'
];

const layout = [1, 0, 2, 3, 0, 1];

let imgIndex = 0;

columns.forEach((column, colIndex) => {
  const count = layout[colIndex];

  for (let i = 0; i < count; i++) {
    const box = document.createElement('div');
    box.classList.add('img-box');

    const img = document.createElement('img');
    img.src = images[imgIndex % images.length];
    imgIndex++;

    // 🔥 4번째 칸 (index 3)만 특별하게 처리
    if (colIndex === 3) {
  const basePositions = [180, 520, 900];

  box.style.marginTop = `${basePositions[i] + Math.random() * 80}px`;
  box.style.marginBottom = `${180 + Math.random() * 220}px`;
} else {
  box.style.marginTop = `${80 + Math.random() * 300}px`;
  box.style.marginBottom = `${80 + Math.random() * 200}px`;
}

    box.appendChild(img);
    column.appendChild(box);
  }
});
const preview = document.createElement('img');
preview.classList.add('hover-preview');
document.body.appendChild(preview);

document.querySelectorAll('.img-box img').forEach(img => {
  img.addEventListener('mouseenter', () => {
    preview.src = img.src;
    preview.style.display = 'block';
  });

  img.addEventListener('mousemove', (e) => {
    preview.style.left = `${e.clientX}px`;
    preview.style.top = `${e.clientY}px`;
  });

  img.addEventListener('mouseleave', () => {
    preview.style.display = 'none';
  });
});
