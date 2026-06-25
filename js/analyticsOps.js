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

  function renderSlaHeatmap() {
    const data = concessionItems(D.SLA_BY_CONCESSION_SEVERITY);
    const rows = [...data.reduce((map, item) => {
      const row = map.get(item.concession) || { concession: item.concession };
      row[item.severity.toLowerCase()] = item.value;
      row[`${item.severity.toLowerCase()}Open`] = item.open;
      map.set(item.concession, row);
      return map;
    }, new Map()).values()];
    const series = [
      { key: 'critical', name: 'Critical', fill: D.SEV_COLORS.critical },
      { key: 'high', name: 'High', fill: D.SEV_COLORS.high },
      { key: 'medium', name: 'Medium', fill: D.SEV_COLORS.medium },
      { key: 'low', name: 'Low', fill: D.SEV_COLORS.low },
    ].map(item => ({
      type: 'bar',
      direction: 'vertical',
      xKey: 'concession',
      yKey: item.key,
      yName: item.name,
      fill: item.fill,
      label: {
        enabled: true,
        formatter: params => `${params.value}%`,
        color: '#334155',
        fontSize: 10,
      },
      listeners: {
        nodeClick: event => {
          IC.showCommandCentreList({ concession: event.datum.concession, status: item.key });
        },
      },
      tooltip: {
        renderer: params => ({
          content: `${params.datum.concession} ${item.name}: ${params.datum[item.key]}% SLA (${params.datum[`${item.key}Open`]} open)`,
        }),
      },
    }));
    IC.charts.createChart('op-sla-chart', {
      data: rows,
      series,
      axes: [
        { type: 'category', position: 'bottom', label: { color: '#475569', fontSize: 11 } },
        { type: 'number', position: 'left', min: 0, max: 100, label: { formatter: params => `${params.value}%`, color: '#64748b', fontSize: 10 } },
      ],
      legend: { position: 'bottom' },
    });
  }

  function renderMttrTrend() {
    IC.charts.createChart('op-mttr-chart', {
      data: D.MTTR_TREND,
      series: [
        { type: 'line', xKey: 'week', yKey: 'critical', yName: 'Critical', stroke: D.SEV_COLORS.critical, marker: { enabled: false } },
        { type: 'line', xKey: 'week', yKey: 'high', yName: 'High', stroke: D.SEV_COLORS.high, marker: { enabled: false } },
        { type: 'line', xKey: 'week', yKey: 'medium', yName: 'Medium', stroke: D.SEV_COLORS.medium, marker: { enabled: false } },
        { type: 'line', xKey: 'week', yKey: 'low', yName: 'Low', stroke: D.SEV_COLORS.low, marker: { enabled: false } },
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
    concessionItems(D.DEFECT_MIX).forEach(item => totals.set(item.category, (totals.get(item.category) || 0) + item.count));
    const data = [...totals.entries()].map(([category, count]) => ({ category, count }));
    IC.charts.createChart('op-defect-mix-chart', {
      data,
      series: [{
        type: 'pie',
        angleKey: 'count',
        calloutLabelKey: 'category',
        sectorLabelKey: 'count',
        innerRadiusRatio: 0.58,
        listeners: {
          nodeClick: event => {
            IC.showCommandCentreList({ status: 'all' });
            IC.toast?.(`${event.datum.category} defect list filter queued`, 'success');
          },
        },
      }],
      legend: { position: 'right' },
    });
  }

  function renderOperationsRail() {
    const sla = concessionItems(D.SLA_BY_CONCESSION_SEVERITY);
    const contractors = concessionItems(D.CONTRACTORS).sort((a, b) => b.sla - a.sla);
    const overallSla = average(sla.map(item => item.value));
    const critical = average(sla.filter(item => item.severity === 'Critical').map(item => item.value));
    const high = average(sla.filter(item => item.severity === 'High').map(item => item.value));
    const currentMttr = D.MTTR_TREND.at(-1).critical;
    const backlog = sla.reduce((sum, item) => sum + item.open, 0);

    setHtml('op-sla-kpis', `
      ${kpiCard('Critical SLA', `${critical.toFixed(0)}%`, 'kn-orange', 'mdi:alert-circle-outline', 'ico-orange')}
      ${kpiCard('High SLA', `${high.toFixed(0)}%`, 'kn-blue', 'mdi:timer-check-outline', 'ico-blue')}
      ${kpiCard('Overall SLA', `${overallSla.toFixed(0)}%`, 'kn-green', 'mdi:shield-check-outline', 'ico-green')}
    `);
    setHtml('op-response-kpis', `
      ${wideKpi('Critical MTTR', `${currentMttr.toFixed(1)}h`, 'kn-purple', 'mdi:clock-fast')}
      ${wideKpi('Open Backlog', backlog.toLocaleString('en-MY'), 'kn-orange', 'mdi:tray-full')}
    `);
    setHtml('op-top-contractors', contractors.slice(0, 5).map(item => `
      <button class="mini-row" type="button" data-contractor="${item.name}">
        <span><strong>${item.name}</strong><small>${item.concession} · ${item.jobs} jobs</small></span>
        <b>${item.sla}%</b>
      </button>
    `).join(''));
    document.querySelectorAll('#op-top-contractors [data-contractor]').forEach(row => {
      row.addEventListener('click', () => IC.openContractorDetail?.(row.dataset.contractor));
    });
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
