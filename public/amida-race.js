// Simultaneous 40-player amidakuji. Every runner follows real rungs.
const C=['#f5d179','#86d7f2','#f3a2bb','#99dda8','#c4a2f1'];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export function makeAmidaRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const boards=[],members=[];
 for(let base=0;base<count;base+=20){
  const n=Math.min(20,count-base),levels=14;
  const rungs=Array.from({length:levels},()=>[]);
  for(let level=0;level<levels;level++){
   for(let x=0;x<n-1;x++)if(rand()<.36){rungs[level].push(x);x++;}
  }
  const finish=[];
  for(let lane=0;lane<n;lane++){
   let x=lane;const route=[x];
   for(let level=0;level<levels;level++){const links=rungs[level];if(links.includes(x))x++;else if(links.includes(x-1))x--;route.push(x);}
   finish.push(x);members.push({n:base+lane+1,board:boards.length,route,start:lane,exit:x});
  }
  boards.push({base,n,rungs,finish});
 }
 const chosen=members.find(x=>x.n===winner);
 return {count,winner,boards,members,chosen,seconds:13};
}
export function drawAmida(canvas,round,elapsed=0,duration=13000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const sec=clamp(elapsed/1000,0,13),progress=clamp(sec/11.5);
 c.fillStyle='#09152b';c.fillRect(0,0,600,480);
 c.textAlign='center';c.fillStyle='#fae6ac';c.font='bold 21px Arial';c.fillText('一斉あみだくじ！',300,26);
 if(!round)return;
 for(let bi=0;bi<round.boards.length;bi++){
  const b=round.boards[bi],top=bi===0?65:267,left=46,width=508,dx=width/Math.max(19,b.n-1),dy=10.7;
  c.fillStyle='#dfeafa';c.font='bold 12px Arial';c.fillText('第'+(bi+1)+'グループ',300,top-26);
  for(let x=0;x<b.n;x++){const px=left+dx*x;c.strokeStyle='#476ea1';c.lineWidth=1.3;c.beginPath();c.moveTo(px,top);c.lineTo(px,top+14*dy);c.stroke();}
  for(let row=0;row<14;row++)for(const x of b.rungs[row]){c.strokeStyle='#f1c46e';c.lineWidth=2.8;c.beginPath();c.moveTo(left+dx*x,top+(row+.5)*dy);c.lineTo(left+dx*(x+1),top+(row+.5)*dy);c.stroke();}
  for(let lane=0;lane<b.n;lane++){
   const id=b.base+lane+1,m=round.members[id-1];
   const path=clamp(progress*14,0,14),j=Math.min(13,Math.floor(path)),u=path-j;
   const a=m.route[j],next=m.route[j+1];
   const x=left+dx*(a+(next-a)*clamp((u-.18)/.64)),y=top+(j+u)*dy;
   if(progress>=1&&id!==round.winner){c.globalAlpha=.35;}
   c.fillStyle=id===round.winner?'#ffe78e':C[id%5];c.beginPath();c.arc(x,y,9.5,0,Math.PI*2);c.fill();
   c.fillStyle='#0e213b';c.font='900 10px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(id,x,y);c.globalAlpha=1;
   if(progress<.10){c.fillStyle='#e8eff9';c.font='bold 10px Arial';c.fillText(id,left+dx*lane,top-9);}
  }
  if(progress>=1){const selected=round.chosen;if(selected.board===bi){
   const x=left+dx*selected.exit,y=top+14*dy;c.strokeStyle='#ffe68b';c.lineWidth=3;c.beginPath();c.arc(x,y,14,0,7);c.stroke();
  }}
 }
 c.fillStyle='#fce3a0';c.font='bold 18px Arial';c.textBaseline='alphabetic';c.fillText(progress>=1?round.winner+'番が当たり！':'全員が横線をたどって進む！',300,462);
}
export function playAmidaBeat(ctx,master,step){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.005,melody=[76,79,83,81,79,76,74,72,74,77,81,79,76,72,79,83];
 function tone(n,dt,len,type,vol){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=440*2**((n-69)/12);g.gain.setValueAtTime(.0001,now+dt);g.gain.exponentialRampToValueAtTime(vol,now+dt+.007);g.gain.exponentialRampToValueAtTime(.0001,now+dt+len);o.connect(g);g.connect(master);o.start(now+dt);o.stop(now+dt+len+.012);o.onended=()=>{o.disconnect();g.disconnect();};}
 tone(melody[step%16],0,.11,'square',.13);
 if(step%2===0)tone([48,53,55,50][Math.floor(step/2)%4],0,.18,'triangle',.17);
 if(step%4===3)tone(91,0,.04,'sine',.065);
}
