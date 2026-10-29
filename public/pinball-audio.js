// Soft pinball impacts, triggered only by recorded physics collisions.
// Short envelopes, rounded waveforms and no sustained overlapping noise.
export function playPinballBounce(ctx,master,impact){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime,bumper=impact.type==='bumper';
 const strength=Math.min(1,Math.max(.15,(impact.strength-65)/400));
 const osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=bumper?'sine':'triangle';
 const start=(bumper?360:225)+strength*(bumper?140:95);
 osc.frequency.setValueAtTime(start,now);
 osc.frequency.exponentialRampToValueAtTime(bumper?190:135,now+.15);
 const peak=(bumper?.11:.075)*(.5+.5*strength);
 gain.gain.setValueAtTime(0,now);
 gain.gain.linearRampToValueAtTime(peak,now+.009);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.17);
 osc.connect(gain);gain.connect(master);
 osc.start(now);osc.stop(now+.18);
 osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
