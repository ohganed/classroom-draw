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
 return {winner,count,seed,bounce:rand()*.7+.4,gear:rand()*6.28,branch:rand()>.5,hesitation:rand()*.04,reverse:rand()*.08};
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
 // Numbered entrants circulate gently in the chamber, including the eventual winner.
 // After the mid-point, other balls remain visible in the collecting bays.
 const active=ease((p-.12)/.67);
 // Visible collection tray; non-selected balls also travel and settle here.
 c.fillStyle='#294557';c.fillRect(46,397,424,38);
 c.strokeStyle='#8da5b4';c.lineWidth=2;c.strokeRect(46,397,424,38);
 for(let k=1;k<=n;k++){
  const index=k-1,col=index%cols,row=Math.floor(index/cols);
  const homeX=65+(col+.5)*spacingX,homeY=64+(row+.5)*spacingY;
  const offset=round&&!reduced?Math.sin(p*19+k*2.3)*Math.min(3.5,radius*.36)*Math.sin(Math.PI*clamp(p/.75,0,1)):0;
  let bx=homeX+offset,by=homeY;
  const isWinner=k===round?.winner;
  const depart=isWinner?.11:.04+((k*17)%13)*.008;
  const exit=isWinner?1:.60+((k*7)%19)*.009;
  const phase=clamp((p-depart)/Math.max(.1,exit-depart),0,1);
  if(phase>0){
   // Every ball follows the same visible machinery at its own speed.
   // Losing balls roll into the lower collection tray, rather than disappearing.
   const moving=isWinner?travel:phase*.86;
   const q=clamp(moving*(path.length-1),0,path.length-1);
   const j=Math.min(path.length-2,Math.floor(q)),u=ease(q-j);
   let tx=path[j][0]+(path[j+1][0]-path[j][0])*u;
   let ty=path[j][1]+(path[j+1][1]-path[j][1])*u;
   if(!isWinner){
    const slot=k-(k>round.winner?1:0)-1;
    const trayX=58+(slot%Math.min(n,33))*12;
    const trayY=410+Math.floor(slot/33)*13;
    const settle=ease((phase-.76)/.24);
    tx=tx+(trayX-tx)*settle;
    ty=ty+(trayY-ty)*settle;
   }
   const blend=ease(phase*8);
   bx=homeX+(tx-homeX)*blend;
   by=homeY+(ty-homeY)*blend;
  }
  if(isWinner&&done){bx=525;by=391;}

  c.beginPath();c.arc(bx,by,radius,0,Math.PI*2);
  c.fillStyle=k===round?.winner&&done?'#e9c985':'#b7ccdc';c.fill();
  c.strokeStyle='#e8f0f5';c.lineWidth=1;c.stroke();
  c.fillStyle='#172e40';c.textAlign='center';c.textBaseline='middle';
  c.font='bold '+(radius<7?8:radius<9?9:11)+'px Arial';
  c.fillText(String(k),bx,by+.4);
 }
 if(done&&round){c.fillStyle='#efd49c';c.font='bold 19px Arial';c.textAlign='center';c.fillText(round.winner+' 番に決定！',300,438);}
 else{c.fillStyle='#d9e3ea';c.font='bold 16px Arial';c.textAlign='center';c.fillText('巨大からくり装置',300,28);}

}
