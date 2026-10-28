// Gentle Web Audio cues synchronized to the crane's timeline.
// All oscillators stop by themselves. Uses the app's master volume and mute.
export function scheduleCraneSounds(ctx,master,round,duration){
 if(!ctx||!master||ctx.state!=='running'||!round)return;
 const start=ctx.currentTime, segment=duration/1000/(round.misses+1);
 const created=[];
 function cue(offset,length,frequency,endFrequency,kind='sine',volume=.15){
  const t=start+offset,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=kind;osc.frequency.setValueAtTime(frequency,t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),t+length);
  gain.gain.setValueAtTime(0,t);
  gain.gain.linearRampToValueAtTime(volume,t+Math.min(.04,length*.15));
  gain.gain.setValueAtTime(volume,t+Math.max(.05,length-.09));
  gain.gain.linearRampToValueAtTime(0,t+length);
  osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+length+.015);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
  created.push(osc);
 }
 for(let i=0;i<=round.misses;i++){
  const at=i*segment;
  // Horizontal servo: soft dual-tone rolling motor.
  cue(at+.025*segment,.16*segment,145,165,'triangle',.085);
  cue(at+.025*segment,.16*segment,292,312,'sine',.035);
  // Lowering mechanism: motor frequency falls slowly.
  cue(at+.19*segment,.25*segment,190,105,'triangle',.105);
  // Gripping capsule: a short tactile click and two soft confirmation notes.
  cue(at+.455*segment,.075,510,295,'square',.045);
  cue(at+.49*segment,.085,600,475,'sine',.075);
  // Rising mechanism: motor frequency increases.
  cue(at+.54*segment,.25*segment,110,205,'triangle',.105);
  if(i<round.misses){
   // Capsule slips; quiet descending plop.
   cue(at+.85*segment,.13,360,135,'sine',.09);
  }else{
   // Successful retrieval, restrained two-note chime.
   cue(at+.86*segment,.16,523,523,'sine',.10);
   cue(at+.92*segment,.18,659,659,'sine',.10);
  }
 }
 return created;
}
