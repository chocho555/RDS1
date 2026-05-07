/* 이미지 전환 */

const images = [
  "images/img1.jpg",
  "images/img2.jpg",
  "images/img3.jpg",
  "images/img4.jpg",
  "images/img5.jpg"
];

const changingImage = document.getElementById("changingImage");

let index = 0;

setInterval(() => {
  index = (index + 1) % images.length;
  changingImage.src = images[index];
}, 1000);


/* Z축 거리감 */

window.addEventListener("scroll", () => {

  const scrollY = window.scrollY;

  /* 틈 확대 */
  const gap = 6 + scrollY * 0.12;

  document.documentElement.style.setProperty(
    "--gap",
    `${gap}px`
  );

  /* 이미지 살짝 확대 */
  const scale = 1 + scrollY * 0.0005;

  changingImage.style.transform =
    `scale(${scale})`;
});
