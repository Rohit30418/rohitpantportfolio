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

## Performance update — October 2026

- Removed the three metric counters (5+ / 4+ / infinity) and related hero CSS.
  Desktop copy is rebalanced; mobile hero is unchanged.
- The first-visit WebP intro now uses a sparse preview set (~1 in every 4
  frames) instead of fetching all 196 frames before entry. The remaining
  frames load near the scroll target. It runs only once per browser tab/session,
  with a 9-second fail-open timeout if image preparation stalls.
- The development process sequence is no longer prefetched after the intro.
  It starts near its own viewport position and initially fetches spaced-out
  thumbnails plus the nearby frames, rather than all 90 frames.
- Full-resolution WebP bitmap caching is capped (2 intro / 3 process on
  desktop), and canvases use a maximum effective DPR of 1 for cheaper paints.
- The 3D Skills scene uses on-demand rendering at approximately 30 FPS,
  smaller 512 × 284 label textures and a lower DPR cap; the React hero uses
  a lower DPR cap and avoids pointer-triggered layout reads.
- Reduced the portrait's expensive layered drop-shadows to a single shadow
  and disabled the custom mouse-follower loop.

**Verification:** Syntax and source integration can be checked through
GitHub; actual scroll smoothness must still be measured in a browser on
desktop and mobile hardware. Performance depends on GPU, network and cache.

## Project Hologram showroom

The original three project cards were replaced by a responsive, interactive
**Project Hologram** section inspired by the approved concept mockup.

- `index.html` contains accessible selectors, details, project CTAs, a
  decorative floating app preview and a native case-study dialog.
- `assets/project-hologram.css` handles the cinematic dark/cyan styling,
  projected light beam, CSS 3D perspective, responsive layouts and
  reduced-motion support.
- `assets/hologram-projector.svg` is a lightweight metallic projector illustration
  with cyan-lit concentric rings (not another WebGL scene).
- `assets/project-hologram.js` switches four real projects: Vaani,
  EventHive, ARGUS and Hall Layout. Each has a different illustrative UI
  preview and matching description, stack, live link and project brief.
- The projection previews are visual representations of the projects, not
  live embedded apps, usage statistics, or screenshots.
- Project options are ordinary outgoing links if JavaScript fails.
  With JavaScript enabled they switch the hologram; Ctrl/Cmd-click still
  opens the destination directly. The Case Study button opens a
  keyboard-accessible native dialog.
- To avoid reintroducing lag there is no additional Canvas, heavy physics,
  or scroll-controlled camera. Two small CSS animations are paused when the
  section is offscreen or the browser tab is hidden, and disabled for
  reduced-motion preferences.

**Validation:** GitHub source integrity, HTML IDs, JavaScript syntax and
the simulated project switching/dialog behavior have been checked.
Live browser layout and FPS were not measured in this environment.

## One-screen hologram with real screenshots

- The desktop Projects showroom uses a single 100svh viewport on screens
  981px wide and at least 740px tall. Shorter screens and mobile phones
  scroll naturally so controls remain usable.
- `assets/project-hologram-one-screen.css` optimizes section spacing and
  replaces the old illustrated interface with one actual project screenshot
  displayed in the floating hologram screen.
- `assets/project-shots/*.jpg` contain Playwright captures of **public live
  pages** (not fabricated dashboards). Current confirmed captures: Vaani,
  EventHive, Hall Layout. Argus returned HTTP 503 on the first attempt.
  An unavailable screenshot shows a clearly labeled fallback and the
  selected project's Live Demo link instead of pretending to show it.
- `scripts/capture-project-previews.mjs` and the manually runnable GitHub
  Actions workflow `Capture real project screenshots` refresh the files
  using a real Chromium browser, with no logged-in session.
- The projector itself remains a lightweight decorative SVG with
  CSS perspective — no added WebGL canvas, no live iframe, and no
  background video. Preview switching uses a brief transition only.

