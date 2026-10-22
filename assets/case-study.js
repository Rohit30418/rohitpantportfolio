(() => {
  'use strict';

  // Content is based on the project implementations and their documented capabilities.
  // Business metrics, client counts, invented testimonials and unverified outcomes are intentionally omitted.
  const projects = {
    eventhive: {
      title: 'EventHive',
      category: 'React / Event management',
      tagline: 'One platform. Different journeys for visitors, organizers and admins.',
      intro: 'A personal React and TypeScript event-management application with discovery, organizer onboarding, attendee registration, microsites and role-specific dashboards.',
      role: 'Frontend development and application flows',
      focus: 'Multi-role UI, data handling and form validation',
      stack: ['React', 'TypeScript', 'React Router', 'Redux Toolkit', 'React Query', 'Firebase', 'React Hook Form', 'Zod'],
      image: 'assets/project-shots/eventhive.jpg',
      imageAlt: 'Screenshot from the EventHive application',
      imageCaption: 'Image from the existing EventHive project showcase; UI and available features may evolve.',
      urlLabel: 'eventhive.rohitpant.in',
      live: 'https://eventhive.rohitpant.in/',
      source: null,
      challenge: 'An event platform serves several audiences at once. Visitors need a fast path to browse and register, organizers need tools to manage events, and administrators need different access and review workflows. A single flat interface would blur those responsibilities.',
      goal: 'Organize the interface by user role, keep registration inputs consistent, and make remote data states understandable across public and dashboard screens.',
      contribIntro: 'This was an independent application project, not a claim of commercial React employment. The implementation covers distinct public, organizer and super-admin experiences.',
      contributions: [
        ['Multi-role routing', 'Public pages, organizer screens and super-admin dashboards with protected and role-aware frontend routes.'],
        ['Registration workflows', 'Attendee and organizer forms with React Hook Form and schema validation through Zod.'],
        ['Event management', 'Event creation and management interfaces, event-specific microsites, data tables and attendee workflows.'],
        ['Dashboard experience', 'Charts, management views, filtering, pagination and loading/error/empty feedback.']
      ],
      architectureIntro: 'The app separates route-level presentation, reusable feature logic, remote data fetching and Firebase-backed services. Shared UI state and remote data have different responsibilities.',
      architectureTitle: 'A frontend request-to-data path',
      architecture: [
        ['Route + page', 'React Router', 'Role-based layouts and screens'],
        ['Feature logic', 'Components / hooks', 'Reusable UI behavior'],
        ['Query layer', 'React Query', 'Remote-state caching and refetching'],
        ['Data request', 'Axios / services', 'Requests to Firebase-backed data'],
        ['Data + auth', 'Firebase', 'Auth and Realtime Database']
      ],
      architectureNote: 'Simplified architecture based on the repository. Redux Toolkit holds shared client state; Firebase Authentication provides session state. Route guards are UI controls, not a replacement for backend security rules.',
      journeyIntro: 'A visitor should be able to go from discovery to an event-specific registration without needing to understand the admin or organizer tooling.',
      journeyTitle: 'Attendee registration journey',
      journey: [
        ['Discover', 'Event listing', 'Browse and filter events'],
        ['Explore', 'Microsite', 'Read event details'],
        ['Register', 'Validated form', 'Enter attendee information'],
        ['Submit', 'Data service', 'Handle request and errors'],
        ['Feedback', 'UI state', 'Show result to the user']
      ],
      journeyNote: 'Conceptual user journey. Exact route and success states depend on the event and application data.',
      decisions: [
        ['Server vs client state', 'React Query manages server-backed queries and caching; Redux Toolkit is used when state must be shared across frontend areas.'],
        ['Validation', 'React Hook Form with Zod keeps user-facing validation close to form schemas, including registration constraints.'],
        ['Routing', 'Layouts and lazy-loaded routes help separate public, organizer and admin surfaces rather than shipping one monolithic screen.'],
        ['Resilience', 'Loading, error and empty states help users understand what is happening during remote-data operations.']
      ],
      quality: [
        'Vitest and React Testing Library are present for route guards, components, data hooks and validation flows.',
        'Typed event and registration models help reduce mismatches between UI and data.',
        'Pagination and filters keep management lists more usable than showing all records at once.'
      ],
      limits: [
        'This is a personal learning and demonstration project; no paying-customer metrics are asserted.',
        'A frontend protected route is not an authorization boundary; Firebase rules must enforce access.',
        'Live data, authentication access and external hosting may affect what visitors can test.'
      ],
      outcome: 'EventHive demonstrates the ability to organize a larger React application: multi-role navigation, typed forms, frontend/server-state separation, Firebase integration and maintainable dashboard UI. The portfolio does not claim a measured revenue or conversion improvement.'
    },
    vaani: {
      title: 'Vaani',
      category: 'Realtime / WebRTC',
      tagline: 'Realtime conversations, with the user experience considered before the call begins.',
      intro: 'An independent React communication app focused on browser-based rooms, pre-join device controls, peer-to-peer media and participant presence.',
      role: 'React frontend and realtime UI integration',
      focus: 'WebRTC controls, signaling and presence',
      stack: ['React', 'WebRTC', 'PeerJS', 'Socket.IO', 'Firebase', 'Vitest', 'React Testing Library'],
      image: 'assets/project-shots/vaani.jpg',
      imageAlt: 'Screenshot from the Vaani realtime communication application',
      imageCaption: 'Project screenshot from the existing portfolio; camera/microphone access requires browser permission.',
      urlLabel: 'vaani.rohitpant.in',
      live: 'https://vaani.rohitpant.in/',
      source: null,
      challenge: 'Joining a realtime call is more than rendering video tiles. Browsers require device permissions, participant states change while calls are active, and the UI must communicate mute, camera and speaking status clearly.',
      goal: 'Build a clear pre-join and in-room experience, coordinate participant connections, and keep controls understandable on desktop and mobile.',
      contribIntro: 'The work centers on frontend call flows and connecting the React UI with realtime room coordination. It does not claim to have invented the WebRTC protocol or built a commercial meeting platform.',
      contributions: [
        ['Pre-join controls', 'Microphone and camera setup before entering a room, with controls reflected in the interface.'],
        ['Room coordination', 'Joining and leaving rooms and exchanging peer identifiers through Socket.IO coordination.'],
        ['Media UI', 'PeerJS/WebRTC connections with participant tiles and in-call microphone/camera controls.'],
        ['Presence and speaking', 'Participant status derived from room data, with speaking indicators driven by browser audio analysis.']
      ],
      architectureIntro: 'Two paths matter: the signaling/presence path coordinates people and room state, while WebRTC carries the actual media between peers where connectivity permits.',
      architectureTitle: 'Room coordination path',
      architecture: [
        ['React UI', 'Pre-join', 'Request media and choose settings'],
        ['Join event', 'Socket.IO', 'Room and peer identity coordination'],
        ['Peer setup', 'PeerJS', 'Negotiate WebRTC connections'],
        ['Media path', 'WebRTC', 'Peer-to-peer audio and video'],
        ['Room state', 'Firebase', 'Presence and UI indicators']
      ],
      architectureNote: 'This diagram combines coordination and media at a high level. Audio/video streams use WebRTC peer connections, not Socket.IO message transport. Network conditions and browser permissions can affect connectivity.',
      journeyIntro: 'The key interaction starts before users enter a room, because a predictable first-use experience reduces confusion with microphone and camera settings.',
      journeyTitle: 'From pre-join to active room',
      journey: [
        ['Preview', 'Mic / camera', 'Set device preferences'],
        ['Enter', 'Join room', 'Share room and peer identifiers'],
        ['Connect', 'PeerJS', 'Establish eligible peer connections'],
        ['Participate', 'Call controls', 'Mute, video and participants'],
        ['Leave', 'Cleanup', 'Exit and update room state']
      ],
      journeyNote: 'User journey simplified from the implemented room flow; real connection behavior varies with permissions, devices and network conditions.',
      decisions: [
        ['Separate concerns', 'Socket.IO coordinates room membership while PeerJS and WebRTC handle browser media connections.'],
        ['Observable status', 'Speaking, mic and camera indicators make participant state visible without obscuring the call controls.'],
        ['Responsive control layout', 'The interface accommodates mobile controls and smaller participant tiles instead of relying on desktop-only placement.'],
        ['Component testing', 'Vitest and React Testing Library cover UI behaviors including room and form interactions and popup controls.']
      ],
      quality: [
        'UI tests cover room-creation interactions, invalid or empty inputs and popup behavior.',
        'Device permissions and audio/video toggles need explicit feedback in the interface.',
        'The implementation includes cleanup when leaving rooms so obsolete participant states are not intentionally preserved.'
      ],
      limits: [
        'WebRTC is sensitive to network topology, browser behavior and permissions; a peer connection is not universally guaranteed.',
        'This is an independent application, not a claim of production-scale conferencing infrastructure.',
        'Browser push and background behavior vary by platform; this case study does not promise unsupported always-on functionality.'
      ],
      outcome: 'Vaani demonstrates realtime frontend engineering beyond ordinary CRUD screens: device APIs, room signaling, peer connections, synchronized presence and testable interactive React components.'
    },
    argus: {
      title: 'Argus',
      category: 'Developer tooling / QA',
      tagline: 'Turn repeatable website checks into actionable evidence.',
      intro: 'An independent Node.js and Playwright website QA tool that inspects accessible, authorized public sites for page quality, links, browser errors and selected frontend issues.',
      role: 'Tooling and browser automation development',
      focus: 'Website diagnostics and evidence-based reports',
      stack: ['Node.js', 'Express', 'Playwright', 'JavaScript', 'Browser diagnostics'],
      image: 'assets/project-shots/argus.jpg',
      imageAlt: 'Screenshot from the Argus web QA auditing tool',
      imageCaption: 'Screenshot of the Argus interface. Availability and scan depth depend on hosting resources and configuration.',
      urlLabel: 'argus-pro-a2px.onrender.com',
      live: 'https://argus-pro-a2px.onrender.com',
      source: 'https://github.com/Rohit30418/Argus',
      challenge: 'Checking multiple pages by hand for broken links, runtime problems, accessibility signals and network failures is inconsistent and time-consuming. Raw issue lists also lack enough evidence for a developer to reproduce the problem.',
      goal: 'Automate repeatable browser checks, present evidence and reproduction context, and help developers investigate findings without pretending that automated heuristics prove every issue.',
      contribIntro: 'Argus is a standalone engineering tool rather than client work. The repository documents its current scan modes, investigation workflow and safety restrictions.',
      contributions: [
        ['Page discovery', 'Configurable website reconnaissance, route discovery and capped scan coverage.'],
        ['Browser investigation', 'Playwright-based checks of selected pages, runtime issues, links and network behavior.'],
        ['Evidence-led findings', 'Issue-specific details such as affected element, runtime context, reproduction hints and screenshots when applicable.'],
        ['Conservative form checks', 'Opt-in native validation checks using synthetic inputs, without submitting sensitive or real forms.']
      ],
      architectureIntro: 'A scan starts with scope and discovery. Lower-cost checks narrow the set of pages requiring deeper browser inspection, after which the app organizes findings for developers.',
      architectureTitle: 'Website QA scan pipeline',
      architecture: [
        ['Target', 'Authorized URL', 'User chooses scan scope'],
        ['Discover', 'Crawler', 'Collect bounded page routes'],
        ['Check', 'Broad QA', 'Links and quality signals'],
        ['Inspect', 'Playwright', 'Deep browser evidence on selected pages'],
        ['Report', 'Findings', 'Reproduction and retest guidance']
      ],
      architectureNote: 'Coverage is capped by mode and environment limits. AI analysis is optional; deterministic checks do not depend on an AI provider. A report is diagnostic evidence, not a guarantee of full coverage.',
      journeyIntro: 'Developers need to move from a candidate URL to an explainable issue rather than just receiving an unsupported score.',
      journeyTitle: 'From scan request to investigation',
      journey: [
        ['Configure', 'URL and mode', 'Choose scope and optional checks'],
        ['Run', 'Browser scans', 'Collect observations and errors'],
        ['Review', 'Evidence', 'Inspect pages and selectors'],
        ['Prioritize', 'Findings', 'Separate observation from hypothesis'],
        ['Retest', 'Verify fix', 'Run checks again after changes']
      ],
      journeyNote: 'Illustrative workflow based on project documentation; exact features and limits depend on deployed version and configuration.',
      decisions: [
        ['Evidence first', 'Findings distinguish confirmed observations from suggested causes, with issue-level screenshots only where visual evidence is meaningful.'],
        ['Controlled scan depth', 'Broad checks plus selective deeper inspection reduce duplicate, costly full-browser work on large sites.'],
        ['Safety boundaries', 'Form testing is opt-in, uses synthetic data, blocks mutation requests and skips sensitive workflows; site authorization is still required.'],
        ['Optional AI', 'AI-assisted explanation can add context but is not treated as a prerequisite for the core browser checks.']
      ],
      quality: [
        'Repository includes Node syntax checks and self-tests.',
        'Network failures and header-level issues use appropriate non-visual evidence instead of fabricated screenshots.',
        'Retest guidance helps a developer confirm a fix rather than treating a scan report as proof of resolution.'
      ],
      limits: [
        'Use only on websites you own or are explicitly authorized to test.',
        'Automated checks cannot replace accessibility testing with users, manual exploratory QA or server-side validation.',
        'A cloud demo can be temporarily unavailable; scan coverage depends on browser/runtime resources.'
      ],
      outcome: 'Argus demonstrates the ability to build practical developer tooling: browser automation, bounded workflows, defensive checks, issue evidence and useful reports. No unsupported claim about bugs prevented or time saved is made.'
    }
  };

  const byId = (id) => document.getElementById(id);
  const projectKey = new URLSearchParams(window.location.search).get('project');
  const key = (projectKey || '').trim().toLowerCase();
  const project = Object.hasOwn(projects, key) ? projects[key] : null;
  if (!project) {
    byId('notFound').hidden = false;
    document.title = 'Case study not found | Rohit Pant';
    return;
  }
  const setText = (id, value) => { byId(id).textContent = value; };
  const link = (url, label, className) => {
    const a = document.createElement('a');
    a.href = url;
    a.textContent = label;
    a.className = className;
    if (/^https:\/\//.test(url)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  };
  const populate = (id, items, makeNode) => {
    byId(id).replaceChildren(...items.map(makeNode));
  };
  setText('crumbName', project.title);
  setText('caseCategory', project.category);
  setText('caseTitle', project.title);
  setText('caseTagline', project.tagline);
  setText('caseIntro', project.intro);
  setText('factRole', project.role);
  setText('factFocus', project.focus);
  populate('factStack', project.stack, (name) => {
    const el = document.createElement('span');
    el.textContent = name;
    return el;
  });
  const actions = [link(project.live, 'Visit live project ↗', 'action action-primary'), link('index.html#work', '← Back to projects', 'action action-outline')];
  if (project.source) actions.splice(1, 0, link(project.source, 'View source code ↗', 'action action-outline'));
  byId('heroLinks').replaceChildren(...actions);
  setText('previewUrl', project.urlLabel);
  setText('imageCaption', project.imageCaption);
  const image = byId('caseImage');
  image.alt = project.imageAlt;
  image.addEventListener('error', () => {
    image.hidden = true;
    byId('caseImageFallback').hidden = false;
  }, { once: true });
  image.src = project.image;
  setText('caseChallenge', project.challenge);
  setText('caseGoal', project.goal);
  setText('contribIntro', project.contribIntro);
  populate('contribCards', project.contributions, ([heading, detail], i) => {
    const card = document.createElement('article');
    card.className = 'feature-card';
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = String(i + 1).padStart(2, '0') + ' /';
    const title = document.createElement('h3');
    title.textContent = heading;
    const desc = document.createElement('p');
    desc.textContent = detail;
    card.append(num, title, desc);
    return card;
  });
  setText('architectureIntro', project.architectureIntro);
  setText('architectureHeading', project.architectureTitle);
  setText('architectureNote', project.architectureNote);
  setText('journeyIntro', project.journeyIntro);
  setText('journeyHeading', project.journeyTitle);
  setText('journeyNote', project.journeyNote);
  const buildFlow = ([title, tool, description], i, list) => {
    const li = document.createElement('li');
    const node = document.createElement('div');
    node.className = 'flow-node';
    const step = document.createElement('span');
    step.className = 'step';
    step.textContent = String(i + 1).padStart(2, '0') + ' / ' + title;
    const strong = document.createElement('strong');
    strong.textContent = tool;
    const small = document.createElement('small');
    small.textContent = description;
    node.append(step, strong, small);
    li.append(node);
    if (i < list.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'flow-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      li.append(arrow);
    }
    return li;
  };
  populate('architectureFlow', project.architecture, buildFlow);
  populate('journeyFlow', project.journey, buildFlow);
  populate('decisionsList', project.decisions, ([tag, detail]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'decision';
    const label = document.createElement('span');
    label.className = 'tag';
    label.textContent = tag;
    const p = document.createElement('p');
    p.textContent = detail;
    wrapper.append(label, p);
    return wrapper;
  });
  for (const [id, values] of [['qualityList', project.quality], ['limitsList', project.limits]]) {
    populate(id, values, (value) => {
      const li = document.createElement('li');
      li.textContent = value;
      return li;
    });
  }
  setText('caseOutcome', project.outcome);
  populate('moreProjects', Object.entries(projects).filter(([projectId]) => projectId !== key), ([projectId, value]) => {
    const a = link('case-study.html?project=' + encodeURIComponent(projectId), value.title, '');
    const span = document.createElement('span');
    span.textContent = '↗';
    a.append(span);
    return a;
  });
  byId('caseContent').hidden = false;
  byId('year').textContent = new Date().getFullYear();
  document.title = project.title + ' — Engineering Case Study | Rohit Pant';
  byId('pageDescription').content = project.intro;
  byId('ogTitle').content = document.title;
  byId('ogDescription').content = project.tagline;
})();