// Pirate fleet: the result is preselected uniformly; storms only animate eliminations.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=cl(x);return x*x*(3-2*x)};
export function makePirateRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const exits=new Map(others.map((n,i)=>[n,.16+.76*(i+.5*rand())/Math.max(1,others.length)]));
 return {count,winner,ships:Array.from({length:count},(_,i)=>({n:i+1,x:35+(i%8)*16,y:100+Math.floor(i/8)*60,phase:rand()*6.28,drift:(rand()-.5)*90,exit:exits.get(i+1)??Infinity,side:rand()>.5?1:-1}))};
}
function ship(c,b,x,y,scale,tilt,champion=false){
 c.save();c.translate(x,y);c.rotate(tilt);c.scale(scale,scale);
 c.fillStyle=champion?'#ebc777':'#aa7053';c.beginPath();c.moveTo(-21,8);c.lineTo(21,8);c.lineTo(13,19);c.lineTo(-13,19);c.closePath();c.fill();
 c.strokeStyle='#d8d3b9';c.lineWidth=2;c.beginPath();c.moveTo(0,8);c.lineTo(0,-24);c.stroke();
 c.fillStyle='#eee1b7';c.beginPath();c.moveTo(1,-24);c.lineTo(16,-3);c.lineTo(1,-3);c.closePath();c.fill();
 c.fillStyle='#fff5ce';c.beginPath();c.roundRect(-14,-3,28,17,4);c.fill();c.fillStyle='#193347';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(b.n),0,6);c.restore();
}
export function drawPirate(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#143a58';c.fillRect(0,0,600,480);
 for(let i=0;i<12;i++){c.strokeStyle=i%2?'#386b81':'#2d6078';c.lineWidth=6;c.beginPath();const y=74+i*32;c.moveTo(20,y);for(let x=20;x<590;x+=18)c.lineTo(x,y+Math.sin(x*.035+t*12+i)*7);c.stroke();}
 c.fillStyle='#cab278';c.beginPath();c.ellipse(538,236,37,95,-.2,0,7);c.fill();
 c.fillStyle='#477f58';c.beginPath();c.ellipse(548,213,23,48,.2,0,7);c.fill();
 c.fillStyle='#fff1ba';c.font='bold 19px Arial';c.textAlign='center';c.fillText('海賊船の大航海',300,29);
 c.font='bold 13px Arial';c.fillText('宝島',544,355);
 if(!round)return;
 let remaining=0;
 for(const b of round.ships){
  const out=t>=b.exit;if(out&&t>b.exit+.075)continue;if(!out)remaining++;
  // Every surviving ship sails continuously toward the island on the right.
  const progress=cl(t*(b.n===round.winner?1:0.72)+Math.sin(t*8+b.phase)*.012);
  let x=b.x+(b.n===round.winner?524:472-b.x)*smooth(progress)+Math.sin(t*16+b.phase)*6;
  let y=b.y+(250-b.y)*smooth(progress)+Math.sin(t*21+b.phase)*8;
  if(out){let z=cl((t-b.exit)/.075);x+=b.side*z*200;y+=z*90;}
  let angle=out?b.side*cl((t-b.exit)/.075)*1.3:Math.sin(t*17+b.phase)*.24;
  const arrival=b.n===round.winner?smooth((t-.78)/.22):0;
  x+=(524-x)*arrival;y+=(250-y)*arrival;
  ship(c,b,x,y,done?2:1+arrival*.9,reduced?0:angle,b.n===round.winner&&done);
 }
 c.fillStyle='#f5e8bd';c.font='bold 17px Arial';c.fillText(done?round.winner+'番が宝島に到着！':'航海中　残り '+remaining+' 隻',300,461);
}
