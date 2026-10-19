/* Contact envelope: progressive enhancement for the existing mailto CTA.
   CSS shapes only; no new canvas or animation runtime. */
(() => {
  const stage = document.getElementById('contactEnvelopeStage');
  const toggle = document.getElementById('contactEnvelopeToggle');
  const letter = document.getElementById('contactEnvelopeLetter');
  const cta = document.getElementById('openContactEnvelope');
  const instruction = document.getElementById('contactEnvelopeInstruction');
  if (!stage || !toggle || !letter) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;

  const setOpen = (open) => {
    stage.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close the message envelope' : 'Open the message envelope');
    letter.setAttribute('aria-hidden', String(!open));
    letter.inert = !open;
    if (instruction) instruction.textContent = open ? 'Tap the envelope to close' : 'Tap the envelope to open';
  };

  setOpen(false);
  toggle.addEventListener('click', () => setOpen(!stage.classList.contains('is-open')));
  if (cta) {
    cta.setAttribute('aria-controls', 'contactEnvelopeLetter');
    cta.addEventListener('click', (event) => {
      // Without JavaScript the link remains a working mailto: link.
      event.preventDefault();
      setOpen(true);
      stage.scrollIntoView({block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth'});
      toggle.focus({preventScroll: true});
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && stage.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus({preventScroll: true});
    }
  });

  if (finePointer && !reducedMotion) {
    let frame = 0;
    let rotateX = 5;
    let rotateY = -8;
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      rotateY = -8 + ((event.clientX - rect.left) / rect.width - .5) * 15;
      rotateX = 5 - ((event.clientY - rect.top) / rect.height - .5) * 10;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        stage.style.setProperty('--envelope-rotate-x', rotateX.toFixed(2) + 'deg');
        stage.style.setProperty('--envelope-rotate-y', rotateY.toFixed(2) + 'deg');
        frame = 0;
      });
    }, {passive: true});
    stage.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      stage.style.removeProperty('--envelope-rotate-x');
      stage.style.removeProperty('--envelope-rotate-y');
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      stage.classList.toggle('is-visible', entries[0].isIntersecting);
    }, {threshold: .06});
    observer.observe(stage);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stage.classList.remove('is-visible');
      else if (stage.getBoundingClientRect().top < innerHeight && stage.getBoundingClientRect().bottom > 0) stage.classList.add('is-visible');
    });
  } else stage.classList.add('is-visible');
})();
