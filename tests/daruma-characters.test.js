import test from 'node:test';
import assert from 'node:assert/strict';
import {drawDaruma,makeDarumaRound} from '../public/daruma.js';
function labelsAt(t,options={}) {
 const labels=[];
 let tx=0,ty=0,sx=1,sy=1;
 const context=new Proxy({save(){},restore(){tx=ty=0;sx=sy=1;},translate(x,y){tx=x;ty=y;},scale(x,y){sx=x;sy=y;},fillText(text,x,y){if(/^\d+$/.test(text))labels.push({n:+text,x:tx+x*sx,y:ty+y*sy});}}, {get(target,key){return key in target?target[key]:()=>{};}});
 drawDaruma({width:600,height:480,getContext:()=>context},makeDarumaRound(40,29,742),t,options);
 return labels;
}
test('all 40 bibs stay separate throughout running, stopping, retreat and finish',()=>{
 for(const options of [{},{reduced:true},{finished:true}])for(let t=0;t<=30000;t+=125){
  const labels=labelsAt(t,options);
  assert.equal(new Set(labels.map(l=>l.n)).size,40);
  for(const a of labels){
   assert.ok(a.x>=18&&a.x<=582&&a.y>=90&&a.y<=460);
   for(const b of labels)if(a.n!==b.n)assert.ok(Math.abs(a.x-b.x)>=36||Math.abs(a.y-b.y)>=56,`overlap ${a.n}/${b.n} at ${t}`);
  }
 }
});
