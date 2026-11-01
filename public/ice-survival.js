const $=id=>document.getElementById(id),canvas=$('game'),c=canvas.getContext('2d'),D=25000,C=10,R=6,S=96,X=120,Y=90;
let count=40,round,raf=0,started=0,lastHit=0,sound=false,audio=null;
function rand(n){const b=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(b)}while(b[0]>=lim);return b[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const center=i=>({x:X+(i%C+.5)*S,y:Y+(Math.floor(i/C)+.5)*S});
function build(){const cells=shuffle(Array.from({length:C*R},(_,i)=>i)).slice(0,count);const survivor=cells[rand(count)];const victims=shuffle(cells.filter(i=>i!==survivor));const events=[];
 for(const cell of victims){const p=center(cell),directions=[[1,0],[-1,0],[0,1],[0,-1]],d=directions[rand(4)];const start={x:p.x-d[0]*S*1.35,y:p.y-d[1]*S*1.35};events.push({cell,start,end:p,dir:d});}
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));const people=cells.map((cell,i)=>({cell,n:labels[i]}));const byCell=new Map(people.map(p=>[p.cell,p.n]));return {people,events,winner:byCell.get(survivor)}}
function tone(f,len=.15,type='triangle'){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(.11,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+len+.02)}catch{}}
function ice(x,y,alpha=1){c.save();c.globalAlpha=alpha;c.shadowColor='#6cf4ff';c.shadowBlur=16;c.fillStyle='#71e4fa';c.fillRect(x-31,y-31,62,62);c.strokeStyle='#efffff';c.lineWidth=5;c.strokeRect(x-31,y-31,62,62);c.fillStyle='#bfffff';c.fillRect(x-19,y-20,22,10);c.restore()}
function draw(ms){const t=Math.min(D,ms),duration=20200/Math.max(1,round.events.length);let dead=new Set();
 c.fillStyle='#0c2442';c.fillRect(0,0,1200,750);c.fillStyle='#ddfbff';c.font='bold 34px system-ui';c.textAlign='center';c.fillText('❄️ ICE MAZE SURVIVAL ❄️',600,52);
 for(let row=0;row<R;row++)for(let col=0;col<C;col++){const x=X+col*S,y=Y+row*S;c.fillStyle=(row+col)%2?'#2d6085':'#367a9d';c.fillRect(x+2,y+2,S-4,S-4);c.strokeStyle='#92d9ed';c.lineWidth=2;c.strokeRect(x+2,y+2,S-4,S-4)}
 // Sliding ice follows a visible straight track, reaches the occupied cell, then eliminates it.
 for(let i=0;i<round.events.length;i++){const e=round.events[i],hitTime=1600+(i+1)*duration;const begin=hitTime-380;
 if(t>=hitTime)dead.add(e.cell);
 if(t>=begin&&t<hitTime+200){const f=Math.max(0,Math.min(1,(t-begin)/380)),x=e.start.x+(e.end.x-e.start.x)*f,y=e.start.y+(e.end.y-e.start.y)*f;ice(x,y,t>hitTime?Math.max(.15,1-(t-hitTime)/220):1);if(t>=hitTime){c.font='bold 28px system-ui';c.fillStyle='#ffe69c';c.fillText('✴',e.end.x,e.end.y-31)}}
 }
 for(const p of round.people){if(dead.has(p.cell))continue;const q=center(p.cell);c.fillStyle=['#ffd1b9','#f4a8e1','#c3f2a6','#cfb6fc'][p.n%4];c.beginPath();c.arc(q.x,q.y,31,0,Math.PI*2);c.fill();c.lineWidth=4;c.strokeStyle='#123653';c.stroke();c.fillStyle='#173550';c.font='900 27px system-ui';c.textBaseline='middle';c.textAlign='center';c.fillText(p.n,q.x,q.y+1)}
 c.textBaseline='alphabetic';c.fillStyle='#f8f9d3';c.font='bold 27px system-ui';c.textAlign='left';c.fillText('生存 '+(count-dead.size)+' / '+count,121,711);
 if(t>16500&&t<D){c.textAlign='right';c.fillStyle='#ffec92';c.fillText('⚡ 氷の連続スライド！ 大逆転！',1080,711)}
 if(t>=D){c.fillStyle='rgba(8,30,54,.9)';c.fillRect(285,273,630,160);c.strokeStyle='#f9eb9b';c.lineWidth=5;c.strokeRect(285,273,630,160);c.fillStyle='#ffe894';c.textAlign='center';c.font='bold 58px system-ui';c.fillText('🏆 '+round.winner+'番が勝利！',600,375)}
}
function frame(){const t=performance.now()-started,duration=20200/Math.max(1,round.events.length),hit=round.events.filter((_,i)=>t>=1600+(i+1)*duration).length;if(hit>lastHit){tone(180+rand(210),.18,'sawtooth');lastHit=hit}draw(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,t/1000);$('status').textContent=t>16500?'⚡ 連続スライドで大逆転！':'🧊 氷が直線を滑って番号に衝突！';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が最後まで生き残った！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.19),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=build();lastHit=0;draw(0);$('start').disabled=false;$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('status').textContent='❄️ 滑る氷ブロックに注意！';$('result').textContent='最後まで残る番号は？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(710)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(920)}};reset();
