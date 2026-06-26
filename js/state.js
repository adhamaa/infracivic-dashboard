// js/state.js -- shared in-memory state

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  const subscribers = new Set();

  const cloneIncident = incident => ({
    ...incident,
    timeline: incident.timeline.map(item => ({ ...item })),
  });

  const state = {
    route: 'dashboard',
    tab: 'commandCentre',
    view: 'map',
    filters: {
      concessions: [],
      states: [],
      status: 'all',
      period: '90d',
      dateRange: 'all',
      roadTypes: [...D.ROAD_TYPES],
      minCount: 0,
    },
    clusterView: true,
    basemap: 'osm',
    incidents: D.MAP_MARKERS.map(cloneIncident),
    alerts: D.ALERTS.map(alert => ({ ...alert })),
    newIncidentCounter: 1,
  };

  function notify(reason = 'state') {
    subscribers.forEach(callback => callback(state, reason));
  }

  function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  function setState(patch, reason = 'state') {
    const next = typeof patch === 'function' ? patch(state) : patch;
    if (!next) return;
    Object.assign(state, next);
    notify(reason);
  }

  function setFilters(patch) {
    state.filters = { ...state.filters, ...patch };
    notify('filters');
  }

  function syncAlertFromIncident(incident) {
    state.alerts.forEach(alert => {
      if (alert.markerId !== incident.id) return;
      alert.sev = incident.sev;
      alert.concession = incident.concession;
      alert.roadType = incident.roadType;
      alert.createdAt = incident.createdAt;
    });
  }

  function updateIncident(id, patch, reason = 'incident') {
    const incident = state.incidents.find(item => item.id === id);
    if (!incident) return;
    const draft = { ...incident, timeline: incident.timeline.map(item => ({ ...item })) };
    const next = typeof patch === 'function' ? patch(draft) : patch;
    Object.assign(incident, next);
    syncAlertFromIncident(incident);
    notify(reason);
  }

  function addIncident(incident, alert) {
    state.incidents.unshift({ ...incident, timeline: incident.timeline.map(item => ({ ...item })) });
    if (alert) state.alerts.unshift({ ...alert });
    notify('incident:add');
  }

  function getIncident(id) {
    return state.incidents.find(item => item.id === id);
  }

  function nextIncidentId() {
    const id = `inc-new-${String(state.newIncidentCounter).padStart(3, '0')}`;
    state.newIncidentCounter += 1;
    return id;
  }

  function cap(value) {
    const text = String(value || '');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  IC.state = state;
  IC.subscribe = subscribe;
  IC.setState = setState;
  IC.setFilters = setFilters;
  IC.updateIncident = updateIncident;
  IC.addIncident = addIncident;
  IC.getIncident = getIncident;
  IC.nextIncidentId = nextIncidentId;
  IC.cap = cap;
})();