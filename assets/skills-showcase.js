/* Skills Glass Gallery: a DOM/CSS showcase matching the approved design.
 * Zero WebGL canvases, textures, requestAnimationFrame loops or polling.
 * All 18 skills are available by button, swipe, keyboard and card selection.
 * Original HTML marquees remain available if this enhancement fails.
 */
(() => {
  'use strict';
  const section=document.getElementById('skills');
  const host=document.getElementById('skillsUniverse');
  if(!section||!host)return;
  const SKILLS=[
    {name:'React',tag:'UI Library',icon:'fa-brands fa-react',accent:'#54dbf7',detail:'Component-based interfaces'},
    {name:'TypeScript',tag:'Language',monogram:'TS',accent:'#398cf8',detail:'Typed React applications'},
    {name:'JavaScript',tag:'Language',monogram:'JS',accent:'#f7df1e',detail:'Modern browser development'},
    {name:'HTML5',tag:'Markup',icon:'fa-brands fa-html5',accent:'#f16529',detail:'Semantic accessible markup'},
    {name:'CSS3',tag:'Styling',icon:'fa-brands fa-css3-alt',accent:'#3984f7',detail:'Responsive layout systems'},
    {name:'Tailwind CSS',tag:'UI Framework',icon:'fa-solid fa-wind',accent:'#42d9ee',detail:'Utility-first styling'},
    {name:'Redux Toolkit',tag:'State Management',icon:'fa-solid fa-layer-group',accent:'#ab66f7',detail:'Client-side application state'},
    {name:'Firebase',tag:'Backend Services',icon:'fa-solid fa-fire-flame-curved',accent:'#ffb928',detail:'Authentication and realtime data'},
    {name:'React Query',tag:'Server State',icon:'fa-solid fa-arrows-rotate',accent:'#ed5a85',detail:'Queries, caching and mutations'},
    {name:'WebRTC',tag:'Realtime Media',icon:'fa-solid fa-video',accent:'#64d7c9',detail:'Peer audio and video'},
    {name:'GSAP',tag:'Animation',icon:'fa-solid fa-wand-magic-sparkles',accent:'#a4d752',detail:'Scroll and motion design'},
    {name:'Playwright',tag:'UI Testing',icon:'fa-solid fa-robot',accent:'#89d98f',detail:'Browser automation'},
    {name:'Node.js',tag:'Tooling',icon:'fa-brands fa-node-js',accent:'#83ce84',detail:'Development and QA utilities'},
    {name:'jQuery',tag:'Production UI',monogram:'jQ',accent:'#6bacdf',detail:'Client interface development'},
    {name:'Bootstrap',tag:'CSS Framework',icon:'fa-brands fa-bootstrap',accent:'#a778f6',detail:'Responsive UI components'},
    {name:'Vite',tag:'Build Tool',icon:'fa-solid fa-bolt',accent:'#b3a0ff',detail:'Modern frontend builds'},
    {name:'REST APIs',tag:'Integration',icon:'fa-solid fa-code',accent:'#e6af86',detail:'Async data and validation'},
    {name:'Git & GitHub',tag:'Version Control',icon:'fa-brands fa-git-alt',accent:'#ef916d',detail:'Collaborative workflows'}
  ];
  const count=SKILLS.length;
  let active=3, cardWidth=165, spacing=182, radius=3, firstPaint=true;
  let startX=null,startY=null,suppressClick=false;
  const make=(tag,className,text)=>{
    const el=document.createElement(tag);
    if(className)el.className=className;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  const stage=make('div','skills-glass-stage');
  stage.setAttribute('role','region');
  stage.setAttribute('aria-roledescription','carousel');
  stage.setAttribute('aria-label','Tools I use to build. Use previous and next buttons or arrow keys.');
  const items=make('div','skills-glass-items');
  const cards=SKILLS.map((skill,i)=>{
    const b=make('button','skills-glass-card');
    b.type='button';
    b.style.setProperty('--skill-accent',skill.accent);
    b.setAttribute('aria-label','Explore '+skill.name+', '+skill.tag);
    b.dataset.index=String(i);
    const logo=make('span','skills-glass-logo');
    logo.setAttribute('aria-hidden','true');
    if(skill.monogram){
      logo.append(make('span','skills-glass-monogram',skill.monogram));
    }else{
      const icon=make('i',skill.icon);
      logo.append(icon);
    }
    b.append(logo,make('span','skills-glass-label',skill.name),make('span','skills-glass-category',skill.tag));
    b.addEventListener('click',()=>{
      if(suppressClick)return;
      if(active!==i)select(i);
    });
    return b;
  });
  items.append(...cards);
  const prev=make('button','skills-glass-nav skills-glass-prev','←');
  prev.type='button';prev.setAttribute('aria-label','Previous skill');
  const next=make('button','skills-glass-nav skills-glass-next','→');
  next.type='button';next.setAttribute('aria-label','Next skill');
  // Keep the card gallery and controls only; no oversized ring or counter footer.
  stage.append(items,prev,next);
  host.replaceChildren(stage);

  const circularOffset=i=>{
    let diff=(i-active+count)%count;
    if(diff>count/2)diff-=count;
    return diff;
  };
  function layout(){
    const w=Math.max(1,host.clientWidth);
    // Mobile deliberately shows a full center tile and cropped neighboring
    // tiles, instead of making all three too small to read.
    const visibleSlots=w>=1510?9:w>=1110?7:w>=950?5:3;
    radius=Math.floor(visibleSlots/2);
    cardWidth=w<560?(w<350?153:160):
      Math.min(182,Math.max(127,(w-170)/(visibleSlots*1.045)));
    spacing=w<560?Math.min(140,Math.max(111,w*.35)):
      Math.min(cardWidth*1.09,(w-136)/(visibleSlots-1));
    host.style.setProperty('--skill-card-width',Math.round(cardWidth)+'px');
    const visible=[];
    cards.forEach((card,i)=>{
      const offset=circularOffset(i);
      const dist=Math.abs(offset);
      const onStage=dist<=radius;
      const x=offset*spacing;
      const y=Math.round(Math.pow(dist/Math.max(1,radius),1.75)*23);
      const rotate=-offset*4.25;
      const scale=1-dist*.022;
      const depth=dist===0?12:Math.max(1,12-dist);
      card.dataset.visible=onStage?'true':'false';
      card.dataset.active=dist===0?'true':'false';
      card.tabIndex=onStage?0:-1;
      card.setAttribute('aria-pressed',dist===0?'true':'false');
      card.setAttribute('aria-hidden',onStage?'false':'true');
      card.style.zIndex=String(depth);
      card.style.opacity=onStage?'1':'0';
      card.style.transform='translate3d(calc(-50% + '+Math.round(x)+'px),'+y+'px,0) rotateY('+rotate+'deg) scale('+scale.toFixed(3)+')';
      if(onStage)visible.push(SKILLS[i].name);
    });
    if(firstPaint){
      // No unexpected fly-in animation on initial reveal.
      stage.classList.add('skills-glass-initialized');
      firstPaint=false;
    }
  }
  function select(index){
    active=(index+count)%count;
    layout();
  }
  prev.addEventListener('click',()=>select(active-1));
  next.addEventListener('click',()=>select(active+1));
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();select(active+1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();select(active-1);}
    else if(e.key==='Home'){e.preventDefault();select(0);}
    else if(e.key==='End'){e.preventDefault();select(count-1);}
  });
  stage.addEventListener('pointerdown',e=>{
    if(e.target.closest('.skills-glass-nav'))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    startX=e.clientX;startY=e.clientY;
  });
  stage.addEventListener('pointerup',e=>{
    if(startX===null)return;
    const dx=e.clientX-startX,dy=e.clientY-startY;
    startX=null;startY=null;
    if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.15){
      suppressClick=true;
      select(active+(dx<0?1:-1));
      // Avoid a click event firing on whichever skill is under the release.
      setTimeout(()=>{suppressClick=false;},0);
    }
  });
  stage.addEventListener('pointercancel',()=>{startX=null;startY=null;});
  let resizeObserver=null;
  if('ResizeObserver' in window){
    resizeObserver=new ResizeObserver(layout);
    resizeObserver.observe(host);
  }else{
    window.addEventListener('resize',layout,{passive:true});
  }
  try{
    layout();
    section.classList.add('skills-universe-ready');
  }catch(error){
    section.classList.remove('skills-universe-ready');
    console.warn('Skill showcase fallback:',error);
    resizeObserver?.disconnect();
  }
})();
