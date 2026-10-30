const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function makeBotamochiRound(count,winner,seed){
 let s=seed>>>0||1;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const losers=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=losers.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[losers[i],losers[j]]=[losers[j],losers[i]];}
 const drop=new Map(losers.map((n,i)=>[n,.12+.75*(i+.3*rand())/Math.max(1,losers.length)]));
 return {winner,count,cakes:Array.from({length:count},(_,i)=>({n:i+1,x:50+(i%10)*55,y:86+Math.floor(i/10)*57,phase:rand()*6.28,drop:drop.get(i+1)??.90,side:rand()>.5?1:-1}))};
}
function cake(c,n,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#62382f';c.beginPath();c.ellipse(0,2,23,15,0,0,7);c.fill();c.fillStyle='#8a5346';c.beginPath();c.ellipse(-5,-4,14,7,-.2,0,7);c.fill();c.fillStyle='#fff6cf';c.beginPath();c.roundRect(-17,-8,34,21,5);c.fill();c.fillStyle='#362420';c.font='900 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n,0,2);c.restore();}
export function drawBotamochi(canvas,round,elapsed=0,duration=10000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const t=cl(elapsed/duration),done=t>=1;
 c.clearRect(0,0,600,480);c.fillStyle='#f5e9d3';c.fillRect(0,0,600,480);
 c.fillStyle='#795640';c.fillRect(22,52,556,15);c.fillRect(22,130,556,10);c.fillRect(22,187,556,10);c.fillRect(22,244,556,10);c.fillRect(22,301,556,10);
 c.fillStyle='#51382c';for(const x of [35,560])c.fillRect(x,55,12,256);
 c.fillStyle='#3d2924';c.font='bold 24px Arial';c.textAlign='center';c.fillText('棚からぼたもち！',300,32);
 c.fillStyle='#e2e9df';c.beginPath();c.ellipse(300,425,126,28,0,0,7);c.fill();c.strokeStyle='#94a9a2';c.lineWidth=5;c.stroke();
 if(round){
  let remaining=0;
  for(const b of round.cakes){
   const dropping=t>=b.drop;const u=cl((t-b.drop)/.12);
   if(dropping&&u>=1&&b.n!==round.winner)continue;
   if(!dropping)remaining++;
   let x=b.x+(reduced?0:Math.sin(t*22+b.phase)*3);
   let y=b.y;
   if(dropping){x+=b.side*55*u;y+=(430-b.y)*u*u;}
   if(b.n===round.winner&&t>.9){let v=cl((t-.9)/.10);x+=(300-x)*v;y+=(410-y)*v;}
   if(b.n===round.winner&&done){x=300;y=410;}
   cake(c,b.n,x,y,b.n===round.winner&&done?2.2:1);
  }
  c.fillStyle='#52392c';c.font='bold 19px Arial';c.fillText(done?round.winner+'番のぼたもちがお皿に！':'棚がぐらぐら…　残り '+remaining+' 個',300,473);
 }
}
