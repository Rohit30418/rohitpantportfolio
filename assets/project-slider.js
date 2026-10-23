/* Lightweight featured-project carousel: native horizontal scrolling, with accessible controls.
   Grid fallback remains usable if JavaScript does not execute. */
(() => {
  'use strict';

  const slider = document.querySelector('[data-project-slider]');
  if (!slider) return;

  const track = slider.querySelector('.project-slider-track');
  const cards = Array.from(track ? track.querySelectorAll(':scope > .agency-project-card') : []);
  const previous = slider.querySelector('[data-project-prev]');
  const next = slider.querySelector('[data-project-next]');
  const dots = slider.querySelector('[data-project-dots]');
  const count = slider.querySelector('[data-project-count]');
  if (!track || !previous || !next || !dots || !count || cards.length < 2) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (value) => String(value).padStart(2, '0');
  let points = [];
  let currentIndex = 0;
  let scheduled = false;

  function pagePositions() {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const anchor = cards[0].getBoundingClientRect().left;
    const result = [0];
    cards.slice(1).forEach((card) => {
      const target = Math.max(0, Math.min(max, card.getBoundingClientRect().left - anchor));
      if (target - result[result.length - 1] > 12) result.push(target);
    });
    if (max - result[result.length - 1] > 12) result.push(max);
    return result;
  }

  function activePage() {
    if (!points.length) return 0;
    return points.reduce((best, point, index) =>
      Math.abs(point - track.scrollLeft) < Math.abs(points[best] - track.scrollLeft)
        ? index : best, 0);
  }

  function syncControls() {
    currentIndex = activePage();
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === points.length - 1;
    count.innerHTML = pad(currentIndex + 1) +
      ' <span class="project-slider-count-total">/ ' + pad(points.length) + '</span>';
    Array.from(dots.children).forEach((dot, index) => {
      if (index === currentIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function moveTo(index, smooth = true) {
    if (!points.length) return;
    const destination = Math.max(0, Math.min(points.length - 1, index));
    track.scrollTo({
      left: points[destination],
      behavior: smooth && !reducedMotion ? 'smooth' : 'auto'
    });
    // Update immediately for keyboard/pointer feedback; native scroll keeps it in sync.
    currentIndex = destination;
    previous.disabled = destination === 0;
    next.disabled = destination === points.length - 1;
  }

  function buildDots() {
    dots.replaceChildren();
    points.forEach((point, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'project-slider-dot';
      dot.setAttribute('aria-label', 'Go to project slide ' + (index + 1) + ' of ' + points.length);
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => moveTo(index));
      dots.appendChild(dot);
    });
  }

  function recalculate() {
    const previousCount = points.length;
    const progress = previousCount > 1 ? currentIndex / (previousCount - 1) : 0;
    points = pagePositions();
    if (dots.children.length !== points.length) buildDots();
    const targetIndex = Math.min(points.length - 1, Math.round(progress * (points.length - 1)));
    // Resizing can change the number of cards shown; preserve approximate carousel progress.
    track.scrollTo({left: points[targetIndex] || 0, behavior: 'auto'});
    syncControls();
  }

  previous.addEventListener('click', () => moveTo(activePage() - 1));
  next.addEventListener('click', () => moveTo(activePage() + 1));

  track.addEventListener('keydown', (event) => {
    // Don't hijack keyboard interaction within project links.
    if (event.target !== track) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveTo(activePage() + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveTo(activePage() - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveTo(points.length - 1);
    }
  });

  track.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncControls();
    });
  }, {passive:true});

  slider.classList.add('is-ready');
  recalculate();
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      // Avoid resize loops: only recalc when track width or card width actually changes.
      const key = track.clientWidth + ':' + cards[0].getBoundingClientRect().width;
      if (resizeObserver._lastKey === key) return;
      resizeObserver._lastKey = key;
      recalculate();
    });
    resizeObserver.observe(track);
    resizeObserver.observe(cards[0]);
  } else {
    window.addEventListener('resize', recalculate, {passive:true});
  }
})();
