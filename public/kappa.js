// 河童の川流れ: even a master swimmer can be swept by a current.
// The winning number is drawn uniformly by the host app, not by the animation.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=cl(x);return x*x*(3-2*x)};
export function makeKappaRound(count,winner,seed){
 let s=seed>>>0||1;const r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const exits=new Map(others.map((n,i)=>[n,.19+.68*(i+r()*.4)/Math.max(1,others.length)]));
 return {winner,count,kappas:Array.from({length:count},(_,i)=>({
  n:i+1,lane:i%8,row:Math.floor(i/8),phase:r()*6.283,turn:r()>.5?1:-1,
  fail:exits.get(i+1)??Infinity,event:Math.floor(r()*3),speed:.7+r()*.45
 }))};
}
function kappa(c,n,x,y,rot=0,size=1){
 c.save();c.translate(x,y);c.rotate(rot);c.scale(size,size);
 c.fillStyle='#6dba83';c.beginPath();c.ellipse(0,8,12,15,0,0,Math.PI*2);c.fill();
 c.fillStyle='#4c9369';for(const a of [-1,1]){c.beginPath();c.ellipse(a*13,6,6,9,a*.3,0,Math.PI*2);c.fill();}
 c.fillStyle='#72bd89';c.beginPath();c.arc(0,-10,14,0,Math.PI*2);c.fill();
 c.fillStyle='#d3e4ac';c.beginPath();c.ellipse(0,-22,9,4,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#3b7c56';c.lineWidth=2;c.beginPath();c.ellipse(0,-22,9,4,0,0,Math.PI*2);c.stroke();
 c.fillStyle='#263b36';for(const x of [-5,5]){c.beginPath();c.arc(x,-12,2,0,Math.PI*2);c.fill();}
 c.fillStyle='#efdfb0';c.beginPath();c.moveTo(-4,-5);c.lineTo(0,-1);c.lineTo(4,-5);c.fill();
 c.fillStyle='#fff7d4';c.beginPath();c.roundRect(-16,0,32,19,4);c.fill();
 c.fillStyle='#254b3b';c.font='900 16px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,10);c.restore();
}
function arrow(c,x,y,dir){c.save();c.translate(x,y);c.strokeStyle='rgba(235,250,250,.62)';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(-19*dir,0);c.lineTo(19*dir,0);c.lineTo(10*dir,-8);c.moveTo(19*dir,0);c.lineTo(10*dir,8);c.stroke();c.restore();}
export function drawKappa(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#d4e8c4';c.fillRect(0,0,600,480);
 c.fillStyle='#488eaa';c.beginPath();c.moveTo(0,83);c.bezierCurveTo(180,65,370,108,600,78);c.lineTo(600,409);c.bezierCurveTo(390,429,160,391,0,414);c.closePath();c.fill();
 for(let i=0;i<9;i++){const y=108+i*35;c.strokeStyle=i%2?'#70b8cd':'#8bd0df';c.lineWidth=4;c.beginPath();for(let x=0;x<=600;x+=20){const yy=y+Math.sin(x*.032+i+t*13)*6;x===0?c.moveTo(x,yy):c.lineTo(x,yy);}c.stroke();}
 // Flow is made explicit: current to the right, with two swirl zones.
 for(const [x,y] of [[90,164],[270,350],[460,186],[515,341]])arrow(c,x,y,1);
 for(const [x,y] of [[203,238],[392,301]]){c.strokeStyle='#d3eef0';c.lineWidth=3;c.beginPath();c.arc(x,y,29,t*5,t*5+Math.PI*1.6);c.stroke();c.fillStyle='#e6f2db';c.font='14px Arial';c.textAlign='center';c.fillText('うず',x,y-38);}
 c.fillStyle='#f8f3ce';c.beginPath();c.ellipse(547,249,43,117,0,0,Math.PI*2);c.fill();c.fillStyle='#73aa6f';c.beginPath();c.ellipse(559,239,23,91,0,0,Math.PI*2);c.fill();
 c.fillStyle='#214a50';c.font='bold 21px Arial';c.textAlign='center';c.fillText('河童の川流れ！',300,30);
 c.font='bold 15px Arial';c.fillText('川岸',555,389);
 if(!round)return;
 let left=0;
 for(const b of round.kappas){
  const fail=t>=b.fail,age=fail?cl((t-b.fail)/.11):0;
  if(age>=1)continue;
  if(!fail)left++;
  const progress=cl(t*(.78+b.speed*.15));
  let x=35+b.lane*26+progress*330+Math.sin(t*17+b.phase)*13;
  let y=124+b.row*53+(b.lane%3)*10+Math.cos(t*21+b.phase)*12;
  let rot=Math.sin(t*14+b.phase)*.24;
  if(fail){
   // A harmless comic swirl: the kappa spins into a side-current and exits the frame.
   x+=b.turn*130*age;y+=Math.sin(age*Math.PI*1.3)*68*age+70*age;
   rot+=age*b.turn*7;
  }
  const finish=b.n===round.winner?ease((t-.82)/.18):0;
  x+=(538-x)*finish;y+=(250-y)*finish;
  kappa(c,b.n,x,y,reduced?0:rot,1+finish*(done?1:0.4));
 }
 c.fillStyle='#24515c';c.font='bold 17px Arial';c.fillText(done?round.winner+'番の河童が川岸へ！':'流されながら泳ぐ河童　残り '+left+' 匹',300,462);
}
