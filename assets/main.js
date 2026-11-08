(() => {
  document.documentElement.classList.add('js');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Directly opening a confirmation page must not imply that anything was sent.
  const confirmation = document.querySelector('[data-confirmation]');
  if (confirmation) {
    let received = false;
    try {
      const timestamp = Number(sessionStorage.getItem(`spheres:${confirmation.dataset.confirmation}`));
      received = timestamp > 0 && Date.now() - timestamp < 30 * 60 * 1000;
    } catch { /* Retain the honest default if browser storage is unavailable. */ }
    confirmation.querySelector('[data-receipt]').hidden = !received;
    confirmation.querySelector('[data-no-receipt]').hidden = received;
  }

  const form = document.getElementById('join-form');
  if (form) {
    // Validate the visible step ourselves so Enter cannot target hidden required fields.
    form.noValidate = true;
    const panels = [...form.querySelectorAll('.form-panel')];
    const progress = document.querySelector('.form-progress');
    const segments = [...progress.querySelectorAll('.progress-segment')];
    const interestChecks = [...form.querySelectorAll('#interest-chips input')];
    const interestHidden = document.getElementById('interests-hidden');
    const interestError = document.getElementById('interests-error');
    const sensitiveConsent = document.getElementById('sensitive-consent');
    const sensitiveFields = document.getElementById('sensitive-fields');
    const name = document.getElementById('full_name');
    const phone = document.getElementById('whatsapp');
    let currentStep = 1;
    const setStep = (step, focus = true) => {
      currentStep = step;
      panels.forEach((panel, index) => { panel.hidden = index !== step - 1; });
      segments.forEach((segment, index) => segment.classList.toggle('current', index < step));
      progress.setAttribute('aria-label', `Registration step ${step} of 2`);
      if (focus) {
        const title = panels[step - 1].querySelector('.panel-title');
        title.tabIndex = -1;
        title.focus({preventScroll: true});
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        form.closest('.form-card').scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
      }
    };
    const syncSensitive = () => {
      const enabled = sensitiveConsent.checked;
      sensitiveFields.hidden = !enabled;
      sensitiveFields.querySelectorAll('select').forEach(select => {
        select.disabled = !enabled;
        if (!enabled) select.value = '';
      });
    };
    const syncInterests = (showError = true) => {
      const selected = interestChecks.filter(input => input.checked).map(input => input.value);
      interestHidden.value = selected.join(', ');
      interestError.hidden = !showError || selected.length > 0;
      interestChecks.forEach(input => input.setAttribute('aria-invalid', String(showError && !selected.length)));
      return selected.length > 0;
    };
    const validateBasics = () => {
      name.setCustomValidity(name.value.trim() ? '' : 'Enter your name.');
      const digits = phone.value.replace(/\D/g, '');
      const valid = /^\+?[\d ()-]+$/.test(phone.value.trim()) && digits.length >= 8 && digits.length <= 15;
      phone.setCustomValidity(valid ? '' : 'Enter a WhatsApp number with 8 to 15 digits, including the country code if outside Zimbabwe.');
      const invalid = [...panels[0].querySelectorAll('input,select')].find(field => !field.checkValidity());
      if (invalid) {
        setStep(1, false);
        invalid.focus();
        invalid.reportValidity();
        return false;
      }
      if (!syncInterests()) {
        setStep(1, false);
        interestChecks[0].focus();
        return false;
      }
      return true;
    };
    [name, phone].forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
    interestChecks.forEach(input => input.addEventListener('change', () => syncInterests()));
    sensitiveConsent.addEventListener('change', syncSensitive);
    form.querySelector('.next-step').addEventListener('click', () => { if (validateBasics()) setStep(2); });
    form.querySelector('.back-step').addEventListener('click', () => setStep(1));
    const qp = new URLSearchParams(location.search);
    [['utm_source','utm-source'],['utm_campaign','utm-campaign'],['ref','referrer-code']].forEach(([key,id]) => {
      document.getElementById(id).value = (qp.get(key) || '').slice(0, 80).replace(/[^\w .-]/g, '');
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateBasics()) return;
      if (currentStep === 1) { setStep(2); return; }
      if (!form.reportValidity()) return;
      syncSensitive();
      syncInterests();
      sendForm(form);
    });
    const restore = () => {
      syncSensitive();
      syncInterests(false);
      const button = form.querySelector('[type="submit"]');
      button.disabled = false;
      button.textContent = 'Join Spheres ↗';
    };
    setStep(1, false);
    restore();
    window.addEventListener('pageshow', restore);
  }

  const privacyForm = document.querySelector('form[name="privacy-requests"]');
  if (privacyForm) {
    privacyForm.noValidate = true;
    const email = document.getElementById('contact-email');
    const phone = document.getElementById('privacy-whatsapp');
    const name = document.getElementById('contact-name');
    const message = document.getElementById('contact-message');
    [email, phone, name, message].forEach(input => input.addEventListener('input', () => {
      input.setCustomValidity('');
      email.setCustomValidity('');
    }));
    privacyForm.addEventListener('submit', event => {
      event.preventDefault();
      name.setCustomValidity(name.value.trim() ? '' : 'Enter your name.');
      message.setCustomValidity(message.value.trim() ? '' : 'Enter your request.');
      email.setCustomValidity(email.value.trim() || phone.value.trim() ? '' : 'Give an email address or WhatsApp number so we can reply.');
      const digits = phone.value.replace(/\D/g, '');
      const validPhone = !phone.value.trim() || (/^\+?[\d ()-]+$/.test(phone.value.trim()) && digits.length >= 8 && digits.length <= 15);
      phone.setCustomValidity(validPhone ? '' : 'Enter a WhatsApp number with 8 to 15 digits.');
      if (privacyForm.reportValidity()) sendForm(privacyForm);
    });
  }

  async function sendForm(target) {
    const button = target.querySelector('[type="submit"]');
    if (button.disabled) return;
    const status = target.querySelector('[data-form-status]');
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.hidden = false;
    status.textContent = 'Sending your details…';
    let timedOut = false;
    const controller = new AbortController();
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 25000);
    try {
      const body = new URLSearchParams();
      const values = new FormData(target);
      for (const [key,value] of values) body.append(key, value);
      // Recheck at serialization, including after browser back/forward restoration.
      if (target.getAttribute('name') === 'spheres-members' && !values.has('sensitive_consent')) {
        ['age_band','relationship_status','work_situation','event_budget'].forEach(key => body.delete(key));
      }
      const response = await fetch(target.getAttribute('action'), {
        method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: body.toString(), signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      try { sessionStorage.setItem(`spheres:${target.getAttribute('name')}`, String(Date.now())); }
      catch {
        status.textContent = target.getAttribute('name') === 'spheres-members'
          ? 'Registration sent. We will be in touch as the first gatherings take shape. No events are on sale yet.'
          : 'Privacy request sent. The founding team will review it.';
        button.textContent = 'Sent';
        return;
      }
      window.location.assign(target.getAttribute('action'));
    } catch {
      status.textContent = timedOut
        ? 'We could not confirm receipt. Your details are still here. Please wait before trying again to avoid a duplicate.'
        : 'We could not confirm receipt. Your details are still here. Check your connection and try again.';
      button.disabled = false;
      button.textContent = original;
    } finally { clearTimeout(timer); }
  }
})();
