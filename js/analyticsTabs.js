// js/analyticsTabs.js -- Stage 3 render functions for 7 new tabs

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  const SEV = D.SEV_COLORS;
  const CONC = D.CONC_COLORS;

  function initExtendedAnalytics() {
    renderAll();
    IC.subscribe((_, reason) => {
      if (['filters', 'tab'].includes(reason)) renderAll();
    });
  }

  function renderAll() {
    const tab = IC.state.tab;
    if (tab === 'incidents')      renderIncidentsTab();
    if (tab === 'traffic')        renderTrafficTab();
    if (tab === 'asset')          renderAssetTab();
    if (tab === 'sustainability') renderSustainabilityTab();
    if (tab === 'compliance')     renderComplianceTab();
    if (tab === 'workforce')      renderWorkforceTab();
    if (tab === 'reports')        renderReportsTab();
  }

  function tabPrimary() {
    return getComputedStyle(document.getElementById('app')).getPropertyValue('--tab-primary').trim() || '#7b3aed';
  }

  // ───────────────────────── INCIDENTS ─────────────────────────
  function renderIncidentsTab() {
    renderIncidentHourly();
    renderIncidentFeed();
    renderIncidentDispatch();
    renderIncidentRail();
  }

  function renderIncidentHourly() {
    if (!document.getElementById('inc-hourly-chart')) return;
    IC.charts.destroyChart('inc-hourly-chart');
    IC.charts.createChart('inc-hourly-chart', {
      data: D.INCIDENT_HOURLY,
      padding: { top: 14, right: 18, bottom: 38, left: 38 },
      series: [
        { type: 'bar', xKey: 'label', yKey: 'medium', yName: 'Medium', stacked: true, fill: SEV.medium, stroke: SEV.medium },
        { type: 'bar', xKey: 'label', yKey: 'high',   yName: 'High',   stacked: true, fill: SEV.high,   stroke: SEV.high },
        { type: 'bar', xKey: 'label', yKey: 'critical', yName: 'Critical', stacked: true, fill: SEV.critical, stroke: SEV.critical },
      ],
      axes: [
        { type: 'number', position: 'left', label: { fontSize: 10, color: '#475569' }, gridLine: { style: [{ stroke: '#e2e8f0' }] } },
        { type: 'category', position: 'bottom', label: { fontSize: 9, color: '#475569', rotation: -40 } },
      ],
      legend: { position: 'top', item: { label: { fontSize: 11 } } },
    });
  }

  function renderIncidentFeed() {
    const el = document.getElementById('inc-feed');
    if (!el) return;
    const items = (IC.getFilteredAlerts ? IC.getFilteredAlerts() : D.ALERTS).slice(0, 8);
    el.innerHTML = items.map(item => `
      <div class="inc-feed-row sev-${item.sev}">
        <span class="inc-pulse"></span>
        <div class="inc-feed-body">
          <div class="inc-feed-top"><strong>${item.km}</strong><span>${item.time}</span></div>
          <div class="inc-feed-desc">${item.desc}</div>
          <div class="inc-feed-meta"><span class="inc-tag">${item.concession}</span><span class="inc-tag sev-${item.sev}">${item.sev.toUpperCase()}</span></div>
        </div>
      </div>
    `).join('') || '<div class="rp-empty">No incidents match current filters.</div>';
  }

  function renderIncidentDispatch() {
    const el = document.getElementById('inc-dispatch');
    if (!el) return;
    const rows = IC.charts.filteredByConcession(D.INCIDENT_DISPATCH);
    el.innerHTML = rows.map(row => `
      <div class="dispatch-row">
        <div class="dispatch-info">
          <strong>${row.crew}</strong>
          <span>${row.concession} · ETA ${row.eta}</span>
        </div>
        <div class="dispatch-load">
          <div class="dispatch-bar"><span style="width:${row.load}%"></span></div>
          <span>${row.load}%</span>
        </div>
      </div>
    `).join('') || '<div class="rp-empty">No crews on this concession.</div>';
  }

  function renderIncidentRail() {
    const trio = document.getElementById('inc-kpi-trio');
    if (trio) {
      const incidents = IC.getFilteredIncidents ? IC.getFilteredIncidents() : [];
      const open = incidents.filter(i => i.status !== 'resolved').length;
      const critical = incidents.filter(i => i.sev === 'critical').length;
      const today = D.INCIDENT_HOURLY.reduce((sum, h) => sum + h.critical + h.high + h.medium, 0);
      trio.innerHTML = kpiTrio([
        { lbl: 'Open Incidents', val: open || '—', tone: 'orange', ico: 'mdi:alert' },
        { lbl: 'Critical Now',   val: critical,    tone: 'red',    ico: 'mdi:alarm-light' },
        { lbl: 'Last 24h',       val: today,       tone: 'blue',   ico: 'mdi:chart-bell-curve' },
      ]);
    }
    const breach = document.getElementById('inc-breach');
    if (breach) {
      const rows = (IC.getFilteredIncidents ? IC.getFilteredIncidents() : [])
        .filter(i => i.status !== 'resolved' && (i.sev === 'critical' || i.sev === 'high'))
        .slice(0, 4);
      breach.innerHTML = rows.map(item => `
        <div class="breach-row sev-${item.sev}">
          <div><strong>${item.kmLabel || item.description?.slice(0, 28) || 'Incident'}</strong><span>${item.concession || ''}</span></div>
          <span class="breach-tag">${item.sev.toUpperCase()}</span>
        </div>
      `).join('') || '<div class="rp-empty">No high-severity items.</div>';
    }
  }

  // ───────────────────────── TRAFFIC ─────────────────────────
  function renderTrafficTab() {
    renderTrafficFlow();
    renderPlazaList();
    renderHotspots();
    renderTrafficRail();
  }

  function renderTrafficFlow() {
    if (!document.getElementById('traf-flow-chart')) return;
    IC.charts.destroyChart('traf-flow-chart');
    IC.charts.createChart('traf-flow-chart', {
      data: D.TRAFFIC_FLOW,
      padding: { top: 14, right: 18, bottom: 36, left: 38 },
      series: [
        { type: 'area', xKey: 'hour', yKey: 'freeFlow', yName: 'Free-flow', fill: '#0891b2', fillOpacity: 0.18, stroke: '#0891b2', strokeWidth: 1, marker: { enabled: false } },
        { type: 'line', xKey: 'hour', yKey: 'measured', yName: 'Measured', stroke: '#dc2626', strokeWidth: 2.5, marker: { enabled: true, size: 4, fill: '#dc2626' } },
      ],
      axes: [
        { type: 'number', position: 'left', min: 0, max: 110, label: { fontSize: 10, color: '#475569' }, gridLine: { style: [{ stroke: '#e2e8f0' }] } },
        { type: 'category', position: 'bottom', label: { fontSize: 9, color: '#475569', rotation: -40 } },
      ],
      legend: { position: 'top', item: { label: { fontSize: 11 } } },
    });
  }

  function renderPlazaList() {
    const el = document.getElementById('traf-plaza-list');
    if (!el) return;
    const rows = IC.charts.filteredByState(IC.charts.filteredByConcession(D.TOLL_PLAZAS)).slice(0, 6);
    el.innerHTML = rows.map(row => `
      <div class="plaza-row">
        <div class="plaza-info">
          <strong>${row.plaza}</strong>
          <span>${row.concession} · ${row.state}</span>
        </div>
        <div class="plaza-metrics">
          <span class="plaza-revenue">RM ${row.revenue.toFixed(1)}M</span>
          <span class="plaza-change ${row.change >= 0 ? 'up' : 'down'}">${row.change >= 0 ? '▲' : '▼'} ${Math.abs(row.change).toFixed(1)}%</span>
        </div>
      </div>
    `).join('') || '<div class="rp-empty">No plazas match filters.</div>';
  }

  function renderHotspots() {
    const el = document.getElementById('traf-hotspots');
    if (!el) return;
    const rows = IC.charts.filteredByState(D.CONGESTION_HOTSPOTS).slice(0, 6);
    el.innerHTML = rows.map((row, i) => `
      <div class="hotspot-row">
        <span class="hotspot-rank">${i + 1}</span>
        <div class="hotspot-info">
          <strong>${row.corridor}</strong>
          <span>${row.state} · avg ${row.avgSpeed} km/h</span>
        </div>
        <div class="hotspot-jam" style="--jam:${row.jam * 10}%"><span></span><em>${row.jam.toFixed(1)}</em></div>
      </div>
    `).join('') || '<div class="rp-empty">No hotspots in filtered states.</div>';
  }

  function renderTrafficRail() {
    const trio = document.getElementById('traf-kpi-trio');
    if (trio) {
      const plazas = IC.charts.filteredByState(IC.charts.filteredByConcession(D.TOLL_PLAZAS));
      const totalRev = plazas.reduce((sum, p) => sum + p.revenue, 0);
      const totalThru = plazas.reduce((sum, p) => sum + p.throughput, 0);
      trio.innerHTML = kpiTrio([
        { lbl: 'Revenue Today', val: `RM ${totalRev.toFixed(1)}M`, tone: 'cyan',   ico: 'mdi:cash' },
        { lbl: 'Vehicles/hr',   val: totalThru.toLocaleString(),    tone: 'blue',   ico: 'mdi:car-multiple' },
        { lbl: 'Active Plazas', val: plazas.length,                 tone: 'green',  ico: 'mdi:gate' },
      ]);
    }
    if (document.getElementById('traf-revenue-chart')) {
      IC.charts.destroyChart('traf-revenue-chart');
      const plazas = IC.charts.filteredByState(IC.charts.filteredByConcession(D.TOLL_PLAZAS)).slice(0, 6);
      IC.charts.createChart('traf-revenue-chart', {
        data: plazas,
        padding: { top: 6, right: 12, bottom: 30, left: 32 },
        series: [{ type: 'bar', xKey: 'plaza', yKey: 'revenue', fill: '#0891b2', cornerRadius: 4 }],
        axes: [
          { type: 'number', position: 'left', label: { fontSize: 9, color: '#475569' } },
          { type: 'category', position: 'bottom', label: { fontSize: 9, color: '#475569', rotation: -40 } },
        ],
        legend: { enabled: false },
      });
    }
  }

  // ───────────────────────── ASSET PULSE ─────────────────────────
  function renderAssetTab() {
    renderPciChart();
    renderBridgeList();
    renderAssetRail();
  }

  function renderPciChart() {
    if (!document.getElementById('asset-pci-chart')) return;
    IC.charts.destroyChart('asset-pci-chart');
    const filtered = IC.charts.filteredByState(D.PCI_BY_STATE);
    const data = filtered.map(item => ({
      ...item,
      fill: item.pci >= 80 ? '#16a34a' : item.pci >= 70 ? '#d97706' : '#dc2626',
    }));
    IC.charts.createChart('asset-pci-chart', {
      data,
      padding: { top: 14, right: 18, bottom: 60, left: 38 },
      series: [{
        type: 'bar',
        xKey: 'state',
        yKey: 'pci',
        cornerRadius: 4,
        fill: '#2563eb',
        itemStyler: ({ datum }) => ({ fill: datum.fill, stroke: datum.fill }),
        tooltip: { renderer: ({ datum }) => ({ title: datum.state, content: `PCI ${datum.pci} · trend ${datum.trend > 0 ? '+' : ''}${datum.trend.toFixed(1)}` }) },
      }],
      axes: [
        { type: 'number', position: 'left', min: 50, max: 100, label: { fontSize: 10, color: '#475569' }, title: { text: 'PCI', fontSize: 11 } },
        { type: 'category', position: 'bottom', label: { fontSize: 9, color: '#475569', rotation: -45 } },
      ],
      legend: { enabled: false },
    });
  }

  function renderBridgeList() {
    const el = document.getElementById('asset-bridge-list');
    if (!el) return;
    const rows = IC.charts.filteredByState(D.BRIDGE_HEALTH);
    el.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Bridge</th><th>State</th><th>Score</th><th>Next inspection</th><th>Rating</th></tr></thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td><strong>${row.name}</strong></td>
              <td>${row.state}</td>
              <td><span class="score-pill score-${row.rating.toLowerCase()}">${row.score}</span></td>
              <td>${row.due}</td>
              <td><span class="rating-tag rating-${row.rating.toLowerCase()}">${row.rating}</span></td>
            </tr>
          `).join('') || '<tr><td colspan="5" class="data-empty">No bridges match filters.</td></tr>'}
        </tbody>
      </table>
    `;
  }

  function renderAssetRail() {
    const trio = document.getElementById('asset-kpi-trio');
    if (trio) {
      const pci = IC.charts.filteredByState(D.PCI_BY_STATE);
      const avg = pci.length ? pci.reduce((sum, p) => sum + p.pci, 0) / pci.length : 0;
      const watch = pci.filter(p => p.pci < 75).length;
      const inspections = pci.reduce((sum, p) => sum + p.inspections, 0);
      trio.innerHTML = kpiTrio([
        { lbl: 'Avg PCI',          val: avg.toFixed(1),  tone: 'blue',   ico: 'mdi:road-variant' },
        { lbl: 'States on watch',  val: watch,            tone: 'orange', ico: 'mdi:eye-outline' },
        { lbl: 'Inspections YTD',  val: inspections,      tone: 'green',  ico: 'mdi:clipboard-check' },
      ]);
    }
    if (document.getElementById('asset-rul-chart')) {
      IC.charts.destroyChart('asset-rul-chart');
      const data = IC.charts.filteredByState(D.PCI_BY_STATE).slice(0, 8);
      IC.charts.createChart('asset-rul-chart', {
        data,
        padding: { top: 6, right: 12, bottom: 36, left: 30 },
        series: [{ type: 'bar', xKey: 'state', yKey: 'rul', fill: '#2563eb', cornerRadius: 3 }],
        axes: [
          { type: 'number', position: 'left', label: { fontSize: 9, color: '#475569' }, title: { text: 'Years', fontSize: 10 } },
          { type: 'category', position: 'bottom', label: { fontSize: 9, color: '#475569', rotation: -45 } },
        ],
        legend: { enabled: false },
      });
    }
  }

  // ───────────────────────── SUSTAINABILITY ─────────────────────────
  function renderSustainabilityTab() {
    renderCo2Chart();
    renderEnergyMix();
    renderProcurement();
    renderSusRail();
  }

  function renderCo2Chart() {
    if (!document.getElementById('sus-co2-chart')) return;
    IC.charts.destroyChart('sus-co2-chart');
    const data = IC.charts.filteredByConcession(D.CO2_BY_CONCESSION);
    IC.charts.createChart('sus-co2-chart', {
      data,
      padding: { top: 14, right: 24, bottom: 36, left: 44 },
      series: [
        { type: 'bar', xKey: 'concession', yKey: 'reduced', yName: 'Reduced YTD', fill: '#16a34a', cornerRadius: 4 },
        { type: 'bar', xKey: 'concession', yKey: 'target',  yName: 'Target',      fill: '#86efac', cornerRadius: 4 },
      ],
      axes: [
        { type: 'number', position: 'left', label: { fontSize: 10, color: '#475569' }, title: { text: 'Tonnes CO₂', fontSize: 11 } },
        { type: 'category', position: 'bottom', label: { fontSize: 11, color: '#475569' } },
      ],
      legend: { position: 'top', item: { label: { fontSize: 11 } } },
    });
  }

  function renderEnergyMix() {
    if (!document.getElementById('sus-mix-chart')) return;
    IC.charts.destroyChart('sus-mix-chart');
    IC.charts.createChart('sus-mix-chart', {
      data: D.RENEWABLE_MIX,
      series: [{
        type: 'donut',
        angleKey: 'value',
        calloutLabelKey: 'source',
        innerRadiusRatio: 0.6,
        fills: ['#16a34a', '#0891b2', '#d97706', '#94a3b8'],
        strokes: ['#fff'], strokeWidth: 2,
        innerLabels: [
          { text: 'Renewable', fontSize: 11, color: '#64748b' },
          { text: '72%', fontSize: 20, fontWeight: 800, color: '#16a34a' },
        ],
        calloutLabel: { fontSize: 11 },
      }],
      legend: { position: 'right', item: { label: { fontSize: 11 } } },
    });
  }

  function renderProcurement() {
    if (!document.getElementById('sus-spend-chart')) return;
    IC.charts.destroyChart('sus-spend-chart');
    IC.charts.createChart('sus-spend-chart', {
      data: D.GREEN_PROCUREMENT,
      padding: { top: 12, right: 16, bottom: 30, left: 36 },
      series: [{
        type: 'area',
        xKey: 'month', yKey: 'spend',
        fill: '#16a34a', fillOpacity: 0.25,
        stroke: '#0f7e39', strokeWidth: 2,
        marker: { enabled: true, size: 5, fill: '#16a34a' },
      }],
      axes: [
        { type: 'number', position: 'left', label: { fontSize: 10, color: '#475569' } },
        { type: 'category', position: 'bottom', label: { fontSize: 10, color: '#475569' } },
      ],
      legend: { enabled: false },
    });
  }

  function renderSusRail() {
    const trio = document.getElementById('sus-kpi-trio');
    if (!trio) return;
    const data = IC.charts.filteredByConcession(D.CO2_BY_CONCESSION);
    const reduced = data.reduce((sum, c) => sum + c.reduced, 0);
    const target  = data.reduce((sum, c) => sum + c.target, 0);
    const pct = target ? Math.round((reduced / target) * 100) : 0;
    trio.innerHTML = kpiTrio([
      { lbl: 'CO₂ Reduced',     val: `${reduced}t`,  tone: 'green',  ico: 'mdi:leaf' },
      { lbl: 'Target Progress', val: `${pct}%`,      tone: 'blue',   ico: 'mdi:target' },
      { lbl: 'Renewable Mix',   val: '72%',          tone: 'orange', ico: 'mdi:solar-power' },
    ]);
  }

  // ───────────────────────── COMPLIANCE ─────────────────────────
  function renderComplianceTab() {
    renderObligationsChart();
    renderExpiryPipeline();
    renderObligationCalendar();
    renderComplianceRail();
  }

  function renderObligationsChart() {
    if (!document.getElementById('cmp-obligations-chart')) return;
    IC.charts.destroyChart('cmp-obligations-chart');
    const data = IC.charts.filteredByConcession(D.COMPLIANCE_OBLIGATIONS);
    IC.charts.createChart('cmp-obligations-chart', {
      data,
      padding: { top: 14, right: 18, bottom: 36, left: 42 },
      series: [
        { type: 'bar', xKey: 'concession', yKey: 'closed',   yName: 'Closed',    stacked: true, fill: '#a5b4fc', cornerRadius: 3 },
        { type: 'bar', xKey: 'concession', yKey: 'inReview', yName: 'In Review', stacked: true, fill: '#6366f1', cornerRadius: 3 },
        { type: 'bar', xKey: 'concession', yKey: 'open',     yName: 'Open',      stacked: true, fill: '#312e81', cornerRadius: 3 },
      ],
      axes: [
        { type: 'number', position: 'left', label: { fontSize: 10, color: '#475569' } },
        { type: 'category', position: 'bottom', label: { fontSize: 11, color: '#475569' } },
      ],
      legend: { position: 'top', item: { label: { fontSize: 11 } } },
    });
  }

  function renderExpiryPipeline() {
    const el = document.getElementById('cmp-expiry-pipeline');
    if (!el) return;
    el.innerHTML = D.EXPIRY_PIPELINE.map((row, i) => `
      <div class="expiry-step expiry-${row.tone}" style="--step:${i + 1}">
        <div class="expiry-count">${row.count}</div>
        <div class="expiry-body">
          <strong>${row.bucket}</strong>
          <span>${row.kind}</span>
        </div>
      </div>
    `).join('');
  }

  function renderObligationCalendar() {
    const el = document.getElementById('cmp-calendar');
    if (!el) return;
    const rows = IC.charts.filteredByConcession(D.COMPLIANCE_CALENDAR);
    el.innerHTML = rows.map(row => `
      <div class="cal-row">
        <div class="cal-date">${row.date}</div>
        <div class="cal-body">
          <strong>${row.item}</strong>
          <span>${row.concession}</span>
        </div>
        <span class="cal-status cal-${row.status.toLowerCase()}">${row.status}</span>
      </div>
    `).join('') || '<div class="rp-empty">No items match filters.</div>';
  }

  function renderComplianceRail() {
    const trio = document.getElementById('cmp-kpi-trio');
    if (trio) {
      const data = IC.charts.filteredByConcession(D.COMPLIANCE_OBLIGATIONS);
      const open = data.reduce((s, r) => s + r.open, 0);
      const review = data.reduce((s, r) => s + r.inReview, 0);
      const expiring = D.EXPIRY_PIPELINE.reduce((s, r) => s + r.count, 0);
      trio.innerHTML = kpiTrio([
        { lbl: 'Open Items',    val: open,     tone: 'orange', ico: 'mdi:folder-alert' },
        { lbl: 'In Review',     val: review,   tone: 'blue',   ico: 'mdi:gavel' },
        { lbl: 'Expiring 90d',  val: expiring, tone: 'red',    ico: 'mdi:calendar-alert' },
      ]);
    }
    const due = document.getElementById('cmp-due-week');
    if (due) {
      const rows = IC.charts.filteredByConcession(D.COMPLIANCE_CALENDAR).slice(0, 3);
      due.innerHTML = rows.map(row => `
        <div class="due-row">
          <div><strong>${row.item}</strong><span>${row.concession} · ${row.date}</span></div>
          <span class="due-tag">${row.status}</span>
        </div>
      `).join('') || '<div class="rp-empty">Nothing due this week.</div>';
    }
  }

  // ───────────────────────── WORKFORCE ─────────────────────────
  function renderWorkforceTab() {
    renderUtilGauges();
    renderSafetyChart();
    renderOvertimeChart();
    renderWorkforceRail();
  }

  function renderUtilGauges() {
    const el = document.getElementById('wf-util-gauges');
    if (!el) return;
    el.innerHTML = D.CREW_UTILISATION.map(row => {
      const status = row.utilisation > 90 ? 'over' : row.utilisation < 70 ? 'under' : 'ok';
      return `
        <div class="util-gauge util-${status}">
          <svg viewBox="0 0 120 70" class="gauge-svg">
            <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#e2e8f0" stroke-width="10" stroke-linecap="round"/>
            <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"
                  stroke-dasharray="${(row.utilisation / 100) * 157} 200"/>
          </svg>
          <div class="gauge-value">${row.utilisation}%</div>
          <div class="gauge-label">${row.region}</div>
          <div class="gauge-meta">${row.crews} crews · ${row.overtime}h OT</div>
        </div>
      `;
    }).join('');
  }

  function renderSafetyChart() {
    if (!document.getElementById('wf-safety-chart')) return;
    IC.charts.destroyChart('wf-safety-chart');
    IC.charts.createChart('wf-safety-chart', {
      data: D.SAFETY_INCIDENTS,
      padding: { top: 12, right: 16, bottom: 30, left: 32 },
      series: [
        { type: 'bar', xKey: 'month', yKey: 'minor', yName: 'Minor', stacked: true, fill: '#fbbf24', cornerRadius: 3 },
        { type: 'bar', xKey: 'month', yKey: 'major', yName: 'Major', stacked: true, fill: '#f97316', cornerRadius: 3 },
        { type: 'bar', xKey: 'month', yKey: 'lti',   yName: 'LTI',   stacked: true, fill: '#dc2626', cornerRadius: 3 },
      ],
      axes: [
        { type: 'number', position: 'left', label: { fontSize: 9, color: '#475569' } },
        { type: 'category', position: 'bottom', label: { fontSize: 10, color: '#475569' } },
      ],
      legend: { position: 'top', item: { label: { fontSize: 10 } } },
    });
  }

  function renderOvertimeChart() {
    if (!document.getElementById('wf-ot-chart')) return;
    IC.charts.destroyChart('wf-ot-chart');
    IC.charts.createChart('wf-ot-chart', {
      data: D.OVERTIME_HOTSPOTS,
      padding: { top: 12, right: 16, bottom: 30, left: 80 },
      series: [{
        type: 'bar',
        direction: 'horizontal',
        xKey: 'district',
        yKey: 'hours',
        cornerRadius: 3,
        fill: '#d97706',
        itemStyler: ({ datum }) => ({ fill: datum.change > 5 ? '#dc2626' : datum.change > 0 ? '#d97706' : '#16a34a' }),
        tooltip: { renderer: ({ datum }) => ({ title: datum.district, content: `${datum.hours} hours · ${datum.change > 0 ? '+' : ''}${datum.change}% MoM` }) },
      }],
      axes: [
        { type: 'category', position: 'left', label: { fontSize: 10, color: '#475569' } },
        { type: 'number',   position: 'bottom', label: { fontSize: 9, color: '#475569' } },
      ],
      legend: { enabled: false },
    });
  }

  function renderWorkforceRail() {
    const trio = document.getElementById('wf-kpi-trio');
    if (trio) {
      const totalCrews = D.CREW_UTILISATION.reduce((s, r) => s + r.crews, 0);
      const avgUtil = D.CREW_UTILISATION.reduce((s, r) => s + r.utilisation, 0) / D.CREW_UTILISATION.length;
      const ltiYtd = D.SAFETY_INCIDENTS.reduce((s, r) => s + r.lti, 0);
      trio.innerHTML = kpiTrio([
        { lbl: 'Total Crews',  val: totalCrews,         tone: 'blue',   ico: 'mdi:account-group' },
        { lbl: 'Avg Util',     val: `${avgUtil.toFixed(0)}%`, tone: 'orange', ico: 'mdi:gauge' },
        { lbl: 'LTI YTD',      val: ltiYtd,             tone: 'red',    ico: 'mdi:hospital' },
      ]);
    }
    const alerts = document.getElementById('wf-safety-alerts');
    if (alerts) {
      const recent = D.SAFETY_INCIDENTS.slice(-3).reverse();
      alerts.innerHTML = recent.map(m => `
        <div class="breach-row sev-${m.lti ? 'critical' : m.major ? 'high' : 'medium'}">
          <div><strong>${m.month} 2026</strong><span>${m.minor + m.major + m.lti} reports · ${m.lti} LTI</span></div>
          <span class="breach-tag">${m.lti ? 'LTI' : m.major ? 'MAJOR' : 'MINOR'}</span>
        </div>
      `).join('');
    }
  }

  // ───────────────────────── REPORTS ─────────────────────────
  function renderReportsTab() {
    renderReportLibrary();
    renderReportSchedule();
    renderReportsRail();
  }

  function renderReportLibrary() {
    const el = document.getElementById('rep-library');
    if (!el) return;
    el.innerHTML = `
      <table class="data-table report-table">
        <thead>
          <tr><th>Report</th><th>Owner</th><th>Last run</th><th>Schedule</th><th>Runs</th><th>Format</th><th></th></tr>
        </thead>
        <tbody>
          ${D.REPORTS_LIBRARY.map(r => `
            <tr>
              <td><strong>${r.name}</strong><div class="sub">${r.id}</div></td>
              <td>${r.owner}</td>
              <td>${r.lastRun}</td>
              <td>${r.schedule}</td>
              <td>${r.runs}</td>
              <td><span class="fmt-pill fmt-${r.fmt.toLowerCase()}">${r.fmt}</span></td>
              <td><button class="row-action" type="button" title="Run now"><iconify-icon icon="mdi:play"></iconify-icon></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderReportSchedule() {
    const el = document.getElementById('rep-schedule');
    if (!el) return;
    el.innerHTML = D.REPORTS_SCHEDULE.map(row => `
      <div class="sched-row">
        <div class="sched-time">${row.date}</div>
        <div class="sched-body"><strong>${row.name}</strong><span class="sched-tag sched-${row.status.toLowerCase()}">${row.status}</span></div>
      </div>
    `).join('');
  }

  function renderReportsRail() {
    const trio = document.getElementById('rep-kpi-trio');
    if (trio) {
      const total = D.REPORTS_LIBRARY.length;
      const runs = D.REPORTS_LIBRARY.reduce((s, r) => s + r.runs, 0);
      const queued = D.REPORTS_SCHEDULE.filter(r => r.status === 'Queued').length;
      trio.innerHTML = kpiTrio([
        { lbl: 'Saved Reports', val: total,  tone: 'blue',   ico: 'mdi:file-chart' },
        { lbl: 'Total Runs',    val: runs,   tone: 'green',  ico: 'mdi:counter' },
        { lbl: 'Queued',        val: queued, tone: 'orange', ico: 'mdi:clock-fast' },
      ]);
    }
    if (document.getElementById('rep-format-chart')) {
      IC.charts.destroyChart('rep-format-chart');
      const byFmt = {};
      D.REPORTS_LIBRARY.forEach(r => { byFmt[r.fmt] = (byFmt[r.fmt] || 0) + 1; });
      const data = Object.entries(byFmt).map(([fmt, count]) => ({ fmt, count }));
      IC.charts.createChart('rep-format-chart', {
        data,
        series: [{
          type: 'donut',
          angleKey: 'count',
          calloutLabelKey: 'fmt',
          innerRadiusRatio: 0.65,
          fills: ['#475569', '#94a3b8', '#cbd5e1'],
          strokes: ['#fff'], strokeWidth: 2,
          calloutLabel: { fontSize: 11 },
        }],
        legend: { enabled: false },
      });
    }
  }

  // ───────────────────────── helpers ─────────────────────────
  function kpiTrio(items) {
    return items.map(item => `
      <div class="kpi-card">
        <div class="kpi-lbl">${item.lbl}</div>
        <div class="kpi-num kn-${item.tone}">${item.val}</div>
        <div class="kpi-ico ico-${item.tone}"><iconify-icon icon="${item.ico}"></iconify-icon></div>
      </div>
    `).join('');
  }

  IC.initExtendedAnalytics = initExtendedAnalytics;
})();
