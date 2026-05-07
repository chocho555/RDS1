window.addEventListener("scroll", () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(window.scrollY / maxScroll, 1);

  const eased = 1 - Math.pow(1 - progress, 3);

  const maxScale = 22; 
  const scale = 1 + eased * (maxScale - 1);

  const imageScale = 1 + eased * 0.6;
  const blur = 5 - eased * 5;

  slitWrapper.style.transform =
    `translate(-50%, -50%) scale(${scale})`;

  slitImage.style.transform =
    `translate(-50%, -50%) scale(${imageScale})`;

  slitWrapper.style.filter = `blur(${blur}px)`;
});
