import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');
 await page.locator('#mode').selectOption('robot');
 await page.locator('#duration').selectOption('3000');
 await page.locator('#start').click();
 await page.waitForTimeout(3200);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 assert.ok(+await page.locator('#number').textContent()>0);
 // Deterministic snapshots cover each completed elimination and the final field.
 for(const [p,expected] of [[0,40],[.45,20],[.75,10],[1,10]]){
  const result=await page.evaluate(async({p})=>{
   const {makeRobotRound,drawRobotRace}=await import('./robot-race.js?v=53');
   const round=makeRobotRound(40,17,123);
   const canvas=document.querySelector('#robot');
   document.querySelector('#app').className='running';document.querySelector('#number').hidden=true;
   const ctx=canvas.getContext('2d'),labels=[],fill=ctx.fillText;
   ctx.fillText=function(text,...args){if(/^\d+$/.test(String(text)))labels.push(+text);return fill.call(this,text,...args)};
   drawRobotRace(canvas,round,p*8000,8000,false);ctx.fillText=fill;
   return {count:new Set(labels).size,plates:labels.length};
  },{p});
  assert.equal(result.count,expected);assert.equal(result.plates,expected*(p>=.3?2:1));
  if(p===.45)await page.screenshot({path:`../robot-first-half-${name}.png`});
 }
 for(const [width,height] of [[320,568],[390,844],[844,390],[1024,768]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const box=await page.locator('#robot').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width,JSON.stringify({width,height,box}));
  const start=await page.locator('#start').boundingBox();assert.ok(start.y+start.height<=height,JSON.stringify({width,height,start}));
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#start').click();await page.waitForTimeout(3200);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.reload();await context.setOffline(true);await page.reload();
 await page.locator('#start').click();await page.waitForTimeout(3200);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 assert.deepEqual(errors,[]);
 console.log(name+' PASS: robot stages, result, replay, responsive sizes, reduced motion, offline, no JS errors');
 await browser.close();
}
