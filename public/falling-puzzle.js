// 色が同じ2個が隣り合うと両方消える、多数落下型の抽選。
// 1〜countを全員4回ずつ出し、当選者のみ5回。差は1個のみ。
// 当選者はapp.jsが一様乱数で決定するため番号による優劣はない。
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=cl(x);return x*x*(3-2*x)};
const palette=['#f18b7f','#72badf','#f0c267','#9bc986','#b99ae6','#8ed2c5','#e6a9c7','#d2bb8d'];
const color=n=>palette[(n-1)%palette.length];
export function makeFallingRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const bags=[];for(let n=1;n<=count;n++)for(let k=0;k<2;k++)bags.push(n);
 for(let i=bags.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[bags[i],bags[j]]=[bags[j],bags[i]];}
 const events=[];let time=.15,id=0;
 // Each entry is a pair of same-color numbered blocks dropping on the stack.
 // Contact is explicitly followed by a two-block clear.
 for(const n of bags){
  const col=Math.floor(r()*10),start=time;
  events.push({kind:'drop',n,id:id++,col,start,dur:.22,level:0});
  events.push({kind:'drop',n,id:id++,col,start:start+.11,dur:.22,level:1});
  events.push({kind:'clear',n,col,start:start+.37,dur:.18});
  time+=.405;
 }
 // One extra copy of the uniformly chosen number remains.
 const col=4+Math.floor(r()*2);
 events.push({kind:'drop',n:winner,id:id++,col,start:time+.08,dur:.48,level:0});
 return {winner,count,events,seconds:time+2.1,total:count*4+1};
}
export const fallingDuration=round=>Math.ceil((round?.seconds??20)*1000);
function tile(c,x,y,n,alpha=1,scale=1){
 c.save();c.globalAlpha=alpha;c.translate(x+22,y+22);c.scale(scale,scale);
 c.fillStyle=color(n);c.beginPath();c.roundRect(-20,-20,40,40,6);c.fill();
 c.strokeStyle='#fff4de';c.lineWidth=2;c.stroke();
 c.fillStyle='#152c44';c.font='900 17px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n,0,1);c.restore();
}
export function drawFalling(canvas,round,elapsed=0,duration=18000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const sec=cl(elapsed/1000,0,round?.seconds??20);
 c.fillStyle='#101e37';c.fillRect(0,0,600,480);
 c.fillStyle='#f5e6b9';c.textAlign='center';c.font='bold 22px Arial';c.fillText('落ちものパズル・色がそろうと消える！',300,34);
 c.fillStyle='#233a55';c.beginPath();c.roundRect(38,55,524,363,11);c.fill();
 for(let i=0;i<10;i++){c.strokeStyle='#37516a';c.strokeRect(52+i*49,75,46,323);}
 if(!round)return;
 const active=new Map();let clearing=false,fallen=0;
 for(const ev of round.events){
  if(sec<ev.start)break;
  if(ev.kind==='drop'){active.set(ev.id,ev);fallen++;}
  else if(ev.kind==='clear'){
   const pair=[...active].filter(([,d])=>d.n===ev.n&&d.col===ev.col);
   // Prior identical values may have already cleared; only the currently
   // active matching pair participates.
   if(sec>=ev.start+ev.dur){for(const [key] of pair)active.delete(key);}
   else clearing=true;
  }
 }
 for(const [id,ev] of active){
  const progress=cl((sec-ev.start)/ev.dur);
  const target=ev.level?332:374;
  const y=-44+(target+44)*ease(progress);
  const clear=round.events.find(e=>e.kind==='clear'&&e.n===ev.n&&e.col===ev.col&&e.start>=ev.start&&e.start<=ev.start+.5);
  const decay=clear?cl((sec-clear.start)/clear.dur):0;
  tile(c,52+ev.col*49,y,ev.n,1-decay,1+decay*.22);
 }
 const final=round.events[round.events.length-1];
 const finalShow=sec>final.start+.5;
 if(finalShow){
  const v=ease((sec-final.start-.5)/.8);
  c.fillStyle='#f5e6b9';c.font='bold 19px Arial';
  c.fillText('最後に残った番号！',300,174);
  tile(c,278,222,round.winner,1,1+v*1.3);
 }
 c.fillStyle='#f5e6b9';c.font='bold 15px Arial';
 c.fillText('全番号４回ずつ＋当選番号だけ１回追加  /  落下 '+fallen+'/'+round.total,300,440);
 c.font='bold 17px Arial';c.fillText(finalShow?round.winner+'番が当選！':clearing?'同じ色！ ２個まとめて消去！':'番号ブロックが次々落下！',300,469);
}
