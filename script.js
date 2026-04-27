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
      // 각 이미지마다 간격 다르게
      if (i === 0) {
        box.style.marginTop = '200px';
        box.style.marginBottom = '120px';
      } else if (i === 1) {
        box.style.marginTop = '350px';
        box.style.marginBottom = '180px';
      } else if (i === 2) {
        box.style.marginTop = '500px';
        box.style.marginBottom = '220px';
      }
    } else {
      // 나머지 칸은 기존 랜덤
      box.style.marginTop = `${80 + Math.random() * 300}px`;
      box.style.marginBottom = `${80 + Math.random() * 200}px`;
    }

    box.appendChild(img);
    column.appendChild(box);
  }
});
