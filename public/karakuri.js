// Karakuri draw. Outcome comes from the independent uniform draw in app.js.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
export function makeKarakuriRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const first=[winner,...others.slice(0,Math.max(0,Math.ceil(count/2)-1))];
 const shuffled=first.filter(n=>n!==winner);for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const final=[winner,...shuffled.slice(0,Math.max(0,Math.ceil(first.length/2)-1))];
 const members=Array.from({length:count},(_,i)=>i+1).map((n,i)=>({n,stage:final.includes(n)?2:first.includes(n)?1:0,phase:rnd()*6.28,jitter:rnd(),speed:.7+rnd()*.65,slot:i}));
 return {count,winner,members,first,final,seed};
}
function ball(c,x,y,r,n,selected=false){
 c.save();c.translate(x,y);
 c.shadowColor='#091924';c.shadowBlur=6;c.shadowOffsetY=3;
 let g=c.createRadialGradient(-r*.35,-r*.42,r*.12,0,0,r);
 g.addColorStop(0,selected?'#fff2c4':'#ecf7f5');g.addColorStop(.48,selected?'#f1cb77':'#a8d5d6');g.addColorStop(1,selected?'#a76b36':'#4b798d');
 c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.shadowColor='transparent';
 c.fillStyle='#183448';c.textAlign='center';c.textBaseline='middle';c.font='900 '+Math.max(8,Math.round(r*(n>9?1.05:1.3)))+'px Arial';
 c.fillText(String(n),0,1);c.restore();
}
export function drawKarakuri(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const W=600,H=490,p=clamp(elapsed/duration),done=p>=1;
 c.clearRect(0,0,W,H);let bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#193345');bg.addColorStop(1,'#0e2136');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.strokeStyle='#557485';c.lineWidth=3;c.strokeRect(13,13,574,464);
 c.fillStyle='#e7dcc2';c.textAlign='center';c.font='bold 19px Arial';c.fillText('巨大からくり抽選',300,36);
 // Mechanical modules: always visible so the route is understandable.
 c.fillStyle='#284c5b';c.fillRect(28,53,544,79);
 c.strokeStyle='#97b7c0';c.lineWidth=3;c.strokeRect(28,53,544,79);
 c.fillStyle='#aec3c5';c.font='bold 13px Arial';c.fillText('全番号タンク',300,72);
 c.strokeStyle='#b7c6c5';c.lineWidth=10;c.lineCap='round';
 c.beginPath();c.moveTo(300,133);c.lineTo(300,151);c.lineTo(80,151);c.lineTo(80,210);c.lineTo(517,210);c.stroke();
 c.beginPath();c.moveTo(517,210);c.lineTo(517,256);c.lineTo(88,256);c.lineTo(88,318);c.lineTo(510,318);c.stroke();
 c.beginPath();c.moveTo(510,318);c.lineTo(510,363);c.lineTo(93,363);c.lineTo(93,427);c.lineTo(492,427);c.stroke();
 c.lineWidth=3;c.strokeStyle='#547384';c.setLineDash([7,10]);c.beginPath();c.moveTo(80,210);c.lineTo(517,210);c.moveTo(88,318);c.lineTo(510,318);c.moveTo(93,427);c.lineTo(492,427);c.stroke();c.setLineDash([]);
 // Rotating gear / wobbling bridge, always moderate contrast.
 c.save();c.translate(300,207);c.rotate(reduced?0:p*4.5);
 c.fillStyle='#b6c6cb';for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.fillRect(-6,-27,12,12);c.restore();}
 c.beginPath();c.arc(0,0,19,0,Math.PI*2);c.fill();c.fillStyle='#3b6071';c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(305,318);c.rotate(reduced?0:Math.sin(p*19)*.045);c.fillStyle='#c7ad79';c.fillRect(-110,-6,220,12);c.restore();
 c.fillStyle='#d1bb8e';c.font='bold 13px Arial';c.fillText('① 歯車ゲート',135,190);c.fillText('② 揺れる橋',145,295);
 c.fillText('決勝・逆転レール',300,396);c.fillText('GOAL',516,453);
 if(!round)return;
 const n=round.count,stage=p<.27?0:p<.51?1:p<.75?2:3;
 const visible=stage===0?round.members:stage===1?round.members.filter(b=>b.stage>=1):round.members.filter(b=>b.stage===2);
 const survivors=stage===0?n:stage===1?round.first.length:round.final.length;
 c.textAlign='right';c.fillStyle='#f0d69e';c.font='bold 17px Arial';c.fillText('残り '+survivors+' 個',559,76);
 // Each phase is a contiguous part of the *painted* track.
 const routes=[
  [[300,133],[300,151],[80,151],[80,210],[517,210]],
  [[517,210],[517,256],[88,256],[88,318],[510,318]],
  [[510,318],[510,363],[93,363]],
  [[93,363],[93,427],[492,427]]
 ];
 const routePoint=(points,u)=>{
  let total=0;const distances=[];
  for(let k=1;k<points.length;k++){const d=Math.hypot(points[k][0]-points[k-1][0],points[k][1]-points[k-1][1]);distances.push(d);total+=d;}
  let remaining=clamp(u)*total;
  for(let k=0;k<distances.length;k++){
   if(remaining<=distances[k]||k===distances.length-1){
    const a=points[k],b=points[k+1],t=clamp(remaining/distances[k]);
    return {x:mix(a[0],b[0],t),y:mix(a[1],b[1],t)};
   }
   remaining-=distances[k];
  }
  return {x:points[0][0],y:points[0][1]};
 };
 // Draw physical movement along the continuous rails, not separately interpolated x/y.
 // Variable speed produces overtakes. The winner emerges from behind only at the final turn.
 for(const b of visible){
  if(done&&b.n!==round.winner)continue;
  let x,y,r;
  if(done){x=492;y=427;r=30;}
  else if(stage===0){
   const q=clamp(p/.27),start=b.slot/Math.max(1,n);
   const travel=clamp(q*(1.17+.13*b.speed)-start*.26);
   // Tank releases each ball onto the first rail in quick succession.
   const pt=routePoint(routes[0],travel);x=pt.x;y=pt.y;r=n>60?7:n>30?9:12;
  }else{
   const q=stage===1?clamp((p-.27)/.24):stage===2?clamp((p-.51)/.24):clamp((p-.75)/.25);
   const rank=visible.findIndex(v=>v.n===b.n);
   const spread=rank/Math.max(1,visible.length-1);
   let travel=clamp(q*(1.13+.13*b.speed)-spread*(stage===1?.17:.24)+Math.sin(q*10+b.phase)*.022);
   if(stage===3){
    // False leader slows at the last bend; winner surges only near the finish.
    if(b.n===round.winner)travel=clamp(travel*.76+smooth((q-.66)/.34)*.24);
    else travel=Math.min(.92,travel-.19*smooth((q-.55)/.45)*(1-b.jitter*.5));
   }
   const pt=routePoint(routes[stage],travel);x=pt.x;y=pt.y;
   r=stage===1?(visible.length>30?10:13):stage===2?(visible.length>20?14:19):(visible.length>20?15:visible.length>10?19:24);
  }
  ball(c,x,y,r,b.n,done);
 }
 if(done){c.fillStyle='#f5dfa1';c.textAlign='center';c.font='bold 22px Arial';c.fillText(round.winner+' 番がゴール！',300,465);}
 else{c.textAlign='left';c.fillStyle='#d8e6e6';c.font='13px Arial';c.fillText(stage===0?'全員スタート':stage===1?'歯車ゲート通過中':stage===2?'揺れる橋を突破！':'最後に逆転するのは？',33,467);}
}
