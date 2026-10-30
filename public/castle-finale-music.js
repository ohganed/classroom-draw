// Original comic 8-bit castle march; not a transcription of any game music.
// 150 BPM, 16th-note sequencer; playful syncopated lead, bouncing bass, blips.
const lead=[76,79,81,null,79,76,74,72,76,null,83,81,79,null,76,74,
  72,76,79,null,84,83,79,null,77,74,76,79,72,null,67,null,
  76,79,81,84,83,null,81,79,76,72,74,null,79,76,74,null,
  81,84,86,null,84,81,79,76,74,77,79,null,76,null,72,null];
const bass=[48,null,55,null,52,null,55,null,45,null,52,null,43,null,50,null,
  48,null,55,null,53,null,60,null,43,null,50,null,48,null,55,null];
const freq=m=>440*Math.pow(2,(m-69)/12);
function beep(ctx,dest,m,t,len,kind,level){
 if(m===null||m===undefined)return;
 const o=ctx.createOscillator(),g=ctx.createGain(),cut=ctx.createBiquadFilter();
 o.type=kind;o.frequency.setValueAtTime(freq(m),t);
 cut.type='lowpass';cut.frequency.value=kind==='square'?2100:1600;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(level,t+.008);
 g.gain.setValueAtTime(level*.68,t+len*.55);
 g.gain.exponentialRampToValueAtTime(.0001,t+len);
 o.connect(cut);cut.connect(g);g.connect(dest);o.start(t);o.stop(t+len+.015);
 o.onended=()=>{o.disconnect();cut.disconnect();g.disconnect();};
}
export function playCastleMusicStep(ctx,master,step){
 if(!ctx||ctx.state!=='running'||!master)return;
 const t=ctx.currentTime+.005,k=step%lead.length;
 beep(ctx,master,lead[k],t,.16,step%8===6?'triangle':'square',.065);
 if(step%2===0)beep(ctx,master,bass[Math.floor(step/2)%bass.length],t,.22,'triangle',.085);
 if(step%4===2)beep(ctx,master,88,t,.035,'sine',.025);
 if(step%8===7)beep(ctx,master,84,t,.045,'triangle',.03);
 // A distinct rising leap sound every two bars.
 if(step%32===0&&step>0){beep(ctx,master,84,t,.075,'sine',.05);beep(ctx,master,91,t+.08,.10,'sine',.045);}
}
