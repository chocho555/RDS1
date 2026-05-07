window.addEventListener("scroll", () => {

  const maxScroll =
    document.body.scrollHeight - window.innerHeight;

  const progress =
    Math.min(window.scrollY / maxScroll, 1);

  const eased =
    1 - Math.pow(1 - progress, 3);

  /* Z축 이동 */

  const zMove =
    -1200 + eased * 1150;

  /* 세로 길이 */

  const height =
    120 + eased * window.innerHeight;

  slitWrapper.style.height =
    `${height}px`;

  slitWrapper.style.transform =
    `
    translate(-50%, -50%)
    translateZ(${zMove}px)
    `;

  /* 이미지 확대 */

  const imageScale =
    1 + eased * 0.5;

  slitImage.style.transform =
    `
    translate(-50%, -50%)
    scale(${imageScale})
    `;
});
