(() => {
  'use strict';

  // Progressive enhancement: without GSAP, all content stays visible.
  if (!window.gsap || !window.IntersectionObserver) return;

  const gsap = window.gsap;
  let media;

  function startMotion() {
    if (media) media.revert();
    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', context => {
      const seen = new WeakSet();
      const activeTweens = new Set();
      const hero = document.querySelector('.gameplay-hero-copy');
      const pageIntro = document.querySelector('.project-hero > .shell');
      const hashTarget = document.getElementById(location.hash.slice(1));

      context.add('reveal', (elements, stagger = 0.055) => {
        const nodes = [...elements].filter(node => !seen.has(node));
        if (!nodes.length) return;
        nodes.forEach(node => seen.add(node));
        let tween;
        tween = gsap.fromTo(nodes, { opacity:0, y:12 }, {
          opacity:1, y:0, duration:0.52, stagger, ease:'power2.out',
          clearProps:'opacity,transform',
          onComplete:() => activeTweens.delete(tween)
        });
        activeTweens.add(tween);
      });

      // Never animate media, sticky elements, or section boxes used by ScrollSpy.
      const intro = hero || pageIntro;
      if (intro && !hashTarget) context.reveal(intro.children, 0.065);

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          if (hashTarget && hashTarget.contains(entry.target)) return;
          const focused = document.activeElement;
          if (entry.target.contains(focused) || entry.target.closest('.card-link')?.contains(focused)) return;
          context.reveal(entry.target.children);
        });
      }, { threshold:0.12, rootMargin:'0px 0px -32px 0px' });

      document.querySelectorAll([
        '.section-head', '.case-header > div:last-child', '.case-card-copy',
        '.support-module-header > div', '.overview-copy',
        '.boss-copy', '.transform-conclusion'
      ].join(',')).forEach(element => {
        if (!element.children.length) return;
        observer.observe(element);
      });

      // Keyboard navigation must not land on a fading, hard-to-read control.
      const finishActive = () => [...activeTweens].forEach(tween => tween.progress(1));
      document.addEventListener('focusin', finishActive);
      return () => {
        observer.disconnect();
        document.removeEventListener('focusin', finishActive);
        activeTweens.clear();
      };
    });
  }

  startMotion();
  window.addEventListener('pagehide', () => media?.revert());
  window.addEventListener('pageshow', event => {
    if (event.persisted) startMotion();
  });
})();
