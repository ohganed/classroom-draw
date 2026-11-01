const $=id=>document.getElementById(id),g=$('game').getContext('2d'),D=27000;
let count=40,round,raf=0,began=0,sound=false,audio=null,lastCue=-1;
function rnd(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const colors=['#ef8e94','#7bb7ef','#95ce80','#ebb66f','#ae91e5'];
function make(){
 const slots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count),labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 const balls=slots.map((slot,id)=>({id,n:labels[id],lane:Math.floor(slot/8),column:slot%8,base:24+rnd(120)/10,domino:4+rnd(18),seesaw:3+rnd(32),gate:rnd(85)-18}));
 function progress(p,t){const sec=Math.max(0,Math.min(27,t/1000));
 // Each device changes actual progress; no separate winner animation.
 return p.column*11+p.base*sec+Math.max(0,sec-4)*p.domino*.23+Math.max(0,sec-12)*p.seesaw*.40+Math.max(0,sec-20)*p.gate*.38;
 }
 const standings=balls.slice().sort((a,b)=>progress(b,D)-progress(a,D));return {balls,progress,winner:standings[0],standings};
}
function beep(f,d=.12,type='triangle',vol=.10){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.001,t);a.gain.exponentialRampToValueAtTime(vol,t+.015);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+d+.03)}catch{}}
const laneY=l=>168+l*109;
function point(progress,lane){const y=laneY(lane),q=((progress%1040)+1040)%1040;let x=85+q;
 if(q<210)return {x,y:y-8-17*q/210};
 if(q<350)return {x,y:y-25+25*(q-210)/140};
 if(q<510)return {x,y:y-8-37*Math.sin((q-350)/160*Math.PI)};
 if(q<660)return {x,y:y-8+18*Math.sin((q-510)/150*Math.PI)};
 if(q<850)return {x,y:y-8-40*Math.sin((q-660)/190*Math.PI)};
 return {x,y:y-8};}
function draw(time){const t=Math.max(0,Math.min(D,time));g.fillStyle='#f5f9ed';g.fillRect(0,0,1200,760);
 g.fillStyle='#326b78';g.font='bold 31px system-ui';g.textAlign='center';g.fillText('⚙ CHAIN REACTION RACE',600,49);
 for(let lane=0;lane<5;lane++){const y=laneY(lane);g.fillStyle=lane%2?'#ecf4e6':'#e1f2e7';g.fillRect(44,y-57,1105,99);
 g.strokeStyle='#778fa0';g.lineWidth=5;g.beginPath();g.moveTo(85,y-8);g.lineTo(295,y-25);g.lineTo(435,y);g.quadraticCurveTo(515,y-75,595,y-8);g.quadraticCurveTo(670,y+30,745,y-8);g.quadraticCurveTo(840,y-88,935,y-8);g.lineTo(1125,y-8);g.stroke();
 g.textAlign='left';g.fillStyle='#4a6978';g.font='bold 15px system-ui';g.fillText('装置 '+(lane+1),48,y-31);
 for(let i=0;i<5;i++){const x=190+i*19,phase=Math.min(1,Math.max(0,(t-3200-i*160-lane*150)/550));g.save();g.translate(x,y-33);g.rotate(phase*.95);g.fillStyle='#edb35e';g.fillRect(-6,-25,12,26);g.restore()}
 g.strokeStyle='#bd7c68';g.lineWidth=5;g.beginPath();g.moveTo(590,y-13);g.lineTo(745,y-13+Math.sin(t/510+lane)*10);g.stroke();
 g.strokeStyle='#6b8e9e';g.lineWidth=4;g.beginPath();g.arc(815,y-26,24,0,Math.PI*2);g.stroke();g.strokeStyle='#e17b83';g.beginPath();g.moveTo(815,y-26);g.lineTo(815+23*Math.cos(t/380+lane),y-26+23*Math.sin(t/380+lane));g.stroke();
 g.fillStyle='#e5b55c';g.fillRect(1090,y-37,8,29);g.fillStyle='#e78183';g.beginPath();g.moveTo(1098,y-36);g.lineTo(1130,y-25);g.lineTo(1098,y-13);g.fill();}
 const rank=round.balls.slice().sort((a,b)=>round.progress(b,t)-round.progress(a,t));
 for(const p of round.balls){const q=point(round.progress(p,t),p.lane);g.fillStyle=colors[p.n%5];g.beginPath();g.arc(q.x,q.y,17,0,Math.PI*2);g.fill();g.strokeStyle='#425a67';g.lineWidth=2.5;g.stroke();g.fillStyle='#183e52';g.textAlign='center';g.font='900 16px system-ui';g.textBaseline='middle';g.fillText(p.n,q.x,q.y);g.textBaseline='alphabetic';}
 g.fillStyle='#315b65';g.fillRect(0,700,1200,60);g.fillStyle='#fff1bd';g.textAlign='left';g.font='bold 22px system-ui';g.fillText('先頭 '+rank[0].n+'番　進行 '+Math.floor(round.progress(rank[0],t))+'m',30,738);
 g.textAlign='right';g.fillText(t>20000?'⚡ 最終分岐で大逆転！':t>12000?'🪁 シーソー連鎖！':'▥ ドミノ → 坂道 → 振り子',1167,738);
 if(t>=D){g.fillStyle='rgba(25,50,64,.95)';g.fillRect(235,265,730,173);g.strokeStyle='#f6d778';g.lineWidth=5;g.strokeRect(235,265,730,173);g.textAlign='center';g.fillStyle='#fff1af';g.font='bold 55px system-ui';g.fillText('🏆 '+round.winner.n+'番がゴール！',600,368)}
}
function tick(){const t=performance.now()-began,stage=t>20000?3:t>12000?2:t>4000?1:0;if(stage>lastCue){lastCue=stage;beep(420+stage*140,.13);setTimeout(()=>beep(630+stage*100,.12),140)}draw(t);$('clock').textContent=(Math.min(D,t)/1000).toFixed(1)+' / 27秒';$('meter').value=Math.min(D,t)/1000;$('status').textContent=t>20000?'⚡ 最終分岐！ どのボールが先頭になる？':'⚙ 仕掛けを通るたび走行距離が変わる！';if(t<D)raf=requestAnimationFrame(tick);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner.n+'番が当選！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.23),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=make();lastCue=-1;draw(0);$('meter').value=0;$('clock').textContent='0.0 / 27秒';$('status').textContent='ドミノ → 坂道 → シーソー → 回転ゲート → ゴール';$('result').textContent='どの番号が先頭でゴール？';$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(800)}began=performance.now();raf=requestAnimationFrame(tick)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(930)}};reset();