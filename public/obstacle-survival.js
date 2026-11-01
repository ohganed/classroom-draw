const $=id=>document.getElementById(id),g=$('game').getContext('2d'),D=30000;
let count=40,game,raf=0,began=0,sound=false,audio=null,heard=0;
function rnd(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const times=[1600,7800,14800,21700,28600],cols=[105,295,510,760,1045],laneY=i=>148+i*108;
function build(){
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1)),slots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count);
 const winner=rnd(count);
 const players=slots.map((slot,id)=>({id,n:labels[id],lane:Math.floor(slot/8),offset:slot%8,fail:id===winner?5:1+rnd(4),delay:(slot%8)*90}));
 // Ensure actual later stages remain populated, avoiding an empty finale.
 for(let stage=2;stage<=4;stage++){const candidates=players.filter(p=>p.id!==winner&&p.fail<stage);if(candidates.length){const p=candidates[rnd(candidates.length)];p.fail=stage;}}
 return {players,winner:labels[winner]};
}
function soundAt(freq,d=.12,type='triangle',v=.1){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.value=freq;a.gain.setValueAtTime(.001,t);a.gain.exponentialRampToValueAtTime(v,t+.015);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function state(p,t){
 const stage=[1,2,3,4].find(k=>t<times[k+0]+p.delay)||5;
 const failTime=p.fail<=4?times[p.fail]+p.delay:Infinity;
 const startStage=Math.max(1,stage===5?4:stage),start=times[startStage-1]+p.delay,end=times[startStage]+p.delay;
 const u=Math.max(0,Math.min(1,(t-start)/Math.max(1,end-start)));
 let x=cols[startStage-1]+(cols[startStage]-cols[startStage-1])*u, y=laneY(p.lane)+(p.offset%4-1.5)*12;
 if(startStage===1)y-=Math.abs(Math.sin(u*5*Math.PI))*20;
 if(startStage===2)y-=Math.sin(u*11*Math.PI)*10;
 if(startStage===3)y+=Math.sin(u*9*Math.PI)*10;
 if(startStage===4)y-=Math.sin(Math.PI*u)*68;
 if(t>=failTime){const v=(t-failTime)/560;x=cols[p.fail];y+=Math.min(1,v)*Math.min(100,100*v);}
 return {x,y,failed:t>=failTime+560,falling:t>=failTime&&t<failTime+560,stage:startStage};
}
function draw(time){const t=Math.max(0,Math.min(D,time));
 const bg=g.createLinearGradient(0,0,0,760);bg.addColorStop(0,'#11192c');bg.addColorStop(1,'#294a4b');g.fillStyle=bg;g.fillRect(0,0,1200,760);
 g.textAlign='center';g.fillStyle='#ffe49c';g.font='bold 31px system-ui';g.fillText('ULTIMATE OBSTACLE CHALLENGE',600,44);
 for(let lane=0;lane<5;lane++){
 const y=laneY(lane);
 g.fillStyle=lane%2?'#233c4c':'#294852';g.fillRect(35,y-53,1127,92);
 g.fillStyle='#2d6573';g.fillRect(35,y+35,1127,14);
 g.fillStyle='#f8d898';g.textAlign='left';g.font='bold 15px system-ui';g.fillText('COURSE '+(lane+1),42,y-28);
 for(let i=0;i<5;i++){const x=cols[i];
  if(i===0){for(let n=0;n<4;n++){g.fillStyle=['#89d8e6','#abdff4'][n%2];g.fillRect(155+n*33,y+20-(n%2)*13,25,9)}}
  if(i===1){g.fillStyle='#af936b';g.fillRect(x-30,y+12,130,17);g.fillStyle='#c7ad73';g.fillRect(x-30,y+12,130,4)}
  if(i===2){g.strokeStyle='#c4e2df';g.lineWidth=6;g.beginPath();g.moveTo(x-50,y+23);g.lineTo(x+120,y+23+Math.sin(t/450+lane)*9);g.stroke()}
  if(i===3){g.strokeStyle='#ffac70';g.lineWidth=10;g.beginPath();g.moveTo(x-18,y+25);g.quadraticCurveTo(x+100,y-18,x+130,y-73);g.stroke()}
  if(i===4){g.fillStyle='#ffdd83';g.fillRect(x+35,y-42,9,75);g.fillStyle='#fb796f';g.beginPath();g.moveTo(x+43,y-42);g.lineTo(x+94,y-28);g.lineTo(x+43,y-11);g.fill()}
 }}
 for(const p of game.players){const s=state(p,t);if(s.failed)continue;
 const x=s.x,y=s.y;
 if(s.falling){g.fillStyle='#ffbe72';g.font='bold 18px system-ui';g.textAlign='center';g.fillText('落下！',x,y-24);}
 g.fillStyle=['#fed1ae','#d7ed9b','#adddff','#edb6f0','#bdf1e0'][p.n%5];g.beginPath();g.arc(x,y,16,0,Math.PI*2);g.fill();g.strokeStyle='#172f47';g.lineWidth=3;g.stroke();g.fillStyle='#15293d';g.textAlign='center';g.textBaseline='middle';g.font='900 15px system-ui';g.fillText(p.n,x,y);g.textBaseline='alphabetic';
 }
 const alive=game.players.filter(p=>!state(p,t).failed).length;
 g.fillStyle='rgba(11,25,41,.94)';g.fillRect(0,704,1200,56);g.fillStyle='#ffedaf';g.textAlign='left';g.font='bold 24px system-ui';g.fillText('生存 '+alive+' / '+count,32,741);g.textAlign='right';g.fillText(t>21600?'⚡ 最終障害・反り立つ壁！':t>14600?'🌉 揺れる橋！':t>7700?'🪵 回転丸太！':'🪨 飛び石を突破！',1167,741);
 if(t>=D){g.fillStyle='rgba(15,29,45,.94)';g.fillRect(240,264,720,180);g.strokeStyle='#ffdd85';g.lineWidth=5;g.strokeRect(240,264,720,180);g.fillStyle='#fff0b5';g.textAlign='center';g.font='bold 54px system-ui';g.fillText('🏆 '+game.winner+'番 完全制覇！',600,373)}
}
function step(){const t=performance.now()-began;const fallen=game.players.filter(p=>p.fail<=4&&t>=times[p.fail]+p.delay).length;if(fallen>heard){heard=fallen;soundAt(170,.16,'sawtooth',.11)}draw(t);$('meter').value=Math.min(t,D)/1000;$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 30秒';$('status').textContent=t>=21000?'🔥 最終障害を突破できるのは誰？':'障害で落ちた番号は脱落、安全に突破した番号は進行！';if(t<D)raf=requestAnimationFrame(step);else{$('start').disabled=false;$('result').textContent='🏆 '+game.winner+'番が完全制覇！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>soundAt(f,.25),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;game=build();heard=0;draw(0);$('meter').value=0;$('clock').textContent='0.0 / 30秒';$('status').textContent='飛び石 → 回転丸太 → 揺れる橋 → 反り立つ壁';$('result').textContent='完全制覇するのは何番？';$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();soundAt(850)}began=performance.now();raf=requestAnimationFrame(step)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();soundAt(950)}};reset();