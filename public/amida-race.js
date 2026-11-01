// 7x7 three-dimensional amidakuji: 49 pillars, 40 randomly assigned players.
// Each rung joins adjacent pillars east-west or north-south at a real height.
const N=7,LEVELS=23,DURATION=13000;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const index=(x,z)=>z*N+x;
const coords=i=>({x:i%N,z:Math.floor(i/N)});
const pal=['#f4d278','#89dced','#f0a4c5','#9cdd9a','#c6a6f1'];
function shuffle(a,rand){for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeAmidaRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const starts=shuffle(Array.from({length:49},(_,i)=>i),rand).slice(0,count);
 const edges=[];
 for(let level=0;level<LEVELS;level++){
  // A matching at each height ensures only one path per pillar.
  // The final six levels contain more switches: genuine last-minute route changes.
  const available=shuffle(Array.from({length:49},(_,i)=>i),rand),used=new Set(),links=[];
  for(const a of available){if(used.has(a))continue;
   const {x,z}=coords(a),neighbors=[];
   if(x>0)neighbors.push(index(x-1,z));
   if(x<6)neighbors.push(index(x+1,z));
   if(z>0)neighbors.push(index(x,z-1));
   if(z<6)neighbors.push(index(x,z+1));
   const choices=neighbors.filter(b=>!used.has(b));
   if(choices.length&&rand()<(level>=LEVELS-6?.98:.76)){const b=choices[Math.floor(rand()*choices.length)];links.push([a,b]);used.add(a);used.add(b);}
  }
  edges.push(links);
 }
 const members=starts.map((start,i)=>{
  let pillar=start;const route=[pillar];
  for(const links of edges){const hit=links.find(([a,b])=>a===pillar||b===pillar);if(hit)pillar=hit[0]===pillar?hit[1]:hit[0];route.push(pillar);}
  return {n:i+1,start,route,exit:pillar};
 });
 return {count,winner,starts,edges,members,flower:members[winner-1].exit};
}
function project(p,h){
 const {x,z}=coords(p);
 // Isometric projection with a generous vertical tower and visible depth.
 return {x:300+(x-z)*31.3,y:259+(x+z)*13.7-h*8.55};
}
export function drawAmida(canvas,round,elapsed=0,duration=DURATION,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const progress=clamp(elapsed/(duration*.89));
 c.fillStyle='#0a152c';c.fillRect(0,0,600,480);
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle='#fae4ad';
 c.font='bold 20px sans-serif';c.fillText('立体7×7ジャングルジム あみだ！',300,27);
 if(!round)return;
 // Depth-sort solid 3D vertical pillars.
 for(let depth=0;depth<=12;depth++)for(let z=0;z<7;z++){
  const x=depth-z;if(x<0||x>6)continue;const p=index(x,z),a=project(p,0),b=project(p,LEVELS);
  c.strokeStyle='rgba(122,172,213,'+(0.13+0.33*depth/12)+')';c.lineWidth=depth>7?1.9:1.25;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
 }
 // A square ground-plane grid makes the east-west / north-south depth visible.
 for(let z=0;z<7;z++)for(let x=0;x<7;x++){
  const a=project(index(x,z),0);
  c.fillStyle='rgba(110,165,198,.30)';c.beginPath();c.arc(a.x,a.y,2.1,0,Math.PI*2);c.fill();
 }
 // Horizontal beams link only adjacent pillars at identical height.
 for(let level=0;level<LEVELS;level++)for(const [a,b] of round.edges[level]){
  const u=project(a,level+.5),v=project(b,level+.5);
  const depth=(coords(a).x+coords(a).z+coords(b).x+coords(b).z)/24;
  c.strokeStyle='rgba(235,196,131,'+(0.12+0.40*depth)+')';c.lineWidth=depth>.60?2.0:1.2;c.beginPath();c.moveTo(u.x,u.y);c.lineTo(v.x,v.y);c.stroke();
 }
 const goal=project(round.flower,LEVELS);
 c.font='30px sans-serif';c.textAlign='center';c.fillText('💐',goal.x,goal.y-13);
 // Trace the actual path: ascent, then horizontal move on each crosspiece.
 for(const m of round.members){
  const step=progress*LEVELS,j=Math.min(LEVELS-1,Math.floor(step)),u=step-j;
  const source=m.route[j],dest=m.route[j+1],from=project(source,j),to=project(dest,j+.5);
  let position;
  if(u<.48)position=project(source,j+u/.48*.5);
  else if(u<.88){const a=project(source,j+.5),b=project(dest,j+.5),v=(u-.48)/.4;position={x:a.x+(b.x-a.x)*v,y:a.y+(b.y-a.y)*v};}
  else position=project(dest,j+.5+(u-.88)/.12*.5);
  if(progress>=1)position=project(m.exit,LEVELS);
  c.fillStyle=pal[(m.n-1)%pal.length];c.beginPath();c.arc(position.x,position.y,9,0,2*Math.PI);c.fill();
  c.strokeStyle='#10223f';c.lineWidth=2;c.stroke();
  c.fillStyle='#10223f';c.textAlign='center';c.textBaseline='middle';c.font='900 10px Arial';c.fillText(m.n,position.x,position.y);
 }
 // Synchronized top-down navigation inset. Dots show each member's current pillar.
 const mx=429,my=68,cell=21;
 c.save();c.fillStyle='rgba(8,22,40,.91)';c.beginPath();c.roundRect(mx-10,my-29,168,190,10);c.fill();
 c.strokeStyle='rgba(207,226,231,.55)';c.lineWidth=1;c.stroke();
 c.fillStyle='#e4ebde';c.textAlign='left';c.textBaseline='alphabetic';c.font='bold 14px sans-serif';c.fillText('2D 上面図・番号',mx,my-11);
 for(let z=0;z<N;z++)for(let x=0;x<N;x++){
  c.strokeStyle='rgba(189,210,218,.22)';c.lineWidth=1;c.strokeRect(mx+x*cell,my+z*cell,cell,cell);
 }
 const stepIdx=Math.min(LEVELS,Math.floor(progress*LEVELS));
 for(const m of round.members){
  const {x,z}=coords(m.route[stepIdx]);
  const px=mx+(x+.5)*cell,py=my+(z+.5)*cell;
  c.fillStyle=m.n===round.winner&&progress>=1?'#ffdf77':pal[(m.n-1)%pal.length];
  c.beginPath();c.arc(px,py,9,0,Math.PI*2);c.fill();
  c.fillStyle='#122338';c.font='900 11px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(m.n,px,py);
 }
 if(progress>=1){const {x,z}=coords(round.flower);c.strokeStyle='#ffdf77';c.lineWidth=2;c.strokeRect(mx+x*cell,my+z*cell,cell,cell);}
 c.restore();
 if(progress>=1){c.strokeStyle='#f6d780';c.lineWidth=2.5;c.beginPath();c.arc(goal.x,goal.y,14,0,2*Math.PI);c.stroke();}
 c.textBaseline='alphabetic';c.font='bold 18px Arial';c.fillStyle='#fae5ae';
 c.fillText(progress>=1?round.winner+'番が花束に到着！':progress>.73?'終盤！ 連続分岐で大逆転！':'40人が下から同時に登る！',300,458);
}

export function playAmidaBeat(ctx,master,step){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.005,melody=[76,79,83,81,79,76,74,72,74,77,81,79,76,72,79,83];
 function tone(n,dt,len,type,vol){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=440*2**((n-69)/12);g.gain.setValueAtTime(.0001,now+dt);g.gain.exponentialRampToValueAtTime(vol,now+dt+.007);g.gain.exponentialRampToValueAtTime(.0001,now+dt+len);o.connect(g);g.connect(master);o.start(now+dt);o.stop(now+dt+len+.012);o.onended=()=>{o.disconnect();g.disconnect();};}
 tone(melody[step%16],0,.11,'square',.13);
 if(step%2===0)tone([48,53,55,50][Math.floor(step/2)%4],0,.18,'triangle',.17);
 if(step%4===3)tone(91,0,.04,'sine',.065);
}
