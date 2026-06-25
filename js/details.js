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

  IC.openIncidentDetail = openIncidentDetail;
  IC.openContractorDetail = openContractorDetail;
  IC.openClaimDetail = openClaimDetail;
})();