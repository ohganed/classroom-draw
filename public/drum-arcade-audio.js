// Original synthesized taiko-like sounds, no sampled audio or copyrighted game assets.
export function playDrumBeat(ctx,master,step){
 if(!ctx||ctx.state!=='running'||!master)return;
 const now=ctx.currentTime+.006;
 const hit=(freq,type,vol,dur,slide)=>{
  const osc=ctx.createOscillator(),g=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(Math.max(35,slide),now+dur);
  g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(vol,now+.004);g.gain.exponentialRampToValueAtTime(.001,now+dur);
  osc.connect(g);g.connect(master);osc.start(now);osc.stop(now+dur+.015);
  osc.onended=()=>{osc.disconnect();g.disconnect();};
 };
 if(step%4===0){hit(145,'sine',.54,.20,53);hit(105,'triangle',.12,.14,60);}
 else if(step%4===2){hit(195,'sine',.38,.16,68);}
 else{hit(step%8===3?450:560,'triangle',.17,.085,270);}
 if(step>=34)hit(180,'sine',.18,.11,75);
}
