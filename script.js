const frame = document.querySelector('.frame');
const image = document.querySelector('#scrollImage');

const images = [
  './JPG/img1.JPG',
  './JPG/img2.JPG',
  './JPG/img3.JPG',
  './JPG/img4.JPG'
];

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = scrollY / maxScroll;

  const scale = 1 + progress * 45;
  frame.style.transform = `scale(${scale})`;

  const imageIndex = Math.min(
    images.length - 1,
    Math.floor(progress * images.length)
  );

  image.src = images[imageIndex];
});
if (progress > 0.05) {
  frame.classList.add('active');
} else {
  frame.classList.remove('active');
}
