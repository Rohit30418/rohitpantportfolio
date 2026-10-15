/**
 * Captures actual PUBLIC project pages on a GitHub-hosted Chromium browser.
 * Screenshots are snapshots of those pages, not generated/mocked interfaces.
 * No authentication or user session data is used.
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('assets/project-shots');
await fs.mkdir(output, { recursive: true });

const projects = [
  ['vaani', 'https://vaani.rohitpant.in/'],
  ['eventhive', 'https://eventhive.rohitpant.in/'],
  ['argus', 'https://argus-pro-a2px.onrender.com/'],
  ['hall', 'https://booking.printpackipama.com/hallLayout/ViewhallLayout.html?HallId=28&StallNo=E18&hallName=HALL+9']
];

const browser = await chromium.launch({ headless:true, args:['--disable-dev-shm-usage'] });
const manifest = {};
try {
  for (const [key,url] of projects) {
    let page;
    try {
      page = await browser.newPage({
        viewport: { width:1440,height:900 },
        deviceScaleFactor:1,
        reducedMotion:'reduce',
        colorScheme:'dark'
      });
      page.setDefaultTimeout(10000);
      // Free Render instances may briefly return 503 during a cold start.
      // Retry server errors rather than treating a sleeping service as a final failure.
      let response=null;
      for(let attempt=1;attempt<=3;attempt++){
        try{
          response=await page.goto(url,{ waitUntil:'domcontentloaded',timeout:45000 });
          if(response && response.status()>=500 && attempt<3){
            console.log(key+': received HTTP '+response.status()+'; retry '+attempt);
            await page.waitForTimeout(20000);
            continue;
          }
          break;
        }catch(err){
          if(attempt===3)throw err;
          console.log(key+': navigation retry '+attempt+' ('+err.message+')');
          await page.waitForTimeout(12000);
        }
      }
      if(response && response.status() >= 400) throw new Error('HTTP '+response.status());
      await page.waitForTimeout(5500);
      const health = await page.evaluate(() => ({
        title: document.title,
        textLength: document.body?.innerText?.trim()?.length || 0,
        hasVisual: !!document.querySelector('canvas,svg,img,video,main,.app')
      }));
      if (/404|not found|application error|bad gateway/i.test(health.title || '') || (health.textLength < 20 && !health.hasVisual)) {
        throw new Error('Page did not render suitable public content: '+JSON.stringify(health));
      }
      const file=path.join(output,key+'.jpg');
      await page.screenshot({
        path:file,type:'jpeg',quality:78,
        animations:'disabled',fullPage:false
      });
      const stats=await fs.stat(file);
      if(stats.size<3500) throw new Error('Screenshot unexpectedly small');
      manifest[key]={file:'assets/project-shots/'+key+'.jpg',capturedAt:new Date().toISOString(),source:url,title:health.title};
      console.log(key+': screenshot captured ('+Math.round(stats.size/1024)+' KB)');
    } catch(err) {
      console.warn(key+': screenshot failed: '+err.message);
      // Do not overwrite previous real captures with dummy images.
    } finally {
      await page?.close().catch(()=>{});
    }
  }
  await fs.writeFile(path.join(output,'capture-report.json'), JSON.stringify({updatedAt:new Date().toISOString(),captured:manifest},null,2)+'\n');
} finally {
  await browser.close();
}
