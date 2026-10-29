// Numbered robot obstacle race. Winner chosen independently in app.js.
// Rendered paths are deterministic; every entrant has an equal draw probability.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};
export function makeRobotRound(count,winner,seed){
 let state=(seed>>>0)||1;
 const rnd=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const bots=Array.from({length:count},(_,i)=>({
  n:i+1,pace:.83+rnd()*.15,phase:rnd()*6.28,
  fallAt:.24+rnd()*.35,fallLength:.065+rnd()*.055,
  falls:rnd()<.26,boostAt:.67+rnd()*.13,boost:.07+rnd()*.09
 }));
 return {count,winner,bots,comeback:rnd()<.5};
}
function progress(bot,p,round){
 let q=p*bot.pace;
 if(bot.falls){
  const a=bot.fallAt,b=a+bot.fallLength;
  if(p>a)q-=.045*ease((p-a)/.028);
  if(p>b)q+=.028*ease((p-b)/.12);
 }
 if(p>bot.boostAt)q+=bot.boost*ease((p-bot.boostAt)/(1-bot.boostAt));
 if(bot.n===round.winner){
  q-=round.comeback?.05*ease(p/.5):0;
  q+=(1-q)*ease((p-.78)/.22);
 }else q=Math.min(q,.968);
 return clamp(q,0,1);
}
function robot(c,x,y,scale,n,tilt,step,highlight){
 c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(tilt);
 c.strokeStyle='#e4ebf0';c.lineWidth=1.7;
 c.fillStyle=highlight?'#dbc88d':'#a3b9c9';
 c.beginPath();c.roundRect(-11,-22,22,17,4);c.fill();c.stroke();
 c.fillStyle='#263d51';c.fillRect(-6,-15,4,3);c.fillRect(3,-15,4,3);
 c.fillStyle=highlight?'#dbc88d':'#a3b9c9';
 c.beginPath();c.roundRect(-12,-2,24,21,4);c.fill();c.stroke();
 c.fillStyle='#14293b';c.font='bold 12px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,9);
 c.strokeStyle='#d9e4ea';c.lineWidth=3;c.beginPath();
 c.moveTo(-12,4);c.lineTo(-18,step?11:-4);c.moveTo(12,4);c.lineTo(18,step?-4:11);
 c.moveTo(-7,19);c.lineTo(-11,step?28:23);c.moveTo(7,19);c.lineTo(12,step?23:28);c.stroke();c.restore();
}
export function drawRobotRace(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const p=clamp(elapsed/duration,0,1),done=p>=1;
 c.clearRect(0,0,600,470);c.fillStyle='#182a3e';c.fillRect(12,10,576,450);
 c.fillStyle='#ebd29d';c.font='bold 19px Arial';c.textAlign='center';c.fillText('ロボット障害物競走',300,36);
 const n=round?.count??40,left=58,right=552,top=64,bottom=409,dy=(bottom-top)/n;
 c.fillStyle='#223950';c.fillRect(left,top,right-left,bottom-top);
 c.strokeStyle='#485f75';c.lineWidth=1;
 for(let i=0;i<=n;i++){const y=top+i*dy;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();}
 c.strokeStyle='#ddc58f';c.lineWidth=3;c.beginPath();c.moveTo(539,top);c.lineTo(539,bottom);c.stroke();
 // Every lane has matching obstacles, to avoid suggesting a favored lane.
 c.fillStyle='#647f92';
 for(let i=0;i<n;i++){const y=top+(i+.5)*dy;for(const x of [207,336,454])c.fillRect(x,y-2,4,4);}
 if(round){
  for(const bot of round.bots){
   const y=top+(bot.n-.5)*dy,frac=reduced&&!done?0:progress(bot,p,round);
   const x=left+12+frac*467;
   const down=!reduced&&bot.falls&&p>=bot.fallAt&&p<bot.fallAt+bot.fallLength;
   const tilt=down?-1.0*ease((p-bot.fallAt)/.022):0;
   c.fillStyle='#dce6ec';c.font=(dy<11?'8':'11')+'px Arial';c.textAlign='right';c.textBaseline='middle';c.fillText(String(bot.n),49,y);
   robot(c,x,y,clamp(dy/34,.22,.95),bot.n,tilt,!reduced&&Math.floor(p*25+bot.phase)%2===0,done&&bot.n===round.winner);
  }
 }
 c.fillStyle='#dbe5eb';c.textAlign='center';c.font='bold 15px Arial';
 c.fillText(done?round.winner+' 番がゴール！':p<.3?'スタート！':p<.66?'障害物で転倒、立ち上がる！':p<.86?'急加速！　追い上げる！':'ゴール直前の接戦！',300,443);
}
