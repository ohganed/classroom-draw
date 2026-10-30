// The Tortoise and the Hare: all competitors have an equal chance of winning.
// Animation is deterministic from a seed; winner supplied by app.js.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export function makeTortoiseHareRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const shuffled=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const out=new Map(shuffled.map((n,i)=>[n,.49+.43*(i+.3*r())/Math.max(1,shuffled.length)]));
 return {winner,count,runners:Array.from({length:count},(_,i)=>({n:i+1,type:i%2===0?'hare':'turtle',row:i%8,col:Math.floor(i/8),phase:r()*6.28,sleep:.21+r()*.07,exit:out.get(i+1)??Infinity}))};
}
function runner(c,b,x,y,scale=1,turn=0,asleep=false){
 c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(turn);
 if(b.type==='turtle'){
  c.fillStyle='#6a9d71';c.beginPath();c.ellipse(0,7,15,12,0,0,7);c.fill();c.fillStyle='#39764e';c.beginPath();c.arc(0,1,14,Math.PI,0);c.fill();
  c.fillStyle='#acd7a0';c.beginPath();c.arc(14,-8,9,0,7);c.fill();
  c.fillStyle='#d2bc77';c.beginPath();c.moveTo(-9,-8);c.lineTo(0,-16);c.lineTo(10,-8);c.closePath();c.fill();
 }else{
  c.fillStyle='#c2a3a0';c.beginPath();c.ellipse(0,8,12,12,0,0,7);c.fill();c.beginPath();c.arc(11,-7,11,0,7);c.fill();
  c.fillStyle='#bb8d94';for(const a of [5,15]){c.beginPath();c.ellipse(a,-24,5,20,-.16,0,7);c.fill();}
  c.fillStyle='#ffdbdf';for(const a of [5,15]){c.beginPath();c.ellipse(a,-24,2,14,-.16,0,7);c.fill();}
 }
 c.fillStyle='#2d3640';c.beginPath();c.arc(18,-9,2,0,7);c.fill();
 c.fillStyle='#fff4df';c.beginPath();c.roundRect(-15,1,32,20,5);c.fill();c.fillStyle='#24394c';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(b.n,1,11);
 c.restore();
 if(asleep){c.fillStyle='#485e78';c.textAlign='center';c.font='bold 16px Arial';c.fillText('Zzz',x+22,y-30);}
}
export function drawTortoiseHare(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=clamp(elapsed/duration);
 c.fillStyle='#ecf4df';c.fillRect(0,0,600,480);
 c.fillStyle='#c7e0b8';c.fillRect(0,67,600,365);
 for(let row=0;row<8;row++){c.fillStyle=row%2?'#dfc9aa':'#e8d5b6';c.fillRect(12,83+row*43,575,35);}
 c.fillStyle='#324d3c';c.textAlign='center';c.font='bold 22px Arial';c.fillText('ウサギとカメ 大逆転レース！',300,32);
 c.strokeStyle='#fff';c.lineWidth=5;c.setLineDash([8,8]);c.beginPath();c.moveTo(550,74);c.lineTo(550,426);c.stroke();c.setLineDash([]);
 if(!round)return;
 let running=0;
 for(const b of round.runners){
  const sleeping=b.type==='hare'&&t>=b.sleep&&t<.69&&b.exit!==Infinity;
  let progress;
  if(b.type==='hare')progress=t<b.sleep? .69*smooth(t/b.sleep):t<.69?.69:t<.85?.69+.2*smooth((t-.69)/.16):.89;
  else progress=.84*smooth(t/.86);
  const gone=t>=b.exit&&b.exit!==Infinity;
  const out=gone?clamp((t-b.exit)/.06):0;
  if(out>=1)continue;
  if(!gone)running++;
  if(b.n===round.winner) progress=t<.77?.4*smooth(t/.77):.4+.6*smooth((t-.77)/.23);
  const x=36+Math.min(1,progress)*515,y=99+b.row*43+(b.col-2)*3;
  const showWinner=b.n===round.winner?1+.85*smooth((t-.89)/.11):1;
  runner(c,b,x+out*90,y+out*26,showWinner,reduced?0:Math.sin(t*19+b.phase)*.08,sleeping);
 }
 c.fillStyle='#314d38';c.font='bold 17px Arial';
 c.fillText(t>=1?round.winner+'番がゴール！':t<.26?'ウサギが猛ダッシュ！':t<.69?'あれ？ ウサギが居眠り中！':'カメが追い上げる！ 大逆転なるか？',300,461);
}
