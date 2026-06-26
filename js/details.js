// js/details.js -- incident detail modal and actions

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  function openIncidentDetail(id, assignMode = false) {
    const incident = IC.getIncident(id);
    if (!incident) return;
    if (!assignMode) IC.focusIncidentOnMap?.(id);
    const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
    IC.openModal({
      title: `${incident.kmLabel} · ${incident.location}`,
      body: renderDetailBody(incident, visual, assignMode),
      footer: renderDetailFooter(incident),
      afterOpen: root => bindDetailActions(root, incident),
      onClose: () => IC.clearFocusedRoute?.({ resetView: true }),
    });
  }

  function openContractorDetail(name) {
    const contractor = D.CONTRACTORS.find(item => item.name === name);
    if (!contractor) return;
    IC.openModal({
      title: contractor.name,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${contractor.sla >= 90 ? 'completed' : contractor.sla >= 82 ? 'medium' : 'critical'}">${contractor.sla}% SLA</span>
            <h3>${contractor.concession} maintenance contractor</h3>
            <p class="detail-meta">${contractor.jobs} jobs completed · ${contractor.avgResponse} average response · ${contractor.rework.toFixed(1)}% rework</p>
          </div>
          <div class="detail-owner">
            <span>Trend</span>
            <strong>${contractor.trend}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>SLA</span><p>${contractor.sla}% of assigned work closed within the target window.</p></div>
          <div class="tl-item"><span>Response</span><p>Average first response time is ${contractor.avgResponse} for the current period.</p></div>
          <div class="tl-item"><span>Quality</span><p>Rework rate is ${contractor.rework.toFixed(1)}%, tracked from field verification outcomes.</p></div>
        </div>
      `,
    });
  }

  function openClaimDetail(id) {
    const claim = D.OPEN_CLAIMS.find(item => item.id === id);
    if (!claim) return;
    IC.openModal({
      title: claim.id,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${claim.daysPending > 30 ? 'critical' : claim.daysPending > 20 ? 'medium' : 'completed'}">${claim.daysPending} days pending</span>
            <h3>RM ${claim.value.toFixed(1)}M open claim</h3>
            <p class="detail-meta">${claim.concession} · ${claim.status} · Current approver: ${claim.approver}</p>
          </div>
          <div class="detail-owner">
            <span>Approver</span>
            <strong>${claim.approver}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>Submitted</span><p>Claim entered the approval queue with site evidence attached.</p></div>
          <div class="tl-item"><span>${claim.status}</span><p>Current stage owned by ${claim.approver}.</p></div>
          <div class="tl-item"><span>Risk</span><p>${claim.daysPending > 30 ? 'Aging threshold exceeded; finance follow-up recommended.' : 'Within active review threshold.'}</p></div>
        </div>
      `,
    });
  }

  function renderDetailBody(incident, visual, assignMode) {
    return `
      <div class="detail-grid">
        <div>
          <span class="sev-pill ${visual}">${D.SEVERITY_LABELS[visual] || IC.cap(visual)}</span>
          <h3>${incident.description}</h3>
          <p class="detail-meta">${incident.concession} · ${D.ROAD_TYPE_LABELS[incident.roadType]} · ${D.STATUS_LABELS[incident.status]}</p>
        </div>
        <div class="detail-owner">
          <span>Owner</span>
          <strong>${incident.owner}</strong>
        </div>
      </div>
      <div class="timeline">
        ${incident.timeline.map(item => `<div class="tl-item"><span>${item.time}</span><p>${item.label}</p></div>`).join('')}
      </div>
      ${assignMode ? `<div class="assignee-list">${D.ASSIGNEES.map(name => `<button type="button" data-assignee="${name}">${name}</button>`).join('')}</div>` : ''}
    `;
  }

  function renderDetailFooter(incident) {
    const acknowledged = incident.status === 'acknowledged';
    const resolved = incident.status === 'resolved';
    return `
      <button class="modal-btn secondary" type="button" data-modal-close>Close</button>
      <button class="modal-btn" type="button" data-detail-action="assign">Assign</button>
      <button class="modal-btn" type="button" data-detail-action="ack" ${acknowledged || resolved ? 'disabled' : ''}>Acknowledge</button>
      <button class="modal-btn danger" type="button" data-detail-action="resolve" ${resolved ? 'disabled' : ''}>Resolve</button>
    `;
  }

  function bindDetailActions(root, incident) {
    root.querySelectorAll('[data-detail-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.detailAction;
        if (action === 'assign') openIncidentDetail(incident.id, true);
        if (action === 'ack') acknowledgeIncident(incident.id);
        if (action === 'resolve') resolveIncident(incident.id);
      });
    });
    root.querySelectorAll('[data-assignee]').forEach(button => {
      button.addEventListener('click', () => assignIncident(incident.id, button.dataset.assignee));
    });
  }

  function acknowledgeIncident(id) {
    IC.updateIncident(id, incident => ({
      status: 'acknowledged',
      timeline: [...incident.timeline, { time: 'Now', label: 'Command centre acknowledged the incident' }],
    }));
    IC.closeModal();
    IC.toast('Incident acknowledged', 'success');
  }

  function assignIncident(id, owner) {
    IC.updateIncident(id, incident => ({
      owner,
      timeline: [...incident.timeline, { time: 'Now', label: `${owner} assigned from command centre` }],
    }));
    IC.closeModal();
    IC.toast(`Assigned to ${owner}`, 'success');
  }

  function resolveIncident(id) {
    IC.updateIncident(id, incident => ({
      status: 'resolved',
      timeline: [...incident.timeline, { time: 'Now', label: 'Incident resolved and moved to completed status' }],
    }));
    IC.closeModal();
    IC.toast('Incident resolved', 'success');
  }

  function openBridgeDetail(name) {
    const bridge = D.BRIDGE_HEALTH.find(item => item.name === name);
    if (!bridge) return;
    const ratingClass = bridge.rating.toLowerCase();
    IC.openModal({
      title: bridge.name,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${bridge.score >= 80 ? 'completed' : bridge.score >= 70 ? 'medium' : 'critical'}">Score ${bridge.score}</span>
            <h3>${bridge.state} structural asset</h3>
            <p class="detail-meta">Rating <strong class="rating-${ratingClass}">${bridge.rating}</strong> · Next inspection ${bridge.due}</p>
          </div>
          <div class="detail-owner">
            <span>Rating</span>
            <strong>${bridge.rating}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>Score</span><p>Composite health index ${bridge.score} based on most recent inspection.</p></div>
          <div class="tl-item"><span>Due</span><p>Next scheduled inspection ${bridge.due}.</p></div>
          <div class="tl-item"><span>Recommendation</span><p>${bridge.score < 70 ? 'Schedule remedial works and reduce posted load.' : bridge.score < 80 ? 'Monitor and re-inspect within cycle.' : 'Healthy — keep on standard cycle.'}</p></div>
        </div>
      `,
    });
  }

  function openObligationDetail(item) {
    if (!item) return;
    const statusClass = (item.status || '').toLowerCase();
    IC.openModal({
      title: item.item,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${statusClass === 'due' ? 'critical' : statusClass === 'scheduled' ? 'medium' : 'completed'}">${item.status}</span>
            <h3>${item.concession} compliance obligation</h3>
            <p class="detail-meta">Target date ${item.date}</p>
          </div>
          <div class="detail-owner">
            <span>Status</span>
            <strong>${item.status}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>Owner</span><p>${item.concession} compliance team.</p></div>
          <div class="tl-item"><span>Date</span><p>Required by ${item.date}.</p></div>
          <div class="tl-item"><span>Action</span><p>${statusClass === 'due' ? 'Awaiting submission — escalate to ops lead.' : statusClass === 'scheduled' ? 'On track per current schedule.' : 'In planning phase; deliverables being scoped.'}</p></div>
        </div>
      `,
    });
  }

  function openRegionDetail(name) {
    const region = D.CREW_UTILISATION.find(item => item.region === name);
    if (!region) return;
    const status = region.utilisation > 90 ? 'over' : region.utilisation < 70 ? 'under' : 'ok';
    const statusText = status === 'over' ? 'Over-utilised' : status === 'under' ? 'Under-utilised' : 'Healthy load';
    IC.openModal({
      title: `${region.region} crews`,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${status === 'over' ? 'critical' : status === 'under' ? 'medium' : 'completed'}">${region.utilisation}% utilisation</span>
            <h3>${region.crews} crews deployed</h3>
            <p class="detail-meta">${statusText} · ${region.overtime} overtime hours this period</p>
          </div>
          <div class="detail-owner">
            <span>Status</span>
            <strong>${statusText}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>Capacity</span><p>${region.crews} crews currently rostered across the region.</p></div>
          <div class="tl-item"><span>Overtime</span><p>${region.overtime} OT hours recorded — ${region.overtime > 100 ? 'review staffing balance.' : 'within healthy band.'}</p></div>
          <div class="tl-item"><span>Recommendation</span><p>${status === 'over' ? 'Redistribute work or onboard additional crew.' : status === 'under' ? 'Capacity available for redeployment.' : 'No action required.'}</p></div>
        </div>
      `,
    });
  }

  function openExpiryDetail(bucket) {
    const row = D.EXPIRY_PIPELINE.find(item => item.bucket === bucket);
    if (!row) return;
    IC.openModal({
      title: `Expiring ${row.bucket}`,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${row.tone === 'critical' ? 'critical' : row.tone === 'high' ? 'medium' : 'completed'}">${row.count} items</span>
            <h3>${row.kind}</h3>
            <p class="detail-meta">Bucket: ${row.bucket}</p>
          </div>
          <div class="detail-owner">
            <span>Severity</span>
            <strong>${row.tone.toUpperCase()}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>Volume</span><p>${row.count} ${row.kind.toLowerCase()} fall within this expiry window.</p></div>
          <div class="tl-item"><span>Risk</span><p>${row.tone === 'critical' ? 'Immediate escalation — items expire inside the next week.' : row.tone === 'high' ? 'Plan submissions this fortnight to stay ahead.' : 'Track during normal monthly review.'}</p></div>
        </div>
      `,
    });
  }

  function openStateDetail(name) {
    const detail = D.getStateDetail?.(name);
    if (!detail) return;
    const riskClass = detail.openCritical >= 9 ? 'critical' : detail.openCritical >= 5 ? 'medium' : 'completed';
    IC.openModal({
      title: `${detail.state} operational snapshot`,
      body: `
        <div class="detail-grid">
          <div>
            <span class="sev-pill ${riskClass}">${detail.incidentCount} open incidents</span>
            <h3>${detail.primaryConcession} primary concession coverage</h3>
            <p class="detail-meta">${detail.roadKm} road km · ${detail.plazaCount} toll plazas · ${detail.contractorCount} active contractors</p>
          </div>
          <div class="detail-owner">
            <span>Revenue</span>
            <strong>${detail.monthRevenue}</strong>
          </div>
        </div>
        <div class="timeline">
          <div class="tl-item"><span>SLA</span><p>${detail.slaCompliance}% of defects were resolved within SLA in the selected period.</p></div>
          <div class="tl-item"><span>Response</span><p>Average first response time is ${detail.avgResponseHrs} hours across active contractors.</p></div>
          <div class="tl-item"><span>Severity</span><p>${detail.openCritical} critical, ${detail.openHigh} high, ${detail.openMedium} medium, and ${detail.openLow} low incidents remain open.</p></div>
          <div class="tl-item"><span>Coverage</span><p>${detail.contractorCount} contractors cover ${detail.roadKm} road km and ${detail.plazaCount} plazas in this state.</p></div>
        </div>
      `,
    });
  }

  IC.openIncidentDetail = openIncidentDetail;
  IC.openContractorDetail = openContractorDetail;
  IC.openClaimDetail = openClaimDetail;
  IC.openBridgeDetail = openBridgeDetail;
  IC.openObligationDetail = openObligationDetail;
  IC.openRegionDetail = openRegionDetail;
  IC.openExpiryDetail = openExpiryDetail;
  IC.openStateDetail = openStateDetail;
})();