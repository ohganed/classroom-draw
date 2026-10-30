// Five-voice public-domain Twinkle Twinkle arrangement using Web Audio synthesis.
// Each voice is independently voiced. Audio only plays when the app sound toggle is ON.
const melody=[60,60,67,67,69,69,67,65,65,64,64,62,62,60,67,67,65,65,64,64,62,67,67,65,65,64,64,62,60];
const midi=n=>440*Math.pow(2,(n-69)/12);
export function playStarQuintetBeat(context,master,step){
 if(!context||context.state!=='running'||!master||step<0||step>=40)return;
 const now=context.currentTime+.008;
 const voices=[
  {type:'sine',base:0,offset:0,gain:.16,dur:.23},
  {type:'triangle',base:-12,offset:2,gain:.09,dur:.35},
  {type:'sine',base:12,offset:4,gain:.07,dur:.20},
  {type:'square',base:-5,offset:6,gain:.022,dur:.14},
  {type:'triangle',base:-24,offset:8,gain:.1,dur:.4}
 ];
 voices.forEach((v,i)=>{
  if(step<v.offset)return;
  const idx=(step-v.offset)%melody.length;
  let note=melody[idx]+v.base;
  // Held chordal ending, deliberately consonant and gentle.
  if(step>=36)note=[60,64,67,72,48][i];
  if(step%2&&i===4&&step<36)return;
  const osc=context.createOscillator(),env=context.createGain();
  osc.type=v.type;osc.frequency.value=midi(note);
  const dur=step>=36?.8:v.dur;
  env.gain.setValueAtTime(0,now);
  env.gain.linearRampToValueAtTime(v.gain,now+.015);
  env.gain.exponentialRampToValueAtTime(.001,now+dur);
  osc.connect(env);env.connect(master);osc.start(now);osc.stop(now+dur+.03);
  osc.onended=()=>{osc.disconnect();env.disconnect();};
 });
}
