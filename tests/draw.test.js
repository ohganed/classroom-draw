import test from 'node:test';
import assert from 'node:assert/strict';
import { randomNumber, buildSchedule, frameAt } from '../public/draw.js';
test('uniform mapping includes both endpoints and rejects biased overflow', () => {
 assert.equal(randomNumber(() => 0), 1);
 assert.equal(randomNumber(() => 39), 40);
 let values = [4294967295, 40];
 assert.equal(randomNumber(() => values.shift()), 1);
});
test('schedule slows down and ends at exactly eight seconds', () => {
 const times = buildSchedule();
 assert.equal(times[0],0);
 assert.equal(times.at(-1),8000);
 const gaps = times.slice(1,-1).map((t,i)=>t-times[i]);
 assert.ok(gaps.length > 25);
 assert.ok(gaps[0] <= 60);
 assert.ok(gaps.at(-1) > 500);
 assert.ok(gaps.every((gap,i)=>i===0 || gap>=gaps[i-1]));
});
test('deadline settles even after a background delay; no early settlement', () => {
 const times = buildSchedule();
 assert.equal(frameAt(7999,times).done,false);
 assert.equal(frameAt(8000,times).done,true);
 assert.equal(frameAt(25000,times).done,true);
 assert.equal(frameAt(0,times).index,0);
 assert.equal(frameAt(500,times).done,false);
});
