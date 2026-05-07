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

  const slitScale = 1 + eased * 24;
  const imageScale = 1 + eased * 1.8;
  const panelMove = eased * 48;
  const blur = 6 - eased * 6;

  slitWrapper.style.transform =
    `translate(-50%, -50%) scale(${slitScale})`;

  slitImage.style.transform =
    `translate(-50%, -50%) scale(${imageScale})`;

  document.querySelector(".left").style.transform =
    `translateX(-${panelMove}vw)`;

  document.querySelector(".right").style.transform =
    `translateX(${panelMove}vw)`;

  slitWrapper.style.filter = `blur(${blur}px)`;
});
