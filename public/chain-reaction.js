const $=id=>document.getElementById(id),g=$('game').getContext('2d'),D=27000;
let count=40,round,raf=0,began=0,sound=false,audio=null,lastCue=-1;
function rnd(n){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const colors=['#ef8e94','#7bb7ef','#95ce80','#ebb66f','#ae91e5'];
// One continuous, tightly folded racing circuit. The same polyline is shared by all forty balls.
// Smooth quarter-circle U-turns connect each horizontal run rather than teleporting between rows.
const P=[];function push(x,y){P.push({x,y})}
const LEFT=92,RIGHT=1094,TOP=125,STEP=84,ROWS=7,R=STEP/2;
for(let row=0;row<ROWS;row++){
 const y=TOP+row*STEP,dir=row%2===0?1:-1,startX=dir===1?LEFT:RIGHT,endX=dir===1?RIGHT:LEFT;
 if(row===0)push(startX,y);
 for(let x=0;x<=72;x++){const u=x/72;push(startX+(endX-startX)*u,y+7*Math.sin(u*6*Math.PI)*(row%3===1?1:.35))}
 if(row<ROWS-1){
  // Semicircle on the outside edge connects to the next, reverse-direction run.
  const cx=endX,cy=y+R;
  for(let k=1;k<=38;k++){const theta=-Math.PI/2+Math.PI*k/38;push(cx+dir*R*Math.cos(theta),cy+R*Math.sin(theta))}
 }
}
const seg=[],cumulative=[0];for(let i=1;i<P.length;i++){const d=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);seg.push(d);cumulative.push(cumulative[i-1]+d)}const LENGTH=cumulative[cumulative.length-1];
function point(d){const v=Math.max(0,Math.min(LENGTH,d));let lo=0,hi=cumulative.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(cumulative[mid]<=v)lo=mid;else hi=mid}const q=seg[lo]?Math.max(0,Math.min(1,(v-cumulative[lo])/seg[lo])):0,a=P[lo],b=P[Math.min(P.length-1,lo+1)];return {x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q}}
function make(){
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 const balls=Array.from({length:count},(_,id)=>({id,n:labels[id],base:252+rnd(70),domino:18+rnd(70),seesaw:20+rnd(100),gate:rnd(150)-35,offset:id*19}));
 // Distance is the only source of visible location and final ranking. All labels are exchangeable.
 function progress(p,t){const sec=Math.max(0,Math.min(27,t/1000));
  const d=p.base*sec+p.domino*Math.max(0,sec-4)*.36+p.seesaw*Math.max(0,sec-12)*.48+p.gate*Math.max(0,sec-20)*.7-p.offset;
  return Math.min(LENGTH,Math.max(0,d));
 }
 const standings=balls.slice().sort((a,b)=>progress(b,D)-progress(a,D)||a.id-b.id);
 return {balls,progress,winner:standings[0],standings};
}
function beep(f,d=.12,type='triangle',vol=.10){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.001,t);a.gain.exponentialRampToValueAtTime(vol,t+.015);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+d+.03)}catch{}}
function draw(time){const t=Math.min(D,Math.max(0,time));g.fillStyle='#f6f7e9';g.fillRect(0,0,1200,760);
 g.fillStyle='#2e6077';g.font='bold 30px system-ui';g.textAlign='center';g.fillText('⚙ CHAIN REACTION • ONE BIG CIRCUIT',600,48);
 // Draw the complete raceway before balls: continuous lines show the exact path they follow.
 g.beginPath();g.moveTo(P[0].x,P[0].y);for(let i=1;i<P.length;i++)g.lineTo(P[i].x,P[i].y);
 g.lineCap='round';g.lineJoin='round';g.strokeStyle='#57747b';g.lineWidth=51;g.stroke();
 g.strokeStyle='#b9dfd1';g.lineWidth=41;g.stroke();
 g.strokeStyle='#eaf7e9';g.lineWidth=3;g.setLineDash([12,16]);g.stroke();g.setLineDash([]);
 for(let row=0;row<ROWS;row++){const y=TOP+row*STEP,dir=row%2===0?1:-1;
  g.fillStyle='#447a79';g.font='bold 14px system-ui';g.textAlign='left';g.fillText('ZONE '+(row+1),25,y-28);
  // Original chain-reaction devices on the shared path, not on separate courses.
  const x=dir>0?290:900;
  if(row%4===0){for(let k=0;k<6;k++){const u=Math.max(0,Math.min(1,(t-(2000+row*170+k*110))/460));g.save();g.translate(x+k*21*dir,y-19);g.rotate(dir*u*.9);g.fillStyle='#dcaa5d';g.fillRect(-5,-21,10,22);g.restore()}}
  if(row%4===1){g.strokeStyle='#b97866';g.lineWidth=8;g.beginPath();g.moveTo(x-76,y);g.lineTo(x+76,y+Math.sin(t/550+row)*11);g.stroke()}
  if(row%4===2){g.strokeStyle='#789eac';g.lineWidth=4;g.beginPath();g.arc(x,y,29,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x,y);g.lineTo(x+28*Math.cos(t/380),y+28*Math.sin(t/380));g.stroke()}
  if(row%4===3){g.fillStyle='#f6ba69';g.beginPath();g.moveTo(x-43,y+14);g.lineTo(x+43,y-14);g.lineTo(x+43,y+14);g.fill()}
 }
 const sorted=round.balls.slice().sort((a,b)=>round.progress(b,t)-round.progress(a,t));
 // Draw trailing balls first, so the frontrunner remains visible.
 for(const p of sorted.slice().reverse()){const q=point(round.progress(p,t));
  g.fillStyle=colors[p.n%5];g.beginPath();g.arc(q.x,q.y,13,0,Math.PI*2);g.fill();g.strokeStyle='#294d5d';g.lineWidth=2;g.stroke();g.fillStyle='#153c4c';g.font='900 13px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(p.n,q.x,q.y);g.textBaseline='alphabetic'}
 // A single start and a single finish, at opposite ends of the serpentine route.
 const finish=point(LENGTH);g.fillStyle='#db796c';g.fillRect(finish.x-28,finish.y-22,56,7);g.fillStyle='#295765';g.font='bold 18px system-ui';g.textAlign='center';g.fillText('GOAL',finish.x,finish.y+45);
 g.fillStyle='#315b65';g.fillRect(0,704,1200,56);g.fillStyle='#fff0b9';g.textAlign='left';g.font='bold 22px system-ui';g.fillText('先頭 '+sorted[0].n+'番　進行 '+Math.floor(round.progress(sorted[0],t))+' / '+Math.floor(LENGTH),28,740);
 g.textAlign='right';g.fillText(t>20000?'⚡ 最終ゲートで大逆転！':'40個が一本のコースで競争！',1170,740);
 if(t>=D){g.fillStyle='rgba(27,54,65,.96)';g.fillRect(245,268,710,173);g.strokeStyle='#f4d67c';g.lineWidth=5;g.strokeRect(245,268,710,173);g.fillStyle='#fff0ad';g.font='bold 52px system-ui';g.textAlign='center';g.fillText('🏆 '+round.winner.n+'番が最先着！',600,375)}
}
function tick(){const t=performance.now()-began,stage=t>20000?3:t>12000?2:t>4000?1:0;if(stage>lastCue){lastCue=stage;beep(420+stage*140,.13);setTimeout(()=>beep(630+stage*100,.12),140)}draw(t);$('clock').textContent=(Math.min(D,t)/1000).toFixed(1)+' / 27秒';$('meter').value=Math.min(D,t)/1000;$('status').textContent=t>20000?'⚡ 最終ゲート！ 誰が逆転する？':'⚙ 全員が一本の曲がりくねったコースを走行中';if(t<D)raf=requestAnimationFrame(tick);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner.n+'番が当選！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.23),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=make();lastCue=-1;draw(0);$('meter').value=0;$('clock').textContent='0.0 / 27秒';$('status').textContent='一本の蛇行コース：ドミノ → 坂道 → シーソー → 回転ゲート';$('result').textContent='最も先へ進む番号は？';$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(800)}began=performance.now();raf=requestAnimationFrame(tick)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(930)}};reset();