// Original five-part star movement, inspired by the concept of a quintet.
// No copyrighted music playback. The host app chooses the winner uniformly.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=cl(x);return x*x*(3-2*x)};
const colors=['#e4b94c','#7cc2e6','#bc91d5','#78c6a2','#e79aa3'];
export function makeStarQuintetRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const fade=new Map(others.map((n,i)=>[n,.54+.37*(i+.2*r())/Math.max(1,others.length)]));
 return {winner,count,stars:Array.from({length:count},(_,i)=>({n:i+1,voice:i%5,slot:Math.floor(i/5),phase:r()*6.283,radius:8+r()*12,leave:fade.get(i+1)??Infinity}))};
}
function star(c,x,y,r,color,alpha=1){
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.fillStyle=color;c.beginPath();
 for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.48:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
 c.closePath();c.fill();c.restore();
}
export function drawStarQuintet(canvas,round,elapsed=0,duration=12000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.fillStyle='#14213a';c.fillRect(0,0,600,480);
 // Quiet decorative night sky, no flashes.
 for(let i=0;i<60;i++){const x=(i*157+33)%600,y=(i*83+61)%480;c.fillStyle='rgba(218,231,255,.23)';c.beginPath();c.arc(x,y,1.3,0,7);c.fill();}
 c.textAlign='center';c.fillStyle='#f4edcb';c.font='bold 23px Arial';c.fillText('キラキラ星・五重奏',300,31);
 for(let v=0;v<5;v++){
  const y=79+v*72;
  c.strokeStyle=colors[v];c.globalAlpha=.45;c.lineWidth=1;
  for(let k=0;k<3;k++){c.beginPath();c.moveTo(32,y+k*13);c.lineTo(568,y+k*13);c.stroke();}
  c.globalAlpha=1;c.fillStyle=colors[v];c.font='bold 14px Arial';c.fillText(['ピアノ','弦','フルート','ブラス','低音'][v],68,y-12);
 }
 if(!round)return;
 for(const b of round.stars){
  const shift=Math.sin(t*18+b.phase),delay=b.voice*.06,progress=cl((t-delay)/.61);
  const baseX=140+(b.slot%8)*52,baseY=94+b.voice*72;
  const wave=progress*(1+b.voice*.07);
  let x=baseX+(reduced?0:Math.sin(wave*15+b.phase)*25);
  let y=baseY+(reduced?0:Math.cos(wave*10+b.phase)*10);
  if(t>.34&&t<.88&&!reduced){x+=Math.sin(t*27+b.phase+b.voice)*17;y+=Math.cos(t*21+b.phase)*7;}
  const exit=cl((t-b.leave)/.07);
  if(exit>=1)continue;
  const winner=b.n===round.winner,finale=winner?smooth((t-.85)/.15):0;
  x+=(300-x)*finale;y+=(240-y)*finale;
  const r=(winner?13+finale*61:13)*(1-exit*.5);
  star(c,x,y,r,colors[b.voice],1-exit);
  c.fillStyle=winner&&finale>.4?'#18283b':'#19283d';c.globalAlpha=1-exit;c.font=(winner&&finale>.4?'900 34px Arial':'900 15px Arial');c.textAlign='center';c.textBaseline='middle';c.fillText(String(b.n),x,y+1);c.globalAlpha=1;
 }
 c.fillStyle='#f1eccc';c.font='bold 17px Arial';c.textAlign='center';c.textBaseline='alphabetic';
 c.fillText(done?round.winner+'番の星が輝いた！':t<.32?'５つのパートが演奏開始！':t<.55?'５声のカノン、星が追いかけ合う！':'星たちが最後の和音へ集まる…',300,463);
}
