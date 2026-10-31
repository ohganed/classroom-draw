// Original barrel-escape arcade draw. Winner chosen fairly by the host.
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const color=['#f5d17c','#a3def0','#eaa0bf','#a4dfa0','#d0b4f2'];
export function makeBarrelRound(count,winner,seed){
 let z=seed>>>0||1;const rand=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
 const order=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=order.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 const lose=new Map(order.map((n,i)=>[n,2+9.2*(i+.45)/Math.max(1,order.length)]));
 const heroes=Array.from({length:count},(_,i)=>({
  n:i+1,level:i%4,x:78+(Math.floor(i/4)%10)*46,
  lose:lose.get(i+1)??100
 }));
 // Each barrel is aimed at an actual runner on that runner's platform.
 // The time of contact is when the moving barrel reaches the runner's x.
 const barrels=order.map(n=>{
  const h=heroes[n-1],impact=h.lose,dir=(n%2?1:-1);
  return {n,level:h.level,impact,dir,target:h.x,start:impact-.72};
 });
 // The winning character faces one extra barrel and jumps over it.
 const chosen=heroes[winner-1];
 barrels.push({n:winner,level:chosen.level,impact:12.15,dir:1,target:chosen.x,start:11.43,dodge:true});
 return {winner,count,heroes,barrels};
}
function floorY(level,x){return 377-level*79+(level%2?-.035:.035)*(x-300);}
export function drawBarrel(canvas,round,elapsed=0,duration=13500,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const sec=cl(elapsed/1000,0,13.5),t=sec/13.5;
 c.fillStyle='#10132c';c.fillRect(0,0,600,480);
 c.textAlign='center';c.font='bold 22px monospace';c.fillStyle='#f9d786';c.fillText('タル転がし・大脱走！',300,29);
 for(let j=0;j<4;j++){
  const left=43,right=557,y0=floorY(j,left),y1=floorY(j,right);
  c.strokeStyle='#ec7697';c.lineWidth=9;c.beginPath();c.moveTo(left,y0);c.lineTo(right,y1);c.stroke();
  c.strokeStyle='#ffe19d';c.lineWidth=2;c.beginPath();c.moveTo(left,y0-4);c.lineTo(right,y1-4);c.stroke();
  if(j<3){const x=j%2===0?540:60;c.strokeStyle='#87ccdb';c.lineWidth=4;for(let k=0;k<5;k++){const y=floorY(j,x)-k*13;c.beginPath();c.moveTo(x-12,y);c.lineTo(x+12,y);c.stroke();}}
 }
 // Enlarge number labels once half the original contestants have been caught.
 const aliveCount=round?round.heroes.filter(h=>h.n===round.winner||sec<h.lose).length:0;
 const enlarged=round&&aliveCount<=Math.ceil(round.count/2);
 // Both the barrel and runner use the same platform and x coordinates.
 const barrelPosition=b=>b.target+(sec-b.impact)*165*b.dir;
 if(round)for(const b of round.barrels){
  if(sec<b.start||sec>b.impact+.45)continue;
  const x=barrelPosition(b),y=floorY(b.level,x)-13;
  if(x<43||x>557)continue;
  c.save();c.translate(x,y);c.rotate((sec-b.start)*11*b.dir);
  c.fillStyle='#c47443';c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();
  c.strokeStyle='#ffce87';c.lineWidth=3;c.beginPath();c.arc(0,0,8,0,Math.PI*2);c.stroke();
  c.strokeStyle='#5c352c';c.beginPath();c.moveTo(-10,0);c.lineTo(10,0);c.stroke();
  c.rotate(-(sec-b.start)*11*b.dir);
  c.fillStyle='#fff7d1';c.fillRect(enlarged?-14:-11,enlarged?-14:-9,enlarged?28:22,enlarged?28:18);
  c.fillStyle='#17253b';c.textAlign='center';c.textBaseline='middle';c.font='900 '+(enlarged?19:10)+'px monospace';c.fillText(b.n,0,1);
  c.restore();
 }
 let remaining=0;
 if(round)for(const h of round.heroes){
  const isWinner=h.n===round.winner;
  const b=round.barrels.find(v=>v.target===h.x&&v.level===h.level&&(Boolean(v.dodge)===isWinner)&&(isWinner||Math.abs(v.impact-h.lose)<.001));
  const danger=b&&sec>=b.start?Math.abs(barrelPosition(b)-h.x):Infinity;
  // All disappearances follow an actual barrel reaching the same x on the
  // same floor; the winner is the only runner who jumps clear of the impact.
  const hit=!isWinner&&b&&sec>=b.impact;
  if(hit&&sec>h.lose+.38)continue;
  if(!hit)remaining++;
  const jump=isWinner&&b&&sec>=b.impact-.24&&sec<=b.impact+.28
   ?Math.sin(Math.PI*(sec-(b.impact-.24))/.52)*35:0;
  const x=h.x,y=floorY(h.level,x)-19-jump;
  c.save();c.translate(x,y);
  if(hit){const fall=cl((sec-h.lose)/.13);c.translate(0,fall*12);c.rotate(fall*1.48);}
  c.fillStyle=color[h.n%color.length];
  c.fillRect(-10,-12,20,22);c.fillRect(-8,-18,16,7);
  c.fillStyle='#27354a';c.fillRect(-5,-7,3,3);c.fillRect(3,-7,3,3);
  c.fillStyle='#fff9da';c.fillRect(enlarged?-18:-13,enlarged?-44:-32,enlarged?36:26,enlarged?27:14);
  c.fillStyle='#1c2e48';c.font=(enlarged?'900 20px':'bold 11px')+' monospace';c.textBaseline='middle';c.fillText(h.n,0,enlarged?-30:-25);
  if(hit){c.fillStyle='#fff1aa';c.font='bold 22px monospace';c.fillText('★',15,-15);}
  if(jump>12){c.fillStyle='#fef6ac';c.font='bold 13px monospace';c.fillText('!',14,-18);}
  c.restore();
 }
 c.fillStyle='#e9f2fc';c.font='bold 16px monospace';c.fillText('残り '+remaining+'人',300,437);
 if(t>.86){c.font='bold 27px monospace';c.fillStyle='#ffe99b';c.fillText(round.winner+'番が大脱走！',300,409);}
 c.fillStyle='#9ad6ee';c.font='12px monospace';c.fillText('ゴロゴロ！ ピョン！ 逃げ切れるか？',300,467);
}
export function playBarrelSound(ctx,master,beat){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.005;
 const melody=[76,79,83,79,74,77,81,77,72,76,79,84,83,79,76,72];
 const note=(m,time,dur,type,vol)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=440*2**((m-69)/12);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(vol,time+.008);gain.gain.exponentialRampToValueAtTime(.0001,time+dur);osc.connect(gain);gain.connect(master);osc.start(time);osc.stop(time+dur+.01);osc.onended=()=>{osc.disconnect();gain.disconnect();};};
 note(melody[beat%16],now,.14,'square',.16);
 if(beat%2===0)note([48,55,50,53][Math.floor(beat/2)%4],now,.2,'triangle',.19);
 if(beat%4===3)note(90,now,.045,'square',.06);
 if(beat%12===6)note(95,now,.085,'sine',.11);
}
