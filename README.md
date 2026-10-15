# rohitpantportfolio

## Optional 3D hero (React Three Fiber + Drei + GSAP)

The live homepage remains a static HTML site. Its original portrait, first-visit
scroll intro, project links, and canvas-driven "Behind the code" section are
preserved. A progressive enhancement mounts a React Three Fiber sculpture into
the desktop hero without converting the rest of the site into a React SPA.

- `index.html` provides an ES import map, the `#orbitHeroScene` mount point,
  and a small loader that imports the scene only when appropriate.
- `assets/orbit-scene.mjs` renders the sculpture using Three.js, React Three
  Fiber, Drei's Float component, and GSAP for subtle reveal/scroll motion.
- The scene is disabled on touch/mobile layouts, reduced-motion preferences,
  data-saver connections, and devices reporting less than 4 GB memory.
- It begins **after** the existing first-visit intro finishes, and suspends
  rendering when the hero or browser tab isn't visible.
- The canvas uses capped device pixel ratio and low-power WebGL settings.
- If the optional CDN imports fail, the site continues functioning without 3D.

**Local testing:** Serve the project over HTTP rather than opening the HTML
via `file://` so ES module imports work (for example,
`python -m http.server 8000`). A network connection is required because this
static-site bridge currently loads React, Three.js, Drei and GSAP from pinned
esm.sh CDN versions. A bundled Vite build is recommended if making 3D a
mandatory production feature. Test on desktop, mobile, and reduced-motion modes.

**Rollback:** Revert the "integrate 3D orbit" index.html commit and the
"add lazy React Three Fiber hero sculpture" asset commit.
