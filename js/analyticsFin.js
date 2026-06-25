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
    IC.charts.createChart('fin-aging-chart', {
      data: grouped,
      series: [
        { type: 'bar', direction: 'vertical', xKey: 'bucket', yKey: 'submitted', yName: 'Submitted', stacked: true, fill: '#824acb', listeners: { nodeClick: bucketClick } },
        { type: 'bar', direction: 'vertical', xKey: 'bucket', yKey: 'review', yName: 'Under Review', stacked: true, fill: '#1976d2', listeners: { nodeClick: bucketClick } },
        { type: 'bar', direction: 'vertical', xKey: 'bucket', yKey: 'approved', yName: 'Approved', stacked: true, fill: '#2e8b45', listeners: { nodeClick: bucketClick } },
        { type: 'bar', direction: 'vertical', xKey: 'bucket', yKey: 'rejected', yName: 'Rejected', stacked: true, fill: '#ef3b3b', listeners: { nodeClick: bucketClick } },
      ],
      axes: [
        { type: 'category', position: 'bottom', label: { color: '#64748b', fontSize: 10 } },
        { type: 'number', position: 'left', label: { color: '#64748b', fontSize: 10 } },
      ],
      legend: { position: 'bottom' },
    });
  }

  function renderPaymentVelocity() {
    const totals = concessionItems(D.PAYMENT_VELOCITY).reduce((acc, item) => {
      acc.submitted += item.submitted;
      acc.approved += item.approved;
      acc.released += item.released;
      return acc;
    }, { stage: 'RM value', submitted: 0, approved: 0, released: 0 });
    IC.charts.createChart('fin-velocity-chart', {
      data: [totals],
      series: [
        { type: 'bar', direction: 'horizontal', xKey: 'stage', yKey: 'submitted', yName: 'Submitted', stacked: true, fill: '#824acb' },
        { type: 'bar', direction: 'horizontal', xKey: 'stage', yKey: 'approved', yName: 'Approved', stacked: true, fill: '#1976d2' },
        { type: 'bar', direction: 'horizontal', xKey: 'stage', yKey: 'released', yName: 'Released', stacked: true, fill: '#2e8b45' },
      ],
      axes: [
        { type: 'category', position: 'left', label: { enabled: false } },
        { type: 'number', position: 'bottom', label: { formatter: params => `RM ${params.value}M`, color: '#64748b', fontSize: 10 } },
      ],
      legend: { position: 'bottom' },
    });
    const approvedRate = totals.submitted ? totals.approved / totals.submitted * 100 : 0;
    const releasedRate = totals.approved ? totals.released / totals.approved * 100 : 0;
    setHtml('fin-velocity-labels', `
      <span>Submitted RM ${totals.submitted.toLocaleString('en-MY')}M</span>
      <span>${approvedRate.toFixed(1)}% approved</span>
      <span>${releasedRate.toFixed(1)}% released after approval</span>
    `);
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
    IC.charts.createChart('fin-budget-chart', {
      data,
      series: [
        { type: 'bar', direction: 'horizontal', xKey: 'concession', yKey: 'allocated', yName: 'Allocated', fill: '#cbd5e1' },
        { type: 'bar', direction: 'horizontal', xKey: 'concession', yKey: 'spent', yName: 'YTD Spent', fill: '#824acb' },
        { type: 'bar', direction: 'horizontal', xKey: 'concession', yKey: 'projected', yName: 'Projected', fill: '#ff7a16' },
      ],
      axes: [
        { type: 'category', position: 'left', label: { color: '#64748b', fontSize: 10 } },
        { type: 'number', position: 'bottom', label: { formatter: params => `RM ${params.value}M`, color: '#64748b', fontSize: 10 } },
      ],
      legend: { position: 'bottom' },
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
        { type: 'area', xKey: 'month', yKey: 'PLUS', yName: 'PLUS', stacked: true, fill: '#824acb', stroke: '#824acb' },
        { type: 'area', xKey: 'month', yKey: 'LITRAK', yName: 'LITRAK', stacked: true, fill: '#1976d2', stroke: '#1976d2' },
        { type: 'area', xKey: 'month', yKey: 'SPRINT', yName: 'SPRINT', stacked: true, fill: '#2e8b45', stroke: '#2e8b45' },
      ],
      axes: [
        { type: 'category', position: 'bottom', label: { enabled: false } },
        { type: 'number', position: 'left', label: { enabled: false } },
      ],
      legend: { enabled: false },
    });
    const statuses = concessionItems(D.BUDGET_BURN).map(item => {
      const spent = item.spent / item.allocated * 100;
      const klass = spent > 85 ? 'bad' : spent > 70 ? 'warn' : 'good';
      return `
        <div class="mini-row status-row">
          <span><strong>${item.concession}</strong><small>RM ${item.spent}M of RM ${item.allocated}M</small></span>
          <b class="${klass}">${spent.toFixed(0)}%</b>
        </div>
      `;
    }).join('');
    setHtml('fin-budget-status', statuses);
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
