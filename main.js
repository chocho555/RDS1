(() => {
  "use strict";

  const DIR = "images/조각/";   // 이미지 폴더 경로
  const IMAGES = Array.from({length:18}, (_,i)=>`${DIR}${String(i+1).padStart(3,"0")}.jpg`);
  const BG_IMAGE = `${DIR}001.jpg`;   // 무한히 흐르는 배경 1장

  const CANVAS = { w:2000, h:1250 };  // 좌표 기준 캔버스(원본 PSD 크기)
  // 보내주신 배치 그대로. 옮기려면 x,y,w,h 만 바꾸면 됨 (001~018 순서)
  const POSITIONS = [
    {x:113, y:96,  w:242, h:161}, {x:803, y:343, w:150, h:224},
    {x:355, y:177, w:250, h:166}, {x:803, y:567, w:213, h:142},
    {x:8,   y:257, w:347, h:232}, {x:-16, y:974, w:426, h:286},
    {x:1595,y:983, w:179, h:267}, {x:0,   y:827, w:221, h:147},
    {x:355, y:59,  w:177, h:118}, {x:1213,y:22,  w:289, h:193},
    {x:387, y:431, w:416, h:278}, {x:1774,y:827, w:226, h:340},
    {x:1502,y:145, w:339, h:225}, {x:1402,y:370, w:201, h:134},
    {x:803, y:69,  w:412, h:274}, {x:551, y:712, w:252, h:377},
    {x:1091,y:1094,w:234, h:156}, {x:953, y:950, w:216, h:144},
  ];

  const ZOOM = 2.6;                    // ★ 시야 가까움 (클수록 더 확대 / 멀게는 2.0, 더 가깝게는 3.2)
  const BG_PARALLAX = 0.34;
  const BG_DRIFT = { x:0.18, y:0.07 }; // 배경이 저절로 흐르는 속도
  const INERTIA_DECAY = 0.93;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = document.getElementById("stage");
  const bg    = document.getElementById("bg");
  const world = document.getElementById("world");

  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
    let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296; }; }
  const R = rng(20260616);
  const FLOAT = POSITIONS.map(()=>({ax:4+R()*7,ay:3+R()*6,ar:0.2+R()*0.7,dur:9+R()*8,delay:-R()*12}));

  let scale=1, CW=CANVAS.w, CH=CANVAS.h, cols=0, rows=0;
  let camX=0, camY=0, velX=0, velY=0, bgX=0, bgY=0;
  let dragging=false, lastX=0, lastY=0, lastDX=0, lastDY=0;

  function computeScale(){ scale = ZOOM; CW = CANVAS.w*scale; CH = CANVAS.h*scale; }

  function buildCell(cx, cy){
    const cell=document.createElement("div");
    cell.className="cell"; cell.style.width=CW+"px"; cell.style.height=CH+"px";
    cell.style.transform=`translate3d(${cx*CW}px, ${cy*CH}px, 0)`;
    POSITIONS.forEach((t,i)=>{
      const img=document.createElement("img");
      img.className="tile"; img.src=IMAGES[i]; img.alt=""; img.draggable=false;
      img.style.left=(t.x*scale)+"px"; img.style.top=(t.y*scale)+"px";
      img.style.width=(t.w*scale)+"px"; img.style.height=(t.h*scale)+"px";
      if(!reduceMotion){
        const f=FLOAT[i];
        img.style.setProperty("--dur",f.dur.toFixed(2)+"s");
        img.style.setProperty("--delay",f.delay.toFixed(2)+"s");
        img.style.setProperty("--ax",f.ax.toFixed(1)+"px");
        img.style.setProperty("--ay",f.ay.toFixed(1)+"px");
        img.style.setProperty("--ar",f.ar.toFixed(2)+"deg");
      }
      cell.appendChild(img);
    });
    return cell;
  }
  function buildGrid(){
    world.innerHTML="";
    cols=Math.ceil(innerWidth/CW)+1; rows=Math.ceil(innerHeight/CH)+1;
    const frag=document.createDocumentFragment();
    for(let rr=0;rr<rows;rr++) for(let cc=0;cc<cols;cc++) frag.appendChild(buildCell(cc,rr));
    world.appendChild(frag);
  }
  function rebuild(){ computeScale(); buildGrid(); }

  // 001.jpg 를 캔버스로 2x2 미러 → 이음매 없이 무한 반복되는 배경
  function makeSeamlessBg(src){
    return new Promise(res=>{
      if(!src){ res(null); return; }
      const im=new Image();
      im.onload=()=>{ try{
        const w=im.naturalWidth,h=im.naturalHeight;
        const c=document.createElement("canvas"); c.width=w*2; c.height=h*2;
        const x=c.getContext("2d");
        x.drawImage(im,0,0);
        x.save();x.translate(w*2,0);x.scale(-1,1);x.drawImage(im,0,0);x.restore();
        x.save();x.translate(0,h*2);x.scale(1,-1);x.drawImage(im,0,0);x.restore();
        x.save();x.translate(w*2,h*2);x.scale(-1,-1);x.drawImage(im,0,0);x.restore();
        res({url:c.toDataURL("image/jpeg",0.82),w:w*2,h:h*2});
      }catch(e){ res({url:src,w:im.naturalWidth,h:im.naturalHeight}); } };
      im.onerror=()=>res(null);
      im.src=src;
    });
  }

  function frame(){
    bgX += BG_DRIFT.x; bgY += BG_DRIFT.y;                 // 배경만 계속 무한히 이동
    if(!dragging){ camX+=velX; camY+=velY; velX*=INERTIA_DECAY; velY*=INERTIA_DECAY;
      if(Math.abs(velX)<0.01)velX=0; if(Math.abs(velY)<0.01)velY=0; }
    bg.style.backgroundPosition=`${(-(camX*BG_PARALLAX+bgX)).toFixed(2)}px ${(-(camY*BG_PARALLAX+bgY)).toFixed(2)}px`;
    let mx=(-camX)%CW; if(mx>0)mx-=CW;
    let my=(-camY)%CH; if(my>0)my-=CH;
    world.style.transform=`translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
    requestAnimationFrame(frame);
  }

  function point(e){ return e.touches&&e.touches[0]?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; }
  function onDown(e){ dragging=true; stage.classList.add("dragging");
    const p=point(e); lastX=p.x; lastY=p.y; lastDX=0; lastDY=0; velX=velY=0;
    if(e.pointerId!=null&&stage.setPointerCapture){try{stage.setPointerCapture(e.pointerId);}catch(_){}} }
  function onMove(e){ if(!dragging)return;
    const p=point(e); const dx=p.x-lastX,dy=p.y-lastY; lastX=p.x; lastY=p.y; lastDX=dx; lastDY=dy;
    camX-=dx; camY-=dy; }
  function onUp(){ if(!dragging)return; dragging=false; stage.classList.remove("dragging"); velX=-lastDX*0.9; velY=-lastDY*0.9; }
  function onWheel(e){ e.preventDefault(); camX+=e.deltaX*0.85; camY+=e.deltaY*0.85; }

  if(window.PointerEvent){
    stage.addEventListener("pointerdown",onDown);
    window.addEventListener("pointermove",onMove,{passive:true});
    window.addEventListener("pointerup",onUp); window.addEventListener("pointercancel",onUp);
  }else{
    stage.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp);
    stage.addEventListener("touchstart",onDown,{passive:true});
    window.addEventListener("touchmove",onMove,{passive:true}); window.addEventListener("touchend",onUp);
  }
  stage.addEventListener("wheel",onWheel,{passive:false});

  let rT; window.addEventListener("resize",()=>{clearTimeout(rT);rT=setTimeout(rebuild,180);});

  rebuild();
  makeSeamlessBg(BG_IMAGE).then(t=>{ if(t){ bg.style.backgroundImage=`url("${t.url}")`;
    bg.style.backgroundSize=`${Math.round(t.w*0.7)}px ${Math.round(t.h*0.7)}px`; } });
  requestAnimationFrame(frame);
})();
