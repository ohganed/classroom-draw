// Galton board visualizer. Selection is performed separately and uniformly.
// The randomized permutation is fixed for each round (not reshuffled per frame).
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function drawGalton(canvas,labels,elapsed=0,duration=8000,winner=null,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const W=600,H=530,n=labels.length,p=Math.max(0,Math.min(1,elapsed/duration));
 c.clearRect(0,0,W,H);
 c.fillStyle='#16283d';c.fillRect(20,12,560,505);
 c.strokeStyle='#71849a';c.lineWidth=4;c.strokeRect(20,12,560,505);
 const left=30,right=570,cell=(right-left)/n,slotsY=454;
 // Fixed peg lattice, muted colors without flashing.
 for(let row=0;row<9;row++){
  const y=82+row*39;
  for(let j=0;j<=row+2;j++){
   const x=300+(j-(row+2)/2)*Math.min(49,470/(row+2));
   c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fillStyle='#8a9cb0';c.fill();
  }
 }
 for(let i=0;i<n;i++){
  const x=left+i*cell;
  c.fillStyle=i%2?'#354b61':'#40576d';
  c.fillRect(x+0.5,slotsY,Math.max(0,cell-1),54);
  c.strokeStyle='#8296aa';c.lineWidth=.7;c.strokeRect(x+.5,slotsY,Math.max(0,cell-1),54);
  c.save();c.translate(x+cell/2,slotsY+27);
  if(n>55)c.rotate(-Math.PI/2);
  c.fillStyle='#e0e8ed';c.font='bold '+(n>65?'9':n>40?'10':'12')+'px Arial';
  c.textAlign='center';c.textBaseline='middle';c.fillText(String(labels[i]),0,0);c.restore();
 }
 const pos=winner===null?Math.floor(n/2):labels.indexOf(winner);
 const goalX=left+(Math.max(0,pos)+.5)*cell;
 let x=300,y=39;
 if(!reduced){
  const t=smooth(p);
  const anchors=[[300,39],[275,97],[326,145],[261,189],[344,242],[287,296],[320,350],[goalX,424],[goalX,slotsY+15]];
  const z=t*(anchors.length-1),k=Math.min(anchors.length-2,Math.floor(z)),a=smooth(z-k);
  x=anchors[k][0]+(anchors[k+1][0]-anchors[k][0])*a;
  y=anchors[k][1]+(anchors[k+1][1]-anchors[k][1])*a;
 }
 if(p>=1){x=goalX;y=slotsY+15;}
 const shade=c.createRadialGradient(x-5,y-5,1,x,y,15);
 shade.addColorStop(0,'#d9e1e7');shade.addColorStop(1,'#6a8094');
 c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fillStyle=shade;c.fill();
 if(p>=1&&winner!==null){c.textAlign='center';c.fillStyle='#e3c888';c.font='bold 20px Arial';c.fillText(String(winner)+' 番',300,27);}
}
