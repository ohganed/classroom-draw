// The winner is selected independently by app.js using unbiased crypto randomness.
import { randomNumber } from './draw.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};
export function makeRobotRound(count,winner,seed,pick=n=>randomNumber(undefined,n)){
 if(!Number.isInteger(count)||count<1||count>99||!Number.isInteger(winner)||winner<1||winner>count)throw new RangeError('Invalid robot round');
 let state=(seed>>>0)||1;
 const rnd=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const bots=Array.from({length:count},(_,i)=>({n:i+1,phase:rnd()*6.28,pace:.7+rnd()*.25}));
 const stages=[bots.map(b=>b.n)];
 for(let stage=0;stage<2;stage++){
  const others=stages[stage].filter(n=>n!==winner);
  // Uniform shuffle without modulo bias; visual seed never selects survivors.
  for(let i=others.length-1;i>0;i--){const j=pick(i+1)-1;[others[i],others[j]]=[others[j],others[i]];}
  stages.push([winner,...others.slice(0,Math.ceil(stages[stage].length/2)-1)].sort((a,b)=>a-b));
 }
 return {count,winner,bots,stages};
}
// Both elimination moments coincide with the field reaching an obstacle.
function progress(bot,p,round){
 if(p<=.3)return .30*ease(p/.3);
 if(p<=.58)return .30+.30*ease((p-.38)/.20);
 const t=ease((p-.68)/.32);
 return .60+(bot.n===round.winner?.40:.37*bot.pace)*t;
}
function robot(c,x,y,scale,n,tilt,step,highlight,plate=false){
 if(plate){
  // Trailing number plate stays upright, separate from the moving robot.
  c.save();c.translate(x-39*scale,y);c.scale(scale,scale);
  c.fillStyle='#f1e6ca';c.strokeStyle='#182a3e';c.lineWidth=2;
  c.beginPath();c.roundRect(-23,-18,46,36,6);c.fill();c.stroke();
  c.fillStyle='#182a3e';c.font='bold 32px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),0,1);c.restore();
 }
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
 const p=reduced&&elapsed<duration?0:clamp(elapsed/duration,0,1),done=p>=1;
 c.clearRect(0,0,600,470);c.fillStyle='#182a3e';c.fillRect(12,10,576,450);
 c.fillStyle='#ebd29d';c.font='bold 19px Arial';c.textAlign='center';c.textBaseline='alphabetic';c.fillText('ロボット障害物競走',300,36);
 const stage=p>=.58?2:p>=.3?1:0;
 const active=round?.stages[stage]??[],previous=round?.stages[Math.max(0,stage-1)]??[];
 const transition=stage?ease((p-(stage===1?.3:.58))/.10):1;
 const left=84,travel=453,top=88,bottom=412,height=bottom-top;
 c.fillStyle='#223950';c.fillRect(26,top,548,height);
 c.strokeStyle='#ddc58f';c.lineWidth=3;c.beginPath();c.moveTo(537,top);c.lineTo(537,bottom);c.stroke();
 c.fillStyle='#647f92';for(const f of [.30,.60])c.fillRect(left+travel*f-3,top,6,height);
 c.fillStyle='#c9d8e3';c.font='bold 16px Arial';c.textAlign='center';
 c.fillText(round?`${round.count} → ${round.stages[1].length} → ${round.stages[2].length}　残り ${active.length} 体`:'スタートを押してね',300,65);
 if(round){
  const from=stage?previous:active;
  for(const bot of round.bots){
   const oldIndex=from.indexOf(bot.n),index=active.indexOf(bot.n);
   if(oldIndex<0&&index<0)continue;
   const eliminated=index<0;
   if(eliminated&&transition>=1)continue;
   const oldY=top+(oldIndex+.5)*height/from.length;
   const newY=eliminated?oldY:top+(index+.5)*height/active.length;
   const y=oldY+(newY-oldY)*transition;
   const oldScale=clamp(height/from.length/54,.12,1.15);
   const newScale=clamp(height/active.length/54,.12,1.15);
   const scale=oldScale+(newScale-oldScale)*transition;
   const frac=eliminated?(stage===1?.30:.60):progress(bot,p,round);
   const x=left+frac*travel;
   c.save();c.globalAlpha=eliminated?1-transition:1;
   robot(c,x,y,scale,bot.n,eliminated&&!reduced?-transition*.8:0,!reduced&&!done&&Math.sin(p*35+bot.phase)>0,done&&bot.n===round.winner,stage>=1&&!eliminated);
   c.restore();
  }
 }
 c.fillStyle='#dbe5eb';c.textAlign='center';c.textBaseline='alphabetic';c.font='bold 16px Arial';
 c.fillText(done&&round?round.winner+' 番がゴール！':stage===0?'第1障害へ！':stage===1?'半分が通過！ 次の障害へ':'最後の直線！ 大きな番号で応援しよう',300,443);
}
