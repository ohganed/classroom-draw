// Individual cart routes; a uniformly chosen winner is supplied by app.js.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const main=[[38,83],[520,83],[545,112],[545,156],[52,156],[52,226],[520,226],[520,298],[52,298],[52,370],[490,370]];
const shortcut=geom([[545,156],[535,207],[520,298]]);
const depot=[[545,156],[576,179],[576,420],[470,420]];
const repair=[[520,226],[565,247],[565,445],[340,445]];
const siding=[[52,298],[90,331],[90,445],[220,445]];
function geom(points){let lengths=[],total=0;for(let i=1;i<points.length;i++){let d=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(d);total+=d;}return {points,lengths,total};}
const trunk=geom(main),shortTrunk=geom(main.slice(0,4).concat(main.slice(7))),branch={depot:geom(depot),repair:geom(repair),siding:geom(siding)};
function pos(route,u){let left=clamp(u)*route.total;for(let i=0;i<route.lengths.length;i++){const len=route.lengths[i];if(left<=len||i===route.lengths.length-1){let t=clamp(left/len),a=route.points[i],b=route.points[i+1];return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[1]-a[1],b[0]-a[0])};}left-=len;}return {x:route.points[0][0],y:route.points[0][1],angle:0};}
const gate={depot:geom(main.slice(0,4)).total,repair:geom(main.slice(0,7)).total,siding:geom(main.slice(0,9)).total};
export function makeTrolleyRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const depotN=Math.floor(count*.5),repairN=Math.floor(count*.375),sidingN=Math.max(0,count-1-depotN-repairN);
 const assignments=new Map();others.forEach((n,i)=>assignments.set(n,i<depotN?'depot':i<depotN+repairN?'repair':i<depotN+repairN+sidingN?'siding':'siding'));
 const carts=Array.from({length:count},(_,i)=>({n:i+1,to:i+1===winner?'station':assignments.get(i+1),speed:.87+rand()*.38,delay:rand()*.055,phase:rand()*6.28,lane:rand(),index:i,shortcut:rand()<.48}));
 return {count,winner,carts,story:['front','front','close','close','middle','comeback'][Math.floor(rand()*6)]};
}
function rail(c,route,shade='#79949d'){
 c.beginPath();route.points.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.strokeStyle=shade;c.lineWidth=12;c.lineJoin='round';c.stroke();
 c.strokeStyle='#d4b68d';c.lineWidth=2;c.setLineDash([6,10]);c.stroke();c.setLineDash([]);
}
function cart(c,p,n,phase,scale=1,highlight=false){
 c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.scale(scale,scale);
 c.fillStyle='#192a38';c.fillRect(-15,-13,30,26);c.fillStyle=highlight?'#edcc8b':['#82b8bd','#cbb6a9','#a9b4cc','#b5c8a1'][n%4];c.beginPath();c.roundRect(-14,-10,28,20,4);c.fill();
 c.fillStyle='#eaf3ef';c.fillRect(-12,-8,24,16);
 c.fillStyle='#162e40';c.textAlign='center';c.textBaseline='middle';c.font='900 15px Arial';c.fillText(String(n),0,0);
 c.fillStyle='#3b454f';for(let d of [-10,10]){c.beginPath();c.arc(d,12,4,0,7);c.fill();}
 c.restore();
}
export function drawTrolley(canvas,round,elapsed=0,duration=13000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const p=clamp(elapsed/duration),done=p===1;
 c.clearRect(0,0,600,480);c.fillStyle='#152b3c';c.fillRect(0,0,600,480);
 c.fillStyle='#243d4d';c.fillRect(18,47,564,422);c.strokeStyle='#627988';c.strokeRect(18,47,564,422);
 rail(c,trunk);rail(c,shortcut,'#d9b75f');Object.entries(branch).forEach(([key,r])=>rail(c,r,key==='depot'?'#6f99a8':key==='repair'?'#af9b81':'#89a69d'));
 c.fillStyle='#f0dcae';c.font='bold 19px Arial';c.textAlign='center';c.fillText('暴走トロッコ抽選',300,29);
 c.font='bold 13px Arial';c.fillText('近道 ↘',497,198);c.fillText('START',57,67);c.fillText('最終駅',488,349);c.fillText('車庫',477,410);c.fillText('修理場',359,435);c.fillText('待避線',185,432);
 // Three switches show changing direction as carts independently approach.
 for(const [x,y,k] of [[545,156,0],[520,226,1],[52,298,2]]){
  c.save();c.translate(x,y);c.rotate(reduced?0:Math.sin(p*28+k*2)*.18);c.strokeStyle='#f0d69a';c.lineWidth=5;c.beginPath();c.moveTo(-15,0);c.lineTo(15,0);c.stroke();c.restore();
 }
 if(!round)return;
 let active=0;const onTrack=[];
 for(const b of round.carts){
  const t=clamp((p-b.delay)/(1-b.delay)),v=b.speed;
  // Genuine shortcut joins the trunk after the long loop.
  // The visible destination branches are still followed correctly.
  const useShortcut=b.shortcut&&(b.to==='station'||b.to==='siding');
  const path=useShortcut?shortTrunk:trunk;
  let d=t*trunk.total*v*1.25;
  if(b.to==='station'){
   // The winner's early rank now varies; the late comeback is deliberately mild.
   const spread=Math.sin(Math.PI*t)**2;
   const progress=round.story==='front'?t+.12*spread:
     round.story==='close'?t+.015*Math.sin(2*Math.PI*t):
     round.story==='middle'?t-.06*spread:
     t-.115*spread;
   d=path.total*clamp(progress);
  }else if(useShortcut){
   // Side-track racers take an alternate faster route, not merely a visual teleport.
   d=t*path.total*v*1.32;
  }
  let q,arrived=false;
  if(b.to==='station'){q=pos(path,clamp(d/path.total));arrived=d>=path.total;}
  else {
   const branchGate=useShortcut?geom(main.slice(0,4).concat(main.slice(7,9))).total:gate[b.to];
   if(d<branchGate)q=pos(path,d/path.total);
   else{const br=branch[b.to];const remaining=d-branchGate;q=pos(br,remaining/br.total);arrived=remaining>=br.total;}
  }
  if(reduced&&!done)q=pos(trunk,0);
  // Destination stops are visible, rather than disappearing.
  if(!arrived)active++;
  onTrack.push({b,q,arrived});
 }
 // Track vehicles are painted in starting-number order, not sorted by apparent lead.
 for(const v of onTrack){
  const scale=v.b.to==='station'&&p>.65?1.45:1;
  cart(c,v.q,v.b.n,v.b.phase,scale,done&&v.b.n===round.winner);
 }
 c.fillStyle='#e8d9b7';c.font='bold 14px Arial';c.textAlign='left';c.fillText('走行中 '+active+' 台',28,461);
 if(done){c.fillStyle='#f5d79b';c.font='bold 23px Arial';c.textAlign='center';c.fillText(round.winner+' 番が最終駅に到着！',300,464);}
}
