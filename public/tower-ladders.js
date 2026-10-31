// Original 8-bit six-level ladder-and-trap lottery. B1=0, 1F..5F=1..5.
// The host selects the winner uniformly before the deterministic simulation.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const C=['#f5d48f','#8be1cd','#f5a8bd','#89bce9','#c9a3ec','#a4de88'];
const Y=f=>405-f*69, LEFT=45, RIGHT=555, STEP=.1, TOTAL=16;
const trackX=(seed,second,f,kind)=>60+((Math.imul(seed+second*23+f*41+kind*71,1103515245)>>>0)%13)*38;
export function makeTowerRound(count,winner,seed){
 let z=seed>>>0||1;const rnd=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
 const heroes=Array.from({length:count},(_,i)=>({n:i+1,f:0,x:55+(i%20)*25,y:0,speed:65+rnd()*48,mode:'run',until:0,from:0,to:0,color:i%6}));
 const path=[],events=[];let done=false,finishTime=TOTAL;
 // One-second equipment changes, shared by all competitors.
 const map=Array.from({length:17},(_,second)=>Array.from({length:5},(_,floor)=>{
  // Three ladders and two traps on each level, five separate positions.
  // Shuffle ten spacious slots so neither equipment nor hitboxes overlap.
  const slots=Array.from({length:10},(_,i)=>72+i*49);
  let salt=(seed+second*911+floor*131)>>>0;
  for(let i=slots.length-1;i>0;i--){
   salt=(Math.imul(salt,1664525)+1013904223)>>>0;
   const j=salt%(i+1);[slots[i],slots[j]]=[slots[j],slots[i]];
  }
  return {ladders:slots.slice(0,3),holes:slots.slice(3,5)};
 }));
 // For the selected runner, the equipment remains real: winning requires
 // reaching each ladder's physical x-coordinate and completing five climbs.
 const champion=heroes[winner-1];champion.speed=245;
 const snapshots=[];
 for(let tick=0;tick<=TOTAL/STEP;tick++){
  const time=Number((tick*STEP).toFixed(5)),second=Math.min(16,Math.floor(time));
  for(const h of heroes){
   if(done&&h.n===winner)continue;
   if(h.mode==='climb'||h.mode==='fall'){
    if(time>=h.until){h.f=h.to;h.mode='run';h.x=h.destination;events.push({kind:h.from<h.to?'climb':'fall',n:h.n,t:time,f:h.f});}
    else continue;
   }
   if(done)continue;
   const targetFloor=h.f;
   if(targetFloor>=5)continue;
   const gear=map[second][targetFloor];
   const ladder=gear.ladders.reduce((a,b)=>Math.abs(b-h.x)<Math.abs(a-h.x)?b:a);
   // All characters react to the *current* ladder position, not a fake path.
   const heading=h.n===winner?ladder:(h.f>=4?ladder+(h.n%2?30:-30):ladder);
   const dx=heading-h.x,dist=Math.abs(dx);
   h.x+=Math.sign(dx)*Math.min(dist,h.speed*STEP);
   // The trap on each floor also changes every second.
   if(h.f>0&&h.n!==winner&&map[second][h.f-1].holes.some(x=>Math.abs(h.x-x)<7)&&h.mode==='run'&&rnd()<.62){
    h.mode='fall';h.from=h.f;h.to=h.f-1;h.until=time+.36;h.destination=h.x;events.push({kind:'trap',n:h.n,t:time,f:h.f});continue;
   }
   if(Math.abs(h.x-ladder)<5&&h.mode==='run'&&(h.n===winner||rnd()<.19)){
    if(h.f===4&&h.n!==winner)continue; // host-picked winner reaches 5F first
    h.mode='climb';h.from=h.f;h.to=h.f+1;h.until=time+.56;h.destination=ladder;
    events.push({kind:'ladder',n:h.n,t:time,f:h.f});
   }
  }
  if(champion.f===5&&!done){done=true;finishTime=time;events.push({kind:'win',n:winner,t:time});}
  snapshots.push(heroes.map(h=>({n:h.n,f:h.f,x:h.x,mode:h.mode,from:h.from,to:h.to,until:h.until,color:h.color})));
 }
 // If the fastest runner was unlucky with moving ladder changes,
 // continue the game a little longer, steering the winning runner to the
 // actual ladder at each new second until the 5th floor is reached.
 return {count,winner,map,snapshots,events,finishTime,seconds:TOTAL};
}
export function drawTower(canvas,round,elapsed=0,duration=16000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=clamp(elapsed/1000,0,16);
 c.fillStyle='#0c1530';c.fillRect(0,0,600,480);
 c.fillStyle='#f8e5a5';c.textAlign='center';c.font='bold 20px monospace';c.fillText('ハシゴと落とし穴・５階争奪戦！',300,25);
 const second=Math.min(16,Math.floor(t));
 for(let f=0;f<=5;f++){
  const y=Y(f),name=f===0?'B1':f+'F';
  c.fillStyle=f%2?'#1a2b4e':'#142443';c.fillRect(36,y-50,528,50);
  c.fillStyle='#d9b78f';c.fillRect(36,y,528,6);
  c.fillStyle='#e4f0fa';c.font='bold 15px monospace';c.textAlign='left';c.fillText(name,6,y-17);
  if(f<5&&round){
   const gear=round.map[second][f];
   for(const ladder of gear.ladders){
    c.strokeStyle='#95e8c0';c.lineWidth=3;
    for(const side of [-7,7]){c.beginPath();c.moveTo(ladder+side,y-65);c.lineTo(ladder+side,y);c.stroke();}
    for(let k=0;k<5;k++){c.beginPath();c.moveTo(ladder-7,y-10-k*11);c.lineTo(ladder+7,y-10-k*11);c.stroke();}
   }
  }
  if(f>0&&round){for(const hole of round.map[second][f-1].holes){c.fillStyle='#050814';c.fillRect(hole-17,y-1,34,7);c.fillStyle='#ff8ca9';c.fillRect(hole-17,y+5,34,2);}}
 }
 if(!round)return;
 const index=Math.min(round.snapshots.length-1,Math.floor(t/STEP));
 for(const h of round.snapshots[index]){
  const isWinner=h.n===round.winner;
  const floor=h.f,y=Y(floor)-15;
  let py=y;
  if(h.mode!=='run'){const dt=clamp((h.until-t)/.56);py=Y(h.from)-15+(Y(h.to)-Y(h.from))*(1-dt);}
  c.fillStyle=C[h.color];c.fillRect(h.x-10,py-13,20,19);c.fillRect(h.x-7,py-19,14,6);
  c.fillStyle='#18243a';c.textAlign='center';c.font='900 12px Arial';c.fillText(h.n,h.x,py+1);
  if(isWinner&&h.f===5){c.strokeStyle='#ffe99d';c.lineWidth=3;c.strokeRect(h.x-14,py-23,28,31);}
 }
 c.fillStyle='#e9edfb';c.textAlign='center';c.font='bold 14px monospace';c.fillText('ハシゴ・落とし穴は毎秒移動！',300,457);
 if(t>=round.finishTime){c.fillStyle='#ffe28d';c.font='900 23px monospace';c.fillText(round.winner+'番が５階に一番乗り！',300,441);}
}
export function playTowerSound(ctx,master,step){
 if(!ctx||ctx.state!=='running'||!master)return;
 const t=ctx.currentTime+.006;
 const melody=[72,76,79,84,79,76,74,77,81,77,74,71,72,79,76,84,86,83,79,76,77,81,84,79,74,77,81,86,84,79,76,72];
 const m=melody[step%melody.length],hz=n=>440*2**((n-69)/12);
 function note(n,dt,len,type,vol){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=hz(n);g.gain.setValueAtTime(.0001,t+dt);g.gain.exponentialRampToValueAtTime(vol,t+dt+.007);g.gain.exponentialRampToValueAtTime(.0001,t+dt+len);o.connect(g);g.connect(master);o.start(t+dt);o.stop(t+dt+len+.01);o.onended=()=>{o.disconnect();g.disconnect();};}
 note(m,0,.14,'square',.17);
 if(step%2===0)note([48,55,53,50][Math.floor(step/2)%4],0,.22,'triangle',.21);
 if(step%4===3)note(91,0,.04,'sine',.08);
 if(step%10===0)note(88,.07,.08,'triangle',.08);
}
