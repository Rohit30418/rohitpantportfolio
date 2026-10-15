/* Contact Journey responsive browser test.
 * Checks real DOM geometry, 3 preserved contact links, no clipping/overflow. */
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const screens=[[1920,1080],[1600,900],[1440,900],[1366,768],[1152,720],[1024,768],[768,1024],[600,900],[390,844],[375,667],[320,640]];
let failures=0;
try{
  for(const [width,height] of screens){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1});
    await page.addInitScript(()=>{try{sessionStorage.setItem('rp-portfolio-intro-seen','1')}catch(_){}});
    await page.goto('http://127.0.0.1:8777/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const data=await page.evaluate(()=>{
      const $=s=>document.querySelector(s);
      const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
      const section=$('#contact');
      const headline=$('#contactHeading');
      const panel=$('#contact .contact-journey-panel');
      const inner=$('#contact .contact-journey-inner');
      const artwork=$('#contact .contact-journey-art');
      const plane=$('#contact .contact-journey-plane');
      const links=[...section.querySelectorAll('.contact-journey-link')];
      const sr=rect(section),hr=rect(headline),pr=rect(panel),ir=rect(inner);
      const mini=innerWidth<=760;
      const linkChecks=links.map(link=>{
        const r=rect(link);
        const text=rect(link.querySelector('.contact-journey-meta strong'));
        const icon=rect(link.querySelector('.contact-journey-icon'));
        const arrow=rect(link.querySelector('.contact-journey-arrow'));
        return {href:link.href,label:link.querySelector('small').textContent.trim(),
          contentInside:r.left>=pr.left-2&&r.right<=pr.right+2,
          arrowInside:arrow.right<=pr.right-3&&arrow.left>=pr.left+3,
          textInside:text.left>=icon.right+4 && text.right<=arrow.left-3,
          rowWithinPanel:r.top>=pr.top-2&&r.bottom<=pr.bottom+2};
      });
      return {
        section:sr,headline:hr,panel:pr,inner:ir,
        plane:rect(plane),artwork:rect(artwork),
        sectionVisible:getComputedStyle(section).display!=='none',
        artPresent:!!section.querySelector('.contact-journey-lines path'),
        text:headline.textContent.trim(),
        linkChecks,mini,
        horizontalOverflow:document.documentElement.scrollWidth-innerWidth,
        footerAfterSection:!!document.querySelector('.footer'),
        titleWithinInner:hr.left>=ir.left-3&&hr.right<=ir.right+3,
        panelWithinInner:pr.left>=ir.left-3&&pr.right<=ir.right+3,
        layoutOrder:mini?pr.top>hr.bottom:pr.left>hr.right,
        sectionContainsPanel:pr.top>=sr.top-3&&pr.bottom<=sr.bottom+3,
        usableHeight:sr.height<1150
      };
    });
    const checks={
      newDesign:data.sectionVisible&&data.artPresent&&data.text.includes('Let’s have')&&data.text.includes('a chat'),
      exactLinks:data.linkChecks.length===3&&
        data.linkChecks[0].href==='mailto:rohitpant090@gmail.com'&&
        data.linkChecks[1].href==='https://www.linkedin.com/in/rohitpantdev/'&&
        data.linkChecks[2].href.replace(/\\/$/,'')==='https://github.com/Rohit30418',
      cardLinkFits:data.linkChecks.every(({contentInside,arrowInside,textInside,rowWithinPanel})=>contentInside&&arrowInside&&textInside&&rowWithinPanel),
      titleWithinInner:data.titleWithinInner,
      panelWithinInner:data.panelWithinInner,
      correctOrder:data.layoutOrder,
      panelWithinSection:data.sectionContainsPanel,
      reasonableHeight:data.usableHeight,
      noHorizontalOverflow:data.horizontalOverflow<=3,
      footerIntact:data.footerAfterSection
    };
    const pass=Object.values(checks).every(Boolean);
    if(!pass)failures++;
    console.log(JSON.stringify({width,height,passed:pass,checks,measurements:{sectionHeight:Math.round(data.section.height),
      headlineRight:Math.round(data.headline.right),panelLeft:Math.round(data.panel.left),
      panelWidth:Math.round(data.panel.width),linkChecks:data.linkChecks,
      overflow:data.horizontalOverflow}}));
    await page.close();
  }
}finally{await browser.close()}
if(failures){console.error('CONTACT_JOURNEY_FAILED: '+failures);process.exitCode=1;}
else console.log('CONTACT_JOURNEY_PASSED');
