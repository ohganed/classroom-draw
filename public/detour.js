// Winding maze with many real branches; selection remains uniformly random in app.js.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const main=[[60,390],[100,360],[92,300],[160,265],[208,295],[252,245],[200,188],[126,190],[120,120],[205,99],[278,140],[339,98],[390,160],[350,228],[425,268],[485,215],[456,153],[528,110]];
const branches=[
 {at:1,path:[[100,360],[170,385],[236,350],[288,395],[345,376]]},
 {at:3,path:[[160,265],[115,245],[65,260],[57,198],[92,160]]},
 {at:5,path:[[252,245],[304,283],[360,322],[315,355],[262,340]]},
 {at:7,path:[[126,190],[65,153],[66,91],[137,70]]},
 {at:9,path:[[205,99],[230,55],[290,62],[314,87]]},
 {at:11,path:[[339,98],[398,65],[453,99],[489,62]]},
 {at:13,path:[[350,228],[306,193],[275,218],[282,287]]},
 {at:14,path:[[425,268],[480,318],[525,289],[552,346]]},
 {at:16,path:[[456,153],[415,115],[455,75]]}
];
function trace(c,pts){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));}
function point(pts,p){let lengths=[],total=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);lengths.push(d);total+=d;}let dist=cl(p)*total;for(let i=0;i<lengths.length;i++){if(dist<=lengths[i]||i===lengths.length-1){const z=cl(dist/lengths[i]);return {x:pts[i][0]+(pts[i+1][0]-pts[i][0])*z,y:pts[i][1]+(pts[i+1][1]-pts[i][1])*z};}dist-=lengths[i];}return {x:pts[0][0],y:pts[0][1]};}
export function makeDetourRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 return {winner,count,runners:Array.from({length:count},(_,i)=>({n:i+1,phase:r()*6.28,branch:Math.floor(r()*branches.length),turn:.15+r()*.58,pace:.72+r()*.3,lane:i%5}))};
}
export function drawDetour(canvas,round,elapsed=0,duration=11000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#e9f2dd';c.fillRect(0,0,600,480);
 // All tracks are rendered the same way, with no highlighted shortcut.
 for(const pts of [main,...branches.map(b=>b.path)]){
  c.lineJoin='round';c.lineCap='round';c.strokeStyle='#77935f';c.lineWidth=31;trace(c,pts);c.stroke();
  c.strokeStyle='#ead8a4';c.lineWidth=24;trace(c,pts);c.stroke();
  c.strokeStyle='#c5b083';c.lineWidth=1.5;trace(c,pts);c.stroke();
 }
 c.fillStyle='#23394f';c.font='bold 22px Arial';c.textAlign='center';c.fillText('急がば回れ！',300,28);
 c.fillStyle='#31624d';c.font='bold 16px Arial';c.fillText('START',60,439);
 c.fillStyle='#ae602f';c.fillRect(503,70,62,22);c.fillStyle='#fff';c.font='bold 16px Arial';c.fillText('GOAL',534,86);
 if(!round)return;
 for(const b of round.runners){
  const win=b.n===round.winner;
  let pos;
  if(win){pos=point(main,cl(t/.975));}
  else{
   const br=branches[b.branch],junction=br.at/(main.length-1);
   const along=t*b.pace;
   if(along<junction)pos=point(main,along);
   else {
    const fork=point(main,junction);
    const onward=cl((along-junction)*2.8);
    pos=point([ [fork.x,fork.y],...br.path.slice(1)],onward);
   }
  }
  const jitter=reduced?0:Math.sin(t*24+b.phase)*2;
  const x=pos.x+jitter+(b.lane-2)*2,y=pos.y+Math.cos(t*16+b.phase)*(reduced?0:2);
  c.fillStyle=win&&done?'#f6ba53':['#6099b5','#d793a2','#9d93c1','#78ad8a'][b.n%4];c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();
  c.fillStyle='#fffbe9';c.font='900 12px Arial';c.textBaseline='middle';c.fillText(String(b.n),x,y);
 }
 c.fillStyle='#25445a';c.font='bold 17px Arial';c.fillText(done?round.winner+'番がゴール！':'曲がりくねった道を進むのは誰？',300,461);
}
