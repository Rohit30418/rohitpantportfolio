/**
 * Lightweight React atom for the existing static portfolio hero.
 * One canvas, shared geometries, no postprocessing, no continuous scroll work.
 * Loaded only after the existing intro on capable desktop devices.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const h = React.createElement;
const ellipse = new THREE.TorusGeometry(1.67, 0.035, 10, 144);
const electronGeo = new THREE.SphereGeometry(0.082, 12, 12);
const ringMaterial = new THREE.MeshStandardMaterial({
  color: '#7ce8ff',
  emissive: '#0f8eaa',
  emissiveIntensity: 0.62,
  metalness: 0.64,
  roughness: 0.2
});
const electronMaterial = new THREE.MeshBasicMaterial({ color: '#d6faff' });
const orbitAngles = [0, Math.PI / 3, -Math.PI / 3];

function ReactAtom({ pointer }) {
  const group = useRef(null);
  const electrons = useRef([]);
  const reveal = useRef({ scale: 0.74 });

  useEffect(() => {
    const intro = gsap.to(reveal.current, {
      scale: 1,
      duration: 1.65,
      ease: 'power3.out'
    });
    return () => intro.kill();
  }, []);

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const time = clock.getElapsedTime();
    const delta = Math.min(dt, 0.05);
    const targetY = -0.13 + Math.sin(time * 0.27) * 0.2 + pointer.current.x * 0.16;
    const targetX = -0.11 + pointer.current.y * -0.12;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.6, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 2.6, delta);
    group.current.rotation.z = Math.sin(time * 0.21) * 0.035;
    group.current.scale.setScalar(reveal.current.scale);

    for (let i = 0; i < electrons.current.length; i++) {
      const electron = electrons.current[i];
      if (!electron) continue;
      const t = time * (0.41 + i * 0.075) + i * 2.09;
      electron.position.set(Math.cos(t) * 1.67, Math.sin(t) * 1.67 * 0.43, 0.012);
    }
  });

  return h(Float, { speed: 0.8, floatIntensity: 0.17, rotationIntensity: 0.025 },
    h('group', { ref: group },
      h('mesh', null,
        h('icosahedronGeometry', { args: [0.39, 2] }),
        h('meshPhysicalMaterial', {
          color: '#86eaff',
          emissive: '#116a85',
          emissiveIntensity: 0.32,
          metalness: 0.32,
          roughness: 0.16,
          clearcoat: 0.9,
          clearcoatRoughness: 0.17
        })
      ),
      h('mesh', { scale: 1.23 },
        h('icosahedronGeometry', { args: [0.39, 1] }),
        h('meshBasicMaterial', {
          color: '#74e4ff',
          wireframe: true,
          transparent: true,
          opacity: 0.2,
          depthWrite: false
        })
      ),
      ...orbitAngles.map((angle, index) =>
        h('group', { key: index, rotation: [0.13, 0.07, angle] },
          h('mesh', {
            geometry: ellipse,
            material: ringMaterial,
            scale: [1, 0.43, 1]
          }),
          h('mesh', {
            ref: node => { electrons.current[index] = node; },
            geometry: electronGeo,
            material: electronMaterial
          })
        )
      )
    )
  );
}

function HeroCanvas({ host, hero }) {
  const pointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(!document.hidden);

  useEffect(() => {
    let intersecting = false;
    const syncVisibility = () => setActive(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      syncVisibility();
    }, { rootMargin: '100px 0px', threshold: 0 });
    observer.observe(hero);
    document.addEventListener('visibilitychange', syncVisibility);

    const move = event => {
      // Use viewport-normalized coordinates; don't force layout on every pointer move.
      pointer.current.x = THREE.MathUtils.clamp(event.clientX / Math.max(1, innerWidth) * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp(event.clientY / Math.max(1, innerHeight) * 2 - 1, -1, 1);
    };
    const reset = () => { pointer.current.x = 0; pointer.current.y = 0; };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset, { passive: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
    };
  }, [hero]);

  return h(Canvas, {
    camera: { position: [0, 0, 5.8], fov: 43 },
    dpr: [1, 1.1],
    frameloop: active ? 'always' : 'never',
    gl: { antialias: true, alpha: true, powerPreference: 'high-performance' },
    onCreated: () => {
      host.classList.add('is-mounted');
      hero.classList.add('has-react-object');
    },
    style: { pointerEvents: 'none', display: 'block' }
  },
    h('ambientLight', { intensity: 1.35 }),
    h('directionalLight', { position: [3, 3, 5], intensity: 2.1, color: '#efffff' }),
    h('pointLight', { position: [-3, -1, 2], intensity: 9, color: '#53d8f6', distance: 9 }),
    h(ReactAtom, { pointer })
  );
}

const host = document.getElementById('heroReact3D');
const hero = document.getElementById('home');
if (host && hero && window.WebGLRenderingContext) {
  const root = createRoot(host);
  root.render(h(HeroCanvas, { host, hero }));
  window.addEventListener('pagehide', event => {
    if (!event.persisted) root.unmount();
  }, { once: true });
}
