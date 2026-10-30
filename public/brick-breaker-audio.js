// Original synthesized brick-breaker sounds. No sampled copyrighted game assets.
export function playBrickSound(ctx,master,beat){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.008;
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=beat%4===0?'triangle':'sine';
 osc.frequency.setValueAtTime(beat%3===0?580:370+beat%5*65,now);
 osc.frequency.exponentialRampToValueAtTime(220,now+.105);
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.16,now+.005);gain.gain.exponentialRampToValueAtTime(.001,now+.125);
 osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+.14);
 osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
