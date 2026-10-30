// Hyotan kara koma: ponies spring out of numbered gourds.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=cl(v);return v*v*(3-2*v)};
export function makeGourdRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const order=new Map(others.map((n,i)=>[n,.16+.67*(i+.2*r())/Math.max(1,others.length)]));
 return {winner,count,gourds:Array.from({length:count},(_,i)=>({n:i+1,x:43+(i%10)*57,y:120+Math.floor(i/10)*77,phase:r()*6.28,release:order.get(i+1)??.88,side:r()>.5?1:-1}))};
}
function gourd(c,n,x,y,wiggle=0){
 c.save();c.translate(x,y);c.rotate(wiggle);
 c.fillStyle='#8ca75b';c.beginPath();c.ellipse(0,9,19,23,0,0,7);c.ellipse(0,-13,13,17,0,0,7);c.fill();
 c.fillStyle='#64804c';c.fillRect(-3,-31,6,9);
 c.fillStyle='#fff4d7';c.beginPath();c.roundRect(-16,4,32,20,4);c.fill();c.fillStyle='#30442e';c.font='900 17px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n,0,14);c.restore();
}
function pony(c,n,x,y,size=1,tilt=0){
 c.save();c.translate(x,y);c.rotate(tilt);c.scale(size,size);
 c.fillStyle='#a9744e';c.beginPath();c.ellipse(-2,6,17,11,0,0,7);c.fill();c.fillRect(9,-12,9,20);c.beginPath();c.ellipse(17,-14,10,9,-.25,0,7);c.fill();
 c.fillStyle='#77523e';c.beginPath();c.moveTo(8,-13);c.lineTo(6,-27);c.lineTo(14,-19);c.fill();
 c.strokeStyle='#75503a';c.lineWidth=4;c.lineCap='round';c.beginPath();for(const px of [-13,-3,9,17]){c.moveTo(px,14);c.lineTo(px-2,25);}c.moveTo(-18,4);c.lineTo(-29,-5);c.stroke();
 c.fillStyle='#24303c';c.beginPath();c.arc(21,-17,2,0,7);c.fill();
 c.fillStyle='#fff4d5';c.fillRect(-15,-2,27,17);c.fillStyle='#24394c';c.font='900 15px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n,-1,6);c.restore();
}
function shogiPiece(c,n,x,y,scale=1,tilt=0){
 c.save();c.translate(x,y);c.rotate(tilt);c.scale(scale,scale);
 // Traditional five-sided shogi tile, with a clear lucky-number mark.
 c.fillStyle='#88633e';c.beginPath();c.moveTo(0,-42);c.lineTo(30,-25);c.lineTo(25,39);c.lineTo(-25,39);c.lineTo(-30,-25);c.closePath();c.fill();
 c.fillStyle='#e6c78c';c.beginPath();c.moveTo(0,-37);c.lineTo(25,-22);c.lineTo(21,34);c.lineTo(-21,34);c.lineTo(-25,-22);c.closePath();c.fill();
 c.fillStyle='#2d2824';c.textAlign='center';c.textBaseline='middle';c.font='bold 24px serif';c.fillText('王将',0,-10);
 c.fillStyle='#fff7df';c.beginPath();c.roundRect(-18,10,36,22,4);c.fill();
 c.fillStyle='#21394a';c.font='900 21px Arial';c.fillText(String(n),0,21);
 c.restore();
}
export function drawGourd(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.fillStyle='#f3ead6';c.fillRect(0,0,600,480);
 c.fillStyle='#c1ddaa';c.fillRect(0,397,600,83);
 c.fillStyle='#74513c';for(let j=0;j<4;j++){c.fillRect(12,143+j*77,576,7);}
 c.fillStyle='#344d31';c.font='bold 23px Arial';c.textAlign='center';c.fillText('瓢箪から駒！',300,36);
 if(!round)return;
 let waiting=0;
 for(const b of round.gourds){
  const released=t>=b.release,age=released?cl((t-b.release)/.11):0;
  if(!released)waiting++;
  gourd(c,b.n,b.x,b.y,!reduced&&!released?Math.sin(t*29+b.phase)*.15:0);
  if(b.n!==round.winner&&released&&age<1){
   const x=b.x+b.side*95*age,y=b.y-55*Math.sin(age*Math.PI)+90*age*age;
   pony(c,b.n,x,y,.75,b.side*age*.3);
  }
 }
 if(t>.85){
  const u=ease((t-.85)/.15),b=round.gourds[round.winner-1];
  const x=b.x+(300-b.x)*u,y=b.y-65*Math.sin(u*Math.PI)+(260-b.y)*u;
  shogiPiece(c,round.winner,x,y,.24+1.35*u,(1-u)*.18);
 }
 c.fillStyle='#34503a';c.font='bold 17px Arial';
 c.fillText(done?round.winner+'番の「王将」が出た！ 当選！':'馬か、それとも将棋の駒か？ 残り '+waiting+' 個',300,460);
}
