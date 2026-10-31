// Split-flap airport departure-board slot.
export const SLOT_DURATION=12000;
export function slotDigits(winner){return String(winner).padStart(3,'0').split('');}
export function slotStage(elapsed,clicks=0){return Math.max(Math.min(3,Math.floor(Math.max(0,elapsed)/3000)),Math.min(3,clicks));}
export function slotFrame(winner,elapsed,clicks=0,finished=false){
 const stage=slotStage(elapsed,clicks),target=slotDigits(winner);
 const intervals=[74,125,195].map((base,i)=>i<stage?base+450+i*230:base);
 const digits=target.map((d,i)=>{
  if(finished)return d;
  // Each digit eventually approaches its target; speed decelerates independently.
  const step=Math.floor(elapsed/intervals[i]);
  return String((Number(d)+step*7+i*3)%10);
 });
 return {digits,stage,intervals};
}
export function renderSlot(element,winner,elapsed,clicks=0,finished=false){
 const frame=slotFrame(winner,elapsed,clicks,finished);
 const displays=element.querySelectorAll('[data-slot-digit]');
 displays.forEach((el,i)=>{
  if(el.textContent!==frame.digits[i]){
   el.textContent=frame.digits[i];
   el.classList.remove('slot-flip');
   void el.offsetWidth;
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)el.classList.add('slot-flip');
  }
  el.parentElement.classList.toggle('slowed',!finished&&i<frame.stage);
  el.parentElement.classList.toggle('locked',finished);
 });
 const status=element.querySelector('[data-slot-status]');
 if(status)status.textContent=finished?'🎉 当選番号が決まりました！':frame.stage===3?'全桁が減速中… 最後の瞬間！':(frame.stage+1)+'桁目を減速させよう！ 画面をタップ';
 return frame;
}
