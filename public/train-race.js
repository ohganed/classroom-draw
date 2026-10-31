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
 // Every ordinary segment follows an actual edge of the rendered rail graph.
 const byStart=new Map();
 for(const e of tracks){
   const p=nodes[e.a],q=nodes[e.b];
   const from=p.c<q.c?e.a:e.b,to=p.c<q.c?e.b:e.a;
   if(nodes[from].c===nodes[to].c)continue;
   if(!byStart.has(from))byStart.set(from,[]);
   byStart.get(from).push({to,edge:e});
 }
 const portals=tracks.filter(e=>e.type==='tunnel'&&nodes[e.a].r===nodes[e.b].r);
 let at=START,segments=[],total=0,warpUsed=false;
 const add=(a,b,type)=>{
   const l=type==='warp'?100:Math.hypot(b.x-a.x,b.y-a.y);
   segments.push({a,b,l,start:total,type});total+=l;
 };
 while(at!==FINISH&&segments.length<42){
   const here=nodes[at],remaining=COL-1-here.c;
   const choices=(byStart.get(at)||[]).filter(c=>Math.abs(nodes[c.to].r-4)<=remaining-1 || remaining>5);
   if(!choices.length)break;
   const preferred=here.c>=10?choices.filter(c=>Math.abs(nodes[c.to].r-4)<Math.abs(here.r-4)):[];
   const pool=preferred.length?preferred:choices;
   const chosen=pool[randomInt(pool.length)];
   const dest=nodes[chosen.to],edge=chosen.edge;
   // The entrance is the actual black opening halfway along a tunnel track.
   const canWarp=!warpUsed&&edge.type==='tunnel'&&randomInt(100)<85;
   const farther=portals.filter(e=>{
     const p=nodes[e.a],q=nodes[e.b];
     return Math.min(p.c,q.c)>=here.c+3&&Math.max(p.c,q.c)<=11;
   });
   if(canWarp&&farther.length){
     const portal=farther[randomInt(farther.length)];
     const midIn={x:(here.x+dest.x)/2,y:(here.y+dest.y)/2};
     const p=nodes[portal.a],q=nodes[portal.b];
     const midOut={x:(p.x+q.x)/2,y:(p.y+q.y)/2};
     const exit=p.c<q.c?q:p;
     add(here,midIn,'tunnel');
     add(midIn,midOut,'warp');
     add(midOut,exit,'tunnel');
     at=portal.a===portal.b?at:(p.c<q.c?portal.b:portal.a);
     warpUsed=true;
   }else{
     add(here,dest,edge.type);
     at=chosen.to;
   }
 }
 // If an unusual graph state cannot reach the goal, a valid route is regenerated.
 if(at!==FINISH)return routeFallback(byStart);
 return {segments,length:total};
}
function routeFallback(byStart){
 let at=START,segments=[],total=0;
 while(at!==FINISH){
   const p=nodes[at];
   const opts=(byStart.get(at)||[]).filter(o=>Math.abs(nodes[o.to].r-4)<=COL-1-nodes[o.to].c);
   if(!opts.length)throw new Error('Rail graph is disconnected');
   const e=opts[randomInt(opts.length)],q=nodes[e.to],l=Math.hypot(q.x-p.x,q.y-p.y);
   segments.push({a:p,b:q,l,start:total,type:e.edge.type});total+=l;at=e.to;
 }
 return {segments,length:total};
}
function init(){
 cancelAnimationFrame(raf);playing=false;elapsed=0;countInput.disabled=false;
 const n=Math.max(1,Math.min(99,Math.floor(Number(countInput.value)||40)));countInput.value=n;
 winner=randomInt(n)+1;buildTracks();
 trains=Array.from({length:n},(_,i)=>({number:i+1,route:route(),p:0,delay:i*.11,pace:.65+randomInt(31)/100,boost:(randomInt(21)-10)/100,color:`hsl(${i*137.508%360} 72% 44%)`}));
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
}
function beep(freq=420){
 if(!enabled)return;
 try{audio??=new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.value=freq;o.connect(v);v.connect(audio.destination);v.gain.setValueAtTime(.018,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.13)}catch{}
}
function frame(now){
 if(!playing)return;
 elapsed=Math.min(DURATION,now-started);const t=elapsed/DURATION,sec=elapsed/1000;
 for(const v of trains){
  const local=Math.max(0,(sec-v.delay)/(35-v.delay));
  // Distinct speeds create visible leaders and trailers, without affecting the uniform draw.
  const travel=local*(v.pace+v.boost*Math.sin(local*Math.PI*2));
  v.p=v.number===winner?(t<.78?Math.min(.75,local*.88):.70+.30*Math.pow(Math.max(0,(t-.78)/.22),1.55)):Math.min(.965,Math.max(0,travel));
 }
 meter.value=sec;clock.textContent=sec.toFixed(1)+' / 35秒';
 status.textContent=sec<8?'🚉 全列車が順次発車':sec<23?'🌀 ワープトンネルで意外な地点へ！':sec<31?'🚇 トンネルと立体交差を通過':'🏁 最終ポイントで大逆転！';
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