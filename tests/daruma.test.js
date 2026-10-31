import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDarumaRound,darumaPosition,darumaFacing,DARUMA_DURATION} from '../public/daruma.js';
test('40 contenders are valid and independently eligible to win',()=>{
 for(let winner=1;winner<=40;winner++){
  const r=makeDarumaRound(40,winner,1234);
  assert.equal(darumaPosition(r,winner,DARUMA_DURATION),1);
  assert.equal(Array.from({length:40},(_,i)=>darumaPosition(r,i+1,DARUMA_DURATION)).filter(p=>p===1).length,1);
 }
});
test('positions are deterministic and stay inside the track',()=>{
 const r=makeDarumaRound(40,29,742);
 for(const t of [0,1000,7500,16000,24000,29999,30000]){
  for(let n=1;n<=40;n++){
   const p=darumaPosition(r,n,t);
   assert.ok(p>=0&&p<=1);
   assert.equal(p,darumaPosition(r,n,t));
  }
 }
});
test('turning point and deadline are stable',()=>{
 assert.equal(DARUMA_DURATION,30000);
 assert.equal(darumaFacing(1200),false);
 assert.equal(darumaFacing(2600),true);
 assert.throws(()=>makeDarumaRound(40,41,0),RangeError);
});
