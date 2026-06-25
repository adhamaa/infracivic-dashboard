// js/tabs.js -- dashboard tab switching

(() => {
  const IC = window.IC = window.IC || {};
  const periodLabels = {
    '7d': 'LAST 7 DAYS',
    '30d': 'LAST 30 DAYS',
    '90d': 'LAST 90 DAYS',
    mtd: 'MTD',
    qtd: 'QTD',
    ytd: 'YTD',
  };

  function initTabs() {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (['commandCentre', 'operations', 'financial'].includes(requestedTab)) {
      IC.setState({ tab: requestedTab }, 'tab');
      if (requestedTab === 'financial' && IC.state.filters.period === '90d') IC.setFilters({ period: 'ytd' });
    }
    document.querySelectorAll('[data-tab]').forEach(button => {
      button.addEventListener('click', () => activateTab(button.dataset.tab));
    });
    IC.subscribe((_, reason) => {
      if (['tab', 'route', 'filters'].includes(reason)) syncTabs();
    });
    syncTabs();
  }

  function activateTab(tab) {
    const next = tab || 'commandCentre';
    const defaultPeriod = next === 'financial' && IC.state.filters.period === '90d' ? 'ytd' : IC.state.filters.period;
    IC.setState({ tab: next }, 'tab');
    if (defaultPeriod !== IC.state.filters.period) IC.setFilters({ period: defaultPeriod });
  }

  function syncTabs() {
    const active = IC.state.tab || 'commandCentre';
    document.getElementById('app')?.setAttribute('data-active-tab', active);
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
