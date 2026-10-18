/**
 * Single, lightweight 3D technology sculpture for the portfolio hero.
 * One WebGL canvas; no floating badge meshes, downloaded models or postprocessing.
 * Every four seconds the central silhouette changes between frontend technologies.
 */
(() => {
  const stage = document.getElementById('reactHeroStage');
  const slot = document.getElementById('reactHeroCanvasSlot');
  if (!stage || !slot) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches;
  const connection = navigator.connection;
  const constrained = !!(connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 3));
  if (constrained || !window.WebGLRenderingContext) return;

  const specs = [
    { key: 'react', name: 'React', color: '#61dafb' },
    { key: 'html', name: 'HTML5', color: '#f16529' },
    { key: 'tailwind', name: 'Tailwind CSS', color: '#38bdf8' },
    { key: 'git', name: 'Git', color: '#f05032' },
    { key: 'css', name: 'CSS3', color: '#2965f1' },
    { key: 'javascript', name: 'JavaScript', color: '#f7df1e' },
    { key: 'typescript', name: 'TypeScript', color: '#3178c6' },
    { key: 'firebase', name: 'Firebase', color: '#ffca28' }
  ];
  const switchSeconds = 4;
  const transitionSeconds = 0.95;
  const targetFPS = coarse ? 24 : 35;
  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  let THREE, renderer, camera, scene, sculpture, variants = [], observer, resizeObserver, canvas;
  let initialized = false, loading = false, disposed = false, contextLost = false, running = false;
  let raf = 0, lastTick = 0, lastDraw = 0, elapsed = 0, labelIndex = -1;

  function createMaterial(hex, glow = false) {
    return new THREE.MeshPhysicalMaterial({
      color: hex, metalness: 0.32, roughness: 0.2,
      clearcoat: 0.95, clearcoatRoughness: 0.13,
      emissive: glow ? hex : '#000000', emissiveIntensity: glow ? 0.17 : 0
    });
  }

  function extrude(shape, color, depth = 0.23) {
    return new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: 0.065,
        bevelSize: 0.048, bevelSegments: 2, curveSegments: 10, steps: 1
      }),
      createMaterial(color)
    );
  }

  function polygon(points) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    return shape;
  }

  function textFace(value, ink = '#ffffff', fontSize = 230, w = 2.25, h = 2.25, z = 0.39) {
    const surface = document.createElement('canvas');
    surface.width = surface.height = 512;
    const ctx = surface.getContext('2d');
    if (!ctx) throw Error('2D canvas unavailable');
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 ' + fontSize + 'px system-ui, Arial, sans-serif';
    ctx.fillText(value, 256, 275, 450);
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false })
    );
    face.position.z = z;
    return face;
  }

  function makeReact() {
    const group = new THREE.Group();
    const ringGeometry = new THREE.TorusGeometry(1.73, 0.09, 12, 100);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeometry, createMaterial(['#8aeaff', '#5ac9ee', '#42afdf'][i], true));
      ring.scale.set(1, 0.44, 1);
      ring.rotation.z = i * Math.PI / 3;
      ring.rotation.x = (i - 1) * 0.075;
      group.add(ring);
    }
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.39, 28, 18),
      createMaterial('#a4efff', true)
    );
    core.position.z = 0.12;
    group.add(core);
    return group;
  }

  function makeShield(base, numeral, innerColor) {
    const group = new THREE.Group();
    const outline = polygon([
      [-1.02, 1.40], [1.02, 1.40], [0.84, -1.22],
      [0, -1.57], [-0.84, -1.22]
    ]);
    group.add(extrude(outline, base, 0.23));
    const inset = polygon([
      [0, 1.10], [0.75, 1.10], [0.61, -1.02], [0, -1.27]
    ]);
    const insetMesh = extrude(inset, innerColor, 0.055);
    insetMesh.position.z = 0.28;
    group.add(insetMesh);
    group.add(textFace(numeral, '#ffffff', 298, 1.9, 2.1, 0.43));
    return group;
  }

  function makeTailwind() {
    const group = new THREE.Group();
    // Two rounded wind strokes, each an actual beveled volume.
    for (let i = 0; i < 2; i++) {
      const y = i === 0 ? 0.50 : -0.48;
      const wave = new THREE.Shape();
      wave.moveTo(-1.55, y - 0.10);
      wave.bezierCurveTo(-1.15, y + 0.70, -0.39, y + 0.75, 0.16, y + 0.10);
      wave.bezierCurveTo(0.49, y - 0.25, 0.82, y - 0.33, 1.50, y + 0.05);
      wave.bezierCurveTo(1.12, y - 0.70, 0.40, y - 0.70, -0.18, y - 0.04);
      wave.bezierCurveTo(-0.59, y + 0.40, -0.98, y + 0.23, -1.55, y - 0.10);
      wave.closePath();
      const mesh = extrude(wave, i ? '#7dd3fc' : '#38bdf8', 0.21);
      group.add(mesh);
    }
    return group;
  }

  function makeGit() {
    const group = new THREE.Group();
    const diamond = extrude(polygon([
      [-1.15, -1.15], [1.15, -1.15],
      [1.15, 1.15], [-1.15, 1.15]
    ]), '#f05032', 0.28);
    diamond.rotation.z = Math.PI / 4;
    group.add(diamond);
    const white = createMaterial('#fff8f5');
    const line = (a, b) => {
      const start = new THREE.Vector3(a[0], a[1], 0.43);
      const end = new THREE.Vector3(b[0], b[1], 0.43);
      const direction = new THREE.Vector3().subVectors(end, start);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, direction.length(), 10), white);
      bar.position.copy(start).add(end).multiplyScalar(0.5);
      bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      group.add(bar);
    };
    line([-0.53, 0.75], [-0.53, -0.65]);
    line([-0.53, -0.06], [0.54, 0.52]);
    for (const [x, y] of [[-0.53, 0.75], [-0.53, -0.65], [0.54, 0.52]]) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), white);
      node.position.set(x, y, 0.45);
      group.add(node);
    }
    return group;
  }

  function makeSquare(color, letters, ink) {
    const group = new THREE.Group();
    const shape = polygon([
      [-1.17, -1.17], [1.17, -1.17],
      [1.17, 1.17], [-1.17, 1.17]
    ]);
    group.add(extrude(shape, color, 0.23));
    group.add(textFace(letters, ink, 220, 2.15, 2.15, 0.38));
    return group;
  }

  function makeFirebase() {
    const group = new THREE.Group();
    const back = polygon([
      [-0.88, -1.35], [-0.57, 1.44], [0.04, 0.32],
      [0.52, 1.02], [1.06, -0.92], [0.12, -1.52]
    ]);
    group.add(extrude(back, '#ff9e17', 0.24));
    const inner = polygon([
      [-0.32, -1.23], [0.10, 0.28], [0.49, 0.86], [0.80, -0.72], [0.10, -1.43]
    ]);
    const innerMesh = extrude(inner, '#ffdd68', 0.07);
    innerMesh.position.z = 0.28;
    group.add(innerMesh);
    return group;
  }

  function buildVariants() {
    variants = [
      makeReact(),
      makeShield('#e44d26', '5', '#f4784c'),
      makeTailwind(),
      makeGit(),
      makeShield('#264de4', '3', '#4d82f3'),
      makeSquare('#f7df1e', 'JS', '#24221d'),
      makeSquare('#3178c6', 'TS', '#ffffff'),
      makeFirebase()
    ];
    for (let i = 0; i < variants.length; i++) {
      variants[i].visible = i === 0;
      sculpture.add(variants[i]);
    }
    stage.dataset.iconCount = '0';
    stage.dataset.morphCount = String(variants.length);
    stage.dataset.technologies = specs.map(item => item.name).join(', ');
    setLabel(0);
  }

  function setLabel(index) {
    if (index === labelIndex) return;
    labelIndex = index;
    const spec = specs[index];
    stage.style.setProperty('--hero-tech-accent', spec.color);
    stage.dataset.currentTechnology = spec.name;
  }

  function syncMorph(time) {
    const position = time / switchSeconds;
    const current = Math.floor(position) % variants.length;
    const next = (current + 1) % variants.length;
    const phase = (position - Math.floor(position)) * switchSeconds;
    const entering = phase > switchSeconds - transitionSeconds;
    const t = entering ? (phase - switchSeconds + transitionSeconds) / transitionSeconds : 0;
    const smooth = t * t * (3 - 2 * t);
    for (let i = 0; i < variants.length; i++) {
      const group = variants[i];
      const isCurrent = i === current;
      const isNext = entering && i === next;
      group.visible = isCurrent || isNext;
      if (!group.visible) continue;
      const amount = isNext ? smooth : (entering ? 1 - smooth : 1);
      group.scale.setScalar(Math.max(0.001, amount));
      group.rotation.y = isNext ? -(1 - smooth) * 1.0 : (entering ? smooth * 1.0 : 0);
      group.rotation.z = Math.sin(time * 0.31) * 0.024;
    }
    setLabel(entering && smooth >= 0.5 ? next : current);
  }

  function layout() {
    if (!renderer || !camera || disposed || contextLost) return;
    const width = Math.max(2, Math.round(slot.clientWidth));
    const height = Math.max(2, Math.round(slot.clientHeight));
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1 : 1.25));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // Largest possible silhouette is used, preventing clipped edges mid-morph.
    const paddingX = 2.0, paddingY = 2.05, frontZ = 0.65;
    camera.position.z = Math.max(8.1, frontZ + Math.max(
      paddingX / (halfFov * camera.aspect * 0.75),
      paddingY / (halfFov * 0.75)
    ));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    const frameX = paddingX / ((camera.position.z - frontZ) * halfFov * camera.aspect);
    const frameY = paddingY / ((camera.position.z - frontZ) * halfFov);
    stage.dataset.cameraDistance = camera.position.z.toFixed(2);
    stage.dataset.compositionMargin = Math.max(0, (1 - Math.max(frameX, frameY)) / 2).toFixed(3);
    draw();
  }

  function draw() {
    if (!renderer || !scene || disposed || contextLost) return;
    renderer.render(scene, camera);
    stage.classList.add('has-webgl');
  }

  function animate(now) {
    raf = 0;
    if (!running || disposed || document.hidden || contextLost) return;
    if (now - lastDraw < 1000 / targetFPS) {
      raf = requestAnimationFrame(animate);
      return;
    }
    const delta = lastTick ? Math.min((now - lastTick) / 1000, 0.08) : 0;
    lastTick = now;
    lastDraw = now;
    elapsed += delta;
    eased.x += (pointer.x - eased.x) * 0.085;
    eased.y += (pointer.y - eased.y) * 0.085;
    sculpture.rotation.y = 0.18 + Math.sin(elapsed * 0.31) * 0.18 + eased.x * 0.15;
    sculpture.rotation.x = -0.10 + Math.sin(elapsed * 0.25) * 0.06 - eased.y * 0.1;
    sculpture.rotation.z = Math.sin(elapsed * 0.28) * 0.02;
    sculpture.position.y = Math.sin(elapsed * 0.64) * 0.08;
    syncMorph(elapsed);
    draw();
    raf = requestAnimationFrame(animate);
  }

  function start() {
    if (disposed || contextLost || !initialized || running || document.hidden) return;
    if (reduced) { syncMorph(0); draw(); return; }
    running = true;
    lastTick = 0;
    lastDraw = 0;
    raf = requestAnimationFrame(animate);
  }

  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onVisibility() {
    if (document.hidden) pause();
    else if (observer?.heroVisible) start();
  }
  function onPointer(event) {
    if (coarse || reduced) return;
    const rect = stage.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    pointer.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
  }
  function resetPointer() { pointer.x = 0; pointer.y = 0; }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    pause();
    observer?.disconnect();
    resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', cleanup);
    stage.removeEventListener('pointermove', onPointer);
    stage.removeEventListener('pointerleave', resetPointer);
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene?.traverse(node => {
      if (!node.isMesh) return;
      if (node.geometry) geometries.add(node.geometry);
      for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
        if (material) materials.add(material);
      }
    });
    geometries.forEach(item => item.dispose());
    materials.forEach(item => {
      if (item.map) textures.add(item.map);
      item.dispose();
    });
    textures.forEach(item => item.dispose());
    renderer?.dispose();
  }

  async function initialize() {
    if (initialized || loading || disposed) return;
    loading = true;
    try {
      THREE = await import('https://esm.sh/three@0.171.0?bundle');
      if (disposed || !stage.isConnected) return;
      canvas = document.createElement('canvas');
      canvas.className = 'react-hero-webgl';
      canvas.setAttribute('aria-hidden', 'true');
      slot.appendChild(canvas);
      renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: !coarse, powerPreference: 'low-power'
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.36;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
      scene.add(new THREE.HemisphereLight(0xe5f5ff, 0x102238, 2.1));
      for (const light of [
        { color: 0xf5fbff, power: 3.2, position: [-4, 5, 7] },
        { color: 0x6ccfff, power: 2.6, position: [4, -1, 5] }
      ]) {
        const source = new THREE.DirectionalLight(light.color, light.power);
        source.position.set(...light.position);
        scene.add(source);
      }
      sculpture = new THREE.Group();
      scene.add(sculpture);
      buildVariants();

      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        contextLost = true;
        pause();
        stage.classList.remove('has-webgl');
      }, false);
      canvas.addEventListener('webglcontextrestored', () => {
        contextLost = true;
        stage.classList.remove('has-webgl');
      }, false);

      initialized = true;
      resizeObserver = new ResizeObserver(layout);
      resizeObserver.observe(slot);
      syncMorph(0);
      layout();
      if (observer?.heroVisible) start();
    } catch (error) {
      console.warn('3D hero unavailable; preserving SVG fallback:', error);
      stage.classList.remove('has-webgl');
      cleanup();
      canvas?.remove();
    } finally {
      loading = false;
    }
  }

  observer = new IntersectionObserver(entries => {
    observer.heroVisible = !!entries[0]?.isIntersecting;
    if (observer.heroVisible) {
      if (!initialized) initialize();
      else start();
    } else pause();
  }, { rootMargin: '100px 0px', threshold: 0 });
  observer.observe(stage);
  document.addEventListener('visibilitychange', onVisibility, { passive: true });
  window.addEventListener('pagehide', cleanup, { once: true });
  stage.addEventListener('pointermove', onPointer, { passive: true });
  stage.addEventListener('pointerleave', resetPointer, { passive: true });
})();
