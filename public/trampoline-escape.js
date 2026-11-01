const $=id=>document.getElementById(id),ctx=$('game').getContext('2d'),D=25000;
let count=40,round,raf=0,started=0,sound=false,audio=null,lastHit=0;
function rand(n){const v=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(v)}while(v[0]>=lim);return v[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const X=145,Y=668,dx=113,dy=112,platform=(col,floor)=>({x:X+col*dx,y:Y-floor*dy});
function build(){
 const slots=shuffle(Array.from({length:40},(_,i)=>i)),loserIds=shuffle(Array.from({length:count},(_,i)=>i));
 const survivor=loserIds.pop();
 // 3–5 participants jump together per wave, with a final solo survivor.
 const events=[];let wave=0;
 for(let i=0;i<loserIds.length;){const size=Math.min(loserIds.length-i,3+rand(3));const t=6900+wave*14200/Math.max(1,Math.ceil((count-1)/4)-1);for(let j=0;j<size;j++)events.push({id:loserIds[i+j],t});i+=size;wave++;}
 const players=slots.slice(0,count).map((slot,id)=>({id,col:slot%8,floor:Math.floor(slot/8),phase:rand(1000)/1000}));
 const safeEvents=[];
 // Every player gets at least one complete, harmless landing before any trampoline breaks.
 const safeIds=shuffle(Array.from({length:count},(_,i)=>i));
 for(let i=0;i<count;i++)safeEvents.push({id:safeIds[i],t:650+Math.floor(i/5)*560});
 // Extra safe bounces make harmless landings common even later in the round.
 for(let t=5200;t<20500;t+=740){
  const eligible=Array.from({length:count},(_,i)=>i).filter(id=>!events.some(e=>e.id===id&&e.t<=t+1000));
  shuffle(eligible);for(const id of eligible.slice(0,Math.min(eligible.length,3+rand(3))))safeEvents.push({id,t});
 }
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));return {players:players.map(p=>({...p,n:labels[p.id]})),events,safeEvents,survivor,winner:labels[survivor]};
}
function beep(f,len=.11,type='sine',v=.13){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+len+.02)}catch{}}
function draw(ms){
 const t=Math.min(D,ms),removed=new Set(round.events.filter(e=>e.t<=t).map(e=>e.id));
 const safeActive=round.safeEvents.filter(e=>t>=e.t&&t<e.t+700);
 ctx.fillStyle='#131a3b';ctx.fillRect(0,0,1200,760);
 ctx.textAlign='center';ctx.font='bold 34px system-ui';ctx.fillStyle='#ffe68e';ctx.fillText('🐭 TRAMPOLINE ESCAPE!',600,49);
 for(let floor=0;floor<5;floor++){
  const y=Y-floor*dy;ctx.fillStyle='#27365a';ctx.fillRect(70,y+13,1060,13);
  ctx.fillStyle='#e2f2ff';ctx.font='bold 15px system-ui';ctx.textAlign='left';ctx.fillText((floor+1)+'F',75,y-17);
  for(let col=0;col<8;col++){const x=X+col*dx;
   const actor=round.players.find(p=>p.col===col&&p.floor===floor),danger=actor&&round.events.find(e=>e.id===actor.id);
   const broken=danger&&t>=danger.t;
   const warning=danger&&t>=danger.t-200&&t<danger.t;
   ctx.fillStyle=broken?'#6a506b':warning?'#ff7085':['#78e9f9','#f8b5e5','#ffe28d'][col%3];
   ctx.beginPath();ctx.ellipse(x,y,43,10,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=broken?'#ba8a99':'#fff6d8';ctx.lineWidth=3;ctx.stroke();
   if(broken){ctx.strokeStyle='#25182d';ctx.beginPath();ctx.moveTo(x-15,y-6);ctx.lineTo(x+9,y+6);ctx.lineTo(x+23,y-4);ctx.stroke()}
  }
 }
 for(const p of round.players){if(removed.has(p.id))continue;
  const q=platform(p.col,p.floor),fatal=round.events.find(e=>e.id===p.id);
  const near=fatal&&t>=fatal.t-820&&t<fatal.t;
  const safe=safeActive.find(e=>e.id===p.id);
  const safeU=safe?Math.max(0,Math.min(1,(t-safe.t)/700)):0;
  const safeJump=safe?Math.sin(Math.PI*safeU)*62:0;
  const fatalU=near?Math.max(0,Math.min(1,(t-(fatal.t-820))/620)):0;
  let x=q.x,y=q.y-30-(near?Math.sin(Math.PI*fatalU)*55:safeJump);
  if(safe&&safeU>.72&&!near){ctx.fillStyle='#abffbb';ctx.font='bold 19px system-ui';ctx.textAlign='center';ctx.fillText('セーフ！',q.x,q.y-84);}
  if(p.id===round.survivor&&t>21000){const u=Math.min(1,(t-21000)/3100);x=q.x+(600-q.x)*u;y=q.y-30+(105-q.y)*u-Math.sin(u*Math.PI)*95;}
  ctx.fillStyle=['#ffbad2','#b0fae4','#e5c4ff','#ffdc9b'][p.n%4];ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#152549';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#1b2546';ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.n,x,y+1);
 }
 ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.font='bold 28px system-ui';ctx.fillStyle='#ffe4a0';ctx.fillText('残り '+(count-removed.size)+' / '+count,76,727);
 if(t>18500&&t<D){ctx.textAlign='right';ctx.fillStyle='#9af8ff';ctx.fillText('🚀 超ジャンプ台が開通！',1127,727)}
 if(t>=D){ctx.fillStyle='rgba(14,19,45,.92)';ctx.fillRect(280,270,640,165);ctx.strokeStyle='#ffd68b';ctx.lineWidth=4;ctx.strokeRect(280,270,640,165);ctx.fillStyle='#ffeb9e';ctx.font='bold 56px system-ui';ctx.textAlign='center';ctx.fillText('🏆 '+round.winner+'番が大脱走！',600,372)}
}
function frame(){const t=performance.now()-started,hits=round.events.filter(e=>e.t<=t).length;if(hits>lastHit){beep(145,.16,'sawtooth');lastHit=hits}draw(t);$('clock').textContent=(Math.min(D,t)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(D,t)/1000;$('status').textContent=t>18500?'🚀 逆転！ 超ジャンプ台が発動！':'✅ 着地しても色が変わらない安全ジャンプ！ 赤くなった台だけ脱落';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が逃げ切った！';[523,659,784,1047].forEach((n,i)=>setTimeout(()=>beep(n,.19,'triangle',.14),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=build();lastHit=0;draw(0);$('start').disabled=false;$('meter').value=0;$('clock').textContent='0.0 / 25秒';$('status').textContent='🌀 ぴょんぴょん！ トランポリンで大脱走';$('result').textContent='屋上へ逃げ切るのは何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(790)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(880)}};reset();
