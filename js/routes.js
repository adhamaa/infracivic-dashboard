// js/routes.js -- lightweight sidebar route placeholders

(() => {
  const IC = window.IC = window.IC || {};
  let routeView;
  const routeMeta = {
    dashboard: { title: 'Dashboard', icon: 'mdi:home-outline', text: 'National command centre overview.' },
    packages: { title: 'Packages', icon: 'mdi:shield-check-outline', text: 'Package registry and work package controls will live here.' },
    works: { title: 'Works', icon: 'mdi:tools', text: 'Works progress, field verification, and site status view.' },
    claims: { title: 'Claims', icon: 'mdi:file-document-outline', text: 'Claims intake, evidence review, and approval queue.' },
    payments: { title: 'Payments', icon: 'mdi:credit-card-outline', text: 'Payment batches, release status, and reconciliation tools.' },
    concessionaires: { title: 'Concessionaires', icon: 'mdi:account-network-outline', text: 'Concessionaire performance, claims value, and SLA view.' },
    contractors: { title: 'Contractors', icon: 'mdi:account-group-outline', text: 'Contractor assignments, capacity, and response history.' },
    reports: { title: 'Reports & Analytics', icon: 'mdi:chart-line', text: 'Operational analytics and exported management reports.' },
    audit: { title: 'Audit Trail', icon: 'mdi:shield-key-outline', text: 'Trace approvals, status changes, and user activity.' },
    settings: { title: 'Settings', icon: 'mdi:cog-outline', text: 'Dashboard preferences and administrative configuration.' },
  };

  function initRoutes() {
    routeView = document.createElement('section');
    routeView.id = 'route-view';
    routeView.hidden = true;
    document.getElementById('main')?.appendChild(routeView);
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', event => {
        event.preventDefault();
        IC.setState({ route: item.dataset.route || 'dashboard' }, 'route');
      });
    });
    routeView.addEventListener('click', event => {
      if (event.target.closest('[data-back-dashboard]')) IC.setState({ route: 'dashboard' }, 'route');
    });
    IC.subscribe((_, reason) => {
      if (reason === 'route') renderRoute();
    });
    renderRoute();
  }

  function renderRoute() {
    const isDashboard = IC.state.route === 'dashboard';
    document.getElementById('app')?.classList.toggle('route-mode', !isDashboard);
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.route === IC.state.route));
    routeView.hidden = isDashboard;
    if (isDashboard) return;
    const meta = routeMeta[IC.state.route] || routeMeta.dashboard;
    routeView.innerHTML = `
      <div class="route-card">
        <iconify-icon icon="${meta.icon}"></iconify-icon>
        <h2>${meta.title}</h2>
        <p>${meta.text}</p>
        <button type="button" data-back-dashboard>Back to Dashboard</button>
      </div>
    `;
  }

  IC.initRoutes = initRoutes;
})();