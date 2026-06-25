// js/details.js -- incident detail modal and actions

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  function openIncidentDetail(id, assignMode = false) {
    const incident = IC.getIncident(id);
    if (!incident) return;
    const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
    IC.openModal({
      title: `${incident.kmLabel} · ${incident.location}`,
      body: renderDetailBody(incident, visual, assignMode),
      footer: renderDetailFooter(incident),
      afterOpen: root => bindDetailActions(root, incident),
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
})();