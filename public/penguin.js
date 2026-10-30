// Penguin slide race. Winner is uniformly selected by the parent app.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function makePenguinRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const exit=new Map(others.map((n,i)=>[n,.16+.73*(i+rnd()*.4)/Math.max(1,others.length)]));
 return {winner,count,birds:Array.from({length:count},(_,i)=>({n:i+1,lane:i%8,row:Math.floor(i/8),wiggle:rnd()*6.28,speed:.7+rnd()*.45,spin:rnd()>.5?1:-1,exit:exit.get(i+1)??Infinity}))};
}
function penguin(c,b,x,y,angle,scale,winner){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
 c.fillStyle=winner?'#f5d68b':'#253f56';c.beginPath();c.ellipse(0,0,15,20,0,0,7);c.fill();
 c.fillStyle='#fff3e0';c.beginPath();c.ellipse(0,4,10,14,0,0,7);c.fill();
 c.fillStyle='#eaa962';c.beginPath();c.moveTo(-5,-9);c.lineTo(5,-9);c.lineTo(0,-3);c.closePath();c.fill();
 for(const ex of [-6,6]){c.fillStyle='#fff';c.beginPath();c.arc(ex,-13,4,0,7);c.fill();c.fillStyle='#142739';c.beginPath();c.arc(ex,-13,2,0,7);c.fill();}
 c.fillStyle='#fff8d8';c.beginPath();c.roundRect(-13,0,26,17,4);c.fill();c.fillStyle='#21384e';c.font='900 15px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(b.n),0,8);c.restore();
}
export function drawPenguin(canvas,round,elapsed=0,duration=9000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#1c4260';c.fillRect(0,0,600,480);
 c.fillStyle='#b6dee4';c.beginPath();c.moveTo(20,57);c.lineTo(580,57);c.lineTo(550,435);c.lineTo(48,435);c.closePath();c.fill();
 for(let j=0;j<8;j++){c.strokeStyle=j%2?'#a0cfd9':'#ecf9f6';c.lineWidth=3;c.beginPath();c.moveTo(60+j*68,70);c.lineTo(66+j*67,430);c.stroke();}
 c.fillStyle='#e7f5ef';c.font='bold 20px Arial';c.textAlign='center';c.fillText('ペンギンすべり台レース',300,30);
 if(!round)return;
 let remaining=0;
 for(const b of round.birds){
  const out=t>=b.exit;
  if(out&&t>b.exit+.075)continue;
  if(!out)remaining++;
  const drift=Math.sin(t*24+b.wiggle)*14;
  const y=82+cl(t*b.speed*1.18)*330+b.row*5;
  const x=65+b.lane*67+drift+(out?b.spin*150*cl((t-b.exit)/.075):0);
  const spin=out?b.spin*Math.PI*1.4*cl((t-b.exit)/.075):Math.sin(t*17+b.wiggle)*.22;
  const finale=b.n===round.winner?cl((t-.84)/.16):0;
  penguin(c,b,x+(300-x)*finale,y+(255-y)*finale,reduced?0:spin,done?2.1:1+finale,b.n===round.winner&&done);
 }
 c.fillStyle='#21415a';c.font='bold 18px Arial';c.textAlign='center';c.fillText(done?round.winner+'番がゴール！':'すべって転んで、残り '+remaining+' 羽！',300,460);
}
