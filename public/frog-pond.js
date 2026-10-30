// Frog pond draw. Winner is uniformly sampled by the parent app, independent of motion.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
export function makeFrogRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const failSteps=new Map(losers.map((n,i)=>[n,Math.min(12,2+Math.floor(i*11/Math.max(1,losers.length)))]));
 const frogs=Array.from({length:count},(_,i)=>{
  const n=i+1;let lane=Math.floor(rand()*5);
  const points=[{x:47,y:92+lane*75}];
  for(let j=1;j<=13;j++){
   lane=clamp(lane+Math.floor(rand()*3)-1,0,4);
   points.push({x:64+j*35,y:92+lane*75});
  }
  const failStep=failSteps.get(n)||Infinity;
  if(Number.isFinite(failStep)){const land=points[failStep];points[failStep]={x:land.x+13,y:land.y+34};}
  return {n,points,failStep,phase:rand()*6.28,delay:rand()*.025,tempo:.96+rand()*.06};
 });
 return {count,winner,frogs};
}
function frog(c,x,y,r,n,jump,selected){
 c.save();c.translate(x,y-jump*12*r);c.scale(r,r);
 c.fillStyle='#102f3c';c.beginPath();c.ellipse(0,15,18,5,0,0,7);c.fill();
 c.fillStyle=selected?'#a9d76f':['#87b995','#9cc977','#71b6b3','#b2cb83'][n%4];
 c.beginPath();c.ellipse(0,0,16,13,0,0,7);c.fill();
 c.beginPath();c.arc(-9,-10,6,0,7);c.arc(9,-10,6,0,7);c.fill();
 c.fillStyle='#f7fbeb';c.beginPath();c.arc(-9,-11,3.5,0,7);c.arc(9,-11,3.5,0,7);c.fill();
 c.fillStyle='#203f38';c.beginPath();c.arc(-9,-11,1.7,0,7);c.arc(9,-11,1.7,0,7);c.fill();
 c.fillStyle='#f4f8e7';c.beginPath();c.roundRect(-14,-5,28,19,5);c.fill();
 c.fillStyle='#162f40';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,5);
 c.restore();
}
export function drawFrogPond(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const p=clamp(elapsed/duration),done=p>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#163c48';c.fillRect(0,0,600,480);
 c.fillStyle='#245765';c.fillRect(26,48,548,387);
 c.fillStyle='#77936e';c.fillRect(20,48,34,387);c.fillRect(536,48,41,387);
 for(let j=1;j<=13;j++)for(let lane=0;lane<5;lane++){
  const x=64+j*35,y=92+lane*75;
  c.fillStyle=(j+lane)%3===0?'#528c7b':'#3e7d76';c.beginPath();c.ellipse(x,y,24,13,-.18,0,7);c.fill();
 }
 c.fillStyle='#eff0cd';c.font='bold 19px Arial';c.textAlign='center';c.fillText('カエルの池渡り抽選',300,30);
 c.font='bold 13px Arial';c.fillText('START',53,455);c.fillText('GOAL',544,455);
 if(!round)return;
 for(const b of round.frogs){
  if(done&&b.n!==round.winner)continue;
  const t=reduced&&!done?0:clamp((p-b.delay)/(1-b.delay));
  let travel=clamp(t*13*b.tempo,0,13);
  if(b.n===round.winner)travel=13*clamp(t-.10*Math.sin(Math.PI*t)**2);
  if(b.n!==round.winner&&travel>=b.failStep){
   const splashAge=travel-b.failStep;
   if(splashAge<.65&&!reduced){const q=b.points[b.failStep];c.strokeStyle='#b6e2e2';c.lineWidth=2.5;c.beginPath();c.ellipse(q.x,q.y,10+splashAge*30,4+splashAge*11,0,0,7);c.stroke();}
   continue;
  }
  const k=Math.min(12,Math.floor(travel)),u=travel-k,z=ease(u);
  const a=b.points[k],v=b.points[k+1];let x=a.x+(v.x-a.x)*z,y=a.y+(v.y-a.y)*z;
  if(b.n===round.winner){const finish=ease((t-.83)/.17);x+=(545-x)*finish;y+=(234-y)*finish;}
  const airborne=reduced?0:Math.sin(Math.PI*u);
  const scale=round.count>65?.64:round.count>35?.78:round.count>15?1.03:1.3;
  if(b.n!==round.winner&&k+1===b.failStep){y+=u*u*19;}
  frog(c,x,y,done?2.2:scale,b.n,airborne,done);
 }
 if(done){c.fillStyle='#fff0bd';c.font='bold 23px Arial';c.fillText(round.winner+' 番が対岸に到着！',300,465);}
 else{const remaining=round.frogs.filter(b=>b.n===round.winner||clamp((p-b.delay)/(1-b.delay))*13*b.tempo<b.failStep).length;c.fillStyle='#d4e6dd';c.font='bold 14px Arial';c.fillText('残り '+remaining+' 匹　　葉っぱに届かなければ脱落！',300,463);}
}
