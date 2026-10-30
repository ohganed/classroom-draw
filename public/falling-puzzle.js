// Original falling-block puzzle lottery. App selects the winner uniformly.
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=cl(x);return x*x*(3-2*x)};
export function makeFallingRound(count,winner,seed){
 let s=seed>>>0||1,r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const nums=Array.from({length:count},(_,i)=>i+1).filter(n=>n!==winner);
 for(let i=nums.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[nums[i],nums[j]]=[nums[j],nums[i]];}
 // Each nine-block batch fills a row with a harmless "wildcard" tile.
 // Cleared rows actually contain ten occupied cells; the last number is preserved.
 const batches=[];for(let i=0;i<nums.length;i+=9)batches.push(nums.slice(i,i+9));
 const events=[];let time=0;
 for(let k=0;k<batches.length;k++){
  const group=batches[k];const blockOrder=[...group];
  for(let j=blockOrder.length-1;j>0;j--){const v=Math.floor(r()*(j+1));[blockOrder[j],blockOrder[v]]=[blockOrder[v],blockOrder[j]];}
  for(let j=0;j<blockOrder.length;j++){
   events.push({kind:'drop',n:blockOrder[j],col:j,row:Math.min(k,5),start:time,dur:.24});time+=.25;
  }
  if(group.length===9){events.push({kind:'wild',col:9,row:Math.min(k,5),start:time,dur:.24});time+=.25;
   events.push({kind:'clear',start:time,dur:.40,items:[...group]});time+=.45;
  }else{events.push({kind:'chain',start:time,dur:.52,items:[...group]});time+=.56;}
 }
 return {winner,count,events,seconds:time+2.8};
}
export const fallingDuration=round=>Math.ceil((round?.seconds??18)*1000);
function tile(c,x,y,n,alpha=1,scale=1){
 c.save();c.globalAlpha=alpha;c.translate(x+23,y+23);c.scale(scale,scale);
 c.fillStyle=n===null?'#e8cb75':['#73badc','#d68aa5','#9ac17d','#e2ae6e'][n%4];
 c.beginPath();c.roundRect(-21,-21,42,42,5);c.fill();
 c.fillStyle='#193148';c.font='900 17px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(n===null?'★':n,0,1);c.restore();
}
export function drawFalling(canvas,round,elapsed=0,duration=18000,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;const sec=cl(elapsed/1000,0,round?.seconds??18);
 c.fillStyle='#121b31';c.fillRect(0,0,600,480);
 c.fillStyle='#f7e6b4';c.font='bold 22px Arial';c.textAlign='center';c.fillText('落ちものパズル・大混乱！',300,34);
 c.fillStyle='#233a55';c.beginPath();c.roundRect(43,58,514,353,10);c.fill();
 for(let col=0;col<10;col++)for(let row=0;row<6;row++){c.strokeStyle='#344f6b';c.strokeRect(53+col*49,72+row*51,46,47);}
 if(!round)return;
 const state=new Map();let flashRow=-1,latest=0;
 for(const ev of round.events){
  if(sec<ev.start){if(ev.kind==='drop'||ev.kind==='wild'){ /* not yet */ }break;}
  latest=ev.start;
  if(ev.kind==='drop'||ev.kind==='wild'){
   const key=ev.kind==='wild'?'wild-'+ev.row:ev.n;
   const y=72+ev.row*51,x=53+ev.col*49;
   state.set(key,{n:ev.kind==='wild'?null:ev.n,x,y,born:ev.start,dur:ev.dur});
  }else if(ev.kind==='clear'||ev.kind==='chain'){
   if(sec>=ev.start+ev.dur){for(const n of ev.items)state.delete(n);if(ev.kind==='clear')state.delete('wild-'+Math.min(round.events.indexOf(ev),5));}
   else{for(const n of ev.items){const item=state.get(n);if(item)item.dying=(sec-ev.start)/ev.dur;}flashRow=ev.kind==='clear'?1:0;}
  }
 }
 // Completed clear events also remove their wildcard via the row that was filled.
 for(const ev of round.events)if(ev.kind==='clear'&&sec>=ev.start+ev.dur){
  for(const [key,item] of state)if(typeof key==='string'&&key.startsWith('wild-')&&Math.abs(item.born-ev.start)<.6)state.delete(key);
 }
 for(const item of state.values()){
  const u=cl((sec-item.born)/item.dur),y=-36+(item.y+36)*ease(u);
  tile(c,item.x,y,item.n,1-(item.dying??0),1+(item.dying??0)*.15);
 }
 const finale=round.events.length?sec>=round.events[round.events.length-1].start+round.events[round.events.length-1].dur+.5:false;
 const v=ease((sec-(round.seconds-2.2))/.9);
 if(v>0){tile(c,273,217,round.winner,v,1+v*1.7);c.fillStyle='#f6e7be';c.font='bold 20px Arial';c.fillText(round.winner+'番が最後まで残った！',300,371);}
 c.fillStyle='#f7e6b4';c.font='bold 17px Arial';c.fillText(v>=1?'当選番号が決定！':flashRow>=0?'連鎖消去！': '落下！ 整列！ また落下！',300,458);
}
