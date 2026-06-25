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
      if (['filters', 'incident', 'incident:add'].includes(reason)) {
        renderAlerts();
        renderIncidentsSummary();
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
    const mkSpark = (id, data, color) => {
      const el = document.getElementById(id);
      if (!el) return;
      const values = data.map(d => d.y);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = max - min || 1;
      const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 28 - ((value - min) / span) * 22 - 3;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
      el.innerHTML = `<svg class="spark-svg" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
    };
    mkSpark('spark-approval', D.SPARKLINES.approval, '#3b82f6');
    mkSpark('spark-success', D.SPARKLINES.success, '#22c55e');
    mkSpark('spark-payment', D.SPARKLINES.payment, '#22c55e');
  }

  function renderConcessionairesChart() {
    const el = document.getElementById('chart-conc');
    if (!el) return;
    const selected = IC.state.filters.concession;
    const maxValue = Math.max(...D.CONCESSIONAIRES.map(item => item.value));
    el.innerHTML = D.CONCESSIONAIRES.map((item, index) => {
      const active = selected !== 'all' && item.concession === selected;
      const dim = selected !== 'all' && item.concession !== selected;
      return `
        <div class="conc-row ${active ? 'conc-active' : ''} ${dim ? 'conc-dim' : ''}" data-concession="${item.concession}">
          <span class="conc-name">${item.name}</span>
          <div class="conc-track"><span class="conc-bar" style="width:${(item.value / maxValue * 100).toFixed(1)}%;background:${D.CONC_COLORS[index % D.CONC_COLORS.length]}"></span></div>
          <span class="conc-value">RM&nbsp;${item.value}M</span>
        </div>
      `;
    }).join('');
  }

  IC.initRender = initRender;
})();