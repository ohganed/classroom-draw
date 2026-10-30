// Washing machine lottery: the winner is chosen fairly by app.js.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function makeWasherRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 return {winner,count,balls:Array.from({length:count},(_,i)=>({n:i+1,angle:i*2.39996,rad:28+Math.sqrt((i+.5)/count)*116,offset:r()*6.28,rate:.8+r()*.5}))};
}
export function drawWasher(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#dce8eb';c.fillRect(0,0,600,480);
 c.fillStyle='#edf4f5';c.beginPath();c.roundRect(65,25,470,430,24);c.fill();c.strokeStyle='#7898a5';c.lineWidth=7;c.stroke();
 c.fillStyle='#365d75';c.beginPath();c.roundRect(110,43,380,53,10);c.fill();
 c.fillStyle='#fff6c9';c.font='bold 20px Arial';c.textAlign='center';c.fillText('ぐるぐる洗濯機抽選',300,76);
 c.fillStyle='#aec5ce';c.beginPath();c.arc(300,268,168,0,7);c.fill();
 c.fillStyle='#173b54';c.beginPath();c.arc(300,268,152,0,7);c.fill();
 c.strokeStyle='#b2ced5';c.lineWidth=8;c.beginPath();c.arc(300,268,152,0,7);c.stroke();
 c.save();c.beginPath();c.arc(300,268,144,0,7);c.clip();
 for(let j=0;j<5;j++){c.strokeStyle='rgba(127,205,221,.3)';c.lineWidth=3;c.beginPath();c.arc(300,268,40+j*23,0,7);c.stroke();}
 if(round){
  const turning=t<.35?t*28:t<.6?9.8-(t-.35)*32:t<.8?1.8+(t-.6)*34:8.6+(t-.8)*4;
  for(const b of round.balls){
   const spin=reduced?0:turning*b.rate;
   const angle=b.angle+spin;
   const settle=t>.8?cl((t-.8)/.15):0;
   const radius=b.rad*(1-settle*.27);
   const x=300+Math.cos(angle)*radius,y=268+Math.sin(angle)*radius+settle*36;
   c.fillStyle=['#f9bb96','#b1d9ef','#d8c1e8','#aed6b7'][b.n%4];c.beginPath();c.arc(x,y,14,0,7);c.fill();
   c.fillStyle='#183a51';c.font='900 13px Arial';c.textBaseline='middle';c.fillText(String(b.n),x,y+1);
  }
 }
 c.restore();
 // Open door in the final stage and present only the sampled winner in the chute.
 if(t>.81){
  const open=cl((t-.81)/.09);
  c.strokeStyle='#66899a';c.lineWidth=10;c.beginPath();c.ellipse(300-90*open,268,152,152+10*open,-.4*open,0,7);c.stroke();
 }
 if(round&&t>.89){
  const p=cl((t-.89)/.11),x=300+(p*220),y=268+p*99;
  c.fillStyle='#f4ca72';c.beginPath();c.arc(x,y,16+30*p,0,7);c.fill();
  c.fillStyle='#193a53';c.font='900 '+Math.round(16+28*p)+'px Arial';c.textBaseline='middle';c.fillText(String(round.winner),x,y);
 }
 c.fillStyle='#22465c';c.font='bold 18px Arial';c.textBaseline='alphabetic';
 c.fillText(done?round.winner+' 番を取り出しました！':t<.6?'高速回転！ 逆回転！':t<.84?'脱水終了、まもなく停止':'扉が開いた！',300,472);
}
