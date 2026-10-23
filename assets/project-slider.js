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
  const autoplayToggle = slider.querySelector('[data-project-autoplay]');
  if (!track || !previous || !next || !dots || !count || !autoplayToggle || cards.length < 2) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (value) => String(value).padStart(2, '0');
  const AUTO_INTERVAL = 4600;
  const INTERACTION_PAUSE = 8000;
  let points = [];
  let currentIndex = 0;
  let scheduled = false;
  let autoplayEnabled = !reducedMotion;
  let isHovered = false;
  let inViewport = !('IntersectionObserver' in window);
  let resumeAfter = 0;
  let autoplayTimer = null;

  function stopAutoplayTimer() {
    if (autoplayTimer !== null) window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }

  function focusWithinCarousel() {
    const active = document.activeElement;
    // The play/pause button may keep focus after users explicitly press Play.
    return !!(active && active !== autoplayToggle && slider.contains(active));
  }

  function canAutoplay() {
    return autoplayEnabled && inViewport && !isHovered &&
      !document.hidden && !focusWithinCarousel() && points.length > 1;
  }

  function scheduleAutoplay() {
    stopAutoplayTimer();
    if (!canAutoplay()) return;
    const pauseLeft = Math.max(0, resumeAfter - Date.now());
    autoplayTimer = window.setTimeout(() => {
      autoplayTimer = null;
      if (!canAutoplay()) return;
      if (Date.now() < resumeAfter) {
        scheduleAutoplay();
        return;
      }
      // Once we reach the last page, return to the beginning and repeat.
      moveTo((activePage() + 1) % points.length);
      scheduleAutoplay();
    }, Math.max(AUTO_INTERVAL, pauseLeft));
  }

  function pauseAfterInteraction() {
    resumeAfter = Date.now() + INTERACTION_PAUSE;
    scheduleAutoplay();
  }

  function syncAutoplayToggle() {
    autoplayToggle.setAttribute('aria-pressed', String(autoplayEnabled));
    autoplayToggle.setAttribute('aria-label', autoplayEnabled ?
      'Pause automatic project scrolling' : 'Play automatic project scrolling');
    autoplayToggle.title = autoplayEnabled ? 'Pause auto-scroll' : 'Play auto-scroll';
    const icon = autoplayToggle.querySelector('i');
    if (icon) icon.className = autoplayEnabled ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    // Avoid screen reader announcements every time autoplay advances a slide.
    count.setAttribute('aria-live', autoplayEnabled ? 'off' : 'polite');
  }

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
      dot.addEventListener('click', () => {
        pauseAfterInteraction();
        moveTo(index);
      });
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
    scheduleAutoplay();
  }

  previous.addEventListener('click', () => {
    pauseAfterInteraction();
    moveTo(activePage() - 1);
  });
  next.addEventListener('click', () => {
    pauseAfterInteraction();
    moveTo(activePage() + 1);
  });

  autoplayToggle.addEventListener('click', () => {
    autoplayEnabled = !autoplayEnabled;
    resumeAfter = 0;
    syncAutoplayToggle();
    scheduleAutoplay();
  });

  // Native swipe and manual scroll take priority over timed slides.
  track.addEventListener('pointerdown', pauseAfterInteraction, {passive:true});
  track.addEventListener('touchstart', pauseAfterInteraction, {passive:true});
  track.addEventListener('wheel', pauseAfterInteraction, {passive:true});

  slider.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAutoplayTimer();
  });
  slider.addEventListener('mouseleave', () => {
    isHovered = false;
    scheduleAutoplay();
  });
  slider.addEventListener('focusin', stopAutoplayTimer);
  slider.addEventListener('focusout', scheduleAutoplay);
  document.addEventListener('visibilitychange', scheduleAutoplay);
  window.addEventListener('pagehide', stopAutoplayTimer);
  window.addEventListener('pageshow', scheduleAutoplay);

  if ('IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target !== slider) return;
        inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        scheduleAutoplay();
      });
    }, {threshold:[0,0.15,0.4]});
    visibilityObserver.observe(slider);
  }

  track.addEventListener('keydown', (event) => {
    // Don't hijack keyboard interaction within project links.
    if (event.target !== track) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      pauseAfterInteraction();
      moveTo(activePage() + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      pauseAfterInteraction();
      moveTo(activePage() - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      pauseAfterInteraction();
      moveTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      pauseAfterInteraction();
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
  syncAutoplayToggle();
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
