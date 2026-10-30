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
 return {winner,count,heroes:Array.from({length:count},(_,i)=>({n:i+1,seed:r()*1000,exit:exit.get(i+1)??2,color:i%5})),seed:r()*1000};
}
function pos(seed,t){const z=Math.floor(seed)%paths.length;const pace=Math.floor(t*26+seed*3);return paths[(z+pace)%paths.length];}
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
 for(let i=0;i<4;i++){const p=pos(round.seed+i*39,t*.78);const x=ox+p.x*z+z/2,y=oy+p.y*z+z/2;
  c.fillStyle=['#e7739f','#75c9d5','#efad6d','#a992eb'][i];c.beginPath();c.arc(x,y,11,Math.PI,0);c.lineTo(x+11,y+10);for(let k=0;k<4;k++)c.lineTo(x+8-k*5,y+6+(k%2)*4);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(x-4,y-1,3,0,7);c.arc(x+4,y-1,3,0,7);c.fill();
 }
 let remaining=0;
 for(const h of round.heroes){if(t>=h.exit)continue;remaining++;const p=pos(h.seed,t),x=ox+p.x*z+z/2,y=oy+p.y*z+z/2;
  const final=h.n===round.winner?clamp((t-.91)/.09):0;
  c.save();c.translate(x,y);c.fillStyle=['#f3d56c','#83d5a5','#da8aca','#79bce6','#ed927f'][h.color];
  c.beginPath();c.arc(0,0,10+final*7,0,Math.PI*2);c.fill();
  c.fillStyle='#17233b';c.font='900 11px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(h.n,0,1);c.restore();
 }
 if(t>.93){c.fillStyle='#edda9c';c.font='900 31px Arial';c.fillText(round.winner+'番、逃げ切り！',300,401);}
 c.fillStyle='#f4e9c9';c.font='bold 17px Arial';c.fillText(t>=1?'最後の1人が勝利！':'残り '+remaining+'人！ 敵から逃げろ！',300,463);
}
