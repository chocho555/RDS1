const images = [
  "images/img1.jpg",
  "images/img2.jpg",
  "images/img3.jpg",
  "images/img4.jpg",
  "images/img5.jpg"
];

const bgImage = document.getElementById("bgImage");
const slitImage = document.getElementById("slitImage");
const slitWrapper = document.querySelector(".slit-wrapper");

let index = 0;

setInterval(() => {
  index = (index + 1) % images.length;
  bgImage.src = images[index];
  slitImage.src = images[index];
}, 1000);

window.addEventListener("scroll", () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(window.scrollY / maxScroll, 1);

  const eased = progress * progress * (3 - 2 * progress);

  const minSlitWidth = 6;
  const maxSlitWidth = window.innerWidth * 0.09; // 최대 폭
  const slitWidth = minSlitWidth + (maxSlitWidth - minSlitWidth) * eased;

  const minSlitHeight = 150;
  const maxSlitHeight = window.innerHeight;
  const slitHeight = minSlitHeight + (maxSlitHeight - minSlitHeight) * eased;

  const imageScale = 1 + eased * 0.8;
  const blur = 4 - eased * 4;

  slitWrapper.style.width = `${slitWidth}px`;
  slitWrapper.style.height = `${slitHeight}px`;
  slitWrapper.style.transform = `translate(-50%, -50%) scale(1)`;

  slitImage.style.transform =
    `translate(-50%, -50%) scale(${imageScale})`;

  slitWrapper.style.filter = `blur(${blur}px)`;
});
