document.querySelectorAll('.faq-item').forEach((item, i) => {
  const btn = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');
  if (!btn || !answer) return;

  answer.id = answer.id || `faq-answer-${i}`;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', answer.id);

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(open => {
      if (open !== item){
        open.classList.remove('open');
        open.querySelector('.faq-a').style.maxHeight = null;
        open.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      }
    });
    if (isOpen){
      item.classList.remove('open');
      answer.style.maxHeight = null;
      btn.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
