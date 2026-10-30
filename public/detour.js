// Haste makes waste: winding trail wins, shortcuts run into dead ends.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function makeDetourRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const arr=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=arr.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 const rank=new Map(arr.map((n,i)=>[n,i]));
 return {winner,count,runners:Array.from({length:count},(_,i)=>({n:i+1,lane:i%10,row:Math.floor(i/10),phase:r()*6.28,detour:r()>.35,stall:.24+r()*.48,rank:rank.get(i+1)??-1}))};
}
const points=[[65,385],[100,330],[215,330],[215,225],[100,225],[100,130],[280,130],[280,310],[405,310],[405,155],[518,155],[540,95]];
function route(p){const u=cl(p)*(points.length-1),i=Math.min(points.length-2,Math.floor(u)),f=u-i;return {x:points[i][0]+(points[i+1][0]-points[i][0])*f,y:points[i][1]+(points[i+1][1]-points[i][1])*f};}
export function drawDetour(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;let t=cl(elapsed/duration),done=t===1;
 c.fillStyle='#e9f2dd';c.fillRect(0,0,600,480);
 c.strokeStyle='#d0dcb9';c.lineWidth=45;c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 c.strokeStyle='#b0c47e';c.lineWidth=4;c.setLineDash([13,10]);c.stroke();c.setLineDash([]);
 c.strokeStyle='#deac9e';c.lineWidth=20;c.beginPath();c.moveTo(70,385);c.lineTo(300,385);c.lineTo(300,95);c.lineTo(540,95);c.stroke();
 c.fillStyle='#fff5dc';c.fillRect(288,204,90,38);c.fillStyle='#9b3e35';c.font='bold 16px Arial';c.textAlign='center';c.fillText('行き止まり！',333,229);
 c.fillStyle='#23394f';c.font='bold 23px Arial';c.fillText('急がば回れ！',300,28);
 c.fillStyle='#31624d';c.font='bold 18px Arial';c.fillText('START',65,429);
 c.fillStyle='#ae602f';c.fillRect(519,65,42,20);c.fillStyle='#fff';c.font='bold 16px Arial';c.fillText('GOAL',540,81);
 if(!round)return;
 for(const b of round.runners){
  const win=b.n===round.winner;
  const shortcut=!win&&!b.detour;
  const stop=!win&&t>b.stall;
  const runProgress=win?Math.min(1,t/.96):Math.min(.87,t*(.72+b.phase/18));
  let pos=route(runProgress);
  if(shortcut){const f=cl(t/.32);pos={x:65+245*f,y:385-180*f};if(t>.32){const z=cl((t-.32)/.25);pos.x=310-110*z;pos.y=205+180*z;}}
  else if(stop){const stopPos=route(Math.min(.86,b.stall*(.72+b.phase/18)));pos={x:stopPos.x,y:stopPos.y};}
  const jitter=reduced?0:Math.sin(t*22+b.phase)*3;
  const x=pos.x+(b.lane-4.5)*2+jitter,y=pos.y+(b.row-1.5)*4;
  c.fillStyle=win&&done?'#f6ba53':['#6099b5','#d793a2','#9d93c1','#78ad8a'][b.n%4];c.beginPath();c.arc(x,y,12,0,7);c.fill();
  c.fillStyle='#fffbe9';c.font='900 13px Arial';c.textBaseline='middle';c.fillText(String(b.n),x,y);
 }
 c.fillStyle='#25445a';c.font='bold 17px Arial';c.fillText(done?round.winner+'番が遠回りしてゴール！':'近道は行き止まり！ 遠回りが有利？',300,461);
}
