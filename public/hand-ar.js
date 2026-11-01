const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d'),video=$('camera-feed'),W=1200,H=675;
let n=40,balls=[],playing=false,won=false,stream=null,tracker=null,cameraReady=false,detecting=false,lastVideo=-1,lastShuffle=0,lastHit=0,handPoints=[],sound=false,audio=null,frame=0,justHit=null;
function randomInt(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function beep(freq,d=.13){if(!sound||!audio)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='triangle';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+d+.01)}
function reset(){n=Math.max(2,Math.min(40,Number($('count').value)||40));$('count').value=n;const positions=shuffle(Array.from({length:40},(_,i)=>i));const ids=shuffle(Array.from({length:n},(_,i)=>i+1));balls=ids.map((num,i)=>({num,alive:true,x:110+(positions[i]%8)*140,y:111+Math.floor(positions[i]/8)*112,r:36}));playing=false;won=false;lastShuffle=0;lastHit=0;justHit=null;$('result').textContent='最後まで残る番号は？';$('stats').textContent='残り '+n+' / '+n;$('start').disabled=false}
function reassignNumbers(){const survivors=balls.filter(b=>b.alive);const ids=shuffle(Array.from({length:n},(_,i)=>i+1));survivors.forEach((b,i)=>b.num=ids[i]);}
function eliminate(x,y){if(!playing||won||performance.now()-lastHit<210)return;let best=null,dist=Infinity;for(const b of balls){if(!b.alive)continue;const d=Math.hypot(x-b.x,y-b.y);if(d<b.r+12&&d<dist){best=b;dist=d}}if(!best)return;
 best.alive=false;justHit={x:best.x,y:best.y,t:performance.now()};lastHit=performance.now();beep(170);
 const remain=balls.filter(b=>b.alive);$('stats').textContent='残り '+remain.length+' / '+n;
 if(remain.length===1){playing=false;won=true;$('result').textContent='🏆 '+remain[0].num+'番が優勝！';beep(987);$('start').disabled=false}
}
function render(){const now=performance.now();
 if(cameraReady&&video.readyState>=2){ctx.save();ctx.translate(W,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,W,H);ctx.restore();}
 else{const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#174969');grad.addColorStop(1,'#22214d');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.09)';for(let i=0;i<14;i++){ctx.beginPath();ctx.arc((i*137)%W,(i*101)%H,30+i%3*22,0,7);ctx.fill()}}
 ctx.fillStyle='rgba(10,22,46,.35)';ctx.fillRect(0,0,W,52);
 ctx.textAlign='center';ctx.fillStyle='#fff6b3';ctx.font='bold 29px system-ui';ctx.fillText('HAND AR  •  TOUCH TO ERASE',W/2,36);
 for(const b of balls){if(!b.alive)continue;ctx.fillStyle=['#f7b4c6','#ffe195','#ade9f6','#c8f2b8','#e2bdf9'][b.num%5];ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#1a3650';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#142941';ctx.font='900 37px system-ui';ctx.textBaseline='middle';ctx.fillText(b.num,b.x,b.y);ctx.textBaseline='alphabetic'}
 if(justHit&&now-justHit.t<460){const z=(now-justHit.t)/460;ctx.strokeStyle='rgba(255,222,111,'+(1-z)+')';ctx.lineWidth=8;ctx.beginPath();ctx.arc(justHit.x,justHit.y,42+z*45,0,7);ctx.stroke()}
 for(const p of handPoints){ctx.fillStyle='#91fce1';ctx.beginPath();ctx.arc(p.x,p.y,12,0,7);ctx.fill();ctx.strokeStyle='#194555';ctx.lineWidth=3;ctx.stroke()}
 if(won){ctx.fillStyle='rgba(12,27,49,.94)';ctx.fillRect(250,270,700,130);ctx.fillStyle='#ffe5a0';ctx.font='bold 55px system-ui';ctx.fillText($('result').textContent,600,350)}
 frame=requestAnimationFrame(loop)}
function loop(){const now=performance.now();
 if(playing&&now-lastShuffle>=1000){reassignNumbers();lastShuffle=now;}
 if(cameraReady&&tracker&&video.readyState>=2&&video.currentTime!==lastVideo){lastVideo=video.currentTime;try{const result=tracker.detectForVideo(video,now);handPoints=[];for(const landmarks of (result.landmarks||[])){for(const i of [4,8,12,16,20]){const p=landmarks[i];if(!p)continue;const x=(1-p.x)*W,y=p.y*H;handPoints.push({x,y});if(playing)eliminate(x,y)}}}catch(e){$('status').textContent='手の検出で問題が発生しました。画面タップも利用できます。';tracker=null}}
 render()}
async function beginCamera(){if(cameraReady)return;$('camera').disabled=true;$('status').textContent='カメラと手の検出モデルを準備しています…';
 try{if(!navigator.mediaDevices?.getUserMedia)throw Error('HTTPSとカメラ対応ブラウザが必要です');
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}});video.srcObject=stream;await video.play();cameraReady=true;
  const {HandLandmarker,FilesetResolver}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
  const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
  const opts={baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numHands:2};
  try{tracker=await HandLandmarker.createFromOptions(vision,opts)}catch{opts.baseOptions.delegate='CPU';tracker=await HandLandmarker.createFromOptions(vision,opts)}
  $('status').textContent='手の追跡が使えます。抽選開始後に指先でボールを触ってください。';
 }catch(e){$('status').textContent='カメラ・手追跡を開始できません：'+e.message+'。画面のタップで遊べます。'}
 finally{$('camera').disabled=false}}
$('camera').onclick=beginCamera;
$('start').onclick=()=>{reset();playing=true;lastShuffle=performance.now();$('start').disabled=true;$('status').textContent=cameraReady?'手でボールに触れて消してください。':'ボールをタップして消してください。';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(650)}};
$('reset').onclick=reset;$('count').onchange=reset;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';if(sound){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();beep(820)}};
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;eliminate(x,y)});
window.addEventListener('pagehide',()=>{stream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(frame)});
reset();frame=requestAnimationFrame(loop);