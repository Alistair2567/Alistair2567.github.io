(() => {
  'use strict';
  const dialog = document.querySelector('.hud-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const sizeButton = dialog.querySelector('[data-hud-size]');
  const stage = dialog.querySelector('.hud-lightbox-stage');
  let previousOverflow = '';
  let trigger;
  const resetSize = () => {
    dialog.classList.remove('is-actual');
    sizeButton.setAttribute('aria-pressed', 'false');
    sizeButton.textContent = '原尺寸查看';
    stage.scrollTo(0, 0);
  };
  document.querySelectorAll('[data-hud-image]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      title.textContent = link.dataset.caption;
      resetSize();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  sizeButton.addEventListener('click', () => {
    const actual = dialog.classList.toggle('is-actual');
    sizeButton.setAttribute('aria-pressed', String(actual));
    sizeButton.textContent = actual ? '适合屏幕' : '原尺寸查看';
    stage.scrollTo(0, 0);
  });
  dialog.querySelector('[data-hud-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    trigger?.focus({ preventScroll:true });
    resetSize();
  });
})();
