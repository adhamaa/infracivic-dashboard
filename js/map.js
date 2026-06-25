// js/map.js -- Leaflet map rendering and controls

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  let map;
  let markerLayer;
  let stateLayer;
  let currentBase;
  const baseLayers = {};
  const markerRefs = new Map();

  async function initMap() {
    const el = document.getElementById('map-chart');
    el.innerHTML = '';

    if (!window.L) {
      el.innerHTML = '<div class="map-empty"><strong>Map unavailable</strong><p>Leaflet could not be loaded.</p></div>';
      return;
    }

    const malaysiaBounds = L.latLngBounds([[0.85, 99.4], [7.65, 119.5]]);
    const peninsularBounds = L.latLngBounds([[1.15, 99.6], [6.85, 104.7]]);
    map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 5,
      maxZoom: 13,
      maxBounds: malaysiaBounds.pad(0.5),
      maxBoundsViscosity: 0.75,
    });

    baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    });
    baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri',
    });
    currentBase = baseLayers.osm.addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    map.fitBounds(peninsularBounds, { padding: [18, 18] });
    setTimeout(() => map.invalidateSize(), 0);

    markerLayer = L.layerGroup().addTo(map);
    await initStateLayer();
    renderMarkers();
    bindMapControls();
    IC.subscribe((_, reason) => {
      if (['filters', 'incident', 'incident:add', 'cluster', 'view'].includes(reason)) renderMarkers();
      if (reason === 'basemap') setBasemap(IC.state.basemap);
      syncMapMode();
    });
    syncMapMode();
  }

  async function initStateLayer() {
    const topology = await loadMalaysiaGeoJson();
    if (!topology) return;
    const stateCounts = new Map(D.STATE_DATA.map(({ state, incidentCount }) => [normalizeStateName(state), incidentCount]));
    stateLayer = L.geoJSON(topology, {
      style: feature => {
        const count = stateCounts.get(normalizeStateName(getFeatureStateName(feature))) || 0;
        return {
          color: '#6d28d9',
          weight: 0.8,
          opacity: 0.48,
          fillColor: getStateFill(count),
          fillOpacity: count ? 0.3 : 0.08,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = getFeatureStateName(feature);
        const count = stateCounts.get(normalizeStateName(name)) || 0;
        layer.bindTooltip(`${name}: ${count} incidents`, { className: 'incident-tip' });
      },
    }).addTo(map);
    stateLayer.bringToBack();
  }

  function bindMapControls() {
    document.getElementById('zoom-in')?.addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out')?.addEventListener('click', () => map.zoomOut());
    document.querySelector('#zoom-ctrls .zbtn[title="Layer toggle"]')?.addEventListener('click', () => {
      IC.setState({ basemap: IC.state.basemap === 'osm' ? 'satellite' : 'osm' }, 'basemap');
    });
    document.getElementById('cluster-toggle')?.addEventListener('change', event => {
      IC.setState({ clusterView: event.target.checked }, 'cluster');
    });
  }

  function renderMarkers() {
    if (!markerLayer) return;
    markerLayer.clearLayers();
    markerRefs.clear();
    IC.getFilteredIncidents().forEach(incident => {
      const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
      const size = IC.state.clusterView ? Math.max(22, Math.min(44, Math.round(18 + Math.sqrt(incident.count) * 4))) : 10;
      const marker = L.marker([incident.lat, incident.lng], {
        icon: L.divIcon({
          className: `incident-marker ${visual} ${incident.status} ${IC.state.clusterView ? 'cluster-marker' : 'dot-marker'}`,
          html: `<span>${IC.state.clusterView ? incident.count : ''}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
        title: `${D.SEVERITY_LABELS[visual] || IC.cap(visual)} incident cluster`,
      });
      marker.bindTooltip(`${incident.kmLabel} · ${D.SEVERITY_LABELS[visual] || IC.cap(visual)} · ${incident.count} incidents`, {
        className: 'incident-tip',
        direction: 'top',
        offset: [0, -size / 2],
      });
      marker.on('click', () => IC.openIncidentDetail(incident.id));
      marker.addTo(markerLayer);
      markerRefs.set(incident.id, marker);
    });
  }

  function setBasemap(type) {
    if (!map || !baseLayers[type]) return;
    if (currentBase) map.removeLayer(currentBase);
    currentBase = baseLayers[type].addTo(map);
    if (stateLayer) stateLayer.bringToBack();
  }

  function syncMapMode() {
    const mapWrap = document.getElementById('map-wrap');
    mapWrap?.classList.toggle('list-mode', IC.state.view === 'list');
    if (IC.state.view === 'map') setTimeout(() => map?.invalidateSize(), 0);
  }

  function pulseIncidentMarker(id) {
    const marker = markerRefs.get(id);
    const el = marker?.getElement();
    if (!el) return;
    el.classList.add('pulse-marker');
    setTimeout(() => el.classList.remove('pulse-marker'), 900);
  }

  function focusIncidentOnMap(id) {
    const incident = IC.getIncident(id);
    if (!map || !incident) return;
    IC.setState({ view: 'map' }, 'view');
    map.setView([incident.lat, incident.lng], Math.max(map.getZoom(), 9), { animate: true });
    setTimeout(() => pulseIncidentMarker(id), 250);
  }

  async function loadMalaysiaGeoJson() {
    for (const url of D.TOPO_URLS) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) return await res.json();
      } catch (_) {}
    }
    return null;
  }

  function getFeatureStateName(feature) {
    const props = feature?.properties || {};
    const keys = ['name', 'Name', 'NAME', 'NAME_1', 'state', 'shapeName', 'State', 'name_en'];
    const key = keys.find(k => props[k]);
    return key ? props[key] : 'Malaysia';
  }

  function normalizeStateName(name) {
    const cleaned = String(name || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[()]/g, ' ')
      .replace(/[^a-z0-9. ]/g, '')
      .replace(/\bw\.p\.\b/g, 'wp')
      .replace(/\bwilayah persekutuan\b/g, 'wp')
      .replace(/\s+/g, ' ')
      .trim();
    const aliases = { penang: 'pulau pinang', 'kuala lumpur': 'wp kuala lumpur', labuan: 'wp labuan', putrajaya: 'wp putrajaya' };
    return aliases[cleaned] || cleaned;
  }

  function getStateFill(count) {
    if (count >= 70) return '#5b21b6';
    if (count >= 55) return '#6d28d9';
    if (count >= 40) return '#8b5cf6';
    if (count >= 20) return '#a78bfa';
    return '#ddd6fe';
  }

  IC.initMap = initMap;
  IC.pulseIncidentMarker = pulseIncidentMarker;
  IC.focusIncidentOnMap = focusIncidentOnMap;
})();