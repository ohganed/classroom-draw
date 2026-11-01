const $=id=>document.getElementById(id),g=$('game').getContext('2d'),D=25000;
let count=40,round,started=0,raf=0,sound=false,audio=null,lastRound=-1;
function rand(n){const a=new Uint32Array(1),max=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=max);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const laneY=l=>154+111*l,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=u=>u*u*(3-2*u);
function build(){
 const order=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count);
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 const people=order.map((slot,id)=>{const power=34+rand(69)+rand(1000)/1000;return {id,n:labels[id],lane:slot%5,wave:Math.floor(slot/5),power,score:Math.round(power),x:145+(7-Math.floor(slot/5))*37};});
 // Independent randomized slot order and jump power: no number is favored.
 people.sort((a,b)=>a.wave-b.wave||a.lane-b.lane);
 const ranking=[...people].sort((a,b)=>b.power-a.power);return {people,winner:ranking[0],ranking};
}
function beep(f,len=.11,type='triangle',v=.12){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.001,t);a.gain.exponentialRampToValueAtTime(v,t+.012);a.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+len+.02)}catch{}}
function actorState(p,t){const begin=700+p.wave*2720,u=(t-begin)/2720,base=laneY(p.lane);let x=p.x,y=base-14,visible=true,jumping=false;
 if(u<0)return {x,y,visible,jumping};
 if(u<.39){x=p.x+(730-p.x)*ease(clamp(u/.39,0,1));y=base-14-25*clamp((x-570)/160,0,1);}
 else if(u<.55){x=730+60*ease((u-.39)/.16);y=base-39;}
 else if(u<.85){const q=clamp((u-.55)/.30,0,1);x=790+260*q;y=base-39-p.power*4*q*(1-q);jumping=true;}
 else{visible=false;x=1060;y=base-39-p.power;}
 return {x,y,visible,jumping};
}
function draw(ms){const t=clamp(ms,0,D);g.fillStyle='#8bcdf1';g.fillRect(0,0,1200,760);
 for(let i=0;i<12;i++){g.fillStyle='#edfcff';g.beginPath();g.ellipse((i*137+80)%1200,32+i%3*21,40,12,0,0,7);g.fill()}
 g.fillStyle='#23466a';g.textAlign='center';g.font='bold 30px system-ui';g.fillText('FLAG JUMP CHAMPIONSHIP  •  EPISODE 04',600,43);
 for(let lane=0;lane<5;lane++){const y=laneY(lane);g.fillStyle=lane%2?'#bfe9b9':'#d0f3c4';g.fillRect(28,y-94,1144,113);g.fillStyle='#679d60';g.fillRect(28,y+10,1144,8);
 for(let step=0;step<5;step++){const x=575+step*43;g.fillStyle='#b77c56';g.fillRect(x,y-step*5,44,10+step*5);g.strokeStyle='#684b47';g.strokeRect(x,y-step*5,44,10+step*5)}
 g.strokeStyle='#4b6776';g.lineWidth=5;g.beginPath();g.moveTo(1054,y+9);g.lineTo(1054,y-98);g.stroke();g.fillStyle='#ff8179';g.beginPath();g.moveTo(1057,y-96);g.lineTo(1110,y-80);g.lineTo(1057,y-62);g.closePath();g.fill();
 g.fillStyle='#26485d';g.textAlign='left';g.font='bold 16px system-ui';g.fillText('LANE '+(lane+1),36,y-62);
 for(let h=20;h<=100;h+=20){g.fillStyle='rgba(42,79,78,.3)';g.fillRect(1019,y-39-h,26,1)}}
 const completed=round.people.filter(p=>t>=700+p.wave*2720+2720*.85);
 for(const p of round.people){const s=actorState(p,t);if(!s.visible)continue;
 g.fillStyle=['#fbc4df','#caf3aa','#b5e8ff','#f9d68e','#d8c5fc'][p.n%5];g.beginPath();g.arc(s.x,s.y,16,0,Math.PI*2);g.fill();g.strokeStyle='#304759';g.lineWidth=2;g.stroke();g.fillStyle='#213e52';g.textAlign='center';g.textBaseline='middle';g.font='900 15px system-ui';g.fillText(p.n,s.x,s.y+1);g.textBaseline='alphabetic';
 if(s.jumping){g.fillStyle='#fdf4b3';g.font='bold 15px system-ui';g.fillText('!',s.x,s.y-23)}}
 // Score markers are derived from the same jump height used for animation.
 for(const lane of [0,1,2,3,4]){const previous=completed.filter(p=>p.lane===lane).sort((a,b)=>b.power-a.power)[0];if(!previous)continue;const y=laneY(lane)-39-previous.power;g.fillStyle='#243d5b';g.fillRect(1084,y-10,78,21);g.fillStyle='#ffe9a0';g.textAlign='center';g.font='bold 15px system-ui';g.fillText(previous.n+' : '+previous.score,1123,y+5)}
 const lead=completed.slice().sort((a,b)=>b.power-a.power)[0];
 g.fillStyle='rgba(22,44,70,.94)';g.fillRect(0,694,1200,66);
 g.fillStyle='#ffe5a0';g.textAlign='left';g.font='bold 22px system-ui';g.fillText('跳んだ人数 '+completed.length+' / '+count,29,735);
 g.textAlign='right';g.fillText(lead?'現在トップ '+lead.n+'番  '+lead.score+'点':'5人同時にジャンプ！',1168,735);
 if(t>=D){g.fillStyle='rgba(19,34,69,.94)';g.fillRect(235,258,730,177);g.strokeStyle='#ffe597';g.lineWidth=4;g.strokeRect(235,258,730,177);g.fillStyle='#fff0a5';g.textAlign='center';g.font='bold 53px system-ui';g.fillText('🏆 '+round.winner.n+'番  '+round.winner.score+'点！',600,361)}
}
function frame(){let t=performance.now()-started,wave=Math.floor(Math.max(0,t-700)/2720);if(wave>lastRound&&t>700&&wave<8){lastRound=wave;beep(430,.08);setTimeout(()=>beep(670,.12),110)}draw(t);$('clock').textContent=(Math.min(D,t)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(D,t)/1000;$('status').textContent=t>18000?'🚩 後半組が挑戦！ 最高記録を塗り替えられるか？':'🏃 5人ずつ同時挑戦。階段から旗へ大ジャンプ！';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner.n+'番が優勝！ 最高到達 '+round.winner.score+'点';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.24),i*150))}}
function reset(){cancelAnimationFrame(raf);count=clamp(Number($('count').value)||40,1,40);$('count').value=count;round=build();lastRound=-1;draw(0);$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('status').textContent='🏁 5人同時ジャンプ。最高到達点を競おう！';$('result').textContent='一番高い旗を取るのは何番？';$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(850)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(890)}};reset();