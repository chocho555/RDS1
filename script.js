const images = [
  "images/img1.jpg",
  "images/img2.jpg",
  "images/img3.jpg",
  "images/img4.jpg",
  "images/img5.jpg"
];

const slitImage = document.getElementById("slitImage");
const slitWrapper = document.querySelector(".slit-wrapper");
const leftPanel = document.querySelector(".left");
const rightPanel = document.querySelector(".right");

let index = 0;

setInterval(() => {
  index = (index + 1) % images.length;
  slitImage.src = images[index];
}, 1000);

window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = Math.min(window.scrollY / maxScroll, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  const scale = 1 + eased * 18;
  const panelMove = eased * 4.5;
  const imageScale = 1 + eased * 0.6;

  slitWrapper.style.transform =
    `translate(-50%, -50%) scale(${scale})`;

  slitImage.style.transform =
    `translate(-50%, -50%) scale(${imageScale})`;

  leftPanel.style.transform =
    `translateX(-${panelMove}vw)`;

  rightPanel.style.transform =
    `translateX(${panelMove}vw)`;
});
