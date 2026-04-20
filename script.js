const scene = document.getElementById('scene');

const main = document.getElementById('frame-main');
const topFrame = document.getElementById('frame-top');
const bottomFrame = document.getElementById('frame-bottom');

const cutH = document.getElementById('cut-h');
const cutV = document.getElementById('cut-v');

const label1 = document.getElementById('label-1');
const label3 = document.getElementById('label-3');

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function update() {
  const rect = scene.getBoundingClientRect();
  const max = scene.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / max, 0, 1);

  // 메인 이동
  main.style.left = `${5 + progress * 45}vw`;

  // 등장
  topFrame.style.opacity = progress;
  bottomFrame.style.opacity = progress;

  cutH.style.opacity = progress;
  cutV.style.opacity = progress;

  label1.style.opacity = 1 - progress;
  label3.style.opacity = progress;
}

window.addEventListener('scroll', update);
