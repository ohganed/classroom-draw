// Numbered toddlers wander independently; a uniformly selected winner reaches the goal.
// Deterministic keyframes make movement stable across frame rates and pauses.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export function makeBabyRound(count,winner,seed){
 let s=(seed>>>0)||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const babies=Array.from({length:count},(_,i)=>{
  const n=i+1;
  // Every child shares the same bottom-left starting point.
  const x=78,y=376;
  const nodes=[{x,y}];let px=x,py=y;
  // A gentle diagonal tendency, mixed with real detours and backtracking.
  // Only the animation is guided; the draw has already chosen the winner.
  for(let j=0;j<15;j++){
   const angle=rand()*Math.PI*2;
   const step=23+rand()*48;
   const driftX=17+rand()*15,driftY=-11-rand()*12;
   px=clamp(px+Math.cos(angle)*step+driftX,53,544);
   py=clamp(py+Math.sin(angle)*step+driftY,100,375);
   // All other babies are free to wander near the goal, not enter its circle.
   if(n!==winner&&Math.hypot(px-507,py-111)<52){
    px=clamp(px-38,53,544);py=clamp(py+52,100,375);
   }
   nodes.push({x:px,y:py});
  }
  return {n,nodes,sit:rand()<.42,pause:.15+rand()*.63,phase:rand()*6.28};
 });
 return {count,winner,babies};
}
function position(b,p,winner){
 const travel=clamp(p*15,0,15),i=Math.min(14,Math.floor(travel)),u=ease(travel-i);
 const a=b.nodes[i],z=b.nodes[i+1];let x=a.x+(z.x-a.x)*u,y=a.y+(z.y-a.y)*u;
 if(b.n===winner){const t=ease((p-.77)/.23);x+=(507-x)*t;y+=(111-y)*t;}
 return {x,y};
}
function drawToddler(c,x,y,r,n,sit,phase,heading,done){
 c.save();c.translate(x,y);
 // Face left or right according to horizontal travel, without spinning the number.
 const face=Math.cos(heading)<-.2?-1:1;
 const bob=sit?0:Math.abs(Math.sin(phase))*2.2*r;
 c.translate(0,-bob);c.scale(r,r);
 if(!sit)c.rotate(Math.sin(phase)*.07);
 const swing=sit?0:Math.sin(phase)*7;
 c.fillStyle='#e4b9a0';c.beginPath();c.arc(0,-18,13,0,Math.PI*2);c.fill();
 c.fillStyle='#354452';c.beginPath();c.arc(-4*face,-19,1.4,0,Math.PI*2);c.arc(4*face,-19,1.4,0,Math.PI*2);c.fill();
 c.strokeStyle='#926c65';c.lineWidth=1;c.beginPath();c.arc(0,-12,3,.2,2.9);c.stroke();
 c.fillStyle=['#a5c8c7','#e3b4ad','#c7c2e0','#e6d29b'][n%4];
 c.beginPath();c.roundRect(-15,-3,30,28,8);c.fill();
 c.strokeStyle='#e4b9a0';c.lineWidth=4;c.lineCap='round';c.beginPath();
 c.moveTo(-14,6);c.lineTo(-20,9+swing);
 c.moveTo(14,6);c.lineTo(20,9-swing);
 c.moveTo(-7,23);c.lineTo(-10,31-swing);
 c.moveTo(7,23);c.lineTo(10,31+swing);c.stroke();
 // High-contrast number plate is readable independently of clothing color.
 c.fillStyle=done?'#f5dc9b':'#f0f5f7';c.beginPath();c.roundRect(-15,0,30,24,5);c.fill();
 c.fillStyle='#13293c';c.font='900 21px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,12);
 c.restore();
}
function headingAt(b,p,winner){
 const a=position(b,clamp(p-.006,0,1),winner),z=position(b,clamp(p+.006,0,1),winner);
 return Math.atan2(z.y-a.y,z.x-a.x);
}
export function drawBabyRace(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const p=clamp(elapsed/duration,0,1),done=p===1;
 c.clearRect(0,0,600,470);c.fillStyle='#1b3044';c.fillRect(10,10,580,448);
 c.fillStyle='#344f60';c.fillRect(25,54,550,369);
 c.strokeStyle='#a9b8b8';c.lineWidth=3;c.strokeRect(25,54,550,369);
 // Quiet playroom decor and a fixed, softly colored goal.
 c.fillStyle='#58767b';for(let j=0;j<6;j++){c.fillRect(57+j*87,67,17,17);c.fillRect(68+j*84,390,13,13);}
 c.beginPath();c.arc(507,111,35,0,Math.PI*2);c.fillStyle='#466d6a';c.fill();c.strokeStyle='#dfd2a5';c.lineWidth=3;c.stroke();
 c.fillStyle='#f0dfa9';c.font='bold 13px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('こっち？',507,111);
 c.font='bold 19px Arial';c.fillText('赤ちゃんこっちモード',300,31);
 c.font='bold 12px Arial';c.fillText('スタート',79,405);
 if(round)for(const b of round.babies){
  const {x,y}=reduced&&!done?b.nodes[0]:position(b,p,round.winner);
  const sit=!reduced&&b.sit&&p>=b.pause&&p<b.pause+.065;
  const scale=round.count>65?.87:round.count>36?1.1:round.count>15?1.5:2.1;
  const heading=reduced?0:headingAt(b,p,round.winner);
  drawToddler(c,x,y,scale,b.n,sit,elapsed/170+b.phase,heading,done&&b.n===round.winner);
 }
 c.fillStyle='#e8e0c9';c.font='bold 15px Arial';c.textAlign='center';
 c.fillText(done?round.winner+' 番がゴール！':p<.3?'よちよち出発…':p<.68?'あっちへ、こっちへ…': '誰かゴールへ来るかな？',300,445);
}
