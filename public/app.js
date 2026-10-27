import { randomNumber, buildSchedule, frameAt } from './draw.js';
const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const schedule = buildSchedule();
let sound = false, context, master, running = false, started = 0, lastIndex = -1, winner, raf;
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
 running = false; cancelAnimationFrame(raf);
 $('number').textContent = winner; $('app').className = 'result'; $('status').textContent = 'あなたの番です！';
 $('caption').textContent = `${winner} 番`; $('start').disabled = false; $('start').innerHTML = 'もう一度ひく <span aria-hidden="true">↗</span>';
 $('hint').textContent = '毎回、1〜40番からランダムに選びます'; $('announcement').textContent = `${winner}番に決まりました。`;
 $('progress-fill').style.width = '100%';
 if (audible) { [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*.16,i===3?.7:.18,'triangle')); }
}
function tick() {
 if (!running) return;
 const elapsed = performance.now()-started, frame = frameAt(elapsed,schedule);
 if (frame.done) { finish(); return; }
 $('progress-fill').style.width = `${Math.min(100,elapsed/80)}%`;
 if (frame.index !== lastIndex) {
  lastIndex = frame.index;
  if (!reduced.matches) {
   let next; do { next = randomNumber(); } while (String(next) === $('number').textContent);
   $('number').textContent = next;
   tone(660 + (next % 5)*70);
  }
 }
 raf = requestAnimationFrame(tick);
}
$('start').addEventListener('click', () => {
 if (running) return;
 unlockAudio();
 // Silence any remaining fanfare before a new round.
 if (master) { master.gain.setValueAtTime(0,context.currentTime); const previous = master; master = context.createGain(); master.gain.value=.18; master.connect(context.destination); setTimeout(()=>previous.disconnect(),1200); }
 running = true; winner = randomNumber(); started = performance.now(); lastIndex = -1;
 $('app').className = 'running'; $('start').disabled = true; $('start').textContent = '抽選中…'; $('status').textContent = 'だれの番かな…';
 $('caption').textContent = 'あと少し、お楽しみに'; $('hint').textContent = '8秒で番号が決まります'; $('announcement').textContent = '抽選中です。8秒で決まります。';
 if (reduced.matches) $('number').textContent = '…';
 tick();
});
$('sound').addEventListener('click', () => {
 sound = !sound;
 if (!sound && master) master.gain.setValueAtTime(0,context.currentTime);
 if (sound) unlockAudio();
 updateSound(); try { localStorage.setItem('classroom-draw-sound',sound?'on':'off'); } catch {}
});
reduced.addEventListener('change', () => { if (running && reduced.matches) $('number').textContent = '…'; });
document.addEventListener('visibilitychange', () => {
 if (document.hidden) { if(master) master.gain.setValueAtTime(0,context.currentTime); cancelAnimationFrame(raf); }
 else if (running) { if (performance.now()-started>=8000) finish(false); else { if(master && sound) master.gain.setValueAtTime(.18,context.currentTime); tick(); } }
});
if (document.documentElement.requestFullscreen && document.fullscreenEnabled) {
 $('fullscreen').hidden=false;
 $('fullscreen').addEventListener('click',async()=>{try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { $('hint').textContent='全画面は、ホーム画面に追加してご利用ください。'; }});
 document.addEventListener('fullscreenchange',()=>{ $('fullscreen').textContent=document.fullscreenElement?'全画面を終了':'全画面'; });
}
updateSound();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{ $('hint').textContent='オフライン準備ができませんでした。通信中は利用できます。'; });
