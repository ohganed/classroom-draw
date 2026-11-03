// Five-column cascade puzzle. Every visible clear is produced by actual adjacency.
// Three shuffled number bags allow up to three appearances per number.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const COLORS=['#ed847c','#72b9e2','#efc56e','#92cb8f','#bd9fe9','#77d2c8'];
const W=5,H=8;
const colOf=n=>(n-1)%COLORS.length;
const same=(a,b)=>!a.locked&&!b.locked&&a.color===b.color;
const clone=b=>b.map(row=>row.map(v=>v?{...v}:null));
function pairs(board){
 const out=new Set();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const a=board[y][x];if(!a)continue;
  for(const [dx,dy] of [[1,0],[0,1]]){
   const nx=x+dx,ny=y+dy;if(nx>=W||ny>=H)continue;
   const b=board[ny][nx];if(b&&same(a,b)){out.add(a.id);out.add(b.id);}
  }
 }
 return out;
}
function gravity(board){
 let moved=false;
 for(let x=0;x<W;x++){
  let target=H-1;
  for(let y=H-1;y>=0;y--)if(board[y][x]){
   if(y!==target){board[target][x]=board[y][x];board[y][x]=null;moved=true;}
   target--;
  }
 }
 return moved;
}
export function makeFallingRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const board=Array.from({length:H},()=>Array(W).fill(null)),events=[];
 let time=.12,nextId=1,drops=0,chains=0,topout=false;
 const stream=[],previousColor=Array(count+1).fill(-1);
 let previousDropColor=-1;
 for(let cycle=0;cycle<3;cycle++){
  const bag=Array.from({length:count},(_,i)=>i+1);
  for(let i=bag.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
  if(stream.length&&bag.length>1&&bag[0]===stream[stream.length-1]){
   const j=1+Math.floor(rand()*(bag.length-1));[bag[0],bag[j]]=[bag[j],bag[0]];
  }
  stream.push(...bag);
 }
 // Draw a smaller, balanced sample from three shuffled bags.
 for(let i=stream.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[stream[i],stream[j]]=[stream[j],stream[i]];}
 const maxPieces=Math.min(stream.length,Math.max(12,Math.round(count*1.1)));
 const chosen=stream.slice(0,maxPieces);
 // Order numbers so two consecutive falling pieces do not look identical.
 const remains=new Map();
 for(const n of chosen)remains.set(n,(remains.get(n)||0)+1);
 const sequence=[];
 while(sequence.length<chosen.length){
  const last=sequence[sequence.length-1];
  const options=[...remains].filter(([n,v])=>v>0&&(n!==last||remains.size===1));
  // In rare impossible layouts (one number left), still finish gracefully.
  const choices=options.length?options:[...remains].filter(([,v])=>v>0);
  const max=Math.max(...choices.map(([,v])=>v));
  const candidates=choices.filter(([,v])=>v===max);
  const next=candidates[Math.floor(rand()*candidates.length)][0];
  sequence.push(next);remains.set(next,remains.get(next)-1);
 }
 const record=(kind,before,after,dur,more={})=>{events.push({kind,start:time,dur,before,after,...more});time+=dur;};
 // A completed bottom row becomes permanent gray foundation tiles.
 function lockCompletedRows(){
  // Grow a permanent gray foundation upward, one completed row at a time.
  // A row can lock only when all rows below it are already gray.
  for(let y=H-1;y>=0;y--){
   if(!board[y].every(Boolean))break;
   if(board[y].every(v=>v.locked))continue;
   const belowLocked=y===H-1||board[y+1].every(v=>v?.locked);
   if(!belowLocked)break;
   const before=clone(board);
   for(const tile of board[y])tile.locked=true;
   record('lock',before,clone(board),.12,{row:y});
  }
 }
 // Only the pair that has just touched is cleared; no global sweeping of matches.
 function resolve(id){
  // A collision removes exactly the two individual tile IDs. Never perform
  // a board-wide match scan. Newly falling tiles can create later cascades.
  const queue=[id];
  for(let attempts=0;queue.length&&attempts<35;attempts++){
   const current=queue.shift();
   let pos=null;
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(board[y][x]?.id===current)pos=[x,y];
   if(!pos)continue;
   const [x,y]=pos,a=board[y][x];
   const adjacent=[[x,y+1],[x-1,y],[x+1,y],[x,y-1],[x-1,y-1],[x+1,y-1],[x-1,y+1],[x+1,y+1]];
   const other=adjacent.map(([xx,yy])=>xx>=0&&xx<W&&yy>=0&&yy<H?board[yy][xx]:null).find(v=>v&&same(a,v));
   if(!other)continue;
   const before=clone(board);
   for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++)if(board[yy][xx]&&(board[yy][xx].id===a.id||board[yy][xx].id===other.id))board[yy][xx]=null;
   record('clear',before,clone(board),.09,{removed:[a.id,other.id]});
   const fallen=clone(board);
   if(gravity(board)){
    record('gravity',fallen,clone(board),.085);chains++;
    lockCompletedRows();
    for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){
     const v=board[yy][xx];if(v&&fallen[yy][xx]?.id!==v.id)queue.push(v.id);
    }
   }
  }
 }
 // Each number can appear up to three times, once in each shuffled bag.
 // Color is assigned independently of the number, and changes between repeats.
 const place=(n,color,col)=>{
  if(board[0][col])return false;
  let row=H-1;while(row>0&&board[row][col])row--;
  const before=clone(board),id=nextId++;
  board[row][col]={n,id,color};
  record('drop',before,clone(board),.085,{n,color,col,row});
  drops++;lockCompletedRows();resolve(id);lockCompletedRows();return true;
 };
 let overflow=null;
 for(const n of sequence){
  const available=COLORS.map((_,i)=>i).filter(i=>i!==previousColor[n]&&i!==previousDropColor);
  const color=available[Math.floor(rand()*available.length)];
  previousColor[n]=color;previousDropColor=color;
  const open=Array.from({length:W},(_,x)=>x).filter(x=>!board[0][x]);
  if(!open.length){overflow=n;break;}
  // Towards the end, prefer tall stacks; the actual arrangement still
  // determines whether a numbered piece reaches the ceiling.
  const heights=open.map(x=>board.filter(row=>row[x]).length);
  const maxH=Math.max(...heights),candidates=open.filter((x,i)=>heights[i]>=maxH-(drops<count*.55?3:1));
  const col=candidates[Math.floor(rand()*candidates.length)];
  place(n,color,col);
 }
 let actualWinner,winningCell=null;
 if(overflow!==null){
  actualWinner=overflow;
  record('topout',clone(board),clone(board),.5,{n:actualWinner});
  topout=true;
 }else{
  // If all numbered pieces were placed, the highest surviving piece wins.
  // Equal-height candidates are shuffled before selection.
  const remaining=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(board[y][x])remaining.push({x,y,n:board[y][x].n});
  if(remaining.length){
   const highest=Math.min(...remaining.map(p=>p.y));
   const top=remaining.filter(p=>p.y===highest);
   winningCell=top[Math.floor(rand()*top.length)];
   actualWinner=winningCell.n;
  }else{
   // Rare full-clear round: the last piece to be placed is the winner.
   actualWinner=events.filter(e=>e.kind==='drop').at(-1).n;
  }
  record('winner',clone(board),clone(board),.5,{n:actualWinner,cell:winningCell});
 }
 // Stretch every real event proportionally: the visible fall remains slow and
 // the clear/gravity effects are not hidden between instant drops.
 const targetEnd=43.5,initial=.12;
 const scale=(targetEnd-initial)/Math.max(.001,time-initial);
 for(const event of events){
  event.start=initial+(event.start-initial)*scale;
  event.dur*=scale;
 }
 return {winner:actualWinner,count,events,seconds:45,drops,chains,topout};
}
export const fallingDuration=round=>Math.ceil((round?.seconds??45)*1000);
function tiles(c,board,alpha=1,progress=1,kind='',before=null){
 if(!board)return;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const item=board[y][x];if(!item)continue;
  const px=178+x*50,ty=70+y*43;
  let py=ty;
  if(kind==='drop'||kind==='final'){
   const had=before?.some(row=>row.some(v=>v?.id===item.id));
   if(!had)py=-48+(ty+48)*ease(progress);
  }else if(kind==='gravity'&&before){
   let prev=-1;for(let z=0;z<H;z++)if(before[z][x]?.id===item.id)prev=z;
   if(prev>=0)py=(70+prev*43)+(ty-(70+prev*43))*ease(progress);
  }
  c.save();c.globalAlpha=alpha;c.fillStyle=item.locked?'#929ca8':COLORS[item.color??colOf(item.n)];
  c.beginPath();c.roundRect(px,py,45,38,5);c.fill();
  c.strokeStyle='#f7f1dc';c.lineWidth=1.5;c.stroke();
  c.fillStyle='#15273f';c.textAlign='center';c.textBaseline='middle';c.font='900 17px Arial';c.fillText(item.n,px+22.5,py+19);
  c.restore();
 }
}
export function drawFalling(canvas,round,elapsed=0,duration=45000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const sec=Math.max(0,elapsed/1000);
 c.fillStyle='#111d35';c.fillRect(0,0,600,480);
 c.fillStyle='#f7e5b9';c.textAlign='center';c.font='bold 21px Arial';c.fillText('落ちものパズル・番号は最大3回登場',300,32);
 c.fillStyle='#263e59';c.beginPath();c.roundRect(168,58,266,360,9);c.fill();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){c.strokeStyle='#3b536e';c.strokeRect(177+x*50,70+y*43,46,39);}
 if(!round)return;
 let ev=round.events[0],idx=0;
 for(let i=0;i<round.events.length;i++){if(sec>=round.events[i].start){ev=round.events[i];idx=i;}else break;}
 const progress=clamp((sec-ev.start)/ev.dur);
 const board=progress>=1?ev.after:ev.before;
 if(ev.kind==='drop'||ev.kind==='final'||ev.kind==='gravity')tiles(c,ev.after,1,progress,ev.kind,ev.before);
 else if(ev.kind==='clear'){
  // Preserve all untouched blocks at full opacity. Fade only the actual two
  // removed IDs; otherwise the whole board appears to vanish on each match.
  const removed=new Set(ev.removed||[]);
  const survivors=ev.before.map(row=>row.map(item=>item&&!removed.has(item.id)?item:null));
  const matched=ev.before.map(row=>row.map(item=>item&&removed.has(item.id)?item:null));
  tiles(c,survivors);
  tiles(c,matched,1-progress);
 }
 else if(ev.kind==='lock'){tiles(c,ev.after);}
 else if(ev.kind==='winner'){tiles(c,ev.before);if(ev.cell){const px=178+ev.cell.x*50,py=70+ev.cell.y*43;c.strokeStyle='#ffe184';c.lineWidth=5;c.strokeRect(px-2,py-2,49,42);}}
 else if(ev.kind==='topout'){tiles(c,ev.before);const y=-40+52*ease(progress);c.fillStyle='#f7d57b';c.beginPath();c.roundRect(277,y,45,38,5);c.fill();c.fillStyle='#19283e';c.font='900 19px Arial';c.fillText(ev.n,299,y+26);}
 else tiles(c,board);
 c.fillStyle='#e6ebf7';c.font='bold 15px Arial';c.textAlign='center';
 c.fillText('同色で2個消去・同じ番号は最大3回',300,448);
 const ended=sec>=round.events[round.events.length-1].start+round.events[round.events.length-1].dur;
 c.fillStyle='#f5dda5';c.font='bold 19px Arial';
 c.fillText(ended?round.winner+'番が当選！':ev.kind==='clear'?'同じ条件で接触！ 消える！':ev.kind==='gravity'?'すき間へ落下！ 連鎖は続く？':ev.kind==='lock'?'最下段がグレーの土台になった！':ev.kind==='topout'?'積み上がった！ 当選！':'どんどん落ちてくる！',300,473);
}
