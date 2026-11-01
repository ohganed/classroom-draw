const $=id=>document.getElementById(id),cv=$('game'),g=cv.getContext('2d'),D=25000;
let count=40,round,raf=0,started=0,sound=false,ctx=null,lastDrop=0;
function rnd(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const palette=['#ffde56','#ff83c7','#6effe9','#ae94ff','#ff9977','#92ed75'];
function build(){const winner=rnd(count)+1,losers=shuffle(Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner));const dropTimes=new Map(losers.map((n,i)=>[n,2700+(i+1)*18200/Math.max(1,losers.length)]));const people=Array.from({length:count},(_,i)=>{const n=i+1;return {n,x:185+(i%10)*91+(rnd(19)-9),y:208+Math.floor(i/10)*76+(rnd(20)-10),drop:dropTimes.get(n)??Infinity,phase:rnd(360)}});return {winner,people}}
function note(f,d=.10,vol=.12,type='triangle'){if(!sound||!ctx)return;try{const t=ctx.currentTime,o=ctx.createOscillator(),a=ctx.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(vol,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(ctx.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function medal(p,x,y,r,alpha=1){g.save();g.globalAlpha=alpha;g.shadowBlur=14;g.shadowColor=palette[p.n%palette.length];g.fillStyle=palette[p.n%palette.length];g.beginPath();g.ellipse(x,y,r,r*.76,0,0,Math.PI*2);g.fill();g.shadowBlur=0;g.lineWidth=5;g.strokeStyle='#fff8bb';g.stroke();g.lineWidth=2;g.strokeStyle='#7d3486';g.beginPath();g.ellipse(x,y,r-7,(r-7)*.76,0,0,Math.PI*2);g.stroke();g.fillStyle='#241341';g.textAlign='center';g.textBaseline='middle';g.font='900 23px system-ui';g.fillText(p.n,x,y);g.restore()}
function render(ms){const t=Math.min(D,ms),push=Math.sin(t/400),strong=t>17400;
g.fillStyle='#150d2b';g.fillRect(0,0,1200,760);g.textAlign='center';g.fillStyle='#ffe77c';g.font='bold 35px system-ui';g.fillText('✦ NEON MEDAL FEVER ✦',600,46);
g.fillStyle='#fd65ce';g.fillRect(86,78,1028,18);g.fillStyle='#56ffff';g.fillRect(86,630,1028,16);
g.fillStyle='#333568';g.fillRect(100,96,1000,525);g.strokeStyle='#ffb8f1';g.lineWidth=9;g.strokeRect(100,96,1000,525);
for(let i=0;i<10;i++){g.fillStyle=i%2?'#4b347c':'#2f396d';g.fillRect(110+i*98,106,95,500)}
g.fillStyle='#6753a6';g.fillRect(114,97+push*24,972,91);g.strokeStyle='#ffb5e6';g.lineWidth=5;g.strokeRect(114,97+push*24,972,91);
g.textAlign='center';g.font='bold 27px system-ui';g.fillStyle='#ffffff';g.fillText('⇣ PUSH ⇣',600,151+push*24);
const living=round.people.filter(p=>t<p.drop).length;
for(const p of round.people){const passed=t-p.drop,falling=passed>=0&&passed<550;if(passed>=550)continue;
const progress=Math.min(1,t/21000),pull=(t/30000)*105;
let x=p.x+Math.sin(t/520+p.phase)*9, y=p.y+pull+Math.max(0,push)*13;
if(p.drop!==Infinity){const until=p.drop-t;if(until<1800&&until>0)y+=((1800-until)/1800)*Math.max(0,566-y);if(falling){y=568+(passed/550)*195;x+=Math.sin(passed/100)*12}}
else {y=Math.min(455,y)}
medal(p,x,y,35,falling?Math.max(0,1-passed/600):1);
}
if(strong&&t<D){g.fillStyle='#ffe282';g.font='bold 29px system-ui';g.fillText('🔥 SUPER PUSH! 一斉押し出し！',600,687)}
g.fillStyle='#f9e5ff';g.textAlign='left';g.font='bold 29px system-ui';g.fillText('残り '+living+' / '+count,102,706);
if(t>=D){g.fillStyle='rgba(20,7,42,.91)';g.fillRect(258,268,684,170);g.strokeStyle='#fff07e';g.lineWidth=5;g.strokeRect(258,268,684,170);g.fillStyle='#ffe577';g.textAlign='center';g.font='bold 62px system-ui';g.fillText('🏆 '+round.winner+'番が優勝！',600,373)}
}
function frame(){const t=performance.now()-started,fallen=round.people.filter(p=>p.drop<=t).length;if(fallen>lastDrop){note(270+rnd(270),.13,.13);lastDrop=fallen}render(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,t/1000);$('status').textContent=t>17400?'🔥 SUPER PUSH! 最後の大逆転！':'🪙 押し板がメダルを押し出しています';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が最後まで残った！';[523,659,784,1047].forEach((n,i)=>setTimeout(()=>note(n,.23,.16),i*145))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=build();lastDrop=0;render(0);$('start').disabled=false;$('clock').textContent='0.0 / 25秒';$('meter').value=0;$('status').textContent='✨ メダルを押し出そう！';$('result').textContent='最後まで残るのは何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){ctx??=new(window.AudioContext||window.webkitAudioContext)();ctx.resume();note(700,.12)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){ctx??=new(window.AudioContext||window.webkitAudioContext)();ctx.resume();note(880,.12)}};reset();
