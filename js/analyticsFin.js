// js/analyticsFin.js -- Financial analytics tab

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  function initFinancialAnalytics() {
    renderFinancialAnalytics();
    IC.subscribe((_, reason) => {
      if (['filters', 'tab'].includes(reason)) renderFinancialAnalytics();
    });
  }

  function renderFinancialAnalytics() {
    if (IC.state.tab !== 'financial') return;
    renderClaimsAging();
    renderPaymentVelocity();
    renderOpenClaims();
    renderBudgetBurn();
    renderFinancialRail();
  }

  function concessionItems(items) {
    return IC.charts.filteredByConcession(items);
  }

  function renderClaimsAging() {
    const grouped = bucketTotals(concessionItems(D.CLAIMS_AGING));
    const bucketClick = event => openClaimsBucket(event.datum.bucket);
    const bucketData = grouped.map(row => ({
      bucket: row.bucket,
      label: shortBucketLabel(row.bucket),
      total: row.submitted + row.review + row.approved + row.rejected,
    }));
    const statusData = claimStatusTotals(grouped);
    IC.charts.createChart('fin-aging-chart', {
      data: bucketData,
      padding: { top: 12, right: 24, bottom: 12, left: 24 },
      series: [
        {
          type: 'pie',
          data: statusData,
          angleKey: 'value',
          angleName: 'Claims',
          calloutLabelKey: 'status',
          legendItemKey: 'status',
          outerRadiusRatio: 0.46,
          sectorSpacing: 1,
          fills: ['#64748b', IC.charts.palette.blue, IC.charts.palette.green, IC.charts.palette.red],
          strokes: ['#ffffff'],
          calloutLabel: { enabled: false },
          sectorLabel: { enabled: true, color: '#ffffff', fontSize: 9, fontWeight: 900, formatter: params => params.datum.short },
          tooltip: { renderer: params => ({ content: `${params.datum.status}: ${params.datum.value.toLocaleString('en-MY')} claims` }) },
        },
        {
          type: 'donut',
          data: bucketData,
          angleKey: 'total',
          angleName: 'Claims',
          calloutLabelKey: 'label',
          legendItemKey: 'bucket',
          innerRadiusRatio: 0.58,
          outerRadiusRatio: 0.94,
          sectorSpacing: 2,
          cornerRadius: 3,
          fills: [IC.charts.palette.blue, IC.charts.palette.cyan, IC.charts.palette.amber, IC.charts.palette.violet],
          strokes: ['#ffffff'],
          calloutLabel: { enabled: true, minAngle: 0, offset: 4, fontSize: 10, formatter: params => `${params.datum.label} ${params.datum.total}` },
          sectorLabel: { enabled: false },
          tooltip: { renderer: params => ({ content: `${params.datum.bucket}: ${params.datum.total.toLocaleString('en-MY')} claims` }) },
          listeners: { nodeClick: bucketClick },
        },
      ],
      legend: { enabled: false },
    });
  }

  function renderPaymentVelocity() {
    const totals = concessionItems(D.PAYMENT_VELOCITY).reduce((acc, item) => {
      acc.submitted += item.submitted;
      acc.approved += item.approved;
      acc.released += item.released;
      return acc;
    }, { stage: 'RM value', submitted: 0, approved: 0, released: 0 });
    const trend = paymentVelocityTrend(concessionItems(D.PAYMENT_VELOCITY_TREND));
    IC.charts.createChart('fin-velocity-chart', {
      data: trend,
      padding: { top: 16, right: 18, bottom: 38, left: 48 },
      series: [
        { type: 'area', xKey: 'month', yKey: 'submitted', yName: 'Submitted', stacked: false, fill: IC.charts.palette.slate, fillOpacity: 0.18, stroke: IC.charts.palette.slate, strokeWidth: 2.2, marker: { enabled: false } },
        { type: 'area', xKey: 'month', yKey: 'approved', yName: 'Approved', stacked: false, fill: IC.charts.palette.blue, fillOpacity: 0.2, stroke: IC.charts.palette.blue, strokeWidth: 2.2, marker: { enabled: false } },
        { type: 'area', xKey: 'month', yKey: 'released', yName: 'Released', stacked: false, fill: IC.charts.palette.green, fillOpacity: 0.24, stroke: IC.charts.palette.green, strokeWidth: 2.2, marker: { enabled: false } },
      ],
      axes: [
        { type: 'category', position: 'bottom', label: { color: '#64748b', fontSize: 10 } },
        { type: 'number', position: 'left', label: { formatter: params => `RM ${params.value}M`, color: '#64748b', fontSize: 10 }, gridLine: { style: [{ stroke: '#e2e8f0', lineDash: [2, 4] }] } },
      ],
      legend: { position: 'bottom', spacing: 4, item: { marker: { size: 7 }, label: { fontSize: 9 } } },
    });
    const approvedRate = totals.submitted ? totals.approved / totals.submitted * 100 : 0;
    const releasedRate = totals.approved ? totals.released / totals.approved * 100 : 0;
    setHtml('fin-velocity-labels', `
      <span>Submitted RM ${totals.submitted.toLocaleString('en-MY')}M</span>
      <span>${approvedRate.toFixed(1)}% approved</span>
      <span>${releasedRate.toFixed(1)}% released after approval</span>
    `);
  }

  function paymentVelocityTrend(items) {
    return [...items.reduce((map, item) => {
      const row = map.get(item.month) || { month: item.month, submitted: 0, approved: 0, released: 0 };
      row.submitted += item.submitted;
      row.approved += item.approved;
      row.released += item.released;
      map.set(item.month, row);
      return map;
    }, new Map()).values()];
  }

  function renderOpenClaims() {
    const table = document.getElementById('fin-open-claims');
    if (!table) return;
    const rows = concessionItems(D.OPEN_CLAIMS).sort((a, b) => b.value - a.value).slice(0, 10);
    table.innerHTML = `
      <table class="analytics-table">
        <thead><tr><th>Claim</th><th>Concession</th><th>Value</th><th>Days</th><th>Approver</th></tr></thead>
        <tbody>
          ${rows.map(row => `
            <tr data-claim="${row.id}">
              <td><strong>${row.id}</strong><span>${row.status}</span></td>
              <td>${row.concession}</td>
              <td>RM ${row.value.toFixed(1)}M</td>
              <td><span class="metric-pill ${row.daysPending > 30 ? 'bad' : row.daysPending > 20 ? 'warn' : 'good'}">${row.daysPending}</span></td>
              <td>${row.approver}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    table.querySelectorAll('[data-claim]').forEach(row => {
      row.addEventListener('click', () => IC.openClaimDetail?.(row.dataset.claim));
    });
  }

  function renderBudgetBurn() {
    const data = concessionItems(D.BUDGET_BURN);
    const maxBudget = Math.max(...data.flatMap(item => [item.allocated, item.spent, item.projected]), 1);
    const budgetAxisMax = Math.ceil(maxBudget / 500) * 500;
    IC.charts.createChart('fin-budget-chart', {
      data,
      padding: { top: 16, right: 32, bottom: 34, left: 54 },
      series: [
        { type: 'bar', direction: 'horizontal', xKey: 'concession', yKey: 'allocated', yName: 'Plan', fill: '#cbd5e1' },
        { type: 'bar', direction: 'horizontal', xKey: 'concession', yKey: 'spent', yName: 'Spent', fill: IC.charts.palette.blue },
        { type: 'bar', direction: 'horizontal', xKey: 'concession', yKey: 'projected', yName: 'Forecast', fill: IC.charts.palette.amber },
      ],
      axes: [
        { type: 'category', position: 'left', label: { color: '#64748b', fontSize: 10 } },
        { type: 'number', position: 'bottom', min: 0, max: budgetAxisMax, nice: false, label: { formatter: params => `RM ${params.value}M`, color: '#64748b', fontSize: 10 } },
      ],
      legend: { position: 'bottom', spacing: 4, item: { marker: { size: 7 }, label: { fontSize: 9 } } },
    });
  }

  function renderFinancialRail() {
    const velocity = concessionItems(D.PAYMENT_VELOCITY).reduce((acc, item) => {
      acc.submitted += item.submitted;
      acc.approved += item.approved;
      acc.released += item.released;
      return acc;
    }, { submitted: 0, approved: 0, released: 0 });
    setHtml('fin-headline-kpis', `
      ${kpiCard('Submitted', `RM ${shortRm(velocity.submitted)}`, 'kn-blue', 'mdi:file-send-outline', 'ico-blue')}
      ${kpiCard('Approved', `RM ${shortRm(velocity.approved)}`, 'kn-green', 'mdi:file-check-outline', 'ico-green')}
      ${kpiCard('Released', `RM ${shortRm(velocity.released)}`, 'kn-purple', 'mdi:bank-transfer-out', 'ico-purple')}
    `);
    IC.charts.createChart('fin-cashflow-chart', {
      data: D.MONTHLY_RELEASES,
      series: [
        { type: 'line', xKey: 'month', yKey: 'PLUS', yName: 'PLUS', stroke: IC.charts.palette.blue, strokeWidth: 2.4, marker: { enabled: false } },
        { type: 'line', xKey: 'month', yKey: 'LITRAK', yName: 'LITRAK', stroke: IC.charts.palette.cyan, strokeWidth: 2.4, marker: { enabled: false } },
        { type: 'line', xKey: 'month', yKey: 'SPRINT', yName: 'SPRINT', stroke: IC.charts.palette.green, strokeWidth: 2.4, marker: { enabled: false } },
      ],
      axes: [
        { type: 'category', position: 'bottom', label: { enabled: false } },
        { type: 'number', position: 'left', label: { enabled: false } },
      ],
      legend: { enabled: false },
    });
    renderBudgetGauges(concessionItems(D.BUDGET_BURN));
  }

  function renderBudgetGauges(items) {
    const host = document.getElementById('fin-budget-status');
    if (!host) return;
    items.forEach(item => IC.charts.destroyChart(`fin-budget-gauge-${item.concession}`));
    host.innerHTML = items.map(item => {
      const pct = item.allocated ? Math.round(item.spent / item.allocated * 100) : 0;
      const klass = pct > 85 ? 'bad' : pct > 70 ? 'warn' : 'good';
      return `
        <div class="budget-gauge">
          <div id="fin-budget-gauge-${item.concession}" class="ag-chart"></div>
          <div class="budget-meta">
            <strong>${item.concession} <span class="${klass}">${pct}%</span></strong>
            <small>RM${item.spent}M / RM${item.allocated}M</small>
          </div>
        </div>
      `;
    }).join('');
    items.forEach(item => {
      const pct = item.allocated ? item.spent / item.allocated * 100 : 0;
      const remaining = Math.max(0, 100 - pct);
      const fill = pct > 85 ? IC.charts.palette.red : pct > 70 ? IC.charts.palette.amber : IC.charts.palette.green;
      IC.charts.createChart(`fin-budget-gauge-${item.concession}`, {
        padding: { top: 4, right: 4, bottom: 4, left: 4 },
        series: [{
          type: 'donut',
          data: [
            { key: 'spent', value: pct },
            { key: 'rest', value: remaining },
          ],
          angleKey: 'value',
          legendItemKey: 'key',
          innerRadiusRatio: 0.72,
          outerRadiusRatio: 0.98,
          startAngle: -135,
          endAngle: 135,
          cornerRadius: 4,
          sectorSpacing: 0,
          fills: [fill, '#e2e8f0'],
          strokes: ['#ffffff'],
          calloutLabel: { enabled: false },
          sectorLabel: { enabled: false },
          tooltip: { enabled: false },
          innerLabels: [
            { text: `${Math.round(pct)}%`, fontSize: 16, fontWeight: 900, color: '#0f172a', spacing: 0 },
          ],
        }],
        legend: { enabled: false },
      });
    });
  }

  function bucketTotals(items) {
    const buckets = new Map();
    items.forEach(item => {
      const row = buckets.get(item.bucket) || { bucket: item.bucket, submitted: 0, review: 0, approved: 0, rejected: 0 };
      row.submitted += item.submitted;
      row.review += item.review;
      row.approved += item.approved;
      row.rejected += item.rejected;
      buckets.set(item.bucket, row);
    });
    return [...buckets.values()];
  }

  function claimStatusTotals(grouped) {
    const totals = grouped.reduce((acc, row) => {
      acc.submitted += row.submitted;
      acc.review += row.review;
      acc.approved += row.approved;
      acc.rejected += row.rejected;
      return acc;
    }, { submitted: 0, review: 0, approved: 0, rejected: 0 });
    return [
      { status: 'Submitted', short: 'S', value: totals.submitted },
      { status: 'Under Review', short: 'R', value: totals.review },
      { status: 'Approved', short: 'A', value: totals.approved },
      { status: 'Rejected', short: 'X', value: totals.rejected },
    ];
  }

  function shortBucketLabel(bucket) {
    return {
      '0-7 days': '0-7d',
      '8-14 days': '8-14d',
      '15-30 days': '15-30d',
      '30+ days': '30+d',
    }[bucket] || bucket;
  }

  function openClaimsBucket(bucket) {
    const rows = concessionItems(D.CLAIMS_AGING).filter(item => item.bucket === bucket);
    IC.openModal({
      title: `Claims aging · ${bucket}`,
      body: `
        <table class="analytics-table">
          <thead><tr><th>Concession</th><th>Submitted</th><th>Review</th><th>Approved</th><th>Rejected</th></tr></thead>
          <tbody>
            ${rows.map(row => `<tr><td><strong>${row.concession}</strong></td><td>${row.submitted}</td><td>${row.review}</td><td>${row.approved}</td><td>${row.rejected}</td></tr>`).join('')}
          </tbody>
        </table>
      `,
    });
  }

  function kpiCard(label, value, valueClass, icon, iconClass) {
    return `<div class="kpi-card"><div class="kpi-lbl">${label}</div><div class="kpi-num ${valueClass}">${value}</div><div class="kpi-ico ${iconClass}"><iconify-icon icon="${icon}"></iconify-icon></div></div>`;
  }

  function shortRm(value) {
    return value >= 1000 ? `${(value / 1000).toFixed(2)}B` : `${value.toFixed(0)}M`;
  }

  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  IC.initFinancialAnalytics = initFinancialAnalytics;
})();
