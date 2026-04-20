const layoutSection = document.querySelector(".layout-section");
const hoverPanels = document.querySelectorAll(".hover-panel");

function revealOnScroll() {
  const trigger = window.innerHeight * 0.72;
  const top = layoutSection.getBoundingClientRect().top;

  if (top < trigger) {
    layoutSection.classList.add("active");
  }
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* 타이핑 효과 */
hoverPanels.forEach((panel) => {
  const textBox = panel.querySelector(".panel-text");
  const fullText = panel.dataset.text;
  let typingInterval = null;

  panel.addEventListener("mouseenter", () => {
    clearInterval(typingInterval);
    textBox.textContent = "";

    let i = 0;
    typingInterval = setInterval(() => {
      textBox.textContent += fullText.charAt(i);
      i++;

      if (i >= fullText.length) {
        clearInterval(typingInterval);
      }
    }, 35);
  });

  panel.addEventListener("mouseleave", () => {
    clearInterval(typingInterval);
    textBox.textContent = "";
  });
});
