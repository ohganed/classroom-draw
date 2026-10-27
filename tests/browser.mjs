import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
for (const [name,engine] of [['chromium',chromium],['webkit',webkit]]) {
 let browser;
 try { browser=await engine.launch({headless:true}); } catch(e) { throw new Error(name+' unavailable: '+e.message); }
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
 const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4173');

 await page.getByRole('button',{name:'音 OFF'}).click();
 await page.getByRole('button',{name:'抽選スタート'}).click();
 assert.equal(await page.locator('#start').isDisabled(),true);
 await page.waitForTimeout(1000);
 const first=await page.locator('#number').textContent(); assert.ok(+first>=1 && +first<=40);
 await page.waitForTimeout(7300);
 const winner=await page.locator('#number').textContent(); assert.ok(+winner>=1 && +winner<=40);
 assert.equal(await page.locator('#start').isDisabled(),false);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 await page.waitForTimeout(1000); assert.equal(await page.locator('#number').textContent(),winner);

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'もう一度ひく'}).click();
 await page.waitForTimeout(500); assert.equal(await page.locator('#number').textContent(),'…');
 await page.waitForTimeout(7700); assert.ok(+await page.locator('#number').textContent()>=1);
 await page.getByRole('button',{name:'音 ON'}).click();
 await page.reload(); assert.equal(await page.locator('#sound').textContent(),'音 OFF');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await context.setOffline(true); await page.reload(); assert.equal(await page.locator('h1').textContent(),'だれの番？');
 for(const [width,height] of [[768,1024],[390,844],[844,390]]) {
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const box=await page.locator('#start').boundingBox(); assert.ok(box.y+box.height<=height);
 }
 assert.deepEqual(errors,[]); console.log(name+' PASS: draw, eight-second result, rerun, reduced motion, sound persistence, offline reload, 4 viewports, no JS errors');
 await browser.close();
}
