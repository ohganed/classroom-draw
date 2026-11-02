const $=id=>document.getElementById(id),cv=$('stage'),g=cv.getContext('2d'),video=$('feed'),W=1200,H=760;
let lastCombat=0,battleStart=0,previousLean=0,lastDirection=0,stillCounter=0,attackCount=0;
let n=40,people=[],live=false,champion=null,pose=null,stream=null,ready=false,lastVideo=-1,frameId=0,lastFrame=0,sound=true,ac=null,beat=0,nextBeat=0,round=0,body={left:0,right:0,head:0,shoulder:0,lean:0,leftElbow:0,rightElbow:0},target={left:0,right:0,head:0,shoulder:0,lean:0,leftElbow:0,rightElbow:0},visible=false,parts=[],fading=[];
const BASE_BPM=122,MIN_BPM=80,MAX_BPM=200;let currentBpm=BASE_BPM,targetBpm=BASE_BPM,motion=0,lastMotionTime=0,previousPose=null,stillSince=0,lastDisplay=0,freeze=false;
function random(n){const a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function initAudio(){if(!sound)return;ac??=new(window.AudioContext||window.webkitAudioContext)();ac.resume().catch(()=>{})}
function tone(f,d=.12,type='sine',gain=.07){if(!sound||!ac)return;const t=ac.currentTime,o=ac.createOscillator(),v=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);v.gain.setValueAtTime(.001,t);v.gain.exponentialRampToValueAtTime(gain,t+.008);v.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(v);v.connect(ac.destination);o.start(t);o.stop(t+d+.02)}
function music(b){const k=b%16;if(b%4===0){tone(74,.15,'sine',.15);tone(148,.055,'triangle',.055)}if(b%4===2)tone(250,.08,'triangle',.08);if(b%2)tone(1160,.025,'square',.018);if(k%2===0)tone([110,147,131,165,110,196,147,123][k/2],.15,'triangle',.055);if([0,3,6,11].includes(k))tone([440,523,659,587][[0,3,6,11].indexOf(k)],.17,'sine',.056)}
function reset(){n=Math.max(2,Math.min(40,Number($('count').value)||40));$('count').value=n;const nums=shuffle(Array.from({length:n},(_,i)=>i+1)),slots=shuffle(Array.from({length:40},(_,i)=>i));people=nums.map((num,i)=>({num,col:slots[i]%8,row:Math.floor(slots[i]/8),alive:true,exit:0,phase:random(100)/20,hp:1,agility:.65+random(71)/100,guard:.65+random(71)/100,evade:.65+random(71)/100,shift:0}));live=false;champion=null;round=0;beat=0;nextBeat=0;lastFrame=0;fading=[];currentBpm=BASE_BPM;targetBpm=BASE_BPM;motion=0;lastMotionTime=0;previousPose=null;stillSince=0;freeze=false;lastCombat=0;battleStart=0;previousLean=0;lastDirection=0;stillCounter=0;attackCount=0;if($('tempo'))$('tempo').textContent=BASE_BPM+' BPM';$('start').disabled=false;$('remaining').textContent='残り'+n+'人';$('result').textContent='最後のセンターは何番？';draw(performance.now())}
// 体感忍者戦：番号と能力は独立に割当て。攻撃対象を番号から選ばない。
function combat(now,force=false){
 if(!live)return;
 if(!battleStart)battleStart=now;
 if(!force&&now-lastCombat<360)return;
 lastCombat=now;attackCount++;
 const camera=visible&&!!pose&&ready&&now-lastMotionTime<650;
 const lean=camera?body.lean:Math.sin(now*.0013)*.4;
 const direction=Math.sign(lean-previousLean);
 const feint=camera&&direction!==0&&lastDirection!==0&&direction!==lastDirection&&Math.abs(lean-previousLean)>.055;
 if(direction)lastDirection=direction;
 const strike=camera?Math.max(.12,motion):.46;
 const calm=camera&&motion<.07;
 stillCounter=calm?stillCounter+1:0;
 const dodge=calm&&stillCounter>=3;
 const lane=lean<-.12?0:lean>.12?2:1;
 let removed=0;
 const alive=people.filter(p=>p.alive);
 for(const p of alive){
  // 座標による攻撃・個体能力による回避。フェイントは回避率を下げる。
  const position=p.col<3?0:p.col>4?2:1;
  const inRange=lane===position;
  const exposure=inRange?1:.28;
  const hitChance=Math.min(.94,(.28+strike*.46)*exposure*(feint?1.38:1)/p.evade);
  const hit=random(10000)/10000<hitChance;
  const defense=dodge?.54:1;
  const damage=hit?(.045+strike*.085)*(feint?1.32:1)*defense/p.guard:0;
  p.hp-=damage;
  p.shift=Math.max(0,p.shift*.75+(hit?damage:0));
  if(p.hp<=0&&alive.length-removed>1){p.alive=false;p.exit=now;fading.push(p);removed++;}
 }
 previousLean=lean;
 let remaining=people.filter(p=>p.alive);
 // 35秒の時間制限。生存者が複数なら実際の残HP・回避力で決着。
 if(remaining.length>1&&now-battleStart>=35000){
   remaining.sort((a,b)=>(b.hp-a.hp)||((b.evade+b.guard)-(a.evade+a.guard)));
   for(const p of remaining.slice(1)){p.alive=false;p.exit=now;fading.push(p)}
   remaining=remaining.slice(0,1);
 }
 $('remaining').textContent='残り'+remaining.length+'人';
 if(remaining.length===1){
  champion=remaining[0];live=false;$('start').disabled=false;
  $('result').textContent='🏆 '+champion.num+'番が忍者の勝利！';
  $('status').textContent='忍術戦 決着！ '+attackCount+'回の攻防';
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.27,'sine',.15),i*170));
 }else if(removed||attackCount%3===0){
  $('status').textContent=(feint?'🥷 フェイント！ ':dodge?'🛡️ 静止で回避！ ':'⚔️ 忍者攻防！ ')+
   (lane===0?'左':lane===2?'右':'中央')+'に攻撃　残り'+remaining.length+'人';
 }
}
function setPose(points){const l=points[11],r=points[12],le=points[15],re=points[16],el=points[13],er=points[14],nose=points[0];if(![l,r,le,re,el,er,nose].every(p=>p&&p.visibility>.32)){visible=false;return}visible=true;const sw=Math.max(.09,Math.hypot(l.x-r.x,l.y-r.y)),mx=(l.x+r.x)/2,my=(l.y+r.y)/2;const signed=(a,b,c)=>Math.atan2((a.x-b.x)*(c.y-b.y)-(a.y-b.y)*(c.x-b.x),(a.x-b.x)*(c.x-b.x)+(a.y-b.y)*(c.y-b.y));target.left=Math.max(-1.35,Math.min(1.35,(l.y-le.y)/sw));target.right=Math.max(-1.35,Math.min(1.35,(r.y-re.y)/sw));target.leftElbow=Math.max(-1,Math.min(1,signed(l,el,le)/2));target.rightElbow=Math.max(-1,Math.min(1,signed(r,er,re)/2));const hipL=points[23],hipR=points[24];target.lean=hipL?.visibility>.25&&hipR?.visibility>.25?Math.max(-.65,Math.min(.65,(mx-(hipL.x+hipR.x)/2)/sw)):0;target.head=Math.max(-.65,Math.min(.65,(nose.x-mx)/sw));target.shoulder=Math.max(-.75,Math.min(.75,(l.y-r.y)/sw));const t=performance.now(),vectors=[nose,l,r,el,er,le,re].map(p=>[p.x,p.y]);if(previousPose&&t>previousPose.t&&t-previousPose.t<350){const dt=(t-previousPose.t)/1000;const movement=vectors.reduce((sum,p,i)=>sum+Math.hypot(p[0]-previousPose.v[i][0],p[1]-previousPose.v[i][1]),0)/(vectors.length*sw*dt);const sample=Math.max(0,Math.min(1,movement/2.5));motion=motion*.83+sample*.17;lastMotionTime=t;}previousPose={t,v:vectors};}
function dancer(p,now){const x=107+p.col*140,y=154+p.row*116,age=p.alive?0:Math.max(0,(now-p.exit)/650);if(age>=1)return;const sway=Math.sin(now*.012+p.phase)*.08;const speed=Math.max(0,Math.min(1,motion));function ninja(dx,alpha,trail){g.save();g.globalAlpha=alpha*(1-age);g.translate(x+dx,y+age*130-Math.abs(Math.sin(now*.012+p.phase))*5);g.rotate(body.lean*.3+body.shoulder*.15+sway+age*1.3);g.strokeStyle=trail?'#8df8f5':'#27314a';g.lineWidth=8;g.lineCap='round';g.beginPath();g.moveTo(-10,30);g.lineTo(-14+Math.sin(now*.014+p.phase)*6,46);g.moveTo(10,30);g.lineTo(14-Math.sin(now*.014+p.phase)*6,46);g.stroke();g.fillStyle=trail?'#7adfd7':['#38375d','#40365a','#274855','#4e3852','#304250'][p.num%5];g.beginPath();g.roundRect(-21,-19,42,52,9);g.fill();g.strokeStyle=trail?'#8df8f5':'#b9bfde';g.lineWidth=7;g.beginPath();const left=body.left,right=body.right;g.moveTo(-17,-8);g.lineTo(-31-body.leftElbow*7,4-left*15);g.lineTo(-41-body.leftElbow*12,10-left*29);g.moveTo(17,-8);g.lineTo(31+body.rightElbow*7,4-right*15);g.lineTo(41+body.rightElbow*12,10-right*29);g.stroke();g.save();g.translate(0,-36);g.rotate(body.head*.8);g.fillStyle=trail?'#7adfd7':'#2c2e43';g.beginPath();g.roundRect(-21,-19,42,39,10);g.fill();g.fillStyle='#ddeffa';g.fillRect(-17,-4,34,10);g.fillStyle='#203446';g.fillRect(-11,-1,7,4);g.fillRect(4,-1,7,4);g.restore();if(!trail){g.fillStyle=p.hp<.35?'#ff7777':'#fcf4c9';g.beginPath();g.roundRect(-24,17,48,25,6);g.fill();g.fillStyle='#172b41';g.textAlign='center';g.textBaseline='middle';g.font='900 24px system-ui';g.fillText(p.num,0,30,42)}g.restore()}if(speed>.16){ninja(-speed*19,Math.min(.23,speed*.27),true);if(speed>.5)ninja(-speed*35,.12,true)}ninja(0,1,false);if(age>0){g.fillStyle='rgba(205,235,250,'+(1-age)*.32+')';g.beginPath();g.arc(x,y+age*45,15+age*40,0,7);g.fill()}}
function draw(now){const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#2b2455');grad.addColorStop(.62,'#402568');grad.addColorStop(1,'#182c4a');g.fillStyle=grad;g.fillRect(0,0,W,H);for(let i=0;i<9;i++){const x=65+i*135;g.fillStyle='rgba(190,158,255,.09)';g.beginPath();g.moveTo(x,65);g.lineTo(x-60,700);g.lineTo(x+130,700);g.closePath();g.fill()}g.fillStyle='#2a315c';g.fillRect(0,675,W,85);for(let i=0;i<20;i++){g.fillStyle=['#ffa5db','#8ff4ef','#ffe3aa'][i%3];g.globalAlpha=.12;g.fillRect(i*65,684,42,32)}g.globalAlpha=1;for(const p of people)if(p.alive||now-p.exit<680)dancer(p,now);g.fillStyle='rgba(9,14,39,.88)';g.fillRect(0,0,W,67);g.textAlign='center';g.fillStyle='#fff0c3';g.font='bold 34px system-ui';g.fillText('🥷 忍者の分身ダンス',600,44);g.font='bold 22px system-ui';g.fillStyle='#c1f5ff';g.fillText(visible?'🟢 頭・肩・腕を追跡中':'🎭 自動ダンス / 姿勢認識待ち',600,733);if(champion){g.fillStyle='rgba(15,20,48,.95)';g.fillRect(270,250,660,210);g.strokeStyle='#ffe7a1';g.lineWidth=5;g.strokeRect(270,250,660,210);g.fillStyle='#ffecae';g.textAlign='center';g.font='900 53px system-ui';g.fillText('🏆 '+champion.num+'番 忍者の勝利！',600,377)}}
function frame(now){const dt=Math.min(.08,Math.max(0,(now-(lastFrame||now))/1000));lastFrame=now;if(ready&&pose&&video.readyState>=2&&video.currentTime!==lastVideo){lastVideo=video.currentTime;try{const data=pose.detectForVideo(video,now);if(data.landmarks?.[0])setPose(data.landmarks[0]);else{visible=false;previousPose=null}}catch(e){$('status').textContent='姿勢認識エラー：'+e.message;pose=null;visible=false;previousPose=null}}
if(!visible){target.left=Math.sin(now*.002)*.5;target.right=Math.cos(now*.0023)*.6;target.head=Math.sin(now*.001)*.25;target.shoulder=Math.sin(now*.003)*.25;target.lean=Math.sin(now*.0017)*.2;target.leftElbow=Math.sin(now*.0032)*.45;target.rightElbow=Math.cos(now*.003)*.45}
const cameraActive=!!pose&&ready;const motionFresh=visible&&now-lastMotionTime<500;
if(cameraActive){if(!motionFresh)motion*=.97;const calm=motion<.045;if(calm){if(!stillSince)stillSince=now}else stillSince=0;freeze=motionFresh&&stillSince>0&&now-stillSince>1400;targetBpm=MIN_BPM+motion*(MAX_BPM-MIN_BPM)}else{freeze=false;targetBpm=BASE_BPM}
currentBpm+=(targetBpm-currentBpm)*Math.min(1,dt*2.8);currentBpm=Math.max(MIN_BPM,Math.min(MAX_BPM,currentBpm));for(const key of Object.keys(body))body[key]+=(target[key]-body[key])*.18;
if(live&&now>=nextBeat){let steps=0;while(live&&now>=nextBeat&&steps++<3){music(beat);beat++;nextBeat+=60000/currentBpm;if(beat%8===0)tone(520,.08,'triangle',.08)}if(steps>=3)nextBeat=now+60000/currentBpm}
if(live)combat(now);
if(now-lastDisplay>300){lastDisplay=now;if($('tempo'))$('tempo').textContent=Math.round(currentBpm)+' BPM'+(freeze?' ⏸':'');if(live&&attackCount===0)$('status').textContent='腕の振りで攻撃、切り返しでフェイント、静止で回避！';}
draw(now);frameId=requestAnimationFrame(frame)}
async function cameraStart(){$('camera').disabled=true;$('status').textContent='カメラ・全身姿勢認識モデルを準備中…';try{if(!stream){stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});video.srcObject=stream;await video.play();ready=true}const {PoseLandmarker,FilesetResolver}=await import('./vendor/mediapipe/vision_bundle.js?v=6');const files=await FilesetResolver.forVisionTasks(new URL('./vendor/mediapipe/wasm',import.meta.url).href);const opts={baseOptions:{modelAssetPath:new URL('./vendor/mediapipe/pose_landmarker.task',import.meta.url).href,delegate:'GPU'},runningMode:'VIDEO',numPoses:1};try{pose=await PoseLandmarker.createFromOptions(files,opts)}catch{opts.baseOptions.delegate='CPU';pose=await PoseLandmarker.createFromOptions(files,opts)}$('status').textContent='🟢 準備完了！ 頭・肩・両腕を画面に映して自由に踊ろう。'}catch(e){$('status').textContent='全身認識の起動に失敗：'+e.message+'。自動ダンスでも抽選できます。'}finally{$('camera').disabled=false}}
$('camera').onclick=cameraStart;$('start').onclick=()=>{reset();live=true;beat=0;nextBeat=performance.now()+100;initAudio();tone(660,.18);$('start').disabled=true;$('status').textContent='左右の腕振りで攻撃・急な切り返しでフェイント・静止で回避！'};$('beat').onclick=()=>{if(!live)return;freeze=false;stillSince=0;nextBeat=performance.now();combat(performance.now(),true)};$('reset').onclick=reset;$('count').onchange=reset;$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ 音 ON':'♪ 音 OFF';initAudio();tone(850)};window.addEventListener('pagehide',()=>{stream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(frameId)});reset();frameId=requestAnimationFrame(frame);