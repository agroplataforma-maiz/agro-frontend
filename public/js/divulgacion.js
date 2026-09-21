// Reveal al hacer scroll
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('on'), i * 60);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// FAQ accordion
document.querySelectorAll('.faq-pregunta').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const abierto = item.classList.contains('abierto');

    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('abierto');
    });

    if (!abierto) {
      item.classList.add('abierto');
    }
  });
});