import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Render crisp labels into WebGL textures, without external fonts or 3D models.
const h = React.createElement;
const DATA = [
  { name: 'JavaScript', tag: 'LANGUAGE', detail: 'Browser APIs, modern ES features and interaction engineering.', icon: 'JS', color: '#f7df1e' },
  { name: 'React', tag: 'UI ENGINEERING', detail: 'Reusable components, state-driven interfaces and product UI.', icon: 'R', color: '#61dafb' },
  { name: 'TypeScript', tag: 'LANGUAGE', detail: 'Type-safe UI architecture and scalable React components.', icon: 'TS', color: '#5d9cf5' },
  { name: 'HTML & CSS', tag: 'FOUNDATIONS', detail: 'Responsive layouts, semantic markup and accessible design.', icon: '</>', color: '#f49c68' },
  { name: 'Redux Toolkit', tag: 'STATE', detail: 'Predictable client state, slices and async app workflows.', icon: 'RT', color: '#aa88ff' },
  { name: 'React Query', tag: 'SERVER STATE', detail: 'Fetching, caching, mutations and resilient data flows.', icon: 'RQ', color: '#f17a96' },
  { name: 'Tailwind CSS', tag: 'STYLING', detail: 'Design systems, responsive utilities and consistent UI.', icon: 'TW', color: '#56d9c9' },
  { name: 'Firebase', tag: 'BACKEND SERVICES', detail: 'Authentication, realtime databases and app integrations.', icon: 'FB', color: '#ffca64' },
  { name: 'WebRTC', tag: 'REALTIME', detail: 'Camera, microphone and peer-to-peer experiences.', icon: 'RTC', color: '#79d8cb' },
  { name: 'GSAP', tag: 'MOTION', detail: 'Scroll storytelling, timelines and refined micro-interactions.', icon: 'GS', color: '#adce6e' },
  { name: 'Playwright', tag: 'TESTING', detail: 'Browser automation and production-oriented UI testing.', icon: 'PW', color: '#9cdb8f' },
  { name: 'Node.js', tag: 'TOOLING', detail: 'API integrations, development tools and browser automation.', icon: 'N', color: '#8acf91' }
];
const COUNT = DATA.length;
const STEP = Math.PI * 2 / COUNT;
const RADIUS = 4.1;
const clamp = n => Math.max(0, Math.min(1, n));
const boxGeometry = new THREE.BoxGeometry(2.73, 1.53, 0.075);
const faceGeometry = new THREE.PlaneGeometry(2.7, 1.5);

function makeLabel(data, index) {
  const el = document.createElement('canvas');
  el.width = 1024;
  el.height = 568;
  const ctx = el.getContext('2d');
  ctx.clearRect(0, 0, 1024, 568);
  ctx.fillStyle = '#0c1417';
  ctx.strokeStyle = 'rgba(233,245,237,.19)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(9, 9, 1006, 550, 43);
  ctx.fill();
  ctx.stroke();
  const grd = ctx.createRadialGradient(900, 110, 10, 840, 70, 620);
  grd.addColorStop(0, data.color + '32');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(10, 10, 1004, 548);
  ctx.fillStyle = data.color;
  ctx.fillRect(52, 53, 54, 6);
  ctx.font = '600 27px Manrope, sans-serif';
  ctx.fillStyle = '#a8b8b8';
  ctx.fillText('FRONTEND / TOOLKIT', 52, 108);
  ctx.fillStyle = data.color;
  ctx.font = '700 108px Manrope, sans-serif';
  ctx.fillText(data.icon, 52, 285);
  ctx.fillStyle = '#f5f7f3';
  ctx.font = '800 73px Manrope, sans-serif';
  ctx.fillText(data.name, 52, 410, 920);
  ctx.font = '600 29px Manrope, sans-serif';
  ctx.fillStyle = '#9bb5b5';
  ctx.fillText(data.tag, 52, 487);
  ctx.textAlign = 'right';
  ctx.font = '500 28px Manrope, sans-serif';
  ctx.fillText(String(index + 1).padStart(2, '0') + ' / ' + COUNT, 965, 102);
  ctx.textAlign = 'left';
  const tex = new THREE.CanvasTexture(el);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function SkillCard({ data, index, texture }) {
  const angle = STEP * index;
  return h('group', {
    position: [Math.sin(angle) * RADIUS, Math.sin(angle * 2) * 0.12, Math.cos(angle) * RADIUS],
    rotation: [0, angle, 0]
  },
    h('mesh', { geometry: boxGeometry },
      h('meshStandardMaterial', { color: '#1d2b30', metalness: 0.56, roughness: 0.32 })
    ),
    h('mesh', { geometry: faceGeometry, position: [0, 0, 0.042] },
      h('meshBasicMaterial', { map: texture, side: THREE.FrontSide, toneMapped: false })
    ),
    h('mesh', { geometry: faceGeometry, position: [0, 0, -0.043], rotation: [0, Math.PI, 0] },
      h('meshBasicMaterial', { color: '#111d20', side: THREE.FrontSide })
    )
  );
}

function SkillRing({ selected }) {
  const ring = useRef(null);
  const animated = useRef({ angle: 0 });
  const textures = useMemo(() => DATA.map(makeLabel), []);
  useEffect(() => () => textures.forEach(texture => texture.dispose()), [textures]);
  useEffect(() => {
    const tween = gsap.to(animated.current, {
      angle: -STEP * selected,
      duration: 1.05,
      ease: 'power3.out',
      overwrite: true
    });
    return () => tween.kill();
  }, [selected]);
  useFrame(({ pointer, clock }, delta) => {
    if (!ring.current) return;
    ring.current.rotation.y = animated.current.angle + Math.sin(clock.elapsedTime * 0.33) * 0.017;
    ring.current.rotation.x = THREE.MathUtils.damp(ring.current.rotation.x, -0.065 - pointer.y * 0.055, 2, Math.min(delta, .05));
  });
  return h('group', { ref: ring },
    h('mesh', { rotation: [Math.PI / 2, 0, 0], position: [0, -0.85, 0] },
      h('torusGeometry', { args: [RADIUS, .014, 8, 160] }),
      h('meshBasicMaterial', { color: '#5a8f93', transparent: true, opacity: 0.33 })
    ),
    h('mesh', { rotation: [0.3, 0.2, 0] },
      h('icosahedronGeometry', { args: [1.09, 1] }),
      h('meshStandardMaterial', { color: '#253f47', metalness: .75, roughness: .22, wireframe: true, transparent: true, opacity: .72 })
    ),
    h('mesh',
      h('icosahedronGeometry', { args: [.6, 1] }),
      h('meshPhysicalMaterial', { color: '#448d8d', metalness: .63, roughness: .18, transparent: true, opacity: .48 })
    ),
    ...DATA.map((data, index) => h(SkillCard, { key: data.name, data, index, texture: textures[index] }))
  );
}

function SkillUniverse({ host, section }) {
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(document.visibilityState === 'visible');
  const pointer = useRef(null);
  const skill = DATA[selected];
  const move = direction => setSelected(value => (value + direction + COUNT) % COUNT);

  useEffect(() => {
    let inView = true;
    const refresh = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      refresh();
    }, { rootMargin: '120px 0px', threshold: 0 });
    observer.observe(section);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [section]);

  const onPointerDown = e => { if (e.pointerType === 'mouse' && e.button !== 0) return; pointer.current = e.clientX; };
  const onPointerUp = e => {
    if (pointer.current === null) return;
    const amount = e.clientX - pointer.current;
    pointer.current = null;
    if (Math.abs(amount) > 36) move(amount < 0 ? 1 : -1);
  };

  return h('div', {
    className: 'skills-3d-shell',
    onPointerDown, onPointerUp, onPointerCancel: () => { pointer.current = null; },
    onKeyDown: e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    },
    tabIndex: 0,
    'aria-label': 'Interactive 3D carousel of frontend skills. Use left and right arrow keys.'
  },
    h('div', { className: 'skills-3d-top', 'aria-hidden': true },
      h('span', null, 'THE TECH UNIVERSE'),
      h('span', null, '12 DISCIPLINES / ONE CRAFT')
    ),
    h('div', { className: 'skills-3d-stage', 'aria-hidden': true },
      h(Canvas, {
        camera: { position: [0, 1.1, 11.5], fov: 46, near: 0.1, far: 80 },
        dpr: [1, 1.3],
        frameloop: visible ? 'always' : 'never',
        gl: { alpha: true, antialias: true, powerPreference: 'low-power' },
        onCreated: ({ camera }) => {
          camera.lookAt(0, 0, 0);
          section.classList.add('skills-universe-ready');
        }
      },
        h('ambientLight', { intensity: 1.3 }),
        h('directionalLight', { position: [2, 5, 7], intensity: 2.3, color: '#d9ffff' }),
        h('pointLight', { position: [-4, 2, 3], intensity: 22, color: '#e6a963', distance: 12 }),
        h(SkillRing, { selected })
      )
    ),
    h('div', { className: 'skills-3d-status', 'aria-live': 'polite', 'aria-atomic': true },
      h('div', { className: 'skills-3d-status-top' },
        h('span', { className: 'skills-3d-dot', style: { background: skill.color } }),
        h('span', null, skill.tag),
        h('span', { className: 'skills-3d-count' }, String(selected + 1).padStart(2, '0') + ' / ' + COUNT)
      ),
      h('h3', null, skill.name),
      h('p', null, skill.detail)
    ),
    h('div', { className: 'skills-3d-controls' },
      h('span', null, 'DRAG THE CAROUSEL OR USE ARROWS'),
      h('div', null,
        h('button', { type: 'button', onClick: () => move(-1), 'aria-label': 'Previous skill' }, '←'),
        h('button', { type: 'button', onClick: () => move(1), 'aria-label': 'Next skill' }, '→')
      )
    )
  );
}

const section = document.getElementById('skills');
const host = document.getElementById('skillsUniverse');
if (section && host && window.WebGLRenderingContext) {
  const root = createRoot(host);
  root.render(h(SkillUniverse, { host, section }));
  window.addEventListener('pagehide', () => root.unmount(), { once: true });
}
