// Daruma-san ga koronda: all 40 contestants remain eligible; draw happens before animation.
export const DARUMA_DURATION = 30000;
const smooth = x => {const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
const hash = (seed,n,k=0) => {let x=(seed ^ Math.imul(n+1,0x9e3779b1) ^ Math.imul(k+7,0x85ebca6b))>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return ((x^(x>>>16))>>>0)/4294967296;};
export function makeDarumaRound(count,winner,seed) {
 if(!Number.isInteger(count)||count<1||count>99||!Number.isInteger(winner)||winner<1||winner>count)throw new RangeError('Invalid contestants');
 return {count,winner,seed:seed>>>0};
}
export function darumaPosition(round,n,elapsed) {
 const t=Math.max(0,Math.min(DARUMA_DURATION,elapsed));
 const final=t>=DARUMA_DURATION;
 if(final)return n===round.winner?1:Math.min(.965,.69+hash(round.seed,n,99)*.24);
 const phase=Math.min(8,Math.floor(t/3500));
 const local=(t-phase*3500)/3500;
 const move=local<.71?smooth(local/.71):1;
 const base=phase*.085 + move*.085;
 const variance=(hash(round.seed,n,phase)-.5)*.10;
 const penalty=phase>0&&hash(round.seed,n,phase-1)<.38?(.055+hash(round.seed,n,phase,8)*.075):0;
 let position=Math.max(.025,base+variance-penalty);
 // A deliberately surprising late surge; visual storytelling never chooses the winner.
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
   const stagger=(Math.floor(i/cols)%2)*.46;
   const x=11+dx*(col+.5)+ (stagger-.23)*dx*.3;
   const p=reduced&&!finished?0:darumaPosition(round,n,finished?DARUMA_DURATION:elapsed);
   const y=startY-p*(startY-finishY-12);
   const radius=Math.min(17,dx*.28);
   c.beginPath();c.arc(x,y,radius,0,Math.PI*2);
   c.fillStyle=n===round.winner&&finished?'#ffcf68': ['#8bc8e8','#cda9e9','#92d1b8','#edb68e'][i%4];
   c.fill();c.strokeStyle='#0e2530';c.lineWidth=2;c.stroke();
   c.fillStyle='#102238';c.textAlign='center';c.font='bold 14px system-ui';c.fillText(String(n),x,y+5);
 }
 c.textAlign='left';c.font='12px system-ui';c.fillStyle='#d2e4ec';
 c.fillText('スタート',12,h-8);
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
