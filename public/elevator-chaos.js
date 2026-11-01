const $=id=>document.getElementById(id),c=$('game').getContext('2d'),D=25000;
let count=40,round,raf=0,start=0,sound=false,audio=null,lastElim=0;
function rand(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const floorY=f=>645-f*53,shaftX=s=>200+s*252;
function make(){
 // Simulate numbered-independent contestants first, and shuffle labels afterwards.
 const slots=shuffle(Array.from({length:40},(_,i)=>i)),players=slots.slice(0,count).map((v,id)=>({id,shaft:v%4,floor:Math.floor(v/4),startFloor:Math.floor(v/4)}));
 const survivor=rand(count),victims=shuffle(players.filter(p=>p.id!==survivor).map(p=>p.id));
 const events=victims.map((id,i)=>{const p=players[id],target=1+rand(8);return {id,shaft:p.shaft,from:p.startFloor,to:target,t:1800+(i+1)*19300/Math.max(1,victims.length),kind:'danger'}});
 const winner=players[survivor],escape={id:survivor,shaft:winner.shaft,from:winner.startFloor,to:9,t:22000,kind:'express'};
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 return {players:players.map(p=>({...p,n:labels[p.id]})),events,winner:labels[survivor],escape};
}
function beep(f,d=.12,type='triangle',v=.12){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function draw(ms){const t=Math.min(D,ms),out=new Set(),active=[];
 for(const e of round.events){if(t>=e.t)out.add(e.id);if(t>=e.t-390&&t<=e.t+180)active.push(e)}
 if(t>round.escape.t-1350)active.push(round.escape);
 c.fillStyle='#111a37';c.fillRect(0,0,1200,760);
 c.fillStyle='#fff0ac';c.textAlign='center';c.font='bold 35px system-ui';c.fillText('🛗 ELEVATOR CHAOS',600,43);
 for(let f=0;f<10;f++){const y=floorY(f);c.fillStyle=f%2?'#253453':'#2b3d60';c.fillRect(64,y-42,1072,51);c.fillStyle='#788db2';c.fillRect(64,y+9,1072,5);c.fillStyle='#d2e7ff';c.textAlign='left';c.font='bold 17px system-ui';c.fillText((f+1)+'F',74,y-3)}
 for(let s=0;s<4;s++){const x=shaftX(s);c.fillStyle='#14253c';c.fillRect(x-52,96,104,576);c.strokeStyle='#87a5d9';c.lineWidth=4;c.strokeRect(x-52,96,104,576);c.fillStyle='#f3c96e';c.font='bold 17px system-ui';c.textAlign='center';c.fillText('LIFT '+(s+1),x,87)}
 // Moving lift cabins are synchronized to the target and crossing event.
 for(const e of active){const progress=Math.max(0,Math.min(1,(t-(e.t-(e.kind==='express'?1350:390)))/(e.kind==='express'?1350:390)));
 const y=floorY(e.from)+(floorY(e.to)-floorY(e.from))*progress,x=shaftX(e.shaft);
 c.fillStyle=e.kind==='express'?'#ffdc74':'#a4e8ff';c.fillRect(x-43,y-37,86,47);c.strokeStyle='#f6fbff';c.lineWidth=3;c.strokeRect(x-43,y-37,86,47);
 c.fillStyle='#192c45';c.font='bold 17px system-ui';c.textAlign='center';c.fillText(e.kind==='express'?'EXPRESS':'LIFT',x,y-8);
 }
 for(const p of round.players){if(out.has(p.id))continue;const e=active.find(x=>x.id===p.id);let x=shaftX(p.shaft),y=floorY(p.startFloor)-15;
 if(e){const total=e.kind==='express'?1350:390,progress=Math.max(0,Math.min(1,(t-(e.t-total))/total));y=floorY(e.from)+(floorY(e.to)-floorY(e.from))*progress-14}
 if(p.n===round.winner&&t>23250)y=floorY(9)-14;
 c.fillStyle=['#ffb7c8','#b6f3bd','#a4eaff','#d8bbff'][p.n%4];c.beginPath();c.arc(x,y,18,0,Math.PI*2);c.fill();c.strokeStyle='#172840';c.lineWidth=2.5;c.stroke();c.fillStyle='#14253d';c.textAlign='center';c.textBaseline='middle';c.font='900 16px system-ui';c.fillText(p.n,x,y)}
 c.textBaseline='alphabetic';c.fillStyle='#ffe49a';c.font='bold 27px system-ui';c.textAlign='left';c.fillText('残り '+(count-out.size)+' / '+count,70,722);
 c.textAlign='right';if(t>18000&&t<D){c.fillStyle='#ffce70';c.fillText('⚡ 急行エレベーター開通！',1132,722)}
 if(t>=D){c.fillStyle='rgba(9,20,41,.91)';c.fillRect(280,272,640,164);c.strokeStyle='#ffdd7f';c.lineWidth=4;c.strokeRect(280,272,640,164);c.fillStyle='#ffe3a0';c.textAlign='center';c.font='bold 55px system-ui';c.fillText('💐 '+round.winner+'番が脱出！',600,374)}
}
function frame(){const t=performance.now()-start,hit=round.events.filter(e=>e.t<=t).length;if(hit>lastElim){beep(166,.17,'sawtooth',.11);lastElim=hit}draw(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,t/1000);$('status').textContent=t>20000?'⚡ 急行エレベーターで屋上へ！':'🚪 危険な階に着いた番号が脱落！';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='💐 '+round.winner+'番が屋上へ到着！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.22,'triangle',.16),i*160))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=make();lastElim=0;draw(0);$('start').disabled=false;$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('status').textContent='🚪 危険な階にはご注意！';$('result').textContent='屋上の花束に到着するのは？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(750)}start=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(880)}};reset();
