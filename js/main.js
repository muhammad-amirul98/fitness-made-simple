// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (navToggle && mobileMenu){
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    const expanded = navToggle.classList.contains('open');
    navToggle.setAttribute('aria-expanded', expanded);
  });
}

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

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');
  if (!btn || !answer) return;
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(open => {
      if (open !== item){
        open.classList.remove('open');
        open.querySelector('.faq-a').style.maxHeight = null;
      }
    });
    if (isOpen){
      item.classList.remove('open');
      answer.style.maxHeight = null;
    } else {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

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

// Contact form submission -> Google Sheet via Apps Script
document.querySelectorAll('form[data-placeholder-form]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = form.querySelector('.form-note');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!CONTACT_ENDPOINT){
      if (note) note.textContent = "Form isn't connected yet — see README to finish setup.";
      return;
    }

    const data = {
      name: form.querySelector('#name')?.value || '',
      email: form.querySelector('#email')?.value || '',
      message: form.querySelector('#message')?.value || '',
    };

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
      form.reset();
    } catch (err) {
      if (note) note.textContent = "Something went wrong — try again, or email directly.";
      showToast("Something went wrong — try again.", 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
