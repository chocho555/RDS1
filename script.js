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
  const progress = window.scrollY / maxScroll;

  const scale = 1 + progress * 18;

  slitWrapper.style.transform =
    `translate(-50%, -50%) scale(${scale})`;
});
