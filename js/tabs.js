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
  const PERIOD_IDS = Object.keys(periodLabels);
  const STATUS_IDS = ['all', 'critical', 'high', 'medium', 'low', 'completed'];
  const DATE_RANGE_IDS = ['all', '24h', '7d', '30d'];
  const CONCESSION_SET = new Set(D.CONCESSIONS || []);
  const STATE_SET = new Set((D.STATE_REGIONS || []).flatMap(group => group.states || []));
  const ROAD_TYPE_SET = new Set(D.ROAD_TYPES || []);

  let scrollEl;
  let leftArrow;
  let rightArrow;
  let carouselReady = false;

  function initTabs() {
    restoreFromUrl();
    document.querySelectorAll('[data-tab]').forEach(button => {
      button.addEventListener('click', () => activateTab(button.dataset.tab));
    });
    initFilterBadges();
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
    syncFilterBadges();
    writeUrlFromState();
    if (active === 'commandCentre') setTimeout(() => IC.invalidateMap?.(), 0);
    scrollActiveIntoView();
    updateArrows();
  }

  function initFilterBadges() {
    document.querySelectorAll('[data-tab-panel]:not([data-tab-panel="commandCentre"]) .analytics-header').forEach(header => {
      if (header.querySelector('.filter-badge')) return;
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'filter-badge';
      badge.hidden = true;
      badge.addEventListener('click', () => activateTab('commandCentre'));
      header.appendChild(badge);
    });
  }

  function syncFilterBadges() {
    const { concessions = [], states = [] } = IC.state.filters || {};
    const parts = [];
    if (concessions.length) parts.push(concessions.length === 1 ? concessions[0] : `${concessions.length} concessions`);
    if (states.length) parts.push(states.length === 1 ? states[0] : `${states.length} states`);
    const text = parts.length ? `Filtered: ${parts.join(' · ')}` : '';
    document.querySelectorAll('.filter-badge').forEach(badge => {
      badge.hidden = !text;
      badge.textContent = text;
      badge.setAttribute('aria-label', text ? `${text}. Edit on Command Centre` : 'No active dashboard filters');
    });
  }

  function restoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const statePatch = {};
    const filtersPatch = {};

    const requestedTab = params.get('tab');
    if (TAB_IDS.includes(requestedTab)) statePatch.tab = requestedTab;

    const requestedView = params.get('view');
    if (['map', 'list'].includes(requestedView)) statePatch.view = requestedView;

    const requestedPeriod = params.get('period');
    if (PERIOD_IDS.includes(requestedPeriod)) filtersPatch.period = requestedPeriod;

    if (params.has('concessions')) filtersPatch.concessions = parseList(params.get('concessions'), CONCESSION_SET);
    if (params.has('states')) filtersPatch.states = parseList(params.get('states'), STATE_SET);

    const requestedStatus = params.get('status');
    if (STATUS_IDS.includes(requestedStatus)) filtersPatch.status = requestedStatus;

    const requestedDateRange = params.get('dateRange');
    if (DATE_RANGE_IDS.includes(requestedDateRange)) filtersPatch.dateRange = requestedDateRange;

    if (params.has('roadTypes')) {
      const roadTypes = parseList(params.get('roadTypes'), ROAD_TYPE_SET);
      filtersPatch.roadTypes = roadTypes.length ? roadTypes : [...D.ROAD_TYPES];
    }

    const requestedMinCount = Number(params.get('minCount'));
    if (Number.isFinite(requestedMinCount) && requestedMinCount > 0) filtersPatch.minCount = requestedMinCount;

    if (Object.keys(statePatch).length) IC.setState(statePatch, 'url');
    if (Object.keys(filtersPatch).length) IC.setFilters(filtersPatch);
    if (IC.state.tab === 'financial' && !params.has('period') && IC.state.filters.period === '90d') IC.setFilters({ period: 'ytd' });
  }

  function parseList(value, validSet) {
    const seen = new Set();
    return String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(item => item && validSet.has(item) && !seen.has(item) && seen.add(item));
  }

  function writeUrlFromState() {
    const params = new URLSearchParams();
    const { tab, view, filters } = IC.state;
    const activeTab = tab || 'commandCentre';

    if (activeTab !== 'commandCentre') params.set('tab', activeTab);
    if (activeTab === 'commandCentre' && view === 'list') params.set('view', 'list');
    if ((filters.concessions || []).length) params.set('concessions', filters.concessions.join(','));
    if ((filters.states || []).length) params.set('states', filters.states.join(','));
    if (filters.period !== '90d') params.set('period', filters.period);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (filters.minCount > 0) params.set('minCount', String(filters.minCount));
    if ((filters.roadTypes || []).length !== (D.ROAD_TYPES || []).length) params.set('roadTypes', filters.roadTypes.join(','));

    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, '', nextUrl);
    }
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
