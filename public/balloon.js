// Balloon survival: visual elimination only; winner is chosen uniformly by app.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function makeBalloonRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const exit=new Map(others.map((n,i)=>[n,.14+.76*(i+.3*rnd())/Math.max(1,others.length)]));
 return {winner,count,balloons:Array.from({length:count},(_,i)=>({n:i+1,x:40+(i%10)*57,y:100+Math.floor(i/10)*78,phase:rnd()*6.28,dir:rnd()>.5?1:-1,wind:12+rnd()*23,exit:exit.get(i+1)??Infinity}))};
}
function balloon(c,b,x,y,r,win=false){
 c.save();c.translate(x,y);c.scale(r,r);
 c.strokeStyle='#d2dce3';c.lineWidth=2;c.beginPath();c.moveTo(0,23);c.quadraticCurveTo(12,32,-2,43);c.stroke();
 c.fillStyle=win?'#f8d28c':['#f3a7b6','#91c5e5','#c9b3ed','#9fcfbb','#edc58b'][b.n%5];
 c.beginPath();c.ellipse(0,0,20,24,0,0,Math.PI*2);c.fill();
 c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(-7,-9,5,10,-.3,0,7);c.fill();
 c.fillStyle='#fffdf0';c.beginPath();c.roundRect(-16,-7,32,20,5);c.fill();
 c.fillStyle='#23364b';c.font='900 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(b.n),0,3);c.restore();
}
export function drawBalloon(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;let t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#173c63';c.fillRect(0,0,600,480);
 for(let k=0;k<8;k++){let x=25+(k*113)%530,y=60+(k*89)%300;c.fillStyle='rgba(224,238,245,.13)';c.beginPath();c.ellipse(x,y,55,15,0,0,7);c.fill();}
 c.fillStyle='#f4e3b4';c.font='bold 20px Arial';c.textAlign='center';c.fillText('風船サバイバル',300,30);
 if(!round)return;
 let remaining=0;
 for(const b of round.balloons){
  let leaving=t>=b.exit;
  if(leaving&&t>b.exit+.08)continue;
  if(!leaving)remaining++;
  let wind=reduced?0:Math.sin(t*21+b.phase)*b.wind;
  let x=b.x+wind+(leaving?b.dir*200*cl((t-b.exit)/.08):0);
  let y=b.y+(reduced?0:Math.sin(t*13+b.phase)*12)-(leaving?120*cl((t-b.exit)/.08):0);
  const finale=b.n===round.winner&&t>.85?cl((t-.85)/.15):0;
  if(finale){x+=(300-x)*finale;y+=(230-y)*finale;}
  balloon(c,b,x,y,done?2.1:1+finale,b.n===round.winner&&done);
 }
 c.fillStyle='#fff0c3';c.font='bold 18px Arial';c.fillText(done?round.winner+'番が最後まで残った！':'残り '+remaining+' 個',300,464);
}
