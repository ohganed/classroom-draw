// Galton board: genuine binomial counts, independently shuffled number labels.
export function makeGaltonRound(count,randomInt){
 const labels=Array.from({length:count},(_,i)=>i+1);
 for(let i=count-1;i>0;i--){let j=randomInt(i+1)-1;let t=labels[i];labels[i]=labels[j];labels[j]=t;}
 const drops=[],counts=Array(count).fill(0);
 for(let b=0;b<600;b++){
  let slot=0;
  for(let k=0;k<count-1;k++)slot+=randomInt(2)-1;
  drops.push(slot);counts[slot]++;
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
 for(let row=0;row<18;row++)for(let j=0;j<=row+2;j++){
  const x=300+(j-(row+2)/2)*Math.min(24,500/(row+2)),y=50+row*21;
  c.fillStyle='#8193a6';c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();
 }
 const visible=Math.floor(round.drops.length*Math.max(0,(p-.1)/.9)),bins=Array(n).fill(0);
 for(let b=0;b<visible;b++)bins[round.drops[b]]++;
 const max=Math.max(1,...round.counts);
 for(let i=0;i<n;i++){
  const x=left+i*cell,h=80*bins[i]/max;
  c.fillStyle='#344c62';c.fillRect(x+.3,411,Math.max(.3,cell-.6),95);
  c.fillStyle=p>=1&&i===round.slot?'#d3bb7f':'#8da0b1';
  c.fillRect(x+.4,489-h,Math.max(.3,cell-.8),h);
  c.fillStyle='#ecf0f3';c.textAlign='center';c.font='bold '+(n>50?8:11)+'px Arial';
  c.fillText(String(round.labels[i]),x+cell/2,501);
 }
 if(!reduced&&p<1){
  for(let j=0;j<8;j++){
   const u=((p*600-j)/18)%1;if(u<0)continue;
   const x=300+Math.sin((p*600-j)*1.73)*u*155,y=45+u*352;
   c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fillStyle='#b9c9d6';c.fill();
  }
 }
 if(p>=1){c.fillStyle='#e3c887';c.font='bold 20px Arial';c.textAlign='center';c.fillText(round.winner+' 番 / '+round.counts[round.slot]+' 個',300,33);}
}
