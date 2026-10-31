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
 // Pack each lane independently: even a crowded finish keeps every bib visible.
 const cols=8,dx=(w-22)/cols,rows=Math.ceil(round.count/cols);
 const scale=Math.min(1,dx/70,(h-142)/(rows*64));
 const gap=64*scale,top=finishY+31*scale,bottom=startY-10*scale;
 for(let col=0;col<cols;col++){
   const runners=[];
   for(let i=col;i<round.count;i+=cols){
     const n=i+1,p=reduced&&!finished?0:darumaPosition(round,n,finished?DARUMA_DURATION:elapsed);
     runners.push({n,p,y:bottom-p*(bottom-top)});
   }
   runners.sort((a,b)=>b.p-a.p||a.n-b.n);
   for(let i=0;i<runners.length;i++)runners[i].y=Math.max(runners[i].y,top+i*gap,i?runners[i-1].y+gap:top);
   if(runners.length)runners[runners.length-1].y=Math.min(bottom,runners.at(-1).y);
   for(let i=runners.length-2;i>=0;i--)runners[i].y=Math.min(runners[i].y,runners[i+1].y-gap);
   for(const runner of runners){
     const {n,y}=runner;
     const phase=Math.min(8,Math.floor(Math.max(0,elapsed)/3500));
     const caught=stop&&hash(round.seed,n,phase)<.38;
     const motion=reduced||finished?0:elapsed;
     const stride=stop?0:Math.sin(motion/95+n*1.7);
     const retreat=caught&&!reduced?Math.sin(Math.min(1,(elapsed%3500-2485)/1015)*Math.PI)*6:0;
     const champion=finished&&n===round.winner;
     const x=11+dx*(col+.5);
     drawContestant(c,x,y+retreat*scale,scale,{n,stride,stop:stop&&!reduced,caught:caught&&!reduced,retreat,champion,still:reduced||finished});
   }
 }
 c.textAlign='left';c.font='12px system-ui';c.fillStyle='#d2e4ec';
 c.fillText('スタート',12,h-8);
}
// Local drawing coordinates keep limbs and expressions away from the upright bib.
function drawContestant(c,x,y,scale,{n,stride,stop,caught,retreat,champion,still}){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const ink='#102238',coat=champion?'#ffd66b':['#8bd8ec','#c7b0ef','#9bddba','#ffba94','#f4a9c8'][n%5];
 const line=(points,color=ink,width=3)=>{c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const ellipse=(x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
 c.lineCap='round';c.lineJoin='round';
 ellipse(0,25,20,4,'#10223866');
 // The feet shuffle backwards when caught; the number never bounces or tilts.
 const step=still?0:caught?Math.sin(retreat*1.6)*4:stride*6;
 line([[-7,13],[-9-step,20],[-12-step,24]]);
 line([[7,13],[9+step,20],[12+step,24]]);
 ellipse(-12-step,24,5,3,'#fff5dc');ellipse(12+step,24,5,3,'#fff5dc');
 const hands=champion||stop;
 line([[-12,-5],[-19,hands?-15:stride*6],[-23,hands?-22:5+stride*6]]);
 line([[12,-5],[19,hands?-15:-stride*6],[23,hands?-22:5-stride*6]]);
 ellipse(-23,hands?-22:5+stride*6,3,3,'#ffe4bb');ellipse(23,hands?-22:5-stride*6,3,3,'#ffe4bb');
 // Soft square overalls, with a separate face and little hair tufts.
 c.beginPath();c.roundRect(-15,-11,30,28,8);c.fillStyle=coat;c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();
 ellipse(0,-19,12,11,'#ffe4bb');
 line([[-5,-28],[-7,-32],[-1,-29],[3,-32],[5,-28]],coat,3);
 if(caught){
   line([[-7,-21],[-3,-18],[-7,-16]],ink,1.8);line([[7,-21],[3,-18],[7,-16]],ink,1.8);
 }else{
   ellipse(-4,-20,stop?2.5:1.6,stop?3:2,ink);ellipse(4,-20,stop?2.5:1.6,stop?3:2,ink);
 }
 ellipse(-8,-15,2.5,1.4,'#ee9c8d');ellipse(8,-15,2.5,1.4,'#ee9c8d');
 if(stop)ellipse(0,-13,2.5,3,ink);
 else {c.beginPath();c.arc(0,-17,4,0,Math.PI);c.strokeStyle=ink;c.lineWidth=1.5;c.stroke();}
 if(caught){
   ellipse(16,-24+retreat/2,2,4,'#8bd8ff');
   line([[-23,16],[-28,18]],'#d2e4ec',1.5);line([[-22,21],[-27,23]],'#d2e4ec',1.5);
 }
 if(champion){
   c.beginPath();c.moveTo(-10,-32);c.lineTo(-11,-40);c.lineTo(-4,-36);c.lineTo(0,-43);c.lineTo(4,-36);c.lineTo(11,-40);c.lineTo(10,-32);c.closePath();c.fillStyle='#ffcf68';c.fill();
 }
 c.beginPath();c.roundRect(-12,-7,24,20,4);c.fillStyle='#fffdf4';c.fill();
 c.fillStyle=ink;c.font='900 18px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,4);
 c.restore();
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
