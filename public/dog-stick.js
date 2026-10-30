const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=cl(v);return v*v*(3-2*v)};
export function makeDogStickRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const events=new Map(losers.map((n,i)=>[n,{time:.12+.74*(i+.4*rnd())/Math.max(1,losers.length),kind:Math.floor(rnd()*3),from:Math.floor(rnd()*3)}]));
 return {count,winner,dogs:Array.from({length:count},(_,i)=>({n:i+1,row:Math.floor(i/10),col:i%10,phase:rnd()*6.283,event:events.get(i+1)||null}))};
}
function drawDog(c,n,x,y,size,angle){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(size,size);
 c.fillStyle='#a87855';c.beginPath();c.ellipse(0,7,14,13,0,0,7);c.arc(0,-9,13,0,7);c.fill();
 c.fillStyle='#795039';c.beginPath();c.ellipse(-12,-15,6,11,-.3,0,7);c.ellipse(12,-15,6,11,.3,0,7);c.fill();
 c.fillStyle='#efc7a0';c.beginPath();c.ellipse(0,-5,8,6,0,0,7);c.fill();
 c.fillStyle='#28323b';for(const [a,b] of [[-5,-14],[5,-14],[0,-7]]){c.beginPath();c.arc(a,b,2,0,7);c.fill();}
 c.fillStyle='#fff4d8';c.beginPath();c.roundRect(-16,0,32,19,4);c.fill();c.fillStyle='#22394d';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,9);c.restore();
}
function stick(c,x,y,angle){c.save();c.translate(x,y);c.rotate(angle);c.strokeStyle='#7d583b';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-23,0);c.lineTo(23,0);c.stroke();c.restore();}
export function drawDogStick(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration);
 c.fillStyle='#eaf1dc';c.fillRect(0,0,600,480);
 for(let i=0;i<4;i++){c.fillStyle=i%2?'#dcc9aa':'#d7c4a4';c.fillRect(15,108+i*79,570,51);}
 c.fillStyle='#37523c';c.font='bold 22px Arial';c.textAlign='center';c.fillText('犬も歩けば棒に当たる！',300,33);
 if(!round)return;
 for(const d of round.dogs){
  const baseX=35+d.col*54,baseY=120+d.row*79;
  const event=d.event;const hit=event&&t>=event.time;
  const after=hit?cl((t-event.time)/.11):0;
  const gone=hit&&after>=1;
  if(gone)continue;
  let x=baseX+t*38+(!reduced?Math.sin(t*18+d.phase)*8:0),y=baseY+(!reduced?Math.cos(t*22+d.phase)*4:0);
  let angle=0;
  if(hit){if(event.kind===0)x-=after*30;else if(event.kind===1){angle=after*Math.PI*2;y+=after*45;}else x+=after*75;}
  if(event&&t>=event.time-.075&&t<event.time+.025){
   const u=cl((t-(event.time-.075))/.075),side=event.from;
   const sx=side===0?-25+(x+25)*u:side===1?625+(x-625)*u:x;
   const sy=side===2?-25+(y+25)*u:y;
   stick(c,sx,sy,side===2?Math.PI/2:0);
  }
  const finale=d.n===round.winner?ease((t-.84)/.16):0;
  x+=(300-x)*finale;y+=(240-y)*finale;
  drawDog(c,d.n,x,y,1+finale*1.2,angle);
 }
 c.fillStyle='#37523c';c.font='bold 18px Arial';c.fillText(t>=1?round.winner+'番のワンちゃんが大当たり！':'棒が飛んできた！ ワンワン！',300,461);
}
