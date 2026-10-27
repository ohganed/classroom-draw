import { randomNumber, buildSchedule, frameAt } from './draw.js';
import { drawLottery } from './lottery.js';
import { drawRoulette, rouletteAngle } from './roulette.js';
import { drawBallRace } from './ball-race.js';
import { drawHorseRace } from './horse-race.js';
import { drawPinball } from './pinball.js';
import { drawGalton } from './galton.js';
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
 count = value; updateCount();shuffleGalton();syncMode();
 $('app').className = ''; $('number').textContent = '?'; $('status').textContent = '次の主役は、だれだろう。';
 $('hint').textContent = `タップすると、${duration / 1000}秒で決まります`; $('announcement').textContent = `${count}人に設定しました。`;
 try { localStorage.setItem('classroom-draw-count', String(count)); } catch {}
});
let mode = 'numbers';
try { if (['die','lottery','roulette','race','horse','pinball','galton'].includes(localStorage.getItem('classroom-draw-mode'))) mode = localStorage.getItem('classroom-draw-mode'); } catch {}
$('mode').value = mode;
const galtonWrap=$('galton-wrap'),galtonCanvas=$('galton');
let galtonLabels=[];
function shuffleGalton(){galtonLabels=Array.from({length:count},(_,i)=>i+1);for(let i=count-1;i>0;i--){const j=randomNumber(undefined,i+1)-1;const v=galtonLabels[i];galtonLabels[i]=galtonLabels[j];galtonLabels[j]=v;}}
shuffleGalton();
const pinballWrap=$('pinball-wrap'),pinballCanvas=$('pinball');
const horseWrap=$('horse-wrap'), horseCanvas=$('horse');
const raceWrap=$('race-wrap'), raceCanvas=$('race');
const rouletteWrap=$('roulette-wrap'), rouletteCanvas=$('roulette');
const lotteryWrap=$('lottery-wrap'), lotteryCanvas=$('lottery');
const dieWrap = $('die-wrap'), die = $('die'), dc = die.getContext('2d');
// 40 facets in five belts of eight; a deliberately stylized, not precision, d40.
function drawDie(time = 0, selected = null) {
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
function syncMode(){pinballWrap.hidden=mode!=='pinball';horseWrap.hidden=mode!=='horse';raceWrap.hidden=mode!=='race';rouletteWrap.hidden=mode!=='roulette';dieWrap.hidden=mode!=='die';lotteryWrap.hidden=mode!=='lottery';$('number').hidden=mode!=='numbers'&&!$('app').classList.contains('result');if(mode==='die')drawDie(0,null);if(mode==='lottery')drawLottery(lotteryCanvas,0,duration,count,null,reduced.matches);if(mode==='roulette')drawRoulette(rouletteCanvas,count,0,null);if(mode==='race')drawBallRace(raceCanvas,count,0,duration,null,true);if(mode==='horse')drawHorseRace(horseCanvas,count,0,duration,null,true);if(mode==='pinball')drawPinball(pinballCanvas,count,0,duration,null,true);if(mode==='galton')drawGalton(galtonCanvas,galtonLabels,0,duration,null,true);}
$('mode').addEventListener('change',()=>{if(running){$('mode').value=mode;return;}mode=$('mode').value;try{localStorage.setItem('classroom-draw-mode',mode);}catch{} $('app').className='';$('number').textContent='?';syncMode();});
syncMode();
let sound = false, context, master, running = false, started = 0, lastIndex = -1, winner, raf, raceStory='comeback';
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
function tone(frequency, delay = 0, duration = .045, type = 'sine') {
 if (!sound || !context || context.state !== 'running' || document.hidden) return;
 const t = context.currentTime + delay, osc = context.createOscillator(), gain = context.createGain();
 osc.type = type; osc.frequency.value = frequency;
 gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(.4,t+.006); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
 osc.connect(gain); gain.connect(master); osc.start(t); osc.stop(t+duration+.02);
 osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}
function finish(audible = true) {
 running = false; $('count').disabled = false; $('duration').disabled = false; $('mode').disabled = false; cancelAnimationFrame(raf);
 $('number').textContent = winner; $('app').className = 'result'; if(mode==='die'){drawDie(0,winner);dieWrap.hidden=false;$('number').hidden=false;} if(mode==='lottery'){drawLottery(lotteryCanvas,duration,duration,count,winner,true);lotteryWrap.hidden=false;$('number').hidden=false;}if(mode==='roulette'){drawRoulette(rouletteCanvas,count,rouletteAngle(duration,duration,winner,count,true),winner);rouletteWrap.hidden=false;$('number').hidden=false;} if(mode==='race'){drawBallRace(raceCanvas,count,duration,duration,winner,false,raceStory);raceWrap.hidden=false;$('number').hidden=false;} if(mode==='horse'){drawHorseRace(horseCanvas,count,duration,duration,winner,false,raceStory);horseWrap.hidden=false;$('number').hidden=false;} if(mode==='pinball'){drawPinball(pinballCanvas,count,duration,duration,winner,false);pinballWrap.hidden=false;$('number').hidden=false;} $('status').textContent = 'あなたの番です！';
 $('caption').textContent = `${winner} 番`; $('start').disabled = false; $('start').innerHTML = 'もう一度ひく <span aria-hidden="true">↗</span>';
 $('hint').textContent = `毎回、1〜${count}番からランダムに選びます`; $('announcement').textContent = `${winner}番に決まりました。`;
 $('progress-fill').style.width = '100%';
 if (audible) { [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*.16,i===3?.7:.18,'triangle')); }
}
function tick() {
 if (!running) return;
 const elapsed = performance.now()-started, frame = frameAt(elapsed,schedule);
 if (frame.done) { finish(); return; }
 if(mode==='die' && !reduced.matches){drawDie(elapsed,null);raf=requestAnimationFrame(tick);return;}
 if(mode==='lottery'){ if(!reduced.matches) drawLottery(lotteryCanvas,elapsed,duration,count,null,false);raf=requestAnimationFrame(tick);return;}
 if(mode==='roulette'){if(!reduced.matches)drawRoulette(rouletteCanvas,count,rouletteAngle(elapsed,duration,winner,count),null);raf=requestAnimationFrame(tick);return;}
 if(mode==='race'){if(!reduced.matches)drawBallRace(raceCanvas,count,elapsed,duration,winner,false,raceStory);raf=requestAnimationFrame(tick);return;}
 if(mode==='horse'){if(!reduced.matches)drawHorseRace(horseCanvas,count,elapsed,duration,winner,false,raceStory);raf=requestAnimationFrame(tick);return;}
 if(mode==='pinball'){if(!reduced.matches)drawPinball(pinballCanvas,count,elapsed,duration,winner,false);raf=requestAnimationFrame(tick);return;}
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
 running = true; $('count').disabled = true; $('duration').disabled = true; $('mode').disabled = true; winner = randomNumber(undefined, count); shuffleGalton(); raceStory=['front','close','comeback'][randomNumber(undefined,3)-1]; started = performance.now(); lastIndex = -1; window.__lastVisualChange = -300;
 $('app').className = 'running'; $('start').disabled = true; $('start').textContent = '抽選中…'; $('status').textContent = 'だれの番かな…';
 $('caption').textContent = 'あと少し、お楽しみに'; $('hint').textContent = `${duration / 1000}秒で番号が決まります`; $('announcement').textContent = `抽選中です。${duration / 1000}秒で決まります。`;
 $('number').textContent = '…'; if(mode==='die'){$('number').hidden=true;dieWrap.hidden=false;drawDie(0,null);}if(mode==='lottery'){$('number').hidden=true;lotteryWrap.hidden=false;drawLottery(lotteryCanvas,0,duration,count,null,reduced.matches);}if(mode==='roulette'){$('number').hidden=true;rouletteWrap.hidden=false;drawRoulette(rouletteCanvas,count,0,null);}
 if(mode==='race'){$('number').hidden=true;raceWrap.hidden=false;drawBallRace(raceCanvas,count,0,duration,winner,reduced.matches,raceStory);}
 if(mode==='horse'){$('number').hidden=true;horseWrap.hidden=false;drawHorseRace(horseCanvas,count,0,duration,winner,reduced.matches,raceStory);}
 if(mode==='pinball'){$('number').hidden=true;pinballWrap.hidden=false;drawPinball(pinballCanvas,count,0,duration,winner,reduced.matches);}
 tick();
});
$('sound').addEventListener('click', () => {
 sound = !sound;
 if (!sound && master) master.gain.setValueAtTime(0,context.currentTime);
 if (sound) unlockAudio();
 updateSound(); try { localStorage.setItem('classroom-draw-sound',sound?'on':'off'); } catch {}
});
reduced.addEventListener('change', () => { if (running) { $('number').textContent = '…'; if(mode==='die') drawDie(0,null);if(mode==='lottery') drawLottery(lotteryCanvas,0,duration,count,null,true);if(mode==='roulette')drawRoulette(rouletteCanvas,count,0,null);if(mode==='race')drawBallRace(raceCanvas,count,0,duration,null,true);if(mode==='horse')drawHorseRace(horseCanvas,count,0,duration,null,true);if(mode==='pinball')drawPinball(pinballCanvas,count,0,duration,null,true); } });
document.addEventListener('visibilitychange', () => {
 if (document.hidden) { if(master) master.gain.setValueAtTime(0,context.currentTime); cancelAnimationFrame(raf); }
 else if (running) { if (performance.now()-started>=duration) finish(false); else { if(master && sound) master.gain.setValueAtTime(.18,context.currentTime); tick(); } }
});
if (document.documentElement.requestFullscreen && document.fullscreenEnabled) {
 $('fullscreen').hidden=false;
 $('fullscreen').addEventListener('click',async()=>{try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { $('hint').textContent='全画面は、ホーム画面に追加してご利用ください。'; }});
 document.addEventListener('fullscreenchange',()=>{ $('fullscreen').textContent=document.fullscreenElement?'全画面を終了':'全画面'; });
}
updateSound();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{ $('hint').textContent='オフライン準備ができませんでした。通信中は利用できます。'; });
