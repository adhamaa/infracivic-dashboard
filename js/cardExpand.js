// js/cardExpand.js -- reusable dashboard card expansion

(() => {
  const IC = window.IC = window.IC || {};
  const CARD_SELECTOR = [
    '#map-card',
    '#alerts-panel',
    '#actions-panel',
    '.analytics-card',
    '.rp-sec',
    '.placeholder-card',
    '.route-card',
  ].join(',');

  let overlay;
  let closeButton;
  let active = null;

  function initCardExpand() {
    buildOverlay();
    decorateCards(document);

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) decorateCards(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'card-expand-overlay';
    overlay.hidden = true;
    closeButton = document.createElement('button');
    closeButton.className = 'card-expand-close';
    closeButton.type = 'button';
    closeButton.dataset.close = '';
    closeButton.setAttribute('aria-label', 'Close expanded card');
    closeButton.innerHTML = '<iconify-icon icon="mdi:close"></iconify-icon>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', event => {
      if (event.target === overlay || event.target.closest('[data-close]')) closeCard();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && active) closeCard();
    });
  }

  function decorateCards(root) {
    const cards = root.matches?.(CARD_SELECTOR) ? [root] : [...root.querySelectorAll?.(CARD_SELECTOR) || []];
    cards.forEach(card => {
      if (card.dataset.expandReady || card.closest('.card-expand-overlay')) return;
      card.dataset.expandReady = 'true';
      card.classList.add('expandable-card');
      const button = document.createElement('button');
      button.className = 'card-expand-trigger';
      button.type = 'button';
      button.setAttribute('aria-label', `Expand ${getCardTitle(card)}`);
      button.innerHTML = '<iconify-icon icon="mdi:arrow-expand-all"></iconify-icon>';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openCard(card, button);
      });
      card.appendChild(button);
    });
  }

  function openCard(card, trigger) {
    if (active) closeCard({ restoreFocus: false });

    const placeholder = document.createElement('div');
    const rect = card.getBoundingClientRect();
    placeholder.className = `card-expand-placeholder ${card.classList.contains('wide') ? 'wide' : ''}`;
    placeholder.style.minHeight = `${Math.max(56, Math.round(rect.height))}px`;
    placeholder.style.width = `${Math.round(rect.width)}px`;
    card.after(placeholder);

    active = {
      card,
      trigger,
      placeholder,
    };

    overlay.hidden = false;
    document.body.classList.add('card-expanded-open');
    overlay.appendChild(card);
    card.appendChild(closeButton);
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', getCardTitle(card));
    card.classList.add('is-expanded-card');

    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      refreshMovedContent();
    });
    setTimeout(refreshMovedContent, 280);
  }

  function closeCard({ restoreFocus = true } = {}) {
    if (!active) return;
    const { card, trigger, placeholder } = active;
    overlay.classList.remove('is-open');
    card.classList.remove('is-expanded-card');
    closeButton.remove();
    card.removeAttribute('role');
    card.removeAttribute('aria-modal');
    card.removeAttribute('aria-label');
    placeholder.replaceWith(card);
    trigger.innerHTML = '<iconify-icon icon="mdi:arrow-expand-all"></iconify-icon>';
    active = null;
    document.body.classList.remove('card-expanded-open');
    overlay.hidden = true;
    refreshMovedContent();
    if (restoreFocus) trigger?.focus({ preventScroll: true });
  }

  function getCardTitle(card) {
    return card.querySelector('.analytics-card-head span')?.textContent?.trim()
      || card.querySelector('.panel-title')?.textContent?.trim()
      || card.querySelector('.rp-hdr')?.textContent?.trim()
      || card.querySelector(':scope > h2')?.textContent?.trim()
      || card.querySelector(':scope > span')?.textContent?.trim()
      || card.querySelector('#main-header h1')?.textContent?.trim()
      || card.id?.replace(/[-_]/g, ' ')
      || 'card';
  }

  function refreshMovedContent() {
    window.dispatchEvent(new Event('resize'));
    IC.invalidateMap?.();
    IC.resizeCharts?.();
  }

  IC.initCardExpand = initCardExpand;
})();