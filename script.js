const columns = document.querySelectorAll('.column');

// 사용할 이미지 리스트 (JPG 폴더 기준)
const images = [
  'JPG/img1.jpg',
  'JPG/img2.jpg',
  'JPG/img3.jpg',
  'JPG/img4.jpg',
  'JPG/img5.jpg',
  'JPG/img6.jpg'
];

// 각 칸마다 랜덤 이미지 여러 개 넣기
columns.forEach(column => {
  for (let i = 0; i < 5; i++) { // 칸당 이미지 개수
    const randomIndex = Math.floor(Math.random() * images.length);

    const box = document.createElement('div');
    box.classList.add('img-box');

    const img = document.createElement('img');
    img.src = images[randomIndex];

    box.appendChild(img);
    column.appendChild(box);
  }
});
