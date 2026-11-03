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
 if(!Number.isInteger(count)||count<1||count>40)throw new RangeError('Invalid count');
 let state=seed>>>0||1;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const board=Array.from({length:H},()=>Array(W).fill(null)),events=[];
 let time=.12,nextId=1,drops=0,chains=0,previousDropColor=-1;
 const previousColor=Array(count+1).fill(-1);
 const snapshot=()=>clone(board),filled=()=>board.reduce((sum,row)=>sum+row.filter(Boolean).length,0);
 const record=(kind,before,after,dur,more={})=>{events.push({kind,start:time,dur,before,after,...more});time+=dur;};
 // For fewer than 14 entrants, fixed gray foundation blocks leave at most
 // three available numbered cells per entrant while still filling 40/40.
 const foundation=Math.max(0,40-count*3);
 for(let i=0;i<foundation;i++){
  const x=i%W,y=H-1-Math.floor(i/W);
  board[y][x]={id:-i-1,n:'',color:0,locked:true,foundation:true};
 }
 function lockRows(){
  for(let y=H-1;y>=0;y--){
   if(!board[y].every(Boolean))break;
   if(board[y].every(v=>v.locked))continue;
   if(y<H-1&&!board[y+1].every(v=>v?.locked))break;
   const before=snapshot();
   for(const tile of board[y])tile.locked=true;
   record('lock',before,snapshot(),.12,{row:y});
  }
 }
 function resolve(id){
  let loc=null;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(board[y][x]?.id===id)loc=[x,y];
  if(!loc)return;
  const [x,y]=loc,tile=board[y][x];
  const around=[[x-1,y],[x+1,y],[x,y+1],[x-1,y+1],[x+1,y+1]];
  const match=around.map(([xx,yy])=>xx>=0&&xx<W&&yy>=0&&yy<H?board[yy][xx]:null).find(v=>v&&same(tile,v));
  if(!match)return;
  const before=snapshot();
  board[y][x]=null;
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++)if(board[yy][xx]?.id===match.id)board[yy][xx]=null;
  record('clear',before,snapshot(),.15,{removed:[id,match.id]});
  const beforeGravity=snapshot();let moved=false;
  for(let xx=0;xx<W;xx++){
   let target=H-1;
   for(let yy=H-1;yy>=0;yy--)if(board[yy][xx]){
    if(target!==yy){board[target][xx]=board[yy][xx];board[yy][xx]=null;moved=true;}
    target--;
   }
  }
  if(moved){record('gravity',beforeGravity,snapshot(),.18);chains++;}
 }
 const stream=[];
 for(let cycle=0;cycle<3;cycle++){
  const bag=Array.from({length:count},(_,i)=>i+1);
  for(let i=bag.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
  if(count>1&&stream.length&&bag[0]===stream.at(-1)){
   const j=1+Math.floor(rand()*(count-1));[bag[0],bag[j]]=[bag[j],bag[0]];
  }
  stream.push(...bag);
 }
 let actualWinner=null,winningCell=null;
 for(const n of stream){
  if(filled()===40)break;
  const heights=Array.from({length:W},(_,x)=>board.filter(row=>row[x]).length);
  const minH=Math.min(...heights),available=heights.map((h,x)=>({h,x})).filter(p=>p.h===minH&&p.h<H);
  if(!available.length)throw new Error('All columns full before board is full');
  const col=available[Math.floor(rand()*available.length)].x,row=H-1-heights[col];
  const adjacent=[[col-1,row],[col+1,row],[col,row+1],[col-1,row+1],[col+1,row+1]];
  const touchingColors=new Set(adjacent.map(([x,y])=>x>=0&&x<W&&y>=0&&y<H?board[y][x]:null).filter(v=>v&&!v.locked).map(v=>v.color));
  let colors=COLORS.map((_,i)=>i).filter(i=>i!==previousColor[n]&&i!==previousDropColor);
  // Allow a few genuine early matches. When approaching completion, avoid
  // clears to ensure the entire board becomes occupied.
  const canClear=count>20&&drops<12&&filled()<24;
  if(!canClear){const safe=colors.filter(c=>!touchingColors.has(c));if(safe.length)colors=safe;}
  const color=colors[Math.floor(rand()*colors.length)];
  previousColor[n]=color;previousDropColor=color;
  const before=snapshot(),id=nextId++;
  board[row][col]={n,id,color};
  record('drop',before,snapshot(),.45,{n,color,col,row});
  drops++;
  if(canClear)resolve(id);
  lockRows();
  if(filled()===40){actualWinner=n;winningCell={x:col,y:row,n};break;}
 }
 if(filled()!==40)throw new Error('Puzzle did not fill its board');
 record('winner',snapshot(),snapshot(),.9,{n:actualWinner,cell:winningCell,full:true});
 const scale=(43.7-.12)/Math.max(.001,time-.12);
 for(const event of events){event.start=.12+(event.start-.12)*scale;event.dur*=scale;}
 return {winner:actualWinner,count,events,seconds:45,drops,chains,topout:false,full:true,filled:40,foundation};
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
 c.fillStyle='#f7e5b9';c.textAlign='center';c.font='bold 21px Arial';c.fillText('落ちものパズル・全40マスを埋めよう',300,32);
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
 c.fillText(ended?'満杯！ '+round.winner+'番が当選！':ev.kind==='clear'?'同じ条件で接触！ 消える！':ev.kind==='gravity'?'すき間へ落下！ 連鎖は続く？':ev.kind==='lock'?'最下段がグレーの土台になった！':ev.kind==='topout'?'積み上がった！ 当選！':'どんどん落ちてくる！',300,473);
}
