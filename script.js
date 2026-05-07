const images = [
  "images/img1.jpg",
  "images/img2.jpg",
  "images/img3.jpg",
  "images/img4.jpg",
  "images/img5.jpg"
];

const bgImage = document.getElementById("bgImage");
const slitImage = document.getElementById("slitImage");

let index = 0;

/* 이미지 변경 */

setInterval(() => {

  index = (index + 1) % images.length;

  bgImage.src = images[index];
  slitImage.src = images[index];

}, 1000);


/* 거리감 */

window.addEventListener("scroll", () => {

  const scrollY = window.scrollY;

  /* 틈 넓이 */

  const gap = 6 + scrollY * 0.15;

  document.querySelector(".slit").style.width =
    `${gap}px`;

  /* 틈 높이 */

  const height = 30 + scrollY * 0.08;

  document.querySelector(".slit").style.height =
    `${height}vh`;

  /* 위치 */

  const top = 35 - scrollY * 0.04;

  document.querySelector(".slit").style.top =
    `${top}vh`;

  /* 이미지 확대 */

  const scale = 1 + scrollY * 0.0005;

  slitImage.style.transform =
    `translate(-50%, -50%) scale(${scale})`;

});
