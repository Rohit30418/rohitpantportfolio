/* Motion enhancements for the static portfolio.
   Zero libraries, no persistent RAF loop, no scroll event handlers. */
(() => {
  'use strict';
  const root = document.body;
  if (!root || !root.classList.contains('agency-v2')) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;
  if (reduceMotion || saveData || lowMemory || !('IntersectionObserver' in window)) return;

  root.classList.add('motion-enhanced');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const hero = document.getElementById('home');

  // Preserve the existing headline markup and Instrument Serif emphasis.
  // Text masks are added only once, and words remain selectable/accessibile.
  function splitHeadline() {
    const title = document.getElementById('agencyHeroTitle');
    if (!title || title.dataset.motionSplit === 'true') return [];
    title.dataset.motionSplit = 'true';
    const lines = title.querySelectorAll(':scope > span');
    const words = [];
    lines.forEach((line) => {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        const tokens = node.textContent.match(/\s+|\S+/g) || [];
        const fragment = document.createDocumentFragment();
        tokens.forEach((token) => {
          if (/^\s+$/.test(token)) {
            fragment.appendChild(document.createTextNode(token));
            return;
          }
          const mask = document.createElement('b');
          const ink = document.createElement('i');
          mask.className = 'motion-word';
          ink.className = 'motion-word-ink';
          ink.textContent = token;
          mask.appendChild(ink);
          fragment.appendChild(mask);
          words.push(ink);
        });
        node.replaceWith(fragment);
      });
    });
    return words;
  }

  let heroPlayed = false;
  function playHero() {
    if (heroPlayed || !hero) return;
    heroPlayed = true;
    if (window.scrollY > hero.offsetHeight) return;
    const words = splitHeadline();
    if (!Element.prototype.animate) return;
    words.forEach((word, index) => {
      word.animate([
        {opacity:0, transform:'translate3d(0,110%,0)'},
        {opacity:1, transform:'translate3d(0,0,0)'}
      ], {duration:860, delay:100 + index * 95, easing:ease, fill:'backwards'});
    });
    const secondary = hero.querySelectorAll('.agency-eyebrow,.agency-hero-lede,.agency-hero-ctas,.agency-hero-metrics');
    secondary.forEach((node,index) => {
      node.animate([
        {opacity:0,transform:'translate3d(0,19px,0)'},
        {opacity:1,transform:'translate3d(0,0,0)'}
      ], {duration:800,delay:100 + index * 135,easing:ease,fill:'backwards'});
    });
  }
  if (document.documentElement.classList.contains('intro-playing')) {
    document.addEventListener('portfolio:intro-ended', playHero, {once:true});
  } else {
    playHero();
  }

  // Layered section entrances run once as content enters the viewport.
  // Sections are not pinned, so smooth scrolling and mobile flow stay native.
  const sections = document.querySelectorAll('.agency-about,.agency-work,.agency-skills,.agency-experience,.agency-contact');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('motion-layer--pending');
      entry.target.classList.add('motion-layer--visible');
      sectionObserver.unobserve(entry.target);
    });
  }, {threshold:0.06,rootMargin:'0px 0px -42px 0px'});

  sections.forEach((section) => {
    if (!section.querySelector(':scope > .shell')) return;
    section.classList.add('motion-layer');
    const rule = document.createElement('span');
    rule.className = 'motion-chapter-rule';
    rule.setAttribute('aria-hidden','true');
    section.prepend(rule);
    if (section.getBoundingClientRect().top > window.innerHeight * .92) {
      section.classList.add('motion-layer--pending');
      sectionObserver.observe(section);
    } else {
      section.classList.add('motion-layer--visible');
    }
  });

  // Only the hovered card gets pointer tracking; no global mouse listener.
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const cards = document.querySelectorAll('#work .agency-project-grid .agency-project-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      card.classList.remove('motion-card--pending');
      cardObserver.unobserve(card);
      if (Element.prototype.animate) {
        const index = Number(card.dataset.motionIndex || 0);
        card.animate([
          {opacity:0,transform:'translate3d(0,30px,0)'},
          {opacity:1,transform:'translate3d(0,0,0)'}
        ],{duration:750,delay:index * 95,easing:ease,fill:'backwards'});
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -30px 0px'});

  cards.forEach((card,index) => {
    card.classList.add('motion-card');
    card.dataset.motionIndex = String(index);
    if (card.getBoundingClientRect().top > window.innerHeight * .9) {
      card.classList.add('motion-card--pending');
      cardObserver.observe(card);
    }
    if (!finePointer) return;
    let frame = 0;
    let px = 0, py = 0;
    const paintTilt = () => {
      frame = 0;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(-1,Math.min(1,((px - rect.left) / rect.width - .5) * 2));
      const y = Math.max(-1,Math.min(1,((py - rect.top) / rect.height - .5) * 2));
      card.style.setProperty('--motion-rx',(y * -2.3).toFixed(2) + 'deg');
      card.style.setProperty('--motion-ry',(x * 2.8).toFixed(2) + 'deg');
    };
    card.addEventListener('pointermove',(event) => {
      if (event.pointerType !== 'mouse') return;
      px = event.clientX;py = event.clientY;
      if (!frame) frame = requestAnimationFrame(paintTilt);
    },{passive:true});
    const resetTilt = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--motion-rx');
      card.style.removeProperty('--motion-ry');
    };
    card.addEventListener('pointerleave',resetTilt);
    card.addEventListener('focusout',(event) => {
      if (!card.contains(event.relatedTarget)) resetTilt();
    });
  });
})();
