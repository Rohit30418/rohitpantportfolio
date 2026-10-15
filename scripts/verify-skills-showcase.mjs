/* Skills showcase regression: visuals, navigation, accessibility, screen sizes.
 * Uses Chromium against a locally served checkout, no screenshots mocked. */
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const screens=[[1920,900],[1600,900],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[320,640]];
const results=[];
try {
  for (const [width,height] of screens) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'});
    await page.addInitScript(()=>{
      try{sessionStorage.setItem('rp-portfolio-intro-seen','1')}catch(_){}
    });
    await page.goto('http://127.0.0.1:8777/',{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('#skillsUniverse .skills-glass-card').first().waitFor({timeout:12000});
    await page.locator('#skills').scrollIntoViewIfNeeded();
    const getInfo=()=>page.evaluate(()=>{
      const el=(selector)=>document.querySelector(selector);
      const rect=node=>{
        const a=node.getBoundingClientRect();
        return {left:a.left,right:a.right,top:a.top,bottom:a.bottom,width:a.width,height:a.height};
      };
      const host=el('#skillsUniverse');
      const stage=el('#skills .skills-glass-stage');
      const cards=[...document.querySelectorAll('#skills .skills-glass-card')];
      const shown=cards.filter(x=>x.dataset.visible==='true');
      const active=cards.find(x=>x.dataset.active==='true');
      const ar=rect(active),sr=rect(stage);
      return {
        section:rect(el('#skills')),stage:sr,
        hostVisible:getComputedStyle(host).display!=='none',
        fallbackHidden:getComputedStyle(el('#skills .skills-marquee-wrap')).display==='none',
        count:cards.length,visibleCount:shown.length,
        activeName:active.querySelector('.skills-glass-label')?.textContent,
        activeRect:ar,cardSizes:shown.map(x=>Math.round(rect(x).width)),
        activeInside:ar.left>=sr.left && ar.right<=sr.right && ar.top>=sr.top && ar.bottom<=sr.bottom,
        heading:el('#skills .skills-marquee-title').textContent.trim(),
        prev:!!el('#skills .skills-glass-prev'),
        next:!!el('#skills .skills-glass-next'),
        overflow:document.documentElement.scrollWidth-innerWidth,
        cardStatusAccessible:cards.every(x=>x.hasAttribute('aria-pressed')),
        ghostCanvas:!!el('#skills canvas')
      };
    });
    const before=await getInfo();
    await page.locator('#skills .skills-glass-next').click();
    const after=await getInfo();
    await page.locator('#skills .skills-glass-prev').click();
    const restored=await getInfo();
    await page.locator('#skills .skills-glass-next').focus();
    await page.keyboard.press('ArrowRight');
    const keyboard=await getInfo();
    // Exercise mobile touch-like pointer swipe via browser events.
    await page.evaluate(()=>{
      const stage=document.querySelector('#skills .skills-glass-stage');
      stage.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',clientX:220,clientY:190}));
      stage.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',clientX:112,clientY:192}));
    });
    const swiped=await getInfo();
    const checks={
      rendered:before.hostVisible && before.fallbackHidden,
      allSkills:before.count===18,
      visibleCards:before.visibleCount>=3 && before.visibleCount<=9,
      readableSize:Math.min(...before.cardSizes)>=145,
      activeInside:before.activeInside,
      sectionSize:before.section.height<1100,
      title:before.heading.includes('TOOLS I USE')&&before.heading.includes('TO BUILD'),
      nav:before.next&&before.prev,
      nextWorks:after.activeName!==before.activeName,
      previousWorks:restored.activeName===before.activeName,
      keyboardWorks:keyboard.activeName===after.activeName,
      swipeWorks:swiped.activeName!==keyboard.activeName,
      noExtraCanvas:!before.ghostCanvas,
      noHorizontalOverflow:before.overflow<=3,
      ariaStates:before.cardStatusAccessible
    };
    const passed=Object.values(checks).every(Boolean);
    console.log(JSON.stringify({width,height,passed,checks,metrics:{active:before.activeName,after:after.activeName,visible:before.visibleCount,cardMin:Math.min(...before.cardSizes),stage:before.stage,sectionHeight:Math.round(before.section.height),overflow:before.overflow}}));
    results.push({width,height,passed});
    await page.close();
  }
} finally {await browser.close();}
if(results.some(r=>!r.passed)){
  console.error('SKILL SHOWCASE FAILURES: '+JSON.stringify(results.filter(r=>!r.passed)));
  process.exitCode=1;
}else console.log('SKILL SHOWCASE: ALL VIEWPORTS PASSED');
