const $=id=>document.getElementById(id),cv=$('game'),g=cv.getContext('2d'),D=25000;
let count=40,round,raf=0,started=0,sound=false,ctx=null,lastDrop=0;
function rnd(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const palette=['#ffde56','#ff83c7','#6effe9','#ae94ff','#ff9977','#92ed75'];
// Build a deterministic contact simulation before randomly assigning visible numbers.
function build(){
 const slots=shuffle(Array.from({length:40},(_,i)=>i)).slice(0,count);
 const coins=Array.from({length:count},(_,i)=>{const slot=slots[i];return {id:i,x:249+slot%10*77+(rnd(9)-4),y:223+Math.floor(slot/10)*67+(rnd(9)-4),vy:0,dead:false,dropFrame:-1};});
 const frames=[],alive=new Set(coins.map(p=>p.id)),r=34;
 let plate=177,oldPlate=177;
 // Stronger strokes as the tray empties, but never move a coin without contact.
 for(let frame=0;frame<7000&&alive.size>1;frame++){
  const cycle=frame%86,forward=cycle<52,stroke=cycle/52;
  plate=forward?177+Math.min(1,stroke)*310:487-(cycle-52)/34*310;
  const speed=Math.max(0,plate-oldPlate);
  const power=1+Math.floor(frame/600)*.08;
  if(forward&&speed>0)for(const p of coins){
   if(p.dead)continue;
   if(p.x>128&&p.x<1072&&p.y-r<=plate+4&&p.y+r>=plate-12){
    // A pusher can advance only a small distance into a coin each step.
    p.y=Math.max(p.y,Math.min(plate+r+2,p.y+7));p.vy=Math.max(p.vy,Math.min(7,speed*power));
   }
  }
  // Contacts transmit displacement from one numbered coin to adjacent coins.
  for(let k=0;k<3;k++)for(let i=0;i<coins.length;i++){
   const p=coins[i];if(p.dead)continue;
   for(let j=i+1;j<coins.length;j++){const q=coins[j];if(q.dead)continue;
    let dx=q.x-p.x,dy=q.y-p.y,dist=Math.hypot(dx,dy)||.001;
    if(dist<r*1.72){const over=(r*1.72-dist)*.53,nx=dx/dist,ny=dy/dist;
     p.x-=nx*over;q.x+=nx*over;p.y-=ny*over;q.y+=ny*over;
     const v=(p.vy+q.vy)*.5;p.vy=Math.max(p.vy,v*.85);q.vy=Math.max(q.vy,v*.85);
    }
   }
  }
  for(const p of coins){if(p.dead)continue;
   p.y+=p.vy*.72;p.vy*=.73;
   p.x=Math.max(143,Math.min(1057,p.x));
   // A coin falls only when its centre crosses the FRONT rim, not because a timer expires.
   if(p.y>620){p.dead=true;p.dropFrame=frame;alive.delete(p.id);}
  }
  if(frame%3===0||alive.size===1)frames.push({plate,coins:coins.map(p=>[p.x,p.y,p.dead])});
  oldPlate=plate;
 }
 // The last coin on the physical board wins. Names are assigned after simulation.
 let survivor;
 // Final stronger mechanical push: advance the actual plate, then resolve coin contact.
 // No coin is removed without crossing the visible front edge.
 if(alive.size>1){
  for(let extra=0;extra<340&&alive.size>1;extra++){
   plate=Math.min(650,487+extra*1.8);
   for(const p of coins){if(p.dead)continue;
    if(p.y-34<=plate+2 && p.y+34>=plate-12){
     p.y=Math.max(p.y,Math.min(plate+36,p.y+7));
     p.vy=Math.max(p.vy,3.8);
    }
   }
   for(let iteration=0;iteration<3;iteration++)for(let i=0;i<coins.length;i++){
    const p=coins[i];if(p.dead)continue;
    for(let j=i+1;j<coins.length;j++){const q=coins[j];if(q.dead)continue;
     const dx=q.x-p.x,dy=q.y-p.y,dist=Math.hypot(dx,dy)||.001;
     if(dist<58){const shift=(58-dist)*.48;p.x-=dx/dist*shift;q.x+=dx/dist*shift;p.y-=dy/dist*shift;q.y+=dy/dist*shift;}
    }
   }
   for(const p of coins){if(p.dead)continue;p.y+=p.vy*.65;p.vy*=.68;
    if(p.y>620){p.dead=true;p.dropFrame=7000+extra;alive.delete(p.id);}
   }
   frames.push({plate,coins:coins.map(p=>[p.x,p.y,p.dead])});
  }
 }
 survivor=alive.size?[...alive][0]:coins.reduce((a,b)=>a.dropFrame>b.dropFrame?a:b).id;
 if(alive.size===0){const coin=coins[survivor];coin.dead=false;coin.y=580;const last=frames[frames.length-1];last.coins[survivor]=[coin.x,coin.y,false];}
 // Shuffle the numbered medals independently from their random physical slots.
 const labels=shuffle(Array.from({length:count},(_,i)=>i+1));
 const people=coins.map(p=>({id:p.id,n:labels[p.id]}));
 return {people,frames,winner:labels[survivor],survivor};
}
function note(f,d=.10,vol=.12,type='triangle'){if(!sound||!ctx)return;try{const t=ctx.currentTime,o=ctx.createOscillator(),a=ctx.createGain();o.type=type;o.frequency.value=f;a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(vol,t+.008);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(ctx.destination);o.start(t);o.stop(t+d+.02)}catch{}}
function medal(p,x,y,r,alpha=1){g.save();g.globalAlpha=alpha;g.shadowBlur=14;g.shadowColor=palette[p.n%palette.length];g.fillStyle=palette[p.n%palette.length];g.beginPath();g.ellipse(x,y,r,r*.76,0,0,Math.PI*2);g.fill();g.shadowBlur=0;g.lineWidth=5;g.strokeStyle='#fff8bb';g.stroke();g.lineWidth=2;g.strokeStyle='#7d3486';g.beginPath();g.ellipse(x,y,r-7,(r-7)*.76,0,0,Math.PI*2);g.stroke();g.fillStyle='#241341';g.textAlign='center';g.textBaseline='middle';g.font='900 23px system-ui';g.fillText(p.n,x,y);g.restore()}
function render(ms){
 const t=Math.min(D,ms),idx=Math.min(round.frames.length-1,Math.floor(t/D*(round.frames.length-1))),snap=round.frames[idx],strong=t>17400;
 g.fillStyle='#150d2b';g.fillRect(0,0,1200,760);
 g.textAlign='center';g.fillStyle='#ffe77c';g.font='bold 35px system-ui';g.fillText('✦ NEON MEDAL FEVER ✦',600,46);
 g.fillStyle='#fd65ce';g.fillRect(86,78,1028,18);g.fillStyle='#56ffff';g.fillRect(86,630,1028,16);
 g.fillStyle='#333568';g.fillRect(100,96,1000,525);g.strokeStyle='#ffb8f1';g.lineWidth=9;g.strokeRect(100,96,1000,525);
 for(let i=0;i<10;i++){g.fillStyle=i%2?'#4b347c':'#2f396d';g.fillRect(110+i*98,106,95,500)}
 // The front edge of this pusher is the exact collision boundary used by the simulation.
 g.fillStyle='#6753a6';g.fillRect(114,Math.max(97,snap.plate-90),972,90);
 g.strokeStyle='#ffb5e6';g.lineWidth=5;g.strokeRect(114,Math.max(97,snap.plate-90),972,90);
 g.textAlign='center';g.font='bold 27px system-ui';g.fillStyle='#ffffff';g.fillText('⇣ PUSH ⇣',600,Math.max(126,snap.plate-40));
 let living=0;
 for(const p of round.people){const state=snap.coins[p.id];if(state[2])continue;living++;medal(p,state[0],state[1],35)}
 if(strong&&t<D){g.fillStyle='#ffe282';g.font='bold 29px system-ui';g.fillText('🔥 SUPER PUSH! 連鎖押し出し！',600,687)}
 g.fillStyle='#f9e5ff';g.textAlign='left';g.font='bold 29px system-ui';g.fillText('残り '+living+' / '+count,102,706);
 if(t>=D){g.fillStyle='rgba(20,7,42,.91)';g.fillRect(258,268,684,170);g.strokeStyle='#fff07e';g.lineWidth=5;g.strokeRect(258,268,684,170);g.fillStyle='#ffe577';g.textAlign='center';g.font='bold 62px system-ui';g.fillText('🏆 '+round.winner+'番が優勝！',600,373)}
}
function frame(){const t=performance.now()-started,frameIndex=Math.min(round.frames.length-1,Math.floor(Math.min(D,t)/D*(round.frames.length-1))),fallen=round.frames[frameIndex].coins.filter(p=>p[2]).length;if(fallen>lastDrop){note(270+rnd(270),.13,.13);lastDrop=fallen}render(t);$('clock').textContent=(Math.min(t,D)/1000).toFixed(1)+' / 25秒';$('meter').value=Math.min(25,t/1000);$('status').textContent=t>17400?'🔥 SUPER PUSH! 最後の大逆転！':'🪙 押し板がメダルを押し出しています';if(t<D)raf=requestAnimationFrame(frame);else{$('start').disabled=false;$('result').textContent='🏆 '+round.winner+'番が最後まで残った！';[523,659,784,1047].forEach((n,i)=>setTimeout(()=>note(n,.23,.16),i*145))}}
function reset(){cancelAnimationFrame(raf);count=Math.max(1,Math.min(40,Number($('count').value)||40));$('count').value=count;round=build();lastDrop=0;render(0);$('start').disabled=false;$('clock').textContent='0.0 / 25秒';$('meter').value=0;const initial=round.frames[0].coins;const row=round.people.map(p=>({n:p.n,x:initial[p.id][0],y:initial[p.id][1]})).sort((a,b)=>a.y-b.y||a.x-b.x).slice(0,10).sort((a,b)=>a.x-b.x);
 $('status').textContent='🎲 上段の番号（左から）：'+row.map(p=>p.n).join('・')+' ／ 並べ直すたびに変化';$('result').textContent='最後まで残るのは何番？'}
$('start').onclick=()=>{reset();$('start').disabled=true;if(sound){ctx??=new(window.AudioContext||window.webkitAudioContext)();ctx.resume();note(700,.12)}started=performance.now();raf=requestAnimationFrame(frame)};
$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){ctx??=new(window.AudioContext||window.webkitAudioContext)();ctx.resume();note(880,.12)}};reset();
