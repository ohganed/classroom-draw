// Monkeys climbing trees. A separately chosen uniform winner always reaches the crown.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function makeMonkeyRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const falls=new Map(losers.map((n,i)=>[n,.14+.72*(i+r()*.35)/Math.max(1,losers.length)]));
 const monkeys=Array.from({length:count},(_,i)=>({n:i+1,tree:i%5,offset:((Math.floor(i/5)%8)-3.5)*8,phase:r()*6.28,fall:falls.get(i+1)??Infinity,side:r()>.5?1:-1}));
 const coconuts=monkeys.filter(m=>m.n!==winner).map(m=>({target:m.n,impact:m.fall,start:Math.max(.05,m.fall-(.09+r()*.035)),side:r()>.5?1:-1,curve:(r()-.5)*30}));
 for(let i=0;i<35;i++){const impact=.12+r()*.78;coconuts.push({target:0,impact,start:Math.max(.04,impact-.07-r()*.04),side:r()>.5?1:-1,x:35+r()*530,y:120+r()*270,curve:(r()-.5)*55});}
 return {winner,count,monkeys,coconuts};
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
function coconut(c,x,y,rot){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle='#835337';c.beginPath();c.arc(0,0,11,0,Math.PI*2);c.fill();c.fillStyle='#b28a62';c.beginPath();c.arc(-3,-4,3,0,Math.PI*2);c.fill();c.fillStyle='#513525';for(const [a,b] of [[3,-2],[-1,4],[5,5]]){c.beginPath();c.arc(a,b,1.7,0,Math.PI*2);c.fill();}c.restore();}
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
 // Coconuts fly in from BOTH sides, with each hit timed to a monkey's fall.
 for(const nut of round.coconuts||[]){
  if(t<nut.start||t>nut.impact+.035)continue;
  const u=cl((t-nut.start)/(nut.impact-nut.start));
  const m=nut.target?round.monkeys[nut.target-1]:null;
  const arrivalX=m?70+m.tree*115+m.offset*.55+Math.sin(nut.impact*20+m.phase)*6:nut.x;
  const arrivalY=m?391-285*cl(nut.impact*.98+.04*Math.sin(nut.impact*12+m.phase)):nut.y;
  const x=(nut.side<0?-25:625)*(1-u)+arrivalX*u;
  const y=arrivalY+Math.sin(Math.PI*u)*nut.curve;
  coconut(c,x,y,t*30);
  if(m&&Math.abs(t-nut.impact)<.016){c.strokeStyle='rgba(255,224,126,.85)';c.lineWidth=3;c.beginPath();c.arc(arrivalX,arrivalY,16+(t-nut.impact+.016)*390,0,Math.PI*2);c.stroke();}
 }
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
 c.fillStyle='#2c4e35';c.font='bold 18px Arial';c.fillText(done?round.winner+'番の猿がてっぺんに！':'ココナッツ襲来！ 残り '+remaining+' 匹',300,463);
}
