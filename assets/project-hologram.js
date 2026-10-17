/* Project Hologram — progressive enhancement for the static portfolio.
   No 3D canvas, RAF loop, timers, or physics engine. Only project switches
   update the DOM; CSS 3D scene idles when its section is offscreen. */
(() => {
  'use strict';
  const section=document.getElementById('work');
  if(!section || !section.classList.contains('holo-projects'))return;
  const stage=section.querySelector('#holoStage');
  const browser=section.querySelector('#holoBrowserWrap');
  const selector=section.querySelector('#holoSelector');
  const dialog=section.querySelector('#holoCaseDialog');
  if(!stage||!browser||!selector)return;

  const projects={
    vaani:{
      title:'Vaani',section:'Realtime communication',status:'Realtime app',
      description:'Live conversation rooms with device checks, peer-to-peer audio/video and synchronized participant states.',
      role:'Frontend UI / realtime experiences',
      stack:['React','WebRTC','PeerJS','Socket.IO','Firebase'],
      highlight:'Pre-join media controls, peer connections, room presence and responsive conversation UI.',
      live:'https://vaani.rohitpant.in/',
      features:['Live rooms','Peer audio / video','Presence updates'],
      nav:['Rooms','Discover','Participants','Settings'],
      metrics:[['Connection','WebRTC'],['Presence','Live'],['Platform','Web app']],
      appTitle:'Conversation workspace',
      panelTitle:'Room activity',
      secondaryTitle:'Room members',
      subtitle:'REALTIME / COMMUNICATION',
      shortLabel:'VAANI',
      note:'Communication interfaces powered by realtime interactions.',
      challenge:"A realtime room interface needs to help people check their devices, join confidently, and understand who is connected or speaking without cluttering the call experience.",
      work:"Built the React frontend for room discovery, pre-join microphone/camera controls, joining and leaving rooms, responsive call controls, and participant states. Connected the interface to realtime room data and peer-to-peer calling.",
      caseFeatures:["Microphone and camera checks before entering a room","Peer-to-peer audio/video calls with participant tiles","Room presence, microphone/camera and speaking indicators","Responsive controls for desktop and mobile browsers"],
      engineering:["React for reusable meeting UI and state-driven rendering","WebRTC and PeerJS for peer-to-peer media connections","Socket.IO signaling for joining and coordinating peers","Firebase participant data and AudioContext speaking detection"]
    },
    eventhive:{
      title:'EventHive',section:'Event management',status:'Event platform',
      description:'A role-based event platform for discovery, registrations, organizer workflows, microsites and dashboards.',
      role:'Frontend UI / event platform',
      stack:['React','TypeScript','Redux Toolkit','Firebase','React Query'],
      highlight:'Event discovery, registration forms, organizer dashboards and microsite experiences.',
      live:'https://eventhive.rohitpant.in/',
      features:['Event discovery','Registration forms','Organizer dashboard'],
      nav:['Overview','Events','Attendees','Analytics'],
      metrics:[['Management','Events'],['Accounts','Roles'],['Insights','Charts']],
      appTitle:'Organizer dashboard',
      panelTitle:'Event insights',
      secondaryTitle:'Recent activity',
      subtitle:'EVENTS / PLATFORM',
      shortLabel:'EVENTHIVE',
      note:'A multi-role event management experience.',
      challenge:"Event discovery and registration involve different audiences: attendees need a simple booking flow while organizers need tools to create, manage and monitor their events.",
      work:"Designed and developed event discovery, organizer registration and event creation interfaces, validated attendee forms, organizer dashboards and event microsites, with different workflows for organizers and administrators.",
      caseFeatures:["Searchable event listings and event-specific microsites","Create-event and attendee-registration workflows","Role-based organizer and admin dashboard interfaces","Analytics charts, management tables and form validation"],
      engineering:["React and TypeScript for structured UI components","React Hook Form with Zod for input and file validation","Firebase for authentication and application data","React Query for server-state caching and lazy-loaded routes"]
    },
    argus:{
      title:'ARGUS',section:'AI-powered QA',status:'QA intelligence',
      description:'Automated website intelligence covering accessibility, SEO, performance, links and runtime issues.',
      role:'Tooling / frontend quality',
      stack:['Node.js','Playwright','JavaScript','AI Analysis'],
      highlight:'Automated scans for website quality signals, broken links, runtime errors and usability issues.',
      live:'https://argus-pro-a2px.onrender.com',
      features:['Accessibility review','Performance checks','Network diagnostics'],
      nav:['Overview','Scans','Reports','Settings'],
      metrics:[['Testing','QA'],['Engine','Browser'],['Checks','Multi-signal']],
      appTitle:'Website audit workspace',
      panelTitle:'Scan overview',
      secondaryTitle:'Audit modules',
      subtitle:'AI / WEBSITE TESTING',
      shortLabel:'ARGUS',
      note:'Automated browser testing and actionable site auditing.',
      challenge:"Reviewing a website manually for broken links, accessibility issues, performance signals and runtime failures takes time and is difficult to repeat consistently.",
      work:"Built a browser-based auditing tool that runs automated site checks and brings findings into one report. Developed the scanning workflow and output for SEO, accessibility, broken links, network failures and browser errors.",
      caseFeatures:["Quick site reconnaissance and deeper audit modes","SEO, accessibility and performance signals","Broken-link, network and browser error checks","Structured reports for identifying issues to investigate"],
      engineering:["Node.js backend for coordinating scan requests","Playwright to inspect websites in a real browser","JavaScript checks for links, forms and page diagnostics","AI-assisted analysis as an optional layer for explaining findings"]
    }  };
  const $=s=>section.querySelector(s);
  const title=$('#holoProjectTitle'),description=$('#holoProjectDesc'),
    stack=$('#holoStack'),live=$('#holoLiveLink'),
    appLabel=$('#holoStageLabel'),browserUrl=$('#holoBrowserUrl'),
    projectIcon=$('.holo-project-icon i');
  let selected='vaani',switchTimer=0,returnFocus=null;

  // The frame contains a real Chromium screenshot captured from each public app.
  // Missing files show an explicit fallback; never display a fabricated dashboard.
  const screenshot=$('#holoRealShot');
  const screenshotFallback=$('#holoScreenshotFallback');
  const screenshotPaths={
    vaani:'assets/project-shots/vaani.jpg',
    eventhive:'assets/project-shots/eventhive.jpg',
    argus:'assets/project-shots/argus.jpg'
  };
  if(screenshot) {
    screenshot.addEventListener('load',()=>{
      screenshot.hidden=false;
      screenshotFallback.hidden=true;
      screenshot.parentNode?.classList.add('has-real-screenshot');
    });
    screenshot.addEventListener('error',()=>{
      screenshot.hidden=true;
      screenshotFallback.hidden=false;
      screenshot.parentNode?.classList.remove('has-real-screenshot');
    });
  }
  function setProject(key){
    const p=projects[key];
    if(!p)return;
    selected=key;
    title.textContent=p.title;
    if (projectIcon) projectIcon.className={
      vaani:'fa-solid fa-wave-square',
      eventhive:'fa-solid fa-calendar-days',
      argus:'fa-solid fa-shield-halved'
    }[key] || 'fa-solid fa-code';
    description.textContent=p.description;
    stack.replaceChildren(...p.stack.map(s=>{const el=document.createElement('span');el.textContent=s;return el}));
    live.href=p.live;
    live.setAttribute('aria-label','Open '+p.title+' live project in a new tab');
    appLabel.textContent=p.shortLabel;
    browserUrl.textContent=p.subtitle;
    screenshotFallback.querySelector('strong').textContent=p.title;
    screenshotFallback.hidden=true;
    screenshot.hidden=false;
    screenshot.alt='Actual browser screenshot of '+p.title+' from its public website';
    const nextShot=screenshotPaths[key];
    if(screenshot.getAttribute('src')!==nextShot) {
      screenshot.setAttribute('src',nextShot);
    } else if(screenshot.complete && !screenshot.naturalWidth) {
      screenshot.hidden=true;
      screenshotFallback.hidden=false;
    }
    selector.querySelectorAll('[data-project-key]').forEach(el=>{
      const current=el.dataset.projectKey===key;
      if(current)el.setAttribute('aria-current','true');
      else el.removeAttribute('aria-current');
    });
  }
  selector.addEventListener('click',e=>{
    const a=e.target.closest('[data-project-key]');
    if(!a||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const key=a.dataset.projectKey;
    if(!projects[key])return;
    e.preventDefault();
    if(selected===key)return;
    clearTimeout(switchTimer);
    browser.classList.add('is-switching');
    // One short timer per explicit selection. No continuous JS work.
    switchTimer=setTimeout(()=>{
      setProject(key);
      browser.classList.remove('is-switching');
    },145);
  });
  selector.addEventListener('keydown',e=>{
    if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
    e.preventDefault();
    const options=[...selector.querySelectorAll('[data-project-key]')];
    const index=options.indexOf(document.activeElement);
    if(index<0)return;
    const next=e.key==='Home'?0:e.key==='End'?options.length-1:
      (index+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1)+options.length)%options.length;
    options[next].focus();
    options[next].click();
  });

  const caseButton=$('#holoCaseButton'),closeButton=$('#holoCaseClose');
  function closeDialog(){if(dialog && dialog.open)dialog.close();}
  if(caseButton&&dialog){
    const caseImage=$('#holoCaseImage');
    const caseImageFallback=$('#holoCaseImageFallback');
    caseImage.addEventListener('load',()=>{caseImage.hidden=false;caseImageFallback.hidden=true;});
    caseImage.addEventListener('error',()=>{caseImage.hidden=true;caseImageFallback.hidden=false;});
    caseButton.addEventListener('click',()=>{
      const p=projects[selected];
      $('#holoDialogTitle').textContent=p.title+' — Project Case Study';
      $('#holoDialogSummary').textContent=p.description;
      $('#holoDialogChallenge').textContent=p.challenge;
      $('#holoDialogWork').textContent=p.work;
      // DOM nodes + textContent avoid treating project copy as HTML.
      const renderList=(selector,items)=>{
        const target=$(selector);
        target.replaceChildren(...items.map(value=>{
          const item=document.createElement('li');
          item.textContent=value;
          return item;
        }));
      };
      renderList('#holoDialogFeatures',p.caseFeatures);
      renderList('#holoDialogEngineering',p.engineering);
      const tech=$('#holoDialogTech');
      tech.replaceChildren(...p.stack.map(name=>{
        const pill=document.createElement('span');
        pill.textContent=name;
        return pill;
      }));
      const caseImage=$('#holoCaseImage');
      const caseImageFallback=$('#holoCaseImageFallback');
      caseImage.alt='Screenshot of the public '+p.title+' website';
      caseImageFallback.hidden=true;
      caseImage.hidden=false;
      const nextShot=screenshotPaths[selected];
      if(caseImage.getAttribute('src')!==nextShot)caseImage.setAttribute('src',nextShot);
      else if(caseImage.complete && !caseImage.naturalWidth){
        caseImage.hidden=true;caseImageFallback.hidden=false;
      }
      const caseLive=$('#holoCaseLiveLink');
      caseLive.href=p.live;
      caseLive.setAttribute('aria-label','Open '+p.title+' live project in a new tab');
      returnFocus=caseButton;
      if(typeof dialog.showModal==='function')dialog.showModal();
    });
    closeButton?.addEventListener('click',closeDialog);
    dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
    dialog.addEventListener('close',()=>returnFocus?.focus());
  }

  // Public case-study bridge for the agency-style project gallery.
  // Uses the same verified screenshots and detailed project data as the original showcase.
  window.openPortfolioCaseStudy=(key,trigger)=>{
    if(!projects[key] || !caseButton || !dialog)return;
    clearTimeout(switchTimer);
    browser.classList.remove('is-switching');
    setProject(key);
    caseButton.click();
    // The original selector is visually retired; return focus to the actual clicked card.
    if(trigger && typeof trigger.focus==='function')returnFocus=trigger;
  };

  const observer=new IntersectionObserver(([entry])=>{
    stage.classList.toggle('is-visible',entry.isIntersecting && !document.hidden);
  },{threshold:.04});
  observer.observe(stage);
  document.addEventListener('visibilitychange',()=>{
    stage.classList.toggle('is-visible',!document.hidden && stage.getBoundingClientRect().top<innerHeight && stage.getBoundingClientRect().bottom>0);
  });
  window.addEventListener('pagehide',()=>{clearTimeout(switchTimer);observer.disconnect()},{once:true});
  setProject('vaani');
})();
