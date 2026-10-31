// Minesweeper-inspired classroom draw. Winner is chosen externally before any animation.
export const MINES_DURATION = 14000;
const W=8,H=5,N=W*H;
function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
export function makeMinesRound(count,winner,seed){
 if(!Number.isInteger(count)||count<1||count>99||!Number.isInteger(winner)||winner<1||winner>count)throw new RangeError('Invalid draw');
 const rand=rng(seed),cells=Array.from({length:N},(_,i)=>i);
 for(let i=N-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 const mineSet=new Set(cells.slice(0,9));
 const neighbors=i=>{const x=i%W,y=Math.floor(i/W),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if((dx||dy)&&xx>=0&&xx<W&&yy>=0&&yy<H)out.push(yy*W+xx);}return out;};
 const counts=Array.from({length:N},(_,i)=>neighbors(i).filter(j=>mineSet.has(j)).length);
 const order=cells.slice(9).concat(cells.slice(0,9));
 return {count,winner,seed,order,counts,mines:[...mineSet]};
}
export function minesVisible(round,elapsed){
 return Math.min(N,Math.floor(Math.max(0,elapsed)/MINES_DURATION*N));
}
export function drawMines(canvas,round,elapsed,finished=false){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.clearRect(0,0,w,h);c.fillStyle='#132839';c.fillRect(0,0,w,h);
 c.fillStyle='#eaf4ff';c.textAlign='center';c.font='bold 23px system-ui';
 c.fillText(finished?'✨ 最後の1人が決定！':'💣 地雷を探せ！',w/2,37);
 c.font='15px system-ui';c.fillStyle='#b8cedd';c.fillText('数字は周囲8マスの地雷数。赤旗は地雷の印！',w/2,62);
 const size=54,gap=5,left=(w-W*(size+gap)+gap)/2,top=82;
 const opened=finished?N:minesVisible(round,elapsed);
 const openedSet=new Set(round.order.slice(0,opened)),mineSet=new Set(round.mines);
 for(let i=0;i<N;i++){
   const x=left+(i%W)*(size+gap),y=top+Math.floor(i/W)*(size+gap);
   const visible=openedSet.has(i),mine=mineSet.has(i);
   c.fillStyle=visible?(mine?'#864b50':'#d5e5ed'):'#53788f';
   c.fillRect(x,y,size,size);
   c.strokeStyle='#9ab8c7';c.lineWidth=1.5;c.strokeRect(x+.5,y+.5,size-1,size-1);
   if(visible){
     c.textAlign='center';c.font='bold 31px system-ui';
     if(mine){c.fillText('🚩',x+size/2,y+size*.72);}
     else if(round.counts[i]){c.fillStyle=['','#2860a3','#28744b','#b05d2c','#62499f','#963c63','#26787f','#444'][round.counts[i]];c.fillText(String(round.counts[i]),x+size/2,y+size*.71);}
   }else{c.fillStyle='#e3f1f8';c.font='bold 19px system-ui';c.fillText('?',x+size/2,y+size*.67);}
 }
 c.fillStyle='#dceef6';c.font='bold 17px system-ui';c.textAlign='center';
 c.fillText(finished?'🎉 当選番号  '+round.winner+' 番': '調査中… '+Math.round(opened/N*100)+'%',w/2,h-23);
}
