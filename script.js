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
