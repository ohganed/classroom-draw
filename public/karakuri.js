// Karakuri draw. Outcome comes from the independent uniform draw in app.js.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
export function makeKarakuriRound(count,winner,seed){
 let s=seed>>>0||1;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const others=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=others.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 const first=[winner,...others.slice(0,Math.max(0,Math.ceil(count/2)-1))];
 const shuffled=first.filter(n=>n!==winner);for(let i=shuffled.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const final=[winner,...shuffled.slice(0,Math.max(0,Math.ceil(first.length/2)-1))];
 const members=Array.from({length:count},(_,i)=>i+1).map((n,i)=>({n,stage:final.includes(n)?2:first.includes(n)?1:0,phase:rnd()*6.28,jitter:rnd(),speed:.7+rnd()*.65,slot:i}));
 return {count,winner,members,first,final,seed};
}
function ball(c,x,y,r,n,selected=false){
 c.save();c.translate(x,y);
 c.shadowColor='#091924';c.shadowBlur=6;c.shadowOffsetY=3;
 let g=c.createRadialGradient(-r*.35,-r*.42,r*.12,0,0,r);
 g.addColorStop(0,selected?'#fff2c4':'#ecf7f5');g.addColorStop(.48,selected?'#f1cb77':'#a8d5d6');g.addColorStop(1,selected?'#a76b36':'#4b798d');
 c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();c.shadowColor='transparent';
 c.fillStyle='#183448';c.textAlign='center';c.textBaseline='middle';c.font='900 '+Math.max(8,Math.round(r*(n>9?1.05:1.3)))+'px Arial';
 c.fillText(String(n),0,1);c.restore();
}
export function drawKarakuri(canvas,round,elapsed=0,duration=8000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const W=600,H=490,p=clamp(elapsed/duration),done=p>=1;
 c.clearRect(0,0,W,H);let bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#193345');bg.addColorStop(1,'#0e2136');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.strokeStyle='#557485';c.lineWidth=3;c.strokeRect(13,13,574,464);
 c.fillStyle='#e7dcc2';c.textAlign='center';c.font='bold 19px Arial';c.fillText('巨大からくり抽選',300,36);
 // Mechanical modules: always visible so the route is understandable.
 c.fillStyle='#284c5b';c.fillRect(28,53,544,79);
 c.strokeStyle='#97b7c0';c.lineWidth=3;c.strokeRect(28,53,544,79);
 c.fillStyle='#aec3c5';c.font='bold 13px Arial';c.fillText('全番号タンク',300,72);
 c.strokeStyle='#b7c6c5';c.lineWidth=10;c.lineCap='round';
 c.beginPath();c.moveTo(300,133);c.lineTo(300,151);c.lineTo(80,151);c.lineTo(80,210);c.lineTo(517,210);c.stroke();
 c.beginPath();c.moveTo(517,210);c.lineTo(517,256);c.lineTo(88,256);c.lineTo(88,318);c.lineTo(510,318);c.stroke();
 c.beginPath();c.moveTo(510,318);c.lineTo(510,363);c.lineTo(93,363);c.lineTo(93,427);c.lineTo(492,427);c.stroke();
 c.lineWidth=3;c.strokeStyle='#547384';c.setLineDash([7,10]);c.beginPath();c.moveTo(80,210);c.lineTo(517,210);c.moveTo(88,318);c.lineTo(510,318);c.moveTo(93,427);c.lineTo(492,427);c.stroke();c.setLineDash([]);
 // Rotating gear / wobbling bridge, always moderate contrast.
 c.save();c.translate(300,207);c.rotate(reduced?0:p*4.5);
 c.fillStyle='#b6c6cb';for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.fillRect(-6,-27,12,12);c.restore();}
 c.beginPath();c.arc(0,0,19,0,Math.PI*2);c.fill();c.fillStyle='#3b6071';c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(305,318);c.rotate(reduced?0:Math.sin(p*19)*.045);c.fillStyle='#c7ad79';c.fillRect(-110,-6,220,12);c.restore();
 c.fillStyle='#d1bb8e';c.font='bold 13px Arial';c.fillText('① 歯車ゲート',135,190);c.fillText('② 揺れる橋',145,295);
 c.fillText('決勝・逆転レール',300,396);c.fillText('GOAL',516,453);
 if(!round)return;
 const n=round.count;let stage=p<.27?0:p<.51?1:p<.75?2:3;
 let survivors=stage===0?n:stage===1?round.first.length:round.final.length;
 c.textAlign='right';c.fillStyle='#f0d69e';c.font='bold 17px Arial';c.fillText('残り '+survivors+' 個',559,76);
 if(reduced&&!done){stage=0;}
 // Visible balls follow four phases; rejected balls exit their respective gate.
 for(const b of round.members){
  if(stage>=1&&b.stage===0)continue;
  if(stage>=2&&b.stage===1)continue;
  if(done&&b.n!==round.winner)continue;
  let x,y,r;
  if(stage===0){
   const progress=smooth(p/.27),scatter=b.slot/n;
   x=43+(b.slot%12)*46;
   y=88+Math.floor(b.slot/12)*14;
   x=mix(x,80+435*scatter,progress);y=mix(y,210+Math.sin(scatter*12+b.phase)*11,progress);
   r=n>60?7:n>30?9:12;
  }else if(stage===1){
   const k=round.first.indexOf(b.n),t=smooth((p-.27)/.24);
   x=mix(75+430*k/Math.max(1,round.first.length-1),510-415*k/Math.max(1,round.first.length-1),t);
   y=mix(218,256,t)+Math.sin(p*24+b.phase)*3;r=round.first.length>30?10:13;
  }else if(stage===2){
   const k=round.final.indexOf(b.n),t=smooth((p-.51)/.24);
   x=mix(95+405*k/Math.max(1,round.final.length-1),490-390*k/Math.max(1,round.final.length-1),t);
   y=mix(323,363,t)+Math.sin(p*21+b.phase)*4;r=round.final.length>20?14:19;
  }else{
   const k=round.final.indexOf(b.n),q=clamp((p-.75)/.25),u=k/Math.max(1,round.final.length-1);
   // Apparent leader changes twice, final winner only overtakes very late.
   const wave=Math.sin((q*2.5+u)*Math.PI*2)*65*(1-q);
   x=105+u*320+wave+q*35+Math.sin(b.phase+q*17)*5;
   if(b.n===round.winner)x=mix(x,518,smooth((q-.68)/.32));
   else x=mix(x,Math.min(470,x),smooth((q-.65)/.35));
   y=427+Math.sin(q*12+b.phase)*3;
   r=round.final.length>20?15:round.final.length>10?19:24;
  }
  if(done){x=518;y=427;r=30;}
  ball(c,x,y,r,b.n,done);
 }
 if(done){c.fillStyle='#f5dfa1';c.textAlign='center';c.font='bold 22px Arial';c.fillText(round.winner+' 番がゴール！',300,465);}
 else{c.textAlign='left';c.fillStyle='#d8e6e6';c.font='13px Arial';c.fillText(stage===0?'全員スタート':stage===1?'歯車ゲート通過中':stage===2?'揺れる橋を突破！':'最後に逆転するのは？',33,467);}
}