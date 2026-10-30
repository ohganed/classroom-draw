// Five-column cascade puzzle. Every visible clear is produced by actual adjacency.
// Random number stream is balanced by shuffled full bags; app independently picks winner.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const COLORS=['#ed847c','#72b9e2','#efc56e','#92cb8f','#bd9fe9','#77d2c8'];
const W=5,H=8;
const colOf=n=>(n-1)%COLORS.length;
const same=(a,b)=>colOf(a.n)===colOf(b.n)||((a.n&1)===(b.n&1));
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
 let time=0.15,nextId=1,bag=[],drops=0,chains=0;
 const fresh=()=>{bag=Array.from({length:count},(_,i)=>i+1);for(let i=bag.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}};
 const record=(kind,before,after,dur,more={})=>{events.push({kind,start:time,dur,before,after,...more});time+=dur;};
 const cascade=()=>{
  for(let i=0;i<25;i++){
   const dead=pairs(board);if(!dead.size)break;
   let before=clone(board);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(board[y][x]&&dead.has(board[y][x].id))board[y][x]=null;
   record('clear',before,clone(board),.17,{removed:[...dead]});
   before=clone(board);
   if(gravity(board)){record('gravity',before,clone(board),.14);chains++;}
  }
 };
 const total=Math.max(85,Math.min(180,count*3));
 for(let i=0;i<total;i++){
  if(!bag.length)fresh();
  const n=bag.pop();
  let choices=[];for(let x=0;x<W;x++)if(!board[0][x])choices.push(x);
  if(!choices.length){
   // An arcade "shuffle" clears the clogged well visibly, then play resumes.
   record('flush',clone(board),Array.from({length:H},()=>Array(W).fill(null)),.4);
   for(let y=0;y<H;y++)board[y].fill(null);
   choices=[0,1,2,3,4];
  }
  const col=choices[Math.floor(rand()*choices.length)];
  let row=H-1;while(row>0&&!(!board[row][col]))row--;
  const before=clone(board);board[row][col]={n,id:nextId++};
  record('drop',before,clone(board),.24,{n,col,row});
  drops++;cascade();
 }
 // A visible bonus stage clears the remaining board and introduces exactly one
 // new block: the winner, chosen uniformly at the beginning by app.js.
 const empty=Array.from({length:H},()=>Array(W).fill(null));
 record('bonus',clone(board),empty,.65);
 const before=clone(empty),col=2;empty[H-1][col]={n:winner,id:nextId++};
 record('final',before,clone(empty),.70,{n:winner,col,row:H-1});
 return {winner,count,events,seconds:time+1.35,drops,chains};
}
export const fallingDuration=round=>Math.ceil((round?.seconds??40)*1000);
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
  c.save();c.globalAlpha=alpha;c.fillStyle=COLORS[colOf(item.n)];
  c.beginPath();c.roundRect(px,py,45,38,5);c.fill();
  c.strokeStyle='#f7f1dc';c.lineWidth=1.5;c.stroke();
  c.fillStyle='#15273f';c.textAlign='center';c.textBaseline='middle';c.font='900 17px Arial';c.fillText(item.n,px+22.5,py+19);
  c.restore();
 }
}
export function drawFalling(canvas,round,elapsed=0,duration=40000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const sec=Math.max(0,elapsed/1000);
 c.fillStyle='#111d35';c.fillRect(0,0,600,480);
 c.fillStyle='#f7e5b9';c.textAlign='center';c.font='bold 21px Arial';c.fillText('落ちものパズル・５列の大連鎖！',300,32);
 c.fillStyle='#263e59';c.beginPath();c.roundRect(168,58,266,360,9);c.fill();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){c.strokeStyle='#3b536e';c.strokeRect(177+x*50,70+y*43,46,39);}
 if(!round)return;
 let ev=round.events[0],idx=0;
 for(let i=0;i<round.events.length;i++){if(sec>=round.events[i].start){ev=round.events[i];idx=i;}else break;}
 const progress=clamp((sec-ev.start)/ev.dur);
 const board=progress>=1?ev.after:ev.before;
 if(ev.kind==='drop'||ev.kind==='final'||ev.kind==='gravity')tiles(c,ev.after,1,progress,ev.kind,ev.before);
 else if(ev.kind==='clear'){tiles(c,ev.before,1-progress); }
 else if(ev.kind==='bonus'){tiles(c,ev.before,1-progress);}
 else tiles(c,board);
 c.fillStyle='#e6ebf7';c.font='bold 15px Arial';c.textAlign='center';
 c.fillText('同じ色・偶数同士・奇数同士が隣接 → 消去',300,448);
 const ended=sec>=round.events[round.events.length-1].start+round.events[round.events.length-1].dur;
 c.fillStyle='#f5dda5';c.font='bold 19px Arial';
 c.fillText(ended?round.winner+'番が最後に残った！':ev.kind==='clear'?'同じ条件で接触！ 消える！':ev.kind==='gravity'?'すき間へ落下！ 連鎖は続く？':ev.kind==='bonus'?'ボーナス全消し！':ev.kind==='final'?'最後の１個！':'どんどん落ちてくる！',300,473);
}
