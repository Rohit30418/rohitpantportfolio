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
      github:'https://github.com/Rohit30418',
      githubLabel:'GitHub profile',
      features:['Live rooms','Peer audio / video','Presence updates'],
      nav:['Rooms','Discover','Participants','Settings'],
      metrics:[['Connection','WebRTC'],['Presence','Live'],['Platform','Web app']],
      appTitle:'Conversation workspace',
      panelTitle:'Room activity',
      secondaryTitle:'Room members',
      subtitle:'REALTIME / COMMUNICATION',
      shortLabel:'VAANI',
      note:'Communication interfaces powered by realtime interactions.',
      detail:'I built the frontend around device checks, room joining, peer connections and synced participants. The interface is designed to keep calling controls accessible across different screen sizes.'
    },
    eventhive:{
      title:'EventHive',section:'Event management',status:'Event platform',
      description:'A role-based event platform for discovery, registrations, organizer workflows, microsites and dashboards.',
      role:'Frontend UI / event platform',
      stack:['React','TypeScript','Redux Toolkit','Firebase','React Query'],
      highlight:'Event discovery, registration forms, organizer dashboards and microsite experiences.',
      live:'https://eventhive.rohitpant.in/',
      github:'https://github.com/Rohit30418',
      githubLabel:'GitHub profile',
      features:['Event discovery','Registration forms','Organizer dashboard'],
      nav:['Overview','Events','Attendees','Analytics'],
      metrics:[['Management','Events'],['Accounts','Roles'],['Insights','Charts']],
      appTitle:'Organizer dashboard',
      panelTitle:'Event insights',
      secondaryTitle:'Recent activity',
      subtitle:'EVENTS / PLATFORM',
      shortLabel:'EVENTHIVE',
      note:'A multi-role event management experience.',
      detail:'EventHive explores full frontend workflows across event search, validation, attendee registration, organizer tools, and event-specific microsites, using Firebase for application services.'
    },
    argus:{
      title:'ARGUS',section:'AI-powered QA',status:'QA intelligence',
      description:'Automated website intelligence covering accessibility, SEO, performance, links and runtime issues.',
      role:'Tooling / frontend quality',
      stack:['Node.js','Playwright','JavaScript','AI Analysis'],
      highlight:'Automated scans for website quality signals, broken links, runtime errors and usability issues.',
      live:'https://argus-pro-a2px.onrender.com',
      github:'https://github.com/Rohit30418',
      githubLabel:'GitHub profile',
      features:['Accessibility review','Performance checks','Network diagnostics'],
      nav:['Overview','Scans','Reports','Settings'],
      metrics:[['Testing','QA'],['Engine','Browser'],['Checks','Multi-signal']],
      appTitle:'Website audit workspace',
      panelTitle:'Scan overview',
      secondaryTitle:'Audit modules',
      subtitle:'AI / WEBSITE TESTING',
      shortLabel:'ARGUS',
      note:'Automated browser testing and actionable site auditing.',
      detail:'ARGUS is a developer-built QA auditor using Node and Playwright. It checks real sites for visual and functional signals while collecting useful information for manual investigation.'
    },
    hall:{
      title:'Hall Layout',section:'Interactive wayfinding',status:'3D / map experience',
      description:'Interactive exhibition-floor navigation with hall visualization, stall discovery and route guidance.',
      role:'Frontend / navigation UI',
      stack:['JavaScript','Three.js','SVG','WebView'],
      highlight:'Interactive hall maps, stall highlighting, route guidance and mobile-friendly navigation.',
      live:'https://booking.printpackipama.com/hallLayout/ViewhallLayout.html?HallId=28&StallNo=E18&hallName=HALL+9',
      github:'https://github.com/Rohit30418/hall-layout',
      githubLabel:'View source',
      features:['Hall overview','Stall discovery','Route guidance'],
      nav:['Hall map','Find a stall','Directions','Overview'],
      metrics:[['Map','2D / 3D'],['Routes','Guided'],['Display','WebView']],
      appTitle:'Exhibition wayfinding',
      panelTitle:'Route preview',
      secondaryTitle:'Hall navigation',
      subtitle:'WAYFINDING / INTERACTION',
      shortLabel:'HALL LAYOUT',
      note:'Finding your way through complex exhibition halls.',
      detail:'This client-facing hall navigation interface combines a detailed exhibition layout with highlighted destinations, route guidance and WebView integration for mobile access.'
    }
  };
  const $=s=>section.querySelector(s);
  const title=$('#holoProjectTitle'),description=$('#holoProjectDesc'),
    role=$('#holoRole'),highlight=$('#holoHighlight'),stack=$('#holoStack'),
    app=$('#holoAppPreview'),live=$('#holoLiveLink'),github=$('#holoGithubLink'),
    appLabel=$('#holoStageLabel'),browserUrl=$('#holoBrowserUrl'),
    satelliteTitle=$('#holoSatelliteTitle'),satelliteNote=$('#holoSatelliteNote'),
    satelliteBottomTitle=$('#holoSatelliteBottomTitle');
  let selected='vaani',switchTimer=0,returnFocus=null;

  // The frame contains a real Chromium screenshot captured from each public app.
  // Missing files show an explicit fallback; never display a fabricated dashboard.
  const screenshot=$('#holoRealShot');
  const screenshotFallback=$('#holoScreenshotFallback');
  const screenshotPaths={
    vaani:'assets/project-shots/vaani.jpg',
    eventhive:'assets/project-shots/eventhive.jpg',
    argus:'assets/project-shots/argus.jpg',
    hall:'assets/project-shots/hall.jpg'
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
    description.textContent=p.description;
    role.textContent=p.role;
    highlight.textContent=p.highlight;
    stack.replaceChildren(...p.stack.map(s=>{const el=document.createElement('span');el.textContent=s;return el}));
    live.href=p.live;
    live.setAttribute('aria-label','Open '+p.title+' live project in a new tab');
    github.href=p.github;
    github.textContent=p.githubLabel+' ↗';
    github.setAttribute('aria-label','Open '+p.githubLabel+' for '+p.title+' in a new tab');
    appLabel.textContent=p.shortLabel;
    browserUrl.textContent=p.subtitle;
    satelliteTitle.textContent=p.section;
    satelliteNote.textContent=p.note;
    satelliteBottomTitle.textContent=p.panelTitle;
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
    caseButton.addEventListener('click',()=>{
      const p=projects[selected];
      $('#holoDialogTitle').textContent=p.title+' / Project brief';
      $('#holoDialogSummary').textContent=p.description;
      $('#holoDialogWork').textContent=p.detail;
      $('#holoDialogTech').textContent=p.stack.join(' · ');
      returnFocus=caseButton;
      if(typeof dialog.showModal==='function')dialog.showModal();
    });
    closeButton?.addEventListener('click',closeDialog);
    dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
    dialog.addEventListener('close',()=>returnFocus?.focus());
  }

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
