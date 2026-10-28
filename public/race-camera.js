// TV-style tracking camera: zooms into the front pack without changing race results.
// Gentle stable movements; no zoom pulses, flashing or camera shake.
export function drawRaceCamera(canvas,positions,progress,kind='ball'){
 if(progress<.60||!positions.length)return;
 const c=canvas.getContext('2d');if(!c)return;
 const ranked=positions.slice().sort((a,b)=>b.x-a.x);
 const leaders=ranked.slice(0,Math.min(5,ranked.length));
 const zoom=Math.min(1,(progress-.60)/.13);
 const y=68+(1-zoom)*285,h=305;
 c.save();
 c.globalAlpha=Math.min(1,zoom);
 c.fillStyle='#132338';c.fillRect(44,y,512,h);
 c.strokeStyle='#9aafc2';c.lineWidth=2;c.strokeRect(44,y,512,h);
 c.fillStyle='#d7c28e';c.font='bold 17px Arial';c.textAlign='left';c.textBaseline='alphabetic';
 c.fillText(progress>.82?'ゴール前・接戦カメラ':'先頭集団を追跡',63,y+31);
 const camera=leaders[0].x;
 const scale=3.2;
 const laneH=44;
 for(let i=0;i<leaders.length;i++){
  const e=leaders[i],ly=y+66+i*laneH;
  c.strokeStyle='#4c647a';c.lineWidth=1;c.beginPath();c.moveTo(109,ly+laneH/2);c.lineTo(538,ly+laneH/2);c.stroke();
  c.fillStyle='#dee6ed';c.font='bold 16px Arial';c.textAlign='right';c.textBaseline='middle';c.fillText(String(e.n),97,ly);
  // The leading racer is near the right edge, the others trail by their actual gap.
  const bx=Math.max(125,Math.min(516,497+(e.x-camera)*scale));
  if(kind==='horse'){
   c.save();c.translate(bx,ly);c.scale(1.5,1.5);
   c.fillStyle=i===0?'#d8c28d':'#9eb3c5';
   c.beginPath();c.ellipse(0,0,12,6,0,0,Math.PI*2);c.fill();
   c.beginPath();c.moveTo(6,-3);c.lineTo(11,-13);c.lineTo(17,-10);c.lineTo(15,0);c.closePath();c.fill();
   c.fillRect(-8,4,3,11);c.fillRect(6,4,3,11);
   c.restore();
  }else{
   c.beginPath();c.arc(bx,ly,11,0,Math.PI*2);c.fillStyle=i===0?'#d8c28d':'#9eb3c5';c.fill();
   c.strokeStyle='#e3eaf0';c.lineWidth=1;c.stroke();
  }
 }
 c.font='12px Arial';c.fillStyle='#adbfcd';c.textAlign='left';c.textBaseline='alphabetic';
 c.fillText('先頭 '+leaders[0].n+' 番  |  差を拡大表示',64,y+286);
 c.restore();
}
