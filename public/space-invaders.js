// Original retro fixed-screen fleet draw. The app chooses the winner uniformly.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const colors=['#8fe3c0','#e8a1d5','#f3cf75','#85c2ff','#f28c8c'];
export function makeInvadersRound(count,winner,seed){
 let state=seed>>>0||1;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const order=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=order.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 const defeated=new Map(order.map((n,i)=>[n,1.3+9.3*(i+.5)/Math.max(1,order.length)]));
 const aliens=Array.from({length:count},(_,i)=>({n:i+1,column:i%8,row:Math.floor(i/8),color:i%colors.length,defeat:defeated.get(i+1)??Infinity,drift:rand()*6}));
 return {winner,count,aliens,seed:rand()*100};
}
export function drawInvaders(canvas,round,elapsed=0,duration=12500,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const sec=clamp(elapsed/1000,0,12.5), t=sec/12.5;
 c.fillStyle='#070b1b';c.fillRect(0,0,600,480);
 for(let i=0;i<66;i++){const x=(i*137+13)%600,y=(i*71+29)%450;c.fillStyle=i%4?'#62749b':'#c9d5eb';c.fillRect(x,y,1.5,1.5);}
 c.textAlign='center';c.fillStyle='#f6da8b';c.font='bold 21px Arial';c.fillText('40人の宇宙侵略者',300,31);
 if(!round)return;
 c.strokeStyle='#3e79a5';c.lineWidth=3;c.beginPath();c.moveTo(46,397);c.lineTo(554,397);c.stroke();
 // Sweep laser from a visible base cannon toward one of the disappearing ships.
 const targets=round.aliens.filter(a=>a.defeat!==Infinity&&Math.abs(a.defeat-sec)<.18);
 const cannonX=300+175*Math.sin(sec*1.2);
 const wave=30*Math.sin(sec*2.6),bob=sec*2.0;
 const position=a=>({x:94+a.column*58+wave,y:73+a.row*47+bob});
 if(targets.length){const q=position(targets[0]);c.strokeStyle='#f3da81';c.lineWidth=3;c.beginPath();c.moveTo(cannonX,396);c.lineTo(q.x,q.y);c.stroke();}
 c.fillStyle='#75d9ee';c.fillRect(cannonX-18,402,36,14);c.fillRect(cannonX-5,391,10,12);
 let alive=0;
 for(const a of round.aliens){
  const p=position(a),d=sec-a.defeat;
  if(d>0.25)continue;
  if(d>=0){
   for(let k=0;k<9;k++){const ang=k*Math.PI*2/9,rr=d*95;c.fillStyle=k%2?'#fff4a7':'#f29a6b';c.fillRect(p.x+Math.cos(ang)*rr-3,p.y+Math.sin(ang)*rr-3,6,6);}
   continue;
  }
  alive++;
  c.save();c.translate(p.x,p.y);c.fillStyle=colors[a.color];
  // Pixel-sprite silhouette with large, high-contrast number.
  c.fillRect(-19,-12,38,24);c.fillRect(-14,-18,28,6);c.fillRect(-23,-5,4,13);c.fillRect(19,-5,4,13);c.fillRect(-16,12,6,5);c.fillRect(10,12,6,5);
  c.fillStyle='#101b32';c.font='900 15px Arial';c.textBaseline='middle';c.fillText(a.n,0,1);c.restore();
 }
 c.fillStyle='#e7ebf8';c.font='bold 16px Arial';c.fillText('残り '+alive+'機',300,442);
 if(t>.87){c.fillStyle='#ffdf82';c.font='900 30px Arial';c.fillText(round.winner+'番、生き残った！',300,376);}
 c.fillStyle='#9ee1fa';c.font='13px Arial';c.fillText('左右に行進する宇宙艦隊を迎撃！',300,465);
}
export function playInvadersSound(ctx,master,beat){
 if(!ctx||ctx.state!=='running'||!master)return;
 const t=ctx.currentTime+.005,o=ctx.createOscillator(),g=ctx.createGain();
 o.type='square';o.frequency.setValueAtTime(125+[0,25,42,13][beat%4],t);o.frequency.exponentialRampToValueAtTime(68,t+.11);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.055,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+.15);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+.16);o.onended=()=>{o.disconnect();g.disconnect();};
}
