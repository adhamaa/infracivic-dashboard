// js/list.js -- marker table view

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  const sort = { field: 'createdAt', dir: 'desc' };
  let listView;

  function initListView() {
    listView = document.createElement('div');
    listView.id = 'list-view';
    document.getElementById('map-wrap')?.appendChild(listView);
    document.getElementById('btn-map')?.addEventListener('click', () => IC.setState({ view: 'map' }, 'view'));
    document.getElementById('btn-list')?.addEventListener('click', () => IC.setState({ view: 'list' }, 'view'));
    listView.addEventListener('click', event => {
      const sortButton = event.target.closest('[data-sort]');
      const row = event.target.closest('[data-incident-id]');
      if (sortButton) {
        const field = sortButton.dataset.sort;
        sort.dir = sort.field === field && sort.dir === 'asc' ? 'desc' : 'asc';
        sort.field = field;
        renderList();
      } else if (row) {
        IC.openIncidentDetail(row.dataset.incidentId);
      }
    });
    IC.subscribe((_, reason) => {
      if (['filters', 'view', 'incident', 'incident:add'].includes(reason)) renderList();
      syncToggleButtons();
    });
    renderList();
    syncToggleButtons();
  }

  function renderList() {
    if (!listView) return;
    listView.hidden = IC.state.view !== 'list';
    if (IC.state.view !== 'list') return;
    const rows = [...IC.getFilteredIncidents()].sort(compareRows);
    listView.innerHTML = `
      <div class="list-card">
        <div class="list-title">Incident Cluster List <span>${rows.length} records</span></div>
        <table class="incident-table">
          <thead>
            <tr>
              <th><button data-sort="kmLabel">KM / Location</button></th>
              <th><button data-sort="sev">Severity</button></th>
              <th><button data-sort="concession">Concession</button></th>
              <th><button data-sort="roadType">Road Type</button></th>
              <th><button data-sort="status">Status</button></th>
              <th><button data-sort="count">Count</button></th>
              <th><button data-sort="createdAt">Created</button></th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(renderRow).join('') : '<tr><td colspan="7" class="empty-cell">No incidents match the current filters.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRow(incident) {
    const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
    return `
      <tr data-incident-id="${incident.id}">
        <td><strong>${incident.kmLabel}</strong><span>${incident.location}</span></td>
        <td><span class="sev-pill ${visual}">${D.SEVERITY_LABELS[visual] || IC.cap(visual)}</span></td>
        <td>${incident.concession}</td>
        <td>${D.ROAD_TYPE_LABELS[incident.roadType]}</td>
        <td>${D.STATUS_LABELS[incident.status]}</td>
        <td>${incident.count}</td>
        <td>${formatDate(incident.createdAt)}</td>
      </tr>
    `;
  }

  function compareRows(a, b) {
    const direction = sort.dir === 'asc' ? 1 : -1;
    const av = sort.field === 'createdAt' ? new Date(a[sort.field]).getTime() : a[sort.field];
    const bv = sort.field === 'createdAt' ? new Date(b[sort.field]).getTime() : b[sort.field];
    if (av > bv) return direction;
    if (av < bv) return -direction;
    return 0;
  }

  function syncToggleButtons() {
    document.getElementById('btn-map')?.classList.toggle('active', IC.state.view === 'map');
    document.getElementById('btn-list')?.classList.toggle('active', IC.state.view === 'list');
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }

  IC.initListView = initListView;
})();