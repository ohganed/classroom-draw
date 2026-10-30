// Comedic bowling survival draw. Winner comes from the app's uniform random draw.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>{t=cl(t);return t*t*(3-2*t)};
export function makeBowlingRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const pins=Array.from({length:count},(_,i)=>{
 const n=i+1,col=i%10,row=Math.floor(i/10);
 return {n,x:43+col*57,y:103+row*76,fall:n===winner?Infinity:.12+.79*(losers.indexOf(n)+rnd()*.7)/Math.max(1,losers.length),angle:(rnd()>.5?1:-1)*(.7+rnd()*.6),drift:rnd()*24+13,spin:rnd()*6.28};
 });
 return {winner,pins,count};
}
function drawPin(c,p,progress,selected=false){
 const angle=p.angle*ease(progress),slide=ease(progress)*p.drift*Math.sign(p.angle);
 c.save();c.translate(p.x+slide,p.y+ease(progress)*15);c.rotate(angle);
 c.fillStyle=selected?'#f5dc87':'#e9f0ee';c.strokeStyle='#6a8d9d';c.lineWidth=1.7;
 c.beginPath();c.moveTo(-10,19);c.quadraticCurveTo(-17,9,-11,-1);c.quadraticCurveTo(-7,-13,-8,-24);c.quadraticCurveTo(0,-30,8,-24);c.quadraticCurveTo(7,-13,11,-1);c.quadraticCurveTo(17,9,10,19);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#cf6265';c.lineWidth=4;c.beginPath();c.moveTo(-8,-15);c.lineTo(8,-15);c.moveTo(-8,-9);c.lineTo(8,-9);c.stroke();
 c.fillStyle='#193448';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(p.n,0,8);c.restore();
}
export function drawBowling(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;let t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#15263e';c.fillRect(0,0,600,480);
 c.fillStyle='#a88b68';c.fillRect(19,62,562,382);
 for(let i=0;i<11;i++){c.strokeStyle=i%2?'#d6bd94':'#c7a77e';c.lineWidth=2;c.beginPath();c.moveTo(21+i*56,62);c.lineTo(21+i*56,444);c.stroke();}
 c.fillStyle='#f1ddb8';c.font='bold 20px Arial';c.textAlign='center';c.fillText('ボウリング大混乱',300,30);
 if(!round)return;
 const active=round.pins.filter(p=>p.fall>t).length;
 // Oversize rolling bowling balls sweep across the set on several independent passes.
 if(!reduced&&!done){for(let i=0;i<3;i++){let z=cl((t-i*.27)/.36);if(z>0&&z<1){let x=30+z*540,y=120+i*120+Math.sin(z*13+i)*33;c.fillStyle='#364d83';c.beginPath();c.arc(x,y,24+i*4,0,7);c.fill();c.fillStyle='#151d38';for(let k=0;k<3;k++){c.beginPath();c.arc(x-7+k*6,y-7+(k%2)*9,3,0,7);c.fill();}}}}
 for(const p of round.pins){const age=p.fall===Infinity?0:cl((t-p.fall)/.09);if(age>=1&&!done)continue;if(done&&p.n!==round.winner)continue;drawPin(c,p,age,done);}
 c.font='bold 18px Arial';c.fillStyle='#fff0c5';c.fillText(done?round.winner+' 番の勝ち！':'残り '+active+' 本！',300,465);
}
