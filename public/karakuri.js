// Karakuri draw. Outcome comes from the independent uniform draw in app.js.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
export function makeKarakuriRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const first=[winner,...others.slice(0,Math.max(0,Math.ceil(count/2)-1))];
 const shuffled=first.filter(n=>n!==winner);for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const final=[winner,...shuffled.slice(0,Math.max(0,Math.ceil(first.length/2)-1))];
 const members=Array.from({length:count},(_,i)=>i+1).map((n,i)=>({n,stage:final.includes(n)?2:first.includes(n)?1:0,phase:rnd()*6.28,jitter:rnd(),speed:.7+rnd()*.65,slot:i}));
 return {count,winner,members,first,final,seed};
}
function ball(c,x,y,r,n,selected=false){
 c.save();c.translate(x,y);
 c.shadowColor='#091924';c.shadowBlur=6;c.shadowOffsetY=3;
 let g=c.createRadialGradient(-r*.35,-r*.42,r*.12,0,0,r);
 g.addColorStop(0,selected?'#fff2c4':'#ecf7f5');g.addColorStop(.48,selected?'#f1cb77':'#a8d5d6');g.addColorStop(1,selected?'#a76b36':'#4b798d');
 c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.shadowColor='transparent';
 c.fillStyle='#183448';c.textAlign='center';c.textBaseline='middle';c.font='900 '+Math.max(8,Math.round(r*(n>9?1.05:1.3)))+'px Arial';
 c.fillText(String(n),0,1);c.restore();
}
export function drawKarakuri(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const W=600,H=490,p=clamp(elapsed/duration),done=p>=1;
 c.clearRect(0,0,W,H);let bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#193345');bg.addColorStop(1,'#0e2136');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.strokeStyle='#557485';c.lineWidth=3;c.strokeRect(13,13,574,464);
 c.fillStyle='#e7dcc2';c.textAlign='center';c.font='bold 19px Arial';c.fillText('巨大からくり抽選',300,36);
 // Mechanical modules: always visible so the route is understandable.
 c.fillStyle='#284c5b';c.fillRect(28,53,544,79);
 c.strokeStyle='#97b7c0';c.lineWidth=3;c.strokeRect(28,53,544,79);
 c.fillStyle='#aec3c5';c.font='bold 13px Arial';c.fillText('全番号タンク',300,72);
 c.strokeStyle='#b7c6c5';c.lineWidth=10;c.lineCap='round';
 c.beginPath();c.moveTo(300,133);c.lineTo(300,151);c.lineTo(80,151);c.lineTo(80,210);c.lineTo(517,210);c.stroke();
 c.beginPath();c.moveTo(517,210);c.lineTo(517,256);c.lineTo(88,256);c.lineTo(88,318);c.lineTo(510,318);c.stroke();
 c.beginPath();c.moveTo(510,318);c.lineTo(510,363);c.lineTo(93,363);c.lineTo(93,427);c.lineTo(492,427);c.stroke();
 c.lineWidth=3;c.strokeStyle='#547384';c.setLineDash([7,10]);c.beginPath();c.moveTo(80,210);c.lineTo(517,210);c.moveTo(88,318);c.lineTo(510,318);c.moveTo(93,427);c.lineTo(492,427);c.stroke();c.setLineDash([]);
 // Rotating gear / wobbling bridge, always moderate contrast.
 c.save();c.translate(300,207);c.rotate(reduced?0:p*4.5);
 c.fillStyle='#b6c6cb';for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.fillRect(-6,-27,12,12);c.restore();}
 c.beginPath();c.arc(0,0,19,0,Math.PI*2);c.fill();c.fillStyle='#3b6071';c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(305,318);c.rotate(reduced?0:Math.sin(p*19)*.045);c.fillStyle='#c7ad79';c.fillRect(-110,-6,220,12);c.restore();
 c.fillStyle='#d1bb8e';c.font='bold 13px Arial';c.fillText('① 歯車ゲート',135,190);c.fillText('② 揺れる橋',145,295);
 c.fillText('決勝・逆転レール',300,396);c.fillText('GOAL',516,453);
 if(!round)return;

 const n=round.count;
 // One continuous track: no global stage clock or waiting at bends.
 const track=[[300,133],[300,151],[80,151],[80,210],[517,210],[517,256],[88,256],[88,318],[510,318],[510,363],[93,363],[93,427],[492,427]];
 const lengths=[];let total=0;
 for(let i=1;i<track.length;i++){const d=Math.hypot(track[i][0]-track[i-1][0],track[i][1]-track[i-1][1]);lengths.push(d);total+=d;}
 // Gate positions are physical locations on the uninterrupted track.
 const firstGate=(lengths.slice(0,3).reduce((a,b)=>a+b,0)+220)/total;
 const secondGate=lengths.slice(0,8).reduce((a,b)=>a+b,0)/total;
 const pointAt=u=>{
  let remaining=clamp(u)*total;
  for(let j=0;j<lengths.length;j++){
   if(remaining<=lengths[j]||j===lengths.length-1){
    const t=clamp(remaining/lengths[j]);
    return {x:mix(track[j][0],track[j+1][0],t),y:mix(track[j][1],track[j+1][1],t)};
   }
   remaining-=lengths[j];
  }
  return {x:300,y:133};
 };
 // Per-ball progress is independent. Faster balls pass each corner immediately.
 // Elimination happens when that ball reaches its gate, never by a group-wide switch.
 let visible=0;
 for(const b of round.members){
  const launch=b.slot/Math.max(n,1)*.055;
  const clock=clamp((p-launch)/(1-launch));
  let distance=clock*(1.02+(b.speed-1)*.31);
  // A small reversible wobble can create overtakes without leaving the rail.
  distance+=.011*Math.sin(clock*15+b.phase)*Math.sin(Math.PI*clock);
  if(b.n===round.winner){
   // Remain an underdog until the last stretch, then accelerate into the goal.
   distance=distance*.93+.14*smooth((clock-.79)/.21);
  } else if(b.stage===2) {
   // Finalists slow near the last bend, but never stop for other balls.
   distance-=.16*smooth((clock-.7)/.3)*(1-b.jitter*.35);
  }
  distance=clamp(distance);
  if(b.stage===0&&distance>=firstGate){
   // Rejected balls fly away from the gear in different arcs, then fade.
   const flight=(distance-firstGate)*total/420;
   if(!done&&flight<1.15&&!reduced){
    const angle=-Math.PI*.94+b.jitter*Math.PI*.92;
    const power=65+58*b.speed;
    const x=300+Math.cos(angle)*power*flight;
    const y=210+Math.sin(angle)*power*flight+125*flight*flight;
    const r=n>60?7:n>30?9:12;
    c.save();c.globalAlpha=clamp((1.15-flight)/.35);ball(c,x,y,r,b.n);c.restore();
   }
   continue;
  }
  if(b.stage===1&&distance>=secondGate)continue;
  if(done&&b.n!==round.winner)continue;
  visible++;
  const pt=pointAt(done&&b.n===round.winner?1:distance);
  const r=distance<firstGate?(n>60?7:n>30?9:12)
   :distance<secondGate?(round.first.length>30?10:13)
   :distance<.83?(round.final.length>20?14:19)
   :(round.final.length>20?15:round.final.length>10?19:24);
  ball(c,pt.x,pt.y,done?30:r,b.n,done);
 }
 c.textAlign='right';c.fillStyle='#f0d69e';c.font='bold 17px Arial';c.fillText('残り '+visible+' 個',559,76);
 if(done){c.fillStyle='#f5dfa1';c.textAlign='center';c.font='bold 22px Arial';c.fillText(round.winner+' 番がゴール！',300,465);}
 else{c.textAlign='left';c.fillStyle='#d8e6e6';c.font='13px Arial';c.fillText('先頭は待たずに進む！',33,467);}

}
