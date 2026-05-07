window.addEventListener("scroll", () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(window.scrollY / maxScroll, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  const scale = 1 + eased * 18;
  const panelMove = eased * 4.5; // 최대 틈 폭 느낌 조절

  slitWrapper.style.transform =
    `translate(-50%, -50%) scale(${scale})`;

  document.querySelector(".left").style.transform =
    `translateX(-${panelMove}vw)`;

  document.querySelector(".right").style.transform =
    `translateX(${panelMove}vw)`;
});
