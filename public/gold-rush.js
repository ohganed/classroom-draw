const $=id=>document.getElementById(id),c=$('game').getContext('2d'),D=25000;
let count=40,round,raf=0,started=0,sound=false,audio=null,last=0;
const X=145,Y=650,DX=113,DY=114;
function rand(n){const v=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(v)}while(v[0]>=limit);return v[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const pos=(col,floor)=>({x:X+col*DX,y:Y-floor*DY});
function ladderCol(p){if(p.floor===4)return p.col;const candidates=Array.from({length:8},(_,j)=>j).filter(j=>(j+p.floor)%3===0);return candidates.reduce((a,b)=>Math.abs(b-p.col)<Math.abs(a-p.col)?b:a)}
function location(p,time){
 const ladder=ladderCol(p),footX=X+ladder*DX+50,startX=X+p.col*DX,upper=p.floor<4?p.floor+1:p.floor;
 const endX=X+Math.max(0,Math.min(7,ladder+(ladder>3?-1:1)))*DX;
 let x=startX,y=Y-p.floor*DY-30;
 if(time<4600)x=startX+(footX-startX)*Math.max(0,time/4600);
 else if(time<9000){x=footX;y-=(upper-p.floor)*DY*Math.min(1,(time-4600)/4400);}
 else {x=footX+(endX-footX)*Math.min(1,(time-9000)/4600);y=Y-upper*DY-30;}
 return {x,y};
}

function build(){
 const slots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count),players=slots.map((slot,id)=>({id,col:slot%8,floor:Math.floor(slot/8),phase:rand(100)/100,dir:rand(2)?1:-1}));
 const survivor=rand(count),losers=shuffle(players.filter(p=>p.id!==survivor).map(p=>p.id)),events=[];
 // Each hazard belongs to the actual character's platform and occurs after it stops safely.
 for(let i=0;i<losers.length;i++)events.push({id:losers[i],t:5900+(i+1)*15700/Math.max(1,losers.length),kind:'hole'});
 const safeEvents=[];for(let t=700;t<20500;t+=610){const ids=shuffle(players.map(p=>p.id).filter(id=>!events.some(e=>e.id===id&&e.t<t+850)));for(const id of ids.slice(0,Math.min(ids.length,3+rand(3))))safeEvents.push({id,t})}
 const gold=players.flatMap(p=>[{id:p.id,k:0,...location(p,4600),t:4600},{id:p.id,k:1,...location(p,9000),t:9000}].filter(g=>!events.some(e=>e.id===p.id&&e.t<=g.t)));
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 return {players:players.map(p=>({...p,n:labels[p.id]})),events,safeEvents,gold,survivor,winner:labels[survivor]};
}
function beep(freq,len=.10,type='triangle',gain=.10){if(!sound||!audio)return;try{const at=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+len);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+len+.02)}catch{}}
function draw(ms){const t=Math.min(D,ms),dead=new Set(round.events.filter(e=>t>=e.t+330).map(e=>e.id)),traps=round.events.filter(e=>t>=e.t-240&&t<e.t+550);
 c.fillStyle='#111b2e';c.fillRect(0,0,1200,760);c.textAlign='center';c.fillStyle='#ffdf7d';c.font='bold 34px system-ui';c.fillText('⛏ GOLD RUSH ESCAPE ⛏',600,49);
 for(let f=0;f<5;f++){const y=Y-f*DY;c.fillStyle='#5a3c36';c.fillRect(76,y+13,1048,19);c.fillStyle='#bd8a51';c.fillRect(76,y+12,1048,5);for(let j=0;j<8;j++){const x=X+j*DX;c.fillStyle='#805a43';c.fillRect(x-36,y+17,72,10);c.strokeStyle='#f7ce76';c.lineWidth=3;if((j+f)%3===0){c.beginPath();c.moveTo(x+50,y+12);c.lineTo(x+50,y-DY+15);c.stroke();for(let yy=y-DY+29;yy<y+10;yy+=16){c.beginPath();c.moveTo(x+38,yy);c.lineTo(x+62,yy);c.stroke()}}}}
 // Walk along the floor to a drawn ladder; climb vertically on its exact x-coordinate, then walk upstairs.
 const collected=round.gold.filter(item=>t>=item.t).length;
 for(const item of round.gold){if(t>=item.t)continue;c.fillStyle='#ffd65e';c.font='bold 27px system-ui';c.textAlign='center';c.fillText('◆',item.x,item.y-16);
 }
 for(const p of round.players){if(dead.has(p.id))continue;
  const trap=traps.find(e=>e.id===p.id),safe=round.safeEvents.find(e=>e.id===p.id&&t>=e.t&&t<e.t+540);
  const hazard=round.events.find(e=>e.id===p.id);
  const travel=Math.min(t,hazard?hazard.t-240:t);
  const q=location(p,Math.max(0,travel));let x=q.x,y=q.y;
  if(safe)y-=Math.sin(Math.PI*(t-safe.t)/540)*18;
  if(trap&&t>=trap.t){const u=Math.min(1,(t-trap.t)/400);y+=u*u*125;}
  if(p.id===round.survivor&&t>20900){const u=Math.min(1,(t-20900)/2900);x+=(600-x)*u;y+=(85-y)*u-Math.sin(Math.PI*u)*70;}
  if(trap){c.fillStyle='#090e1a';c.fillRect(q.x-36,q.y+37,72,20);c.strokeStyle='#ff8b5a';c.lineWidth=3;c.strokeRect(q.x-36,q.y+37,72,20);}
  c.fillStyle=['#f3aed2','#b2f0d7','#acd4ff','#f9d89e'][p.n%4];c.beginPath();c.arc(x,y,20,0,Math.PI*2);c.fill();c.strokeStyle='#221b29';c.lineWidth=3;c.stroke();c.fillStyle='#202035';c.font='900 19px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(p.n,x,y);c.textBaseline='alphabetic';
 }
 c.fillStyle='#fff3b0';c.textAlign='right';c.font='bold 24px system-ui';c.fillText('金塊 '+collected+' / '+round.gold.length+' 個取得',1120,78);
 if(t>18500&&t<D){c.fillStyle='#a6f8ed';c.font='bold 27px system-ui';c.textAlign='right';c.fillText('✨ 秘密のハシゴ開通！ 大逆転！',1135,723)}
 c.fillStyle='#ffe3a3';c.font='bold 26px system-ui';c.textAlign='left';c.fillText('生存 '+(count-dead.size)+' / '+count,75,726);
 if(t>=D){c.fillStyle='rgba(14,17,33,.92)';c.fillRect(260,270,680,170);c.strokeStyle='#ffe277';c.lineWidth=5;c.strokeRect(260,270,680,170);c.fillStyle='#ffeaa0';c.textAlign='center';c.font='bold 58px system-ui';c.fillText('🏆 '+round.winner+'番が金塊獲得！',600,378)}
}
function frame(){const t=performance.now()-started,hits=round.events.filter(e=>e.t<=t).length;if(hits>last){beep(190+rand(140),.14,'sawtooth',.10);last=hits}draw(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(t,D)/1000;$('status').textContent=t>18500?'✨ 終盤！ 秘密のハシゴが開通！':'⛏ 足場を歩いてハシゴを登り、経路上の金塊を拾おう！';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が最後まで生き残った！';[523,659,784,1047].forEach((n,i)=>setTimeout(()=>beep(n,.20,'triangle',.15),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=build();last=0;draw(0);$('start').disabled=false;$('meter').value=0;$('clock').textContent='0.0 / 25秒';$('status').textContent='金塊を集め、落とし穴を避けよう！';$('result').textContent='最後の1人は何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(810)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(930)}};reset();
