const $=id=>document.getElementById(id),ctx=$('game').getContext('2d'),D=25000;
let count=40,round,raf=0,started=0,sound=false,audio=null,lastWave=-1;
function rand(n){let x=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(x)}while(x[0]>=lim);return x[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function build(){
 const entrants=Array.from({length:count},(_,id)=>({id,lane:Math.floor(id/8),row:id%8,speed:15+rand(30)/10,base:70+rand(100),warp:[]}));
 const waves=[7000,15500,21300];
 for(let w=0;w<waves.length;w++){
  const order=shuffle([...entrants]);
  for(let i=0;i<order.length;i++){
   const p=order[i],t=waves[w]+Math.floor(i/5)*280;
   const delta=w===2?rand(330)-125:rand(260)-105;
   p.warp.push({t,delta});
  }
 }
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 for(const p of entrants)p.n=labels[p.id];
 const position=(p,t)=>p.base+p.speed*t/1000+p.warp.reduce((sum,w)=>sum+(t>=w.t+500?w.delta:0),0);
 let winner=entrants[0];for(const p of entrants)if(position(p,D)>position(winner,D))winner=p;
 return {people:entrants,winner:winner.n,position,waves};
}
function soundAt(f,d=.13,type='sine',v=.12){if(!sound||!audio)return;try{const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function render(time){
 const t=Math.min(D,time),ctx2=ctx;
 ctx2.fillStyle='#83c8ed';ctx2.fillRect(0,0,1200,760);
 for(let i=0;i<14;i++){const x=(i*131+60)%1200;ctx2.fillStyle='#e6f8ff';ctx2.beginPath();ctx2.ellipse(x,60+i%3*45,46,16,0,0,7);ctx2.fill()}
 ctx2.font='bold 31px system-ui';ctx2.textAlign='center';ctx2.fillStyle='#233c76';ctx2.fillText('PIPE WARP RACE  •  EPISODE 01',600,52);
 // Five independently readable racing floors, eight competitors per floor.
 for(let lane=0;lane<5;lane++){const y=157+lane*114;ctx2.fillStyle=lane%2?'#d1edce':'#b7e3b7';ctx2.fillRect(38,y-52,1124,105);ctx2.fillStyle='#647d56';ctx2.fillRect(38,y+48,1124,7);ctx2.fillStyle='#33556d';ctx2.font='bold 17px system-ui';ctx2.textAlign='left';ctx2.fillText('COURSE '+(lane+1),48,y-35)}
 for(const p of round.people){
  const y=157+p.lane*114+(p.row%4-1.5)*21,x0=round.position(p,t),warp=p.warp.find(w=>t>=w.t&&t<w.t+500);
  // Shared camera follows race progress so reversals remain visible.
  const x=Math.max(62,Math.min(1133,80+x0*1.06));
  if(warp){
   const u=(t-warp.t)/500,exitX=Math.max(62,Math.min(1133,80+(x0+warp.delta)*1.06));
   const pipeX=u<.5?x:exitX,pipeY=y+20;
   ctx2.fillStyle='#18874f';ctx2.fillRect(pipeX-30,pipeY-3,60,38);ctx2.fillStyle='#48d383';ctx2.fillRect(pipeX-38,pipeY-10,76,15);
   ctx2.fillStyle='#183f56';ctx2.font='bold 15px system-ui';ctx2.textAlign='center';ctx2.fillText(u<.5?'IN':'OUT',pipeX,pipeY+27);
   if(u>.25&&u<.75)continue;
  }
  let drawX=x,drawY=y;
  if(warp&&t-warp.t>=375)drawX=Math.max(62,Math.min(1133,80+(x0+warp.delta)*1.06));
  const jump=warp?Math.sin(Math.PI*Math.min(1,(t-warp.t)/500))*13:Math.abs(Math.sin(t/240+p.id*.6))*5;
  drawY-=jump;
  ctx2.fillStyle=['#ffafc8','#c4f3a8','#e9c6ff','#ffdc8c','#a2e6ff'][p.n%5];
  ctx2.beginPath();ctx2.arc(drawX,drawY,16,0,7);ctx2.fill();ctx2.strokeStyle='#26445c';ctx2.lineWidth=2;ctx2.stroke();
  ctx2.fillStyle='#17384c';ctx2.font='900 15px system-ui';ctx2.textAlign='center';ctx2.textBaseline='middle';ctx2.fillText(p.n,drawX,drawY);ctx2.textBaseline='alphabetic';
 }
 ctx2.fillStyle='rgba(20,46,75,.89)';ctx2.fillRect(0,707,1200,53);ctx2.textAlign='left';ctx2.fillStyle='#ffe894';ctx2.font='bold 24px system-ui';ctx2.fillText(t>20200?'⚡ 最後のワープ！ 誰が逆転する？':'🟢 土管に入ると別の場所へワープ！',38,741);
 if(t>=D){ctx2.fillStyle='rgba(17,32,62,.93)';ctx2.fillRect(245,262,710,175);ctx2.strokeStyle='#ffe693';ctx2.lineWidth=4;ctx2.strokeRect(245,262,710,175);ctx2.font='bold 57px system-ui';ctx2.fillStyle='#ffe693';ctx2.textAlign='center';ctx2.fillText('🏆 '+round.winner+'番が大逆転！',600,366)}
}
function tick(){const t=performance.now()-started;const wave=round.waves.filter(x=>x<=t).length-1;if(wave>lastWave){lastWave=wave;soundAt(300,.18,'triangle');setTimeout(()=>soundAt(680,.18,'triangle'),170)}render(t);$('meter').value=Math.min(D,t)/1000;$('clock').textContent=(Math.min(D,t)/1000).toFixed(1)+' / 25秒';$('status').textContent=t>20000?'⚡ 最後の土管ワープで大逆転！':'🟢 番号はそのまま、土管の出口だけが変化！';if(t<D)raf=requestAnimationFrame(tick);else{$('start').disabled=false;$('result').textContent='🏆 勝者：'+round.winner+'番！';[520,660,780,1040].forEach((f,i)=>setTimeout(()=>soundAt(f,.24,'triangle'),i*140))}}
function reset(){cancelAnimationFrame(raf);count=Math.min(40,Math.max(1,Number($('count').value)||40));$('count').value=count;round=build();lastWave=-1;render(0);$('meter').value=0;$('clock').textContent='0.0 / 25秒';$('status').textContent='🏁 全員スタート！ 土管の出口は毎回変わる';$('result').textContent='誰が一番遠くまで進む？';$('start').disabled=false}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();soundAt(820)}started=performance.now();raf=requestAnimationFrame(tick)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();soundAt(900)}};reset();