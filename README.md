# rohitpantportfolio

## Smooth React 3D hero (React Three Fiber + Drei + GSAP)

The homepage remains the original static HTML portfolio, not a React SPA.
Its portrait, typography, first-visit intro, projects, Skills section and
scroll-controlled development animation are preserved.

- `index.html` provides the `#heroReact3D` mount point and progressive loader.
- `assets/hero-cinematic.css` implements the updated editorial mockup:
  split oversized name, highlighted role, warm/cool portrait lighting,
  refined actions, verified portfolio highlights and the bottom tech rail.
- `assets/hero-atom-stage.svg` adds an atmospheric rocky platform
  beneath the React atom without expensive extra WebGL meshes.
- The original portrait asset `assets/rohit-hero.webp` is retained;
  the scenic art remains a live 3D R3F animation, not a screenshot.
- The cinematic composition is desktop-first. Tablet/phone layouts
  retain a simpler readable portrait-and-content hero.

- `assets/hero-react-object.mjs` renders a recognizable React atom with
  three animated elliptical orbits, three electrons and a floating metallic core.
- React Three Fiber handles rendering, Drei handles subtle floating motion,
  and GSAP handles only the entrance scale, not each animation frame.
- The desktop hero's original pointer-parallax is disabled to avoid competing
  animations. The custom cursor and animations in other sections remain.
- The 3D scene loads only after the first-visit intro, on eligible desktop
  devices. Touch, reduced-motion, data-saving, no-WebGL and low-memory
  users retain the normal static hero.
- Rendering pauses when the hero moves out of view or the tab is hidden.
  DPR is capped at 1.25; shared low-poly geometries and no postprocessing
  help reduce GPU load.
- If the CDN imports fail, the original hero content remains visible.

**Local testing:** Serve the site via HTTP, not `file://` (for example,
`python -m http.server 8000`). An internet connection is needed because
this static-site approach imports React, R3F, Drei and GSAP from pinned
esm.sh URLs in `index.html`. A bundled build with Vite is recommended
if WebGL becomes a critical production feature.

## Interactive 3D skills carousel

The existing Skills section has a progressive, Three.js-based 3D carousel
on desktop. It uses React Three Fiber for WebGL rendering and GSAP for
the smooth selected-skill rotation.

- `assets/skills-universe.mjs` draws texture-mapped floating cards in a
  circular 3D arrangement, plus an interactive description, drag navigation,
  accessible arrow buttons and arrow-key support.
- The new carousel mounts in `#skillsUniverse` and loads only when the Skills
  section is nearby; it does not load at initial page render.
- The original Font Awesome skill marquees remain intact as the fallback on
  touch/mobile layouts, reduced-motion users, browsers without WebGL, low-memory
  devices, data-saving connections, or CDN-loading failure.
- Rendering is paused outside the Skills section and when the page is hidden.
- Skill label canvases use 768×426 textures and a capped device pixel ratio.
- The 3D island reuses the same pinned ES module import map as the optional
  desktop hero scene. It is not a Vite application.
- To edit skills shown in 3D, update the `DATA` array inside
  `assets/skills-universe.mjs`. To edit the fallback, update the marquee
  chip HTML inside `index.html`.

If the scene fails to load, the original HTML skills section still appears.
To roll back only this feature, revert the relevant index.html changes and
remove `assets/skills-universe.mjs`.
