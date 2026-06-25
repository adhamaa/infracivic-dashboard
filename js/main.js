// js/main.js ── InfraCivic 2.0 Dashboard initialisation

document.addEventListener('DOMContentLoaded', () => {
  renderAlerts();
  initSparklines();
  initConcessionairesChart();
  initMap();
  initViewToggle();
  initNavItems();
});

/* ── Utility ─────────────────────────────────────────────── */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ── Nav + View Toggle ───────────────────────────────────── */
function initNavItems() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function initViewToggle() {
  const btnMap  = document.getElementById('btn-map');
  const btnList = document.getElementById('btn-list');
  btnMap.addEventListener('click',  () => { btnMap.classList.add('active');  btnList.classList.remove('active'); });
  btnList.addEventListener('click', () => { btnList.classList.add('active'); btnMap.classList.remove('active'); });
}

/* ── Latest Alerts ───────────────────────────────────────── */
function renderAlerts() {
  document.getElementById('alerts-list').innerHTML = ALERTS.map(a => `
    <div class="alert-row">
      <span class="a-dot ${a.sev}"></span>
      <span class="a-text">${a.km} — ${a.desc}</span>
      <span class="a-badge ${a.sev}">${cap(a.sev)}</span>
      <span class="a-time">${a.time}</span>
    </div>
  `).join('');
}

/* ── Sparkline Charts ────────────────────────────────────── */
function initSparklines() {
  const mkSpark = (id, data, color) => {
    const el = document.getElementById(id);
    if (!el) return;

    const values = data.map(d => d.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - min) / span) * 22 - 3;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    el.innerHTML = `
      <svg class="spark-svg" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  };

  mkSpark('spark-approval', SPARKLINES.approval, '#3b82f6');
  mkSpark('spark-success',  SPARKLINES.success,  '#22c55e');
  mkSpark('spark-payment',  SPARKLINES.payment,  '#22c55e');
}

/* ── Concessionaires Horizontal Bar Chart ────────────────── */
function initConcessionairesChart() {
  const el = document.getElementById('chart-conc');
  if (!el) return;

  const maxValue = Math.max(...CONCESSIONAIRES.map(item => item.value));
  el.innerHTML = CONCESSIONAIRES.map((item, index) => `
    <div class="conc-row">
      <span class="conc-name">${item.name}</span>
      <div class="conc-track">
        <span class="conc-bar" style="width:${(item.value / maxValue * 100).toFixed(1)}%;background:${CONC_COLORS[index % CONC_COLORS.length]}"></span>
      </div>
      <span class="conc-value">RM&nbsp;${item.value}M</span>
    </div>
  `).join('');
}

/* ── Malaysia Map ────────────────────────────────────────── */
async function initMap() {
  const el = document.getElementById('map-chart');

  el.innerHTML = ''; // remove loading spinner

  if (!window.L) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;
                  height:100%;flex-direction:column;gap:10px;
                  color:#64748b;font-size:13px;text-align:center;padding:20px;">
        <span style="font-size:36px">🗺️</span>
        <strong>Map unavailable</strong>
        <p style="font-size:11px;max-width:260px;line-height:1.6;">
          Leaflet could not be loaded. Check your internet connection
          or host the Leaflet assets locally.
        </p>
      </div>`;
    return;
  }

  const malaysiaBounds = L.latLngBounds([[0.85, 99.4], [7.65, 119.5]]);
  const peninsularBounds = L.latLngBounds([[1.15, 99.6], [6.85, 104.7]]);
  const map = L.map(el, {
    zoomControl: false,
    attributionControl: false,
    minZoom: 5,
    maxZoom: 13,
    maxBounds: malaysiaBounds.pad(0.5),
    maxBoundsViscosity: 0.75,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

  map.fitBounds(peninsularBounds, { padding: [18, 18] });
  setTimeout(() => map.invalidateSize(), 0);

  const markerLayer = L.layerGroup().addTo(map);
  MAP_MARKERS.forEach(marker => {
    const size = Math.max(22, Math.min(44, Math.round(18 + Math.sqrt(marker.count) * 4)));
    L.marker([marker.lat, marker.lng], {
      icon: L.divIcon({
        className: `incident-marker ${marker.sev}`,
        html: `<span>${marker.count}</span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      }),
      title: `${cap(marker.sev)} incident cluster`,
    })
      .bindTooltip(`${cap(marker.sev)} · ${marker.count} incidents`, {
        className: 'incident-tip',
        direction: 'top',
        offset: [0, -size / 2],
      })
      .addTo(markerLayer);
  });

  let stateLayer = null;
  const topology = await loadMalaysiaGeoJson();
  if (topology) {
    const stateCounts = new Map(
      STATE_DATA.map(({ state, incidentCount }) => [normalizeStateName(state), incidentCount])
    );

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

  document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn());
  document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut());

  const layersBtn = document.querySelector('#zoom-ctrls .zbtn[title="Layer toggle"]');
  layersBtn?.addEventListener('click', () => {
    if (!stateLayer) return;
    if (map.hasLayer(stateLayer)) {
      map.removeLayer(stateLayer);
    } else {
      stateLayer.addTo(map);
      stateLayer.bringToBack();
    }
  });
}

async function loadMalaysiaGeoJson() {
  for (const url of TOPO_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.json();
    } catch (_) {
      // Try the next source.
    }
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

  const aliases = {
    penang: 'pulau pinang',
    'kuala lumpur': 'wp kuala lumpur',
    labuan: 'wp labuan',
    putrajaya: 'wp putrajaya',
  };

  return aliases[cleaned] || cleaned;
}

function getStateFill(count) {
  if (count >= 70) return '#5b21b6';
  if (count >= 55) return '#6d28d9';
  if (count >= 40) return '#8b5cf6';
  if (count >= 20) return '#a78bfa';
  return '#ddd6fe';
}
