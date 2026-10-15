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

  const bars='<span class="holo-mini-bars" aria-hidden="true">'+
    [38,62,43,85,66,51,92,55,76,45].map(n=>'<i style="--bar:'+n+'%"></i>').join('')+'</span>';
  const graph='<svg class="holo-graph" viewBox="0 0 320 126" preserveAspectRatio="none" aria-hidden="true">'+
    '<line x1="0" y1="28" x2="320" y2="28"/><line x1="0" y1="63" x2="320" y2="63"/><line x1="0" y1="99" x2="320" y2="99"/>'+
    '<path class="graph-fill" d="M0 108 C26 103 43 52 66 70S107 107 132 66 171 27 196 40 232 94 254 59 287 18 320 29 V126H0Z"/>'+
    '<path d="M0 108 C26 103 43 52 66 70S107 107 132 66 171 27 196 40 232 94 254 59 287 18 320 29"/></svg>';

  function createPreview(p){
    return '<aside class="holo-app-sidebar"><div class="holo-app-brand">'+p.shortLabel+'</div>'+
      '<div class="holo-app-nav">'+p.nav.map(s=>'<span>'+s+'</span>').join('')+'</div></aside>'+
      '<div class="holo-app-main"><div class="holo-app-heading"><b>'+p.appTitle+'</b><small>◉ '+p.status+'</small></div>'+
      '<div class="holo-app-metric-row">'+p.metrics.map(m=>'<div class="holo-app-metric"><small>'+m[0]+'</small><b>'+m[1]+'</b></div>').join('')+'</div>'+
      '<div class="holo-app-panels"><div class="holo-app-panel"><div class="holo-app-panel-title">'+p.panelTitle+'<small>LIVE VIEW</small></div>'+graph+
      '<div class="holo-scan-mark"></div></div><div class="holo-app-panel"><div class="holo-app-panel-title">'+p.secondaryTitle+'<small>●</small></div>'+
      p.features.map((s,i)=>'<div class="holo-mini-row"><i>'+String(i+1).padStart(2,'0')+'</i><span>'+s+'</span><small>✓</small></div>').join('')+
      bars+'</div></div></div>';
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
    app.innerHTML=createPreview(p);
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
