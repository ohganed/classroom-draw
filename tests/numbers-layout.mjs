import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]) {
 const browser=await engine.launch();
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');
 await page.locator('#mode').selectOption('numbers');
 await page.locator('#duration').selectOption('3000');
 const check=async phase=>{
  for(const [width,height] of [[844,390],[667,375],[568,320],[320,568],[390,844],[1024,768]]) {
   await page.setViewportSize({width,height});
   const rects=await page.evaluate(()=>Object.fromEntries(['header','.stage','#number','footer','#start','#hint'].map(s=>{
    const r=document.querySelector(s).getBoundingClientRect();return [s,{top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}];
   })));
   for(const selector of ['header','#number','#start','#hint']) {
    const r=rects[selector];assert.ok(r.top>=0&&r.bottom<=height&&r.left>=0&&r.right<=width,JSON.stringify({name,phase,width,height,selector,r}));
   }
   assert.ok(rects['#number'].top>=rects.header.bottom&&rects['#number'].bottom<=rects.footer.top,JSON.stringify({name,phase,width,height,rects}));
   assert.ok(rects['#start'].height>=44,'touch target stays usable');
  }
 };
 await check('idle');
 await page.locator('#start').click();await check('running');
 await page.waitForFunction(()=>document.querySelector('#app').classList.contains('result'));
 await check('result');assert.deepEqual(errors,[]);
 console.log(name+' PASS: numbers idle/running/result, six portrait/landscape sizes, controls inside viewport, no overlaps');
 await browser.close();
}
