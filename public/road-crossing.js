const cv=document.querySelector('#game'),c=cv.getContext('2d'),$=id=>document.getElementById(id);
let count=40,round=null,startAt=0,raf=0,audio=null,sound=false,prevHits=0;
const W=1200,H=720,D=25000;
function rand(max){const a=new Uint32Array(1);const lim=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%max}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function person(n){return {n,x:76+((n-1)%10)*115,y:610-Math.floor((n-1)/10)*76}}
function yAt(p,t){return p.y-Math.min(.95,t/D)*292+Math.sin(t/340+p.n)*5}
function makeRound(){const winner=rand(count)+1,losers=shuffle(Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner));const events=losers.map((n,i)=>({n,t:1700+(i+1)*(19500/Math.max(1,losers.length)),fromRight:i%2===0}));return {winner,events,people:Array.from({length:count},(_,i)=>person(i+1))}}
function tone(freq,len=.12,type='square',volume=.12){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+len+.02)}catch{}}
function draw(t){const now=Math.min(D,Math.max(0,t)),completed=round.events.filter(e=>e.t<=now),out=new Set(completed.map(e=>e.n)),winner=round.winner;
c.fillStyle='#122b37';c.fillRect(0,0,W,H);
c.fillStyle='#284b48';c.fillRect(0,60,W,65);c.fillRect(0,648,W,72);
c.fillStyle='#424d56';c.fillRect(0,125,W,523);
for(let y=170;y<650;y+=85){c.fillStyle='rgba(255,233,160,.42)';for(let x=10;x<W;x+=105)c.fillRect(x,y,57,5)}
c.fillStyle='#99d2ba';c.fillRect(0,115,W,15);c.fillRect(0,640,W,12);
c.fillStyle='#eaffd2';c.textAlign='center';c.font='bold 34px system-ui';c.fillText('🚦 ハラハラ道路横断',W/2,48);
c.fillStyle='#ffdb75';c.font='bold 25px system-ui';c.fillText('🏁 安全地帯',W/2,101);
const late=now>17500;
if(late){c.fillStyle='rgba(15,120,171,.31)';c.fillRect(0,400,W,45);c.fillStyle='#b8f5f4';c.font='bold 23px system-ui';c.fillText('🚇 地下通路 OPEN！ 逆転チャンス',W/2,427)}
// Cars arrive alongside a numbered participant exactly at its scheduled contact time.
for(const e of round.events){const dt=now-e.t;if(dt < -800||dt>330)continue;const p=round.people[e.n-1];const yy=yAt(p,Math.min(now,e.t));const dir=e.fromRight?1:-1;
const cx=p.x+dir*(dt<0?80*(-dt/800):0),cy=yy;
c.fillStyle=e.n%3===0?'#f7c84b':e.n%3===1?'#ef606b':'#74caff';c.fillRect(cx-24,cy-13,48,26);
c.fillStyle='#eff8ff';c.fillRect(cx-12,cy-9,22,11);
c.fillStyle='#172531';c.fillRect(cx-20,cy+10,11,8);c.fillRect(cx+11,cy+10,11,8);
if(dt>=0){c.fillStyle='#fff0a0';c.font='bold 23px system-ui';c.fillText('💥',p.x,cy-21)}
}
for(const p of round.people){if(out.has(p.n))continue;const isWinner=p.n===winner,lateWinner=isWinner&&now>19200;let y=yAt(p,now);if(lateWinner)y-=((now-19200)/(D-19200))*140;
const x=p.x+Math.sin(now/430+p.n)*3;
c.fillStyle=lateWinner?'#ffda72':['#ff99ab','#98dfff','#afe9a5','#d8b5ff'][(p.n-1)%4];c.beginPath();c.arc(x,y,20,0,Math.PI*2);c.fill();c.strokeStyle='#172f39';c.lineWidth=3;c.stroke();
c.fillStyle='#142736';c.font='900 22px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(p.n,x,y+1);
}
c.textBaseline='alphabetic';c.textAlign='left';c.font='bold 25px system-ui';c.fillStyle='#fff';c.fillText('残り '+(count-out.size)+'人',25,695);
if(now>=D){c.fillStyle='rgba(9,23,37,.83)';c.fillRect(285,266,630,146);c.strokeStyle='#ffda72';c.lineWidth=4;c.strokeRect(285,266,630,146);c.fillStyle='#ffe59b';c.textAlign='center';c.font='bold 58px system-ui';c.fillText('🏆 '+winner+'番 が勝利！',600,362)}
}
function frame(){const t=performance.now()-startAt;const hit=round.events.filter(e=>e.t<=t).length;if(hit>prevHits){tone(130,.14,'sawtooth',.10);prevHits=hit}draw(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,t/1000);
const remaining=count-hit;$('status').textContent=t<17500?'🚗 接触した番号が脱落！ 残り'+remaining+'人':t<D?'🚇 地下通路で大逆転！ 残り'+remaining+'人':'🏁 ゴール！';
if(t<D)raf=requestAnimationFrame(frame);else{$('result').textContent='🏆 '+round.winner+'番 が最後まで生き残った！';$('start').disabled=false;for(let i=0;i<4;i++)setTimeout(()=>tone([523,659,784,1047][i],.22,'triangle',.17),i*170)}
}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=makeRound();prevHits=0;draw(0);$('result').textContent='最後まで生き残るのは何番？';$('status').textContent='🚦 青信号を待っています';$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;startAt=performance.now();if(sound){audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();tone(660,.18)}raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;
$('count').onchange=reset;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();tone(880,.15)}};
reset();
