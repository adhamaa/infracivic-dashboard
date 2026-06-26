// js/tabs.js -- dashboard tab switching + carousel

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  const periodLabels = {
    '7d': 'LAST 7 DAYS',
    '30d': 'LAST 30 DAYS',
    '90d': 'LAST 90 DAYS',
    mtd: 'MTD',
    qtd: 'QTD',
    ytd: 'YTD',
  };

  const TAB_IDS = (D?.TABS || []).map(t => t.id);
  const TAB_BY_ID = Object.fromEntries((D?.TABS || []).map(t => [t.id, t]));

  let scrollEl;
  let leftArrow;
  let rightArrow;
  let carouselReady = false;

  function initTabs() {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (TAB_IDS.includes(requestedTab)) {
      IC.setState({ tab: requestedTab }, 'tab');
      if (requestedTab === 'financial' && IC.state.filters.period === '90d') IC.setFilters({ period: 'ytd' });
    }
    document.querySelectorAll('[data-tab]').forEach(button => {
      button.addEventListener('click', () => activateTab(button.dataset.tab));
    });
    IC.subscribe((_, reason) => {
      if (['tab', 'route', 'filters'].includes(reason)) syncTabs();
    });
    initCarousel();
    syncTabs();
  }

  function activateTab(tab) {
    const next = TAB_IDS.includes(tab) ? tab : (TAB_IDS[0] || 'commandCentre');
    const defaultPeriod = next === 'financial' && IC.state.filters.period === '90d' ? 'ytd' : IC.state.filters.period;
    IC.setState({ tab: next }, 'tab');
    if (defaultPeriod !== IC.state.filters.period) IC.setFilters({ period: defaultPeriod });
  }

  function syncTabs() {
    const active = IC.state.tab || TAB_IDS[0] || 'commandCentre';
    const app = document.getElementById('app');
    if (app) {
      app.setAttribute('data-active-tab', active);
      const theme = TAB_BY_ID[active]?.theme;
      if (theme) app.setAttribute('data-active-tab-theme', theme);
    }
    document.querySelectorAll('[data-tab]').forEach(button => {
      const selected = button.dataset.tab === active;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    document.querySelectorAll('[data-tab-panel]').forEach(panel => {
      const selected = panel.dataset.tabPanel === active;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
    document.querySelectorAll('[data-rp-panel]').forEach(panel => {
      const selected = panel.dataset.rpPanel === active;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
    document.querySelectorAll('[data-period-label]').forEach(label => {
      label.textContent = periodLabels[IC.state.filters.period] || String(IC.state.filters.period).toUpperCase();
    });
    if (active === 'commandCentre') setTimeout(() => IC.invalidateMap?.(), 0);
    scrollActiveIntoView();
    updateArrows();
  }

  function initCarousel() {
    scrollEl = document.getElementById('tab-scroll');
    leftArrow = document.getElementById('tab-arrow-left');
    rightArrow = document.getElementById('tab-arrow-right');
    if (!scrollEl) return;

    const pageScroll = direction => {
      const step = Math.max(scrollEl.clientWidth * 0.8, 160);
      scrollEl.scrollBy({ left: direction * step, behavior: 'smooth' });
    };
    leftArrow?.addEventListener('click', () => pageScroll(-1));
    rightArrow?.addEventListener('click', () => pageScroll(1));
    scrollEl.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    // Drag / swipe
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    scrollEl.addEventListener('pointerdown', event => {
      if (event.target.closest('.dash-tab')) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startLeft = scrollEl.scrollLeft;
      scrollEl.setPointerCapture?.(event.pointerId);
    });
    scrollEl.addEventListener('pointermove', event => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      scrollEl.scrollLeft = startLeft - dx;
    });
    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      scrollEl.releasePointerCapture?.(event.pointerId);
    };
    scrollEl.addEventListener('pointerup', endDrag);
    scrollEl.addEventListener('pointercancel', endDrag);
    scrollEl.addEventListener('click', event => {
      if (moved) {
        event.stopPropagation();
        event.preventDefault();
        moved = false;
      }
    }, true);

    requestAnimationFrame(updateArrows);
  }

  function updateArrows() {
    if (!scrollEl) return;
    const max = scrollEl.scrollWidth - scrollEl.clientWidth;
    const left = scrollEl.scrollLeft;
    const atStart = left <= 1;
    const atEnd = left >= max - 1;
    const overflow = max > 1;
    if (leftArrow) leftArrow.hidden = !overflow || atStart;
    if (rightArrow) rightArrow.hidden = !overflow || atEnd;
  }

  function scrollActiveIntoView() {
    if (!scrollEl) return;
    const active = scrollEl.querySelector('.dash-tab.active');
    if (!active) return;
    const tabRect = active.getBoundingClientRect();
    const scRect = scrollEl.getBoundingClientRect();
    let delta = 0;
    if (tabRect.left < scRect.left + 8) {
      delta = tabRect.left - scRect.left - 24;
    } else if (tabRect.right > scRect.right - 8) {
      delta = tabRect.right - scRect.right + 24;
    }
    if (delta !== 0) {
      if (carouselReady) {
        scrollEl.scrollBy({ left: delta, behavior: 'smooth' });
      } else {
        scrollEl.scrollLeft += delta;
        requestAnimationFrame(updateArrows);
      }
    }
    carouselReady = true;
  }

  function showCommandCentreList(filters = {}) {
    IC.setFilters(filters);
    IC.setState({ route: 'dashboard', tab: 'commandCentre', view: 'list' }, 'route');
    syncTabs();
  }

  IC.initTabs = initTabs;
  IC.activateTab = activateTab;
  IC.showCommandCentreList = showCommandCentreList;
})();
