// Crane-game animation. Uniform winning number is chosen independently by app.js.
// Pre-sampled animation parameters stay fixed for a round; no flashing.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function rand(seed){let s=(seed>>>0)||1;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function makeCraneRound(count,winner,seed){
 const r=rand(seed),balls=[];
 // Every eligible number has a capsule. A staggered pile leaves room for the claw.
 for(let i=0;i<count;i++){
  const col=i%11,row=Math.floor(i/11),x=61+col*43+(r()-.5)*9,y=360-row*32+(r()-.5)*12;
  balls.push({number:i+1,x,y,shade:Math.floor(r()*3)});
 }
 const misses=1+Math.floor(r()*2);
 const fake=Array.from({length:misses},()=>1+Math.floor(r()*count)).map(n=>n===winner?(n%count)+1:n);
 return {balls,winner,misses,fake,offset:r()*24-12};
}
function capsule(c,x,y,n,shade=0,r=16,alpha=1){
 c.save();c.globalAlpha=alpha;
 c.fillStyle=['#93adbe','#b8a1aa','#a9b7a0'][shade%3];
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
 c.strokeStyle='#e0e8ed';c.lineWidth=1.3;c.stroke();
 c.beginPath();c.moveTo(x-r+3,y+3);c.lineTo(x+r-3,y+3);c.strokeStyle='#54677b';c.stroke();
 c.fillStyle='#172738';c.font='bold '+(r<13?9:12)+'px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),x,y-3);
 c.restore();
}
export function drawCrane(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const p=clamp(elapsed/duration,0,1),done=p>=1;
 c.clearRect(0,0,600,470);
 c.fillStyle='#162a40';c.fillRect(20,12,560,443);
 c.fillStyle='#263c53';c.fillRect(33,29,534,34);
 c.fillStyle='#324b61';c.fillRect(34,414,532,28);
 c.fillStyle='#263c53';c.fillRect(36,240,528,170);
 c.strokeStyle='#a3b5c4';c.lineWidth=3;c.strokeRect(36,69,528,344);
 c.fillStyle='#1a3449';c.fillRect(42,282,516,123);
 c.fillStyle='#647f94';c.fillRect(40,396,520,13);
 c.fillStyle='#d4c08e';c.font='bold 15px Arial';c.textAlign='left';c.fillText('CAPSULE CATCH',47,51);
 c.fillStyle='#b1c1ce';c.font='12px Arial';c.fillText('PRIZE',462,51);
 if(!round){c.fillStyle='#b7c7d5';c.textAlign='center';c.font='bold 18px Arial';c.fillText('クレーンゲーム抽選',300,175);return;}
 // Capsules are stable in the bin, including the winner until the final grasp.
 for(const b of round.balls){
  const hide=done&&b.number===round.winner;
  if(!hide)capsule(c,b.x,b.y,b.number,b.shade,14,1);
 }
 const attempts=round.misses+1,section=p*attempts,attempt=Math.min(attempts-1,Math.floor(section)),q=done?1:section-attempt;
 const final=attempt===attempts-1;
 const number=final?round.winner:round.fake[attempt];
 const ball=round.balls[number-1];
 const approach=ease(q/.18),lower=ease((q-.18)/.26),lift=ease((q-.52)/.27);
 const armX=290+(ball.x-290)*approach;
 const armY=86+(ball.y-115)*lower*(1-lift);
 const caught=q>.47&&q<.85,release= !final&&q>=.82;
 // Misses are allowed; the final attempt always collects the uniformly selected capsule.
 c.strokeStyle='#c1cdd5';c.lineWidth=5;c.beginPath();c.moveTo(armX,62);c.lineTo(armX,armY);c.stroke();
 c.fillStyle='#9aaebd';c.fillRect(armX-25,armY-6,50,16);
 const opening=caught?8:23;
 c.strokeStyle='#d4dde3';c.lineWidth=5;c.lineCap='round';
 c.beginPath();c.moveTo(armX-16,armY+10);c.lineTo(armX-opening,armY+36);c.lineTo(armX-opening+6,armY+48);
 c.moveTo(armX+16,armY+10);c.lineTo(armX+opening,armY+36);c.lineTo(armX+opening-6,armY+48);c.stroke();
 if(caught){
  capsule(c,armX,armY+53,number,ball.shade,14,1);
 }
 if(release){
  const falling=clamp((q-.82)/.18,0,1);
  capsule(c,armX+(falling*18),armY+53+falling*falling*125,number,ball.shade,14,1-falling*.5);
 }
 if(done){
  // Keep the winning capsule clearly displayed inside the collection tray.
  c.fillStyle='#334b62';c.fillRect(402,90,143,120);
  c.strokeStyle='#aebfcc';c.lineWidth=2;c.strokeRect(402,90,143,120);
  capsule(c,473,150,round.winner,1,34);
  c.font='bold 19px Arial';c.textAlign='center';c.fillStyle='#ead3a0';c.fillText(round.winner+' 番をGET!',300,450);
 }else{
  c.font='bold 15px Arial';c.fillStyle='#e2cfaa';c.textAlign='center';
  c.fillText(reduced?'カプセル抽選中':final?'最後のチャレンジ！':'もう一度チャレンジ！',300,450);
 }
}
