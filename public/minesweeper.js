// Minesweeper-inspired survival draw. Bomb impacts decide eliminations, not a preselected winner.
export const MINES_DURATION=14000;
function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(xs,random){for(let i=xs.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[xs[i],xs[j]]=[xs[j],xs[i]];}return xs;}
export function makeMinesRound(count,seed){
 if(!Number.isInteger(count)||count<1||count>99)throw new RangeError('Invalid contestants');
 const random=rng(seed),cols=count<=40?8:10,rows=Math.ceil(count/cols),labels=shuffle(Array.from({length:count},(_,i)=>i+1),random);
 const alive=new Set(Array.from({length:count},(_,i)=>i)),events=[];
 while(alive.size>1){
  const candidates=[...alive],center=candidates[Math.floor(random()*candidates.length)];
  const x=center%cols,y=Math.floor(center/cols);
  // A bomb affects its own cell and surviving eight neighbors.
  const hit=candidates.filter(i=>Math.abs(i%cols-x)<=1&&Math.abs(Math.floor(i/cols)-y)<=1);
  shuffle(hit,random);
  const removed=hit.slice(0,Math.min(hit.length,alive.size-1));
  for(const i of removed)alive.delete(i);
  events.push({center,removed});
 }
 const survivor=[...alive][0];
 return {count,seed,cols,rows,labels,events,winner:labels[survivor],survivor};
}
export function minesVisible(round,elapsed){return Math.min(round.events.length,Math.floor(Math.max(0,elapsed)/MINES_DURATION*round.events.length));}
export function minesState(round,elapsed,finished=false){
 const n=finished?round.events.length:minesVisible(round,elapsed);
 const eliminated=new Set(),bombed=new Set();
 for(let j=0;j<n;j++){bombed.add(round.events[j].center);for(const i of round.events[j].removed)eliminated.add(i);}
 return {n,eliminated,bombed,remaining:round.count-eliminated.size};
}
export function drawMines(canvas,round,elapsed,finished=false){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,{n,eliminated,bombed,remaining}=minesState(round,elapsed,finished);
 c.clearRect(0,0,w,h);c.fillStyle='#102638';c.fillRect(0,0,w,h);
 c.fillStyle='#f0f6ff';c.font='bold 23px system-ui';c.textAlign='center';
 c.fillText(finished?'🏆 最後まで生き残った番号！':'💣 地雷サバイバル',w/2,35);
 c.fillStyle='#c0d5e1';c.font='15px system-ui';c.fillText('地雷の周囲9マスが危険！ 生存者が減っていく',w/2,61);
 const gap=5,cell=Math.min(55,(w-28)/round.cols-gap,(h-144)/round.rows-gap),gridW=round.cols*(cell+gap)-gap,left=(w-gridW)/2,top=82;
 for(let i=0;i<round.count;i++){
  const x=left+i%round.cols*(cell+gap),y=top+Math.floor(i/round.cols)*(cell+gap);
  const lost=eliminated.has(i),won=finished&&i===round.survivor;
  c.fillStyle=won?'#f5cf72':lost?'#543d4c':'#468b80';c.fillRect(x,y,cell,cell);
  c.strokeStyle=won?'#fff0a9':'#9fc6cf';c.lineWidth=won?3:1;c.strokeRect(x+1,y+1,cell-2,cell-2);
  c.textAlign='center';c.font='bold '+Math.min(26,cell*.45)+'px system-ui';c.fillStyle=won?'#182a34':lost?'#a99fa9':'#f7fbff';
  c.fillText(String(round.labels[i]),x+cell/2,y+cell*.64);
  if(lost){c.strokeStyle='#e89088';c.lineWidth=3;c.beginPath();c.moveTo(x+cell*.18,y+cell*.18);c.lineTo(x+cell*.82,y+cell*.82);c.moveTo(x+cell*.82,y+cell*.18);c.lineTo(x+cell*.18,y+cell*.82);c.stroke();}
  if(bombed.has(i)){c.font=Math.min(18,cell*.36)+'px system-ui';c.fillText('💣',x+cell*.80,y+cell*.28);}
 }
 c.fillStyle='#ecf3fa';c.font='bold 19px system-ui';c.textAlign='center';
 c.fillText(finished?'🎉 '+round.winner+' 番が当選！':'残り '+remaining+' 人   /   爆発 '+n+' 回',w/2,h-27);
}
