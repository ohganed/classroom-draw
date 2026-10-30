// Original barrel-escape arcade draw. Winner chosen fairly by the host.
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const color=['#f5d17c','#a3def0','#eaa0bf','#a4dfa0','#d0b4f2'];
export function makeBarrelRound(count,winner,seed){
 let z=seed>>>0||1;const rand=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
 const order=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=order.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 const lose=new Map(order.map((n,i)=>[n,2+9.4*(i+.4*rand())/Math.max(1,order.length)]));
 return {winner,count,heroes:Array.from({length:count},(_,i)=>({n:i+1,phase:rand()*5,side:rand()>.5?1:-1,lose:lose.get(i+1)??100})),barrels:Array.from({length:12},(_,i)=>({phase:rand()*.9+i*.65,level:i%4}))};
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
 // Barrels roll along the same sloped platform line as the runners.
 if(round){for(let i=0;i<round.barrels.length;i++){
  const b=round.barrels[i],travel=(sec*0.23+b.phase)%1,dir=b.level%2?1:-1;
  const x=dir===1?48+travel*500:548-travel*500,y=floorY(b.level,x)-14;
  c.save();c.translate(x,y);c.rotate(sec*4*(dir===1?1:-1));c.fillStyle='#c47443';c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();c.strokeStyle='#ffce87';c.lineWidth=3;c.beginPath();c.arc(0,0,8,0,Math.PI*2);c.stroke();c.strokeStyle='#5c352c';c.beginPath();c.moveTo(-10,0);c.lineTo(10,0);c.stroke();c.restore();
 }}
 let remaining=0;
 if(round)for(const h of round.heroes){
  if(sec>h.lose+.22)continue;
  const jumping=cl((sec%1.1-.1)/.55,0,1),jump=Math.sin(jumping*Math.PI)*24;
  const progress=cl((sec+h.phase*.35)/11,0,1),level=Math.min(3,Math.floor(progress*4)),direction=level%2?1:-1;
  const x=direction>0?56+cl((progress*4)%1,0,1)*480:544-cl((progress*4)%1,0,1)*480;
  const y=floorY(level,x)-19-jump,hit=sec>=h.lose;
  if(!hit)remaining++;
  c.save();c.translate(x,y);c.fillStyle=color[h.n%color.length];
  c.fillRect(-10,-12,20,22);c.fillRect(-8,-18,16,7);c.fillStyle='#27354a';c.fillRect(-5,-7,3,3);c.fillRect(3,-7,3,3);
  c.fillStyle='#fff9da';c.fillRect(-13,-32,26,14);c.fillStyle='#1c2e48';c.font='bold 11px monospace';c.fillText(h.n,0,-21);
  if(hit){c.fillStyle='#fff1aa';c.font='bold 20px monospace';c.fillText('!',15,-15);}
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
