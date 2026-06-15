(() => {
  "use strict";

  // ▼▼▼ 본인 이미지 파일명을 적으세요 (images/ 폴더에 넣고). 개수는 자유 ▼▼▼
  const IMAGES = [
    "images/01.jpg", "images/02.jpg", "images/03.jpg",
    "images/04.jpg", "images/05.jpg", "images/06.jpg",
    // ... 원하는 만큼 추가
  ];
  // 무한 배경으로 깔 이미지 1장 (안 쓰려면 "" 로 비워두세요)
  const BG_IMAGE = "images/01.jpg";
  // ▲▲▲ 여기까지만 바꾸면 됩니다 ▲▲▲

  const BG_PARALLAX = 0.34;          // 배경 시차(작을수록 멀고 느림)
  const DRIFT = { x:0.22, y:0.085 }; // 가만히 둘 때 자동 흐름 속도
  const INERTIA_DECAY = 0.93;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = document.getElementById("stage");
  const bg    = document.getElementById("bg");
  const world = document.getElementById("world");

  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
    let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296; }; }

  function computeLayout(n){
    const r = rng(20260616);
    const COLS = Math.max(3, Math.min(6, Math.round(Math.sqrt(n*1.6))));
    const rows = Math.ceil(n/COLS);
    const colW = 480, rowH = 360;
    const items = [];
    for (let i=0;i<n;i++){
      const col=i%COLS, row=Math.floor(i/COLS);
      items.push({
        x: col*colW + (r()*90-45),
        y: row*rowH + (r()*90-45),
        w: colW*(0.70+r()*0.36),
        ax:4+r()*7, ay:3+r()*6, ar:0.2+r()*0.7, dur:9+r()*8, delay:-r()*12,
      });
    }
    return { items, CW: COLS*colW, CH: rows*rowH };
  }

  const LAYOUT = computeLayout(IMAGES.length);
  let scale=1, CW=LAYOUT.CW, CH=LAYOUT.CH, cols=0, rows=0;
  let offX=0, offY=0, velX=0, velY=0;
  let dragging=false, lastX=0, lastY=0, lastDX=0, lastDY=0;

  function computeScale(){
    scale = Math.max(0.5, Math.min(0.95, Math.min(innerWidth, innerHeight)/900));
    CW = LAYOUT.CW*scale; CH = LAYOUT.CH*scale;
  }

  function buildCell(cx, cy){
    const cell=document.createElement("div");
    cell.className="cell"; cell.style.width=CW+"px"; cell.style.height=CH+"px";
    cell.style.transform=`translate3d(${cx*CW}px, ${cy*CH}px, 0)`;
    LAYOUT.items.forEach((t,i)=>{
      const img=document.createElement("img");
      img.className="tile"; img.src=IMAGES[i]; img.alt=""; img.decoding="async"; img.draggable=false;
      img.style.left=(t.x*scale)+"px"; img.style.top=(t.y*scale)+"px"; img.style.width=(t.w*scale)+"px";
      if(!reduceMotion){
        img.style.setProperty("--dur",t.dur.toFixed(2)+"s");
        img.style.setProperty("--delay",t.delay.toFixed(2)+"s");
        img.style.setProperty("--ax",t.ax.toFixed(1)+"px");
        img.style.setProperty("--ay",t.ay.toFixed(1)+"px");
        img.style.setProperty("--ar",t.ar.toFixed(2)+"deg");
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

  // 아무 이미지든 캔버스로 2x2 미러 → 이음매 없는 무한 배경 자동 생성
  function makeSeamlessBg(src){
    return new Promise(res=>{
      if(!src){ res(null); return; }
      const im=new Image();
      im.onload=()=>{
        try{
          const w=im.naturalWidth, h=im.naturalHeight;
          const c=document.createElement("canvas"); c.width=w*2; c.height=h*2;
          const x=c.getContext("2d");
          x.drawImage(im,0,0);
          x.save(); x.translate(w*2,0);  x.scale(-1, 1); x.drawImage(im,0,0); x.restore();
          x.save(); x.translate(0,h*2);  x.scale( 1,-1); x.drawImage(im,0,0); x.restore();
          x.save(); x.translate(w*2,h*2);x.scale(-1,-1); x.drawImage(im,0,0); x.restore();
          res({ url:c.toDataURL("image/jpeg",0.82), w:w*2, h:h*2 });
        }catch(e){ res({ url:src, w:im.naturalWidth, h:im.naturalHeight }); }
      };
      im.onerror=()=>res(null);
      im.src=src;
    });
  }

  function frame(){
    if(!dragging){
      offX+=DRIFT.x+velX; offY+=DRIFT.y+velY;
      velX*=INERTIA_DECAY; velY*=INERTIA_DECAY;
      if(Math.abs(velX)<0.01) velX=0; if(Math.abs(velY)<0.01) velY=0;
    }
    bg.style.backgroundPosition=`${(-offX*BG_PARALLAX).toFixed(2)}px ${(-offY*BG_PARALLAX).toFixed(2)}px`;
    let mx=(-offX)%CW; if(mx>0) mx-=CW;
    let my=(-offY)%CH; if(my>0) my-=CH;
    world.style.transform=`translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
    requestAnimationFrame(frame);
  }

  function point(e){ return e.touches&&e.touches[0]?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; }
  function onDown(e){ dragging=true; stage.classList.add("dragging");
    const p=point(e); lastX=p.x; lastY=p.y; lastDX=0; lastDY=0; velX=velY=0;
    if(e.pointerId!=null&&stage.setPointerCapture){ try{stage.setPointerCapture(e.pointerId);}catch(_){} } }
  function onMove(e){ if(!dragging) return;
    const p=point(e); const dx=p.x-lastX, dy=p.y-lastY; lastX=p.x; lastY=p.y; lastDX=dx; lastDY=dy;
    offX-=dx; offY-=dy; if(Math.abs(dx)+Math.abs(dy)>2) dismissHint(); }
  function onUp(){ if(!dragging) return; dragging=false; stage.classList.remove("dragging"); velX=-lastDX*0.9; velY=-lastDY*0.9; }
  function onWheel(e){ e.preventDefault(); offX+=e.deltaX*0.85; offY+=e.deltaY*0.85; dismissHint(); }

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
  window.addEventListener("keydown",(e)=>{ const s=90;
    if(e.key==="ArrowLeft"){offX-=s;dismissHint();} else if(e.key==="ArrowRight"){offX+=s;dismissHint();}
    else if(e.key==="ArrowUp"){offY-=s;dismissHint();} else if(e.key==="ArrowDown"){offY+=s;dismissHint();} });

  const hint=document.getElementById("hint"); let hintGone=false;
  function dismissHint(){ if(hintGone||!hint) return; hintGone=true; hint.classList.add("gone"); }
  setTimeout(dismissHint,6000);

  const panel=document.getElementById("info-panel"); const infoBtn=document.getElementById("info-btn");
  if(infoBtn&&panel){ infoBtn.addEventListener("click",()=>panel.hidden=!panel.hidden);
    panel.querySelector(".close").addEventListener("click",()=>panel.hidden=true);
    window.addEventListener("keydown",(e)=>{ if(e.key==="Escape") panel.hidden=true; }); }

  let rT; window.addEventListener("resize",()=>{ clearTimeout(rT); rT=setTimeout(rebuild,180); });

  const loader=document.getElementById("loader");
  function preload(){ return Promise.all(IMAGES.map(src=>new Promise(res=>{ const im=new Image(); im.onload=im.onerror=res; im.src=src; }))); }

  rebuild();
  makeSeamlessBg(BG_IMAGE).then(t=>{
    if(t){ bg.style.backgroundImage=`url("${t.url}")`;
      bg.style.backgroundSize=`${Math.round(t.w*0.7)}px ${Math.round(t.h*0.7)}px`; }
  });
  preload().then(()=>{ if(loader){ loader.classList.add("done"); setTimeout(()=>loader.remove(),650); } });
  requestAnimationFrame(frame);
})();
