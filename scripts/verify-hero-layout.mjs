/* Regression test: hero fluid layout across desktop, browser-zoom-equivalent
   viewport sizes, laptops, tablets and phones. Run against local static site. */
import { chromium } from 'playwright';

const cases=[
  {label:'Wide desktop',width:1920,height:1080},
  {label:'Large desktop',width:1728,height:900},
  {label:'Laptop',width:1440,height:900},
  {label:'Laptop 1366',width:1366,height:768},
  {label:'Desktop 125%-equivalent',width:1152,height:720},
  {label:'Desktop 150%-equivalent',width:960,height:600},
  {label:'Desktop 80%-equivalent',width:1800,height:1125},
  {label:'Narrow laptop',width:1100,height:700},
  {label:'Tablet landscape',width:1024,height:768},
  {label:'Tablet portrait',width:768,height:1024},
  {label:'Phone landscape',width:844,height:390},
  {label:'Tablet narrow',width:600,height:900},
  {label:'Phone',width:390,height:844},
  {label:'Small phone',width:375,height:667},
  {label:'Minimum phone',width:320,height:640}
];
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
let failures=0;
try {
  for(const entry of cases){
    const page=await browser.newPage({
      viewport:{width:entry.width,height:entry.height},
      deviceScaleFactor:1,reducedMotion:'reduce'
    });
    await page.addInitScript(()=>{
      try{sessionStorage.setItem('rp-portfolio-intro-seen','1')}catch(_){}
    });
    await page.goto('http://127.0.0.1:8777/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(220);
    const results=await page.evaluate(()=>{
      const get=sel=>{
        const node=document.querySelector(sel);
        if(!node)return null;
        const rect=node.getBoundingClientRect();
        const style=getComputedStyle(node);
        return {
          x:rect.left,y:rect.top,left:rect.left,right:rect.right,
          top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height,
          display:style.display
        };
      };
      const intersects=(a,b,padding=0)=>{
        if(!a||!b||a.display==='none'||b.display==='none')return false;
        const w=Math.min(a.right,b.right)-Math.max(a.left,b.left);
        const h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
        return w>padding&&h>padding;
      };
      const hero=get('#home'),header=get('.lux-header'),
        kicker=get('#home .hero-kicker'),name=get('#home .lux-hero-name'),
        first=get('#home .lux-hero-name span:first-child'),
        last=get('#home .lux-hero-name span:last-child'),
        role=get('#home .hero-design-role'),intro=get('#home .lux-intro'),
        portrait=get('#home .hero-person'),rail=get('#home .hero-skillrail'),
        atom=get('#heroReact3D');
      const mobile=innerWidth<=760;
      const tablet=innerWidth<=1100&&innerWidth>760;
      const visible=r=>r&&r.display!=='none';
      const viewport={width:innerWidth,height:innerHeight};
      const checks={
        noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+3,
        heroNameBelowHeader:name.top>=header.bottom+6,
        wordsNotColliding:first.right+5<last.left,
        roleBeforeIntro:role.bottom+6<=intro.top,
        introPortraitNoCollision:!intersects(intro,portrait,10),
        rolePortraitNoCollision:!intersects(role,portrait,8),
        copyWithinBounds:role.left>=-1&&intro.left>=-1&&intro.right<=innerWidth+1,
        portraitInHero:portrait.left>=-1&&portrait.right<=innerWidth+1&&portrait.bottom<=hero.bottom+2,
        introInHero:intro.bottom<=hero.bottom+2,
        namesInViewport:name.left>=-1&&name.right<=innerWidth+1,
        noAtomOnTablet:!tablet||atom.display==='none',
        noAtomOnMobile:!mobile||atom.display==='none',
        skillRailDesktop:mobile||visible(rail),
        noRailMobile:!mobile||!visible(rail)
      };
      const inspect={
        headerBottom:Math.round(header.bottom),nameTop:Math.round(name.top),
        firstRight:Math.round(first.right),lastLeft:Math.round(last.left),
        roleBottom:Math.round(role.bottom),introTop:Math.round(intro.top),
        introBottom:Math.round(intro.bottom),portraitTop:Math.round(portrait.top),
        portraitBottom:Math.round(portrait.bottom),heroBottom:Math.round(hero.bottom),
        contentWidth:Math.round(get('#home .lux-hero-inner').width),
        introLeft:Math.round(intro.left),introRight:Math.round(intro.right),
        roleLeft:Math.round(role.left),roleRight:Math.round(role.right),
        portraitLeft:Math.round(portrait.left),portraitRight:Math.round(portrait.right),
        viewportWidth:innerWidth,
        introWidth:Math.round(intro.width),portraitWidth:Math.round(portrait.width),
        totalHeight:Math.round(hero.height),bodyOverflow:Math.round(document.documentElement.scrollWidth-innerWidth)
      };
      return {viewport,checks,inspect};
    });
    const passed=Object.values(results.checks).every(Boolean);
    if(!passed)failures++;
    console.log(JSON.stringify({label:entry.label,requested:entry,passed,...results}));
    await page.close();
  }
}finally{await browser.close();}
if(failures){
  console.error('HERO_LAYOUT_FAILED: '+failures+' viewport(s) need adjustment');
  process.exitCode=1;
}else{
  console.log('HERO_LAYOUT_PASSED: all viewports');
}
