// Calm pinball drawing: one silver marble, fixed pegs and numbered destination pockets.
// The winner is chosen independently by the app's uniform random generator.
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function drawPinball(canvas,count=40,elapsed=0,duration=8000,winner=null,reduced=false){
 const g=canvas.getContext('2d');if(!g)return;
 const W=600,H=520,p=Math.max(0,Math.min(1,elapsed/duration));
 g.clearRect(0,0,W,H);
 g.fillStyle='#15283d';g.fillRect(26,16,548,488);
 g.strokeStyle='#71849c';g.lineWidth=5;g.strokeRect(26,16,548,488);
 // Permanent rounded bumpers; no flashing or alternating brightness.
 const bumps=[[160,110],[315,90],[455,134],[230,210],[399,222],[128,304],[325,316],[485,302]];
 for(const [x,y] of bumps){
  g.beginPath();g.arc(x,y,25,0,Math.PI*2);g.fillStyle='#556b83';g.fill();g.strokeStyle='#9daec0';g.lineWidth=3;g.stroke();
  g.beginPath();g.arc(x-5,y-6,9,0,Math.PI*2);g.fillStyle='#899bab';g.fill();
 }
 const columns=Math.min(20,count),rows=Math.ceil(count/columns);
 const left=40,right=560,slotW=(right-left)/columns,slotTop=403,slotH=(490-slotTop)/rows;
 g.textAlign='center';g.textBaseline='middle';
 for(let i=0;i<count;i++){
  const row=Math.floor(i/columns),col=i%columns,x=left+col*slotW,y=slotTop+row*slotH;
  g.fillStyle='#344c63';g.fillRect(x+1,y+1,slotW-2,slotH-2);
  g.strokeStyle='#8093a6';g.lineWidth=1;g.strokeRect(x+1,y+1,slotW-2,slotH-2);
  g.fillStyle='#dce5ed';g.font='bold '+(rows>3?'9':columns>16?'12':'15')+'px Arial';
  g.fillText(String(i+1),x+slotW/2,y+slotH*.52);
 }
 // Piecewise quadratic path through bumpers: settles at the selected pocket.
 const destination=winner===null?1:winner;
 const col=(destination-1)%columns,row=Math.floor((destination-1)/columns);
 const targetX=left+(col+.5)*slotW,targetY=slotTop+row*slotH+slotH/2;
 const points=[[300,29],[245,67],[385,112],[173,173],[431,243],[241,287],[356,343],[targetX,379],[targetX,targetY]];
 const positions=[0,.12,.25,.39,.52,.67,.79,.91,1];
 let x=300,y=29;
 if(!reduced){
  const t=smooth(p);
  let k=0;while(k<positions.length-2&&t>positions[k+1])k++;
  const a=smooth((t-positions[k])/(positions[k+1]-positions[k]));
  x=mix(points[k][0],points[k+1][0],a);
  y=mix(points[k][1],points[k+1][1],a);
 }
 if(p>=1){x=targetX;y=targetY;}
 // Metal ball, muted reflective gradient; no glow or sudden flash.
 const grad=g.createRadialGradient(x-7,y-7,2,x,y,17);
 grad.addColorStop(0,'#e0e8ee');grad.addColorStop(.5,'#97a9bb');grad.addColorStop(1,'#53697e');
 g.beginPath();g.arc(x,y,15,0,Math.PI*2);g.fillStyle=grad;g.fill();
 g.strokeStyle='#b8c8d6';g.lineWidth=1.5;g.stroke();
 if(p>=1&&winner!==null){
  g.fillStyle='#d7be80';g.font='bold 20px Arial';g.fillText(winner+' 番に決定',300,391);
 }
}
