import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRobotRound } from '../public/robot-race.js';

test('two nested halves preserve every possible winner for 1–99 entrants', () => {
 for (let count=1;count<=99;count++) for(let winner=1;winner<=count;winner++) {
  const round=makeRobotRound(count,winner,123,n=>n);
  assert.ok(Array.isArray(round.stages), 'round includes elimination stages');
  assert.deepEqual(round.stages.map(s=>s.length), [count,Math.ceil(count/2),Math.ceil(Math.ceil(count/2)/2)]);
  for(let i=0;i<3;i++) {
   assert.ok(round.stages[i].includes(winner));
   assert.equal(new Set(round.stages[i]).size,round.stages[i].length);
   assert.ok(round.stages[i].every(n=>n>=1&&n<=count&&(!i||round.stages[i-1].includes(n))));
  }
 }
});
test('all nonwinning survivor pairs occur equally across Fisher–Yates choices', () => {
 const pairs=new Map();
 for(let a=1;a<=4;a++)for(let b=1;b<=3;b++)for(let c=1;c<=2;c++) {
  const choices=[a,b,c];
  const round=makeRobotRound(5,5,0,n=>choices.shift()??1);
  const key=round.stages[1].filter(n=>n!==5).sort().join(',');
  pairs.set(key,(pairs.get(key)||0)+1);
 }
 assert.equal(pairs.size,6);
 assert.deepEqual([...pairs.values()],Array(6).fill(4));
});
test('visual seed cannot change survival and second-stage sampling treats both rivals equally', () => {
 for(const pick of [()=>1,n=>n]) {
  assert.deepEqual(makeRobotRound(40,17,1,pick).stages,makeRobotRound(40,17,999,pick).stages);
 }
 const finals=new Map();
 for(let a=1;a<=4;a++)for(let b=1;b<=3;b++)for(let c=1;c<=2;c++)for(let d=1;d<=2;d++){
  const choices=[a,b,c,d];
  const r=makeRobotRound(5,5,1,()=>choices.shift());
  const rival=r.stages[2].find(n=>n!==5);
  finals.set(rival,(finals.get(rival)||0)+1);
 }
 assert.deepEqual([...finals.values()],Array(4).fill(12));
});
