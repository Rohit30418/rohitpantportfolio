/* Interactive portfolio contact envelope + EmailJS.
   Works on GitHub Pages without a server or private credentials.
   Uses the official SDK when loaded and the official EmailJS REST API when CDN delivery fails. */
(() => {
  const stage = document.getElementById('contactEnvelopeStage');
  const toggle = document.getElementById('contactEnvelopeToggle');
  const letter = document.getElementById('contactEnvelopeLetter');
  const cta = document.getElementById('openContactEnvelope');
  const instruction = document.getElementById('contactEnvelopeInstruction');
  const form = document.getElementById('contactEnvelopeForm');
  const submit = document.getElementById('contactEnvelopeSubmit');
  const status = document.getElementById('contactEnvelopeStatus');
  if (!stage || !toggle || !letter || !form || !submit || !status) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const config = window.PORTFOLIO_EMAILJS || {};
  const configured = [config.serviceId, config.templateId, config.publicKey]
    .every(value => typeof value === 'string' && value.trim() && !value.startsWith('YOUR_'));
  const emailSDK = () => window.emailjs && typeof window.emailjs.sendForm === 'function';
  // The official EmailJS REST endpoint remains usable if the CDN SDK is blocked.
  // Public browser identifiers are sufficient; never send a private key.
  const isEmailJSReady = () => configured;
  const sendViaEmailJS = async () => {
    if (emailSDK()) {
      return window.emailjs.sendForm(config.serviceId, config.templateId, form, {
        publicKey: config.publicKey
      });
    }
    const data = new FormData(form);
    data.append('service_id', config.serviceId);
    data.append('template_id', config.templateId);
    data.append('user_id', config.publicKey);
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send-form', {
      method: 'POST',
      body: data,
      mode: 'cors'
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error('EmailJS API ' + response.status + ': ' + details.slice(0, 250));
    }
    return {status: response.status, text: await response.text()};
  };
  let sending = false;
  let lastSent = 0;

  const updateStatus = (message, type = '') => {
    status.textContent = message;
    status.dataset.state = type;
  };
  const configureAction = () => {
    const ready = isEmailJSReady();
    submit.textContent = ready ? 'Send message ↗' : 'Email setup unavailable';
    submit.disabled = !ready;
    if (!ready) updateStatus('Email sending is temporarily unavailable. Please use the direct email link below.', 'error');
  };
  configureAction();

  const ensureFormVisible = () => {
    stage.scrollIntoView({block:'start', behavior:reducedMotion?'auto':'smooth'});
  };
  const setOpen = (open) => {
    if (!open && sending) return;
    if (!open && letter.contains(document.activeElement)) toggle.focus({preventScroll:true});
    stage.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close the contact envelope' : 'Open the contact envelope');
    letter.setAttribute('aria-hidden', String(!open));
    letter.inert = !open;
    if (instruction) instruction.textContent = open ? 'Tap the envelope to close' : 'Tap the envelope to open';
    if (open) ensureFormVisible();
  };
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(!stage.classList.contains('is-open')));
  if (cta) {
    cta.setAttribute('aria-controls', 'contactEnvelopeLetter');
    cta.addEventListener('click', event => {
      event.preventDefault(); // Original mailto href remains a no-JS fallback.
      setOpen(true);
      toggle.focus({preventScroll:true});
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && stage.classList.contains('is-open') && !sending) {
      setOpen(false);
      toggle.focus({preventScroll:true});
    }
  });

  form.addEventListener('input', () => {
    if (status.dataset.state === 'error' || status.dataset.state === 'success') updateStatus('');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (form.elements.namedItem('company_website')?.value) {
      updateStatus('Thanks for getting in touch.', 'success');
      form.reset(); // Honeypot: do not send bot submissions.
      return;
    }

    const name = form.elements.namedItem('user_name').value.trim();
    const email = form.elements.namedItem('user_email').value.trim();
    const message = form.elements.namedItem('message').value.trim();
    if (!name || !email || !message) {
      updateStatus('Please enter your name, email and message.', 'error');
      return;
    }
    if (!isEmailJSReady()) {
      updateStatus('Email sending is temporarily unavailable. Please use the direct email link below.', 'error');
      return;
    }
    if (Date.now() - lastSent < 12000) {
      updateStatus('Please wait a few seconds before sending another message.', 'hint');
      return;
    }

    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    updateStatus('Sending your message…', 'hint');
    try {
      const result = await sendViaEmailJS();
      if (!result || result.status < 200 || result.status >= 300) {
        throw new Error('Email service did not confirm delivery');
      }
      lastSent = Date.now();
      form.reset();
      updateStatus('Message sent! I’ll get back to you soon.', 'success');
    } catch (error) {
      console.error('Portfolio contact form:', error?.text || error?.message || 'Email request failed');
      updateStatus('Could not send your message. Please try again or email me directly.', 'error');
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = isEmailJSReady() ? 'Send message ↗' : 'Email setup unavailable';
      submit.disabled = !isEmailJSReady();
    }
  });

  // Only pointer-device parallax, and never while editing the open form.
  if (finePointer && !reducedMotion) {
    let frame = 0;
    stage.addEventListener('pointermove', event => {
      if (stage.classList.contains('is-open') || sending) return;
      const rect = stage.getBoundingClientRect();
      const rotateY = -8 + ((event.clientX - rect.left)/rect.width - .5)*15;
      const rotateX = 5 - ((event.clientY - rect.top)/rect.height - .5)*10;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        stage.style.setProperty('--envelope-rotate-x', rotateX.toFixed(2)+'deg');
        stage.style.setProperty('--envelope-rotate-y', rotateY.toFixed(2)+'deg');
        frame = 0;
      });
    }, {passive:true});
    stage.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      stage.style.removeProperty('--envelope-rotate-x');
      stage.style.removeProperty('--envelope-rotate-y');
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      stage.classList.toggle('is-visible', entries[0].isIntersecting);
    }, {threshold:.06});
    observer.observe(stage);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stage.classList.remove('is-visible');
      else if (stage.getBoundingClientRect().top < innerHeight &&
          stage.getBoundingClientRect().bottom > 0) stage.classList.add('is-visible');
    });
  } else stage.classList.add('is-visible');
})();
