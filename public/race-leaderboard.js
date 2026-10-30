// Live top-six race leaderboard. Overlay only; never influences the draw.
export function drawRaceLeaderboard(canvas,positions,finished=false){
 const c=canvas.getContext('2d');if(!c||!positions.length)return;
 const ranked=positions.slice().sort((a,b)=>b.x-a.x||a.n-b.n).slice(0,6);
 const x=424,y=38,w=160,rowH=25,h=33+rowH*ranked.length;
 c.save();
 c.fillStyle='rgba(12,25,39,.94)';c.beginPath();c.roundRect(x,y,w,h,10);c.fill();
 c.strokeStyle='#9db4c5';c.lineWidth=1.5;c.stroke();
 c.fillStyle='#f2dca5';c.font='bold 15px Arial';c.textAlign='center';c.textBaseline='middle';
 c.fillText(finished?'確定順位 1〜6位':'LIVE 順位 1〜6位',x+w/2,y+16);
 ranked.forEach((r,i)=>{
  const cy=y+36+i*rowH;
  c.fillStyle=i===0?'#f0d48f':'#b8d3df';
  c.font='bold 15px Arial';c.textAlign='left';c.fillText(String(i+1)+'位',x+11,cy);
  c.fillStyle=i===0?'#f8e1a4':'#f1f5f8';c.font='900 20px Arial';c.textAlign='right';c.fillText(String(r.n)+'番',x+w-12,cy);
 });
 c.restore();
}
