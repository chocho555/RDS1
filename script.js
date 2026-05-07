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
const flipCard = document.querySelector(".flip-card");

let index = 0;

setInterval(() => {
  index = (index + 1) % images.length;
  slitImage.src = images[index];
}, 1000);

/* 스크롤: 틈 가까워지는 효과 */
window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = Math.min(window.scrollY / maxScroll, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  const heightProgress = Math.min(eased * 1.8, 1);
  const slitHeight = 120 + (window.innerHeight - 120) * heightProgress;

  const widthProgress = Math.max((eased - 0.25) / 0.75, 0);
  const widthEased = widthProgress * widthProgress * (3 - 2 * widthProgress);
  const slitWidth = 6 + (window.innerWidth * 0.09 - 6) * widthEased;

  const imageScale = 1 + eased * 0.7;

  slitWrapper.style.width = `${slitWidth}px`;
  slitWrapper.style.height = `${slitHeight}px`;

  slitImage.style.transform =
    `translate(-50%, -50%) scale(${imageScale})`;

  leftPanel.style.transform =
    `translateX(-${slitWidth / 2}px)`;

  rightPanel.style.transform =
    `translateX(${slitWidth / 2}px)`;
});

/* 마우스 드래그: 화면 뒤집기 */
let mouseStartX = 0;
let isDragging = false;

window.addEventListener("mousedown", (e) => {
  mouseStartX = e.clientX;
  isDragging = true;
});

window.addEventListener("mouseup", (e) => {
  if (!isDragging) return;

  const mouseEndX = e.clientX;
  const diff = mouseEndX - mouseStartX;

  if (Math.abs(diff) > 80) {
    flipCard.classList.toggle("is-flipped");
  }

  isDragging = false;
});
