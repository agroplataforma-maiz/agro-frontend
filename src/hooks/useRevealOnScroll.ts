import { useEffect } from 'react';

export function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.07 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}