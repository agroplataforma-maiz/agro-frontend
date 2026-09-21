const obs = new IntersectionObserver(
  entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('on');
        }, index * 70);

        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.07
  }
);

document
  .querySelectorAll('.reveal')
  .forEach(element => obs.observe(element));