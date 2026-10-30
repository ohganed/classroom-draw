// Original short maze chase bleeps; no borrowed arcade samples.
export function playMazeChaseSound(ctx,master,beat){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.005,osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=beat%3===0?'triangle':'sine';
 osc.frequency.setValueAtTime(220+(beat%6)*62,now);
 osc.frequency.exponentialRampToValueAtTime(300+(beat%7)*51,now+.085);
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.10,now+.004);gain.gain.exponentialRampToValueAtTime(.001,now+.12);
 osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+.13);osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
