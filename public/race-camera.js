// Smooth race broadcast camera. Positions are the source of truth; this never changes results.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
// Re-time every racer together: brisk opening, smooth slowdown, unchanged deadline.
export function raceProgress(elapsed,duration){
 const t=Math.max(0,Math.min(1,elapsed/duration));
 if(t<=.4)return 1.2*t;
 if(t>=.6)return 1-.8*(1-t);
 const u=(t-.4)/.2;
 // Integral of speed 1.2 - 0.4 * smoothstep(u).
 return .48+1.2*(t-.4)-.08*(u*u*u-.5*u*u*u*u);
}
export function drawRaceCamera(canvas,positions,progress,kind='ball'){
 if(progress<.60||positions.length===0)return;
 const c=canvas.getContext('2d');
 if(!c)return;
 const ranked=positions.slice().sort((a,b)=>b.x-a.x);
 const frontPack=ranked.slice(0,Math.min(5,ranked.length));
 // Camera subjects are chosen by proximity to the lead, but the visible lanes
 // stay in student-number order. Never make the first row equal first place.
 const leaders=frontPack.slice().sort((a,b)=>a.n-b.n);
 // Select by proximity to the lead, but keep the close-up lanes in bib-number order.
 // Never place the fastest racer in the top lane just because they are leading.
 const displayed=leaders.slice().sort((a,b)=>a.n-b.n);
 const reveal=smooth((progress-.60)/.12),top=68+(1-reveal)*285,h=305;
 const first=frontPack[0].x,third=frontPack[Math.min(2,frontPack.length-1)].x;
 const fifth=frontPack[frontPack.length-1].x;
 // Focus on the actual leading group, not the leading horse fixed to the right edge.
 const mid=(first+third)/2;
 const packSpan=first-fifth;
 const scale=clamp(345/(packSpan+38),1.35,3.25);
 // Keep the goal line in view as it approaches, without shifting the racers artificially.
 const finish=kind==='horse'?541:535;
 const closeGoal=smooth((progress-.82)/.15);
 const center=mid*(1-.25*closeGoal)+(first+finish)/2*(.25*closeGoal);
 const sx=x=>300+(x-center)*scale;
 c.save();
 c.globalAlpha=reveal;
 c.fillStyle='#132338';c.fillRect(44,top,512,h);
 c.strokeStyle='#9aafc2';c.lineWidth=2;c.strokeRect(44,top,512,h);
 c.beginPath();c.rect(46,top+40,508,h-45);c.clip();
 if(sx(finish)>110&&sx(finish)<552){
  c.strokeStyle='#d7c28e';c.lineWidth=3;c.beginPath();c.moveTo(sx(finish),top+41);c.lineTo(sx(finish),top+271);c.stroke();
 }
 const laneH=44;
 for(let i=0;i<displayed.length;i++){
  const e=displayed[i],ly=top+65+i*laneH;
  c.strokeStyle='#42576b';c.lineWidth=1;c.beginPath();c.moveTo(60,ly+20);c.lineTo(542,ly+20);c.stroke();
  c.fillStyle='#dee6ed';c.font='bold 16px Arial';c.textAlign='right';c.textBaseline='middle';c.fillText(String(e.n),90,ly);
  const bx=sx(e.x);
  if(kind==='horse'){
   c.save();c.translate(bx,ly);c.scale(1.5,1.5);
   c.fillStyle=e.n%3===0?'#b8a38c':e.n%3===1?'#91a4b5':'#a7b2b9';
   c.beginPath();c.ellipse(0,0,12,6,0,0,Math.PI*2);c.fill();
   c.beginPath();c.moveTo(6,-3);c.lineTo(11,-13);c.lineTo(17,-10);c.lineTo(15,0);c.closePath();c.fill();
   c.fillRect(-8,4,3,11);c.fillRect(6,4,3,11);
   c.restore();
  }else{
   c.beginPath();c.arc(bx,ly,11,0,Math.PI*2);
   c.fillStyle='#9eb3c5';c.fill();
   c.strokeStyle='#e3eaf0';c.lineWidth=1;c.stroke();
  }
 }
 c.restore();
 c.save();c.globalAlpha=reveal;
 c.fillStyle='#d7c28e';c.font='bold 17px Arial';c.textAlign='left';
 c.fillText(progress>.82?'ゴール前・接戦カメラ':'先頭集団を追跡',63,top+29);
 c.fillStyle='#adbfcd';c.font='12px Arial';
 c.fillText('番号順に表示・横位置は実際の差',64,top+289);
 c.restore();
}
