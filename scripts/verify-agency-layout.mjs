/* Portfolio V2 visual smoke/regression checks.
   Reused by existing GitHub Actions workflows after the agency redesign. */
import {chromium} from 'playwright';

export async function verifyAgency(mode='all'){
  const viewports=mode==='hero'?
    [{name:'wide desktop',width:1920,height:1080},{name:'laptop',width:1440,height:900},{name:'125% zoom equivalent',width:1152,height:720},{name:'tablet landscape',width:1024,height:768},{name:'tablet portrait',width:768,height:1024},{name:'phone',width:390,height:844},{name:'small phone',width:320,height:640}]:
    [{name:'laptop',width:1440,height:900},{name:'tablet',width:768,height:1024},{name:'phone',width:390,height:844},{name:'minimum',width:320,height:640}];
  const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
  const errors=[];
  const requireCheck=(test,message)=>{if(!test)errors.push(message)};
  try{
    for(const view of viewports){
      const page=await browser.newPage({
        viewport:{width:view.width,height:view.height},
        deviceScaleFactor:1,
        reducedMotion:'reduce'
      });
      const thrown=[];
      page.on('pageerror',error=>thrown.push(error.message));
      await page.addInitScript(()=>{
        try{sessionStorage.setItem('rp-portfolio-intro-seen','1')}catch(_){}
      });
      await page.goto('http://127.0.0.1:8777/',{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForTimeout(140);
      const report=await page.evaluate(()=>{
        const box=selector=>{
          const node=document.querySelector(selector);
          if(!node)return null;
          const r=node.getBoundingClientRect();
          const cs=getComputedStyle(node);
          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,display:cs.display};
        };
        const sections=['home','about','work','process','skills','experience','contact'];
        return {
          newTheme:document.body.classList.contains('agency-v2'),
          noOverflow:document.documentElement.scrollWidth<=innerWidth+3,
          sectionsExist:sections.every(id=>document.getElementById(id)),
          hero:box('#agencyHeroTitle'),
          header:box('.lux-header'),
          projects:document.querySelectorAll('.agency-project-card').length,
          skills:document.querySelectorAll('.agency-skill').length,
          caseDialog:!!document.getElementById('holoCaseDialog'),
          caseBridge:typeof window.openPortfolioCaseStudy==='function',
          heroWebGL:!!document.querySelector('#heroReact3D, canvas'),
          mobileButton:box('#menuButton'),
          contactEmail:!!document.querySelector('#contact a[href^="mailto:"]')
        };
      });
      const id=view.name+': ';
      requireCheck(report.newTheme,id+'V2 body class absent');
      requireCheck(report.sectionsExist,id+'expected section missing');
      requireCheck(report.noOverflow,id+'horizontal document overflow');
      requireCheck(report.hero && report.hero.width>100 && report.hero.left>=-4 && report.hero.right<=view.width+4,id+'hero headline clipped');
      requireCheck(report.header && report.header.width>160,id+'header unavailable');
      requireCheck(!report.heroWebGL,id+'unexpected video/canvas/WebGL island');
      requireCheck(report.projects===4,id+'featured projects count incorrect');
      requireCheck(report.skills===10,id+'skills count incorrect');
      requireCheck(report.contactEmail,id+'contact method missing');
      if(mode==='projects'||mode==='all'){
        requireCheck(report.caseDialog&&report.caseBridge,id+'case-study dialog connection missing');
        if(view.width===1440 || view.width===390){
          await page.locator('.agency-case-trigger[data-project-key="eventhive"]').click();
          requireCheck(await page.locator('#holoCaseDialog').evaluate(el=>el.open),id+'case study did not open');
          requireCheck((await page.locator('#holoDialogTitle').innerText()).includes('EventHive'),id+'wrong case-study content');
          await page.locator('#holoCaseClose').click();
          requireCheck(!(await page.locator('#holoCaseDialog').evaluate(el=>el.open)),id+'dialog did not close');
        }
      }
      if(mode==='hero'||mode==='all'){
        if(view.width<=900){
          requireCheck(report.mobileButton&&report.mobileButton.display!=='none',id+'mobile menu button not visible');
          await page.locator('#menuButton').click();
          requireCheck(await page.locator('#mobileNav').isVisible(),id+'mobile navigation failed to open');
          await page.locator('#mobileNav a[href="#about"]').click();
          requireCheck(!(await page.locator('#mobileNav').isVisible()),id+'mobile navigation failed to close');
        }
      }
      if(mode==='skills'||mode==='all'){
        const first=page.locator('.agency-skill').first();
        requireCheck(await first.isVisible(),id+'skill tile not visible');
      }
      if(mode==='contact'||mode==='all'){
        requireCheck(await page.locator('.agency-portal').count()===1,id+'contact art missing');
      }
      thrown.forEach(error=>errors.push(id+'uncaught browser error: '+error));
      console.log('Checked',mode,view.name,view.width+'x'+view.height);
      await page.close();
    }
  }finally{await browser.close();}
  if(errors.length){
    console.error('Agency V2 checks failed:\n- '+errors.join('\n- '));
    process.exitCode=1;
  }else{
    console.log('Agency V2',mode,'checks passed for',viewports.length,'viewport sizes.');
  }
}
