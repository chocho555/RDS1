const columns = document.querySelectorAll('.column');

const images = [
  'JPG/img1.jpg',
  'JPG/img2.jpg',
  'JPG/img3.jpg',
  'JPG/img4.jpg',
  'JPG/img5.jpg',
  'JPG/img6.jpg'
];

// 각 칸에 들어갈 이미지 개수
const layout = [1, 0, 2, 3, 0, 1];

let imgIndex = 0;

columns.forEach((column, colIndex) => {
  const count = layout[colIndex];

  for (let i = 0; i < count; i++) {
    const box = document.createElement('div');
    box.classList.add('img-box');

    // 🔥 세로 위치 랜덤 (간격 다양하게)
    box.style.marginTop = `${80 + Math.random() * 300}px`;
    box.style.marginBottom = `${80 + Math.random() * 200}px`;

    const img = document.createElement('img');

    // 이미지 순서대로 사용 (겹치지 않게)
    img.src = images[imgIndex % images.length];
    imgIndex++;

    box.appendChild(img);
    column.appendChild(box);
  }
});
