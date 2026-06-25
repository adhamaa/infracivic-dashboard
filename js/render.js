// js/render.js -- dashboard section rendering

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  function initRender() {
    renderSparklines();
    renderAlerts();
    renderIncidentsSummary();
    renderConcessionairesChart();
    IC.subscribe((_, reason) => {
      if (['filters', 'incident', 'incident:add', 'tab'].includes(reason)) {
        renderAlerts();
        renderIncidentsSummary();
        renderSparklines();
        renderConcessionairesChart();
      }
    });
  }

  function renderAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;
    const alerts = [...IC.getFilteredAlerts()].sort((a, b) => {
      const ai = IC.getIncident(a.markerId);
      const bi = IC.getIncident(b.markerId);
      if (ai?.status === 'resolved' && bi?.status !== 'resolved') return 1;
      if (ai?.status !== 'resolved' && bi?.status === 'resolved') return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    list.innerHTML = alerts.length ? alerts.map(alert => {
      const incident = IC.getIncident(alert.markerId);
      const status = incident?.status || 'open';
      return `
        <div class="alert-row ${status}" data-incident-id="${alert.markerId}">
          <span class="a-dot ${status === 'resolved' ? 'completed' : alert.sev}"></span>
          <span class="a-text">${alert.km} — ${alert.desc}</span>
          ${status === 'acknowledged' ? '<span class="a-status-tag">Ack</span>' : ''}
          <span class="a-badge ${status === 'resolved' ? 'completed' : alert.sev}">${status === 'resolved' ? 'Completed' : IC.cap(alert.sev)}</span>
          <span class="a-time">${alert.time}</span>
        </div>
      `;
    }).join('') : '<div class="empty-alerts">No alerts match the current filters.</div>';
    list.querySelectorAll('[data-incident-id]').forEach(row => {
      row.addEventListener('mouseenter', () => IC.pulseIncidentMarker(row.dataset.incidentId));
      row.addEventListener('click', () => IC.openIncidentDetail(row.dataset.incidentId));
    });
  }

  function renderIncidentsSummary() {
    const totals = { critical: 0, high: 0, medium: 0, low: 0, completed: 0 };
    IC.getFilteredIncidents().forEach(incident => {
      if (incident.status === 'resolved') totals.completed += incident.count;
      else totals[incident.sev] += incident.count;
    });
    const map = { lc: totals.critical, lh: totals.high, lm: totals.medium, ll: totals.low, ld: totals.completed };
    Object.entries(map).forEach(([klass, value]) => {
      const el = document.querySelector(`.${klass}`)?.nextElementSibling;
      if (el) el.textContent = value.toLocaleString('en-MY');
    });
  }

  function renderSparklines() {
    if (IC.state.tab !== 'commandCentre') return;
    const mkSpark = (id, data, color) => IC.charts.createChart(id, {
      data,
      padding: { top: 3, right: 2, bottom: 2, left: 2 },
      series: [{
        type: 'line',
        xKey: 'x',
        yKey: 'y',
        stroke: color,
        strokeWidth: 2.5,
        marker: { enabled: false },
      }],
      axes: [
        { type: 'number', position: 'bottom', label: { enabled: false }, line: { enabled: false }, tick: { enabled: false } },
        { type: 'number', position: 'left', label: { enabled: false }, line: { enabled: false }, tick: { enabled: false } },
      ],
      legend: { enabled: false },
    });
    mkSpark('spark-approval', D.SPARKLINES.approval, IC.charts.palette.blue);
    mkSpark('spark-success', D.SPARKLINES.success, IC.charts.palette.green);
    mkSpark('spark-payment', D.SPARKLINES.payment, IC.charts.palette.cyan);
  }

  function renderConcessionairesChart() {
    if (IC.state.tab !== 'commandCentre') return;
    const el = document.getElementById('chart-conc');
    if (!el) return;
    IC.charts.destroyChart('chart-conc');
    const selected = IC.state.filters.concession;
    const data = D.CONCESSIONAIRES.map((item, index) => ({
      ...item,
      label: `${item.name}`,
      color: D.CONC_COLORS[index % D.CONC_COLORS.length],
      active: selected !== 'all' && item.concession === selected,
      dim: selected !== 'all' && item.concession !== selected,
    }));
    const max = Math.max(...data.map(item => item.value), 1);
    el.innerHTML = data.map(item => `
      <div class="conc-row ${item.active ? 'conc-active' : ''} ${item.dim ? 'conc-dim' : ''}">
        <span class="conc-name">${item.name}</span>
        <span class="conc-track"><span class="conc-bar" style="width:${item.value / max * 100}%; background:${item.color}"></span></span>
        <span class="conc-value">RM ${item.value}M</span>
      </div>
    `).join('');
  }

  IC.initRender = initRender;
})();