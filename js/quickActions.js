// js/quickActions.js -- bottom quick action cards

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;

  function initQuickActions() {
    document.querySelectorAll('[data-action]').forEach(card => {
      card.addEventListener('click', () => openAction(card.dataset.action));
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openAction(card.dataset.action);
        }
      });
    });
  }

  function openAction(action) {
    if (action === 'create-package') return openCreatePackage();
    if (action === 'register-defect') return openRegisterDefect();
    if (action === 'track-claim') return openTrackClaim();
    if (action === 'payment-overview') return openPaymentOverview();
  }

  function openCreatePackage() {
    IC.openModal({
      title: 'Create Package',
      body: `
        <form class="modal-form" id="create-package-form">
          <label>Package name<input name="name" required placeholder="Bridge rehabilitation package"></label>
          <label>Concession<select name="concession">${D.CONCESSIONS.map(item => `<option>${item}</option>`).join('')}</select></label>
          <label>Estimated value<input name="value" required placeholder="RM 18.5M"></label>
        </form>
      `,
      footer: '<button class="modal-btn secondary" type="button" data-modal-close>Cancel</button><button class="modal-btn" type="button" data-submit-form="create-package-form">Create Package</button>',
      afterOpen: root => bindFormSubmit(root, 'create-package-form', () => {
        IC.closeModal();
        IC.toast('Package created (mock)', 'success');
      }),
    });
  }

  function openRegisterDefect() {
    IC.openModal({
      title: 'Register Defect',
      body: `
        <form class="modal-form" id="register-defect-form">
          <label>KM / road label<input name="km" required placeholder="KM 48.2 (E1)"></label>
          <label>Severity<select name="sev"><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
          <label>Concession<select name="concession">${D.CONCESSIONS.map(item => `<option>${item}</option>`).join('')}</select></label>
          <label>Description<textarea name="description" required placeholder="Describe the defect"></textarea></label>
        </form>
      `,
      footer: '<button class="modal-btn secondary" type="button" data-modal-close>Cancel</button><button class="modal-btn" type="button" data-submit-form="register-defect-form">Register Defect</button>',
      afterOpen: root => bindFormSubmit(root, 'register-defect-form', form => {
        const id = IC.nextIncidentId();
        const sev = form.sev.value;
        const index = IC.state.incidents.length;
        const incident = {
          id,
          lat: 3.08 + (index % 4) * 0.18,
          lng: 101.55 + (index % 5) * 0.2,
          count: sev === 'critical' ? 6 : 4,
          sev,
          concession: form.concession.value,
          roadType: 'expressway',
          status: 'open',
          owner: D.ASSIGNEES[index % D.ASSIGNEES.length],
          createdAt: new Date().toISOString(),
          description: form.description.value,
          kmLabel: form.km.value,
          km: form.km.value,
          location: 'Newly registered field report',
          timeline: [
            { time: 'Now', label: 'Defect registered from quick action form' },
            { time: 'Pending', label: 'Awaiting field crew validation' },
          ],
        };
        IC.addIncident(incident, {
          id: `alert-${id}`,
          markerId: id,
          km: incident.kmLabel,
          desc: incident.description,
          sev: incident.sev,
          time: 'just now',
          concession: incident.concession,
          roadType: incident.roadType,
          createdAt: incident.createdAt,
        });
        IC.closeModal();
        IC.toast('Defect registered and added to the map', 'success');
      }),
    });
  }

  function openTrackClaim() {
    IC.openModal({
      title: 'Track Claim',
      body: '<form class="modal-form" id="track-claim-form"><label>Claim ID<input name="claim" required placeholder="CLM-2026-0184"></label></form>',
      footer: '<button class="modal-btn secondary" type="button" data-modal-close>Cancel</button><button class="modal-btn" type="button" data-submit-form="track-claim-form">Track Claim</button>',
      afterOpen: root => bindFormSubmit(root, 'track-claim-form', form => {
        IC.openModal({
          title: `Claim ${form.claim.value}`,
          body: '<div class="timeline"><div class="tl-item"><span>Submitted</span><p>Claim package received by JKR reviewer.</p></div><div class="tl-item"><span>Review</span><p>Technical evidence validation in progress.</p></div><div class="tl-item"><span>Next</span><p>Finance approval queued for payment run.</p></div></div>',
        });
      }),
    });
  }

  function openPaymentOverview() {
    IC.openModal({
      title: 'Payment Overview',
      body: `<div class="payment-list">${D.PAYMENTS.map(payment => `<div><strong>${payment.id}</strong><span>${payment.concession}</span><b>${payment.amount}</b><em>${payment.status}</em></div>`).join('')}</div>`,
    });
  }

  function bindFormSubmit(root, formId, onSubmit) {
    const form = root.querySelector(`#${formId}`);
    root.querySelector(`[data-submit-form="${formId}"]`)?.addEventListener('click', () => form.requestSubmit());
    form.addEventListener('submit', event => {
      event.preventDefault();
      onSubmit(form);
    });
  }

  IC.initQuickActions = initQuickActions;
})();