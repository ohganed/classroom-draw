// Rube Goldberg marble machine: static mechanism and deterministic, gentle animation.
// Winner is independently sampled by app.js, not determined by the path.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const path=[[68,65],[145,115],[225,119],[260,164],[330,213],[405,211],[473,267],[399,311],[309,340],[250,379],[520,384]];
export const MACHINE_EVENTS=[
 {t:.13,type:'roll'}, {t:.29,type:'bounce'}, {t:.44,type:'gear'},
 {t:.59,type:'seesaw'}, {t:.75,type:'spring'}, {t:.90,type:'gate'}
];
export function makeMachineRound(count,winner,seed){
 let s=(seed>>>0)||1;
 const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const pool=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const survivors=[winner,...pool.slice(0,Math.max(0,Math.round(count/4)-1))];
 const survivorSet=new Set(survivors);
 return {winner,count,seed,bounce:rand()*.7+.4,gear:rand()*6.28,branch:rand()>.5,survivors,survivorSet};
}
export function drawMachine(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const p=clamp(elapsed/duration,0,1),done=p===1;
 c.clearRect(0,0,600,460);
 c.fillStyle='#182b3f';c.fillRect(14,10,572,438);
 // Rails and platforms. No flashing, abrupt color changes, or camera shaking.
 c.lineCap='round';c.lineJoin='round';
 c.strokeStyle='#aec1cc';c.lineWidth=7;c.beginPath();
 c.moveTo(52,83);c.lineTo(203,136);c.lineTo(246,136);c.lineTo(314,235);c.lineTo(407,235);
 c.moveTo(455,284);c.lineTo(394,326);c.lineTo(304,362);c.lineTo(245,398);c.lineTo(537,398);c.stroke();
 c.strokeStyle='#607b8e';c.lineWidth=3;c.stroke();
 // Gear at (340,218)
 const turn=round&&!reduced?round.gear+p*2.2:0;
 c.save();c.translate(338,218);c.rotate(turn);
 c.strokeStyle='#95b8ae';c.lineWidth=8;
 for(let i=0;i<10;i++){const a=i*Math.PI/5;c.beginPath();c.moveTo(Math.cos(a)*24,Math.sin(a)*24);c.lineTo(Math.cos(a)*35,Math.sin(a)*35);c.stroke();}
 c.beginPath();c.arc(0,0,25,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fillStyle='#d2dfdd';c.fill();c.restore();
 // Seesaw: hinge anchored to its center
 const angle=round&&!reduced?.13*Math.sin(p*19):0;
 c.save();c.translate(411,272);c.rotate(angle);
 c.strokeStyle='#d9b88c';c.lineWidth=8;c.beginPath();c.moveTo(-57,0);c.lineTo(57,0);c.stroke();c.restore();
 c.fillStyle='#a2b2c2';c.beginPath();c.moveTo(410,273);c.lineTo(396,293);c.lineTo(425,293);c.fill();
 // Spring launcher
 c.strokeStyle='#98b4c7';c.lineWidth=3;c.beginPath();for(let i=0;i<9;i++)c.lineTo(473+(i%2?12:-12),303+i*7);c.stroke();
 // Three possible exits appear open until the final approach.
 c.strokeStyle='#6b88a0';c.lineWidth=3;
 for(let j=0;j<3;j++){c.strokeRect(466+j*32,331,24,23);}
 // Final numbered gate
 c.fillStyle='#344c64';c.fillRect(488,347,73,74);c.strokeStyle='#c5d3dd';c.lineWidth=2;c.strokeRect(488,347,73,74);
 c.fillStyle='#e8d3a5';c.textAlign='center';c.textBaseline='middle';c.font='bold 13px Arial';c.fillText('GOAL',525,365);
 // Variable progress: fast runs, a near-stop, a short reversal and a last burst.
 // The ball still reaches the exact same gate at p=1.
 const keys=[[0,0],[.18,.19],[.31,.32],[.40,.35],[.49,.48],
 [.60,.59],[.68,.54],[.79,.75],[.88,.78],[.94,.9],[1,1]];
 const shape=(t)=>{
  let j=0;while(j<keys.length-2&&t>keys[j+1][0])j++;
  const a=keys[j],b=keys[j+1],v=ease((t-a[0])/(b[0]-a[0]));
  return a[1]+(b[1]-a[1])*v;
 };
 const travel=round&&!reduced?shape(p):p;
 // All numbered balls are visible from the beginning; no anonymous substitute.
 // We show the complete population inside a numbered staging chamber.
 const n=round?.count??40;
 const cols=n>72?11:n>42?10:8,rows=Math.ceil(n/cols);
 const spacingX=470/cols,spacingY=127/rows;
 const radius=clamp(Math.min(spacingX*.34,spacingY*.38),5.5,11);
 c.fillStyle='#233c50';c.fillRect(52,46,500,146);
 c.strokeStyle='#8ca8b8';c.lineWidth=2;c.strokeRect(52,46,500,146);
 c.fillStyle='#e6d3a6';c.font='bold 12px Arial';c.textAlign='left';c.fillText('参加する玉：'+n+' 個（全番号表示）',60,59);
 // All balls roll towards the gear; roughly 3/4 are thrown aside at contact.
 // Number and trajectory remain linked throughout. The predetermined unbiased
 // winner belongs to a randomly populated surviving quarter.
 const survivors=round?.survivors??[],survivorSet=round?.survivorSet??new Set();
 const losers=Array.from({length:n},(_,i)=>i+1).filter(k=>!survivorSet.has(k));
 c.fillStyle='#294557';c.fillRect(35,395,223,40);c.fillRect(272,395,198,40);
 c.strokeStyle='#8da5b4';c.lineWidth=2;c.strokeRect(35,395,223,40);c.strokeRect(272,395,198,40);
 c.fillStyle='#d9e3ea';c.font='bold 11px Arial';c.textAlign='center';c.fillText('歯車で脱落',145,389);c.fillText('通過した玉',367,389);
 const point=(t)=>{
  const z=clamp(t,0,1)*(path.length-1),i=Math.min(path.length-2,Math.floor(z)),u=ease(z-i);
  return [path[i][0]+(path[i+1][0]-path[i][0])*u,path[i][1]+(path[i+1][1]-path[i][1])*u];
 };
 for(let k=1;k<=n;k++){
  const index=k-1,col=index%cols,row=Math.floor(index/cols);
  const homeX=65+(col+.5)*spacingX,homeY=64+(row+.5)*spacingY;
  let bx=homeX,by=homeY;
  if(round&&!reduced){
   const start=.035+((k*13)%17)*.005;
   const gearTime=.34+((k*7)%17)*.008;
   const approach=clamp((p-start)/(gearTime-start),0,1);
   const gearPoint=point(.46);
   const entry=point(.46*approach);
   const departBlend=ease(approach*5);
   bx=homeX+(entry[0]-homeX)*departBlend;
   by=homeY+(entry[1]-homeY)*departBlend;
   if(p>gearTime){
    const t=clamp((p-gearTime)/(1-gearTime),0,1);
    if(!survivorSet.has(k)){
     // Clear sideways kick at the gear, followed by a fall into the exit tray.
     const rank=losers.indexOf(k);
     const lane=(rank%2===0?-1:1);
     const kick=ease(clamp(t/.23,0,1));
     const trayX=45+(rank%16)*12.5,trayY=407+Math.floor(rank/16)*11;
     const settle=ease((t-.22)/.48);
     bx=gearPoint[0]+lane*(38+rank%5*9)*kick;
     by=gearPoint[1]-(25+rank%4*8)*Math.sin(Math.PI*clamp(t/.6,0,1))+90*kick;
     bx+=(trayX-bx)*settle;by+=(trayY-by)*settle;
    }else{
     // Survivors pass the gear and race onward. The others park before
     // the final gate, leaving the chosen ball to finish at the deadline.
     const isWinner=k===round.winner;
     const run=ease(t),q=.46+.54*(isWinner?run:Math.min(.85,run*.96));
     const target=point(q);
     bx=gearPoint[0]+(target[0]-gearPoint[0])*ease(t*5);
     by=gearPoint[1]+(target[1]-gearPoint[1])*ease(t*5);
     if(!isWinner){
      const rank=survivors.filter(v=>v!==round.winner).indexOf(k);
      const settle=ease((t-.75)/.25);
      const tx=285+(rank%12)*14,ty=407+Math.floor(rank/12)*12;
      bx+=(tx-bx)*settle;by+=(ty-by)*settle;
     }
    }
   }
  }
  if(k===round?.winner&&done){bx=525;by=391;}
  c.beginPath();c.arc(bx,by,radius,0,Math.PI*2);
  c.fillStyle=k===round?.winner&&done?'#e9c985':'#b7ccdc';c.fill();
  c.strokeStyle='#e8f0f5';c.lineWidth=1;c.stroke();
  c.fillStyle='#172e40';c.textAlign='center';c.textBaseline='middle';
  c.font='bold '+(radius<7?8:radius<9?9:11)+'px Arial';
  c.fillText(String(k),bx,by+.4);
 }
 c.fillStyle='#e5d1a0';c.textAlign='center';c.font='bold 14px Arial';
 if(round&&!done&&p>.38)c.fillText(p<.63?'歯車で次々とはじかれる！':'残った '+survivors.length+' 個がゴールを目指す',310,79);

 if(done&&round){c.fillStyle='#efd49c';c.font='bold 19px Arial';c.textAlign='center';c.fillText(round.winner+' 番に決定！',300,438);}
 else{c.fillStyle='#d9e3ea';c.font='bold 16px Arial';c.textAlign='center';c.fillText('巨大からくり装置',300,28);}

}
