// Koko Hore Wanwan: whimsical puppy crush lottery. Fair winner comes from app.js.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=cl(x);return x*x*(3-2*x)};
export function makeLoveDogRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 return {winner,count,dogs:Array.from({length:count},(_,i)=>({n:i+1,x:48+i%10*56,y:111+Math.floor(i/10)*79,phase:r()*6.28,crush:1+Math.floor(r()*count),speed:.75+r()*.65,heart:r()*6.28}))};
}
function heart(c,x,y,size,color){c.save();c.translate(x,y);c.scale(size,size);c.fillStyle=color;c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-25,-6,-14,-22,0,-10);c.bezierCurveTo(14,-22,25,-6,0,8);c.fill();c.restore();}
function dog(c,n,x,y,s=1,turn=0){
 c.save();c.translate(x,y);c.scale(s,s);c.rotate(turn);
 c.fillStyle='#aa754f';c.beginPath();c.ellipse(0,6,13,14,0,0,7);c.fill();c.beginPath();c.arc(0,-9,14,0,7);c.fill();
 c.fillStyle='#78513d';c.beginPath();c.ellipse(-13,-14,6,12,-.35,0,7);c.ellipse(13,-14,6,12,.35,0,7);c.fill();
 c.fillStyle='#f4d4ac';c.beginPath();c.ellipse(0,-5,8,7,0,0,7);c.fill();c.fillStyle='#2d251f';for(const [px,py] of [[-5,-15],[5,-15],[0,-7]]){c.beginPath();c.arc(px,py,2,0,7);c.fill();}
 c.fillStyle='#fff4da';c.beginPath();c.roundRect(-15,1,30,19,4);c.fill();c.fillStyle='#22374b';c.textAlign='center';c.textBaseline='middle';c.font='900 15px Arial';c.fillText(String(n),0,11);c.restore();
}
export function drawLoveDog(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;let t=cl(elapsed/duration),done=t>=1;
 c.fillStyle='#eff2df';c.fillRect(0,0,600,480);c.fillStyle='#d2e9be';c.fillRect(0,70,600,360);
 for(let i=0;i<8;i++){let x=30+i*82;c.fillStyle='#84b58a';c.beginPath();c.arc(x,89,23,0,7);c.fill();c.fillStyle='#987a56';c.fillRect(x-4,105,8,28);}
 c.fillStyle='#71435e';c.textAlign='center';c.font='bold 23px Arial';c.fillText('ここ惚れワンワン ♡',300,35);
 if(!round)return;
 for(const b of round.dogs){
  const partner=round.dogs[b.crush-1];
  const wander=cl(t/.64);
  let x=b.x+(partner.x-b.x)*ease(wander)*.32+(!reduced?Math.sin(t*24+b.phase)*10:0);
  let y=b.y+(partner.y-b.y)*ease(wander)*.22+(!reduced?Math.cos(t*17+b.phase)*7:0);
  const finale=b.n===round.winner?ease((t-.8)/.2):0;
  x+=(300-x)*finale;y+=(240-y)*finale;
  dog(c,b.n,x,y,1+finale*1.05,reduced?0:Math.sin(t*13+b.phase)*.15);
  if(t>.18&&t<.84&&!reduced){
   const h=cl((t-.18)*4);heart(c,x+Math.sin(t*8+b.heart)*18,y-26-h*9,0.33,'#e58aa6');
  }
 }
 if(t>.8){const u=ease((t-.8)/.2);heart(c,300,166,1.2+u*3,'#e96a8f');}
 c.fillStyle='#70425b';c.font='bold 18px Arial';c.fillText(done?round.winner+'番のワンちゃんがハートを射止めた！':t<.35?'恋の相手を探して大騒ぎ！':'あっちもこっちも一目惚れ！',300,462);
}
