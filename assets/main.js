(() => {
  document.documentElement.classList.add('js');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.getElementById('join-form');
  if (!form) return;
  const panels = [...form.querySelectorAll('.form-panel')];
  const progress = [...document.querySelectorAll('.progress-segment')];
  const interestChecks = [...form.querySelectorAll('#interest-chips input[type="checkbox"]')];
  const interestHidden = document.getElementById('interests-hidden');
  const interestError = document.getElementById('interests-error');
  const sensitiveConsent = document.getElementById('sensitive-consent');
  const sensitiveFields = document.getElementById('sensitive-fields');

  const setStep = (step) => {
    panels.forEach((panel, index) => { panel.hidden = index !== step - 1; });
    progress.forEach((segment, index) => { segment.classList.toggle('current', index < step); });
    const formCard = form.closest('.form-card');
    if (formCard && step === 2 && window.innerWidth < 761) formCard.scrollIntoView({behavior: 'smooth', block: 'start'});
    if (step === 2) { const title = panels[1].querySelector('.panel-title'); if (title) title.setAttribute('tabindex','-1'),title.focus({preventScroll:true}); }
  };
  setStep(1);

  const syncInterests = () => {
    const selected = interestChecks.filter(ch => ch.checked).map(ch => ch.value);
    interestHidden.value = selected.join(', ');
    interestError.hidden = selected.length > 0;
    return selected.length > 0;
  };
  interestChecks.forEach(ch => ch.addEventListener('change', syncInterests));

  const requiredStepOne = ['full_name', 'whatsapp', 'city', 'reason'].map(id => document.getElementById(id));
  const validateFirstStep = () => {
    for (const field of requiredStepOne) {
      if (!field.checkValidity()) { field.reportValidity(); field.focus(); return false; }
    }
    if (!syncInterests()) { interestChecks[0].focus(); return false; }
    return true;
  };

  form.querySelector('.next-step')?.addEventListener('click', () => { if (validateFirstStep()) setStep(2); });
  form.querySelector('.back-step')?.addEventListener('click', () => setStep(1));
  sensitiveConsent.addEventListener('change', () => {
    const enabled = sensitiveConsent.checked;
    sensitiveFields.hidden = !enabled;
    sensitiveFields.querySelectorAll('select').forEach(select => {
      select.disabled = !enabled;
      if (!enabled) select.value = '';
    });
  });

  // Capture only simple first-party campaign tags included in the joining URL.
  const qp = new URLSearchParams(location.search);
  const campaignFields = [
    ['utm_source', 'utm-source'],
    ['utm_campaign', 'utm-campaign'],
    ['ref', 'referrer-code'],
  ];
  campaignFields.forEach(([queryKey, elementId]) => {
    const value = qp.get(queryKey) || '';
    document.getElementById(elementId).value = value.slice(0, 80).replace(/[^\w .-]/g, '');
  });

  form.addEventListener('submit', event => {
    if (!validateFirstStep()) { event.preventDefault(); setStep(1); return; }
    if (!form.checkValidity()) { event.preventDefault(); form.reportValidity(); return; }
    syncInterests();
    const submit = form.querySelector('.submit-button');
    if (submit) { submit.disabled = true; submit.textContent = 'Submitting…'; }
    // The browser's normal POST preserves Netlify's built-in form handling and thank-you redirect.
  });
})();