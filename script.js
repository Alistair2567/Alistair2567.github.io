(() => {
  const page = document.body.dataset.page;
  const current = document.querySelector(`[data-nav="${page}"]`);
  if (current) current.setAttribute("aria-current", "page");

  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const lazyVideos = [...document.querySelectorAll("[data-lazy-video]")];
  const loadVideo = (video) => {
    if (video.dataset.loaded) return;
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.dataset.loaded = "true";
    video.load();
  };
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          loadVideo(target);
          observer.unobserve(target);
        }
      });
    }, { rootMargin: "320px 0px" });
    lazyVideos.forEach((video) => videoObserver.observe(video));
  } else {
    lazyVideos.forEach(loadVideo);
  }

  const backToTop = document.querySelector("[data-back-to-top]");
  if (backToTop) {
    const update = () => backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * .9);
    window.addEventListener("scroll", update, { passive: true });
    update();
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  }

  const anchorNav = document.querySelector(".anchor-nav");
  if (!anchorNav) return;
  const links = [...anchorNav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  let activeId = "";
  const activate = (id) => {
    if (!id || id === activeId) return;
    activeId = id;
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      link.toggleAttribute("aria-current", active);
    });
  };
  const bottomTolerance = 16;
  const update = () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - bottomTolerance) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        activate(lastSection.id);
        return;
      }
    }
    let section = sections[0];
    sections.forEach((item) => { if (item.getBoundingClientRect().top <= 170) section = item; });
    if (section) activate(section.id);
  };
  links.forEach((link) => link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", link.getAttribute("href"));
  }));
  window.addEventListener("scroll", update, { passive: true });
  update();
})();
