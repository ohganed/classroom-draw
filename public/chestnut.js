// 火中の栗を拾う — comic chestnut rescue, not a real-world fire safety demonstration.
// Winner comes exclusively from app.js's uniform random selection.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=cl(v);return v*v*(3-2*v)};
export function makeChestnutRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const rest=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=rest.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
 const out=new Map(rest.map((n,i)=>[n,.26+.57*(i+r()*.25)/Math.max(1,rest.length)]));
 return {winner,count,animals:Array.from({length:count},(_,i)=>({n:i+1,col:i%10,row:Math.floor(i/10),phase:r()*6.283,scared:out.get(i+1)??Infinity,side:r()>.5?1:-1}))};
}
function critter(c,n,x,y,s=1,rot=0){
 c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);
 c.fillStyle='#af886c';c.beginPath();c.ellipse(0,8,12,13,0,0,7);c.fill();c.beginPath();c.arc(0,-9,13,0,7);c.fill();
 c.fillStyle='#95705c';for(const sign of [-1,1]){c.beginPath();c.arc(12*sign,-18,6,0,7);c.fill();}
 c.fillStyle='#f0d1b1';c.beginPath();c.ellipse(0,-5,8,7,0,0,7);c.fill();
 c.fillStyle='#273039';for(const x of [-5,5]){c.beginPath();c.arc(x,-13,2,0,7);c.fill();}
 c.fillStyle='#f5e8ce';c.beginPath();c.roundRect(-16,1,32,19,4);c.fill();
 c.fillStyle='#263c4a';c.textAlign='center';c.textBaseline='middle';c.font='900 16px Arial';c.fillText(n,0,11);c.restore();
}
function nut(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#875037';c.beginPath();c.moveTo(0,-15);c.bezierCurveTo(21,-6,19,15,0,18);c.bezierCurveTo(-19,15,-21,-6,0,-15);c.fill();c.fillStyle='#d1a36c';c.beginPath();c.ellipse(0,-11,10,5,0,0,7);c.fill();c.restore();}
export function drawChestnut(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration);
 c.fillStyle='#f3ebd7';c.fillRect(0,0,600,480);
 c.fillStyle='#dfd4b9';c.fillRect(0,372,600,108);
 c.fillStyle='#4b413a';c.font='bold 23px Arial';c.textAlign='center';c.fillText('火中の栗を拾う！',300,31);
 c.fillStyle='#a49381';c.beginPath();c.ellipse(300,243,102,44,0,0,7);c.fill();
 // A stylized, stable warm glow: no full-frame blinking or sudden flashes.
 c.fillStyle='#edb66b';c.beginPath();c.ellipse(300,218,82,31,0,0,7);c.fill();
 for(let i=0;i<7;i++){const x=250+i*17,h=35+10*Math.sin(t*10+i);c.fillStyle=i%2?'#f1b15a':'#d67d44';c.beginPath();c.moveTo(x-13,232);c.quadraticCurveTo(x-16,210,x+Math.sin(t*8+i)*8,198-h);c.quadraticCurveTo(x+17,210,x+13,232);c.fill();}
 for(let i=0;i<6;i++)nut(c,255+i*18+Math.sin(t*9+i)*3,237+Math.cos(t*8+i)*5,.55);
 if(!round)return;
 for(const b of round.animals){
  const startX=38+b.col*58,startY=83+b.row*78;
  const approach=ease(t/.25);
  let x=startX+(300-startX)*approach*.32,y=startY+(239-startY)*approach*.15;
  const escaped=t>=b.scared,age=escaped?cl((t-b.scared)/.12):0;
  if(escaped){x+=b.side*125*age;y+=75*age*age;}
  if(age>=1)continue;
  const winner=b.n===round.winner,finish=winner?ease((t-.83)/.17):0;
  x+=(300-x)*finish;y+=(170-y)*finish;
  const jitter=reduced?0:Math.sin(t*23+b.phase)*3;
  critter(c,b.n,x+jitter,y,1+finish*1.05,reduced?0:(escaped?b.side*age*1.4:Math.sin(t*13+b.phase)*.1));
 }
 if(t>.83){const u=ease((t-.83)/.17);nut(c,345,110+45*(1-u),1.55*u);}
 c.fillStyle='#4f453b';c.font='bold 17px Arial';
 c.fillText(t>=1?round.winner+'番が栗をゲット！':t<.3?'みんなで栗を取りにいくぞ！':'あつい！ あちこちで大騒ぎ！',300,463);
}
