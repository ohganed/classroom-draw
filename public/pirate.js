// Pirate fleet: the result is preselected uniformly; storms only animate eliminations.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=cl(x);return x*x*(3-2*x)};
export function makePirateRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 return {count,winner,ships:Array.from({length:count},(_,i)=>({n:i+1,x:38+(i%8)*17,y:95+Math.floor(i/8)*58,phase:rand()*6.28,windEffect:rand(),resistance:rand()*.7,side:rand()>.5?1:-1,speed:.57+rand()*.70,drift:(rand()-.5)*75,sway:3+rand()*15}))};
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
 // Wind indicators: blue arrows point to the right for tailwind, amber to the left for headwind.
 const wind=Math.sin(t*17+1.1)+.35*Math.sin(t*31);
 const tailwind=wind>=0,dir=tailwind?1:-1;
 c.save();c.fillStyle='rgba(18,40,61,.88)';c.fillRect(164,40,272,40);
 c.font='bold 15px Arial';c.textAlign='center';c.fillStyle=tailwind?'#bde9f5':'#ffdb98';
 c.fillText(tailwind?'追い風　→　宝島へ':'逆風　←　進みにくい',300,58);
 c.strokeStyle=tailwind?'#bde9f5':'#ffdb98';c.lineWidth=3;
 for(let k=0;k<4;k++){const x=205+k*59,y=69;c.beginPath();c.moveTo(x-dir*14,y);c.lineTo(x+dir*14,y);c.lineTo(x+dir*7,y-5);c.moveTo(x+dir*14,y);c.lineTo(x+dir*7,y+5);c.stroke();}
 c.restore();
 for(const b of round.ships){
  // Ships vary in how strongly they respond to wind. The average forward speed
  // remains positive, except for the most wind-sensitive ships in a headwind.
  const influence=b.windEffect;
  const headwind=wind<0?Math.abs(wind):0;
  const gust=wind>0?wind:0;
  const slow=influence>.5?headwind*(.75+b.resistance):headwind*.12;
  const boost=influence>.36?gust*.36:gust*.05;
  const base=(b.n===round.winner?1:.76)*b.speed;
  // Integral-like continuous travel with pronounced slowdowns and reversals.
  const progress=cl(t*base +(boost-slow)*Math.sin(Math.PI*t)*.20);
  let x=b.x+(524-b.x)*smooth(progress)+Math.sin(t*(8+b.speed*9)+b.phase)*10;
  let y=b.y+(250-b.y)*smooth(progress)+Math.sin(t*(11+b.speed*13)+b.phase)*b.sway+b.drift*Math.sin(Math.PI*t);
  const arrival=b.n===round.winner?smooth((t-.85)/.15):0;
  x+=(524-x)*arrival;y+=(250-y)*arrival;
  const angle=Math.sin(t*19+b.phase)*.19+(influence>.5?-wind*.12:0);
  ship(c,b,x,y,done&&b.n===round.winner?2:1+arrival*.8,reduced?0:angle,b.n===round.winner&&done);
 }
 c.fillStyle='#f5e8bd';c.font='bold 17px Arial';c.textAlign='center';
 c.fillText(done?round.winner+'番が宝島に到着！':'航海中　'+round.count+' 隻　（全船表示）',300,461);
}
