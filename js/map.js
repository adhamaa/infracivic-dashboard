// js/map.js -- Leaflet map rendering and controls

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  let map;
  let markerLayer;
  let stateLayer;
  let roadLayer;
  let roadSummaryControl;
  let focusRouteLayer;
  let defaultBounds;
  let currentBase;
  const baseLayers = {};
  const markerRefs = new Map();
  const stateRefs = new Map();
  const routeCache = new Map();
  const roadFeatureCache = new Map();
  let statePopup;
  let lastStateFilterKey = '';
  let lastMapTier = '';
  let activeRouteRequest = 0;
  let suppressStatePopupClose = false;
  const TIER_BREAKS = { nationalMax: 7, regionalMax: 10 };
  const SEVERITY_RANK = { completed: 0, low: 1, medium: 2, high: 3, critical: 4 };

  async function initMap() {
    const el = document.getElementById('map-chart');
    el.innerHTML = '';

    if (!window.L) {
      el.innerHTML = '<div class="map-empty"><strong>Map unavailable</strong><p>Leaflet could not be loaded.</p></div>';
      return;
    }

    const malaysiaBounds = L.latLngBounds([[0.85, 99.4], [7.65, 119.5]]);
    const peninsularBounds = L.latLngBounds([[1.15, 99.6], [6.85, 104.7]]);
    defaultBounds = peninsularBounds;
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
    roadLayer = L.layerGroup().addTo(map);
    focusRouteLayer = L.layerGroup().addTo(map);
    await initStateLayer();
    map.on('zoomend', handleZoomTierChange);
    renderMarkers();
    bindMapControls();
    IC.subscribe((_, reason) => {
      if (['filters', 'incident', 'incident:add', 'cluster', 'view'].includes(reason)) renderMarkers();
      if (reason === 'filters') syncStateSelection();
      if (reason === 'tab' && IC.state.tab === 'commandCentre') setTimeout(() => syncStateSelection({ fit: true, forceFit: true }), 0);
      if (reason === 'basemap') setBasemap(IC.state.basemap);
      syncMapMode();
    });
    syncStateSelection({ fit: IC.state.tab === 'commandCentre' && IC.state.filters.states.length > 0 });
    syncMapMode();
  }

  async function initStateLayer() {
    const topology = await loadMalaysiaGeoJson();
    if (!topology) return;
    stateRefs.clear();
    IC.state.stateCentroids = {};
    stateLayer = L.geoJSON(topology, {
      style: feature => {
        const name = getCanonicalStateName(getFeatureStateName(feature));
        return getStateStyle(name);
      },
      onEachFeature: (feature, layer) => {
        const name = getCanonicalStateName(getFeatureStateName(feature));
        const detail = D.getStateDetail?.(name);
        const count = detail?.incidentCount || 0;
        const key = normalizeStateName(name);
        layer._stateName = name;
        stateRefs.set(key, layer);
        IC.state.stateCentroids[name] = layer.getBounds().getCenter();
        layer.bindTooltip(`${name}: ${count} incidents`, { className: 'incident-tip' });
        layer.on({
          mouseover: () => highlightStateLayer(layer),
          mouseout: () => syncStateSelection({ fit: false }),
          click: event => handleStateClick(name, event.latlng),
        });
      },
    }).addTo(map);
    stateLayer.bringToBack();
  }

  function handleStateClick(name, latlng) {
    const current = IC.state.filters.states || [];
    const key = normalizeStateName(name);
    const isSoleSelection = current.length === 1 && normalizeStateName(current[0]) === key;
    IC.setFilters({ states: isSoleSelection ? [] : [name] });
    if (isSoleSelection) return;
    openStatePopup(name, latlng);
  }

  function highlightStateLayer(layer) {
    layer.setStyle({
      color: '#5b21b6',
      weight: 3,
      opacity: 0.9,
      fillOpacity: 0.06,
    });
    layer.bringToFront();
  }

  function syncStateSelection({ fit = true, forceFit = false } = {}) {
    if (!map || !stateLayer) return;
    const selected = IC.state.filters.states || [];
    const selectedKeys = new Set(selected.map(normalizeStateName));
    stateRefs.forEach(layer => {
      const key = normalizeStateName(layer._stateName);
      layer.setStyle(getStateStyle(layer._stateName, selectedKeys.has(key)));
      if (selectedKeys.has(key)) layer.bringToFront();
    });
    const stateKey = [...selectedKeys].sort().join('|');
    if (!fit || IC.state.tab !== 'commandCentre' || (!forceFit && stateKey === lastStateFilterKey)) return;
    lastStateFilterKey = stateKey;
    if (!stateKey) {
      suppressStatePopupClose = true;
      statePopup?.close();
      suppressStatePopupClose = false;
      map.flyToBounds(defaultBounds, { animate: true, duration: 0.55, padding: [18, 18] });
      return;
    }
    const bounds = getSelectedStateBounds(selectedKeys);
    if (bounds) {
      map.flyToBounds(bounds.pad(0.12), {
        animate: true,
        duration: 0.65,
        maxZoom: 9,
        paddingTopLeft: [250, 92],
        paddingBottomRight: [80, 120],
      });
    }
  }

  function getSelectedStateBounds(selectedKeys) {
    let bounds;
    selectedKeys.forEach(key => {
      const layer = stateRefs.get(key);
      if (!layer) return;
      bounds = bounds ? bounds.extend(layer.getBounds()) : layer.getBounds();
    });
    return bounds;
  }

  function getStateStyle(name, selected = false) {
    const count = D.getStateDetail?.(name)?.incidentCount || 0;
    return {
      color: selected ? '#4c1d95' : getStateFill(count),
      weight: selected ? 3 : 1.4,
      opacity: selected ? 0.95 : 0.78,
      fillColor: getStateFill(count),
      fillOpacity: selected ? 0.08 : 0.01,
    };
  }

  function getCanonicalStateName(name) {
    return D.getStateDetail?.(name)?.state || name;
  }

  function openStatePopup(name, latlng) {
    const detail = D.getStateDetail?.(name);
    if (!detail) return;
    suppressStatePopupClose = true;
    statePopup = L.popup({
      className: 'state-popup-shell',
      closeButton: true,
      autoClose: true,
      closeOnClick: false,
      maxWidth: 320,
    })
      .setLatLng(latlng)
      .setContent(renderStatePopup(detail))
      .openOn(map);
    suppressStatePopupClose = false;
    statePopup.on('remove', () => clearStateFilterFromPopup(detail.state));
    setTimeout(() => {
      document.querySelector('[data-state-detail]')?.addEventListener('click', () => IC.openStateDetail?.(detail.state));
    }, 0);
  }

  function clearStateFilterFromPopup(name) {
    if (suppressStatePopupClose) return;
    const selected = IC.state.filters.states || [];
    const key = normalizeStateName(name);
    if (!selected.some(state => normalizeStateName(state) === key)) return;
    IC.setFilters({ states: [] });
  }

  function renderStatePopup(detail) {
    return `
      <div class="state-popup">
        <div class="state-popup-head">
          <span>${detail.primaryConcession}</span>
          <strong>${detail.state}</strong>
        </div>
        <div class="state-popup-grid">
          <div><span>Incidents</span><strong>${detail.incidentCount}</strong></div>
          <div><span>SLA</span><strong>${detail.slaCompliance}%</strong></div>
          <div><span>Response</span><strong>${detail.avgResponseHrs}h</strong></div>
          <div><span>Critical</span><strong>${detail.openCritical}</strong></div>
          <div><span>Road km</span><strong>${detail.roadKm}</strong></div>
          <div><span>Plazas</span><strong>${detail.plazaCount}</strong></div>
        </div>
        <button type="button" class="state-popup-btn" data-state-detail="${detail.state}">View full snapshot</button>
      </div>
    `;
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

  function handleZoomTierChange() {
    const tier = getMapTier(map.getZoom());
    if (tier === lastMapTier && IC.state.clusterView) return;
    renderMarkers();
  }

  function getMapTier(zoom) {
    if (zoom <= TIER_BREAKS.nationalMax) return 'national';
    if (zoom <= TIER_BREAKS.regionalMax) return 'regional';
    return 'road';
  }

  function renderMarkers() {
    if (!markerLayer) return;
    markerLayer.clearLayers();
    markerRefs.clear();
    const incidents = IC.getFilteredIncidents();
    const tier = IC.state.clusterView ? getMapTier(map.getZoom()) : 'raw';
    lastMapTier = tier;
    renderRoadLayer(tier);
    if (tier === 'national') {
      renderStateBadges(incidents);
      return;
    }
    if (tier === 'road') {
      renderRoadLevelMarkers(incidents);
      return;
    }
    renderRegionalMarkers(incidents, tier === 'regional');
  }

  function renderRegionalMarkers(incidents, clustered = true) {
    incidents.forEach(incident => {
      const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
      const size = clustered ? Math.max(22, Math.min(44, Math.round(18 + Math.sqrt(incident.count) * 4))) : 10;
      const marker = L.marker([incident.lat, incident.lng], {
        icon: L.divIcon({
          className: `incident-marker ${visual} ${incident.status} ${clustered ? 'cluster-marker' : 'dot-marker'}`,
          html: `<span>${clustered ? incident.count : ''}</span>`,
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

  function renderStateBadges(incidents) {
    const grouped = new Map();
    incidents.forEach(incident => {
      const key = normalizeStateName(incident.state);
      const current = grouped.get(key) || {
        state: incident.state,
        total: 0,
        breakdown: { critical: 0, high: 0, medium: 0, low: 0, completed: 0 },
        visual: 'completed',
      };
      const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
      current.total += Number(incident.count) || 0;
      current.breakdown[visual] += Number(incident.count) || 0;
      if (SEVERITY_RANK[visual] > SEVERITY_RANK[current.visual]) current.visual = visual;
      grouped.set(key, current);
    });

    grouped.forEach(group => {
      const centroid = IC.state.stateCentroids?.[group.state] || getStateCentroid(group.state);
      if (!centroid) return;
      const size = Math.max(30, Math.min(52, Math.round(24 + Math.sqrt(group.total) * 3.2)));
      const marker = L.marker(centroid, {
        icon: L.divIcon({
          className: `incident-marker state-badge ${group.visual}`,
          html: `<span>${group.total}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
        title: `${group.state}: ${group.total} incidents`,
        riseOnHover: true,
      });
      marker.bindTooltip(renderStateBadgeTooltip(group), {
        className: 'incident-tip',
        direction: 'top',
        offset: [0, -size / 2],
      });
      marker.on('click', () => IC.setFilters({ states: [group.state] }));
      marker.addTo(markerLayer);
      markerRefs.set(`state:${normalizeStateName(group.state)}`, marker);
    });
  }

  function getStateCentroid(name) {
    const layer = stateRefs.get(normalizeStateName(name));
    return layer?.getBounds().getCenter() || null;
  }

  function renderStateBadgeTooltip(group) {
    const parts = ['critical', 'high', 'medium', 'low', 'completed']
      .filter(key => group.breakdown[key] > 0)
      .map(key => `${group.breakdown[key]} ${D.SEVERITY_LABELS[key].toLowerCase()}`);
    return `${group.state}: ${group.total} total · ${parts.join(' · ')}`;
  }

  function renderRoadLevelMarkers(incidents) {
    incidents.forEach(incident => {
      const visual = incident.status === 'resolved' ? 'completed' : incident.sev;
      const positions = getRoadDotPositions(incident);
      positions.forEach((position, index) => {
        const size = 9;
        const marker = L.marker(position, {
          icon: L.divIcon({
            className: `incident-marker road-dot ${visual} ${incident.status}`,
            html: '<span></span>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
          title: `${D.SEVERITY_LABELS[visual] || IC.cap(visual)} incident`,
          zIndexOffset: index,
        });
        marker.bindTooltip(`${incident.kmLabel} · ${incident.location}`, {
          className: 'incident-tip',
          direction: 'top',
          offset: [0, -6],
        });
        marker.on('click', () => IC.openIncidentDetail(incident.id));
        marker.addTo(markerLayer);
        if (index === 0) markerRefs.set(incident.id, marker);
      });
    });
  }

  function getRoadDotPositions(incident) {
    const count = Math.max(1, Number(incident.count) || 1);
    const road = getRoadFeature(incident.roadId);
    if (!road) return getFallbackDotPositions(incident, count);
    const path = roadToLatLngs(road);
    const snap = snapToPolyline([incident.lat, incident.lng], path);
    return Array.from({ length: count }, (_, index) => offsetAlongRoad(snap, index, count));
  }

  function getFallbackDotPositions(incident, count) {
    const columns = Math.ceil(Math.sqrt(count));
    const spacing = 0.0042;
    return Array.from({ length: count }, (_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const latOffset = (row - columns / 2) * spacing;
      const lngOffset = (column - columns / 2) * spacing;
      return [incident.lat + latOffset, incident.lng + lngOffset];
    });
  }

  function renderRoadLayer(tier) {
    if (!roadLayer) return;
    roadLayer.clearLayers();
    if (roadSummaryControl) {
      roadSummaryControl.remove();
      roadSummaryControl = null;
    }
    if (tier !== 'road') return;
    const visibleTypes = new Set(IC.state.filters.roadTypes || []);
    let visibleCount = 0;
    getRoadFeatures().forEach(feature => {
      const type = feature.properties?.type || 'expressway';
      if (!visibleTypes.has(type)) return;
      visibleCount += 1;
      const line = L.polyline(roadToLatLngs(feature), {
        color: getRoadColor(type),
        weight: 4,
        opacity: 0.72,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
        className: `road-polyline road-polyline-${type}`,
      }).addTo(roadLayer);
      line.bindTooltip(feature.properties?.id || feature.properties?.name || IC.cap(type), {
        className: 'road-label',
        permanent: true,
        direction: 'center',
        opacity: 0.88,
      });
    });
    renderRoadModeSummary(visibleCount, visibleTypes);
  }

  function renderRoadModeSummary(visibleCount, visibleTypes) {
    const enabled = ['expressway', 'federal', 'state', 'district'].filter(type => visibleTypes.has(type));
    roadSummaryControl = L.control({ position: 'bottomleft' });
    roadSummaryControl.onAdd = () => {
      const summary = L.DomUtil.create('div', 'road-mode-summary');
      summary.innerHTML = `<strong>Road level</strong><span>${visibleCount} routes visible · ${enabled.map(IC.cap).join(', ') || 'No layers'}</span>`;
      L.DomEvent.disableClickPropagation(summary);
      return summary;
    };
    roadSummaryControl.addTo(map);
  }

  function getRoadFeatures() {
    return window.IC_ROADS?.features || [];
  }

  function getRoadFeature(id) {
    if (!id) return null;
    if (roadFeatureCache.has(id)) return roadFeatureCache.get(id);
    const feature = getRoadFeatures().find(item => item.properties?.id === id) || null;
    roadFeatureCache.set(id, feature);
    return feature;
  }

  function roadToLatLngs(feature) {
    return (feature.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]);
  }

  function getRoadColor(type) {
    const colors = { expressway: '#5b21b6', federal: '#2563eb', state: '#16a34a', district: '#d97706' };
    return colors[type] || colors.expressway;
  }

  function snapToPolyline(point, path) {
    let best = { point, segment: [[point[0], point[1]], [point[0], point[1]]], distance: Infinity };
    for (let index = 0; index < path.length - 1; index += 1) {
      const start = path[index];
      const end = path[index + 1];
      const candidate = closestPointOnSegment(point, start, end);
      const distance = getPointDistance(point, candidate);
      if (distance < best.distance) best = { point: candidate, segment: [start, end], distance };
    }
    return best;
  }

  function closestPointOnSegment(point, start, end) {
    const x = point[1];
    const y = point[0];
    const x1 = start[1];
    const y1 = start[0];
    const x2 = end[1];
    const y2 = end[0];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    if (!lengthSq) return start;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSq));
    return [y1 + t * dy, x1 + t * dx];
  }

  function offsetAlongRoad(snap, index, count) {
    const [start, end] = snap.segment;
    const latDelta = end[0] - start[0];
    const lngDelta = end[1] - start[1];
    const length = Math.hypot(latDelta, lngDelta) || 1;
    const unitLat = latDelta / length;
    const unitLng = lngDelta / length;
    const spread = Math.min(0.0065, 0.14 / Math.max(1, count));
    const along = (index - (count - 1) / 2) * spread;
    const side = ((index % 3) - 1) * 0.0007;
    return [
      snap.point[0] + unitLat * along - unitLng * side,
      snap.point[1] + unitLng * along + unitLat * side,
    ];
  }

  function getPointDistance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
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

  async function focusIncidentOnMap(id) {
    const incident = IC.getIncident(id);
    if (!map || !incident) return;
    const requestId = ++activeRouteRequest;
    IC.setState({ view: 'map' }, 'view');
    focusRouteLayer?.clearLayers();
    map.flyTo([incident.lat, incident.lng], Math.max(map.getZoom(), 9), { animate: true, duration: 0.45 });
    const routePath = await getIncidentRoutePath(incident);
    if (requestId !== activeRouteRequest) return;
    drawFocusRoute(routePath, incident);
    frameFocusedRoute(routePath, incident);
    setTimeout(() => pulseIncidentMarker(id), 650);
  }

  function clearFocusedRoute({ resetView = false } = {}) {
    activeRouteRequest += 1;
    focusRouteLayer?.clearLayers();
    if (resetView && map && defaultBounds) {
      map.flyToBounds(defaultBounds, {
        animate: true,
        duration: 0.65,
        padding: [18, 18],
      });
    }
  }

  function drawFocusRoute(routePath, incident) {
    if (!focusRouteLayer) return;
    focusRouteLayer.clearLayers();
    if (routePath.length > 1) {
      L.polyline(routePath, {
        color: '#ffffff',
        weight: 10,
        opacity: 0.92,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
        className: 'focus-route-halo',
      }).addTo(focusRouteLayer);
      L.polyline(routePath, {
        color: '#824acb',
        weight: 5,
        opacity: 0.96,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
        className: 'focus-route-line',
      }).addTo(focusRouteLayer);
    }
    L.circleMarker([incident.lat, incident.lng], {
      radius: 13,
      color: '#ffffff',
      weight: 3,
      fillColor: D.SEV_COLORS[incident.status === 'resolved' ? 'completed' : incident.sev],
      fillOpacity: 0.88,
    }).addTo(focusRouteLayer);
  }

  function frameFocusedRoute(routePath, incident) {
    if (routePath.length > 1) {
      map.flyToBounds(L.latLngBounds(routePath).pad(0.35), {
        animate: true,
        duration: 0.65,
        maxZoom: Math.max(map.getZoom(), 12),
        paddingTopLeft: [250, 92],
        paddingBottomRight: [80, 120],
      });
      return;
    }
    map.flyTo([incident.lat, incident.lng], Math.max(map.getZoom(), 12), { animate: true, duration: 0.65 });
  }

  async function getIncidentRoutePath(incident) {
    if (routeCache.has(incident.id)) return routeCache.get(incident.id);
    for (const [start, end] of getRouteEndpointCandidates(incident)) {
      const route = await fetchRoadRoute(start, end);
      if (route?.length > 1) {
        routeCache.set(incident.id, route);
        return route;
      }
    }
    const pointOnly = [[incident.lat, incident.lng]];
    routeCache.set(incident.id, pointOnly);
    return pointOnly;
  }

  async function fetchRoadRoute(start, end) {
    const url = new URL(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}`);
    url.searchParams.set('overview', 'full');
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('steps', 'false');
    url.searchParams.set('radiuses', '4000;4000');
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6500) });
      if (!res.ok) return null;
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route || route.distance > 50000) return null;
      return route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    } catch (_) {
      return null;
    }
  }

  function getRouteEndpointCandidates(incident) {
    const profiles = {
      expressway: [[0.055, 0.035], [0.045, -0.045], [0.065, 0.000]],
      federal: [[0.045, -0.028], [0.000, 0.055], [0.050, 0.030]],
      state: [[0.036, 0.020], [0.020, -0.038], [0.046, 0.000]],
      district: [[0.026, -0.018], [0.000, 0.032], [0.030, 0.016]],
    };
    return (profiles[incident.roadType] || profiles.expressway).map(([latDelta, lngDelta]) => [
      [incident.lat - latDelta, incident.lng - lngDelta],
      [incident.lat + latDelta, incident.lng + lngDelta],
    ]);
  }

  async function loadMalaysiaGeoJson() {
    if (window.IC_MALAYSIA_GEOJSON) return window.IC_MALAYSIA_GEOJSON;
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
    const aliases = { penang: 'pulau pinang', malacca: 'melaka', 'kuala lumpur': 'wp kuala lumpur', labuan: 'wp labuan', putrajaya: 'wp putrajaya' };
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
  IC.invalidateMap = () => map?.invalidateSize();
  IC.pulseIncidentMarker = pulseIncidentMarker;
  IC.focusIncidentOnMap = focusIncidentOnMap;
  IC.clearFocusedRoute = clearFocusedRoute;
  IC.normalizeStateName = normalizeStateName;
})();