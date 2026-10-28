// Stylized forty-faced polyhedron: 10 top, 20 middle, 10 bottom triangles.
// Stable geometry, soft-shaded faces, readable labels and a winner-facing finish.
const V=[],F=[],N=10,PI=Math.PI;
V.push([0,0,1.20]);
for(let i=0;i<N;i++){let a=i*2*PI/N;V.push([Math.cos(a),Math.sin(a),.52]);}
for(let i=0;i<N;i++){let a=(i+.5)*2*PI/N;V.push([Math.cos(a),Math.sin(a),-.52]);}
V.push([0,0,-1.20]);
for(let i=0;i<N;i++)F.push([0,1+i,1+(i+1)%N]);
for(let i=0;i<N;i++){const u=1+i,v=1+(i+1)%N,l=11+i,r=11+(i+N-1)%N;F.push([u,l,v]);F.push([u,r,l]);}
for(let i=0;i<N;i++)F.push([21,11+(i+1)%N,11+i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const unit=a=>{const d=Math.hypot(...a)||1;return a.map(v=>v/d);};
const normal=f=>unit(cross(sub(V[f[1]],V[f[0]]),sub(V[f[2]],V[f[0]])));
for(const f of F){let n=normal(f),cent=f.reduce((a,j)=>a.map((v,k)=>v+V[j][k]/3),[0,0,0]);if(dot(n,cent)<0){[f[1],f[2]]=[f[2],f[1]];}}
const normals=F.map(normal);
function rotate(p,ax,ay,az){
 let [x,y,z]=p;
 let t=y*Math.cos(ax)-z*Math.sin(ax);z=y*Math.sin(ax)+z*Math.cos(ax);y=t;
 t=x*Math.cos(ay)+z*Math.sin(ay);z=-x*Math.sin(ay)+z*Math.cos(ay);x=t;
 t=x*Math.cos(az)-y*Math.sin(az);y=x*Math.sin(az)+y*Math.cos(az);x=t;
 return [x,y,z];
}
function facing(p,n){
 const front=[0,0,1],u=unit(cross([0,1,0],n));
 // Special handling near poles
 const right=Math.hypot(...u)<.01?[1,0,0]:u;
 const up=cross(n,right);
 return [dot(p,right),dot(p,up),dot(p,n)];
}
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function drawDie3D(canvas,elapsed=0,duration=8000,winner=null,reduced=false){
 const c=canvas.getContext('2d');if(!c)return;
 const p=Math.max(0,Math.min(1,elapsed/duration)),done=winner!==null&&p>=1;
 c.clearRect(0,0,480,480);
 const active=winner===null?0:Math.max(0,Math.min(39,winner-1));
 const settle=ease((p-.65)/.35);
 const spin=1-ease(p),ax=elapsed*.0042*(.55+.45*spin)+.45*Math.sin(elapsed*.002),
 ay=elapsed*.0037*(.6+.4*spin),az=elapsed*.0018;
 const bounce=done||reduced?0:Math.abs(Math.sin(elapsed*.009))*28*(1-ease(p));
 const verts=V.map(v=>{
  const r=rotate(v,reduced?0:ax,reduced?0:ay,reduced?0:az);
  const dest=facing(v,normals[active]);
  return r.map((w,i)=>w*(1-settle)+dest[i]*settle);
 });
 const projected=verts.map(v=>[240+v[0]*145,243+v[1]*145-bounce,v[2]]);
 c.beginPath();c.ellipse(240,410,115+bounce*.15,16,0,0,2*PI);c.fillStyle='#25344b';c.fill();
 const faces=F.map((f,i)=>{
  const n=unit(cross(sub(verts[f[1]],verts[f[0]]),sub(verts[f[2]],verts[f[0]])));
  const q=f.map(j=>projected[j]);
  const area=Math.abs((q[1][0]-q[0][0])*(q[2][1]-q[0][1])-(q[2][0]-q[0][0])*(q[1][1]-q[0][1]))/2;
  return {i,q,n,area,depth:q.reduce((a,v)=>a+v[2],0)/3};
 }).filter(f=>f.n[2]>.02).sort((a,b)=>a.depth-b.depth);
 for(const f of faces){
  const chosen=done&&f.i===active;
  const luminance=.42+.42*Math.max(0,dot(f.n,unit([-.4,.6,1])));
  const blue=Math.round(63+70*luminance);
  c.beginPath();f.q.forEach((v,j)=>j?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();
  c.fillStyle=chosen?'#d4b678':`rgb(${Math.round(45+45*luminance)},${Math.round(66+48*luminance)},${blue})`;c.fill();
  c.lineWidth=1.5;c.strokeStyle=chosen?'#f2deb2':'#94a9b9';c.stroke();
  if((f.area>390&&f.n[2]>.24)||chosen){
   const x=f.q.reduce((a,v)=>a+v[0],0)/3,y=f.q.reduce((a,v)=>a+v[1],0)/3;
   c.font=`bold ${chosen?31:Math.min(18,Math.max(11,Math.sqrt(f.area)*.30))}px Arial`;
   c.fillStyle=chosen?'#172638':'#e2e9ef';c.textAlign='center';c.textBaseline='middle';c.fillText(String(f.i+1),x,y);
  }
 }
 if(done){c.fillStyle='#e1c78c';c.font='bold 20px Arial';c.textAlign='center';c.fillText('結果：'+winner+' 番',240,458);}
}
