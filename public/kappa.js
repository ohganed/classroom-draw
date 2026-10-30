// 河童の川流れ: even a master swimmer can be swept by a current.
// The winning number is drawn uniformly by the host app, not by the animation.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=cl(x);return x*x*(3-2*x)};
export function makeKappaRound(count,winner,seed){
 let s=seed>>>0||1;const r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const stages=new Map(others.map((n,i)=>[n,i<Math.ceil(others.length*.52)?1:i<Math.ceil(others.length*.89)?2:3]));
 return {winner,count,kappas:Array.from({length:count},(_,i)=>({n:i+1,lane:i%8,row:Math.floor(i/8),phase:r()*6.283,turn:r()>.5?1:-1,stage:stages.get(i+1)??0,orbit:18+r()*27,angle:r()*6.283}))};
}
function kappa(c,n,x,y,rot=0,size=1){
 c.save();c.translate(x,y);c.rotate(rot);c.scale(size,size);
 c.fillStyle='#6dba83';c.beginPath();c.ellipse(0,8,12,15,0,0,Math.PI*2);c.fill();
 c.fillStyle='#4c9369';for(const a of [-1,1]){c.beginPath();c.ellipse(a*13,6,6,9,a*.3,0,Math.PI*2);c.fill();}
 c.fillStyle='#72bd89';c.beginPath();c.arc(0,-10,14,0,Math.PI*2);c.fill();
 c.fillStyle='#d3e4ac';c.beginPath();c.ellipse(0,-22,9,4,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#3b7c56';c.lineWidth=2;c.beginPath();c.ellipse(0,-22,9,4,0,0,Math.PI*2);c.stroke();
 c.fillStyle='#263b36';for(const x of [-5,5]){c.beginPath();c.arc(x,-12,2,0,Math.PI*2);c.fill();}
 c.fillStyle='#efdfb0';c.beginPath();c.moveTo(-4,-5);c.lineTo(0,-1);c.lineTo(4,-5);c.fill();
 c.fillStyle='#fff7d4';c.beginPath();c.roundRect(-16,0,32,19,4);c.fill();
 c.fillStyle='#254b3b';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,10);c.restore();
}
function arrow(c,x,y,dir){c.save();c.translate(x,y);c.strokeStyle='rgba(235,250,250,.62)';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(-19*dir,0);c.lineTo(19*dir,0);c.lineTo(10*dir,-8);c.moveTo(19*dir,0);c.lineTo(10*dir,8);c.stroke();c.restore();}
export function drawKappa(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#d4e8c4';c.fillRect(0,0,600,480);
 c.fillStyle='#488eaa';c.beginPath();c.moveTo(0,83);c.bezierCurveTo(180,65,370,108,600,78);c.lineTo(600,409);c.bezierCurveTo(390,429,160,391,0,414);c.closePath();c.fill();
 for(let i=0;i<9;i++){const y=108+i*35;c.strokeStyle=i%2?'#70b8cd':'#8bd0df';c.lineWidth=4;c.beginPath();for(let x=0;x<=600;x+=20){const yy=y+Math.sin(x*.032+i+t*13)*6;x===0?c.moveTo(x,yy):c.lineTo(x,yy);}c.stroke();}
 // Flow is made explicit: current to the right, with two swirl zones.
 for(const [x,y] of [[90,164],[270,350],[460,186],[515,341]])arrow(c,x,y,1);
 for(const [x,y] of [[205,232],[390,269]]){c.strokeStyle='#d3eef0';c.lineWidth=3;c.beginPath();c.arc(x,y,29,t*5,t*5+Math.PI*1.6);c.stroke();c.fillStyle='#e6f2db';c.font='14px Arial';c.textAlign='center';c.fillText('うず',x,y-38);}
 c.fillStyle='#f8f3ce';c.beginPath();c.ellipse(547,249,43,117,0,0,Math.PI*2);c.fill();c.fillStyle='#73aa6f';c.beginPath();c.ellipse(559,239,23,91,0,0,Math.PI*2);c.fill();
 c.fillStyle='#214a50';c.font='bold 21px Arial';c.textAlign='center';c.fillText('河童の川流れ！',300,30);
 c.font='bold 15px Arial';c.fillText('川岸',555,389);
 if(!round)return;
 let stuck1=0,stuck2=0;
 const swirl=(b,cx,cy,time,start,end)=>{
  const spin=b.angle+b.turn*(time-start)*70;
  const rad=b.orbit*(1-.3*cl((time-start)/(end-start)));
  return {x:cx+Math.cos(spin)*rad,y:cy+Math.sin(spin)*rad*.8,rot:spin};
 };
 const between=(a,b,u)=>({x:a.x+(b.x-a.x)*cl(u),y:a.y+(b.y-a.y)*cl(u),rot:0});
 for(const b of round.kappas){
  const initial={x:35+b.lane*16,y:123+b.row*54+(b.lane%3)*5};
  const first=swirl(b,205,232,.28,.28,.43);
  const firstEnd=swirl(b,205,232,.43,.28,.43);
  const second=swirl(b,390,269,.56,.56,.73);
  const secondEnd=swirl(b,390,269,.73,.56,.73);
  let p;
  if(t<.28)p=between(initial,first,t/.28);
  else if(b.stage===1){p=swirl(b,205,232,t,.28,.43);stuck1++;}
  else if(t<.43)p=swirl(b,205,232,t,.28,.43);
  else if(t<.56)p=between(firstEnd,second,(t-.43)/.13);
  else if(b.stage===2){p=swirl(b,390,269,t,.56,.73);stuck2++;}
  else if(t<.73)p=swirl(b,390,269,t,.56,.73);
  else {
   const finish=b.stage===0?{x:538,y:245}:{x:493,y:305};
   p=between(secondEnd,finish,cl((t-.73)/(b.stage===0?.27:.18)));
  }
  kappa(c,b.n,p.x,p.y,reduced?0:(p.rot||0),b.stage===0?1+ease((t-.88)/.12):1);
 }
 c.fillStyle='#24515c';c.font='bold 16px Arial';c.textAlign='center';
 c.fillText(done?round.winner+'番の河童がゴール！':t<.28?'第１の渦が近づいてきた！':t<.56?'第１の渦から脱出できるか？':t<.73?'第２の渦に挑戦！':'渦を抜けた河童がゴールへ！',300,454);
 c.font='bold 13px Arial';c.fillText('第１の渦：'+stuck1+'匹　　第２の渦：'+stuck2+'匹',300,474);
}
