(() => {
  'use strict';
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
  });
  const menu = document.querySelector('[data-site-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const closeMenu = () => { menu?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open);
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
  });
  matchMedia('(min-width:721px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  document.querySelectorAll('[data-element-board]').forEach(board => {
    const tabs = [...board.querySelectorAll('[role=tab]')];
    const select = tab => {
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        panel.hidden = !selected;
        if (!selected) panel.querySelectorAll('video').forEach(video => video.pause());
      });
      board.style.setProperty('--element', `var(--${tab.dataset.element})`);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(tabs[next]); tabs[next].focus(); }
      });
    });
  });

  const loadVideo = video => {
    const source = video.querySelector('source[data-src]');
    if (source && !source.hasAttribute('src')) { video.preload = 'auto'; source.src = source.dataset.src; video.load(); }
  };
  const videos = document.querySelectorAll('video[data-lazy]');
  document.querySelectorAll('[data-video-start]').forEach(button => button.addEventListener('click', () => {
    const video = button.previousElementSibling;
    loadVideo(video); button.hidden = true; video.hidden = false;
    video.play().then(() => video.focus()).catch(() => {
      video.hidden = true; button.hidden = false; button.focus();
    });
  }));
  document.querySelectorAll('video').forEach(video => video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  }));

  const topButton = document.querySelector('[data-back-to-top]');
  const reduce = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
  topButton?.addEventListener('click', () => window.scrollTo({top:0,behavior:reduce()?'auto':'smooth'}));
  const nav = document.querySelector('[data-anchor-nav]');
  const links = nav ? [...nav.querySelectorAll('a')] : [];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const activate = id => links.forEach(link => {
    const active = link.getAttribute('href') === '#' + id;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
  });
  let scheduled = false;
  const update = () => {
    scheduled = false;
    topButton?.classList.toggle('is-visible', scrollY > innerHeight * 0.8);
    if (!sections.length) return;
    const bottom = document.documentElement.scrollHeight - (scrollY + innerHeight);
    if (bottom <= 16) { activate(sections.at(-1).id); return; }
    const threshold = (nav?.getBoundingClientRect().bottom ?? 0) + 35;
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= threshold) current = section; });
    activate(current.id);
  };
  links.forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault(); target.scrollIntoView({behavior:reduce()?'auto':'smooth',block:'start'});
    history.replaceState(null,'',link.getAttribute('href'));
  }));
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, {passive:true});
  addEventListener('resize', update); update();
})();
