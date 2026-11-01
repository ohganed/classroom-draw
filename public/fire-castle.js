const $=id=>document.getElementById(id),c=$('game').getContext('2d'),D=25000;
let count=40,game,raf=0,start=0,audio=null,sound=false,lastElim=0;
function rnd(n){const b=new Uint32Array(1),m=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(b)}while(b[0]>=m);return b[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const laneY=l=>175+l*105;
function build(){
 const slots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count);
 const players=slots.map((slot,id)=>({id,lane:Math.floor(slot/8),x0:75+(slot%8)*35,speed:31+rnd(20),phase:rnd(1000)/1000}));
 const winnerId=rnd(count),victims=shuffle(players.filter(p=>p.id!==winnerId).map(p=>p.id)),events=[];
 // Every collision is anchored to the runner's precise position at its contact time.
 victims.forEach((id,i)=>{const p=players[id],t=2800+(i+1)*18800/Math.max(1,victims.length);events.push({id,t,lane:p.lane,kind:i%3===0?'bridge':'flame'})});
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));players.forEach(p=>p.n=labels[p.id]);
 return {players,events,winnerId,winner:labels[winnerId]};
}
function tone(freq,d=.14,type='triangle',vol=.1){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(vol,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function xAt(p,t){return Math.min(1080,p.x0+p.speed*t/1000*1.05)}
function state(p,t){const ev=game.events.find(e=>e.id===p.id);const elapsed=ev?Math.min(t,ev.t):t;
 const x=xAt(p,elapsed),y=laneY(p.lane),phase=(elapsed/1150+p.phase)*Math.PI*2;
 const safe=Math.max(0,Math.sin(phase))*23;
 return {x,y:y-25-safe,event:ev,dead:!!ev&&t>=ev.t+410};}
function draw(ms){const t=Math.min(D,ms),dead=game.events.filter(e=>t>=e.t+410).length;
 c.fillStyle='#21162e';c.fillRect(0,0,1200,760);
 for(let k=0;k<90;k++){const x=(k*173)%1200,y=590+k%5*29;c.fillStyle=k%3?'#fb743c':'#ffc655';c.fillRect(x,y,12,70)}
 c.fillStyle='#ffc88a';c.font='bold 32px system-ui';c.textAlign='center';c.fillText('🔥 FIRE CASTLE — FINAL BRIDGE 🔥',600,52);
 const danger=game.events.filter(e=>t>=e.t-350&&t<e.t+420);
 for(let l=0;l<5;l++){
  const y=laneY(l);c.fillStyle='#453b53';c.fillRect(52,y+12,1070,16);
  c.fillStyle='#f7be80';c.font='bold 17px system-ui';c.textAlign='left';c.fillText('橋 '+(l+1),60,y-45);
  for(let x=70;x<1120;x+=68){let cracked=danger.some(e=>e.kind==='bridge'&&e.lane===l&&Math.abs(x-xAt(game.players[e.id],e.t))<52&&t>=e.t);
   c.fillStyle=cracked?'#9b503e':'#9c7a68';c.fillRect(x,y,63,12);c.strokeStyle='#4f3244';c.strokeRect(x,y,63,12);
   if(cracked){c.fillStyle='#21162e';c.fillRect(x+12,y+5,37,8)}}
  for(let j=0;j<3;j++){const x=410+j*250,angle=t/480+j*1.9+l*.8;
   c.strokeStyle='#e95034';c.lineWidth=7;c.beginPath();c.moveTo(x,y-28);c.lineTo(x+Math.cos(angle)*36,y-28+Math.sin(angle)*32);c.stroke();
   c.fillStyle='#ffd45e';c.beginPath();c.arc(x+Math.cos(angle)*36,y-28+Math.sin(angle)*32,11,0,7);c.fill();}
 }
 for(const e of danger){const p=game.players[e.id],x=xAt(p,e.t),y=laneY(e.lane);if(t>=e.t-200){
  if(e.kind==='flame'){c.fillStyle='#ff682e';c.beginPath();c.arc(x,y-25,28,0,7);c.fill();c.fillStyle='#ffe176';c.beginPath();c.arc(x,y-25,13,0,7);c.fill()}
  else {c.fillStyle='#1b142b';c.fillRect(x-34,y,68,15);c.strokeStyle='#f8764b';c.strokeRect(x-34,y,68,15);}
 }}
 for(const p of game.players){const s=state(p,t);if(s.dead)continue;let {x,y}=s;if(s.event&&t>=s.event.t){const u=(t-s.event.t)/410;y+=u*u*115;}if(p.id===game.winnerId&&t>=21500){const u=Math.min(1,(t-21500)/3000);x=x+(1080-x)*u;y-=Math.sin(Math.PI*u)*95;}
  c.fillStyle=['#f8b2cb','#afeeff','#ffda94','#bef3b1','#dec1ff'][p.n%5];c.beginPath();c.arc(x,y,18,0,7);c.fill();c.strokeStyle='#30243a';c.lineWidth=3;c.stroke();
  c.fillStyle='#27233d';c.font='900 17px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(p.n,x,y);c.textBaseline='alphabetic';}
 c.fillStyle='#ffc878';c.fillRect(1086,75,13,560);c.fillStyle='#f4f5ff';c.font='bold 20px system-ui';c.textAlign='center';c.fillText('🏁',1092,74);
 c.fillStyle='rgba(30,20,45,.96)';c.fillRect(0,699,1200,61);c.fillStyle='#ffdda1';c.font='bold 26px system-ui';c.textAlign='left';c.fillText('残り '+(count-dead)+' / '+count,36,737);
 if(t>18500&&t<D){c.textAlign='right';c.fillText('⚡ 最終ブリッジ崩壊！',1160,737)}
 if(t>=D){c.fillStyle='rgba(25,17,47,.95)';c.fillRect(245,254,710,182);c.strokeStyle='#ffdd88';c.lineWidth=5;c.strokeRect(245,254,710,182);c.fillStyle='#ffe8a3';c.textAlign='center';c.font='bold 58px system-ui';c.fillText('🏆 '+game.winner+'番が突破！',600,363)}
}
function step(){const t=performance.now()-start,h=game.events.filter(e=>e.t<=t).length;if(h>lastElim){tone(170,.18,'sawtooth',.13);lastElim=h}draw(t);$('meter').value=Math.min(t,D)/1000;$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('status').textContent=t>18500?'⚡ 最後の橋が崩れ始めた！':'🔥 炎を跳び越えろ！ 足場の崩壊に注意！';if(t<D)raf=requestAnimationFrame(step);else{$('start').disabled=false;$('result').textContent='🏆 '+game.winner+'番がスイッチに到達！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.22),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.min(40,Math.max(1,Number($('count').value)||40));$('count').value=count;game=build();lastElim=0;draw(0);$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('start').disabled=false;$('result').textContent='最後のスイッチを押すのは？';$('status').textContent='回転する炎と崩れる橋を突破せよ！'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(790)}start=performance.now();raf=requestAnimationFrame(step)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(890)}};reset();