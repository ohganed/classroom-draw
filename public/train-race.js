const c=document.querySelector('#rail'),g=c.getContext('2d');
const $=id=>document.getElementById(id),btn=$('start'),reset=$('reset'),snd=$('sound'),countInput=$('count'),clock=$('clock'),meter=$('meter'),status=$('status'),result=$('result');
const COL=15,ROW=9,SX=72,SY=70,X0=95,Y0=90,DURATION=35000;
const nodes=Array.from({length:COL*ROW},(_,i)=>({x:X0+(i%COL)*SX,y:Y0+Math.floor(i/COL)*SY,c:i%COL,r:Math.floor(i/COL)}));
const index=(x,y)=>y*COL+x, START=index(0,4), FINISH=index(COL-1,4);
let tracks=[],trains=[],winner=1,playing=false,elapsed=0,started=0,raf=0,enabled=false,audio=null,lastClick=-1;
const randomInt=n=>{const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;let v;do{crypto.getRandomValues(a);v=a[0]}while(v>=limit);return v%n};
const rand=n=>Math.random()*n;
function buildTracks(){
 tracks=[];const found=new Set();
 function connect(a,b,type){const k=[Math.min(a,b),Math.max(a,b)].join(':');if(found.has(k))return;found.add(k);tracks.push({a,b,type})}
 for(let r=0;r<ROW;r++)for(let x=0;x<COL;x++){
   const n=index(x,r);
   if(x<COL-1)connect(n,index(x+1,r),(r===2||r===6)&&x>3&&x<11?'bridge':(r+x*2)%17===0?'tunnel':'rail');
   if(r<ROW-1)connect(n,index(x,r+1),(x===5||x===10)&&r>1&&r<6?'bridge':'rail');
   if(x<COL-1&&r<ROW-1&&(x+2*r)%3===0)connect(n,index(x+1,r+1),'rail');
   if(x<COL-1&&r>0&&(x+3*r)%4===0)connect(n,index(x+1,r-1),'rail');
 }
}
function route(){
 // Check reachability before choosing a branch. A random dead end must never
 // prevent the initial scene (or a new round) from rendering.
 const byStart=new Map();
 for(const e of tracks){
  const p=nodes[e.a],q=nodes[e.b];
  if(p.c===q.c)continue;
  const from=p.c<q.c?e.a:e.b,to=p.c<q.c?e.b:e.a;
  if(!byStart.has(from))byStart.set(from,[]);
  byStart.get(from).push({to,edge:e});
 }
 const reachable=new Set([FINISH]);
 for(let col=COL-2;col>=0;col--){
  for(let row=0;row<ROW;row++){
   const id=index(col,row);
   if((byStart.get(id)||[]).some(o=>reachable.has(o.to)))reachable.add(id);
  }
 }
 if(!reachable.has(START))throw new Error('Rail graph has no route to the flower station');
 const portals=tracks.filter(e=>e.type==='tunnel'&&nodes[e.a].r===nodes[e.b].r);
 let at=START,segments=[],total=0,warpUsed=false;
 const add=(a,b,type)=>{
  const l=type==='warp'?100:Math.hypot(b.x-a.x,b.y-a.y);
  segments.push({a,b,l,start:total,type});total+=l;
 };
 while(at!==FINISH){
  const here=nodes[at];
  const choices=(byStart.get(at)||[]).filter(o=>reachable.has(o.to));
  // Favour gradual return to the flower station in the last few columns.
  const preferred=here.c>=10?choices.filter(o=>Math.abs(nodes[o.to].r-4)<Math.abs(here.r-4)):[];
  const pool=preferred.length?preferred:choices;
  const chosen=pool[randomInt(pool.length)],dest=nodes[chosen.to],edge=chosen.edge;
  const farther=portals.filter(e=>{
   const p=nodes[e.a],q=nodes[e.b],exit=p.c<q.c?e.b:e.a;
   return Math.min(p.c,q.c)>=here.c+3&&Math.max(p.c,q.c)<=11&&reachable.has(exit);
  });
  if(!warpUsed&&edge.type==='tunnel'&&farther.length&&randomInt(100)<85){
   const portal=farther[randomInt(farther.length)];
   const p=nodes[portal.a],q=nodes[portal.b];
   const midIn={x:(here.x+dest.x)/2,y:(here.y+dest.y)/2};
   const midOut={x:(p.x+q.x)/2,y:(p.y+q.y)/2};
   const exit=p.c<q.c?portal.b:portal.a;
   add(here,midIn,'tunnel');add(midIn,midOut,'warp');
   add(midOut,nodes[exit],'tunnel');at=exit;warpUsed=true;
  }else{add(here,dest,edge.type);at=chosen.to;}
 }
 return {segments,length:total};
}
function init(){
 cancelAnimationFrame(raf);playing=false;elapsed=0;countInput.disabled=false;
 const n=Math.max(1,Math.min(99,Math.floor(Number(countInput.value)||40)));countInput.value=n;
 winner=randomInt(n)+1;buildTracks();
 trains=Array.from({length:n},(_,i)=>({number:i+1,route:route(),p:0,delay:randomInt(650)/100,pace:.48+randomInt(66)/100,phase:randomInt(628)/100,wave:1.2+randomInt(180)/100,color:`hsl(${i*137.508%360} 72% 44%)`}));
 btn.disabled=false;meter.value=0;clock.textContent='0.0 / 35秒';status.textContent='🚉 共通始発駅で待機中';result.textContent='💐 花束駅には誰が到着する？';draw();
}
function stroke(a,b,w,col){g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.stroke()}
function scenery(){
 g.fillStyle='#b9d6ad';g.fillRect(0,0,c.width,c.height);
 for(let i=0;i<90;i++){
   const x=28+(i*173)%1150,y=30+(i*109)%680;
   if(i%3){g.fillStyle='#74aa72';g.beginPath();g.ellipse(x,y,22,16,0,0,Math.PI*2);g.fill()}
   else {g.fillStyle='#e7cda6';g.fillRect(x-12,y-10,24,23);g.fillStyle='#af6e5e';g.beginPath();g.moveTo(x-15,y-10);g.lineTo(x,y-25);g.lineTo(x+15,y-10);g.fill()}
 }
 g.fillStyle='#78aeb5';g.beginPath();g.ellipse(575,365,160,45,-.25,0,Math.PI*2);g.fill();
 for(const e of [...tracks.filter(e=>e.type!=='bridge'),...tracks.filter(e=>e.type==='bridge')]){
   const a=nodes[e.a],b=nodes[e.b],bridge=e.type==='bridge';
   if(bridge)stroke({x:a.x+5,y:a.y+9},{x:b.x+5,y:b.y+9},30,'#40545a55');
   stroke(a,b,bridge?22:13,bridge?'#687c86':'#414d4d');
   stroke(a,b,bridge?16:9,bridge?'#d2dbe0':'#ba9b75');
   g.setLineDash([4,10]);stroke(a,b,4,'#f5e6d0');g.setLineDash([]);
   stroke(a,b,2,'#37454a');
 }
 for(const e of tracks.filter(e=>e.type==='tunnel')){
   const a=nodes[e.a],b=nodes[e.b],x=(a.x+b.x)/2,y=(a.y+b.y)/2;
   g.fillStyle='#73976a';g.beginPath();g.ellipse(x,y,34,28,0,0,7);g.fill();
   g.fillStyle='#303d38';g.beginPath();g.ellipse(x,y,18,14,0,0,7);g.fill();
 }
 for(const n of nodes){g.fillStyle='#efbf5b';g.beginPath();g.arc(n.x,n.y,4,0,7);g.fill()}
 g.font='bold 22px system-ui';g.textAlign='center';
 for(const [id,label] of [[START,'🚉 共通始発駅'],[FINISH,'💐 花束駅']]){
  const p=nodes[id];g.fillStyle='#fff8dc';g.fillRect(p.x-80,p.y-48,160,32);g.fillStyle='#344938';g.fillText(label,p.x,p.y-25);
 }
}
function locate(t){
 const route=t.route;let d=Math.min(.999999,Math.max(0,t.p))*route.length;
 let s=route.segments.at(-1);
 for(const z of route.segments){if(d<=z.start+z.l){s=z;break}}
 const u=Math.max(0,Math.min(1,(d-s.start)/s.l));
 if(s.type==='warp')return {x:s.a.x,y:s.a.y,angle:0,type:'warp',u};
 return {x:s.a.x+(s.b.x-s.a.x)*u,y:s.a.y+(s.b.y-s.a.y)*u,angle:Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x),type:s.type,u};
}
function paint(t,p){
 if((p.type==='tunnel'&&p.u>.25&&p.u<.75)||p.type==='warp')return;
 g.save();g.translate(p.x,p.y);g.rotate(p.angle);
 g.fillStyle='#263a333b';g.fillRect(-19,9,39,9);
 g.fillStyle=t.color;g.strokeStyle='#20333e';g.lineWidth=1.8;
 g.beginPath();g.roundRect(-23,-13,46,26,7);g.fill();g.stroke();
 g.fillStyle='#bfeefa';g.fillRect(7,-10,11,9);
 g.fillStyle='#fff';g.beginPath();g.arc(-9,0,11,0,7);g.fill();
 g.fillStyle='#18292d';g.font='bold 14px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(t.number,-9,1);
 g.restore();
}
function draw(){
 scenery();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced&&playing)return;
 const positions=trains.map(t=>{
  let p=locate(t);
  if(elapsed===0){const i=t.number-1;p={x:nodes[START].x-32-Math.floor(i/8)*17,y:nodes[START].y-58+(i%8)*15,angle:0,type:'rail'}}
  return {t,p};
 });
 positions.sort((a,b)=>Number(a.p.type==='bridge')-Number(b.p.type==='bridge')||a.p.y-b.p.y);
 for(const {t,p} of positions)paint(t,p);
 if(elapsed>0){
   const leaders=[...trains].sort((a,b)=>b.p-a.p).slice(0,5);
   g.fillStyle='rgba(19,36,43,.88)';g.beginPath();g.roundRect(820,16,365,48,10);g.fill();
   g.fillStyle='#fff';g.textAlign='left';g.font='bold 17px system-ui';
   g.fillText('先頭 '+leaders.map((v,i)=>`${i+1}位:${v.number}番`).join('  '),832,46);
 }
}
function beep(freq=420){
 if(!enabled)return;
 try{audio??=new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.value=freq;o.connect(v);v.connect(audio.destination);v.gain.setValueAtTime(.018,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.13)}catch{}
}
function frame(now){
 if(!playing)return;
 elapsed=Math.min(DURATION,now-started);const t=elapsed/DURATION,sec=elapsed/1000;
 for(const v of trains){
  // Different departure times and smoothly changing speeds make each train
  // travel independently. The sine integral never makes a train run backwards.
  const progressAt=time=>{
   const local=Math.max(0,(time-v.delay)/(35-v.delay));
   const angle=2*Math.PI*v.wave*local;
   const sway=.14*(Math.cos(v.phase)-Math.cos(angle+v.phase))/(2*Math.PI*v.wave);
   return Math.max(0,local*v.pace+sway);
  };
  const travel=progressAt(sec);
  if(v.number===winner&&t>=.78){
   const atTurn=progressAt(DURATION*.78/1000);
   const u=Math.min(1,(t-.78)/.22);
   const smooth=u*u*(3-2*u);
   v.p=atTurn+(1-atTurn)*smooth;
  }else{
   v.p=Math.min(v.number===winner?.96:.965,travel);
  }
 }
 meter.value=sec;clock.textContent=sec.toFixed(1)+' / 35秒';
 status.textContent=sec<8?'🚉 全列車が順次発車':sec<23?'🌀 黒いトンネルから別の場所へワープ！':sec<31?'🚂 先頭集団と後続の差に注目':'🏁 最終ポイントで大逆転！';
 const tick=Math.floor(sec/3);if(tick!==lastClick){lastClick=tick;beep(370+(tick%4)*90)}
 if(elapsed>=DURATION){
  playing=false;trains.find(t=>t.number===winner).p=1;draw();btn.disabled=false;countInput.disabled=false;
  status.textContent='🏁 花束駅に到着！';result.textContent=`🏆 当選は ${winner} 番列車！`;beep(880);return;
 }
 draw();raf=requestAnimationFrame(frame);
}
btn.addEventListener('click',()=>{init();playing=true;btn.disabled=true;countInput.disabled=true;lastClick=-1;result.textContent='🚂 全列車、出発進行！';beep(560);started=performance.now();raf=requestAnimationFrame(frame)});
reset.addEventListener('click',init);
snd.addEventListener('click',()=>{enabled=!enabled;snd.textContent=enabled?'♪ 音 ON':'♪ 音 OFF';snd.setAttribute('aria-pressed',String(enabled));if(enabled)beep(640)});
countInput.addEventListener('change',()=>{if(!playing)init()});
init();