// Semi-physical pinball: fixed-step gravity, wall and circular bumper collisions.
// The preselected uniform winner controls only the final collection chute.
// This is an animation, not an unbiased physical lottery.
const BUMPS=[[160,110],[315,90],[455,134],[230,210],[399,222],[128,304],[325,316],[485,302]];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const cache=new Map();
function trajectory(count,winner,duration){
 const key=count+':'+winner+':'+duration;
 if(cache.has(key))return cache.get(key);
 const columns=Math.min(20,count),rows=Math.ceil(count/columns),sw=520/columns,sh=87/rows;
 const col=(winner-1)%columns,row=Math.floor((winner-1)/columns);
 const goalX=40+(col+.5)*sw,goalY=403+(row+.5)*sh;
 const frames=[];let x=295,y=37,vx=145,vy=12;
 const dt=1/120,steps=Math.ceil(duration/1000/dt);
 // Gravity, drag and normal impulse from immovable bumpers; constant simulation step.
 for(let k=0;k<=steps;k++){
  frames.push([x,y]);
  if(k===steps)break;
  const t=k/steps;
  if(t>.79){
   // Visible sloped collection chute: late controlled steering toward the assigned pocket.
   // Blend rather than teleport so the final outcome is always readable.
   const wanted=goalX, dx=wanted-x;
   vx+=clamp(dx*13-vx*5,-3500,3500)*dt;
   vy+=Math.max(0,160-vy)*4*dt;
  }else{
   vy+=650*dt;
   vx*=.999;vy*=.999;
  }
  x+=vx*dt;y+=vy*dt;
  if(x<50){x=50;vx=Math.abs(vx)*.82;}
  if(x>550){x=550;vx=-Math.abs(vx)*.82;}
  if(y<35){y=35;vy=Math.abs(vy)*.78;}
  if(t<=.79){
   for(const [bx,by] of BUMPS){
    const dx=x-bx,dy=y-by,dist=Math.hypot(dx,dy),minimum=33;
    if(dist<minimum){
     const nx=dist>1e-6?dx/dist:1,ny=dist>1e-6?dy/dist:0;
     x=bx+nx*minimum;y=by+ny*minimum;
     const vn=vx*nx+vy*ny;
     if(vn<0){vx-=(1+.84)*vn*nx;vy-=(1+.84)*vn*ny;}
    }
   }
   if(y>380){y=380;vy=-Math.abs(vy)*.75;vx*=.94;}
  }else{
   // Once inside the collection chute, constrain vertical motion.
   const limit=goalY-16;
   if(y>limit){y=limit;vy=0;}
  }
 }
 // The ball settles in the assigned numbered pocket, not an arbitrary canvas location.
 // Smooth final entry into the pocket across the last 8% of frames.
 const from=Math.floor(frames.length*.92),anchor=frames[from];
 for(let i=from;i<frames.length;i++){const u=(i-from)/(frames.length-1-from);const q=u*u*(3-2*u);frames[i]=[anchor[0]+(goalX-anchor[0])*q,anchor[1]+(goalY-anchor[1])*q];}
 const result={frames,goalX,goalY,columns,rows,sw,sh};
 cache.set(key,result);if(cache.size>8)cache.delete(cache.keys().next().value);
 return result;
}
export function drawPinball(canvas,count=40,elapsed=0,duration=8000,winner=null,reduced=false){
 const g=canvas.getContext('2d');if(!g)return;
 const p=clamp(elapsed/duration,0,1);
 g.clearRect(0,0,600,520);
 g.fillStyle='#15283d';g.fillRect(26,16,548,488);
 g.strokeStyle='#71849c';g.lineWidth=4;g.strokeRect(26,16,548,488);
 for(const [x,y] of BUMPS){
  g.beginPath();g.arc(x,y,25,0,2*Math.PI);g.fillStyle='#556b83';g.fill();
  g.strokeStyle='#9daec0';g.lineWidth=3;g.stroke();
  g.beginPath();g.arc(x-5,y-6,8,0,2*Math.PI);g.fillStyle='#899bab';g.fill();
 }
 const columns=Math.min(20,count),rows=Math.ceil(count/columns),sw=520/columns,sh=87/rows;
 g.textAlign='center';g.textBaseline='middle';
 for(let i=0;i<count;i++){
  const x=40+(i%columns)*sw,y=403+Math.floor(i/columns)*sh;
  g.fillStyle='#344c63';g.fillRect(x+1,y+1,sw-2,sh-2);
  g.strokeStyle='#8093a6';g.lineWidth=1;g.strokeRect(x+1,y+1,sw-2,sh-2);
  g.fillStyle='#dce5ed';g.font='bold '+(rows>3?9:columns>16?12:15)+'px Arial';
  g.fillText(String(i+1),x+sw/2,y+sh/2);
 }
 const sim=trajectory(count,winner??1,duration);
 const frame=sim.frames[Math.min(sim.frames.length-1,Math.floor(p*(sim.frames.length-1)))];
 let [x,y]=reduced&&p<1?[295,37]:frame;
 if(p>=1){x=sim.goalX;y=sim.goalY;}
 const grad=g.createRadialGradient(x-5,y-5,1,x,y,13);
 grad.addColorStop(0,'#e0e8ee');grad.addColorStop(.5,'#97a9bb');grad.addColorStop(1,'#53697e');
 g.beginPath();g.arc(x,y,12,0,Math.PI*2);g.fillStyle=grad;g.fill();
 g.strokeStyle='#b8c8d6';g.lineWidth=1.5;g.stroke();
 if(p>=1&&winner!==null){g.fillStyle='#d7be80';g.font='bold 20px Arial';g.fillText(winner+' 番に決定',300,391);}
}
