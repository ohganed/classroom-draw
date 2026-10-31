import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('../../outputs',{recursive:true});
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1024,height:768}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174');
 await page.locator('#mode').selectOption('daruma');
 assert.match(await page.locator('#sound').textContent(),/ON/);
 await page.clock.install();
 await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.locator('#start').click();
 await page.clock.runFor(1400);
 await page.locator('#daruma').screenshot({path:`../../outputs/daruma-running-${name}.png`});
 await page.clock.runFor(1300);
 await page.locator('#daruma').screenshot({path:`../../outputs/daruma-stop-${name}.png`});
 await page.clock.runFor(27200);
 assert.equal(await page.locator('#start').isDisabled(),true);
 await page.clock.runFor(200);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 assert.ok(+await page.locator('#number').textContent()>=1&&+await page.locator('#number').textContent()<=40);
 await page.locator('#daruma').screenshot({path:`../../outputs/daruma-finish-${name}.png`});
 for(const [width,height] of [[320,568],[390,844],[844,390],[1024,768]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#start').click();await page.clock.runFor(30100);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 await page.locator('#sound').click();assert.match(await page.locator('#sound').textContent(),/OFF/);
 await page.locator('#mode').selectOption('numbers');
 await page.locator('#duration').selectOption('3000');
 await page.locator('#start').click();await page.clock.runFor(3100);
 assert.equal(await page.locator('#app').getAttribute('class'),'result');
 assert.deepEqual(errors,[]);
 console.log(name+' PASS: 30s deadline, result, sound toggles, reduced motion, responsive, numbers mode, no JS errors');
 await browser.close();
}
