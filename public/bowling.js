// Comedic bowling survival draw. Winner comes from the app's uniform random draw.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=cl(t);return t*t*(3-2*t)};
export function makeBowlingRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const pins=Array.from({length:count},(_,i)=>{const n=i+1,col=i%10,row=Math.floor(i/10);return {n,x:43+col*57,y:103+row*76,fall:Infinity,angle:(rnd()>.5?1:-1)*(.8+rnd()*.65),drift:14+rnd()*23};});
 const losers=pins.filter(p=>p.n!==winner);
 for(let i=losers.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 // Multiple independent balls with randomized, curved routes. Every fall is triggered
 // when the corresponding ball reaches the pin, rather than by an unrelated timer.
 const balls=[];const ballCount=Math.min(6,Math.max(1,Math.ceil(losers.length/7)));
 for(let k=0;k<ballCount;k++){
  const assigned=losers.filter((_,i)=>i%ballCount===k);
  const start=.055+k*.065, end=.90+k*.007;
  const nodes=[{x:k%2?566:34,y:80+k*56,t:start}];
  assigned.forEach((pin,i)=>{const at=start+(end-start)*(i+1)/(assigned.length+1);
    nodes.push({x:pin.x,y:pin.y,t:at});pin.fall=at;});
  nodes.push({x:k%2?32:568,y:365-k*35,t:end});
  balls.push({nodes,r:18+k%3*3,twist:rnd()*6.28});
 }
 return {winner,pins,count,balls};
}
function ballAt(ball,t){
 const nodes=ball.nodes;if(t<nodes[0].t||t>nodes[nodes.length-1].t)return null;
 for(let i=1;i<nodes.length;i++)if(t<=nodes[i].t){
  const a=nodes[i-1],b=nodes[i],u=cl((t-a.t)/(b.t-a.t));
  return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
 }
 return null;
}
function drawPin(c,p,progress,selected=false){
 const angle=p.angle*ease(progress),slide=ease(progress)*p.drift*Math.sign(p.angle);
 c.save();c.translate(p.x+slide,p.y+ease(progress)*15);c.rotate(angle);
 c.fillStyle=selected?'#f5dc87':'#e9f0ee';c.strokeStyle='#6a8d9d';c.lineWidth=1.7;
 c.beginPath();c.moveTo(-10,19);c.quadraticCurveTo(-17,9,-11,-1);c.quadraticCurveTo(-7,-13,-8,-24);c.quadraticCurveTo(0,-30,8,-24);c.quadraticCurveTo(7,-13,11,-1);c.quadraticCurveTo(17,9,10,19);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#cf6265';c.lineWidth=4;c.beginPath();c.moveTo(-8,-15);c.lineTo(8,-15);c.moveTo(-8,-9);c.lineTo(8,-9);c.stroke();
 c.fillStyle='#193448';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(p.n,0,8);c.restore();
}
export function drawBowling(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;let t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#15263e';c.fillRect(0,0,600,480);
 c.fillStyle='#a88b68';c.fillRect(19,62,562,382);
 for(let i=0;i<11;i++){c.strokeStyle=i%2?'#d6bd94':'#c7a77e';c.lineWidth=2;c.beginPath();c.moveTo(21+i*56,62);c.lineTo(21+i*56,444);c.stroke();}
 c.fillStyle='#f1ddb8';c.font='bold 20px Arial';c.textAlign='center';c.fillText('ボウリング大混乱',300,30);
 if(!round)return;
 const active=round.pins.filter(p=>p.fall>t).length;
 // Draw the randomly routed balls; each waypoint corresponds to a pin collision.
 if(!reduced&&!done)for(const ball of round.balls){
  const q=ballAt(ball,t);if(!q)continue;
  c.fillStyle='#364d83';c.beginPath();c.arc(q.x,q.y,ball.r,0,Math.PI*2);c.fill();
  c.fillStyle='#141d34';for(let k=0;k<3;k++){const a=k*2.1+ball.twist+t*13;c.beginPath();c.arc(q.x+Math.cos(a)*ball.r*.44,q.y+Math.sin(a)*ball.r*.44,3.5,0,Math.PI*2);c.fill();}
 }
 for(const p of round.pins){const age=p.fall===Infinity?0:cl((t-p.fall)/.09);if(age>=1&&!done)continue;if(done&&p.n!==round.winner)continue;drawPin(c,p,age,done);}
 c.font='bold 18px Arial';c.fillStyle='#fff0c5';c.fillText(done?round.winner+' 番の勝ち！':'残り '+active+' 本！',300,465);
}
