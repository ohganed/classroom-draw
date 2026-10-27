// Galton board: genuine binomial counts, independently shuffled number labels.
export function makeGaltonRound(count,randomInt){
 const labels=Array.from({length:count},(_,i)=>i+1);
 for(let i=count-1;i>0;i--){let j=randomInt(i+1)-1;let t=labels[i];labels[i]=labels[j];labels[j]=t;}
 const drops=[],counts=Array(count).fill(0);
 for(let b=0;b<600;b++){
  let slot=0;const turns=[];
  for(let k=0;k<count-1;k++){const step=randomInt(2)-1;turns.push(step);slot+=step;}
  drops.push({slot,turns});counts[slot]++;
 }
 const max=Math.max(...counts);
 const ties=[];counts.forEach((v,i)=>{if(v===max)ties.push(i)});
 const slot=ties[randomInt(ties.length)-1];
 return {labels,drops,counts,slot,winner:labels[slot]};
}
export function drawGalton(canvas,round,elapsed=0,duration=8000,reduced=false){
 if(!round)return;
 const c=canvas.getContext('2d');if(!c)return;
 const n=round.labels.length,p=Math.min(1,elapsed/duration);
 c.clearRect(0,0,600,530);c.fillStyle='#182a3f';c.fillRect(20,12,560,506);
 const left=30,width=540,cell=width/n;
 for(let row=0;row<n-1;row++)for(let j=0;j<=row;j++){
  if(n>65&&row%2)continue;
  const x=300+(j-row/2)*Math.min(29,500/(row+1)),y=45+row*355/Math.max(1,n-1);
  c.fillStyle='#8193a6';c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();
 }
 const visible=Math.min(round.drops.length,Math.max(0,Math.floor(p*(round.drops.length+24)-24))),bins=Array(n).fill(0);
 for(let b=0;b<visible;b++)bins[round.drops[b].slot]++;
 const max=Math.max(1,...round.counts);
 for(let i=0;i<n;i++){
  const x=left+i*cell,h=80*bins[i]/max;
  c.fillStyle='#344c62';c.fillRect(x+.3,411,Math.max(.3,cell-.6),95);
  c.fillStyle=p>=1&&i===round.slot?'#d3bb7f':'#8da0b1';
  c.fillRect(x+.4,489-h,Math.max(.3,cell-.8),h);
  c.fillStyle='#ecf0f3';c.textAlign='center';c.font='bold '+(n>50?8:11)+'px Arial';
  c.fillText(String(round.labels[i]),x+cell/2,501);
 }
 // Draw each ball on its OWN pre-sampled left/right route; outcome matches its path.
 // A ball travels through count-1 pegs (binomial walk) and enters exactly its sampled slot.
 if(!reduced&&p<1){
  const total=round.drops.length, launch=p*(total+24);
  for(let j=Math.max(0,Math.floor(launch)-23);j<Math.min(total,Math.ceil(launch));j++){
   const age=(launch-j)/24;
   if(age<0||age>=1)continue;
   const d=round.drops[j],turns=d.turns;
   // Enlarge the visible left/right steps: at 40 pockets a literal step
   // is only 6.75px and all paths appear identical on a phone.
   const stages=Math.min(14,turns.length);
   const q=age*(stages+1),stage=Math.min(stages,Math.floor(q)),alpha=q-stage;
   function point(t){
    if(t===stages+1)return [left+(d.slot+.5)*cell,409];
    let balance=0;
    for(let h=0;h<t;h++)balance+=turns[h*2%turns.length]?1:-1;
    return [Math.max(49,Math.min(551,300+balance*26)),45+t*345/(stages+1)];
   }
   const A=point(stage),B=point(Math.min(stages+1,stage+1));
   const x=A[0]+(B[0]-A[0])*alpha,y=A[1]+(B[1]-A[1])*alpha;
   c.beginPath();c.arc(x,y,Math.max(1.5,Math.min(4,cell*.38)),0,Math.PI*2);
   c.fillStyle='#b9c9d6';c.fill();
  }
 }
 if(p>=1){c.fillStyle='#e3c887';c.font='bold 20px Arial';c.textAlign='center';c.fillText(round.winner+' 番 / '+round.counts[round.slot]+' 個',300,33);}
}
