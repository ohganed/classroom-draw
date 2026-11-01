const cv=document.getElementById('game'),g=cv.getContext('2d'),$=id=>document.getElementById(id);
const COL=10,ROW=6,S=99,OX=105,OY=77,DURATION=25000;
let count=40,round=null,raf=0,started=0,playing=false,sound=false,ctx=null,lastBlast=0;
function rand(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const xy=i=>({x:i%COL,y:Math.floor(i/COL)});
function center(i){const p=xy(i);return {x:OX+p.x*S+S/2,y:OY+p.y*S+S/2}}
function build(){const winner=1+rand(count),slots=shuffle(Array.from({length:COL*ROW},(_,i)=>i)),people=Array.from({length:count},(_,i)=>({n:i+1,cell:slots[i]}));
 const walls=new Set();for(let y=0;y<ROW;y++)for(let x=0;x<COL;x++){if(x<COL-1&&rand(100)<30)walls.add([y*COL+x,y*COL+x+1].join(':'));if(y<ROW-1&&rand(100)<30)walls.add([y*COL+x,(y+1)*COL+x].join(':'))}
 const protectedCell=people[winner-1].cell;for(const d of [-COL,COL,-1,1]){const k=protectedCell+d;if(k>=0&&k<COL*ROW&&Math.abs(xy(k).x-xy(protectedCell).x)+Math.abs(xy(k).y-xy(protectedCell).y)===1)walls.add([Math.min(k,protectedCell),Math.max(k,protectedCell)].join(':'))}
 const path=cell=>{const reached=new Set([cell]);for(const d of [-COL,COL,-1,1]){const j=cell+d;const p=xy(cell),q=xy(j);if(j<0||j>=COL*ROW||Math.abs(p.x-q.x)+Math.abs(p.y-q.y)!==1)continue;const key=[Math.min(cell,j),Math.max(cell,j)].join(':');if(!walls.has(key))reached.add(j)}return [...reached]};
 const winnerCell=people[winner-1].cell,remaining=new Map(people.map(p=>[p.cell,p.n])),events=[];
 // Choose each real bomb so that its visual cross blasts actual occupants, never the winner.
 let time=2600;while(remaining.size>1){const victims=[...remaining.entries()].filter(([,n])=>n!==winner),picked=victims[rand(victims.length)],bombCell=picked[0];
 let cells=path(bombCell); // Solid walls physically stop blast rays before the protected cell
 const hit=cells.filter(cell=>remaining.has(cell));for(const cell of hit)remaining.delete(cell);
 events.push({t:time,cell:bombCell,cells,hit:hit.map(cell=>people[0]&&people.find(p=>p.cell===cell).n)});
 time+=Math.min(450,18000/Math.max(1,count-1));
 }
 return {winner,people,walls,events};}
function beep(f,d=.12,type='square',vol=.12){if(!sound||!ctx)return;try{const t=ctx.currentTime,o=ctx.createOscillator(),a=ctx.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(vol,t+.007);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(ctx.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function render(ms){const t=Math.min(DURATION,ms),dead=new Set(),active=[];for(const e of round.events){if(t>=e.t)for(const n of e.hit)dead.add(n);if(t>=e.t-480&&t<e.t+310)active.push(e)}
 g.fillStyle='#121f36';g.fillRect(0,0,1200,750);g.fillStyle='#e7f1ff';g.font='bold 29px system-ui';g.textAlign='center';g.fillText('💣 爆弾迷宮バトル',600,42);
 for(let y=0;y<ROW;y++)for(let x=0;x<COL;x++){const i=y*COL+x,p=center(i);g.fillStyle=(x+y)%2?'#263f58':'#29475f';g.fillRect(p.x-S/2+1,p.y-S/2+1,S-2,S-2)}
 for(const key of round.walls){const [a,b]=key.split(':').map(Number),p=center(a),q=center(b);g.strokeStyle='#9ba7b6';g.lineWidth=13;g.lineCap='round';g.beginPath();if(Math.abs(a-b)===1){const x=(p.x+q.x)/2;g.moveTo(x,p.y-S/2);g.lineTo(x,p.y+S/2)}else{const y=(p.y+q.y)/2;g.moveTo(p.x-S/2,y);g.lineTo(p.x+S/2,y)}g.stroke()}
 for(const e of active){const dt=t-e.t,p=center(e.cell);
  if(dt<0){g.fillStyle='#f8cc60';g.font='bold 32px system-ui';g.textAlign='center';g.fillText('💣',p.x,p.y+10)}
  else {for(const cell of e.cells){const q=center(cell);g.fillStyle='rgba(255,151,35,.85)';g.fillRect(q.x-S*.36,q.y-S*.36,S*.72,S*.72);g.fillStyle='#ffe78a';g.fillRect(q.x-S*.17,q.y-S*.17,S*.34,S*.34)}}
 }
 for(const p of round.people){if(dead.has(p.n))continue;const q=center(p.cell),isWin=p.n===round.winner&&t>20500;let dx=Math.sin(t/410+p.n)*5,dy=Math.cos(t/290+p.n)*6;if(isWin)dy-=Math.min(1,(t-20500)/3500)*32;
 g.fillStyle=['#ffc3c7','#a1ddff','#d0b2ff','#b7edb3'][p.n%4];g.beginPath();g.arc(q.x+dx,q.y+dy,29,0,Math.PI*2);g.fill();g.strokeStyle='#112438';g.lineWidth=3;g.stroke();
 g.fillStyle='#142537';g.font='900 27px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(p.n,q.x+dx,q.y+dy+1)}
 g.textBaseline='alphabetic';g.fillStyle='#fff5d5';g.font='bold 28px system-ui';g.textAlign='left';g.fillText('生存 '+(round.people.length-dead.size)+' / '+count,105,712);
 if(t>17500&&t<DURATION){g.textAlign='right';g.fillStyle='#ffce6e';g.fillText('⚡ 連鎖爆発！ 大逆転！',1095,712)}
 if(t>=DURATION){g.fillStyle='rgba(11,22,39,.88)';g.fillRect(285,279,630,155);g.strokeStyle='#ffd568';g.lineWidth=4;g.strokeRect(285,279,630,155);g.fillStyle='#ffeb9c';g.font='bold 58px system-ui';g.textAlign='center';g.fillText('🏆 '+round.winner+'番が生還！',600,376)}
}
function tick(){const ms=performance.now()-started;const blasts=round.events.filter(e=>e.t<=ms).length;if(blasts>lastBlast){beep(90+rand(120),.17,'sawtooth',.14);lastBlast=blasts}render(ms);$('clock').textContent=(Math.min(ms,DURATION)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,ms/1000);$('status').textContent=ms>17500?'⚡ 終盤！ 連鎖爆発！':'💣 爆風と壁を見極めろ！';if(ms<DURATION)raf=requestAnimationFrame(tick);else{playing=false;$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が生き残った！';[523,659,784,1047].forEach((n,i)=>setTimeout(()=>beep(n,.19,'triangle',.16),i*140))}}
function reset(){cancelAnimationFrame(raf);playing=false;count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=build();lastBlast=0;render(0);$('result').textContent='最後まで残るのは何番？';$('status').textContent='💣 爆弾を回避して生き残れ！';$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('start').disabled=false}
$('start').onclick=()=>{reset();playing=true;$('start').disabled=true;if(sound){ctx??=new (window.AudioContext||window.webkitAudioContext)();ctx.resume();beep(440,.16)}started=performance.now();raf=requestAnimationFrame(tick)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){ctx??=new (window.AudioContext||window.webkitAudioContext)();ctx.resume();beep(720,.12)}};reset();
