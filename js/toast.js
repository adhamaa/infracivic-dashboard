// js/toast.js -- transient status messages

(() => {
  const IC = window.IC = window.IC || {};
  let region;

  function initToast() {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }

  function toast(message, kind = 'info') {
    if (!region) initToast();
    const item = document.createElement('div');
    item.className = `toast ${kind}`;
    item.textContent = message;
    region.appendChild(item);
    setTimeout(() => item.classList.add('is-hiding'), 2200);
    setTimeout(() => item.remove(), 2800);
  }

  IC.initToast = initToast;
  IC.toast = toast;
})();