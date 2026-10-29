// Numbered toddlers wander independently; a uniformly selected winner reaches the goal.
// Deterministic keyframes make movement stable across frame rates and pauses.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export function makeBabyRound(count,winner,seed){
 let s=(seed>>>0)||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const babies=Array.from({length:count},(_,i)=>{
  const n=i+1,side=i%4;
  const x=side===0?40:side===1?560:50+rand()*500;
  const y=side===2?68:side===3?395:80+rand()*295;
  const nodes=[{x,y}];let px=x,py=y;
  for(let j=0;j<15;j++){
   const angle=rand()*Math.PI*2,dist=22+rand()*65;
   px=clamp(px+Math.cos(angle)*dist,35,565);
   py=clamp(py+Math.sin(angle)*dist,68,400);
   // Non-winners can approach the goal but don't enter it before the announcement.
   if(n!==winner&&Math.hypot(px-300,py-235)<52){px=clamp(px+90,35,565);py=clamp(py-75,68,400);}
   nodes.push({x:px,y:py});
  }
  return {n,nodes,sit:rand()<.42,pause:.15+rand()*.63,phase:rand()*6.28};
 });
 return {count,winner,babies};
}
function position(b,p,winner){
 const travel=clamp(p*15,0,15),i=Math.min(14,Math.floor(travel)),u=ease(travel-i);
 const a=b.nodes[i],z=b.nodes[i+1];let x=a.x+(z.x-a.x)*u,y=a.y+(z.y-a.y)*u;
 if(b.n===winner){const t=ease((p-.77)/.23);x+=(300-x)*t;y+=(235-y)*t;}
 return {x,y};
}
function drawToddler(c,x,y,r,n,sit,step){
 c.save();c.translate(x,y);c.scale(r,r);
 c.fillStyle='#e3b89d';c.beginPath();c.arc(0,-13,12,0,Math.PI*2);c.fill();
 c.fillStyle='#283b4a';c.beginPath();c.arc(-4,-14,1.4,0,7);c.arc(4,-14,1.4,0,7);c.fill();
 c.strokeStyle='#7d5650';c.lineWidth=1;c.beginPath();c.arc(0,-8,3,.2,2.9);c.stroke();
 c.fillStyle=['#a5c8c7','#e3b4ad','#c7c2e0','#e6d29b'][n%4];
 c.beginPath();c.roundRect(-12,-1,24,22,8);c.fill();
 c.strokeStyle='#e3b89d';c.lineWidth=4;c.beginPath();
 c.moveTo(-11,6);c.lineTo(-17,sit?16:step?13:4);
 c.moveTo(11,6);c.lineTo(17,sit?16:step?4:13);
 c.moveTo(-6,20);c.lineTo(-9,sit?21:step?29:24);
 c.moveTo(6,20);c.lineTo(9,sit?21:step?24:29);c.stroke();
 c.fillStyle='#233444';c.font='bold 13px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,10);
 c.restore();
}
export function drawBabyRace(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const p=clamp(elapsed/duration,0,1),done=p===1;
 c.clearRect(0,0,600,470);c.fillStyle='#1b3044';c.fillRect(10,10,580,448);
 c.fillStyle='#344f60';c.fillRect(25,54,550,369);
 c.strokeStyle='#a9b8b8';c.lineWidth=3;c.strokeRect(25,54,550,369);
 // Quiet playroom decor and a fixed, softly colored goal.
 c.fillStyle='#58767b';for(let j=0;j<6;j++){c.fillRect(57+j*87,67,17,17);c.fillRect(68+j*84,390,13,13);}
 c.beginPath();c.arc(300,235,36,0,Math.PI*2);c.fillStyle='#466d6a';c.fill();c.strokeStyle='#dfd2a5';c.lineWidth=3;c.stroke();
 c.fillStyle='#f0dfa9';c.font='bold 13px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('こっち？',300,235);
 c.font='bold 19px Arial';c.fillText('赤ちゃんこっちモード',300,31);
 if(round)for(const b of round.babies){
  const {x,y}=reduced&&!done?b.nodes[0]:position(b,p,round.winner);
  const sit=!reduced&&b.sit&&p>=b.pause&&p<b.pause+.065;
  const scale=round.count>65?.51:round.count>36?.64:.82;
  drawToddler(c,x,y,scale,b.n,sit,Math.floor(p*30+b.phase)%2===0);
 }
 c.fillStyle='#e8e0c9';c.font='bold 15px Arial';c.textAlign='center';
 c.fillText(done?round.winner+' 番がゴール！':p<.3?'よちよち出発…':p<.68?'あっちへ、こっちへ…': '誰かゴールへ来るかな？',300,445);
}
