// Daruma-san ga koronda: all 40 contestants remain eligible; draw happens before animation.
export const DARUMA_DURATION = 30000;
const smooth = x => {const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
const hash = (seed,n,k=0) => {let x=(seed ^ Math.imul(n+1,0x9e3779b1) ^ Math.imul(k+7,0x85ebca6b))>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return ((x^(x>>>16))>>>0)/4294967296;};
export function makeDarumaRound(count,winner,seed) {
 if(!Number.isInteger(count)||count<1||count>99||!Number.isInteger(winner)||winner<1||winner>count)throw new RangeError('Invalid contestants');
 const eliminations=[];
 const candidates=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let phase=0;phase<8 && candidates.length>1;phase++){
   candidates.sort((a,b)=>hash(seed,a,phase+31)-hash(seed,b,phase+31));
   const amount=Math.min(candidates.length-1,1+(hash(seed,phase,71)>.58?1:0));
   for(let j=0;j<amount;j++)eliminations.push({n:candidates.shift(),phase,at:phase*3500+2485});
 }
 return {count,winner,seed:seed>>>0,eliminations};
}
export function darumaPosition(round,n,elapsed) {
 const t=Math.max(0,Math.min(DARUMA_DURATION,elapsed));
 // Each contestant keeps a fixed lane and accumulates progress from completed
 // movement phases. A phase change never re-rolls their current position.
 const phaseLength=3500,moveLength=2485,phaseCount=8;
 const phase=Math.min(phaseCount-1,Math.floor(t/phaseLength));
 const local=t-phase*phaseLength;
 let position=0;
 for(let k=0;k<phaseCount;k++){
   const stride=.070+hash(round.seed,n,k)*.025;
   const stumble=hash(round.seed,n,k,8)<.22?.42:1;
   const step=stride*stumble;
   if(k<phase) position+=step;
   else if(k===phase) position+=step*smooth(Math.min(1,local/moveLength));
 }
 // A brief stumble slows progress but never moves a contestant backwards.
 position=Math.max(0,position);

 // The selected winner is still predetermined; the late comeback is smooth
 // and does not alter the contestant's lane or identity.
 if(n===round.winner){
   if(t<23500)position=Math.min(position,.43);
   else position=.43+smooth((t-23500)/6500)*.57;
 }else{
   position=Math.min(position,t<26000?.88:.90+hash(round.seed,n,5)*.07);
 }
 return Math.min(.985,position);
}
export function darumaFacing(elapsed){
 const t=Math.max(0,elapsed)%3500;
 return t>=2485; // the doll turns around, and everyone freezes
}
export function drawDaruma(canvas,round,elapsed,{reduced=false,finished=false}={}){
 const fallen=round.eliminations||[];
 const fallenCount=fallen.filter(e=>elapsed>=e.at+900).length;

 const c=canvas.getContext('2d');const w=canvas.width,h=canvas.height;
 c.clearRect(0,0,w,h);
 c.fillStyle='#102238';c.fillRect(0,0,w,h);
 const finishY=86,startY=h-36;
 c.fillStyle='#213f51';c.fillRect(8,finishY, w-16,startY-finishY);
 c.strokeStyle='#b6d8ba';c.setLineDash([7,8]);c.beginPath();c.moveTo(10,finishY);c.lineTo(w-10,finishY);c.stroke();c.setLineDash([]);
 c.fillStyle='#e8f6fa';c.textAlign='center';c.font='bold 20px system-ui';c.fillText('🏁 ゴール',w/2,26);
 const facing=darumaFacing(elapsed),stop=!finished&&facing;
 c.font='bold 15px system-ui';c.fillStyle='#fbd59b';
 c.fillText(finished?'ゴール！':stop?'だるまさんが転んだ！ 全員ストップ':'だるまさんが…… 走れ！',w/2,48);
 // Back-facing doll, front-facing doll: no flashing or sudden full-screen contrast changes.
 c.font='32px system-ui';c.fillText('🔴',w/2,80);
 const cols=8,rows=Math.ceil(round.count/cols);
 const dx=(w-22)/cols;
 for(let i=0;i<round.count;i++){
   const n=i+1,col=i%cols;
   const eliminated=fallen.find(e=>e.n===n);
   if(eliminated && elapsed>=eliminated.at+900)continue;
   const stagger=(Math.floor(i/cols)%2)*.46;
   const x=11+dx*(col+.5)+ (stagger-.23)*dx*.3;
   const p=reduced&&!finished?0:darumaPosition(round,n,finished?DARUMA_DURATION:elapsed);
   const y=startY-p*(startY-finishY-12);
   const radius=Math.min(17,dx*.28);
   let shake=0,fall=0;
   if(eliminated&&!finished){
     const age=elapsed-eliminated.at;
     if(age>=0&&age<900){
       shake=age<560?(1-age/700)*Math.sin(age*.095)*5:0;
       fall=age<560?0:Math.min(1,(age-560)/340);
     }
   }
   const drawX=x+shake,drawY=y+fall*22;
   c.save();
   if(eliminated&&!finished&&elapsed>=eliminated.at&&elapsed<eliminated.at+900)c.globalAlpha=1-Math.max(0,elapsed-eliminated.at-560)/340;
   c.translate(drawX,drawY);if(fall>0)c.rotate(fall*.95);
   c.beginPath();c.arc(0,0,radius,0,Math.PI*2);
   c.fillStyle=eliminated&&!finished&&elapsed>=eliminated.at?'#c7a7a0':n===round.winner&&finished?'#ffcf68':['#8bc8e8','#cda9e9','#92d1b8','#edb68e'][i%4];
   c.fill();c.strokeStyle='#0e2530';c.lineWidth=2;c.stroke();
   c.fillStyle='#102238';c.textAlign='center';c.font='bold 14px system-ui';c.fillText(String(n),0,5);
   c.restore();
 }
 c.textAlign='left';c.font='12px system-ui';c.fillStyle='#d2e4ec';
 c.fillText('スタート',12,h-8);
 c.textAlign='right';c.fillStyle='#fbd59b';c.fillText('脱落 '+fallenCount+'人',w-14,h-8);
}
export function playDarumaSound(context,master,beat){
 if(!context||!master)return;
 const freq=beat%7===6?240:340+(beat%5)*50;
 const t=context.currentTime;
 const osc=context.createOscillator(),gain=context.createGain();
 osc.type='sine';osc.frequency.setValueAtTime(freq,t);
 gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(.12,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+.105);
 osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+.12);
}
