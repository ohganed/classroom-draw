// One 40-lane jungle-gym amidakuji, traversed bottom-to-top.
// Every bridge is a real exchange of neighboring lanes. Winner remains
// uniformly selected by the host; the flower is placed at its actual exit.
const C=['#f5d179','#86d7f2','#f3a2bb','#99dda8','#c4a2f1'];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const LEVELS=22, TOP=76, BOTTOM=407, LEFT=33, RIGHT=567;
export function makeAmidaRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const rungs=Array.from({length:LEVELS},()=>[]);
 for(let level=0;level<LEVELS;level++){
  for(let x=0;x<count-1;x++){
   if(rand()<.24){rungs[level].push(x);x++;}
  }
 }
 const members=[];
 for(let start=0;start<count;start++){
  let lane=start;const route=[lane];
  for(let level=0;level<LEVELS;level++){
   const rung=rungs[level];
   if(rung.includes(lane))lane++;
   else if(rung.includes(lane-1))lane--;
   route.push(lane);
  }
  members.push({n:start+1,start,exit:lane,route});
 }
 const chosen=members[winner-1];
 return {count,winner,rungs,members,flowerLane:chosen.exit,seconds:13};
}
export function drawAmida(canvas,round,elapsed=0,duration=13000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const progress=clamp(elapsed/(duration*.89));
 c.fillStyle='#081426';c.fillRect(0,0,600,480);
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle='#fae6ac';
 c.font='bold 21px Arial';c.fillText('ジャングルジム・一斉あみだくじ！',300,26);
 if(!round)return;
 const count=round.count,dx=(RIGHT-LEFT)/Math.max(1,count-1);
 const xx=i=>count===1?300:LEFT+i*dx;
 const yy=i=>BOTTOM-(BOTTOM-TOP)*i/LEVELS;
 // Cage-like rails and frames; all participants share one connected structure.
 for(let i=0;i<count;i++){
  const x=xx(i);
  c.strokeStyle=i%5===0?'#7194bb':'#46668f';c.lineWidth=i%5===0?2:1.25;
  c.beginPath();c.moveTo(x,TOP);c.lineTo(x,BOTTOM);c.stroke();
 }
 for(let i=0;i<=LEVELS;i+=4){
  const y=yy(i);
  c.strokeStyle='rgba(95,164,199,.18)';c.lineWidth=1;
  c.beginPath();c.moveTo(LEFT-13,y-5);c.lineTo(RIGHT+13,y-5);c.stroke();
 }
 for(let i=0;i<LEVELS;i++)for(const lane of round.rungs[i]){
  const y=yy(i+.5);
  c.strokeStyle='#eac477';c.lineWidth=3;
  c.beginPath();c.moveTo(xx(lane),y);c.lineTo(xx(lane+1),y);c.stroke();
 }
 // The bouquet sits exactly above the exit reached by the fair winner.
 const flowerX=xx(round.flowerLane);
 c.font='27px sans-serif';c.textAlign='center';c.fillText('💐',flowerX,TOP-13);
 c.fillStyle='#f4d990';c.font='bold 13px Arial';c.fillText('GOAL',flowerX,TOP-42);
 const step=progress*LEVELS,j=Math.min(LEVELS-1,Math.floor(step)),u=step-j;
 for(const m of round.members){
  const crossing=clamp((u-.22)/.56),lane=m.route[j]+(m.route[j+1]-m.route[j])*crossing;
  const x=xx(progress>=1?m.exit:lane),y=progress>=1?TOP:yy(j+u);
  c.fillStyle=m.n===round.winner?'#ffe68e':C[(m.n-1)%5];
  c.beginPath();c.arc(x,y,Math.max(5,Math.min(9,dx*.41)),0,Math.PI*2);c.fill();
  if(count<=25||m.n===round.winner||progress<.06){
   c.font='bold '+(count<=25?10:8)+'px Arial';
   c.fillStyle='#132640';c.textAlign='center';c.textBaseline='middle';c.fillText(m.n,x,y+.4);
  }
 }
 if(progress>=1){
  c.strokeStyle='#ffdf8b';c.lineWidth=3;c.beginPath();c.arc(flowerX,TOP,15,0,Math.PI*2);c.stroke();
  c.fillStyle='#ffe5a4';c.font='bold 20px Arial';c.fillText(round.winner+'番が花束に到着！',300,451);
 }else{
  c.fillStyle='#f3dcab';c.font='bold 15px Arial';c.fillText('40人が下から一斉に登る！',300,451);
 }
 c.textBaseline='alphabetic';
}

export function playAmidaBeat(ctx,master,step){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.005,melody=[76,79,83,81,79,76,74,72,74,77,81,79,76,72,79,83];
 function tone(n,dt,len,type,vol){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=440*2**((n-69)/12);g.gain.setValueAtTime(.0001,now+dt);g.gain.exponentialRampToValueAtTime(vol,now+dt+.007);g.gain.exponentialRampToValueAtTime(.0001,now+dt+len);o.connect(g);g.connect(master);o.start(now+dt);o.stop(now+dt+len+.012);o.onended=()=>{o.disconnect();g.disconnect();};}
 tone(melody[step%16],0,.11,'square',.13);
 if(step%2===0)tone([48,53,55,50][Math.floor(step/2)%4],0,.18,'triangle',.17);
 if(step%4===3)tone(91,0,.04,'sine',.065);
}
