// Original retro platform finale. Fair winner is selected by the host, not physics.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),sm=x=>{x=cl(x);return x*x*(3-2*x)};
export function makeCastleRound(count,winner,seed){
 let z=seed>>>0||1,r=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
 const other=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=other.length-1;i>0;i--){let k=Math.floor(r()*(i+1));[other[i],other[k]]=[other[k],other[i]];}
 const finalists=new Set([winner,...other.slice(0,Math.min(5,Math.max(0,count-1)))]);
 const order=[...finalists].filter(n=>n!==winner);order.push(winner);
 return {winner,count,heroes:Array.from({length:count},(_,i)=>({n:i+1,route:i%3,phase:r()*6.28,delay:r()*.09,success:finalists.has(i+1),rank:order.indexOf(i+1),side:r()>.5?1:-1}))};
}
function hero(c,n,x,y,s=1,step=0){
 c.save();c.translate(x,y);c.scale(s,s);
 c.fillStyle=n%3===0?'#cc6748':n%3===1?'#5679aa':'#78995d';
 c.fillRect(-9,-13,18,18);c.fillRect(-9,-21,18,7);
 c.fillStyle='#e6b48c';c.fillRect(-7,-8,14,10);
 c.fillStyle='#263646';c.fillRect(3,-5,3,3);
 c.fillStyle='#35465a';c.fillRect(-8,5,16,11);c.fillRect(-10+step*2,15,8,5);c.fillRect(2-step*2,15,8,5);
 c.fillStyle='#fff6df';c.fillRect(-13,-39,26,17);c.fillStyle='#243a4d';c.textAlign='center';c.font='900 15px Arial';c.fillText(n,0,-26);c.restore();
}
export function drawCastle(canvas,round,elapsed=0,duration=14000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration);
 c.fillStyle='#a9d9ed';c.fillRect(0,0,600,480);c.fillStyle='#e6f4ee';c.fillRect(0,365,600,115);
 c.fillStyle='#6ca66e';c.fillRect(0,403,600,77);c.fillStyle='#7d614f';c.fillRect(0,428,600,52);
 // Giant end wall and elevated route
 c.fillStyle='#8a807c';c.fillRect(384,203,46,226);c.fillStyle='#d6c4b0';for(let y=217;y<429;y+=25){c.fillRect(387,y,40,2);}
 c.fillStyle='#97765b';c.fillRect(166,292,189,13);c.fillRect(198,250,130,12);
 // Three moving cloud platforms
 for(let i=0;i<3;i++){const x=190+i*62+Math.sin(t*11+i)*32,y=174+i%2*22;c.fillStyle='#f8f9fc';for(let k=-1;k<=1;k++){c.beginPath();c.arc(x+k*17,y,18,0,7);c.fill();}}
 // Castle with a tall pennant
 c.fillStyle='#9b8193';c.fillRect(502,260,76,144);c.fillRect(486,284,24,120);c.fillRect(572,284,23,120);
 c.fillStyle='#6c627e';for(const x of [489,517,551,575])c.fillRect(x,249,13,20);
 c.fillStyle='#4b4563';c.fillRect(530,346,26,58);c.fillStyle='#ffe0a1';c.fillRect(545,215,3,47);
 c.fillStyle='#df795d';c.beginPath();c.moveTo(548,216);c.lineTo(578,229);c.lineTo(548,239);c.fill();
 c.fillStyle='#243e54';c.textAlign='center';c.font='bold 21px Arial';c.fillText('お城まで大ジャンプ！',300,34);
 c.font='bold 13px Arial';c.fillText('地上',112,385);c.fillText('空中の道',275,279);c.fillText('動く雲',290,145);
 // Green entrance pipe
 c.fillStyle='#409d75';c.fillRect(5,351,58,54);c.fillStyle='#29785e';c.fillRect(0,341,70,19);
 if(!round)return;
 let across=0;
 for(const b of round.heroes){
  const phase=t-b.delay,approach=cl(phase/.55);
  const sx=39+(b.n%8)*4,sy=370+(b.n%5)*5;
  let x=sx+(330-sx)*sm(approach),y=sy;
  if(b.route===1){y=sy+(278-sy)*sm(cl(phase/.28));}
  if(b.route===2){const u=cl(phase/.30);y=sy+(168-sy)*sm(u);x+=Math.sin(t*11+b.phase)*22;}
  const jump=cl((phase-.52)/.17);
  if(phase>.52){x=330+(b.success?130:68)*jump;y=(b.route===0?370:b.route===1?278:168)-Math.sin(jump*Math.PI)*(b.success?185:65);}
  if(phase>.69){
   if(!b.success){const fall=cl((phase-.69)/.12);x=398+b.side*25*fall;y=300+160*fall;if(fall>=1)continue;}
   else{across++;const end=cl((phase-.69)/.25);x=440+(b.n===round.winner?115:97)*sm(end);y=183+sm(end)*191;if(b.n!==round.winner&&end>.72)y=374,x=492+b.rank*5;}
  }
  if(b.success&&b.n===round.winner&&t>.91){x=550;y=359;}
  if(t>.95&&b.n!==round.winner&&b.success)continue;
  const scale=b.n===round.winner?1+sm((t-.93)/.07)*1.0:1;
  hero(c,b.n,x,y,scale,reduced?0:Math.sin(t*39+b.phase)*.8);
 }
 c.fillStyle='#284b41';c.font='bold 17px Arial';c.textAlign='center';
 c.fillText(t>=1?round.winner+'番が最初にお城へ到着！':t<.5?'３つのルートから壁へ向かう！':t<.72?'最後の壁をジャンプ！':'壁を越えた冒険家が城へダッシュ！',300,460);
}
