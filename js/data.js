// js/data.js ── Mock data for InfraCivic 2.0 Dashboard

const ALERTS = [
  { km: 'KM 275.2 (E1)',           desc: 'Landslide reported',   sev: 'critical', time: '2 min ago'  },
  { km: 'KM 112.3 (E2)',           desc: 'Pavement failure',     sev: 'high',     time: '15 min ago' },
  { km: 'KM 64.1 (Federal Rte 5)', desc: 'Drainage blockage',   sev: 'medium',   time: '32 min ago' },
  { km: 'KM 19.8 (E5)',            desc: 'Shoulder damage',      sev: 'low',      time: '1 hr ago'   },
];

const SPARKLINES = {
  approval: [16.2,15.8,15.1,14.9,14.7,14.3,14.6,14.8,14.5,14.6].map((y,x)=>({x,y})),
  success:  [94.1,94.8,95.2,95.9,96.1,96.3,96.0,96.4,96.2,96.3].map((y,x)=>({x,y})),
  payment:  [91.2,91.8,92.0,92.3,92.5,92.7,92.4,92.8,92.6,92.7].map((y,x)=>({x,y})),
};

const CONCESSIONAIRES = [
  { name: 'Concessionaire 1', value: 812 },
  { name: 'Concessionaire 2', value: 615 },
  { name: 'Concessionaire 3', value: 482 },
  { name: 'Concessionaire 4', value: 341 },
  { name: 'Concessionaire 5', value: 156 },
  { name: 'Concessionaire 6', value: 55  },
];

const CONC_COLORS = ['#2196F3','#43A047','#66BB6A','#FF9800','#AB47BC','#EF5350'];

const SEV_COLORS = {
  critical: '#e53935',
  high:     '#fb8c00',
  medium:   '#f9a825',
  low:      '#1e88e5',
};

// Incident markers positioned across Peninsular Malaysia highways
const MAP_MARKERS = [
  // Critical
  { lat:6.12, lng:102.24, count:8,  sev:'critical' },
  { lat:5.33, lng:103.14, count:11, sev:'critical' },
  { lat:3.14, lng:101.62, count:5,  sev:'critical' },
  { lat:4.77, lng:100.94, count:4,  sev:'critical' },
  // High
  { lat:3.81, lng:103.32, count:19, sev:'high' },
  { lat:4.24, lng:101.97, count:25, sev:'high' },
  { lat:2.93, lng:102.44, count:29, sev:'high' },
  { lat:1.87, lng:103.33, count:20, sev:'high' },
  { lat:1.55, lng:103.77, count:15, sev:'high' },
  // Medium
  { lat:5.41, lng:100.33, count:13, sev:'medium' },
  { lat:4.60, lng:101.09, count:12, sev:'medium' },
  { lat:3.45, lng:101.53, count:30, sev:'medium' },
  { lat:3.02, lng:101.73, count:30, sev:'medium' },
  { lat:2.19, lng:102.25, count:36, sev:'medium' },
  // Low
  { lat:6.00, lng:102.10, count:8,  sev:'low' },
  { lat:3.80, lng:103.26, count:17, sev:'low' },
  { lat:1.90, lng:103.35, count:10, sev:'low' },
  { lat:5.85, lng:102.00, count:38, sev:'low' },
  { lat:2.72, lng:101.94, count:18, sev:'low' },
];

// Per-state incident counts for choropleth
const STATE_DATA = [
  { state:'Johor',             incidentCount:45 },
  { state:'Kedah',             incidentCount:38 },
  { state:'Kelantan',          incidentCount:52 },
  { state:'Melaka',            incidentCount:20 },
  { state:'Negeri Sembilan',   incidentCount:28 },
  { state:'Pahang',            incidentCount:63 },
  { state:'Perak',             incidentCount:55 },
  { state:'Perlis',            incidentCount:8  },
  { state:'Pulau Pinang',      incidentCount:31 },
  { state:'Sabah',             incidentCount:72 },
  { state:'Sarawak',           incidentCount:85 },
  { state:'Selangor',          incidentCount:58 },
  { state:'Terengganu',        incidentCount:44 },
  { state:'W.P. Kuala Lumpur', incidentCount:22 },
  { state:'W.P. Labuan',       incidentCount:5  },
  { state:'W.P. Putrajaya',    incidentCount:3  },
];

// GeoJSON sources tried in order — first success wins
const TOPO_URLS = [
  'https://code.highcharts.com/mapdata/countries/my/my-all.geo.json',
  'https://raw.githubusercontent.com/longaspire/malaysia-json/master/geo/MY.json',
  'https://raw.githubusercontent.com/dosm-malaysia/kawasanku-front/main/public/geo/administrative/state.geojson',
];
