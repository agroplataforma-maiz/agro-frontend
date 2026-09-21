// Reveal al hacer scroll
const revealObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('on'), i * 60);
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.07 });

document
    .querySelectorAll('.reveal')
    .forEach(el => revealObs.observe(el));