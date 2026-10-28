// Calm randomized maze race. All numbers have equal odds; eight runners are shown.
const COLS=12,ROWS=9,CELL=43,X=42,Y=34;
const rng=seed=>{let s=(seed>>>0)||1;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)};
const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a};
export function makeMazeRound(count,winner,seed){
 const rand=rng(seed);
 const grid=Array.from({length:COLS*ROWS},()=>[true,true,true,true]); // N E S W
 const seen=new Set([0]),stack=[0],vectors=[[-COLS,0,2],[1,1,3],[COLS,2,0],[-1,3,1]];
 while(stack.length){
  const cell=stack[stack.length-1],x=cell%COLS,y=Math.floor(cell/COLS);
  const choices=shuffle([0,1,2,3],rand).filter(d=>{let nx=x+[0,1,0,-1][d],ny=y+[-1,0,1,0][d];return nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&!seen.has(ny*COLS+nx)});
  if(!choices.length){stack.pop();continue;}
  const d=choices[0],nx=x+[0,1,0,-1][d],ny=y+[-1,0,1,0][d],next=ny*COLS+nx;
  grid[cell][d]=false;grid[next][(d+2)%4]=false;seen.add(next);stack.push(next);
 }
 const target=COLS*ROWS-1;
 function path(a,b){
  const q=[a],parent=new Map([[a,-1]]);
  for(let h=0;h<q.length;h++){const u=q[h];if(u===b)break;
   const x=u%COLS,y=Math.floor(u/COLS);
   for(let d=0;d<4;d++){if(grid[u][d])continue;const v=u+[-COLS,1,COLS,-1][d];if(v<0||v>=grid.length||parent.has(v))continue;parent.set(v,u);q.push(v);}
  }
  if(!parent.has(b))return [a];
  const out=[];for(let u=b;u!==-1;u=parent.get(u))out.push(u);return out.reverse();
 }
 const nums=shuffle(Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner),rand).slice(0,Math.min(7,count-1));
 nums.push(winner);shuffle(nums,rand);
 const main=path(0,target);
 const racers=nums.map((number,i)=>{
  const win=number===winner;
  // Nonwinners take detours and never cross the exit before the selected winner.
  const detours=Math.floor(rand()*3)+2,route=[0];
  for(let j=0;j<detours;j++){
   const start=main[Math.floor(rand()*Math.max(1,main.length-2))];
   const until=main.indexOf(start);
   if(route.length===1)route.push(...main.slice(1,until+1));
   const options=[...Array(grid.length).keys()].filter(v=>v!==start);
   const side=options[Math.floor(rand()*options.length)];
   route.push(...path(start,side).slice(1),...path(side,start).slice(1));
  }
  route.push(...main.slice(1));
  return {number,route:win?main:route,delay:win?.04:rand()*.2,limit:win?1:.74+rand()*.17};
 });
 return {grid,racers,winner};
}
export function drawMaze(canvas,round,elapsed=0,duration=8000,reduced=false){
 if(!round)return;
 const c=canvas.getContext('2d');if(!c)return;
 const p=Math.max(0,Math.min(1,elapsed/duration)),done=p>=1;
 c.clearRect(0,0,600,470);c.fillStyle='#17293e';c.fillRect(24,14,550,445);
 c.strokeStyle='#6b8299';c.lineWidth=2;c.beginPath();
 for(let i=0;i<round.grid.length;i++){
  const x=X+(i%COLS)*CELL,y=Y+Math.floor(i/COLS)*CELL,w=round.grid[i];
  if(w[0]){c.moveTo(x,y);c.lineTo(x+CELL,y);}
  if(w[3]){c.moveTo(x,y);c.lineTo(x,y+CELL);}
  if(i%COLS===COLS-1&&w[1]){c.moveTo(x+CELL,y);c.lineTo(x+CELL,y+CELL);}
  if(Math.floor(i/COLS)===ROWS-1&&w[2]){c.moveTo(x,y+CELL);c.lineTo(x+CELL,y+CELL);}
 }c.stroke();
 c.fillStyle='#a8b6c5';c.font='bold 14px Arial';c.textAlign='left';c.fillText('START',X,24);
 c.fillStyle='#dfc88d';c.textAlign='right';c.fillText('GOAL',X+COLS*CELL,Y+ROWS*CELL+27);
 round.racers.forEach((b,i)=>{
  const t=done?(b.number===round.winner?1:b.limit):(reduced?0:Math.max(0,(p-b.delay)/(1-b.delay))*b.limit);
  const steps=b.route.length-1,z=t*steps,k=Math.min(steps,Math.floor(z)),u=z-k;
  const a=b.route[k],v=b.route[Math.min(steps,k+1)];
  const x=X+((a%COLS)*(1-u)+(v%COLS)*u+.5)*CELL;
  const y=Y+(Math.floor(a/COLS)*(1-u)+Math.floor(v/COLS)*u+.5)*CELL;
  const r=11;
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);
  c.fillStyle=b.number===round.winner&&done?'#d9c181':i%3===0?'#94aabd':i%3===1?'#b4a593':'#8da9a1';c.fill();
  c.strokeStyle='#34455c';c.lineWidth=1;c.stroke();
  c.fillStyle='#152537';c.font='bold 12px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(b.number),x,y);
 });
 if(done){c.fillStyle='#ebd09a';c.font='bold 20px Arial';c.textAlign='center';c.fillText(round.winner+' 番が脱出！',300,452);}
}
