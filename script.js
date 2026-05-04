const frame = document.querySelector('.frame');
const image = document.querySelector('#scrollImage');

const images = [
  './images/img1.jpg',
  './images/img2.jpg',
  './images/img3.jpg',
  './images/img4.jpg'
];

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = scrollY / maxScroll;

  // 이미지가 가까워지는 느낌
  const scale = 1 + progress * 45;
  frame.style.transform = `scale(${scale})`;

  // 스크롤에 따라 이미지 변경
  const imageIndex = Math.min(
    images.length - 1,
    Math.floor(progress * images.length)
  );

  image.src = images[imageIndex];
});
