const $=id=>document.getElementById(id),cv=$('game'),c=cv.getContext('2d'),D=25000;
const board={x:90,y:105,w:1020,h:540},N=40;let count=40,round,raf=0,started=0,sound=false,audio=null,last=-1;
const random=n=>{const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
function make(){const spots=shuffle(Array.from({length:10*6},(_,i)=>i)).slice(0,count).map(i=>({x:i%10,y:Math.floor(i/10)}));
let active=spots.map((_,i)=>i),bounds={x0:0,x1:10,y0:0,y1:6},steps=[];
while(active.length>1){
 let options=[];
 for(const axis of ['x','y']){
 const lo=axis==='x'?bounds.x0:bounds.y0,hi=axis==='x'?bounds.x1:bounds.y1;
 for(let cut=lo+1;cut<hi;cut++){
  const a=active.filter(i=>spots[i][axis]<cut),b=active.filter(i=>spots[i][axis]>=cut);
  if(a.length&&b.length)options.push({axis,cut,a,b});
 }
 }
 if(!options.length)break;
 const choice=options[random(options.length)],keepFirst=random(2)===0;
 const removed=keepFirst?choice.b:choice.a,remaining=keepFirst?choice.a:choice.b;
 const next={...bounds};
 if(choice.axis==='x'){if(keepFirst)next.x1=choice.cut;else next.x0=choice.cut}
 else {if(keepFirst)next.y1=choice.cut;else next.y0=choice.cut}
 steps.push({before:bounds,after:next,axis:choice.axis,cut:choice.cut,removed});
 bounds=next;active=remaining;
}
const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
const people=spots.map((p,i)=>({...p,n:labels[i]}));
return {people,steps,winner:labels[active[0]],end:bounds};
}
function beep(freq,len=.12,vol=.10){if(!sound||!audio)return;const t=audio.currentTime,o=audio.createOscillator(),a=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.63,t+len);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(vol,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(a);a.connect(audio.destination);o.start(t);o.stop(t+len+.02)}
function rect(b){return {x:board.x+b.x0*board.w/10,y:board.y+b.y0*board.h/6,w:(b.x1-b.x0)*board.w/10,h:(b.y1-b.y0)*board.h/6}}
function render(ms){const t=Math.min(D,ms),steps=round.steps,pace=21000/Math.max(1,steps.length),position=Math.min(steps.length,Math.floor(Math.max(0,t-1500)/pace)),phase=Math.max(0,Math.min(1,((t-1500)/pace)-position));let bounds={x0:0,x1:10,y0:0,y1:6};const dead=new Set();for(let i=0;i<position;i++){steps[i].removed.forEach(n=>dead.add(n));bounds=steps[i].after}
c.fillStyle='#091b2c';c.fillRect(0,0,1200,750);c.textAlign='center';c.fillStyle='#dcfaff';c.font='bold 31px system-ui';c.fillText('✏️ 陣取り大作戦',600,52);
const area=rect(bounds);c.fillStyle='#172c43';c.fillRect(board.x,board.y,board.w,board.h);c.fillStyle='#204d5e';c.fillRect(area.x,area.y,area.w,area.h);
for(let y=0;y<6;y++)for(let x=0;x<10;x++){c.strokeStyle='rgba(128,220,226,.14)';c.strokeRect(board.x+x*102,board.y+y*90,102,90)}
if(position<steps.length&&t>=1500){const s=steps[position],r=rect(s.before),cutPos=s.axis==='x'?board.x+s.cut*102:board.y+s.cut*90;const p=phase;const x=s.axis==='x'?cutPos:r.x, y=s.axis==='x'?r.y:cutPos;
c.strokeStyle='#75ffee';c.lineWidth=7;c.beginPath();c.moveTo(x,y);c.lineTo(s.axis==='x'?x:r.x+r.w*p,s.axis==='x'?r.y+r.h*p:y);c.stroke();
if(p>.75){const gone=rect({x0:s.after.x0===s.before.x0?s.cut:s.before.x0,x1:s.after.x1===s.before.x1?s.cut:s.before.x1,y0:s.after.y0===s.before.y0?s.cut:s.before.y0,y1:s.after.y1===s.before.y1?s.cut:s.before.y1});if(gone.w>0&&gone.h>0){c.fillStyle='rgba(250,116,110,'+((p-.75)*1.7)+')';c.fillRect(gone.x,gone.y,gone.w,gone.h)}}}
for(let i=0;i<round.people.length;i++){if(dead.has(i))continue;const p=round.people[i],x=board.x+(p.x+.5)*102,y=board.y+(p.y+.5)*90; c.fillStyle=['#ffbbca','#a5e9fd','#d5bdff','#b0e7b2'][i%4];c.beginPath();c.arc(x,y,28,0,Math.PI*2);c.fill();c.strokeStyle='#152236';c.lineWidth=3;c.stroke();c.fillStyle='#14243a';c.font='900 25px system-ui';c.textBaseline='middle';c.fillText(p.n,x,y+1)}
c.textBaseline='alphabetic';c.textAlign='left';c.fillStyle='#fce8a6';c.font='bold 27px system-ui';c.fillText('残り '+(count-dead.size)+' / '+count,91,704);
if(t>=D){c.fillStyle='rgba(7,22,35,.91)';c.fillRect(285,280,630,150);c.strokeStyle='#ffe393';c.lineWidth=4;c.strokeRect(285,280,630,150);c.textAlign='center';c.fillStyle='#ffe5a2';c.font='bold 56px system-ui';c.fillText('🏆 '+round.winner+'番が勝利！',600,376)}
}
function frame(){const ms=performance.now()-started,cut=Math.min(round.steps.length,Math.floor(Math.max(0,ms-1500)/(21000/Math.max(1,round.steps.length))));if(cut>last){beep(240,.18,.14);last=cut}render(ms);$('clock').textContent=(Math.min(D,ms)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,ms/1000);$('status').textContent=ms>17000?'⚡ 終盤！ 怒涛の連続分断！':'✏️ 線が完成すると片側の番号が脱落！';if(ms<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が最後まで残った！';[523,659,784,1047].forEach((n,i)=>setTimeout(()=>beep(n,.19,.14),i*160))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=make();last=-1;render(0);$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('start').disabled=false;$('status').textContent='線が閉じると、切り取られた領域の番号が脱落します';$('result').textContent='最後の1人は何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();beep(780)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();beep(900)}};reset();
