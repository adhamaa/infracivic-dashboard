// js/analyticsOps.js -- Operations analytics tab

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  function initOperationsAnalytics() {
    renderOperationsAnalytics();
    IC.subscribe((_, reason) => {
      if (['filters', 'tab'].includes(reason)) renderOperationsAnalytics();
    });
  }

  function renderOperationsAnalytics() {
    if (IC.state.tab !== 'operations') return;
    renderSlaHeatmap();
    renderMttrTrend();
    renderContractorScorecard();
    renderDefectMix();
    renderOperationsRail();
  }

  function concessionItems(items) {
    return IC.charts.filteredByConcession(items);
  }

  function incidentItems() {
    return IC.getFilteredIncidents ? IC.getFilteredIncidents() : [];
  }

  function incidentSlaRows() {
    const severities = ['critical', 'high', 'medium', 'low'];
    const rows = new Map();
    incidentItems().forEach(incident => {
      if (incident.status === 'resolved') return;
      const row = rows.get(incident.concession) || { concession: incident.concession };
      const key = incident.sev;
      if (!severities.includes(key)) return;
      row[`${key}Open`] = (row[`${key}Open`] || 0) + incident.count;
      rows.set(incident.concession, row);
    });
    return [...rows.values()].map(row => {
      severities.forEach(key => {
        const open = row[`${key}Open`] || 0;
        row[key] = open ? estimateSla(key, open) : 0;
      });
      row.average = average(severities.filter(key => row[`${key}Open`]).map(key => row[key]));
      return row;
    });
  }

  function estimateSla(severity, openCount) {
    const base = { critical: 87, high: 90, medium: 93, low: 96 }[severity] || 90;
    return Math.max(72, Math.min(98, Math.round(base - Math.sqrt(openCount) * 1.7)));
  }

  function defectCategory(incident) {
    const text = `${incident.description || ''} ${incident.location || ''}`.toLowerCase();
    if (text.includes('drainage') || text.includes('water')) return 'Drainage';
    if (text.includes('guardrail') || text.includes('shoulder')) return 'Guardrail';
    if (text.includes('signage') || text.includes('visibility')) return 'Signage';
    if (text.includes('bridge') || text.includes('joint')) return 'Bridge Joint';
    return 'Pavement';
  }

  function renderSlaHeatmap() {
    const container = document.getElementById('op-sla-chart');
    if (!container) return;
    IC.charts.destroyChart('op-sla-chart');
    const severities = [
      { key: 'critical', label: 'Critical', color: D.SEV_COLORS.critical },
      { key: 'high', label: 'High', color: D.SEV_COLORS.high },
      { key: 'medium', label: 'Medium', color: D.SEV_COLORS.medium },
      { key: 'low', label: 'Low', color: D.SEV_COLORS.low },
    ];
    const rows = incidentSlaRows();

    container.innerHTML = `
      <div class="sla-health">
        ${rows.map(row => `
          <div class="sla-health-row">
            <div class="sla-health-top">
              <strong>${row.concession}</strong>
              <span>${row.average.toFixed(0)}% overall</span>
            </div>
            <div class="sla-meter-grid">
              ${severities.map(item => `
                <button class="sla-meter" type="button" data-concession="${row.concession}" data-status="${item.key}" title="${row.concession} ${item.label}: ${row[item.key] || 0}% SLA, ${row[`${item.key}Open`] || 0} open" style="--sla-color:${item.color}; --sla-value:${row[item.key] || 0}%">
                  <span>${severityInitial(item.label)}</span>
                  <i><b></b></i>
                  <strong>${row[item.key] || 0}%</strong>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    container.querySelectorAll('[data-concession][data-status]').forEach(button => {
      button.addEventListener('click', () => {
        IC.showCommandCentreList({ concession: button.dataset.concession, status: button.dataset.status });
      });
    });
  }

  function severityInitial(label) {
    return label.charAt(0).toUpperCase();
  }

  function renderMttrTrend() {
    IC.charts.createChart('op-mttr-chart', {
      data: D.MTTR_TREND,
      series: [
        { type: 'line', xKey: 'week', yKey: 'critical', yName: 'Critical', stroke: D.SEV_COLORS.critical, marker: { enabled: true, size: 4 } },
        { type: 'line', xKey: 'week', yKey: 'high', yName: 'High', stroke: D.SEV_COLORS.high, marker: { enabled: true, size: 4 } },
        { type: 'line', xKey: 'week', yKey: 'medium', yName: 'Medium', stroke: D.SEV_COLORS.medium, marker: { enabled: true, size: 4 } },
        { type: 'line', xKey: 'week', yKey: 'low', yName: 'Low', stroke: D.SEV_COLORS.low, marker: { enabled: true, size: 4 } },
      ],
      axes: [
        { type: 'category', position: 'bottom', label: { color: '#64748b', fontSize: 10 } },
        { type: 'number', position: 'left', label: { color: '#64748b', fontSize: 10 }, title: { text: 'Hours' } },
      ],
      legend: { position: 'bottom' },
    });
  }

  function renderContractorScorecard() {
    const table = document.getElementById('op-contractor-table');
    if (!table) return;
    const rows = concessionItems(D.CONTRACTORS).sort((a, b) => b.sla - a.sla);
    table.innerHTML = `
      <table class="analytics-table">
        <thead><tr><th>Contractor</th><th>Jobs</th><th>Response</th><th>SLA</th><th>Rework</th><th>Trend</th></tr></thead>
        <tbody>
          ${rows.map(row => `
            <tr data-contractor="${row.name}">
              <td><strong>${row.name}</strong><span>${row.concession}</span></td>
              <td>${row.jobs}</td>
              <td>${row.avgResponse}</td>
              <td><span class="metric-pill ${row.sla >= 90 ? 'good' : row.sla >= 82 ? 'warn' : 'bad'}">${row.sla}%</span></td>
              <td>${row.rework.toFixed(1)}%</td>
              <td><span class="trend-chip ${row.trend.startsWith('-') ? 'down' : 'up'}">${row.trend}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    table.querySelectorAll('[data-contractor]').forEach(row => {
      row.addEventListener('click', () => IC.openContractorDetail?.(row.dataset.contractor));
    });
  }

  function renderDefectMix() {
    const totals = new Map();
    incidentItems().forEach(incident => {
      const category = defectCategory(incident);
      totals.set(category, (totals.get(category) || 0) + incident.count);
    });
    const data = [...totals.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
    const total = data.reduce((sum, item) => sum + item.count, 0);
    if (!data.length) {
      IC.charts.destroyChart('op-defect-mix-chart');
      const el = document.getElementById('op-defect-mix-chart');
      if (el) el.innerHTML = '<div class="chart-empty">No defects match current filters.</div>';
      return;
    }
    IC.charts.createChart('op-defect-mix-chart', {
      type: 'donut',
      data,
      padding: { top: 16, right: 22, bottom: 18, left: 22 },
      series: [{
        type: 'donut',
        data,
        angleKey: 'count',
        angleName: 'Defects',
        calloutLabelKey: 'category',
        sectorLabelKey: 'count',
        legendItemKey: 'category',
        innerRadiusRatio: 0.58,
        outerRadiusRatio: 0.78,
        sectorSpacing: 2,
        cornerRadius: 3,
        fills: [IC.charts.palette.blue, IC.charts.palette.cyan, IC.charts.palette.green, IC.charts.palette.amber, IC.charts.palette.violet],
        strokes: ['#ffffff'],
        calloutLabel: {
          enabled: true,
          minAngle: 0,
          offset: 4,
          fontSize: 10,
          formatter: params => `${shortDefectLabel(params.datum.category)} ${params.datum.count.toLocaleString('en-MY')}`,
        },
        calloutLine: { length: 6, strokeWidth: 1.5 },
        sectorLabel: {
          enabled: false,
        },
        innerCircle: { fill: '#ffffff', fillOpacity: 0.92 },
        innerLabels: [
          { text: total.toLocaleString('en-MY'), fontSize: 24, fontWeight: 900, color: '#0f172a', spacing: 2 },
          { text: 'DEFECTS', fontSize: 10, fontWeight: 800, color: '#64748b' },
        ],
        tooltip: {
          renderer: params => ({ content: `${params.datum.category}: ${params.datum.count.toLocaleString('en-MY')} defects` }),
        },
        listeners: {
          nodeClick: event => {
            IC.showCommandCentreList({ status: 'all' });
            IC.toast?.(`${event.datum.category} defect list filter queued`, 'success');
          },
        },
      }],
      legend: { enabled: false },
    });
  }

  function renderOperationsRail() {
    const sla = incidentSlaRows();
    const contractors = concessionItems(D.CONTRACTORS).sort((a, b) => b.sla - a.sla);
    const overallSla = average(sla.map(item => item.average).filter(Boolean));
    const critical = average(sla.filter(item => item.criticalOpen).map(item => item.critical));
    const high = average(sla.filter(item => item.highOpen).map(item => item.high));
    const currentMttr = D.MTTR_TREND.at(-1).critical;
    const backlog = sla.reduce((sum, item) => sum + (item.criticalOpen || 0) + (item.highOpen || 0) + (item.mediumOpen || 0) + (item.lowOpen || 0), 0);

    setHtml('op-sla-kpis', `
      ${kpiCard('Critical SLA', critical ? `${critical.toFixed(0)}%` : '—', 'kn-orange', 'mdi:alert-circle-outline', 'ico-orange')}
      ${kpiCard('High SLA', high ? `${high.toFixed(0)}%` : '—', 'kn-blue', 'mdi:timer-check-outline', 'ico-blue')}
      ${kpiCard('Overall SLA', overallSla ? `${overallSla.toFixed(0)}%` : '—', 'kn-green', 'mdi:shield-check-outline', 'ico-green')}
    `);
    setHtml('op-response-kpis', `
      ${wideKpi('Critical MTTR', `${currentMttr.toFixed(1)}h`, 'kn-purple', 'mdi:clock-fast')}
      ${wideKpi('Open Backlog', backlog.toLocaleString('en-MY'), 'kn-orange', 'mdi:tray-full')}
    `);
    renderTopContractorsBubble(contractors.slice(0, 5));
  }

  function renderTopContractorsBubble(rows) {
    if (!rows.length) return;
    const concessions = ['PLUS', 'LITRAK', 'SPRINT'];
    const concessionFill = {
      PLUS: IC.charts.palette.violet,
      LITRAK: IC.charts.palette.cyan,
      SPRINT: IC.charts.palette.green,
    };
    const data = rows.map(row => ({
      name: row.name,
      shortName: shortContractor(row.name),
      concession: row.concession,
      jobs: row.jobs,
      sla: row.sla,
      rework: row.rework,
    }));
    const slas = data.map(d => d.sla);
    const slaMin = Math.max(0, Math.floor(Math.min(...slas) - 5));
    const slaMax = Math.min(100, Math.ceil(Math.max(...slas) + 5));
    const series = concessions
      .filter(c => data.some(d => d.concession === c))
      .map(concession => ({
        type: 'bubble',
        data: data.filter(d => d.concession === concession),
        xKey: 'jobs',
        xName: 'Jobs',
        yKey: 'sla',
        yName: concession,
        sizeKey: 'jobs',
        sizeName: 'Jobs',
        labelKey: 'shortName',
        label: { enabled: true, fontSize: 9, fontWeight: 800, color: '#ffffff' },
        range: [20, 42],
        fill: concessionFill[concession],
        fillOpacity: 0.78,
        stroke: '#ffffff',
        strokeWidth: 1.4,
        tooltip: {
          range: 'exact',
          renderer: params => ({
            title: params.datum.name,
            content: `${params.datum.concession} · ${params.datum.jobs} jobs · SLA ${params.datum.sla}% · ${params.datum.rework.toFixed(1)}% rework`,
          }),
        },
        listeners: {
          nodeClick: event => IC.openContractorDetail?.(event.datum.name),
        },
      }));
    IC.charts.createChart('op-top-contractors', {
      padding: { top: 12, right: 22, bottom: 28, left: 40 },
      series,
      axes: [
        {
          type: 'number',
          position: 'bottom',
          title: { text: 'Jobs', fontSize: 10 },
          label: { color: '#64748b', fontSize: 10 },
          nice: true,
        },
        {
          type: 'number',
          position: 'left',
          min: slaMin,
          max: slaMax,
          title: { text: 'SLA %', fontSize: 10 },
          label: { formatter: params => `${params.value}%`, color: '#64748b', fontSize: 10 },
          gridLine: { style: [{ stroke: '#e2e8f0', lineDash: [2, 4] }] },
          crossLines: [{
            type: 'line',
            value: 90,
            stroke: IC.charts.palette.green,
            strokeWidth: 1.2,
            lineDash: [3, 3],
            label: { text: 'Target 90%', position: 'top-end', color: IC.charts.palette.green, fontSize: 9, fontWeight: 700 },
          }],
        },
      ],
      legend: { position: 'bottom', spacing: 4, item: { marker: { size: 8 }, label: { fontSize: 9 } } },
    });
  }

  function shortContractor(name) {
    return name.split(/\s+/)[0];
  }

  function shortDefectLabel(category) {
    return {
      Pavement: 'Pave',
      Drainage: 'Drain',
      Signage: 'Sign',
      Guardrail: 'Rail',
      'Bridge Joint': 'Bridge',
    }[category] || category;
  }

  function kpiCard(label, value, valueClass, icon, iconClass) {
    return `<div class="kpi-card"><div class="kpi-lbl">${label}</div><div class="kpi-num ${valueClass}">${value}</div><div class="kpi-ico ${iconClass}"><iconify-icon icon="${icon}"></iconify-icon></div></div>`;
  }

  function wideKpi(label, value, valueClass, icon) {
    return `<div class="kpi-wide"><div class="kpi-lbl">${label}</div><div class="kpi-big ${valueClass}">${value}</div><div class="kpi-wide-ico ico-purple"><iconify-icon icon="${icon}"></iconify-icon></div></div>`;
  }

  function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  IC.initOperationsAnalytics = initOperationsAnalytics;
})();
