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

  // 확대 정도
  const scale = 1 + progress * 45;
  frame.style.transform = `scale(${scale})`;

  // 어느 정도 확대되면 이미지 보이기
  if (progress > 0.08) {
    frame.classList.add('show-image');
  } else {
    frame.classList.remove('show-image');
  }

  // 스크롤 위치에 따라 이미지 변경
  const imageIndex = Math.min(
    images.length - 1,
    Math.floor(progress * images.length)
  );

  image.src = images[imageIndex];
});
