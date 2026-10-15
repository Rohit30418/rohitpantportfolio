/* Browser layout regression for the real-screenshot Project Hologram.
   Uses the local static files so the test is independent of Pages deployment. */
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const sizes=[
  [1728,900],[1440,900],[1366,768],[1280,720],
  [1024,768],[768,1024],[390,844]
];
const results=[];
try{
  for(const [width,height] of sizes){
    const page=await browser.newPage({
      viewport:{width,height},deviceScaleFactor:1,
      reducedMotion:'reduce'
    });
    await page.addInitScript(()=>{
      try{sessionStorage.setItem('rp-portfolio-intro-seen','1')}catch(_){}
    });
    await page.goto('http://127.0.0.1:8777/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(850);
    await page.evaluate(()=>{
      const section=document.getElementById('work');
      window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top,behavior:'instant'});
    });
    await page.waitForTimeout(280);
    const data=await page.evaluate(()=>{
      const rect=(selector)=>{
        const element=document.querySelector(selector);
        if(!element)return null;
        const r=element.getBoundingClientRect();
        return {top:Math.round(r.top),bottom:Math.round(r.bottom),
          left:Math.round(r.left),right:Math.round(r.right),
          height:Math.round(r.height),width:Math.round(r.width)};
      };
      const heading=rect('#work .holo-title');
      const actions=rect('#work .holo-actions');
      const header=rect('.lux-header');
      const browser=rect('#holoBrowserWrap');
      const projector=rect('#work .holo-projector-base');
      return {section:rect('#work'),header,heading,
        selector:rect('#holoSelector'),detail:rect('#work .holo-detail-card'),
        actions,browser,projector,stage:rect('#holoStage'),
        numberOfProjects:document.querySelectorAll('#holoSelector .holo-option').length,
        hasHud:!!document.querySelector('#work .holo-side-panel'),
        horizontalOverflow:document.documentElement.scrollWidth-innerWidth,
        screenshotVisible:document.querySelector('#holoRealShot')?.naturalWidth>0,
        activeLabel:document.querySelector('#holoProjectTitle')?.textContent
      };
    });
    const desktop=width>=981 && height>=720;
    const checks={
      projectCount:data.numberOfProjects===3,
      noHud:!data.hasHud,
      noHorizontalOverflow:data.horizontalOverflow<=3,
      screenshot:!!data.screenshotVisible,
      desktopTitleBelowHeader:!desktop || data.heading.top>=(data.header?.bottom||0)+4,
      desktopLeftVisible:!desktop || (data.actions.bottom<=height-6&&data.heading.top>=0),
      desktopRightVisible:!desktop || (data.browser.top>=0&&data.browser.bottom<=height+2&&data.projector.bottom<=height+2),
      desktopOneScreen:!desktop || data.section.height<=height+2
    };
    const passed=Object.values(checks).every(Boolean);
    console.log(JSON.stringify({width,height,desktop,passed,checks,rects:data}));
    results.push({width,height,passed});
    await page.close();
  }
}finally{await browser.close()}
if(results.some(x=>!x.passed)){
  console.error('Viewport regression: '+JSON.stringify(results.filter(x=>!x.passed)));
  process.exitCode=1;
}
