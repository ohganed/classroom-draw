import { drawRaceCamera } from './race-camera.js';
// Low-flash dramatic race: several apparent leaders, late comeback by the uniformly selected winner.
// Animation is illustrative; the app selects the winner independently with crypto randomness.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function drawBallRace(canvas,count=40,elapsed=0,duration=8000,winner=null,reduced=false,story='comeback'){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const W=600,H=450;ctx.clearRect(0,0,W,H);
 const p=Math.max(0,Math.min(1,elapsed/duration)),end=winner!==null&&p>=1;
 const top=42,bottom=405,lh=(bottom-top)/count,finish=535,start=62,travel=finish-start-11;
 ctx.fillStyle='#1b2c41';ctx.fillRect(40,top-14,finish-22,bottom-top+30);
 ctx.strokeStyle='#536a82';ctx.lineWidth=1;
 for(let i=0;i<=count;i++){let y=top+i*lh;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(finish+16,y);ctx.stroke();}
 ctx.fillStyle='#b6a274';ctx.fillRect(finish,top-14,4,bottom-top+30);
 ctx.fillStyle='#d0dbe6';ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.fillText('GOAL',finish-22,23);
 const candidate=winner??1,positions=[];
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
  const x=start+travel*fraction;positions.push({n,x,y});const r=Math.max(1.5,Math.min(9,lh*.43));
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=end&&n===candidate?'#d7bf82':i%2?'#8498ad':'#6e829a';ctx.fill();
  ctx.strokeStyle='#b6c3cf';ctx.lineWidth=.7;ctx.stroke();
  ctx.fillStyle='#cad6e2';ctx.font='bold '+(count>50?7:10)+'px Arial';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(String(n),35,y);
 }
 if(!reduced&&!end)drawRaceCamera(canvas,positions,p,'ball');
 if(end){ctx.fillStyle='#e0c484';ctx.font='bold 25px Arial';ctx.textAlign='center';ctx.fillText(candidate+' 番 ゴール！',W/2,441);}
}
