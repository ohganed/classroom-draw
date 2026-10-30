// Monkeys climbing trees. A separately chosen uniform winner always reaches the crown.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function makeMonkeyRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const falls=new Map(losers.map((n,i)=>[n,.14+.72*(i+r()*.35)/Math.max(1,losers.length)]));
 return {winner,count,monkeys:Array.from({length:count},(_,i)=>({n:i+1,tree:i%5,offset:((Math.floor(i/5)%8)-3.5)*8,phase:r()*6.28,fall:falls.get(i+1)??Infinity,side:r()>.5?1:-1}))};
}
function monkey(c,n,x,y,angle=0,scale=1){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
 c.strokeStyle='#78503b';c.lineWidth=5;c.lineCap='round';c.beginPath();c.arc(14,4,13,-1.5,1.9);c.stroke();
 c.fillStyle='#9b6b4c';c.beginPath();c.ellipse(0,7,13,16,0,0,7);c.fill();
 c.beginPath();c.arc(0,-12,15,0,7);c.fill();
 c.beginPath();c.arc(-14,-12,6,0,7);c.arc(14,-12,6,0,7);c.fill();
 c.fillStyle='#edc6a0';c.beginPath();c.ellipse(0,-9,11,10,0,0,7);c.fill();
 c.fillStyle='#26333a';c.beginPath();c.arc(-5,-13,2,0,7);c.arc(5,-13,2,0,7);c.fill();
 c.fillStyle='#fff2d1';c.beginPath();c.roundRect(-14,2,28,18,5);c.fill();
 c.fillStyle='#253a49';c.textAlign='center';c.textBaseline='middle';c.font='900 15px Arial';c.fillText(n,0,11);
 c.restore();
}
export function drawMonkey(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.fillStyle='#e7f2db';c.fillRect(0,0,600,480);
 c.fillStyle='#c8e2bc';c.fillRect(0,400,600,80);
 for(let j=0;j<5;j++){
  const x=70+j*115;c.strokeStyle='#865941';c.lineWidth=18;c.beginPath();c.moveTo(x,408);c.lineTo(x,90);c.stroke();
  c.strokeStyle='#91694b';c.lineWidth=7;for(let k=0;k<4;k++){const y=140+k*67;c.beginPath();c.moveTo(x,y);c.lineTo(x+(k%2?42:-42),y-27);c.stroke();}
  c.fillStyle='#77a877';for(const [dx,dy,r] of [[0,90,31],[-24,107,25],[24,105,25],[0,69,22]]){c.beginPath();c.arc(x+dx,dy,r,0,7);c.fill();}
 }
 c.fillStyle='#2c4e35';c.textAlign='center';c.font='bold 23px Arial';c.fillText('猿も木から落ちる！',300,32);
 if(!round)return;
 let remaining=0;
 for(const b of round.monkeys){
  const fallen=t>=b.fall,age=cl((t-b.fall)/.09);
  if(fallen&&age>=1)continue;
  if(!fallen)remaining++;
  const xBase=70+b.tree*115+b.offset*.55;
  const climb=cl(t*.98+.04*Math.sin(t*12+b.phase));
  let x=xBase+(reduced?0:Math.sin(t*20+b.phase)*6);
  let y=391-285*climb;
  if(fallen){x+=b.side*105*age;y+=190*age*age;}
  let angle=fallen?b.side*age*3:Math.sin(t*19+b.phase)*.15;
  const finale=b.n===round.winner?cl((t-.88)/.12):0;
  x+=(300-x)*finale;y+=(91-y)*finale;
  monkey(c,b.n,x,y,reduced?0:angle,done&&b.n===round.winner?2.2:1+finale*.3);
 }
 c.fillStyle='#2c4e35';c.font='bold 18px Arial';c.fillText(done?round.winner+'番の猿がてっぺんに！':'木登り中　残り '+remaining+' 匹',300,463);
}
