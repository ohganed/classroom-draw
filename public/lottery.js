// Low-flash numbered lottery drum. Canvas only; winner chosen by parent app.
export function drawLottery(canvas, elapsed=0, duration=8000, count=40, winner=null, reduced=false) {
 const ctx=canvas.getContext('2d'); if(!ctx)return;
 const W=520,H=450;ctx.clearRect(0,0,W,H);
 const cx=260,cy=204,R=161;
 const progress=Math.min(1,elapsed/duration);
 const motion=winner===null&&!reduced;
 const speed=Math.pow(1-progress,2);
 // Stationary housing; only numbered balls move.
 ctx.strokeStyle='#8193a6';ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle='#455c75';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,R-9,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#42546d';ctx.fillRect(cx-6,cy+R,12,33);
 ctx.fillStyle='#8998a8';ctx.fillRect(cx-100,cy+R+31,200,12);
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-13,0,Math.PI*2);ctx.clip();
 const total=Math.min(99,count);
 for(let i=0;i<total;i++){
  const phi=i*2.3999632297;
  const ring=Math.sqrt((i+.5)/total)*128;
  const turn=motion?(elapsed*.0017*Math.max(.06,speed)+Math.sin(elapsed*.001+i)*.08):0;
  const x=cx+Math.cos(phi+turn)*ring;
  const y=cy+Math.sin(phi+turn)*ring*.83;
  const r=total>60?14:total>42?16:18;
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=i%3===0?'#71859e':i%3===1?'#647b94':'#8090a4';ctx.fill();
  ctx.strokeStyle='#a2b1bf';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#15253a';ctx.font='bold '+(r<16?'11':'13')+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),x,y);
 }
 ctx.restore();
 // Winner drops into a separate collection tray after animation.
 ctx.strokeStyle='#8193a6';ctx.lineWidth=4;ctx.strokeRect(352,365,120,58);
 if(winner!==null) {
  ctx.beginPath();ctx.arc(412,393,25,0,2*Math.PI);ctx.fillStyle='#d0b778';ctx.fill();
  ctx.fillStyle='#17253a';ctx.font='900 23px Arial';ctx.fillText(String(winner),412,395);
 }
}
