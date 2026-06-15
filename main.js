(() => {
  "use strict";

  const CANVAS = { w: 2000, h: 1250 };
  const TILES = [
    { id:"01", x:113,  y:96,   w:242, h:161 }, { id:"02", x:803,  y:343,  w:150, h:224 },
    { id:"03", x:355,  y:177,  w:250, h:166 }, { id:"04", x:803,  y:567,  w:213, h:142 },
    { id:"05", x:8,    y:257,  w:347, h:232 }, { id:"06", x:-16,  y:974,  w:426, h:286 },
    { id:"07", x:1595, y:983,  w:179, h:267 }, { id:"08", x:0,    y:827,  w:221, h:147 },
    { id:"09", x:355,  y:59,   w:177, h:118 }, { id:"10", x:1213, y:22,   w:289, h:193 },
    { id:"11", x:387,  y:431,  w:416, h:278 }, { id:"12", x:1774, y:827,  w:226, h:340 },
    { id:"13", x:1502, y:145,  w:339, h:225 }, { id:"14", x:1402, y:370,  w:201, h:134 },
    { id:"15", x:803,  y:69,   w:412, h:274 }, { id:"16", x:551,  y:712,  w:252, h:377 },
    { id:"17", x:1091, y:1094, w:234, h:156 }, { id:"18", x:953,  y:950,  w:216, h:144 },
  ];

  const BG_PARALLAX = 0.34;        // 배경 시차(작을수록 멀고 느림)
  const BG_TILE = { w:1700, h:1063 };
  const DRIFT = { x:0.22, y:0.085 }; // 자동 흐름 속도
  const INERTIA_DECAY = 0.93;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = document.getElementById("stage");
  const bg    = document.getElementById("bg");
  const world = document.getElementById("world");

  let offX = 0, offY = 0, velX = 0, velY = 0;
  let dragging = false, lastX = 0, lastY = 0, lastDX = 0, lastDY = 0;
  let scale = 1, CW = CANVAS.w, CH = CANVAS.h, cols = 0, rows = 0;

  function computeScale() {
    scale = Math.max(0.5, Math.min(0.92, Math.min(innerWidth, innerHeight) / 900));
    CW = CANVAS.w * scale; CH = CANVAS.h * scale;
  }

  function buildCell(cx, cy) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.style.width = CW + "px"; cell.style.height = CH + "px";
    cell.style.transform = `translate3d(${cx*CW}px, ${cy*CH}px, 0)`;
    for (const t of TILES) {
      const img = document.createElement("img");
      img.className = "tile"; img.src = `img/${t.id}.webp`; img.alt = "";
      img.decoding = "async"; img.draggable = false;
      img.style.left = (t.x*scale)+"px"; img.style.top = (t.y*scale)+"px";
      img.style.width = (t.w*scale)+"px"; img.style.height = (t.h*scale)+"px";
      if (!reduceMotion) {
        img.style.setProperty("--dur",   (9+Math.random()*8).toFixed(2)+"s");
        img.style.setProperty("--delay", (-Math.random()*12).toFixed(2)+"s");
        img.style.setProperty("--ax",    (4+Math.random()*7).toFixed(1)+"px");
        img.style.setProperty("--ay",    (3+Math.random()*6).toFixed(1)+"px");
        img.style.setProperty("--ar",    (0.2+Math.random()*0.7).toFixed(2)+"deg");
      }
      cell.appendChild(img);
    }
    return cell;
  }

  function buildGrid() {
    world.innerHTML = "";
    cols = Math.ceil(innerWidth / CW) + 1;
    rows = Math.ceil(innerHeight / CH) + 1;
    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) frag.appendChild(buildCell(c, r));
    world.appendChild(frag);
  }

  function rebuild() {
    computeScale();
    bg.style.backgroundSize = `${BG_TILE.w}px ${BG_TILE.h}px`;
    buildGrid();
  }

  function frame() {
    if (!dragging) {
      offX += DRIFT.x + velX; offY += DRIFT.y + velY;
      velX *= INERTIA_DECAY; velY *= INERTIA_DECAY;
      if (Math.abs(velX) < 0.01) velX = 0;
      if (Math.abs(velY) < 0.01) velY = 0;
    }
    bg.style.backgroundPosition = `${(-offX*BG_PARALLAX).toFixed(2)}px ${(-offY*BG_PARALLAX).toFixed(2)}px`;
    let mx = (-offX) % CW; if (mx > 0) mx -= CW;
    let my = (-offY) % CH; if (my > 0) my -= CH;
    world.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
    requestAnimationFrame(frame);
  }

  function point(e){ return e.touches&&e.touches[0] ? {x:e.touches[0].clientX,y:e.touches[0].clientY} : {x:e.clientX,y:e.clientY}; }
  function onDown(e){
    dragging = true; stage.classList.add("dragging");
    const p = point(e); lastX = p.x; lastY = p.y; lastDX = 0; lastDY = 0; velX = velY = 0;
    if (e.pointerId != null && stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch(_){} }
  }
  function onMove(e){
    if (!dragging) return;
    const p = point(e); const dx = p.x-lastX, dy = p.y-lastY;
    lastX = p.x; lastY = p.y; lastDX = dx; lastDY = dy;
    offX -= dx; offY -= dy;
    if (Math.abs(dx)+Math.abs(dy) > 2) dismissHint();
  }
  function onUp(){ if (!dragging) return; dragging = false; stage.classList.remove("dragging"); velX = -lastDX*0.9; velY = -lastDY*0.9; }
  function onWheel(e){ e.preventDefault(); offX += e.deltaX*0.85; offY += e.deltaY*0.85; dismissHint(); }

  if (window.PointerEvent) {
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive:true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  } else {
    stage.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    stage.addEventListener("touchstart", onDown, { passive:true });
    window.addEventListener("touchmove", onMove, { passive:true });
    window.addEventListener("touchend", onUp);
  }
  stage.addEventListener("wheel", onWheel, { passive:false });
  window.addEventListener("keydown", (e) => {
    const s = 90;
    if (e.key==="ArrowLeft"){offX-=s;dismissHint();} else if (e.key==="ArrowRight"){offX+=s;dismissHint();}
    else if (e.key==="ArrowUp"){offY-=s;dismissHint();} else if (e.key==="ArrowDown"){offY+=s;dismissHint();}
  });

  const hint = document.getElementById("hint");
  let hintGone = false;
  function dismissHint(){ if (hintGone) return; hintGone = true; hint.classList.add("gone"); }
  setTimeout(dismissHint, 6000);

  const panel = document.getElementById("info-panel");
  document.getElementById("info-btn").addEventListener("click", () => panel.hidden = !panel.hidden);
  panel.querySelector(".close").addEventListener("click", () => panel.hidden = true);
  window.addEventListener("keydown", (e) => { if (e.key==="Escape") panel.hidden = true; });

  let rT; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(rebuild, 180); });

  const loader = document.getElementById("loader");
  function preload(){
    const srcs = ["img/bg.webp", ...TILES.map(t => `img/${t.id}.webp`)];
    return Promise.all(srcs.map(src => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = src; })));
  }

  rebuild();
  preload().then(() => { loader.classList.add("done"); setTimeout(() => loader.remove(), 650); });
  requestAnimationFrame(frame);
})();
