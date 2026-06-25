// js/filters.js -- dashboard filter predicates and controls

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  let popover;

  function initFilters() {
    buildPopover();
    document.getElementById('concession-filter')?.addEventListener('change', event => {
      IC.setFilters({ concession: event.target.value });
    });
    document.getElementById('status-filter')?.addEventListener('change', event => {
      IC.setFilters({ status: event.target.value });
    });
    document.getElementById('advanced-filter-btn')?.addEventListener('click', event => {
      event.stopPropagation();
      togglePopover();
    });
    document.querySelectorAll('[data-road-type]').forEach(input => {
      input.addEventListener('change', () => {
        const roadTypes = [...document.querySelectorAll('[data-road-type]:checked')].map(item => item.value);
        IC.setFilters({ roadTypes });
      });
    });
    document.addEventListener('click', event => {
      if (!popover || popover.hidden) return;
      if (popover.contains(event.target) || event.target.closest('#advanced-filter-btn')) return;
      closePopover();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closePopover();
    });
    IC.subscribe(syncFilterControls);
    syncFilterControls();
  }

  function buildPopover() {
    popover = document.createElement('div');
    popover.id = 'filters-popover';
    popover.className = 'filters-popover';
    popover.hidden = true;
    popover.innerHTML = `
      <div class="fp-head">
        <strong>Advanced filters</strong>
        <button type="button" class="fp-reset">Reset</button>
      </div>
      <div class="fp-group">
        <p>Date range</p>
        <label><input type="radio" name="date-range" value="all" checked> All time</label>
        <label><input type="radio" name="date-range" value="24h"> Last 24h</label>
        <label><input type="radio" name="date-range" value="7d"> Last 7 days</label>
        <label><input type="radio" name="date-range" value="30d"> Last 30 days</label>
      </div>
      <div class="fp-group">
        <p>Road type</p>
        ${D.ROAD_TYPES.map(type => `<label><input type="checkbox" data-popover-road-type value="${type}" checked> ${D.ROAD_TYPE_LABELS[type]}</label>`).join('')}
      </div>
      <div class="fp-group">
        <p>Minimum incidents <span id="min-count-value">0</span></p>
        <input type="range" id="min-count-filter" min="0" max="40" step="1" value="0">
      </div>
    `;
    document.getElementById('map-wrap')?.appendChild(popover);
    popover.querySelectorAll('input[name="date-range"]').forEach(input => {
      input.addEventListener('change', () => IC.setFilters({ dateRange: input.value }));
    });
    popover.querySelectorAll('[data-popover-road-type]').forEach(input => {
      input.addEventListener('change', () => {
        const roadTypes = [...popover.querySelectorAll('[data-popover-road-type]:checked')].map(item => item.value);
        IC.setFilters({ roadTypes });
      });
    });
    popover.querySelector('#min-count-filter').addEventListener('input', event => {
      IC.setFilters({ minCount: Number(event.target.value) });
    });
    popover.querySelector('.fp-reset').addEventListener('click', () => {
      IC.setFilters({ concession: 'all', status: 'all', dateRange: 'all', roadTypes: [...D.ROAD_TYPES], minCount: 0 });
    });
  }

  function togglePopover() {
    popover.hidden ? openPopover() : closePopover();
  }

  function openPopover() {
    popover.hidden = false;
    document.getElementById('advanced-filter-btn')?.setAttribute('aria-expanded', 'true');
  }

  function closePopover() {
    if (!popover) return;
    popover.hidden = true;
    document.getElementById('advanced-filter-btn')?.setAttribute('aria-expanded', 'false');
  }

  function syncFilterControls() {
    const { filters } = IC.state;
    const concession = document.getElementById('concession-filter');
    const status = document.getElementById('status-filter');
    if (concession) concession.value = filters.concession;
    if (status) status.value = filters.status;
    document.querySelectorAll('[data-road-type]').forEach(input => {
      input.checked = filters.roadTypes.includes(input.value);
    });
    if (popover) {
      popover.querySelectorAll('input[name="date-range"]').forEach(input => {
        input.checked = input.value === filters.dateRange;
      });
      popover.querySelectorAll('[data-popover-road-type]').forEach(input => {
        input.checked = filters.roadTypes.includes(input.value);
      });
      const min = popover.querySelector('#min-count-filter');
      const minValue = popover.querySelector('#min-count-value');
      min.value = filters.minCount;
      minValue.textContent = filters.minCount;
    }
    const count = activeFilterCount();
    const label = document.querySelector('#advanced-filter-btn .filter-label');
    if (label) label.textContent = count ? `Filters · ${count}` : 'Filters';
  }

  function activeFilterCount() {
    const filters = IC.state.filters;
    let count = 0;
    if (filters.concession !== 'all') count += 1;
    if (filters.status !== 'all') count += 1;
    if (filters.dateRange !== 'all') count += 1;
    if (filters.minCount > 0) count += 1;
    if (filters.roadTypes.length !== D.ROAD_TYPES.length) count += 1;
    return count;
  }

  function matchesDateRange(incident) {
    const range = IC.state.filters.dateRange;
    if (range === 'all') return true;
    const age = Date.now() - new Date(incident.createdAt).getTime();
    const day = 24 * 60 * 60 * 1000;
    if (range === '24h') return age <= day;
    if (range === '7d') return age <= 7 * day;
    if (range === '30d') return age <= 30 * day;
    return true;
  }

  function matchesStatus(incident) {
    const status = IC.state.filters.status;
    if (status === 'all') return true;
    if (status === 'completed') return incident.status === 'resolved';
    return incident.sev === status && incident.status !== 'resolved';
  }

  function getFilteredIncidents() {
    const { filters } = IC.state;
    return IC.state.incidents.filter(incident => {
      if (filters.concession !== 'all' && incident.concession !== filters.concession) return false;
      if (!filters.roadTypes.includes(incident.roadType)) return false;
      if (incident.count < filters.minCount) return false;
      return matchesStatus(incident) && matchesDateRange(incident);
    });
  }

  function getFilteredAlerts() {
    const visibleIds = new Set(getFilteredIncidents().map(incident => incident.id));
    return IC.state.alerts.filter(alert => visibleIds.has(alert.markerId));
  }

  IC.initFilters = initFilters;
  IC.getFilteredIncidents = getFilteredIncidents;
  IC.getFilteredAlerts = getFilteredAlerts;
  IC.activeFilterCount = activeFilterCount;
})();