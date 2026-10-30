// Original neon maze chase; winner is selected uniformly by host.
const maze=[
"#####################",
"#...#.....#.....#...#",
"#.#.#.###.#.###.#.#.#",
"#.#...#... ...#...#.#",
"#.###.#.#####.#.###.#",
"#.....#...#...#.....#",
"###.#####.#.#####.###",
"#...#..... .....#...#",
"#.#.#.###.#.###.#.#.#",
"#.#...#...#...#...#.#",
"#.#####.#####.#####.#",
"#.......#...#.......#",
"#####################"];
const paths=[];for(let y=0;y<maze.length;y++)for(let x=0;x<maze[y].length;x++)if(maze[y][x]!== '#')paths.push({x,y});
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function makeMazeChaseRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const exit=new Map(others.map((n,i)=>[n,.19+.72*(i+.2*r())/Math.max(1,others.length)]));
 const heroes=Array.from({length:count},(_,i)=>({n:i+1,route:walk(r()*1000),exit:exit.get(i+1)??2,color:i%5}));
 const ghosts=Array.from({length:4},()=>walk(r()*1000));
 // Record real encounters from the same trajectories used for drawing.
 // This avoids a surprise animation firing merely because sprites overlap
 // visually while the underlying coordinates disagree.
 const hits=new Map();
 for(let step=0;step<=650;step++){
  const t=step/650;
  const gp=ghosts.map(route=>pos(route,t*.78));
  for(const hero of heroes){
   if(t>=hero.exit||hits.has(hero.n))continue;
   const hp=pos(hero.route,t);
   if(gp.some(p=>Math.hypot(p.x-hp.x,p.y-hp.y)<.76))hits.set(hero.n,t);
  }
 }
 return {winner,count,heroes,ghosts,hits:Object.fromEntries(hits)};
}
// Precompute a connected walk: every transition is exactly one open cell.
// Interpolate adjacent cells; never teleport across a wall or an isolated row.
const open=(x,y)=>y>=0&&y<maze.length&&x>=0&&x<maze[y].length&&maze[y][x]!=='#';
function walk(seed){
 let state=(Math.floor(seed*100003)>>>0)||1;
 const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 let p=paths[Math.floor(rand()*paths.length)],previous=null;
 const route=[p];
 for(let i=0;i<420;i++){
  let choices=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).filter(v=>open(v.x,v.y));
  const nonback=choices.filter(v=>!previous||v.x!==previous.x||v.y!==previous.y);
  if(nonback.length&&rand()<.9)choices=nonback;
  if(!choices.length){route.push(p);continue;}
  const next=choices[Math.floor(rand()*choices.length)];previous=p;p=next;route.push(p);
 }
 return route;
}
function pos(route,t){
 const step=clamp(t*26,0,route.length-1),i=Math.floor(step),u=step-i;
 const a=route[i],b=route[Math.min(i+1,route.length-1)];
 return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
}
export function drawMazeChase(canvas,round,elapsed=0,duration=13000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=clamp(elapsed/duration);
 c.fillStyle='#050b20';c.fillRect(0,0,600,480);c.fillStyle='#f1da8d';c.textAlign='center';c.font='bold 21px Arial';c.fillText('迷路の鬼ごっこ！',300,29);
 const z=21,ox=80,oy=52;
 for(let y=0;y<maze.length;y++)for(let x=0;x<maze[y].length;x++){
  const px=ox+x*z,py=oy+y*z;
  if(maze[y][x]==='#'){c.fillStyle='#173891';c.fillRect(px,py,z,z);c.strokeStyle='#6187ea';c.lineWidth=1;c.strokeRect(px+1,py+1,z-2,z-2);}
  else{c.fillStyle='#f3d79b';c.beginPath();c.arc(px+z/2,py+z/2,1.5,0,7);c.fill();}
 }
 if(!round)return;
 c.save();c.beginPath();
 for(let y=0;y<maze.length;y++)for(let x=0;x<maze[y].length;x++)if(open(x,y))c.rect(ox+x*z+.5,oy+y*z+.5,z-1,z-1);
 c.clip();
 for(let i=0;i<4;i++){const p=pos(round.ghosts[i],t*.78);const x=ox+p.x*z+z/2,y=oy+p.y*z+z/2;
  c.fillStyle=['#e7739f','#75c9d5','#efad6d','#a992eb'][i];c.beginPath();c.arc(x,y,7.5,Math.PI,0);c.lineTo(x+7.5,y+7);for(let k=0;k<4;k++)c.lineTo(x+6-k*4,y+5+(k%2)*2);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(x-2.8,y-1,1.8,0,7);c.arc(x+2.8,y-1,1.8,0,7);c.fill();
 }
 let remaining=0;
 for(const h of round.heroes){
  const hit=round.hits?.[h.n];
  const startled=hit!==undefined&&t>=hit&&t<hit+.042;
  if(t>=h.exit||hit!==undefined&&t>=hit+.042&&h.n!==round.winner)continue;
  remaining++;const p=pos(h.route,startled?hit:t),x=ox+p.x*z+z/2,y=oy+p.y*z+z/2;
  const final=h.n===round.winner?clamp((t-.91)/.09):0;
  c.save();c.translate(x,y);c.fillStyle=['#f3d56c','#83d5a5','#da8aca','#79bce6','#ed927f'][h.color];
  c.beginPath();c.arc(0,0,7.8,0,Math.PI*2);c.fill();
  c.fillStyle='#17233b';c.font='900 9px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(h.n,0,1);c.restore();
  if(startled){
   c.fillStyle='#fff1a0';c.font='bold 18px Arial';c.textAlign='center';c.fillText('!',x+7,y-9);
   c.strokeStyle='#fff1a0';c.lineWidth=2;c.beginPath();c.arc(x,y,9+(t-hit)*160,0,Math.PI*2);c.stroke();
  }
 }
 c.restore();
 if(t>.93){c.fillStyle='#edda9c';c.font='900 31px Arial';c.fillText(round.winner+'番、逃げ切り！',300,401);}
 c.fillStyle='#f4e9c9';c.font='bold 17px Arial';c.fillText(t>=1?'最後の1人が勝利！':'残り '+remaining+'人！ 敵から逃げろ！',300,463);
}
