// Ghost-house lottery: animation is independent of the uniformly sampled winner.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function makeGhostRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const exits=new Map(others.map((n,i)=>[n,.15+.76*(i+rand()*.5)/Math.max(1,others.length)]));
 return {winner,count,ghosts:Array.from({length:count},(_,i)=>({n:i+1,x:45+(i%10)*57,y:102+Math.floor(i/10)*83,phase:rand()*6.283,exit:exits.get(i+1)??Infinity,door:Math.floor(rand()*4),dir:rand()>.5?1:-1}))};
}
function ghost(c,g,x,y,scale,alpha=1){
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(scale,scale);
 c.fillStyle=['#b4dfeb','#ddd1f3','#d7e8bb','#f1d9cb'][g.n%4];c.beginPath();c.moveTo(-17,14);c.lineTo(-17,-3);c.arc(0,-3,17,Math.PI,0);c.lineTo(17,16);c.lineTo(10,11);c.lineTo(4,17);c.lineTo(-4,11);c.lineTo(-11,17);c.closePath();c.fill();
 c.fillStyle='#183349';c.beginPath();c.ellipse(-6,-5,3,5,0,0,7);c.ellipse(6,-5,3,5,0,0,7);c.fill();
 c.fillStyle='#fff8d9';c.beginPath();c.roundRect(-14,1,28,17,4);c.fill();c.fillStyle='#1a3346';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(g.n),0,9);c.restore();
}
export function drawGhostHouse(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=clamp(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#18203b';c.fillRect(0,0,600,480);
 c.fillStyle='#283149';c.fillRect(18,56,564,378);c.strokeStyle='#686780';c.lineWidth=5;c.strokeRect(18,56,564,378);
 for(let k=0;k<4;k++){let x=84+k*145;c.fillStyle='#101b34';c.fillRect(x,343,66,90);c.fillStyle='#9d89a5';c.font='bold 13px Arial';c.textAlign='center';c.fillText('EXIT',x+33,335);}
 for(let k=0;k<7;k++){let x=42+k*83;c.fillStyle='#e0cd89';c.fillRect(x,72,35,31);c.fillStyle='#263854';c.fillRect(x+4,76,27,23);}
 c.fillStyle='#f5e6ba';c.textAlign='center';c.font='bold 20px Arial';c.fillText('お化け屋敷・幽霊大脱走',300,29);
 if(!round)return;
 let remaining=0;
 for(const g of round.ghosts){
  const exit=t>=g.exit;
  const z=exit?clamp((t-g.exit)/.065):0;
  if(z>=1)continue;
  if(!exit)remaining++;
  let x=g.x+(reduced?0:Math.sin(t*27+g.phase)*19),y=g.y+(reduced?0:Math.cos(t*19+g.phase)*18);
  if(exit){const dx=117+g.door*145;x+=(dx-x)*z;y+=(398-y)*z;}
  const finale=g.n===round.winner?clamp((t-.85)/.15):0;
  x+=(300-x)*finale;y+=(235-y)*finale;
  ghost(c,g,x,y,done?2.4:1+finale*1.1,1-z);
 }
 c.fillStyle='#f8e5b8';c.font='bold 18px Arial';c.fillText(done?round.winner+'番の幽霊が最後まで残った！':'残り '+remaining+' 匹！',300,460);
}
