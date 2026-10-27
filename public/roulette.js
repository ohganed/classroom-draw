// Accessible, subdued canvas roulette. Pointer is fixed at twelve o'clock.
// The selected sector center ends precisely beneath the pointer.
const TAU=Math.PI*2;
export function finalAngle(winner,count){
 if(!Number.isInteger(count)||count<1||!Number.isInteger(winner)||winner<1||winner>count)throw new RangeError('invalid roulette outcome');
 const step=TAU/count;
 return ((-(winner-.5)*step)%TAU+TAU)%TAU;
}
export function rouletteAngle(elapsed,duration,winner,count,reduced=false){
 const end=finalAngle(winner,count);
 if(reduced)return end;
 const t=Math.max(0,Math.min(1,elapsed/duration));
 // Low-frequency ease-out: no flashes, rapid color swaps or strobing.
 const eased=1-Math.pow(1-t,3);
 return (TAU*2+end)*eased;
}
export function drawRoulette(canvas,count=40,angle=0,winner=null){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const w=520,h=520,c=260,r=209,step=TAU/count;
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#152539';ctx.beginPath();ctx.arc(c,c,r+11,0,TAU);ctx.fill();
 ctx.strokeStyle='#73859b';ctx.lineWidth=4;ctx.stroke();
 for(let i=0;i<count;i++){
  const from=-Math.PI/2+i*step+angle,to=from+step;
  ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,r,from,to);ctx.closePath();
  ctx.fillStyle=i%2?'#40546b':'#4c6076';ctx.fill();
  ctx.strokeStyle='#65778d';ctx.lineWidth=count>60?.65:1;ctx.stroke();
  const mid=(from+to)/2,dist=count>55?166:169;
  ctx.save();ctx.translate(c+Math.cos(mid)*dist,c+Math.sin(mid)*dist);
  ctx.rotate(mid+Math.PI/2);
  ctx.font='bold '+(count>60?12:count>40?13:15)+'px Arial';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f0f3f6';
  ctx.fillText(String(i+1),0,0);ctx.restore();
 }
 ctx.beginPath();ctx.arc(c,c,53,0,TAU);ctx.fillStyle='#172b42';ctx.fill();
 ctx.strokeStyle='#8fa1b4';ctx.lineWidth=3;ctx.stroke();
 ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d5dfe9';
 ctx.fillText('抽 選',c,c);
 // Fixed triangular pointer, no flashing.
 ctx.beginPath();ctx.moveTo(c,c-r+25);ctx.lineTo(c-17,c-r-19);ctx.lineTo(c+17,c-r-19);
 ctx.closePath();ctx.fillStyle='#d8ba75';ctx.fill();
 if(winner!==null){
  ctx.font='bold 17px Arial';ctx.fillStyle='#d8ba75';ctx.fillText('確定',c,34);
 }
}
