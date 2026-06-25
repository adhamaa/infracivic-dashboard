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
    mkSpark('spark-approval', D.SPARKLINES.approval, '#3b82f6');
    mkSpark('spark-success', D.SPARKLINES.success, '#22c55e');
    mkSpark('spark-payment', D.SPARKLINES.payment, '#22c55e');
  }

  function renderConcessionairesChart() {
    if (IC.state.tab !== 'commandCentre') return;
    const el = document.getElementById('chart-conc');
    if (!el) return;
    const selected = IC.state.filters.concession;
    const data = D.CONCESSIONAIRES.map((item, index) => ({
      ...item,
      label: `${item.name}`,
      color: D.CONC_COLORS[index % D.CONC_COLORS.length],
      active: selected !== 'all' && item.concession === selected,
      dim: selected !== 'all' && item.concession !== selected,
    }));
    IC.charts.createChart('chart-conc', {
      data,
      padding: { top: 8, right: 18, bottom: 6, left: 8 },
      series: [{
        type: 'bar',
        direction: 'horizontal',
        xKey: 'label',
        yKey: 'value',
        yName: 'Claims Value',
        itemStyler: params => ({
          fill: params.datum.color,
          fillOpacity: params.datum.dim ? 0.35 : 1,
          stroke: params.datum.active ? '#3f1f76' : params.datum.color,
          strokeWidth: params.datum.active ? 2 : 0,
        }),
        label: {
          enabled: true,
          formatter: params => `RM ${params.value}M`,
          color: '#334155',
          fontSize: 10,
        },
        tooltip: {
          renderer: params => ({ content: `${params.datum.name}: RM ${params.datum.value}M` }),
        },
      }],
      axes: [
        { type: 'category', position: 'left', label: { color: '#475569', fontSize: 10 } },
        { type: 'number', position: 'bottom', label: { enabled: false }, line: { enabled: false }, tick: { enabled: false } },
      ],
      legend: { enabled: false },
    });
  }

  IC.initRender = initRender;
})();