const $=id=>document.getElementById(id),g=$('game').getContext('2d'),D=25000;
let count=40,round,raf=0,started=0,sound=false,audio=null,lastStep=-1;
function rand(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const COLORS=['#ffb8df','#b4e9ff','#cdf8ac','#ffe0a4','#d7c1ff'];
function build(){
 const spots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count);
 const players=spots.map((spot,id)=>({id,lane:Math.floor(spot/8),col:spot%8,points:0}));
 const survivor=rand(count),losers=shuffle(players.filter(p=>p.id!==survivor).map(p=>p.id));
 const events=[];
 // Each participant gets a harmless jump, and multiple contestants hit blocks per wave.
 for(let id=0;id<count;id++)events.push({id,t:900+Math.floor(id/5)*350,kind:['coin','boost','safe'][rand(3)],seq:0});
 for(let w=0;w<losers.length;w++)events.push({id:losers[w],t:5800+Math.floor(w/4)*1500,kind:'trap',seq:1});
 const bonus=shuffle(players.map(p=>p.id));
 for(let i=0;i<bonus.length;i++){
  const t=3100+Math.floor(i/5)*360;
  if(!events.some(e=>e.id===bonus[i]&&e.kind==='trap'&&e.t<=t+500))events.push({id:bonus[i],t,kind:['coin','boost','safe'][rand(3)],seq:2});
 }
 // Near the finale, some survivors receive a clearly visible bonus before the last traps.
 for(let i=0;i<count;i++){const t=17400+Math.floor(i/5)*280;
  if(!events.some(e=>e.id===i&&e.kind==='trap'&&e.t<=t+700))events.push({id:i,t,kind:rand(2)?'boost':'coin',seq:3});}
 events.sort((a,b)=>a.t-b.t||a.id-b.id);
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 players.forEach(p=>p.n=labels[p.id]);
 return {players,events,survivor,winner:labels[survivor]};
}
function soundAt(f,d=.12,type='triangle',vol=.10){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,t);v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(vol,t+.009);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(audio.destination);o.start(t);o.stop(t+d+.02)}catch{}}
const cell=p=>({x:153+p.col*129,y:150+p.lane*112});
function render(ms){
 const t=Math.min(D,ms),dead=new Set(round.events.filter(e=>e.kind==='trap'&&t>=e.t+520).map(e=>e.id));
 const active=round.events.filter(e=>t>=e.t-400&&t<e.t+620);
 g.fillStyle='#8dd5f2';g.fillRect(0,0,1200,760);
 for(let i=0;i<10;i++){g.fillStyle='#eafaff';g.beginPath();g.ellipse((i*163+80)%1200,40+i%3*35,44,12,0,0,7);g.fill()}
 g.fillStyle='#23405a';g.font='bold 33px system-ui';g.textAlign='center';g.fillText('❓ QUESTION BLOCK FEVER',600,46);
 for(let lane=0;lane<5;lane++){const y=150+lane*112;
  g.fillStyle=lane%2?'#bce9b7':'#c8efba';g.fillRect(45,y-45,1115,106);
  g.fillStyle='#628b4d';g.fillRect(45,y+54,1115,9);
  for(let col=0;col<8;col++){const x=153+col*129,actor=round.players.find(p=>p.lane===lane&&p.col===col);
   if(!actor)continue;
   const hit=round.events.filter(e=>e.id===actor.id&&e.t<=t).at(-1);
   const now=active.find(e=>e.id===actor.id);
   const used=!!hit&&!now;
   g.fillStyle=now&&t>=now.t?'#ff96a9':used?'#ac9880':'#ffc947';
   g.fillRect(x-25,y-34,50,37);g.strokeStyle='#9a622b';g.lineWidth=3;g.strokeRect(x-25,y-34,50,37);
   g.fillStyle=used?'#705d50':'#69401f';g.font='bold 28px system-ui';g.textAlign='center';g.fillText(used?'·':'?',x,y-7);
   if(now&&t>=now.t){g.font='bold 22px system-ui';g.fillText(({coin:'🪙',boost:'⚡',safe:'✓',trap:'💥'})[now.kind],x,y-54);}
  }
 }
 let coins=0,boosts=0;
 for(const e of round.events){if(e.t<=t){if(e.kind==='coin')coins++;if(e.kind==='boost')boosts++;}}
 for(const p of round.players){const q=cell(p),action=active.find(e=>e.id===p.id);
  if(dead.has(p.id))continue;
  let x=q.x,y=q.y+32;
  if(action){const u=Math.max(0,Math.min(1,(t-(action.t-400))/400));if(t<action.t)y-=Math.sin(Math.PI*u)*60;
   if(action.kind==='trap'&&t>=action.t)y+=Math.min(1,(t-action.t)/520)*94;
   if(action.kind==='boost'&&t>=action.t)x+=Math.sin((t-action.t)/220*Math.PI)*36;
  }
  g.fillStyle=COLORS[p.n%5];g.beginPath();g.arc(x,y,18,0,7);g.fill();g.strokeStyle='#2c4962';g.lineWidth=2;g.stroke();
  g.fillStyle='#1e364e';g.font='900 17px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(p.n,x,y+1);g.textBaseline='alphabetic';
 }
 g.fillStyle='rgba(26,47,72,.9)';g.fillRect(0,704,1200,56);
 g.fillStyle='#ffeca1';g.textAlign='left';g.font='bold 22px system-ui';g.fillText('残り '+(count-dead.size)+'人',30,742);
 g.textAlign='center';g.fillText('🪙 '+coins+'   ⚡ '+boosts,530,742);
 if(t>17000&&t<D){g.textAlign='right';g.fillText('✨ ボーナスブロック出現！',1170,742)}
 if(t>=D){g.fillStyle='rgba(24,35,71,.94)';g.fillRect(252,259,696,176);g.strokeStyle='#ffe19b';g.lineWidth=4;g.strokeRect(252,259,696,176);g.fillStyle='#ffeda7';g.font='bold 59px system-ui';g.textAlign='center';g.fillText('🏆 '+round.winner+'番が勝利！',600,361)}
}
function frame(){const t=performance.now()-started;const eventIndex=round.events.filter(e=>e.t<=t).length;if(eventIndex>lastStep){const e=round.events[eventIndex-1];soundAt(e.kind==='trap'?155:e.kind==='coin'?970:e.kind==='boost'?740:390,.12,e.kind==='trap'?'sawtooth':'triangle');lastStep=eventIndex}render(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(t,D)/1000;$('status').textContent=t>17000?'✨ ボーナスブロックで終盤の逆転！':'❓ 叩いたブロックの中身で運命が変わる！';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が勝利！';[520,660,780,1030].forEach((f,i)=>setTimeout(()=>soundAt(f,.24),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.min(40,Math.max(1,Number($('count').value)||40));$('count').value=count;round=build();lastStep=0;render(0);$('start').disabled=false;$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('status').textContent='❓ ブロックに何が隠れている？';$('result').textContent='最後に残るのは何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();soundAt(880)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();soundAt(880)}};reset();