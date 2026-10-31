// Original arcade-style drum lottery. Winner is selected by app.js before animation.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export function makeDrumRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 // Red "Don" removes odd numbers; blue "Ka" removes even numbers.
 // Every hit at the drum has a visible, deterministic elimination effect.
 // The caller already sampled the winner uniformly before these events are scheduled.
 const pools=[losers.filter(n=>n%2===1),losers.filter(n=>n%2===0)];
 const events=Array.from({length:40},(_,beat)=>({beat,red:beat%2===0,removed:[]}));
 for(let beat=2;beat<=37;beat++){
  const parity=beat%2===0?0:1,slotsLeft=Math.floor((37-beat)/2)+1;
  const pool=pools[parity],removeCount=Math.ceil(pool.length/slotsLeft);
  events[beat].removed=pool.splice(0,removeCount);
 }
 const cutoff=new Map(events.flatMap(ev=>ev.removed.map(n=>[n,(ev.beat+.03)/40])));
 return {winner,count,events,players:Array.from({length:count},(_,i)=>({n:i+1,col:i%10,row:Math.floor(i/10),phase:r()*6.28,cutoff:cutoff.get(i+1)??Infinity}))};
}
function note(c,x,y,r,red){c.fillStyle=red?'#e95654':'#6bb8eb';c.strokeStyle='#fff4de';c.lineWidth=3;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.stroke();}
export function drawDrum(canvas,round,elapsed=0,duration=12000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=clamp(elapsed/duration);
 c.fillStyle='#14263d';c.fillRect(0,0,600,480);
 c.fillStyle='#f1d998';c.font='bold 24px Arial';c.textAlign='center';c.fillText('ドンドン！ 太鼓リズム抽選',300,37);
 c.fillStyle='#314b67';c.beginPath();c.roundRect(27,65,546,105,16);c.fill();
 c.fillStyle='#ffe3ab';c.beginPath();c.arc(108,117,42,0,7);c.fill();c.fillStyle='#b25f46';c.beginPath();c.arc(108,117,31,0,7);c.fill();
 c.strokeStyle='#f9f2e0';c.lineWidth=3;c.beginPath();c.moveTo(164,117);c.lineTo(550,117);c.stroke();
 const beatProgress=t*40;
 for(let i=0;i<9;i++){
  const eventIndex=Math.floor(beatProgress)+i;
  if(eventIndex>=40)continue;
  const x=555-((beatProgress%1)+i)*45;if(x<168||x>555)continue;
  note(c,x,117,eventIndex%2?15:19,round?.events[eventIndex]?.red??(eventIndex%2===0));
 }
 c.fillStyle='#e9f2ef';c.font='bold 12px Arial';c.fillText('🔴 ドン＝奇数が脱落',294,89);c.fillText('🔵 カッ＝偶数が脱落',461,89);
 c.fillStyle='#ffffff';c.font='900 17px Arial';c.fillText('ドン！',108,119);
 c.fillStyle='#45627b';c.fillRect(30,192,540,224);
 if(!round)return;
 let remaining=0;
 for(const p of round.players){
  const removed=t>=p.cutoff;
  const phase=removed?clamp((t-p.cutoff)/.075):0;
  if(phase>=1)continue;
  if(!removed)remaining++;
  const x=57+p.col*53,y=219+p.row*48;
  const bounce=reduced?0:Math.abs(Math.sin(t*80+p.phase))*9*(t<.9?1:.4);
  const finale=p.n===round.winner?ease((t-.88)/.12):0;
  const fx=x+(300-x)*finale,fy=y-bounce+(307-y)*finale;
  const scale=1+finale*2;
  c.save();c.globalAlpha=1-phase;c.translate(fx,fy);c.scale(scale,scale);
  c.fillStyle=p.n%2?'#ef8378':'#82badb';
  c.beginPath();c.arc(0,0,18,0,7);c.fill();
  c.strokeStyle='#fff9e8';c.lineWidth=2;c.stroke();
  c.fillStyle='#15273c';c.font='900 17px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(p.n,0,1);
  c.restore();
 }
 c.fillStyle='#f1e7ca';c.font='bold 17px Arial';c.textAlign='center';
 c.fillText(t>=1?round.winner+'番！ 大当たり！':t<.05?'赤は奇数・青は偶数！':'ドン・カッ！ 残り '+remaining+' 人',300,456);
}
