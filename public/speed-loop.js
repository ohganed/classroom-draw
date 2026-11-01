const $=id=>document.getElementById(id),g=$('game').getContext('2d'),D=27000,LAP=1200;
let count=40,round,raf=0,started=0,sound=false,audio,lastSoundWave=-1;
function rnd(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),laneY=i=>170+i*108;
function build(){
 const startSlots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count);
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 const people=startSlots.map((slot,id)=>({id,n:labels[id],lane:Math.floor(slot/8),column:slot%8,pace:29+rnd(150)/10,boost:12+rnd(24),cut:35+rnd(75),delay:rnd(1400),burst:rnd(8),spin:rnd(2000)/1000}));
 const distance=(p,t)=>{const sec=clamp(t,0,D)/1000,acc=p.pace*sec;
  // Boost lanes are part of the actual progress calculation; the late shortcut can change the winner.
  const boost=Math.max(0,sec-6)*p.boost*.23+Math.max(0,sec-15)*p.boost*.28;
  const shortcut=sec>=21?(Math.min(1,(sec-21)/2.5)*p.cut):0;
  return p.column*13+acc+boost+shortcut;
 };
 const leaderboard=people.slice().sort((a,b)=>distance(b,D)-distance(a,D));return {people,distance,leaderboard,winner:leaderboard[0]};
}
function tone(f,d=.13,type='triangle',v=.12){if(!sound||!audio)return;try{const now=audio.currentTime,osc=audio.createOscillator(),vol=audio.createGain();osc.type=type;osc.frequency.setValueAtTime(f,now);vol.gain.setValueAtTime(.0001,now);vol.gain.exponentialRampToValueAtTime(v,now+.015);vol.gain.exponentialRampToValueAtTime(.0001,now+d);osc.connect(vol);vol.connect(audio.destination);osc.start(now);osc.stop(now+d+.02)}catch{}}
function trackPoint(d,lane){
 const y=laneY(lane),q=((d%LAP)+LAP)%LAP;
 if(q<390)return {x:52+q*1.02,y:y-12-22*Math.sin(q/390*Math.PI),angle:0};
 if(q<600){const angle=-Math.PI/2+2*Math.PI*(q-390)/210;return {x:553+42*Math.cos(angle),y:y-44+42*Math.sin(angle),angle};}
 if(q<780)return {x:604+(q-600)*1.05,y:y-12,angle:0};
 if(q<930){const u=(q-780)/150;return {x:793+u*157,y:y-12-57*Math.sin(Math.PI*u),angle:0};}
 return {x:951+(q-930)*.65,y:y-12,angle:0};
}
function draw(t){t=clamp(t,0,D);const sky=g.createLinearGradient(0,0,0,760);sky.addColorStop(0,'#21134b');sky.addColorStop(.5,'#4551a6');sky.addColorStop(1,'#3b2376');g.fillStyle=sky;g.fillRect(0,0,1200,760);
 for(let i=0;i<18;i++){g.fillStyle=i%2?'#5bd7e0':'#b68cff';g.fillRect((i*107+30)%1200,75+i%3*28,28,4)}
 g.textAlign='center';g.fillStyle='#e9ffb1';g.font='bold 30px system-ui';g.fillText('⚡ TURBO LOOP RALLY • RETRO SCENES',600,43);
 for(let lane=0;lane<5;lane++){const y=laneY(lane);
 g.fillStyle=lane%2?'#282a5c':'#32306d';g.fillRect(24,y-68,1150,104);
 g.strokeStyle='#b0eadd';g.lineWidth=7;g.beginPath();g.moveTo(48,y-12);g.quadraticCurveTo(250,y-65,450,y-12);g.lineTo(510,y-12);g.stroke();
 g.strokeStyle='#68e5ce';g.lineWidth=7;g.beginPath();g.arc(553,y-44,42,0,Math.PI*2);g.stroke();
 g.beginPath();g.moveTo(604,y-12);g.lineTo(793,y-12);g.quadraticCurveTo(870,y-126,950,y-12);g.lineTo(1130,y-12);g.stroke();
 g.fillStyle='#f1c86b';g.fillRect(1013,y-27,13,32);g.fillStyle='#f8feff';g.font='bold 15px system-ui';g.textAlign='left';g.fillText('TRACK '+(lane+1),38,y-43);
 g.fillStyle='#f9d464';g.font='bold 21px system-ui';g.fillText('⚡',730,y-29);g.fillText('↗',900,y-25);
 }
 const sorted=round.people.slice().sort((a,b)=>round.distance(b,t)-round.distance(a,t));
 for(const p of round.people){const d=round.distance(p,t),q=trackPoint(d,p.lane);
 // Short speed streaks follow the same position, and numbers never change identity.
 g.strokeStyle='rgba(205,251,246,.5)';g.lineWidth=2;for(let j=1;j<=3;j++){g.beginPath();g.moveTo(q.x-21-j*8,q.y+((j%2)*5));g.lineTo(q.x-25-j*13,q.y+((j%2)*5));g.stroke()}
 g.fillStyle=['#ffb5d4','#a4ecf4','#ffe49b','#c3f5b3','#dbc4ff'][p.n%5];g.beginPath();g.arc(q.x,q.y,14,0,Math.PI*2);g.fill();g.strokeStyle='#203451';g.lineWidth=2;g.stroke();
 g.fillStyle='#182647';g.font='900 14px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(p.n,q.x,q.y);g.textBaseline='alphabetic';
 }
 g.fillStyle='rgba(19,18,46,.94)';g.fillRect(0,697,1200,63);g.fillStyle='#fff1b8';g.font='bold 21px system-ui';g.textAlign='left';g.fillText('🥇 '+sorted[0].n+'番　進行 '+Math.floor(round.distance(sorted[0],t))+'m',25,736);g.textAlign='right';g.fillText(t>21000?'🚀 秘密ショートカット発動！':t>15000?'⚡ 後半ブースト！':'360°ループ → ジャンプ台 → 加速！',1175,736);
 if(t>=D){g.fillStyle='rgba(17,22,54,.95)';g.fillRect(238,268,724,176);g.strokeStyle='#ffdf8e';g.lineWidth=4;g.strokeRect(238,268,724,176);g.fillStyle='#fff0b3';g.font='bold 55px system-ui';g.textAlign='center';g.fillText('🏆 '+round.winner.n+'番が優勝！',600,374)}
}
function tick(){const t=performance.now()-started;const phase=t>=21000?3:t>=15000?2:t>=6000?1:0;if(phase>lastSoundWave){lastSoundWave=phase;tone(390+phase*160,.17);setTimeout(()=>tone(570+phase*130,.12),140)}draw(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 27秒';$('meter').value=Math.min(t,D)/1000;$('status').textContent=t>21000?'🚀 ショートカットで大逆転の可能性！':'💨 実際の走行距離で順位が変わる！';if(t<D)raf=requestAnimationFrame(tick);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner.n+'番が優勝！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.22),i*155))}}
function reset(){cancelAnimationFrame(raf);count=clamp(Number($('count').value)||40,1,40);$('count').value=count;round=build();lastSoundWave=-1;draw(0);$('start').disabled=false;$('clock').textContent='0.0 / 27秒';$('meter').value=0;$('status').textContent='40人同時スタート！ ループ・坂・加速で順位が変わる';$('result').textContent='誰が最も遠くまで走る？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(800)}started=performance.now();raf=requestAnimationFrame(tick)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(920)}};reset();