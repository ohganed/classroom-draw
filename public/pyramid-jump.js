const $=id=>document.getElementById(id),c=$('game').getContext('2d'),D=25000,ROWS=9;
let count=40,round,raf=0,started=0,sound=false,audio=null,lastHit=0;
function rand(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const tiles=[];for(let r=0;r<ROWS;r++)for(let k=0;k<=r;k++)tiles.push({r,k,x:600+(k-r/2)*102,y:135+r*58});
function make(){
 const locations=shuffle(tiles.map((_,i)=>i)).slice(0,count);
 const survivor=rand(count),losers=shuffle(locations.map((_,i)=>i).filter(i=>i!==survivor));
 const events=losers.map((id,i)=>({id,t:1700+(i+1)*19200/Math.max(1,losers.length),tile:locations[id]}));
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 return {people:locations.map((tile,id)=>({id,tile,n:labels[id]})),events,winner:labels[survivor],survivor};
}
function tone(f,d=.11,type='triangle',v=.1){if(!sound||!audio)return;try{const at=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(v,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+d+.02)}catch{}}
function draw(t){
 t=Math.min(D,t);const dead=new Set(round.events.filter(e=>e.t<=t).map(e=>e.id));
 const active=round.events.find(e=>t>=e.t-750&&t<e.t+240);
 c.fillStyle='#191038';c.fillRect(0,0,1200,760);c.textAlign='center';c.fillStyle='#ffe49c';c.font='bold 34px system-ui';c.fillText('✦ PYRAMID JUMP FEVER ✦',600,53);
 for(let id=0;id<tiles.length;id++){const q=tiles[id],isDanger=active?.tile===id,fallen=round.events.some(e=>e.tile===id&&e.t<t);
 c.beginPath();c.moveTo(q.x,q.y-24);c.lineTo(q.x+45,q.y);c.lineTo(q.x,q.y+24);c.lineTo(q.x-45,q.y);c.closePath();
 c.fillStyle=fallen?'#33294f':isDanger&&t>=active.t-180?'#ff657e':['#28d7d1','#ffce69','#967aff','#ff7dc6'][q.r%4];c.fill();
 c.strokeStyle=fallen?'#635478':'#f5ebff';c.lineWidth=3;c.stroke();
 c.fillStyle='rgba(16,10,44,.42)';c.beginPath();c.moveTo(q.x-45,q.y);c.lineTo(q.x,q.y+24);c.lineTo(q.x,q.y+38);c.lineTo(q.x-45,q.y+12);c.closePath();c.fill()}
 for(const p of round.people){if(dead.has(p.id))continue;const q=tiles[p.tile],near=active?.id===p.id;
 // Ordinary safe hops happen throughout the early game. A fatal jump lands first,
 // then the tile turns red after a short suspense beat; only then does it collapse.
 const safePhase=((t/1150+p.id*.37)%(Math.PI*2));
 const safeHop=Math.max(0,Math.sin(safePhase))*15;
 const jumpPhase=near?Math.max(0,Math.min(1,(t-(active.t-750))/490)):0;
 const fatalHop=near&&t<active.t-260?Math.sin(jumpPhase*Math.PI)*37:0;
 let x=q.x,y=q.y-25-(near?fatalHop:safeHop);
 if(t>21000&&p.id===round.survivor){const u=Math.min(1,(t-21000)/2800);x=q.x+(600-q.x)*u;y=q.y-25+(105-q.y)*u-Math.sin(u*Math.PI)*65;}
 c.fillStyle=['#f9b6c9','#acf3a5','#bbd5ff','#dec0ff'][p.n%4];c.beginPath();c.arc(x,y,21,0,Math.PI*2);c.fill();c.strokeStyle='#221745';c.lineWidth=3;c.stroke();
 c.fillStyle='#201844';c.font='900 19px system-ui';c.textBaseline='middle';c.fillText(p.n,x,y+1)}
 c.textBaseline='alphabetic';c.textAlign='left';c.font='bold 28px system-ui';c.fillStyle='#fff2b6';c.fillText('生存 '+(count-dead.size)+' / '+count,74,711);
 if(t>17300&&t<D){c.textAlign='right';c.fillStyle='#ffdc86';c.fillText('🛸 救出円盤！ 大逆転！',1130,711);
 const u=Math.min(1,(t-17300)/5300);c.fillStyle='#84eeff';c.beginPath();c.ellipse(1000-u*400,105,85,22,0,0,Math.PI*2);c.fill()}
 if(t>=D){c.fillStyle='rgba(17,13,46,.92)';c.fillRect(278,265,644,167);c.strokeStyle='#ffe78b';c.lineWidth=5;c.strokeRect(278,265,644,167);c.fillStyle='#ffea9b';c.textAlign='center';c.font='bold 57px system-ui';c.fillText('🏆 '+round.winner+'番が勝利！',600,368)}
}
function frame(){const t=performance.now()-started,hits=round.events.filter(e=>e.t<=t).length;if(hits>lastHit){tone(190+rand(110),.17,'sawtooth',.12);lastHit=hits}draw(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,t/1000);$('status').textContent=t>17300?'🛸 救出円盤が登場！':'🔺 危険色の足場が崩れる！';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が生き残った！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.20,'triangle',.17),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=make();lastHit=0;draw(0);$('start').disabled=false;$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('status').textContent='足場の色が危険色になったら脱落！';$('result').textContent='最後まで生き残るのは何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(740)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tone(880)}};reset();
