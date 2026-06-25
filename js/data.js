// js/data.js ── Mock data for InfraCivic 2.0 Dashboard

const ASSIGNEES = [
  'Aina Rahman',
  'Daniel Tan',
  'Farid Zulkifli',
  'Mei Ling Wong',
  'Nadia Hassan',
  'Ravi Kumar',
  'Sofia Jamal',
  'Victor Lee',
];

const CONCESSIONS = ['PLUS', 'LITRAK', 'SPRINT'];
const ROAD_TYPES = ['expressway', 'federal', 'state', 'district'];
const ROAD_TYPE_LABELS = {
  expressway: 'Expressway',
  federal: 'Federal Road',
  state: 'State Road',
  district: 'District Road',
};

const SPARKLINES = {
  approval: [16.2,15.8,15.1,14.9,14.7,14.3,14.6,14.8,14.5,14.6].map((y,x)=>({x,y})),
  success:  [94.1,94.8,95.2,95.9,96.1,96.3,96.0,96.4,96.2,96.3].map((y,x)=>({x,y})),
  payment:  [91.2,91.8,92.0,92.3,92.5,92.7,92.4,92.8,92.6,92.7].map((y,x)=>({x,y})),
};

const CONCESSIONAIRES = [
  { name: 'Concessionaire 1', concession: 'PLUS', value: 812 },
  { name: 'Concessionaire 2', concession: 'LITRAK', value: 615 },
  { name: 'Concessionaire 3', concession: 'SPRINT', value: 482 },
  { name: 'Concessionaire 4', concession: 'PLUS', value: 341 },
  { name: 'Concessionaire 5', concession: 'LITRAK', value: 156 },
  { name: 'Concessionaire 6', concession: 'SPRINT', value: 55  },
];

const CONC_COLORS = ['#2196F3','#43A047','#66BB6A','#FF9800','#AB47BC','#EF5350'];

const SEV_COLORS = {
  critical: '#e53935',
  high:     '#fb8c00',
  medium:   '#f9a825',
  low:      '#1e88e5',
  completed:'#43a047',
};

const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  completed: 'Completed',
};

const STATUS_LABELS = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  resolved: 'Completed',
};

const BASE_MAP_MARKERS = [
  { lat:6.12, lng:102.24, count:8,  sev:'critical', km:'KM 275.2 (E1)', location:'Kota Bharu - Kuala Terengganu' },
  { lat:5.33, lng:103.14, count:11, sev:'critical', km:'KM 112.3 (E2)', location:'Kuala Terengganu interchange' },
  { lat:3.14, lng:101.62, count:5,  sev:'critical', km:'KM 18.4 (E1)', location:'Kuala Lumpur urban corridor' },
  { lat:4.77, lng:100.94, count:4,  sev:'critical', km:'KM 64.1 (Federal Rte 5)', location:'Ipoh - Kuala Kangsar' },
  { lat:3.81, lng:103.32, count:19, sev:'high', km:'KM 91.5 (Route 3)', location:'Kuantan coastal route' },
  { lat:4.24, lng:101.97, count:25, sev:'high', km:'KM 132.8 (E8)', location:'Central Pahang link' },
  { lat:2.93, lng:102.44, count:29, sev:'high', km:'KM 208.7 (E2)', location:'Negeri Sembilan approach' },
  { lat:1.87, lng:103.33, count:20, sev:'high', km:'KM 319.6 (E2)', location:'Johor central route' },
  { lat:1.55, lng:103.77, count:15, sev:'high', km:'KM 335.1 (E2)', location:'Johor Bahru entry' },
  { lat:5.41, lng:100.33, count:13, sev:'medium', km:'KM 7.2 (E1)', location:'Penang island approach' },
  { lat:4.60, lng:101.09, count:12, sev:'medium', km:'KM 72.8 (E1)', location:'Ipoh northbound' },
  { lat:3.45, lng:101.53, count:30, sev:'medium', km:'KM 442.0 (E1)', location:'Rawang - Kuala Lumpur' },
  { lat:3.02, lng:101.73, count:30, sev:'medium', km:'KM 11.6 (E37)', location:'Kajang distributor' },
  { lat:2.19, lng:102.25, count:36, sev:'medium', km:'KM 221.9 (E2)', location:'Melaka corridor' },
  { lat:6.00, lng:102.10, count:8,  sev:'low', km:'KM 188.4 (Route 3)', location:'Kelantan coastal section' },
  { lat:3.80, lng:103.26, count:17, sev:'low', km:'KM 104.2 (Route 3)', location:'Kuantan bypass' },
  { lat:1.90, lng:103.35, count:10, sev:'low', km:'KM 292.4 (E2)', location:'Batu Pahat link' },
  { lat:5.85, lng:102.00, count:38, sev:'low', km:'KM 219.0 (Route 8)', location:'Kelantan interior route' },
  { lat:2.72, lng:101.94, count:18, sev:'low', km:'KM 19.8 (E5)', location:'Seremban - Port Dickson' },
];

const DESCRIPTIONS = [
  'Landslide reported near the shoulder after heavy rain.',
  'Pavement failure detected across the left lane.',
  'Drainage blockage causing standing water on approach.',
  'Shoulder damage affecting emergency stopping area.',
  'Guardrail deformation requires immediate inspection.',
  'Surface rutting observed at multiple chainages.',
  'Signage outage affecting night visibility.',
  'Bridge expansion joint requires maintenance crew review.',
];

const CREATED_OFFSETS_MINUTES = [2, 15, 32, 63, 95, 145, 220, 360, 510, 720, 1080, 1500, 2600, 4300, 7200, 11000, 18000, 26000, 39000];
const INITIAL_STATUSES = ['open','open','acknowledged','open','open','acknowledged','open','open','resolved','open','open','open','acknowledged','resolved','open','open','resolved','open','open'];

function enrichMarker(marker, index) {
  const id = `inc-${String(index + 1).padStart(3, '0')}`;
  const createdAt = new Date(Date.now() - CREATED_OFFSETS_MINUTES[index] * 60 * 1000).toISOString();
  const description = DESCRIPTIONS[index % DESCRIPTIONS.length];
  const owner = ASSIGNEES[index % ASSIGNEES.length];
  const concession = CONCESSIONS[index % CONCESSIONS.length];
  const roadType = ROAD_TYPES[index % ROAD_TYPES.length];
  const status = INITIAL_STATUSES[index] || 'open';

  return {
    ...marker,
    id,
    concession,
    roadType,
    status,
    owner,
    createdAt,
    description,
    kmLabel: marker.km,
    timeline: [
      { time: 'Detected', label: `${SEVERITY_LABELS[marker.sev]} defect logged by monitoring feed` },
      { time: 'Assigned', label: `${owner} assigned as response owner` },
      { time: status === 'resolved' ? 'Completed' : 'In progress', label: status === 'resolved' ? 'Site crew confirmed restoration' : 'Response team reviewing field update' },
    ],
  };
}

const MAP_MARKERS = BASE_MAP_MARKERS.map(enrichMarker);

const ALERTS = [
  { id:'alert-001', markerId:'inc-001', time:'2 min ago' },
  { id:'alert-002', markerId:'inc-002', time:'15 min ago' },
  { id:'alert-003', markerId:'inc-004', time:'32 min ago' },
  { id:'alert-004', markerId:'inc-019', time:'1 hr ago' },
  { id:'alert-005', markerId:'inc-006', time:'2 hr ago' },
  { id:'alert-006', markerId:'inc-009', time:'8 hr ago' },
  { id:'alert-007', markerId:'inc-013', time:'1 day ago' },
  { id:'alert-008', markerId:'inc-014', time:'3 days ago' },
  { id:'alert-009', markerId:'inc-017', time:'5 days ago' },
  { id:'alert-010', markerId:'inc-018', time:'12 days ago' },
].map(alert => {
  const incident = MAP_MARKERS.find(item => item.id === alert.markerId);
  return {
    ...alert,
    km: incident.kmLabel,
    desc: incident.description.replace(/\.$/, ''),
    sev: incident.sev,
    concession: incident.concession,
    roadType: incident.roadType,
    createdAt: incident.createdAt,
  };
});

const PAYMENTS = [
  { id:'PAY-2026-1041', concession:'PLUS', amount:'RM 84.2M', date:'25 Jun 2026', status:'Released' },
  { id:'PAY-2026-1038', concession:'LITRAK', amount:'RM 42.7M', date:'24 Jun 2026', status:'Released' },
  { id:'PAY-2026-1034', concession:'SPRINT', amount:'RM 31.5M', date:'23 Jun 2026', status:'Pending' },
  { id:'PAY-2026-1029', concession:'PLUS', amount:'RM 76.9M', date:'21 Jun 2026', status:'Released' },
  { id:'PAY-2026-1024', concession:'LITRAK', amount:'RM 28.8M', date:'19 Jun 2026', status:'Review' },
  { id:'PAY-2026-1019', concession:'SPRINT', amount:'RM 18.1M', date:'17 Jun 2026', status:'Released' },
  { id:'PAY-2026-1016', concession:'PLUS', amount:'RM 52.0M', date:'15 Jun 2026', status:'Released' },
  { id:'PAY-2026-1011', concession:'LITRAK', amount:'RM 22.4M', date:'13 Jun 2026', status:'Pending' },
  { id:'PAY-2026-1006', concession:'SPRINT', amount:'RM 14.6M', date:'10 Jun 2026', status:'Released' },
  { id:'PAY-2026-1001', concession:'PLUS', amount:'RM 66.3M', date:'07 Jun 2026', status:'Released' },
];

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

const TOPO_URLS = [
  'https://code.highcharts.com/mapdata/countries/my/my-all.geo.json',
  'https://raw.githubusercontent.com/longaspire/malaysia-json/master/geo/MY.json',
  'https://raw.githubusercontent.com/dosm-malaysia/kawasanku-front/main/public/geo/administrative/state.geojson',
];

window.IC_DATA = {
  ASSIGNEES,
  CONCESSIONS,
  ROAD_TYPES,
  ROAD_TYPE_LABELS,
  SPARKLINES,
  CONCESSIONAIRES,
  CONC_COLORS,
  SEV_COLORS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  MAP_MARKERS,
  ALERTS,
  PAYMENTS,
  STATE_DATA,
  TOPO_URLS,
};
