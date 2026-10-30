// Arcade brick-breaker lottery. Winner provided by app; animation never determines probability.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=cl(v);return v*v*(3-2*v)};
export function makeBrickRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const hit=new Map(losers.map((n,i)=>[n,.14+.66*(i+.2*r())/Math.max(1,losers.length)]));
 return {winner,count,bricks:Array.from({length:count},(_,i)=>({n:i+1,x:23+(i%10)*56,y:88+Math.floor(i/10)*50,hit:hit.get(i+1)??Infinity})),phase:r()*6.28};
}
export function drawBrick(canvas,round,elapsed=0,duration=12000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration);
 c.fillStyle='#121e35';c.fillRect(0,0,600,480);
 c.fillStyle='#e4eafa';c.textAlign='center';c.font='bold 23px Arial';c.fillText('ブロック崩し・最後の一枚！',300,35);
 c.strokeStyle='#48617d';c.lineWidth=3;c.strokeRect(12,57,576,377);
 if(!round)return;
 let left=0;
 for(const b of round.bricks){
  const after=cl((t-b.hit)/.07);if(after>=1)continue;if(t<b.hit)left++;
  c.globalAlpha=1-after;
  c.fillStyle=['#e2a65e','#75b8d3','#d18ba9','#91bb82'][Math.floor(b.n/10)%4];
  c.beginPath();c.roundRect(b.x,b.y,50,38,5);c.fill();
  c.fillStyle='#182a3c';c.font='900 20px Arial';c.fillText(b.n,b.x+25,b.y+26);
  c.globalAlpha=1;
 }
 // Ball takes a varied continuous rebound path; last brick is deliberately elusive.
 const x=300+Math.sin(t*86+round.phase)*258*Math.min(1,t*8);
 const y=310+Math.cos(t*54+round.phase)*112;
 const paddle=cl(x-49,25,480);
 c.fillStyle='#f6d98b';c.beginPath();c.roundRect(paddle,412,98,12,6);c.fill();
 c.fillStyle='#f7f9fa';c.beginPath();c.arc(x,y,10,0,7);c.fill();
 if(t>.83){
  const w=round.bricks[round.winner-1],u=ease((t-.91)/.09);
  c.strokeStyle='#f5d17e';c.lineWidth=3;c.strokeRect(w.x-3,w.y-3,56,44);
  if(u>0){c.fillStyle='#f8d981';c.beginPath();c.roundRect(190,301,220,79,12);c.fill();c.fillStyle='#192b42';c.font='900 47px Arial';c.fillText(round.winner,300,355);}
 }
 c.fillStyle='#e4eafa';c.font='bold 17px Arial';c.fillText(t>=1?round.winner+'番が最後まで残った！':t<.83?'残り '+left+' 枚！':'最後の一枚にボールが当たらない！',300,465);
}
