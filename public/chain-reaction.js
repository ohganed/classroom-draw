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
const DEVICES=Array.from({length:6},(_,i)=>cumulative[Math.min(cumulative.length-1,i*111+37)]);
const EFFECTS=['boost','brake','back','forward','boost','back'];
function make(){
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 const balls=Array.from({length:count},(_,id)=>({id,n:labels[id],speed:155+rnd(115),offset:id*13,events:[],frames:[]}));
 // Simulate each ball independently. Devices trigger only when it actually reaches their place.
 const DT=.05,steps=Math.ceil(27/DT);
 for(const p of balls){
  let distance=Math.max(0,40-p.offset),velocity=p.speed,boostEnd=0,brakeEnd=0;
  const used=new Set();
  p.frames.push(distance);
  for(let i=1;i<=steps;i++){
   const t=i*DT,rate=t<boostEnd?velocity*1.9:t<brakeEnd?velocity*.38:velocity;
   const previous=distance;distance=Math.min(LENGTH,distance+rate*DT);
   for(let k=0;k<DEVICES.length;k++){
    if(used.has(k)||previous>DEVICES[k]||distance<DEVICES[k])continue;
    used.add(k);
    // The mechanism determines how the ball moves, with its own reproducible outcome.
    let kind=EFFECTS[k];
    // Each ball gets its own outcome; some are boosted, some slowed, some sent backward or ahead.
    const variation=rnd(4);
    if(variation===0)kind='boost';
    if(variation===1)kind='brake';
    if(variation===2)kind='back';
    if(variation===3)kind='forward';
    let before=distance;
    if(kind==='boost')boostEnd=t+2.6;
    if(kind==='brake')brakeEnd=t+2.3;
    if(kind==='back')distance=Math.max(0,distance-(210+rnd(430)));
    if(kind==='forward')distance=Math.min(LENGTH,distance+(240+rnd(470)));
    p.events.push({t:t*1000,kind,at:DEVICES[k],from:before,to:distance,index:k});
   }
   p.frames.push(distance);
  }
 }
 function progress(p,t){const index=Math.max(0,Math.min(steps,t/(DT*1000)));const j=Math.floor(index),u=index-j;
  return p.frames[j]+((p.frames[Math.min(steps,j+1)]-p.frames[j])*u);
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
 const leadDist=Math.max(...round.balls.map(p=>round.progress(p,t)));
 const gadgetNames=['ドミノ連鎖','落下ハンマー','巨大シーソー','振り子ゲート','歯車連動','跳ね上げ台','ゴール鐘'];
 for(let row=0;row<ROWS;row++){
  const y=TOP+row*STEP,dir=row%2===0?1:-1;
  const milestone=DEVICES[Math.min(row,DEVICES.length-1)];
  const u=Math.max(0,Math.min(1,(leadDist-milestone)/155));
  const x=dir===1?550:640;
  g.fillStyle='#356678';g.font='bold 14px system-ui';g.textAlign='left';g.fillText((row+1)+' '+gadgetNames[row],25,y-29);
  // A ball arriving at the apparatus starts the next moving part.
  if(row===0){
   for(let k=0;k<12;k++){const phase=Math.max(0,Math.min(1,(u*12-k)/1.1));
    g.save();g.translate(x-120+k*22,y-21);g.rotate(dir*phase*1.25);
    g.fillStyle=phase>.9?'#d98f61':'#e9b964';g.fillRect(-6,-27,12,29);g.restore();}
   g.fillStyle='#597d9c';g.fillRect(x+145,y-39,12,40);
  }else if(row===1){
   const angle=u*.85;
   g.strokeStyle='#85676d';g.lineWidth=7;g.beginPath();g.moveTo(x,y-47);g.lineTo(x+Math.sin(angle)*70,y-47+Math.cos(angle)*53);g.stroke();
   g.fillStyle='#cf8a5d';g.fillRect(x+Math.sin(angle)*70-30,y-47+Math.cos(angle)*53-7,60,20);
   g.fillStyle='#f0c76d';g.fillRect(x-80,y+6,140,9);
  }else if(row===2){
   g.fillStyle='#846270';g.fillRect(x-5,y-13,10,32);
   g.save();g.translate(x,y-11);g.rotate((u-.25)*.35);
   g.fillStyle='#e6b26e';g.fillRect(-116,-10,232,18);
   g.fillStyle='#e4a0af';g.beginPath();g.arc(-86,-23,18,0,Math.PI*2);g.fill();
   g.restore();
  }else if(row===3){
   const angle=u?Math.sin(u*Math.PI*2)*.8:0;
   g.strokeStyle='#657b8d';g.lineWidth=6;g.beginPath();g.moveTo(x,y-48);g.lineTo(x+100*Math.sin(angle),y-48+100*Math.cos(angle));g.stroke();
   g.fillStyle='#f4bd65';g.beginPath();g.arc(x+100*Math.sin(angle),y-48+100*Math.cos(angle),23,0,Math.PI*2);g.fill();
  }else if(row===4){
   for(let k=0;k<3;k++){const cx=x+(k-1)*73;
    g.strokeStyle='#7394ab';g.lineWidth=7;g.beginPath();g.arc(cx,y-20,34,0,Math.PI*2);g.stroke();
    for(let j=0;j<8;j++){const v=j*Math.PI/4+u*Math.PI*(k%2?-2:2);g.strokeStyle='#d19b5b';g.lineWidth=8;g.beginPath();g.moveTo(cx+22*Math.cos(v),y-20+22*Math.sin(v));g.lineTo(cx+39*Math.cos(v),y-20+39*Math.sin(v));g.stroke();}
   }
  }else if(row===5){
   g.save();g.translate(x,y-5);g.rotate(-.4+u*.8);
   g.fillStyle='#6cb7b4';g.fillRect(-120,-10,240,20);
   g.fillStyle='#f6c15b';g.fillRect(-125,-22,20,16);g.restore();
   g.strokeStyle='#d88e6e';g.lineWidth=5;g.beginPath();g.moveTo(x-52,y+24);g.lineTo(x,y+44-u*18);g.lineTo(x+52,y+24);g.stroke();
  }else{
   g.strokeStyle='#6c8e99';g.lineWidth=5;g.beginPath();g.moveTo(x,y-48);g.lineTo(x,y-2);g.stroke();
   g.fillStyle=u>.5?'#ffd86a':'#b5c8cf';g.beginPath();g.arc(x,y-3,36,Math.PI,0);g.lineTo(x+36,y+3);g.lineTo(x-36,y+3);g.closePath();g.fill();
   if(u>.5){g.fillStyle='#e9a85d';g.font='bold 20px system-ui';g.textAlign='center';g.fillText('♪',x+60,y-27)}
  }
  // Transfer rails and colorful mechanisms make the course visually dense.
  g.fillStyle='#df9980';g.fillRect(dir===1?105:1000,y-17,75,5);
  g.fillStyle=u>0?'#89cfa3':'#d5bea3';g.beginPath();g.arc(dir===1?195:987,y-14,8,0,Math.PI*2);g.fill();
 }
 // Mechanism consequences are visible above the exact ball they affect.
 const activeEvents=round.balls.flatMap(p=>p.events.filter(e=>t>=e.t&&t<e.t+1050).map(e=>({p,e})));
 for(const {p,e} of activeEvents){const q=point(round.progress(p,t));
  const labels={boost:'加速 ▶▶',brake:'減速 ▪',back:'↶ 後戻り',forward:'≫ 大ジャンプ'};
  g.fillStyle=e.kind==='back'?'#d65f5d':e.kind==='brake'?'#8a718e':'#2f9675';
  g.fillRect(q.x-54,q.y-43,108,22);g.textAlign='center';g.fillStyle='#fff';g.font='bold 13px system-ui';
  g.fillText(labels[e.kind],q.x,q.y-27);
  if(e.kind==='back'||e.kind==='forward'){const from=point(e.from),to=point(e.to);
   g.strokeStyle=e.kind==='back'?'#d65f5d':'#4fbb89';g.lineWidth=3;g.setLineDash([7,5]);
   g.beginPath();g.moveTo(from.x,from.y);g.lineTo(to.x,to.y);g.stroke();g.setLineDash([])}
 }
 const sorted=round.balls.slice().sort((a,b)=>round.progress(b,t)-round.progress(a,t));
 // Draw trailing balls first, so the frontrunner remains visible.
 for(const p of sorted.slice().reverse()){const q=point(round.progress(p,t));
  g.fillStyle=colors[p.n%5];g.beginPath();g.arc(q.x,q.y,23,0,Math.PI*2);g.fill();g.strokeStyle='#294d5d';g.lineWidth=2.5;g.stroke();g.fillStyle='#153c4c';g.font='900 26px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(p.n,q.x,q.y);g.textBaseline='alphabetic'}
 // A single start and a single finish, at opposite ends of the serpentine route.
 const finish=point(LENGTH);g.fillStyle='#db796c';g.fillRect(finish.x-28,finish.y-22,56,7);g.fillStyle='#295765';g.font='bold 18px system-ui';g.textAlign='center';g.fillText('GOAL',finish.x,finish.y+45);
 g.fillStyle='#315b65';g.fillRect(0,704,1200,56);g.fillStyle='#fff0b9';g.textAlign='left';g.font='bold 22px system-ui';g.fillText('先頭 '+sorted[0].n+'番　進行 '+Math.floor(round.progress(sorted[0],t))+' / '+Math.floor(LENGTH),28,740);
 g.textAlign='right';g.fillText(t>20000?'⚡ 最終ゲートで大逆転！':'40個が一本のコースで競争！',1170,740);
 if(t>=D){g.fillStyle='rgba(27,54,65,.96)';g.fillRect(245,268,710,173);g.strokeStyle='#f4d67c';g.lineWidth=5;g.strokeRect(245,268,710,173);g.fillStyle='#fff0ad';g.font='bold 52px system-ui';g.textAlign='center';g.fillText('🏆 '+round.winner.n+'番が最先着！',600,375)}
}
function tick(){const t=performance.now()-began,stage=t>20000?3:t>12000?2:t>4000?1:0;if(stage>lastCue){lastCue=stage;beep(420+stage*140,.13);setTimeout(()=>beep(630+stage*100,.12),140)}draw(t);$('clock').textContent=(Math.min(D,t)/1000).toFixed(1)+' / 27秒';$('meter').value=Math.min(D,t)/1000;$('status').textContent=t>20000?'⚡ 後戻り・先送りで順位が激変！':'⚙ 仕掛けで加速・減速・後戻り・先送り！';if(t<D)raf=requestAnimationFrame(tick);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner.n+'番が当選！';[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.23),i*150))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=make();lastCue=-1;draw(0);$('meter').value=0;$('clock').textContent='0.0 / 27秒';$('status').textContent='一本の蛇行コース：ドミノ → 坂道 → シーソー → 回転ゲート';$('result').textContent='最も先へ進む番号は？';$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(800)}began=performance.now();raf=requestAnimationFrame(tick)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(930)}};reset();