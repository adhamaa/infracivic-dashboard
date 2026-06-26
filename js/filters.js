// js/filters.js -- dashboard filter predicates and controls

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  let popover;
  let filterDrawer;
  let filterToggle;
  const dropdowns = new Map();

  function initFilters() {
    bindMapFilterDrawer();
    buildPopover();
    buildConcessionDropdown();
    buildStateDropdown();
    document.getElementById('period-filter')?.addEventListener('change', event => {
      IC.setFilters({ period: event.target.value });
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
      if (filterDrawer && !filterDrawer.hidden) {
        if (!filterDrawer.contains(event.target) && !filterToggle?.contains(event.target)) closeFilterDrawer();
      }
      if (popover && !popover.hidden) {
        if (!popover.contains(event.target) && !event.target.closest('#advanced-filter-btn')) closePopover();
      }
      dropdowns.forEach(dd => {
        if (dd.panel.hidden) return;
        if (!dd.panel.contains(event.target) && !dd.trigger.contains(event.target)) closeDropdown(dd);
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      closeFilterDrawer();
      closePopover();
      dropdowns.forEach(closeDropdown);
    });
    IC.subscribe(syncFilterControls);
    syncFilterControls();
  }

  function bindMapFilterDrawer() {
    filterDrawer = document.getElementById('map-filter-drawer');
    filterToggle = document.getElementById('map-filter-toggle');
    filterToggle?.addEventListener('click', event => {
      event.stopPropagation();
      filterDrawer?.hidden ? openFilterDrawer() : closeFilterDrawer();
    });
    filterDrawer?.addEventListener('click', event => event.stopPropagation());
    document.getElementById('map-filter-clear')?.addEventListener('click', () => {
      IC.setFilters({ concessions: [], states: [], status: 'all', dateRange: 'all', roadTypes: [...D.ROAD_TYPES], minCount: 0 });
    });
  }

  function openFilterDrawer() {
    if (!filterDrawer) return;
    filterDrawer.hidden = false;
    filterToggle?.setAttribute('aria-expanded', 'true');
  }

  function closeFilterDrawer() {
    if (!filterDrawer) return;
    filterDrawer.hidden = true;
    filterToggle?.setAttribute('aria-expanded', 'false');
    closePopover();
    dropdowns.forEach(closeDropdown);
  }

  function buildConcessionDropdown() {
    const trigger = document.getElementById('concession-filter');
    if (!trigger) return;
    const panel = document.createElement('div');
    panel.className = 'ms-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="ms-head">
        <strong>Concessions</strong>
        <button type="button" class="ms-clear" data-clear>Clear</button>
      </div>
      <div class="ms-body">
        ${D.CONCESSIONS.map(c => `
          <label class="ms-row"><input type="checkbox" data-concession value="${c}"><span>${c}</span></label>
        `).join('')}
      </div>
    `;
    trigger.parentElement.appendChild(panel);
    const dd = { trigger, panel, key: 'concession' };
    dropdowns.set('concession', dd);
    trigger.addEventListener('click', event => {
      event.stopPropagation();
      toggleDropdown(dd);
    });
    panel.querySelectorAll('[data-concession]').forEach(input => {
      input.addEventListener('change', () => {
        const concessions = [...panel.querySelectorAll('[data-concession]:checked')].map(i => i.value);
        IC.setFilters({ concessions });
      });
    });
    panel.querySelector('[data-clear]').addEventListener('click', () => {
      IC.setFilters({ concessions: [] });
    });
  }

  function buildStateDropdown() {
    const trigger = document.getElementById('state-filter');
    if (!trigger) return;
    const panel = document.createElement('div');
    panel.className = 'ms-panel ms-panel-wide';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="ms-head">
        <strong>States</strong>
        <button type="button" class="ms-clear" data-clear>Clear</button>
      </div>
      <div class="ms-body ms-body-grouped">
        ${D.STATE_REGIONS.map(group => `
          <div class="ms-group">
            <div class="ms-group-head">
              <span>${group.region}</span>
              <button type="button" class="ms-group-toggle" data-region="${group.region}">Toggle</button>
            </div>
            ${group.states.map(s => `
              <label class="ms-row"><input type="checkbox" data-state value="${s}"><span>${s}</span></label>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
    trigger.parentElement.appendChild(panel);
    const dd = { trigger, panel, key: 'state' };
    dropdowns.set('state', dd);
    trigger.addEventListener('click', event => {
      event.stopPropagation();
      toggleDropdown(dd);
    });
    panel.querySelectorAll('[data-state]').forEach(input => {
      input.addEventListener('change', () => {
        const states = [...panel.querySelectorAll('[data-state]:checked')].map(i => i.value);
        IC.setFilters({ states });
      });
    });
    panel.querySelectorAll('[data-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        const region = btn.dataset.region;
        const group = D.STATE_REGIONS.find(g => g.region === region);
        if (!group) return;
        const current = new Set(IC.state.filters.states || []);
        const allOn = group.states.every(s => current.has(s));
        group.states.forEach(s => allOn ? current.delete(s) : current.add(s));
        IC.setFilters({ states: [...current] });
      });
    });
    panel.querySelector('[data-clear]').addEventListener('click', () => {
      IC.setFilters({ states: [] });
    });
  }

  function toggleDropdown(dd) {
    if (dd.panel.hidden) openDropdown(dd);
    else closeDropdown(dd);
  }

  function openDropdown(dd) {
    dropdowns.forEach(other => { if (other !== dd) closeDropdown(other); });
    dd.panel.hidden = false;
    dd.trigger.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(dd) {
    dd.panel.hidden = true;
    dd.trigger.setAttribute('aria-expanded', 'false');
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
      IC.setFilters({ concessions: [], states: [], status: 'all', dateRange: 'all', roadTypes: [...D.ROAD_TYPES], minCount: 0 });
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

  function summarise(list, allLabel, singular, plural) {
    if (!list || !list.length) return allLabel;
    if (list.length === 1) return list[0];
    return `${list.length} ${list.length === 1 ? singular : plural}`;
  }

  function syncFilterControls() {
    const { filters } = IC.state;
    const concessions = filters.concessions || [];
    const states = filters.states || [];
    const ccDd = dropdowns.get('concession');
    if (ccDd) {
      ccDd.trigger.querySelector('.ms-label').textContent = summarise(concessions, 'All Concessions', 'concession', 'concessions');
      ccDd.trigger.classList.toggle('ms-active', concessions.length > 0);
      ccDd.panel.querySelectorAll('[data-concession]').forEach(input => {
        input.checked = concessions.includes(input.value);
      });
    }
    const stDd = dropdowns.get('state');
    if (stDd) {
      stDd.trigger.querySelector('.ms-label').textContent = summarise(states, 'All States', 'state', 'states');
      stDd.trigger.classList.toggle('ms-active', states.length > 0);
      stDd.panel.querySelectorAll('[data-state]').forEach(input => {
        input.checked = states.includes(input.value);
      });
    }
    const period = document.getElementById('period-filter');
    const status = document.getElementById('status-filter');
    if (period) period.value = filters.period;
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
    if (label) label.textContent = count ? `More filters · ${count}` : 'More filters';
    const drawerCount = document.getElementById('map-filter-count');
    if (drawerCount) {
      drawerCount.hidden = count === 0;
      drawerCount.textContent = String(count);
    }
    const summary = document.getElementById('map-filter-summary');
    if (summary) summary.textContent = mapFilterSummary(filters, count);
  }

  function mapFilterSummary(filters, count) {
    if (!count) return 'All incidents';
    const parts = [];
    if ((filters.concessions || []).length) parts.push(summarise(filters.concessions, '', 'concession', 'concessions'));
    if ((filters.states || []).length) parts.push(summarise(filters.states, '', 'state', 'states'));
    if (filters.status !== 'all') parts.push(D.STATUS_LABELS[filters.status] || IC.cap(filters.status));
    if (filters.roadTypes.length !== D.ROAD_TYPES.length) parts.push(`${filters.roadTypes.length} road type${filters.roadTypes.length === 1 ? '' : 's'}`);
    if (filters.dateRange !== 'all') parts.push(filters.dateRange);
    if (filters.minCount > 0) parts.push(`min ${filters.minCount}`);
    return parts.slice(0, 3).join(' · ');
  }

  function activeFilterCount() {
    const filters = IC.state.filters;
    let count = 0;
    if ((filters.concessions || []).length) count += 1;
    if ((filters.states || []).length) count += 1;
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
    const concessions = filters.concessions || [];
    const states = filters.states || [];
    return IC.state.incidents.filter(incident => {
      if (concessions.length && !concessions.includes(incident.concession)) return false;
      if (states.length && incident.state && !states.includes(incident.state)) return false;
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