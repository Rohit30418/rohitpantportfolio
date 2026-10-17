/* Modern 2026 scroll reveals. No external libraries or continuous RAF loop.
   Progressive: content is always visible when this script does not run. */
(() => {
  'use strict';
  const root = document.body;
  if (!root || !root.classList.contains('agency-v2')) return;
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const groups = [
    ['.agency-about-copy', 0],
    ['.agency-about-art', 100],
    ['.agency-section-head', 0],
    ['.agency-project-card', 85],
    ['.agency-process-top', 0],
    // Keep 3D object anchors stationary; animating these cards caused a
    // visible offset against the shared WebGL overlay during scroll.
    ['.agency-skills-head', 0],
    ['.agency-skill', 35],
    ['.agency-experience-intro', 0],
    ['.agency-job', 90],
    ['.agency-contact-grid > div', 100]
  ];
  const seen = new Set();
  const targets = [];
  for (const [selector, stagger] of groups) {
    document.querySelectorAll(selector).forEach((node, index) => {
      if (seen.has(node)) return;
      seen.add(node);
      node.dataset.reveal = '';
      node.style.setProperty('--reveal-delay', (index % 5) * stagger + 'ms');
      targets.push(node);
    });
  }
  if (!targets.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => {
      if (!isIntersecting) return;
      target.classList.add('is-visible');
      observer.unobserve(target);
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -45px 0px'});
  // Only conceal below-the-fold elements, avoiding first-paint flashes.
  targets.forEach(node => {
    if (node.getBoundingClientRect().top < window.innerHeight * .93) {
      node.classList.add('is-visible');
    } else {
      observer.observe(node);
    }
  });
  root.classList.add('reveal-ready');
})();
