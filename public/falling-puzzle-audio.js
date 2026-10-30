// Newly synthesized falling-piece impact, row clear and chain sounds.
export function playFallingSound(ctx,master,kind,index=0){
 if(!ctx||ctx.state!=='running'||!master)return;
 const notes=kind==='drop'?[230]:kind==='clear'?[510,680,900]:kind==='chain'?[390,560,790]:[660,880,1050];
 for(let i=0;i<notes.length;i++){
  const start=ctx.currentTime+i*.078,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=kind==='drop'?'triangle':'sine';osc.frequency.setValueAtTime(notes[i]+(index%3)*12,start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(100,notes[i]*.7),start+.11);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(kind==='drop'?.10:.12,start+.008);gain.gain.exponentialRampToValueAtTime(.001,start+.14);
  osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+.15);osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
}
