const frame = document.querySelector('.frame');
const img1 = document.querySelector('#img1');
const img2 = document.querySelector('#img2');

const images = [
  './JPG/img1.JPG',
  './JPG/img2.JPG',
  './JPG/img3.JPG',
  './JPG/img4.JPG',
  './JPG/img5.JPG'
];

let current = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = scrollY / maxScroll;

  // 확대
  const scale = 1 + progress * 45;
  frame.style.transform = `scale(${scale})`;

  // 🔥 이미지 자연스럽게 바꾸기
  const index = Math.floor(progress * images.length);

  if (index !== current) {
    current = index;

    img2.src = images[current % images.length];
    img2.style.opacity = 1;
    img1.style.opacity = 0;

    // swap
    setTimeout(() => {
      img1.src = img2.src;
      img1.style.opacity = 1;
      img2.style.opacity = 0;
    }, 600);
  }
});
