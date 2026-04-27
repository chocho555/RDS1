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

    box.style.marginTop = `${80 + Math.random() * 300}px`;
    box.style.marginBottom = `${80 + Math.random() * 200}px`;

    const img = document.createElement('img');
    img.src = images[imgIndex % images.length];
    img.alt = `image ${imgIndex + 1}`;

    box.appendChild(img);
    column.appendChild(box);

    imgIndex++;
  }
});
