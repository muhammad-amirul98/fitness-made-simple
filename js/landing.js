// Coach photo (opt-in via SHOW_COACH_PHOTO in js/config.js)
if (typeof SHOW_COACH_PHOTO !== 'undefined' && SHOW_COACH_PHOTO){
  const aboutGrid = document.getElementById('aboutGrid');
  const photoSlot = document.getElementById('aboutPhotoSlot');
  if (aboutGrid && photoSlot){
    aboutGrid.classList.add('has-photo');
    const img = document.createElement('img');
    img.src = 'assets/coach-gym.jpg';
    img.alt = 'Personal trainer at Fitness Made Simple SG coaching in a Singapore gym';
    img.loading = 'lazy';
    img.className = 'about-photo-img';
    photoSlot.appendChild(img);
  }
}

// Offering visibility flags (SHOW_ONLINE_COACHING / SHOW_EXTERNAL_TRAINING / SHOW_STUDIO_TRAINING in js/config.js)
const flagDefault = (name) => typeof window[name] !== 'undefined' ? window[name] : true;
const offeringFlags = {
  online: flagDefault('SHOW_ONLINE_COACHING'),
  external: flagDefault('SHOW_EXTERNAL_TRAINING'),
  studio: flagDefault('SHOW_STUDIO_TRAINING'),
};
['tier-online', 'included-online'].forEach(id => { if (!offeringFlags.online) document.getElementById(id)?.remove(); });
['tier-external', 'included-external'].forEach(id => { if (!offeringFlags.external) document.getElementById(id)?.remove(); });
['tier-studio', 'included-studio'].forEach(id => { if (!offeringFlags.studio) document.getElementById(id)?.remove(); });
document.querySelectorAll('select[name="package"] option[data-offering]').forEach(opt => {
  if (!offeringFlags[opt.dataset.offering]) opt.remove();
});

// Session package pricing (External Training / Studio Training) — every 10
// sessions beyond the first pack of 10 adds one free bonus session.
document.querySelectorAll('.package-select').forEach(select => {
  const card = select.closest('.price-card');
  const totalEl = card?.querySelector('.package-total');
  const countEl = card?.querySelector('.package-count');
  const detailEl = card?.querySelector('.package-detail');
  const basePrice = Number(select.dataset.basePrice);
  const update = () => {
    const sessions = Number(select.value);
    const freeSessions = sessions >= 20 ? Math.floor(sessions / 10) - 1 : 0;
    const paidSessions = sessions - freeSessions;
    const total = paidSessions * basePrice;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('en-US')}`;
    if (countEl) countEl.textContent = `for ${sessions} sessions`;
    if (detailEl){
      detailEl.textContent = freeSessions > 0
        ? `$${basePrice}/session — ${freeSessions} free`
        : `$${basePrice}/session`;
    }
  };
  select.addEventListener('change', update);
  update();
});

// External Training location field — only shown when that package is selected
document.querySelectorAll('select[name="package"]').forEach(select => {
  const form = select.closest('form');
  const locationField = form?.querySelector('[data-location-field]');
  if (!locationField) return;
  const locationSelect = locationField.querySelector('select[name="location"]');
  const syncLocationField = () => {
    const isExternal = select.value.startsWith('External Training');
    locationField.style.display = isExternal ? '' : 'none';
    if (locationSelect){
      locationSelect.required = isExternal;
      if (!isExternal) locationSelect.value = '';
    }
  };
  select.addEventListener('change', syncLocationField);
  syncLocationField();
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

function showToast(message, type = 'success'){
  let toast = document.querySelector('.toast');
  if (!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast-icon">✓</span><span class="toast-text"></span>';
    document.body.appendChild(toast);
  }
  toast.classList.remove('error');
  if (type === 'error'){
    toast.classList.add('error');
    toast.querySelector('.toast-icon').textContent = '!';
  } else {
    toast.querySelector('.toast-icon').textContent = '✓';
  }
  toast.querySelector('.toast-text').textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// WhatsApp click tracking
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag === 'function'){
      gtag('event', 'contact_whatsapp');
    }
  });
});

// Lead form submission -> Google Sheet via Apps Script
document.querySelectorAll('form[data-lead-form]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = form.querySelector('.form-note');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!CONTACT_ENDPOINT){
      if (note) note.textContent = "Form isn't connected yet — see README to finish setup.";
      return;
    }

    const formData = new FormData(form);
    const email = (formData.get('email') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();

    if (!email && !phone){
      if (note) note.textContent = "Please add your email or phone number.";
      showToast("Please add your email or phone number.", 'error');
      return;
    }

    const data = {};
    for (const key of new Set(formData.keys())){
      const values = formData.getAll(key);
      data[key] = values.length > 1 ? values.join(', ') : values[0];
    }
    data.formType = form.dataset.leadForm || '';

    if (submitBtn) submitBtn.disabled = true;
    if (note) note.textContent = "Sending...";

    try {
      await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors', // Apps Script web apps don't return CORS headers
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data),
      });
      if (note) note.textContent = "Thanks — I'll be in touch within 24 hours.";
      showToast("Message sent — I'll be in touch within 24 hours.");
      if (typeof gtag === 'function'){
        gtag('event', 'generate_lead', { form_type: form.dataset.leadForm || '' });
      }
      form.reset();
    } catch (err) {
      if (note) note.textContent = "Something went wrong — try again, or email directly.";
      showToast("Something went wrong — try again.", 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
