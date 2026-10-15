/**
 * Three.js / React Three Fiber island for rohitpant.in.
 * Loads only after intro on capable desktop devices; static portfolio stays usable.
 */
import React, { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const h = React.createElement;
const motion = { intro: 0, scroll: 0 };
const clamp = (n) => Math.min(1, Math.max(0, n));

function OrbitSculpture() {
  const rig = useRef(null);
  const core = useRef(null);
  const halo = useRef(null);

  useFrame((_state, dt) => {
    const delta = Math.min(dt, 0.05);
    if (!rig.current) return;
    rig.current.rotation.y += delta * 0.13;
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, -0.23 + motion.scroll * 0.72, 2.1, delta);
    rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, -0.18 + motion.scroll * 0.24, 2, delta);
    rig.current.scale.setScalar(0.66 + motion.intro * 0.34);
    if (core.current) core.current.rotation.y -= delta * 0.12;
    if (halo.current) halo.current.rotation.z += delta * 0.055;
  });

  return h(Float, { speed: 0.85, rotationIntensity: 0.08, floatIntensity: 0.22 },
    h('group', { ref: rig, rotation: [-0.23, 0, -0.18], scale: 0.66 },
      h('mesh', { ref: core },
        h('icosahedronGeometry', { args: [1.1, 2] }),
        h('meshPhysicalMaterial', { color: '#879b98', metalness: 0.77, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.18, flatShading: true })
      ),
      h('mesh', { scale: 1.16 },
        h('icosahedronGeometry', { args: [1.1, 1] }),
        h('meshBasicMaterial', { color: '#83e9e5', wireframe: true, transparent: true, opacity: 0.15 })
      ),
      h('group', { ref: halo },
        h('mesh', { rotation: [1.13, 0.12, 0.4] },
          h('torusGeometry', { args: [1.73, 0.026, 8, 160] }),
          h('meshStandardMaterial', { color: '#31daf3', metalness: 0.82, roughness: 0.18, emissive: '#074a59', emissiveIntensity: 0.32 })
        ),
        h('mesh', { rotation: [-0.66, 0.44, -0.64] },
          h('torusGeometry', { args: [1.98, 0.019, 8, 160] }),
          h('meshStandardMaterial', { color: '#f3b66c', metalness: 0.83, roughness: 0.2, emissive: '#4f2707', emissiveIntensity: 0.28 })
        ),
        h('mesh', { rotation: [0.5, 1.07, 0.92] },
          h('torusGeometry', { args: [2.24, 0.009, 6, 160] }),
          h('meshBasicMaterial', { color: '#bcfaff', transparent: true, opacity: 0.34 })
        )
      ),
      h('mesh', { position: [1.65, 0.78, 0.2] },
        h('sphereGeometry', { args: [0.062, 8, 8] }),
        h('meshBasicMaterial', { color: '#ffe5ab' })
      )
    )
  );
}

function Scene({ host, hero }) {
  const [active, setActive] = useState(document.visibilityState === 'visible');

  useEffect(() => {
    let withinView = true;
    const refresh = () => setActive(withinView && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => {
      withinView = entry.isIntersecting;
      refresh();
    }, { rootMargin: '80px 0px', threshold: 0 });
    observer.observe(hero);
    document.addEventListener('visibilitychange', refresh);

    const quickScroll = gsap.quickTo(motion, 'scroll', { duration: 0.55, ease: 'power2.out' });
    let scheduled = false;
    const onScroll = () => {
      if (scheduled || !withinView) return;
      scheduled = true;
      requestAnimationFrame(() => {
        quickScroll(clamp(-hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1)));
        scheduled = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const reveal = gsap.fromTo(motion, { intro: 0 }, { intro: 1, duration: 1.65, ease: 'power3.out' });
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('scroll', onScroll);
      quickScroll.tween?.kill();
      reveal.kill();
    };
  }, [host, hero]);

  return h(Canvas, {
    camera: { position: [0, 0, 6.8], fov: 46 },
    dpr: [1, 1.25],
    frameloop: active ? 'always' : 'never',
    gl: { alpha: true, antialias: true, powerPreference: 'low-power' },
    onCreated: () => host.classList.add('is-mounted'),
    style: { pointerEvents: 'none' }
  },
    h('ambientLight', { intensity: 1.45 }),
    h('directionalLight', { position: [3, 4, 5], intensity: 2.6, color: '#d2faff' }),
    h('pointLight', { position: [-3, -1, 3], intensity: 35, color: '#f3ac6a', distance: 10 }),
    h(OrbitSculpture)
  );
}

const host = document.getElementById('orbitHeroScene');
const hero = document.getElementById('home');
if (host && hero) {
  const app = createRoot(host);
  app.render(h(Scene, { host, hero }));
  window.addEventListener('pagehide', () => app.unmount(), { once: true });
}
