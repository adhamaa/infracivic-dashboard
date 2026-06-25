// js/modal.js -- shared modal shell

(() => {
  const IC = window.IC = window.IC || {};
  let root;

  function initModal() {
    root = document.createElement('div');
    root.id = 'modal-root';
    root.className = 'modal-root';
    root.hidden = true;
    root.innerHTML = `
      <section class="modal-card" role="dialog" aria-modal="false" aria-labelledby="modal-title">
        <header class="modal-head">
          <h2 id="modal-title"></h2>
          <button class="modal-close" type="button" data-modal-close aria-label="Close modal"><iconify-icon icon="mdi:close"></iconify-icon></button>
        </header>
        <div class="modal-body"></div>
        <footer class="modal-footer"></footer>
      </section>
    `;
    document.body.appendChild(root);
    root.addEventListener('click', event => {
      if (event.target.closest('[data-modal-close]')) closeModal();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !root.hidden) closeModal();
    });
  }

  function openModal({ title, body = '', footer = '', afterOpen } = {}) {
    if (!root) initModal();
    root.querySelector('#modal-title').textContent = title || '';
    root.querySelector('.modal-body').innerHTML = body;
    root.querySelector('.modal-footer').innerHTML = footer || '<button class="modal-btn secondary" type="button" data-modal-close>Close</button>';
    root.hidden = false;
    afterOpen?.(root);
  }

  function closeModal() {
    if (root) root.hidden = true;
    IC.clearFocusedRoute?.();
  }

  IC.initModal = initModal;
  IC.openModal = openModal;
  IC.closeModal = closeModal;
})();