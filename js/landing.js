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
      if (note) note.textContent = "Thanks — I'll be in touch shortly.";
      showToast("Message sent — I'll be in touch shortly.");
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
