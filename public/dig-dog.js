// Here, dig! Forty dogs hunt for buried treasure. Winner is chosen by the parent app.
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=cl(v);return v*v*(3-2*v)};
export function makeDigRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 return {winner,count,dogs:Array.from({length:count},(_,i)=>({n:i+1,col:i%10,row:Math.floor(i/10),phase:r()*6.283,dig:.18+r()*.20,find:.46+r()*.31,side:r()>.5?1:-1,treasure:i+1===winner}))};
}
function dog(c,n,x,y,scale=1,phase=0){
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.fillStyle='#9b6944';c.beginPath();c.ellipse(0,5,13,13,0,0,7);c.fill();
 c.beginPath();c.arc(0,-10,13,0,7);c.fill();
 c.fillStyle='#70472f';c.beginPath();c.ellipse(-13,-13,6,12,-.35,0,7);c.ellipse(13,-13,6,12,.35,0,7);c.fill();
 c.fillStyle='#f2cfaa';c.beginPath();c.ellipse(0,-5,7,6,0,0,7);c.fill();
 c.fillStyle='#2d241d';c.beginPath();c.arc(0,-8,2.5,0,7);c.arc(-5,-15,1.7,0,7);c.arc(5,-15,1.7,0,7);c.fill();
 c.strokeStyle='#734d35';c.lineWidth=3;c.beginPath();c.moveTo(-6,16);c.lineTo(-7+Math.sin(phase)*3,23);c.moveTo(6,16);c.lineTo(7-Math.sin(phase)*3,23);c.stroke();
 c.fillStyle='#fff5d9';c.beginPath();c.roundRect(-15,0,30,18,4);c.fill();c.fillStyle='#283e4b';c.textAlign='center';c.textBaseline='middle';c.font='900 15px Arial';c.fillText(n,0,9);c.restore();
}
export function drawDig(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#e0efcc';c.fillRect(0,0,600,480);
 c.fillStyle='#a8cf99';for(let row=0;row<4;row++)for(let col=0;col<10;col++){const x=42+col*57,y=111+row*79;c.beginPath();c.ellipse(x,y+25,25,12,0,0,7);c.fill();}
 c.fillStyle='#315b3a';c.textAlign='center';c.font='bold 24px Arial';c.fillText('ここ掘れワンワン！',300,33);
 c.fillStyle='#8b6748';c.fillRect(0,430,600,50);
 if(!round)return;
 for(const b of round.dogs){
  const x=42+b.col*57,y=103+b.row*79;
  const digging=t>b.dig;const found=t>b.find;
  c.fillStyle='#8d6348';if(digging){c.beginPath();c.ellipse(x,y+25,21,9,0,0,7);c.fill();}
  if(found&&!b.treasure){
   c.fillStyle='#d6c6ae';c.save();c.translate(x+10,y+17);c.rotate(.4);c.fillRect(-8,-3,17,6);for(const dx of [-9,9])for(const dy of [-4,4]){c.beginPath();c.arc(dx,dy,4,0,7);c.fill();}c.restore();
  }
  if(digging&&!found&&!reduced){c.fillStyle='#c4a581';for(let i=0;i<3;i++){const a=t*35+b.phase+i*2.1;c.beginPath();c.arc(x+Math.sin(a)*16,y+12-Math.abs(Math.cos(a))*17,3,0,7);c.fill();}}
  const hop=digging&&!found&&!reduced?Math.abs(Math.sin((t-b.dig)*95))*6:0;
  const finale=b.treasure?ease((t-.80)/.20):0;
  const dx=x+(300-x)*finale,dy=y-hop+(225-y)*finale;
  dog(c,b.n,dx,dy,1+finale*.8,reduced?0:t*38+b.phase);
 }
 if(t>.8){const u=ease((t-.8)/.2);c.save();c.translate(300,318);c.scale(.6+u*.8,.6+u*.8);c.fillStyle='#79502f';c.fillRect(-27,-5,54,38);c.fillStyle='#e7ba52';c.fillRect(-24,2,48,7);c.fillRect(-3,-5,7,38);c.fillStyle='#f4da80';c.beginPath();c.arc(0,-15,11,0,7);c.fill();c.restore();}
 c.fillStyle='#2e5739';c.font='bold 18px Arial';c.fillText(done?round.winner+'番のワンちゃんがお宝発見！':t<.3?'どこを掘ろうかな？':'ワンワン！ 地面を掘ってお宝探し！',300,463);
}
