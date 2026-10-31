import { drawRaceCamera, raceProgress } from './race-camera.js';
import { drawRaceLeaderboard } from './race-leaderboard.js?v=61';
// Low-flash dramatic race: several apparent leaders, late comeback by the uniformly selected winner.
// Animation is illustrative; the app selects the winner independently with crypto randomness.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function ballBurstIds(count,winner){
 const candidate=winner??1,burstCount=Math.min(count-1,Math.round(count*2/3)),ids=[];
 for(let k=0;k<burstCount;k++){
  let n=1+((candidate*13+k*17+7)%count);
  while(n===candidate||ids.includes(n))n=n%count+1;
  ids.push(n);
 }
 return ids;
}
export const ballBurstAt=n=>.17+.65*((n*37%89)/89);
export function drawBallRace(canvas,count=40,elapsed=0,duration=8000,winner=null,reduced=false,story='comeback'){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const W=600,H=450;ctx.clearRect(0,0,W,H);
 const p=raceProgress(elapsed,duration),end=winner!==null&&p>=1;
 const top=42,bottom=405,lh=(bottom-top)/count,finish=535,start=62,travel=finish-start-11;
 ctx.fillStyle='#102338';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#173c53';ctx.fillRect(40,top-14,finish-22,bottom-top+30);
 for(let j=0;j<8;j++){ctx.strokeStyle=j%2?'#20647a':'#25526d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(45,top+j*52);ctx.lineTo(finish+14,top+j*52);ctx.stroke();}
 ctx.fillStyle='#63d3d0';ctx.font='bold 15px Arial';ctx.textAlign='left';ctx.fillText('● BALL ARENA',47,23);
 ctx.strokeStyle='#317189';ctx.lineWidth=1;
 for(let i=0;i<=count;i++){let y=top+i*lh;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(finish+16,y);ctx.stroke();}
 ctx.fillStyle='#36d8ca';ctx.fillRect(finish,top-14,4,bottom-top+30);
 ctx.fillStyle='#a9f9fa';ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.fillText('GOAL',finish-22,23);
 const candidate=winner??1,positions=[];
 const burstIds=ballBurstIds(count,candidate),burstAt=ballBurstAt;
 // Scenario is chosen once per draw; deterministic rendering prevents flicker.
 const rivalA=(candidate%count)+1,rivalB=((candidate+Math.floor(count/2))%count)+1;
 for(let i=0;i<count;i++){
  const n=i+1,y=top+(i+.5)*lh;
  const base=smooth(p);
  const wiggle=(1-p)*Math.sin(p*9+i*1.9)*.006;
  let fraction;
  if(story==='front'){
   // Winner takes an early lead and holds it; competitors stay comfortably behind.
   fraction=n===candidate ? smooth(Math.min(1,p*1.12)) : base*(.70+.15*((i*7)%11)/10);
  }else if(story==='close'){
   // Near photo finish: several contenders remain close until the final moments.
   const near=n===rivalA||n===rivalB;
   fraction=n===candidate ? base : near ? base*(.985-.025*smooth((p-.86)/.14)) : base*(.75+.18*((i*7)%11)/10);
  }else{
   // Comeback: two decoys lead early; winner passes smoothly late in the race.
   const early=.41*smooth(p/.36), middle=.33*smooth((p-.30)/.36),late=.26*smooth((p-.64)/.36);
   const track=early+middle+late;
   if(n===candidate) fraction=track-.085*smooth(p/.26)+.085*smooth((p-.64)/.36);
   else if(n===rivalA) fraction=track+.115*smooth(p/.25)-.24*smooth((p-.58)/.42);
   else if(n===rivalB) fraction=track+.16*smooth((p-.23)/.28)-.33*smooth((p-.63)/.37);
   else fraction=track*(.76+.17*((i*7)%11)/10);
  }
  fraction+=wiggle;
  // Only the pre-selected winner crosses the line.
  fraction=Math.max(0,Math.min(n===candidate?1:.975,fraction));
  if(end&&n===candidate)fraction=1;
  if(reduced&&!end)fraction=0;
  const x=start+travel*fraction;const r=Math.max(1.5,Math.min(9,lh*.43));
  const burst=burstIds.includes(n),at=burstAt(n),gone=burst&&p>=at;
  if(!gone)positions.push({n,x,y});
  if(gone){
   if(!reduced&&p<at+.12){
    const f=Math.min(1,(p-at)/.12),radius=(11+f*27)*(count>60?.65:1);
    ctx.strokeStyle='rgba(250,205,88,'+(0.8*(1-f))+')';
    ctx.lineWidth=Math.max(.5,3*(1-f));ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.stroke();
    for(let j=0;j<15;j++){
     const a=j*Math.PI*2/15+n*.7,dist=radius*(.75+(j%3)*.2);
     ctx.fillStyle=['#fce686','#42e0e6','#ff8b9a','#f9ae55'][j%4];
     ctx.beginPath();ctx.arc(x+Math.cos(a)*dist,y+Math.sin(a)*dist*.72,Math.max(.6,(3.8+j%3)*(1-f)),0,Math.PI*2);ctx.fill();
    }
   }
   ctx.fillStyle='#b3dce8';ctx.font='bold '+(count>50?7:10)+'px Arial';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(String(n),35,y);continue;
  }
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=end&&n===candidate?'#d7bf82':i%2?'#8498ad':'#6e829a';ctx.fill();
  ctx.strokeStyle='#b6c3cf';ctx.lineWidth=.7;ctx.stroke();
  ctx.fillStyle='#cad6e2';ctx.font='bold '+(count>50?7:10)+'px Arial';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(String(n),35,y);
 }
 if(!reduced&&!end)drawRaceCamera(canvas,positions,p,'ball');
 drawRaceLeaderboard(canvas,positions,end);
 if(end){ctx.fillStyle='#e0c484';ctx.font='bold 25px Arial';ctx.textAlign='center';ctx.fillText(candidate+' 番 ゴール！',W/2,441);}
}
