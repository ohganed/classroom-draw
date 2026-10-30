// Treasure Island 2: boats arrive, captains disembark, and race for the chest.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
export function makeTreasureRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const finalists=[winner,...others.slice(0,Math.min(7,count-1))];
 return {winner,count,ships:Array.from({length:count},(_,i)=>({n:i+1,x:20+(i%8)*18,y:86+Math.floor(i/8)*66,phase:rand()*6.28,landing:finalists.includes(i+1),row:finalists.indexOf(i+1),delay:rand()*.12,pace:.55+rand()*.25}))};
}
function boat(c,x,y,n,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.fillStyle='#9b6d50';c.beginPath();c.moveTo(-18,4);c.lineTo(18,4);c.lineTo(10,15);c.lineTo(-10,15);c.closePath();c.fill();
 c.strokeStyle='#f0d9ac';c.lineWidth=2;c.beginPath();c.moveTo(0,4);c.lineTo(0,-21);c.stroke();c.fillStyle='#f2d5a3';c.beginPath();c.moveTo(2,-20);c.lineTo(15,0);c.lineTo(2,0);c.fill();
 c.fillStyle='#fff4d7';c.fillRect(-13,-4,26,15);c.fillStyle='#19354a';c.font='900 15px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n,0,4);c.restore();
}
function captain(c,x,y,n,run,win=false){
 c.save();c.translate(x,y+Math.sin(run*36+n)*3);const leg=Math.sin(run*38+n)*8;
 c.strokeStyle='#20384d';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(0,7);c.lineTo(-6+leg,21);c.moveTo(0,7);c.lineTo(6-leg,21);c.moveTo(-7,-5);c.lineTo(-12-leg,-1);c.moveTo(7,-5);c.lineTo(12+leg,-1);c.stroke();
 c.fillStyle=win?'#f0c46e':'#b0c6d1';c.fillRect(-8,-11,16,20);
 c.fillStyle='#ecc19c';c.beginPath();c.arc(0,-16,8,0,7);c.fill();
 c.fillStyle='#223c54';c.beginPath();c.moveTo(-11,-21);c.lineTo(10,-21);c.lineTo(6,-27);c.lineTo(-4,-27);c.closePath();c.fill();
 c.fillStyle='#fff5cf';c.fillRect(-12,-6,24,14);c.fillStyle='#172d40';c.font='900 14px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n,0,1);c.restore();
}
export function drawTreasure(canvas,round,elapsed=0,duration=12000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=clamp(elapsed/duration),done=t>=1;
 c.fillStyle='#174762';c.fillRect(0,0,600,480);
 for(let j=0;j<11;j++){c.strokeStyle='#42748d';c.lineWidth=3;c.beginPath();const y=65+j*39;c.moveTo(0,y);for(let x=0;x<600;x+=20)c.lineTo(x,y+Math.sin(x*.03+t*12+j)*5);c.stroke();}
 // Large island fills almost half the scene.
 c.fillStyle='#d9bc82';c.beginPath();c.ellipse(440,245,150,190,-.12,0,7);c.fill();
 c.fillStyle='#78a66b';c.beginPath();c.ellipse(454,240,122,159,-.12,0,7);c.fill();
 c.fillStyle='#b7a26b';c.beginPath();c.moveTo(328,360);c.quadraticCurveTo(389,279,459,225);c.quadraticCurveTo(485,205,510,170);c.strokeStyle='#ead59c';c.lineWidth=16;c.stroke();
 c.font='bold 20px Arial';c.fillStyle='#fff0c5';c.textAlign='center';c.fillText('宝島２・船長の宝探し',300,29);
 c.font='bold 15px Arial';c.fillText('宝島',459,75);
 // Treasure chest and palm trees
 for(const [x,y] of [[505,337],[380,145]]){c.strokeStyle='#86633d';c.lineWidth=7;c.beginPath();c.moveTo(x,y);c.lineTo(x+12,y-40);c.stroke();c.fillStyle='#35744b';for(let k=0;k<5;k++){c.beginPath();c.ellipse(x+12+Math.cos(k*1.25)*15,y-44+Math.sin(k*1.25)*10,19,6,k*1.25,0,7);c.fill();}}
 c.fillStyle='#8d512e';c.fillRect(472,149,45,29);c.fillStyle='#e6c15e';c.fillRect(474,156,41,5);c.fillRect(493,149,6,29);
 if(!round)return;
 for(const b of round.ships){
  const move=smooth(clamp((t-b.delay)/.65));
  const dockX=316+(b.landing?b.row%3*16:-25),dockY=130+(b.landing?b.row*36:b.y*.35);
  const x=b.x+(dockX-b.x)*move,y=b.y+(dockY-b.y)*move+(!reduced?Math.sin(t*20+b.phase)*5:0);
  boat(c,x,y,b.n,b.landing?1:.75);
  if(b.landing&&t>.52){
   const run=clamp((t-.52)/.45);
   const startX=dockX+22,startY=dockY-7;
   const pace=b.n===round.winner?run:run*b.pace;
   const cx=startX+(491-startX)*smooth(pace),cy=startY+(176-startY)*smooth(pace);
   captain(c,cx,cy,b.n,reduced?0:run,b.n===round.winner&&done);
  }
 }
 if(done){c.fillStyle='#ffedab';c.font='bold 23px Arial';c.fillText(round.winner+' 番の船長が宝箱を発見！',300,463);}
 else {c.fillStyle='#fff1cc';c.font='bold 16px Arial';c.fillText(t<.5?'宝島へ接近中！': '船長たちが宝箱へダッシュ！',300,462);}
}
