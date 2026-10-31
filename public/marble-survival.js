// Tilt-driven survival. This is a skill/physics game, not a uniform random draw.
const W=900,H=630,R=13,holes=[{x:170,y:160,r:30},{x:440,y:132,r:29},{x:725,y:180,r:32},{x:285,y:335,r:31},{x:635,y:365,r:32},{x:145,y:495,r:29},{x:455,y:520,r:33},{x:770,y:500,r:28}];
const $=id=>document.getElementById(id),canvas=$('board'),c=canvas.getContext('2d');
let marbles=[],running=false,gravity={x:0,y:0},sensor={x:0,y:0},manual={x:0,y:0},sensorOK=false,sound=true,ctx=null,last=0,raf=0,drag=null,ended=false;
const random=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;};
const rnd=(min,max)=>min+Math.random()*(max-min);
function note(freq=.0,length=.10,type='sine',volume=.13){
 if(!sound||!ctx||ctx.state!=='running')return;
 const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.55),t+length);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+length);
 o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+length+.02);
}
function init(){
 const count=Math.max(2,Math.min(40,Number($('count').value)||40));$('count').value=count;
 marbles=[];ended=false;running=false;cancelAnimationFrame(raf);
 for(let i=0;i<count;i++){
  let x=0,y=0,ok=false;
  for(let tries=0;tries<1400;tries++){
   x=rnd(45,W-45);y=rnd(45,H-45);
   if(holes.every(h=>Math.hypot(x-h.x,y-h.y)>h.r+R+16)&&marbles.every(b=>Math.hypot(x-b.x,y-b.y)>2*R+7)){ok=true;break;}
  }
  if(!ok){x=44+(i%10)*87;y=70+Math.floor(i/10)*145;}
  marbles.push({n:i+1,x,y,vx:0,vy:0,alive:true,drop:0,hue:(i*67)%360});
 }
 $('win').textContent='';$('status').textContent='準備完了：'+count+'個のビー玉';draw();
}
async function start(){
 if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch{}}
 const resumeAudio=ctx?.state==='suspended'?ctx.resume():Promise.resolve();
 if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
  try{const p=await DeviceOrientationEvent.requestPermission();sensorOK=p==='granted';if(p!=='granted')$('status').textContent='傾きの許可なし：矢印操作も使えます';}catch{$('status').textContent='傾きセンサー利用不可：矢印操作も使えます';}
 }
 await resumeAudio;
 if(ended)init();
 running=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
function orient(e){
 if(e.beta==null||e.gamma==null)return;
 sensorOK=true;
 // Landscape orientation: beta responds to left/right, gamma to forward/back.
 const angle=screen.orientation?.angle??window.orientation??0;
 const b=e.beta*Math.PI/180,g=e.gamma*Math.PI/180;
 if(Math.abs(angle)===90){sensor.x=Math.sin(b)*(angle===90?-1:1);sensor.y=Math.sin(g)*(angle===90?1:-1);}
 else{sensor.x=Math.sin(g);sensor.y=Math.sin(b);}
 sensor.x=Math.max(-1,Math.min(1,sensor.x));sensor.y=Math.max(-1,Math.min(1,sensor.y));
}
window.addEventListener('deviceorientation',orient,true);
const keys=new Set();addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){keys.add(e.key);e.preventDefault();}});
addEventListener('keyup',e=>keys.delete(e.key));
document.querySelectorAll('[data-dir]').forEach(b=>{
 const dir=b.dataset.dir;const v={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[dir];
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);manual={x:v[0],y:v[1]};});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>manual={x:0,y:0});
});
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;manual.x=Math.max(-1,Math.min(1,dx/65));manual.y=Math.max(-1,Math.min(1,dy/65));}});
canvas.addEventListener('pointerup',()=>{drag=null;manual={x:0,y:0};});
$('start').onclick=start;$('reset').onclick=init;$('mute').onclick=()=>{sound=!sound;$('mute').textContent=sound?'🔊 音 ON':'🔇 音 OFF';};
function frame(now){
 if(!running)return;const dt=Math.min(.035,(now-last)/1000);last=now;
 const gx=(sensorOK?sensor.x:0)+manual.x+(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);
 const gy=(sensorOK?sensor.y:0)+manual.y+(keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0);
 gravity.x=gravity.x*.80+gx*.20;gravity.y=gravity.y*.80+gy*.20;
 const steps=3;for(let k=0;k<steps;k++)physics(dt/steps);
 draw();const alive=marbles.filter(b=>b.alive);
 $('status').textContent='残り '+alive.length+' 個　　傾きに合わせて転がります';
 if(alive.length===1){running=false;ended=true;$('win').textContent='🏆 '+alive[0].n+'番の勝ち！';$('status').textContent='最後のビー玉が生き残りました！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>note(f,.23,'triangle',.18),i*125));return;}
 if(alive.length===0){running=false;ended=true;$('win').textContent='全滅！ もう一度チャレンジ';return;}
 raf=requestAnimationFrame(frame);
}
function physics(dt){
 const live=marbles.filter(b=>b.alive);
 for(const b of live){
  b.vx=(b.vx+gravity.x*690*dt)*Math.exp(-1.9*dt);b.vy=(b.vy+gravity.y*690*dt)*Math.exp(-1.9*dt);
  const speed=Math.hypot(b.vx,b.vy);if(speed>430){b.vx*=430/speed;b.vy*=430/speed;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x<R+8){b.x=R+8;b.vx=Math.abs(b.vx)*.65;}if(b.x>W-R-8){b.x=W-R-8;b.vx=-Math.abs(b.vx)*.65;}
  if(b.y<R+8){b.y=R+8;b.vy=Math.abs(b.vy)*.65;}if(b.y>H-R-8){b.y=H-R-8;b.vy=-Math.abs(b.vy)*.65;}
  for(const h of holes)if(Math.hypot(b.x-h.x,b.y-h.y)<h.r-R*.38){b.alive=false;b.drop=1;note(210,.19,'sine',.13);break;}
 }
 for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
  const a=live[i],b=live[j];if(!a.alive||!b.alive)continue;
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001;
  if(d<2*R){const nx=dx/d,ny=dy/d,over=(2*R-d)/2;a.x-=nx*over;a.y-=ny*over;b.x+=nx*over;b.y+=ny*over;
   const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){const imp=rel*.78;a.vx+=imp*nx;a.vy+=imp*ny;b.vx-=imp*nx;b.vy-=imp*ny;}
  }
 }
}
function draw(){
 c.clearRect(0,0,W,H);
 const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#547f70');bg.addColorStop(1,'#294d55');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.strokeStyle='#b6c6aa';c.lineWidth=15;c.strokeRect(8,8,W-16,H-16);
 c.strokeStyle='#789887';c.lineWidth=1;for(let x=50;x<W;x+=50){c.beginPath();c.moveTo(x,15);c.lineTo(x,H-15);c.stroke();}for(let y=50;y<H;y+=50){c.beginPath();c.moveTo(15,y);c.lineTo(W-15,y);c.stroke();}
 for(const h of holes){const gr=c.createRadialGradient(h.x-5,h.y-6,2,h.x,h.y,h.r+6);gr.addColorStop(0,'#040b10');gr.addColorStop(.78,'#10242a');gr.addColorStop(1,'#c8c6a8');c.fillStyle=gr;c.beginPath();c.arc(h.x,h.y,h.r+6,0,Math.PI*2);c.fill();c.strokeStyle='#d7c9a7';c.lineWidth=3;c.beginPath();c.arc(h.x,h.y,h.r+4,0,Math.PI*2);c.stroke();}
 for(const b of marbles){if(!b.alive)continue;
  c.save();c.translate(b.x,b.y);c.shadowColor='#071923';c.shadowBlur=8;c.shadowOffsetY=4;
  const gr=c.createRadialGradient(-5,-7,1,0,0,R);gr.addColorStop(0,'#ffffff');gr.addColorStop(.19,'hsl('+b.hue+' 74% 75%)');gr.addColorStop(.75,'hsl('+b.hue+' 70% 43%)');gr.addColorStop(1,'#173544');
  c.fillStyle=gr;c.beginPath();c.arc(0,0,R,0,Math.PI*2);c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
  c.strokeStyle='#f8fffa';c.lineWidth=1;c.stroke();c.fillStyle='#071821';c.font='900 13px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(b.n,0,1);c.restore();
 }
 if(!running&&ended){c.fillStyle='#0008';c.fillRect(0,H/2-37,W,74);c.fillStyle='#ffe8a2';c.textAlign='center';c.font='900 36px system-ui';c.fillText(marbles.some(m=>m.alive)?'WINNER!':'GAME OVER',W/2,H/2+12);}
}
init();
