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

## Skills Glass Gallery (October 15, 2026)

Replaced the tiny WebGL technology ring with a **wide, legible interactive
carousel** inspired by the approved Skills screenshot:

- Large translucent technology cards with readable icons, names and roles.
- Curved cyan-lit floor and subtle CSS perspective, without continuous rendering.
- 18 technologies, navigable with arrows, keyboard, clicking cards or swiping.
- Desktop shows seven to nine cards across; smaller screens display three
  large centered/neighboring tiles instead of shrinking text.
- Built with `assets/skills-showcase.js` and `assets/skills-showcase.css`.
  No React/Three.js/GSAP dependency is loaded for the Skills section.
- The old plain HTML marquee still exists in `index.html` as the fail-open
  fallback if JavaScript is disabled or initialization fails.
- Original `assets/skills-universe.mjs` is retained only as old unused source;
  it is **not imported** by the portfolio any longer.
- The gallery is checked in Chromium by `scripts/verify-skills-showcase.mjs`
  and `.github/workflows/verify-skills-showcase.yml`.

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
- The Skills section no longer starts a WebGL scene or a 30 FPS loop;
  it uses DOM cards with transform transitions only on user interaction.
  The separate React hero retains a lower DPR cap.
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
- `assets/project-hologram.js` switches three featured projects: Vaani,
  EventHive and ARGUS. Each has a different illustrative UI
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
  EventHive and ARGUS (after retrying its temporary HTTP 503).
  An unavailable screenshot shows a clearly labeled fallback and the
  selected project's Live Demo link instead of pretending to show it.
- `scripts/capture-project-previews.mjs` and the manually runnable GitHub
  Actions workflow `Capture real project screenshots` refresh the files
  using a real Chromium browser, with no logged-in session.
- The projector itself remains a lightweight decorative SVG with
  CSS perspective — no added WebGL canvas, no live iframe, and no
  background video. Preview switching uses a brief transition only.

## Approved compact hologram layout — October 15, 2026

The Projects section now mirrors the approved, uncluttered reference.
It shows only **Vaani, EventHive and ARGUS**, with actual Chromium
screenshots from their public homepages. Hall Layout and the two decorative
floating HUD cards were removed from this section.

The right projection was enlarged, and the left panel was rebuilt with a
compact title, three project choices, brief summary, accurate tech tags and
three working CTAs. The design clears the fixed navigation header.

The section uses one viewport on desktop screens at least 981 pixels wide
and 720 pixels high. Smaller viewports fall back to natural vertical scrolling
rather than clipping the controls. Browser layout regression tests are in
`scripts/verify-project-layout.mjs` and
`.github/workflows/verify-project-layout.yml`.

**Verified with real headless Chromium:** 1728×900, 1440×900, 1366×768,
1280×720, 1024×768, 768×1024 and 390×844. All passed layout tests for
horizontal overflow, project selectors and available screenshots; desktop
viewports also passed fixed-header clearance, CTA visibility and the
one-screen section height constraint. The three project screenshot files are
kept under `assets/project-shots/`.

## Zoom-stable fluid hero — October 15, 2026

The same cinematic ROHIT / PANT hero now uses a shared **responsive CSS
Grid** rather than independently absolutely positioned text, portrait and
React scene. The markup in `index.html` places the atom and rock platform
inside the hero grid; `assets/hero-fluid.css` establishes layout rows,
columns, typography, imagery, spacing and narrower-device flow.

- Wide desktop: three columns for intro, centered portrait and React atom.
- Narrow desktop/tablet: two columns, with the optional 3D scene disabled.
- Phone: one column in natural flow, preventing overlap under zoom or large text.
- An obsolete reduced-motion rule had continued shifting the portrait left by
  half its own width. Its transform is now explicitly reset for every width.
- All other sections, project screenshots, navigation, media, and the static
  mobile fallback remain intact.

**Automated Chromium verification:** GitHub Actions workflow
`Verify responsive hero layout` ran
`scripts/verify-hero-layout.mjs` across **15 viewport and zoom-equivalent
sizes** (1920×1080, 1800×1125, 1728×900, 1440×900, 1366×768,
1152×720, 1100×700, 1024×768, 960×600, 844×390, 768×1024,
600×900, 390×844, 375×667, 320×640).
All passed checks for header clearance, overlapping text/images, visible
buttons, horizontal overflow and viewport containment. Reduced-motion is
enabled during the layout regression to avoid dependency on CDN-hosted WebGL.

