import { randomNumber, buildSchedule, frameAt } from './draw.js';
import { drawLottery } from './lottery.js';
import { drawRoulette, rouletteAngle } from './roulette.js';
import { drawBallRace } from './ball-race.js?v=61';
import { drawHorseRace } from './horse-race.js?v=61';
import { drawPinball, getPinballCollisions } from './pinball.js';
import { playPinballBounce } from './pinball-audio.js';
import { drawDie3D } from './die-3d.js';
import { drawGalton, makeGaltonRound } from './galton.js';
import { drawMaze, makeMazeRound } from './maze.js';
import { drawCrane, makeCraneRound } from './crane.js?v=60';
import { scheduleCraneSounds } from './crane-audio.js';
import { drawMachine, makeMachineRound, MACHINE_EVENTS } from './machine.js?v=43';
import { drawRobotRace, makeRobotRound } from './robot-race.js?v=53';
import { drawBabyRace, makeBabyRound } from './baby-race.js?v=50';
import { makeKarakuriRound, drawKarakuri } from './karakuri.js?v=58';
import { makeTrolleyRound, drawTrolley } from './trolley.js?v=64';
import { makeFrogRound, drawFrogPond } from './frog-pond.js?v=67';
import { makeAlienRound, drawAlienDance } from './alien-dance.js?v=71';
import { makeBowlingRound, drawBowling } from './bowling.js?v=73';
import { makeBalloonRound, drawBalloon } from './balloon.js?v=74';
import { makePenguinRound, drawPenguin } from './penguin.js?v=76';
import { makePirateRound, drawPirate } from './pirate.js?v=79';
const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let duration = 8000;
try { const saved = Number(localStorage.getItem('classroom-draw-duration')); if ([3000, 5000, 8000].includes(saved)) duration = saved; } catch {}
let schedule = buildSchedule(duration);
$('duration').value = String(duration);
$('hint').textContent = `タップすると、${duration / 1000}秒で決まります`;
$('duration').addEventListener('change', () => {
 if (running) { $('duration').value = String(duration); return; }
 const next = Number($('duration').value);
 if (![3000, 5000, 8000].includes(next)) return;
 duration = next; schedule = buildSchedule(duration);
 $('hint').textContent = `タップすると、${duration / 1000}秒で決まります`;
 try { localStorage.setItem('classroom-draw-duration', String(duration)); } catch {}
});
let count = 40;
try { const saved = Number(localStorage.getItem('classroom-draw-count')); if (Number.isInteger(saved) && saved >= 1 && saved <= 99) count = saved; } catch {}
function updateCount() {
 $('count').value = count;
 $('range').textContent = `1–${count}`;
 $('caption').textContent = `1〜${count}番から、ひとりを選びます`;
}
updateCount();
$('count').addEventListener('change', () => {
 if (running) { $('count').value = count; return; }
 const value = Number($('count').value);
 if (!Number.isInteger(value) || value < 1 || value > 99) {
  $('count').value = count; $('hint').textContent = '人数は1〜99の整数で入力してください'; return;
 }
 count = value; updateCount();shuffleGalton();pirateRound=null;penguinRound=null;balloonRound=null;bowlingRound=null;alienRound=null;frogRound=null;trolleyRound=null;karakuriRound=null;babyRound=null;robotRound=null;mazeRound=null;craneRound=null;machineRound=null;if(mode==='machine')machineRound=makeMachineRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='crane')craneRound=makeCraneRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='galton')galtonRound=makeGaltonRound(count,n=>randomNumber(undefined,n));if(mode==='robot')robotRound=makeRobotRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);syncMode();
 $('app').className = ''; $('number').textContent = '?'; $('status').textContent = '次の主役は、だれだろう。';
 $('hint').textContent = `タップすると、${duration / 1000}秒で決まります`; $('announcement').textContent = `${count}人に設定しました。`;
 try { localStorage.setItem('classroom-draw-count', String(count)); } catch {}
});
let mode = 'numbers';
try { if (['die','lottery','roulette','race','horse','pinball','galton','maze','crane','machine','robot','baby','karakuri','trolley','frog','alien','bowling','balloon','penguin','pirate'].includes(localStorage.getItem('classroom-draw-mode'))) mode = localStorage.getItem('classroom-draw-mode'); } catch {}
$('mode').value = mode;
const pirateWrap=$('pirate-wrap'),pirateCanvas=$('pirate');let pirateRound=null;
const penguinWrap=$('penguin-wrap'),penguinCanvas=$('penguin');let penguinRound=null;
const balloonWrap=$('balloon-wrap'),balloonCanvas=$('balloon');let balloonRound=null;
const bowlingWrap=$('bowling-wrap'),bowlingCanvas=$('bowling');let bowlingRound=null;
const alienWrap=$('alien-wrap'),alienCanvas=$('alien');let alienRound=null;
const frogWrap=$('frog-wrap'),frogCanvas=$('frog');let frogRound=null;
const trolleyWrap=$('trolley-wrap'),trolleyCanvas=$('trolley');let trolleyRound=null;
const karakuriWrap=$('karakuri-wrap'),karakuriCanvas=$('karakuri');let karakuriRound=null;
const babyWrap=$('baby-wrap'),babyCanvas=$('baby');let babyRound=null;
const robotWrap=$('robot-wrap'),robotCanvas=$('robot');let robotRound=null,robotLastSound=-1;
const machineWrap=$('machine-wrap'),machineCanvas=$('machine');let machineRound=null,machineEventIndex=0;
const craneWrap=$('crane-wrap'),craneCanvas=$('crane');let craneRound=null;
const mazeWrap=$('maze-wrap'),mazeCanvas=$('maze');let mazeRound=null;
const galtonWrap=$('galton-wrap'),galtonCanvas=$('galton');
let galtonLabels=[];let galtonRound=null;
function shuffleGalton(){galtonLabels=Array.from({length:count},(_,i)=>i+1);for(let i=count-1;i>0;i--){const j=randomNumber(undefined,i+1)-1;const v=galtonLabels[i];galtonLabels[i]=galtonLabels[j];galtonLabels[j]=v;}}
shuffleGalton();
const pinballWrap=$('pinball-wrap'),pinballCanvas=$('pinball');
const horseWrap=$('horse-wrap'), horseCanvas=$('horse');
const raceWrap=$('race-wrap'), raceCanvas=$('race');
const rouletteWrap=$('roulette-wrap'), rouletteCanvas=$('roulette');
const lotteryWrap=$('lottery-wrap'), lotteryCanvas=$('lottery');
const dieWrap = $('die-wrap'), die = $('die'), dc = die.getContext('2d');
// 40 facets in five belts of eight; a deliberately stylized, not precision, d40.
function drawDieLegacy(time = 0, selected = null) {
 const w=480, cx=240, cy=240, rad=162;
 dc.clearRect(0,0,w,w);
 const tilt = selected === null ? Math.sin(time*.0014)*.18 : 0;
 const yaw = selected === null ? time*.0012 : 0;
 const bounce = selected === null ? Math.abs(Math.sin(time*.008))*30*Math.pow(Math.max(0,1-time/duration),.75) : 0;
 dc.save(); dc.translate(0,-bounce);
 const faces=[];
 for(let band=0;band<5;band++) for(let seg=0;seg<8;seg++) {
  const lat1=-Math.PI/2+band*Math.PI/5,lat2=lat1+Math.PI/5;
  const a1=seg*Math.PI/4+yaw+(band%2)*Math.PI/8;
  const a2=a1+Math.PI/4;
  const project=(lat,a)=>{const x=Math.cos(lat)*Math.cos(a),y=Math.sin(lat),z=Math.cos(lat)*Math.sin(a);return {x:cx+rad*(x*Math.cos(tilt)-y*Math.sin(tilt)),y:cy+rad*(x*Math.sin(tilt)+y*Math.cos(tilt)),z};};
  const verts=[project(lat1,a1),project(lat1,a2),project(lat2,a2),project(lat2,a1)];
  const depth=verts.reduce((n,p)=>n+p.z,0)/4;
  faces.push({verts,depth,number:band*8+seg+1});
 }
 faces.sort((a,b)=>a.depth-b.depth);
 for(const face of faces){if(face.depth<-.06)continue;
  dc.beginPath();face.verts.forEach((p,i)=>i?dc.lineTo(p.x,p.y):dc.moveTo(p.x,p.y));dc.closePath();
  dc.fillStyle=selected===null?'#465a73':'#5a7190';dc.fill();dc.strokeStyle='#94a5b9';dc.lineWidth=2;dc.stroke();
  const x=face.verts.reduce((n,p)=>n+p.x,0)/4,y=face.verts.reduce((n,p)=>n+p.y,0)/4;
  dc.fillStyle='#e0e7ee';dc.font='bold 19px Arial';dc.textAlign='center';dc.textBaseline='middle';dc.fillText(face.number,x,y);
 }
 if(selected!==null){
  // Winner is the top-facing numbered facet; graphical highlight is symbolic.
  dc.beginPath();dc.ellipse(cx,cy-97,66,37,0,0,Math.PI*2);dc.fillStyle='#e6c27c';dc.fill();dc.strokeStyle='#fff1c5';dc.lineWidth=3;dc.stroke();
  dc.fillStyle='#18283c';dc.font='900 35px Arial';dc.fillText(selected,cx,cy-97);
 }
 dc.restore();
}
function drawDie(time=0,selected=null){drawDie3D(die,time,duration,selected,reduced.matches);}
function syncMode(){document.body.classList.toggle('numbers-mode',mode==='numbers');document.body.classList.toggle('robot-mode',mode==='robot');pirateWrap.hidden=mode!=='pirate';penguinWrap.hidden=mode!=='penguin';balloonWrap.hidden=mode!=='balloon';bowlingWrap.hidden=mode!=='bowling';alienWrap.hidden=mode!=='alien';frogWrap.hidden=mode!=='frog';trolleyWrap.hidden=mode!=='trolley';karakuriWrap.hidden=mode!=='karakuri';babyWrap.hidden=mode!=='baby';robotWrap.hidden=mode!=='robot';machineWrap.hidden=mode!=='machine';craneWrap.hidden=mode!=='crane';mazeWrap.hidden=mode!=='maze';galtonWrap.hidden=mode!=='galton';pinballWrap.hidden=mode!=='pinball';horseWrap.hidden=mode!=='horse';raceWrap.hidden=mode!=='race';rouletteWrap.hidden=mode!=='roulette';dieWrap.hidden=mode!=='die';lotteryWrap.hidden=mode!=='lottery';$('number').hidden=mode!=='numbers'&&!$('app').classList.contains('result');if(mode==='die')drawDie(0,null);if(mode==='lottery')drawLottery(lotteryCanvas,0,duration,count,null,reduced.matches);if(mode==='roulette')drawRoulette(rouletteCanvas,count,0,null);if(mode==='race')drawBallRace(raceCanvas,count,0,duration,null,true);if(mode==='horse')drawHorseRace(horseCanvas,count,0,duration,null,true);if(mode==='pinball')drawPinball(pinballCanvas,count,0,duration,null,true);if(mode==='galton')drawGalton(galtonCanvas,galtonRound,0,duration,true);if(mode==='maze')drawMaze(mazeCanvas,mazeRound,0,duration,true);if(mode==='crane')drawCrane(craneCanvas,craneRound,0,duration,true);if(mode==='machine')drawMachine(machineCanvas,machineRound,0,duration,true);if(mode==='trolley')drawTrolley(trolleyCanvas,trolleyRound,0,13000,true);if(mode==='frog')drawFrogPond(frogCanvas,frogRound,0,10000,true);if(mode==='alien')drawAlienDance(alienCanvas,alienRound,0,10000,true);if(mode==='bowling')drawBowling(bowlingCanvas,bowlingRound,0,8000,true);if(mode==='balloon')drawBalloon(balloonCanvas,balloonRound,0,8000,true);if(mode==='penguin')drawPenguin(penguinCanvas,penguinRound,0,9000,true);if(mode==='pirate')drawPirate(pirateCanvas,pirateRound,0,10000,true);if(mode==='robot')drawRobotRace(robotCanvas,robotRound,0,duration,true);if(mode==='baby')drawBabyRace(babyCanvas,babyRound,0,duration,true);if(mode==='karakuri')drawKarakuri(karakuriCanvas,karakuriRound,0,duration,true);if(mode==='trolley')drawTrolley(trolleyCanvas,trolleyRound,0,13000,true);}
$('mode').addEventListener('change',()=>{if(running){$('mode').value=mode;return;}mode=$('mode').value;if(mode==='pirate'&&!pirateRound)pirateRound=makePirateRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='penguin'&&!penguinRound)penguinRound=makePenguinRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='balloon'&&!balloonRound)balloonRound=makeBalloonRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='bowling'&&!bowlingRound)bowlingRound=makeBowlingRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='alien'&&!alienRound)alienRound=makeAlienRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='frog'&&!frogRound)frogRound=makeFrogRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='trolley'&&!trolleyRound)trolleyRound=makeTrolleyRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='karakuri'&&!karakuriRound)karakuriRound=makeKarakuriRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='baby'&&!babyRound)babyRound=makeBabyRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='robot'&&!robotRound)robotRound=makeRobotRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='machine'&&!machineRound)machineRound=makeMachineRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='crane'&&!craneRound)craneRound=makeCraneRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='maze'&&!mazeRound)mazeRound=makeMazeRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='galton'&&!galtonRound)galtonRound=makeGaltonRound(count,n=>randomNumber(undefined,n));try{localStorage.setItem('classroom-draw-mode',mode);}catch{} $('app').className='';$('number').textContent='?';syncMode();$('hint').textContent=mode==='alien'?'このモードは10秒で決まります':mode==='frog'?'このモードは10秒で決まります':mode==='trolley'?'このモードは13秒で決まります':`タップすると、${duration/1000}秒で決まります`;});
if(mode==='maze'&&!mazeRound)mazeRound=makeMazeRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);
if(mode==='crane'&&!craneRound)craneRound=makeCraneRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);
if(mode==='machine'&&!machineRound)machineRound=makeMachineRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);
if(mode==='robot'&&!robotRound)robotRound=makeRobotRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);
if(mode==='baby'&&!babyRound)babyRound=makeBabyRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);
if(mode==='pirate'&&!pirateRound)pirateRound=makePirateRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='penguin'&&!penguinRound)penguinRound=makePenguinRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='balloon'&&!balloonRound)balloonRound=makeBalloonRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='bowling'&&!bowlingRound)bowlingRound=makeBowlingRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='alien'&&!alienRound)alienRound=makeAlienRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='frog'&&!frogRound)frogRound=makeFrogRound(count,randomNumber(undefined,count),crypto.getRandomValues(new Uint32Array(1))[0]);
syncMode();
let sound = false, context, master, running = false, started = 0, lastIndex = -1, winner, raf, raceStory='comeback',pinballSeed=1;
const raceModes=new Set(['race','horse','maze','robot']);
function syncRaceLayout(){document.body.classList.toggle('race-running',running&&raceModes.has(mode));}
try { sound = localStorage.getItem('classroom-draw-sound') === 'on'; } catch {}
function updateSound() { $('sound').textContent = `音 ${sound ? 'ON' : 'OFF'}`; $('sound').setAttribute('aria-pressed', String(sound)); }
function unlockAudio() {
 if (!sound) return;
 try {
  if (!context) { const Audio = window.AudioContext || window.webkitAudioContext; context = new Audio(); master = context.createGain(); master.connect(context.destination); }
  master.gain.setValueAtTime(0.18, context.currentTime);
  if (context.state !== 'running') context.resume().catch(() => {});
 } catch { sound = false; updateSound(); $('hint').textContent = 'この端末では音を再生できません。抽選は続けられます。'; }
}
function tone(frequency, delay = 0, duration = .045, type = 'sine', volume = .4) {
 if (!sound || !context || context.state !== 'running' || document.hidden) return;
 const t = context.currentTime + delay, osc = context.createOscillator(), gain = context.createGain();
 osc.type = type; osc.frequency.value = frequency;
 gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(volume,t+.006); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
 osc.connect(gain); gain.connect(master); osc.start(t); osc.stop(t+duration+.02);
 osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}
function finish(audible = true) {
 running = false;syncRaceLayout(); $('count').disabled = false; $('duration').disabled = false; $('mode').disabled = false; cancelAnimationFrame(raf);
 $('number').textContent = winner; $('app').className = 'result'; if(mode==='die'){drawDie(duration,winner);dieWrap.hidden=false;$('number').hidden=false;} if(mode==='lottery'){drawLottery(lotteryCanvas,duration,duration,count,winner,true);lotteryWrap.hidden=false;$('number').hidden=false;}if(mode==='roulette'){drawRoulette(rouletteCanvas,count,rouletteAngle(duration,duration,winner,count,true),winner);rouletteWrap.hidden=false;$('number').hidden=false;} if(mode==='race'){drawBallRace(raceCanvas,count,duration,duration,winner,false,raceStory);raceWrap.hidden=false;$('number').hidden=false;} if(mode==='horse'){drawHorseRace(horseCanvas,count,duration,duration,winner,false,raceStory);horseWrap.hidden=false;$('number').hidden=false;} if(mode==='pinball'){drawPinball(pinballCanvas,count,duration,duration,winner,false,pinballSeed);pinballWrap.hidden=false;$('number').hidden=false;} if(mode==='galton'){drawGalton(galtonCanvas,galtonRound,duration,duration,false);galtonWrap.hidden=false;$('number').hidden=false;}if(mode==='maze'){drawMaze(mazeCanvas,mazeRound,duration,duration,false);mazeWrap.hidden=false;$('number').hidden=false;}if(mode==='crane'){drawCrane(craneCanvas,craneRound,duration,duration,false);craneWrap.hidden=false;$('number').hidden=false;}if(mode==='machine'){drawMachine(machineCanvas,machineRound,duration,duration,false);machineWrap.hidden=false;$('number').hidden=false;}if(mode==='robot'){drawRobotRace(robotCanvas,robotRound,duration,duration,false);robotWrap.hidden=false;$('number').hidden=false;}if(mode==='baby'){drawBabyRace(babyCanvas,babyRound,duration,duration,false);babyWrap.hidden=false;$('number').hidden=false;}if(mode==='karakuri'){drawKarakuri(karakuriCanvas,karakuriRound,duration,duration,false);karakuriWrap.hidden=false;$('number').hidden=false;}if(mode==='trolley'){drawTrolley(trolleyCanvas,trolleyRound,13000,13000,false);trolleyWrap.hidden=false;$('number').hidden=false;}if(mode==='frog'){drawFrogPond(frogCanvas,frogRound,10000,10000,false);frogWrap.hidden=false;$('number').hidden=false;}if(mode==='alien'){drawAlienDance(alienCanvas,alienRound,10000,10000,false);alienWrap.hidden=false;$('number').hidden=false;}if(mode==='bowling'){drawBowling(bowlingCanvas,bowlingRound,8000,8000,false);bowlingWrap.hidden=false;$('number').hidden=false;}if(mode==='balloon'){drawBalloon(balloonCanvas,balloonRound,8000,8000,false);balloonWrap.hidden=false;$('number').hidden=false;}if(mode==='penguin'){drawPenguin(penguinCanvas,penguinRound,9000,9000,false);penguinWrap.hidden=false;$('number').hidden=false;}if(mode==='pirate'){drawPirate(pirateCanvas,pirateRound,10000,10000,false);pirateWrap.hidden=false;$('number').hidden=false;} $('status').textContent = 'あなたの番です！';
 $('caption').textContent = `${winner} 番`; $('start').disabled = false; $('start').innerHTML = 'もう一度ひく <span aria-hidden="true">↗</span>';
 $('hint').textContent = `毎回、1〜${count}番からランダムに選びます`; $('announcement').textContent = `${winner}番に決まりました。`;
 $('progress-fill').style.width = '100%';
 if (audible) { [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*.16,i===3?.7:.18,'triangle')); }
}
let pinballEvents=[],pinballEventIndex=0,lastPinballSound=-1000;
function tick() {
 if (!running) return;
 const elapsed = performance.now()-started, frame = mode==='pirate'?{index:0,done:elapsed>=10000}:mode==='penguin'?{index:0,done:elapsed>=9000}:mode==='balloon'?{index:0,done:elapsed>=8000}:mode==='bowling'?{index:0,done:elapsed>=8000}:mode==='trolley'?{index:0,done:elapsed>=13000}:mode==='alien'?{index:0,done:elapsed>=10000}:mode==='frog'?{index:0,done:elapsed>=10000}:frameAt(elapsed,schedule);
 if (frame.done) { finish(); return; }
 if(mode==='die' && !reduced.matches){drawDie(elapsed,winner);raf=requestAnimationFrame(tick);return;}
 if(mode==='lottery'){ if(!reduced.matches) drawLottery(lotteryCanvas,elapsed,duration,count,null,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='roulette'){if(!reduced.matches)drawRoulette(rouletteCanvas,count,rouletteAngle(elapsed,duration,winner,count),null);raf=requestAnimationFrame(tick);return;}
 if(mode==='race'){if(!reduced.matches)drawBallRace(raceCanvas,count,elapsed,duration,winner,false,raceStory);raf=requestAnimationFrame(tick);return;}
 if(mode==='horse'){if(!reduced.matches)drawHorseRace(horseCanvas,count,elapsed,duration,winner,false,raceStory);raf=requestAnimationFrame(tick);return;}
 if(mode==='pinball'){
  if(!reduced.matches)drawPinball(pinballCanvas,count,elapsed,duration,winner,false,pinballSeed);
  let latest=null;
  while(pinballEventIndex<pinballEvents.length&&pinballEvents[pinballEventIndex].ms<=elapsed){latest=pinballEvents[pinballEventIndex++];}
  if(latest&&elapsed-latest.ms<100&&elapsed-lastPinballSound>=145&&sound&&!document.hidden){
   if(context&&context.state==='running')playPinballBounce(context,master,latest);
   lastPinballSound=elapsed;
  }
  raf=requestAnimationFrame(tick);return;
 }
 if(mode==='galton'){if(!reduced.matches)drawGalton(galtonCanvas,galtonRound,elapsed,duration,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='maze'){if(!reduced.matches)drawMaze(mazeCanvas,mazeRound,elapsed,duration,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='crane'){if(!reduced.matches)drawCrane(craneCanvas,craneRound,elapsed,duration,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='baby'){if(!reduced.matches)drawBabyRace(babyCanvas,babyRound,elapsed,duration,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='karakuri'){if(!reduced.matches)drawKarakuri(karakuriCanvas,karakuriRound,elapsed,duration,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='trolley'){if(!reduced.matches)drawTrolley(trolleyCanvas,trolleyRound,elapsed,13000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='frog'){if(!reduced.matches)drawFrogPond(frogCanvas,frogRound,elapsed,10000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='alien'){if(!reduced.matches)drawAlienDance(alienCanvas,alienRound,elapsed,10000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='bowling'){if(!reduced.matches)drawBowling(bowlingCanvas,bowlingRound,elapsed,8000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='balloon'){if(!reduced.matches)drawBalloon(balloonCanvas,balloonRound,elapsed,8000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='penguin'){if(!reduced.matches)drawPenguin(penguinCanvas,penguinRound,elapsed,9000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='pirate'){if(!reduced.matches)drawPirate(pirateCanvas,pirateRound,elapsed,10000,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='robot'){
  if(!reduced.matches)drawRobotRace(robotCanvas,robotRound,elapsed,duration,false);
  const sec=Math.floor(elapsed/600);if(!reduced.matches&&sec!==robotLastSound&&sound&&context?.state==='running'&&!document.hidden){robotLastSound=sec;tone(sec%2?260:370,0,.065,'sine',.08);}
  raf=requestAnimationFrame(tick);return;
 }
 if(mode==='machine'){
  if(!reduced.matches)drawMachine(machineCanvas,machineRound,elapsed,duration,false);
  while(machineEventIndex<MACHINE_EVENTS.length&&elapsed>=MACHINE_EVENTS[machineEventIndex].t*duration){
   const j=machineEventIndex++;
   if(sound&&!document.hidden&&context&&context.state==='running'&&elapsed-MACHINE_EVENTS[j].t*duration<110){tone([260,390,230,330,510,440][j],0,.085,'sine');}
  }
  raf=requestAnimationFrame(tick);return;
 }
 // Keep progress visually still.
 if (!reduced.matches && frame.index !== lastIndex && elapsed - (window.__lastVisualChange || 0) >= 300) {
  lastIndex = frame.index;
  window.__lastVisualChange = elapsed;
  let next;
  do { next = randomNumber(undefined, count); } while (count > 1 && String(next) === $('number').textContent);
  $('number').textContent = next;
  tone(660 + (next % 5) * 70);
 }
 raf = requestAnimationFrame(tick);
}
$('start').addEventListener('click', () => {
 if (running) return;
 unlockAudio();
 // Silence any remaining fanfare before a new round.
 if (master) { master.gain.setValueAtTime(0,context.currentTime); const previous = master; master = context.createGain(); master.gain.value=.18; master.connect(context.destination); setTimeout(()=>previous.disconnect(),1200); }
 running = true;syncRaceLayout(); $('count').disabled = true; $('duration').disabled = true; $('mode').disabled = true; winner = randomNumber(undefined, count);if(mode==='pirate')pirateRound=makePirateRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='penguin')penguinRound=makePenguinRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='balloon')balloonRound=makeBalloonRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='bowling')bowlingRound=makeBowlingRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='alien')alienRound=makeAlienRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='frog')frogRound=makeFrogRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='trolley')trolleyRound=makeTrolleyRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='karakuri')karakuriRound=makeKarakuriRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='baby')babyRound=makeBabyRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='robot'){robotRound=makeRobotRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);robotLastSound=-1;}if(mode==='machine'){machineRound=makeMachineRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);machineEventIndex=0;}if(mode==='crane')craneRound=makeCraneRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]);if(mode==='maze')mazeRound=makeMazeRound(count,winner,crypto.getRandomValues(new Uint32Array(1))[0]); pinballSeed=crypto.getRandomValues(new Uint32Array(1))[0];if(mode==='pinball'){pinballEvents=getPinballCollisions(count,duration,winner,pinballSeed);pinballEventIndex=0;lastPinballSound=-1000;} if(mode==='galton'){galtonRound=makeGaltonRound(count,n=>randomNumber(undefined,n));winner=galtonRound.winner;} raceStory=['front','close','comeback'][randomNumber(undefined,3)-1]; started = performance.now(); lastIndex = -1; window.__lastVisualChange = -300;
 $('app').className = 'running'; $('start').disabled = true; $('start').textContent = '抽選中…'; $('status').textContent = 'だれの番かな…';
 $('caption').textContent = 'あと少し、お楽しみに'; $('hint').textContent = `${mode==='pirate'?10:mode==='penguin'?9:mode==='balloon'?8:mode==='bowling'?8:mode==='alien'?10:mode==='frog'?10:mode==='trolley'?13:duration/1000}秒で番号が決まります`; $('announcement').textContent = `抽選中です。${mode==='pirate'?10:mode==='penguin'?9:mode==='balloon'?8:mode==='bowling'?8:mode==='alien'?10:mode==='frog'?10:mode==='trolley'?13:duration/1000}秒で決まります。`;
 $('number').textContent = '…'; if(mode==='die'){$('number').hidden=true;dieWrap.hidden=false;drawDie(0,null);}if(mode==='lottery'){$('number').hidden=true;lotteryWrap.hidden=false;drawLottery(lotteryCanvas,0,duration,count,null,reduced.matches);}if(mode==='roulette'){$('number').hidden=true;rouletteWrap.hidden=false;drawRoulette(rouletteCanvas,count,0,null);}
 if(mode==='race'){$('number').hidden=true;raceWrap.hidden=false;drawBallRace(raceCanvas,count,0,duration,winner,reduced.matches,raceStory);}
 if(mode==='horse'){$('number').hidden=true;horseWrap.hidden=false;drawHorseRace(horseCanvas,count,0,duration,winner,reduced.matches,raceStory);}
 if(mode==='pinball'){$('number').hidden=true;pinballWrap.hidden=false;drawPinball(pinballCanvas,count,0,duration,winner,reduced.matches,pinballSeed);}
 if(mode==='galton'){galtonWrap.hidden=false;$('number').hidden=true;drawGalton(galtonCanvas,galtonRound,0,duration,reduced.matches);}
 if(mode==='maze'){mazeWrap.hidden=false;$('number').hidden=true;drawMaze(mazeCanvas,mazeRound,0,duration,reduced.matches);}
 if(mode==='pirate'){pirateWrap.hidden=false;$('number').hidden=true;drawPirate(pirateCanvas,pirateRound,0,10000,reduced.matches);}
 if(mode==='penguin'){penguinWrap.hidden=false;$('number').hidden=true;drawPenguin(penguinCanvas,penguinRound,0,9000,reduced.matches);}
 if(mode==='balloon'){balloonWrap.hidden=false;$('number').hidden=true;drawBalloon(balloonCanvas,balloonRound,0,8000,reduced.matches);}
 if(mode==='bowling'){bowlingWrap.hidden=false;$('number').hidden=true;drawBowling(bowlingCanvas,bowlingRound,0,8000,reduced.matches);}
 if(mode==='alien'){alienWrap.hidden=false;$('number').hidden=true;drawAlienDance(alienCanvas,alienRound,0,10000,reduced.matches);}
 if(mode==='frog'){frogWrap.hidden=false;$('number').hidden=true;drawFrogPond(frogCanvas,frogRound,0,10000,reduced.matches);}
 if(mode==='trolley'){trolleyWrap.hidden=false;$('number').hidden=true;drawTrolley(trolleyCanvas,trolleyRound,0,13000,reduced.matches);}
 if(mode==='karakuri'){karakuriWrap.hidden=false;$('number').hidden=true;drawKarakuri(karakuriCanvas,karakuriRound,0,duration,reduced.matches);}
 if(mode==='baby'){babyWrap.hidden=false;$('number').hidden=true;drawBabyRace(babyCanvas,babyRound,0,duration,reduced.matches);}
 if(mode==='robot'){robotWrap.hidden=false;$('number').hidden=true;drawRobotRace(robotCanvas,robotRound,0,duration,reduced.matches);}
 if(mode==='machine'){machineWrap.hidden=false;$('number').hidden=true;drawMachine(machineCanvas,machineRound,0,duration,reduced.matches);}
 if(mode==='crane'){craneWrap.hidden=false;$('number').hidden=true;drawCrane(craneCanvas,craneRound,0,duration,reduced.matches);if(sound&&context){const audioContext=context,audioMaster=master,audioRound=craneRound;const play=()=>{if(sound&&running&&mode==='crane'&&context===audioContext&&master===audioMaster&&audioContext.state==='running')scheduleCraneSounds(audioContext,audioMaster,audioRound,duration);};if(audioContext.state==='running')play();else audioContext.resume().then(play).catch(()=>{});}}
 tick();
});
$('sound').addEventListener('click', () => {
 sound = !sound;
 if (!sound && master) master.gain.setValueAtTime(0,context.currentTime);
 if (sound) unlockAudio();
 updateSound(); try { localStorage.setItem('classroom-draw-sound',sound?'on':'off'); } catch {}
});
reduced.addEventListener('change', () => { if (running) { $('number').textContent = '…'; if(mode==='die') drawDie(0,null);if(mode==='lottery') drawLottery(lotteryCanvas,0,duration,count,null,true);if(mode==='roulette')drawRoulette(rouletteCanvas,count,0,null);if(mode==='race')drawBallRace(raceCanvas,count,0,duration,null,true);if(mode==='horse')drawHorseRace(horseCanvas,count,0,duration,null,true);if(mode==='pinball')drawPinball(pinballCanvas,count,0,duration,null,true);if(mode==='galton')drawGalton(galtonCanvas,galtonRound,0,duration,true);if(mode==='maze')drawMaze(mazeCanvas,mazeRound,0,duration,true);if(mode==='crane')drawCrane(craneCanvas,craneRound,0,duration,true);if(mode==='machine')drawMachine(machineCanvas,machineRound,0,duration,true); } });
document.addEventListener('visibilitychange', () => {
 if (document.hidden) { if(master) master.gain.setValueAtTime(0,context.currentTime); cancelAnimationFrame(raf); }
 else if (running) { if (performance.now()-started>=(mode==='alien'?10000:mode==='frog'?10000:mode==='trolley'?13000:duration)) finish(false); else { if(master && sound) master.gain.setValueAtTime(.18,context.currentTime); tick(); } }
});
if (document.documentElement.requestFullscreen && document.fullscreenEnabled) {
 $('fullscreen').hidden=false;
 $('fullscreen').addEventListener('click',async()=>{try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { $('hint').textContent='全画面は、ホーム画面に追加してご利用ください。'; }});
 document.addEventListener('fullscreenchange',()=>{ $('fullscreen').textContent=document.fullscreenElement?'全画面を終了':'全画面'; });
}
updateSound();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{ $('hint').textContent='オフライン準備ができませんでした。通信中は利用できます。'; });
