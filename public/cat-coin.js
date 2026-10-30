// 猫に小判: many cats ignore a shower of gold coins.
// The host app selects the winning number fairly.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=cl(x);return x*x*(3-2*x)};
export function makeCatCoinRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 return {winner,count,cats:Array.from({length:count},(_,i)=>({n:i+1,x:44+i%10*56,y:105+Math.floor(i/10)*78,phase:r()*6.28,mood:Math.floor(r()*3),coin:.17+r()*.55,turn:r()>.5?1:-1}))};
}
function cat(c,n,x,y,tilt=0,scale=1,phase=0){
 c.save();c.translate(x,y);c.rotate(tilt);c.scale(scale,scale);
 c.strokeStyle='#a87652';c.lineWidth=5;c.lineCap='round';c.beginPath();c.arc(14,5,12,-1.3,1.3);c.stroke();
 c.fillStyle='#bd8c68';c.beginPath();c.ellipse(0,9,13,13,0,0,7);c.fill();
 c.beginPath();c.arc(0,-10,14,0,7);c.fill();
 c.beginPath();c.moveTo(-13,-14);c.lineTo(-12,-28);c.lineTo(-2,-19);c.moveTo(13,-14);c.lineTo(12,-28);c.lineTo(2,-19);c.fill();
 c.fillStyle='#f1ccad';c.beginPath();c.ellipse(0,-6,9,6,0,0,7);c.fill();
 c.fillStyle='#303238';for(const dx of [-5,5]){c.beginPath();c.ellipse(dx,-13,1.8,2.5,0,0,7);c.fill();}
 c.fillStyle='#d77881';c.beginPath();c.arc(0,-7,2,0,7);c.fill();
 c.strokeStyle='#765b4f';c.lineWidth=1.3;for(const d of [-1,1]){c.beginPath();c.moveTo(d*5,-6);c.lineTo(d*17,-9+Math.sin(phase)*2);c.stroke();}
 c.fillStyle='#fff6de';c.beginPath();c.roundRect(-16,0,32,20,5);c.fill();
 c.fillStyle='#293d4c';c.textAlign='center';c.textBaseline='middle';c.font='900 16px Arial';c.fillText(n,0,10);c.restore();
}
function koban(c,x,y,size=1,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(size,size);
 c.fillStyle='#a87523';c.beginPath();c.ellipse(1,2,12,19,0,0,7);c.fill();
 c.fillStyle='#f3c752';c.beginPath();c.ellipse(0,0,11,18,0,0,7);c.fill();
 c.strokeStyle='#ab7426';c.lineWidth=1.6;c.beginPath();c.ellipse(0,0,8,15,0,0,7);c.stroke();
 c.fillStyle='#79521e';c.font='bold 12px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('金',0,1);c.restore();
}
export function drawCatCoin(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration);
 c.fillStyle='#f5edda';c.fillRect(0,0,600,480);
 c.fillStyle='#d3e3c3';c.fillRect(0,385,600,95);
 for(let row=0;row<4;row++){c.fillStyle='#e5cfaa';c.fillRect(10,126+row*78,580,7);}
 c.fillStyle='#3b503d';c.font='bold 24px serif';c.textAlign='center';c.fillText('猫に小判',300,36);
 if(!round)return;
 for(const b of round.cats){
  const shake=reduced?0:Math.sin(t*17+b.phase)*.12;
  const reacts=t>.17&&b.mood===0?Math.sin(t*13+b.phase)*5:0;
  let x=b.x+reacts,y=b.y+(reduced?0:Math.sin(t*12+b.phase)*2);
  const winning=b.n===round.winner,u=winning?ease((t-.84)/.16):0;
  x+=(300-x)*u;y+=(260-y)*u;
  cat(c,b.n,x,y,shake*(1-u),1+u*1.2,t*15+b.phase);
  if(t>=b.coin&&t<b.coin+.18){
   const d=cl((t-b.coin)/.18);
   koban(c,b.x+12,b.y-75+87*d*d,.48,.2+d);
  }
  if(!winning&&t>b.coin+.18){koban(c,b.x+17,b.y+30,.38,.4);}
 }
 if(t>.84){
  const u=ease((t-.84)/.16);
  koban(c,360,202,1.7*u,0);
  c.fillStyle='#d77e85';c.font='bold 28px Arial';c.fillText('♥',300,161);
 }
 c.fillStyle='#35523f';c.font='bold 17px Arial';
 c.fillText(t>=1?round.winner+'番の猫が小判をゲット！':t<.38?'小判が降ってきた！':'猫たちは興味なし…？',300,459);
}
