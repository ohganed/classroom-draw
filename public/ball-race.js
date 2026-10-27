// A low-flash marble race. Outcome comes from the app's unbiased draw.
// All marbles travel in lanes; the selected marble alone reaches the finish first.
export function drawBallRace(canvas, count=40, elapsed=0, duration=8000, winner=null, reduced=false) {
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const W=600,H=450;ctx.clearRect(0,0,W,H);
 const progress=Math.max(0,Math.min(1,elapsed/duration));
 const lanes=Math.min(count,40);
 const top=42, bottom=405, laneH=(bottom-top)/lanes;
 const finishX=535, startX=62;
 ctx.fillStyle='#1b2c41';ctx.fillRect(40,top-14,finishX-22,bottom-top+30);
 ctx.strokeStyle='#6e8096';ctx.lineWidth=2;
 for(let i=0;i<=lanes;i++){const y=top+i*laneH;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(finishX+16,y);ctx.stroke();}
 ctx.fillStyle='#c1a96d';ctx.fillRect(finishX,top-14,5,bottom-top+30);
 ctx.fillStyle='#d0dbe6';ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.fillText('GOAL',finishX-22,23);
 const choose=(n)=>winner===null?null:winner===n;
 for(let i=0;i<lanes;i++){
  const n=i+1, y=top+(i+.5)*laneH;
  const win=n===winner;
  // Winners reach the finish line at 100%, others remain behind.
  const travel= reduced ? 0 : progress;
  const fraction=win ? travel : travel*(.73+.20*((i*7)%11)/10);
  const x=startX+(finishX-startX-11)*Math.min(1,fraction);
  const r=Math.max(4,Math.min(9,laneH*.43));
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=win?'#d7bf82':i%2?'#8498ad':'#6e829a';ctx.fill();
  ctx.strokeStyle='#b6c3cf';ctx.lineWidth=.7;ctx.stroke();
  // For high counts numbers are labelled in lane header instead of unreadably small marble.
  ctx.fillStyle='#cad6e2';ctx.font='bold 10px Arial';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(String(n),35,y);
 }
 if(winner!==null){ctx.fillStyle='#e0c484';ctx.font='bold 25px Arial';ctx.textAlign='center';ctx.fillText(winner+' 番 ゴール！',W/2,441);}
}
