import { drawRaceCamera, raceProgress } from './race-camera.js';
// Quiet horse-racing visualization. Winner and scenario are chosen independently in app.js.
// No flashing, strobes, or background color changes.
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function drawHorseRace(canvas,count=40,elapsed=0,duration=8000,winner=null,reduced=false,story='front'){
 const c=canvas.getContext('2d');if(!c)return;
 const p=raceProgress(elapsed,duration),done=winner!==null&&p>=1;
 const x0=56,x1=541,y0=40,y1=407,h=(y1-y0)/count,dist=x1-x0-20;
 const positions=[];
 const target=winner??1,rival=(target%count)+1,rival2=((target+Math.floor(count/2))%count)+1;
 c.clearRect(0,0,600,450);
 c.fillStyle='#1d3240';c.fillRect(36,29,514,389);
 for(let n=1;n<=count;n++){
  const y=y0+(n-.5)*h;
  c.strokeStyle='#466576';c.lineWidth=1;c.beginPath();c.moveTo(38,y+h/2);c.lineTo(549,y+h/2);c.stroke();
  const base=ease(p),variation=(1-p)*Math.sin(p*8+n*1.71)*.004;
  let q;
  if(story==='front'){
   q=n===target?ease(Math.min(1,p*1.09)):base*(.71+.16*((n*7)%13)/12);
  }else if(story==='close'){
   q=n===target?base:(n===rival||n===rival2)?base*(.98-.025*ease((p-.86)/.14)):base*(.78+.14*((n*3)%11)/10);
  }else{
   const early=.43*ease(p/.38),mid=.32*ease((p-.29)/.39),late=.25*ease((p-.64)/.36);
   const track=early+mid+late;
   q=n===target?track-.08*ease(p/.3)+.08*ease((p-.64)/.36)
    :n===rival?track+.10*ease(p/.29)-.23*ease((p-.58)/.42)
    :n===rival2?track+.13*ease((p-.22)/.3)-.27*ease((p-.63)/.37)
    :track*(.74+.18*((n*5)%13)/12);
  }
  q=Math.max(0,Math.min(n===target?1:.975,q+variation));
  if(reduced&&!done)q=0;
  if(done&&n===target)q=1;
  const x=x0+dist*q;positions.push({n,x,y});const scale=Math.max(.3,Math.min(1,h/11));
  c.fillStyle='#c6d3de';c.textAlign='right';c.textBaseline='middle';c.font='bold '+(count>55?'7':'10')+'px Arial';c.fillText(String(n),32,y);
  // Stylized horse silhouette, drawn within each lane without flashing.
  c.save();c.translate(x,y);c.scale(scale,scale);
  c.fillStyle=done&&n===target?'#dcc485':n%3===0?'#b8a38c':n%3===1?'#91a4b5':'#a7b2b9';
  c.beginPath();c.ellipse(0,0,9,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(5,-2);c.lineTo(9,-9);c.lineTo(13,-7);c.lineTo(12,-1);c.closePath();c.fill();
  c.fillRect(-6,2,2,6);c.fillRect(4,2,2,6);
  c.beginPath();c.moveTo(-8,-1);c.lineTo(-14,-7);c.lineTo(-10,0);c.fill();
  c.restore();
 }
 c.fillStyle='#d3bc7d';c.fillRect(x1,29,4,389);
 c.fillStyle='#d9e4e9';c.textAlign='center';c.font='bold 18px Arial';c.fillText('GOAL',x1-18,23);
 if(!reduced&&!done)drawRaceCamera(canvas,positions,p,'horse');
 if(done){c.fillStyle='#e3cb87';c.font='bold 25px Arial';c.fillText(target+' 番 ゴール！',300,443);}
}
