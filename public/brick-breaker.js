// Deterministic, contact-accurate brick breaker. The app uniformly draws the winner.
// Each volley launches the ball vertically, collides with the lowest intact brick in
// its column, reflects from its lower face, and returns to a moving paddle.
// No brick disappears unless the ball actually touches its collision rectangle.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=cl(x);return x*x*(3-2*x)};
const R=7,PADDLE_Y=421,BASE_Y=PADDLE_Y-R-3;
export const brickDuration=count=>Math.max(4600,3100+Math.max(0,count-1)*730);
export function makeBrickRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const rest=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=rest.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
 // Randomize the winner's physical position: no row or depth gives a clue.
 // Balls can enter from the top or bottom of a column.
 const winSlot=Math.floor(r()*count),slots=Array(count).fill(null);
 slots[winSlot]=winner;let k=0;for(let i=0;i<count;i++)if(i!==winSlot)slots[i]=rest[k++];
 const bricks=slots.map((n,i)=>({n,x:23+(i%10)*56,y:88+Math.floor(i/10)*50,w:50,h:38,hit:Infinity}));
 const byNum=new Map(bricks.map(b=>[b.n,b]));
 const alive=new Set(rest),shots=[];let prevX=300;
 // Every shot targets an outermost surviving brick, either from above or below.
 // This makes every depth reachable while the winner is never touched.
 while(alive.size){
  const options=[];
  for(let col=0;col<10;col++){
   const column=bricks.filter(b=>alive.has(b.n)||b.n===winner).filter(b=>Math.floor((b.x-23)/56)===col).sort((a,b)=>a.y-b.y);
   if(!column.length)continue;
   if(column[0].n!==winner)options.push({target:column[0],fromTop:true});
   if(column[column.length-1].n!==winner)options.push({target:column[column.length-1],fromTop:false});
  }
  if(!options.length)throw new Error('No collision-safe brick route');
  const {target,fromTop}=options[Math.floor(r()*options.length)];
  const x=target.x+target.w/2,launch=fromTop?68:BASE_Y;
  const contact=fromTop?target.y-R:target.y+target.h+R;
  const motion=contact-launch;
  const move=.17,fly=.225,back=.225,settle=.11;
  const start=shots.length*(move+fly+back+settle);
  shots.push({start,x,prevX,target:target.n,launch,contact,motion,fromTop,move,fly,back,settle});
  target.hit=start+move+fly;
  alive.delete(target.n);prevX=x;
 }
 return {winner,count,bricks,shots,seconds:shots.length*.73+3.1,winBrick:byNum.get(winner)};
}
export function drawBrick(canvas,round,elapsed=0,duration=12000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const sec=Math.max(0,elapsed)/1000;
 c.fillStyle='#121e35';c.fillRect(0,0,600,480);
 c.fillStyle='#e4eafa';c.textAlign='center';c.textBaseline='alphabetic';c.font='bold 23px Arial';c.fillText('ブロック崩し・最後の一枚！',300,35);
 c.strokeStyle='#48617d';c.lineWidth=3;c.strokeRect(12,57,576,377);
 if(!round)return;
 let left=0;
 for(const b of round.bricks){
  const vanish=cl((sec-b.hit)/.13);if(vanish>=1)continue;
  if(sec<b.hit)left++;
  c.globalAlpha=1-vanish;
  c.fillStyle=['#e2a65e','#75b8d3','#d18ba9','#91bb82'][Math.floor((b.y-88)/50)%4];
  c.beginPath();c.roundRect(b.x,b.y,b.w,b.h,5);c.fill();
  c.fillStyle='#182a3c';c.font='900 20px Arial';c.fillText(b.n,b.x+25,b.y+26);
  c.globalAlpha=1;
 }
 // The paddle carries the ball into alignment between shots. Every moving
 // projectile has a real contact point at the brick's lower edge.
 let x=300,y=BASE_Y,active=null,shotIndex=-1;
 for(let i=0;i<round.shots.length;i++){
  const shot=round.shots[i];
  if(sec<shot.start)break;
  shotIndex=i;const age=sec-shot.start;
  if(age<shot.move){x=shot.prevX+(shot.x-shot.prevX)*smooth(age/shot.move);y=shot.launch;active=shot;break;}
  if(age<shot.move+shot.fly){x=shot.x;y=shot.launch+shot.motion*((age-shot.move)/shot.fly);active=shot;break;}
  if(age<shot.move+shot.fly+shot.back){x=shot.x;y=shot.contact-shot.motion*((age-shot.move-shot.fly)/shot.back);active=shot;break;}
  x=shot.x;y=shot.launch;active=shot;
  if(age<shot.move+shot.fly+shot.back+shot.settle)break;
 }
 const paddleY=active?.fromTop?53:PADDLE_Y;
 c.fillStyle=active?.fromTop?'#96d5e5':'#f6d98b';
 c.beginPath();c.roundRect(cl(x-49,18,484),paddleY,98,12,6);c.fill();
 c.fillStyle='#f7f9fa';c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.fill();
 if(active&&sec>=active.start+active.move+active.fly&&sec<active.start+active.move+active.fly+.12){
  c.strokeStyle='#ffefb0';c.lineWidth=2;c.beginPath();c.arc(active.x,active.contact+(active.fromTop?R:-R),14,0,Math.PI*2);c.stroke();
 }
 const finale=sec>=round.shots.length*.73+.7;
 if(finale){
  const b=round.winBrick,u=smooth((sec-round.shots.length*.73-1.3)/.7);
  c.strokeStyle='#f5d17e';c.lineWidth=3;c.strokeRect(b.x-3,b.y-3,56,44);
  if(u>0){c.fillStyle='#f8d981';c.beginPath();c.roundRect(190,302,220,79,12);c.fill();c.fillStyle='#192b42';c.font='900 47px Arial';c.fillText(round.winner,300,357);}
 }
 c.fillStyle='#e4eafa';c.font='bold 17px Arial';
 c.fillText(finale?round.winner+'番が最後まで残った！':left===1?'最後の一枚！ ボールが届かない！':'残り '+left+' 枚！ ボールが命中！',300,465);
}
