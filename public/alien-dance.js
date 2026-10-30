// Alien dance elimination: animation never influences uniformly sampled winner.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function makeAlienRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const exits=new Map(losers.map((n,i)=>[n,0.16+0.76*(i+rand()*.5)/Math.max(1,losers.length)]));
 const aliens=Array.from({length:count},(_,i)=>({n:i+1,x:45+(i%10)*57,y:91+Math.floor(i/10)*77,phase:rand()*6.283,style:Math.floor(rand()*4),exit:exits.get(i+1)??Infinity,side:rand()>.5?1:-1}));
 return {count,winner,aliens};
}
function dancer(c,a,t,scale,depart=0){
 const w=Math.sin(t*(a.style%2?17:23)+a.phase),v=Math.cos(t*19+a.phase);
 c.save();c.translate(a.x+depart*a.side*160+w*5,a.y+Math.abs(w)*-5);c.rotate(w*.12);c.scale(scale,scale);
 c.strokeStyle='#96c9be';c.lineWidth=4;c.lineCap='round';
 c.beginPath();c.moveTo(-8,13);c.lineTo(-11+w*4,22);c.moveTo(8,13);c.lineTo(11-w*4,22);c.moveTo(-12,-1);c.lineTo(-22-w*4,-9+v*5);c.moveTo(12,-1);c.lineTo(22+w*4,-9-v*5);c.stroke();
 c.fillStyle=['#9cdbb4','#b6b0ed','#f0c58d','#8bd2d9'][a.n%4];c.beginPath();c.ellipse(0,0,16,17,0,0,7);c.fill();
 c.beginPath();c.ellipse(0,-17,13,12,0,0,7);c.fill();
 for(let e of [-6,6]){c.fillStyle='#fff';c.beginPath();c.ellipse(e,-19,5,6,0,0,7);c.fill();c.fillStyle='#163047';c.beginPath();c.arc(e+w,-19,2.1,0,7);c.fill();}
 c.fillStyle='#fff9df';c.beginPath();c.roundRect(-14,-6,28,19,5);c.fill();c.fillStyle='#162b40';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(a.n),0,3);c.restore();
}
export function drawAlienDance(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const p=clamp(elapsed/duration),done=p>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#18203d';c.fillRect(0,0,600,480);
 c.fillStyle='#302e56';c.fillRect(22,52,556,382);
 c.fillStyle='#5c5279';for(let i=0;i<10;i++)for(let j=0;j<6;j++){c.fillStyle=(i+j)%2?'#51446a':'#443f69';c.fillRect(25+i*55,65+j*60,53,58);}
 c.fillStyle='#f4e5bc';c.font='bold 19px Arial';c.textAlign='center';c.fillText('宇宙人ダンス大会',300,30);
 if(!round)return;
 const remaining=round.aliens.filter(a=>p<a.exit).length;
 if(p>.85||done){c.fillStyle='rgba(255,226,153,.12)';c.beginPath();c.moveTo(300,42);c.lineTo(186,432);c.lineTo(414,432);c.closePath();c.fill();}
 for(const a of round.aliens){
  if(p>=a.exit){const progress=clamp((p-a.exit)/.045);if(progress>=1)continue;dancer(c,a,reduced?0:p,round.count>50?.68:.83,progress);continue;}
  if(done&&a.n!==round.winner)continue;
  const finale=a.n===round.winner&&p>.85;
  if(finale){const z=clamp((p-.85)/.15);const center={...a,x:a.x+(300-a.x)*z,y:a.y+(242-a.y)*z};dancer(c,center,reduced?0:p,0.83+z*1.8); }
  else dancer(c,a,reduced?0:p,round.count>50?.68:.83);
 }
 c.font='bold 17px Arial';c.fillStyle='#f9dfab';c.textAlign='center';
 c.fillText(done?round.winner+'番がダンス優勝！':'ステージに残り '+remaining+' 人',300,463);
}
