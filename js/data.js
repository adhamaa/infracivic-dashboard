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

const CONC_COLORS = ['#2563eb','#16a34a','#0891b2','#d97706','#6d5dfc','#dc2626'];

const SEV_COLORS = {
  critical: '#dc2626',
  high:     '#d97706',
  medium:   '#ca8a04',
  low:      '#2563eb',
  completed:'#16a34a',
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
  { lat:6.12, lng:102.24, count:8,  sev:'critical', state:'Kelantan',          km:'KM 275.2 (E1)', location:'Kota Bharu - Kuala Terengganu' },
  { lat:5.33, lng:103.14, count:11, sev:'critical', state:'Terengganu',        km:'KM 112.3 (E2)', location:'Kuala Terengganu interchange' },
  { lat:3.14, lng:101.62, count:5,  sev:'critical', state:'W.P. Kuala Lumpur', km:'KM 18.4 (E1)', location:'Kuala Lumpur urban corridor' },
  { lat:4.77, lng:100.94, count:4,  sev:'critical', state:'Perak',             km:'KM 64.1 (Federal Rte 5)', location:'Ipoh - Kuala Kangsar' },
  { lat:3.81, lng:103.32, count:19, sev:'high',     state:'Pahang',            km:'KM 91.5 (Route 3)', location:'Kuantan coastal route' },
  { lat:4.24, lng:101.97, count:25, sev:'high',     state:'Pahang',            km:'KM 132.8 (E8)', location:'Central Pahang link' },
  { lat:2.93, lng:102.44, count:29, sev:'high',     state:'Negeri Sembilan',   km:'KM 208.7 (E2)', location:'Negeri Sembilan approach' },
  { lat:1.87, lng:103.33, count:20, sev:'high',     state:'Johor',             km:'KM 319.6 (E2)', location:'Johor central route' },
  { lat:1.55, lng:103.77, count:15, sev:'high',     state:'Johor',             km:'KM 335.1 (E2)', location:'Johor Bahru entry' },
  { lat:5.41, lng:100.33, count:13, sev:'medium',   state:'Pulau Pinang',      km:'KM 7.2 (E1)', location:'Penang island approach' },
  { lat:4.60, lng:101.09, count:12, sev:'medium',   state:'Perak',             km:'KM 72.8 (E1)', location:'Ipoh northbound' },
  { lat:3.45, lng:101.53, count:30, sev:'medium',   state:'Selangor',          km:'KM 442.0 (E1)', location:'Rawang - Kuala Lumpur' },
  { lat:3.02, lng:101.73, count:30, sev:'medium',   state:'Selangor',          km:'KM 11.6 (E37)', location:'Kajang distributor' },
  { lat:2.19, lng:102.25, count:36, sev:'medium',   state:'Melaka',            km:'KM 221.9 (E2)', location:'Melaka corridor' },
  { lat:6.00, lng:102.10, count:8,  sev:'low',      state:'Kelantan',          km:'KM 188.4 (Route 3)', location:'Kelantan coastal section' },
  { lat:3.80, lng:103.26, count:17, sev:'low',      state:'Pahang',            km:'KM 104.2 (Route 3)', location:'Kuantan bypass' },
  { lat:1.90, lng:103.35, count:10, sev:'low',      state:'Johor',             km:'KM 292.4 (E2)', location:'Batu Pahat link' },
  { lat:5.85, lng:102.00, count:38, sev:'low',      state:'Kelantan',          km:'KM 219.0 (Route 8)', location:'Kelantan interior route' },
  { lat:2.72, lng:101.94, count:18, sev:'low',      state:'Negeri Sembilan',   km:'KM 19.8 (E5)', location:'Seremban - Port Dickson' },
  { lat:5.98, lng:116.08, count:18, sev:'critical', state:'Sabah',             km:'KM 12.5 (Pan Borneo)', location:'Kota Kinabalu urban approach' },
  { lat:5.43, lng:118.00, count:14, sev:'high',     state:'Sabah',             km:'KM 184.2 (Route 22)', location:'Sandakan east corridor' },
  { lat:1.56, lng:110.35, count:21, sev:'high',     state:'Sarawak',           km:'KM 8.9 (Pan Borneo)', location:'Kuching - Samarahan link' },
  { lat:3.17, lng:113.04, count:16, sev:'medium',   state:'Sarawak',           km:'KM 428.6 (Route 1)', location:'Bintulu industrial corridor' },
  { lat:4.39, lng:113.99, count:9,  sev:'low',      state:'Sarawak',           km:'KM 612.4 (Pan Borneo)', location:'Miri northern approach' },
  { lat:5.28, lng:115.24, count:6,  sev:'medium',   state:'W.P. Labuan',       km:'KM 4.1 (Labuan Ring Road)', location:'Labuan port connector' },
  { lat:6.15, lng:100.37, count:12, sev:'medium',   state:'Kedah',             km:'KM 71.4 (E1)', location:'Alor Setar - Gurun section', concession:'PLUS', roadType:'expressway' },
  { lat:6.44, lng:100.20, count:8,  sev:'low',      state:'Perlis',            km:'KM 11.8 (Route 7)', location:'Kangar urban distributor', concession:'PLUS', roadType:'federal' },
  { lat:2.93, lng:101.69, count:3,  sev:'low',      state:'W.P. Putrajaya',    km:'KM 3.2 (Persiaran Utara)', location:'Putrajaya administrative loop', concession:'SPRINT', roadType:'district' },
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
  const offsetMinutes = CREATED_OFFSETS_MINUTES[index] || (CREATED_OFFSETS_MINUTES[CREATED_OFFSETS_MINUTES.length - 1] + (index - CREATED_OFFSETS_MINUTES.length + 1) * 3600);
  const createdAt = new Date(Date.now() - offsetMinutes * 60 * 1000).toISOString();
  const description = DESCRIPTIONS[index % DESCRIPTIONS.length];
  const owner = ASSIGNEES[index % ASSIGNEES.length];
  const concession = marker.concession || CONCESSIONS[index % CONCESSIONS.length];
  const roadType = marker.roadType || ROAD_TYPES[index % ROAD_TYPES.length];
  const status = marker.status || INITIAL_STATUSES[index] || 'open';

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

const STATE_BASE_DATA = [
  { state:'Johor',             incidentCount:45, openCritical:6,  openHigh:13, openMedium:17, openLow:9,  slaCompliance:88, avgResponseHrs:2.9, roadKm:628, plazaCount:19, contractorCount:7,  monthRevenue:'RM 96.4M', primaryConcession:'PLUS' },
  { state:'Kedah',             incidentCount:38, openCritical:4,  openHigh:10, openMedium:15, openLow:9,  slaCompliance:86, avgResponseHrs:3.2, roadKm:412, plazaCount:12, contractorCount:5,  monthRevenue:'RM 42.8M', primaryConcession:'PLUS' },
  { state:'Kelantan',          incidentCount:52, openCritical:8,  openHigh:15, openMedium:19, openLow:10, slaCompliance:81, avgResponseHrs:4.1, roadKm:286, plazaCount:6,  contractorCount:4,  monthRevenue:'RM 18.7M', primaryConcession:'PLUS' },
  { state:'Melaka',            incidentCount:20, openCritical:2,  openHigh:5,  openMedium:8,  openLow:5,  slaCompliance:91, avgResponseHrs:2.2, roadKm:164, plazaCount:5,  contractorCount:3,  monthRevenue:'RM 21.3M', primaryConcession:'PLUS' },
  { state:'Negeri Sembilan',   incidentCount:28, openCritical:3,  openHigh:8,  openMedium:11, openLow:6,  slaCompliance:89, avgResponseHrs:2.7, roadKm:238, plazaCount:8,  contractorCount:4,  monthRevenue:'RM 31.6M', primaryConcession:'PLUS' },
  { state:'Pahang',            incidentCount:63, openCritical:9,  openHigh:18, openMedium:24, openLow:12, slaCompliance:82, avgResponseHrs:4.4, roadKm:746, plazaCount:18, contractorCount:8,  monthRevenue:'RM 64.2M', primaryConcession:'PLUS' },
  { state:'Perak',             incidentCount:55, openCritical:7,  openHigh:16, openMedium:21, openLow:11, slaCompliance:84, avgResponseHrs:3.8, roadKm:684, plazaCount:17, contractorCount:7,  monthRevenue:'RM 58.9M', primaryConcession:'PLUS' },
  { state:'Perlis',            incidentCount:8,  openCritical:1,  openHigh:2,  openMedium:3,  openLow:2,  slaCompliance:93, avgResponseHrs:1.9, roadKm:88,  plazaCount:2,  contractorCount:1,  monthRevenue:'RM 6.1M',  primaryConcession:'PLUS' },
  { state:'Pulau Pinang',      incidentCount:31, openCritical:4,  openHigh:9,  openMedium:12, openLow:6,  slaCompliance:87, avgResponseHrs:2.5, roadKm:216, plazaCount:7,  contractorCount:4,  monthRevenue:'RM 44.5M', primaryConcession:'PLUS' },
  { state:'Sabah',             incidentCount:72, openCritical:11, openHigh:20, openMedium:27, openLow:14, slaCompliance:79, avgResponseHrs:4.8, roadKm:524, plazaCount:9,  contractorCount:6,  monthRevenue:'RM 24.9M', primaryConcession:'LITRAK' },
  { state:'Sarawak',           incidentCount:85, openCritical:13, openHigh:24, openMedium:32, openLow:16, slaCompliance:78, avgResponseHrs:4.6, roadKm:948, plazaCount:14, contractorCount:9,  monthRevenue:'RM 39.7M', primaryConcession:'PLUS' },
  { state:'Selangor',          incidentCount:58, openCritical:8,  openHigh:17, openMedium:22, openLow:11, slaCompliance:85, avgResponseHrs:2.4, roadKm:356, plazaCount:22, contractorCount:9,  monthRevenue:'RM 118.6M', primaryConcession:'LITRAK' },
  { state:'Terengganu',        incidentCount:44, openCritical:5,  openHigh:13, openMedium:17, openLow:9,  slaCompliance:83, avgResponseHrs:3.9, roadKm:332, plazaCount:7,  contractorCount:4,  monthRevenue:'RM 19.8M', primaryConcession:'PLUS' },
  { state:'W.P. Kuala Lumpur', incidentCount:22, openCritical:3,  openHigh:6,  openMedium:8,  openLow:5,  slaCompliance:90, avgResponseHrs:1.8, roadKm:124, plazaCount:10, contractorCount:5,  monthRevenue:'RM 73.5M', primaryConcession:'SPRINT' },
  { state:'W.P. Labuan',       incidentCount:5,  openCritical:1,  openHigh:1,  openMedium:2,  openLow:1,  slaCompliance:94, avgResponseHrs:1.6, roadKm:42,  plazaCount:1,  contractorCount:1,  monthRevenue:'RM 3.4M',  primaryConcession:'LITRAK' },
  { state:'W.P. Putrajaya',    incidentCount:3,  openCritical:0,  openHigh:1,  openMedium:1,  openLow:1,  slaCompliance:94, avgResponseHrs:1.7, roadKm:36,  plazaCount:2,  contractorCount:1,  monthRevenue:'RM 5.8M',  primaryConcession:'SPRINT' },
];

function buildStateData() {
  return STATE_BASE_DATA.map(base => {
    const markers = MAP_MARKERS.filter(marker => normalizeStateLookup(marker.state) === normalizeStateLookup(base.state));
    if (!markers.length) {
      return { ...base, incidentCount: 0, openCritical: 0, openHigh: 0, openMedium: 0, openLow: 0 };
    }
    const severityTotals = { critical: 0, high: 0, medium: 0, low: 0 };
    const concessionTotals = new Map();
    let incidentCount = 0;

    markers.forEach(marker => {
      const count = Number(marker.count) || 0;
      incidentCount += count;
      if (marker.status !== 'resolved' && severityTotals[marker.sev] !== undefined) {
        severityTotals[marker.sev] += count;
      }
      concessionTotals.set(marker.concession, (concessionTotals.get(marker.concession) || 0) + count);
    });

    const primaryConcession = [...concessionTotals.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] || base.primaryConcession;
    const riskLoad = incidentCount ? (severityTotals.critical * 1.8 + severityTotals.high * 1.2 + severityTotals.medium * 0.7 + severityTotals.low * 0.35) / incidentCount : 0;
    const slaCompliance = Math.max(76, Math.min(96, Math.round(96 - riskLoad * 9 - incidentCount / 18)));
    const avgResponseHrs = Number(Math.max(1.4, Math.min(5.4, 1.5 + riskLoad * 1.8 + incidentCount / 55)).toFixed(1));

    return {
      ...base,
      incidentCount,
      openCritical: severityTotals.critical,
      openHigh: severityTotals.high,
      openMedium: severityTotals.medium,
      openLow: severityTotals.low,
      slaCompliance,
      avgResponseHrs,
      primaryConcession,
    };
  });
}

const STATE_DATA = buildStateData();

function normalizeStateLookup(name) {
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

function getStateDetail(name) {
  const lookup = normalizeStateLookup(name);
  return STATE_DATA.find(item => normalizeStateLookup(item.state) === lookup) || null;
}

const TOPO_URLS = [
  'https://code.highcharts.com/mapdata/countries/my/my-all.geo.json',
  'https://raw.githubusercontent.com/longaspire/malaysia-json/master/geo/MY.json',
  'https://raw.githubusercontent.com/dosm-malaysia/kawasanku-front/main/public/geo/administrative/state.geojson',
];

const SLA_BY_CONCESSION_SEVERITY = [
  { concession: 'PLUS', severity: 'Critical', value: 84, open: 18 },
  { concession: 'PLUS', severity: 'High', value: 89, open: 42 },
  { concession: 'PLUS', severity: 'Medium', value: 93, open: 76 },
  { concession: 'PLUS', severity: 'Low', value: 96, open: 112 },
  { concession: 'LITRAK', severity: 'Critical', value: 78, open: 11 },
  { concession: 'LITRAK', severity: 'High', value: 86, open: 28 },
  { concession: 'LITRAK', severity: 'Medium', value: 91, open: 55 },
  { concession: 'LITRAK', severity: 'Low', value: 94, open: 81 },
  { concession: 'SPRINT', severity: 'Critical', value: 72, open: 9 },
  { concession: 'SPRINT', severity: 'High', value: 81, open: 23 },
  { concession: 'SPRINT', severity: 'Medium', value: 88, open: 37 },
  { concession: 'SPRINT', severity: 'Low', value: 92, open: 64 },
];

const MTTR_TREND = [
  { week: 'W-11', critical: 26.4, high: 19.6, medium: 11.4, low: 5.2 },
  { week: 'W-10', critical: 25.8, high: 19.2, medium: 11.1, low: 5.1 },
  { week: 'W-09', critical: 24.9, high: 18.7, medium: 10.8, low: 5.0 },
  { week: 'W-08', critical: 25.2, high: 18.1, medium: 10.5, low: 4.8 },
  { week: 'W-07', critical: 23.8, high: 17.9, medium: 10.3, low: 4.7 },
  { week: 'W-06', critical: 23.1, high: 17.4, medium: 9.9, low: 4.6 },
  { week: 'W-05', critical: 22.7, high: 16.8, medium: 9.8, low: 4.5 },
  { week: 'W-04', critical: 22.9, high: 16.4, medium: 9.5, low: 4.3 },
  { week: 'W-03', critical: 21.8, high: 15.9, medium: 9.2, low: 4.2 },
  { week: 'W-02', critical: 21.2, high: 15.4, medium: 9.0, low: 4.1 },
  { week: 'W-01', critical: 20.6, high: 15.1, medium: 8.7, low: 4.0 },
  { week: 'Current', critical: 19.8, high: 14.7, medium: 8.4, low: 3.8 },
];

const CONTRACTORS = [
  { name: 'Perdana Roadcare', concession: 'PLUS', jobs: 148, avgResponse: '3.8h', sla: 96, rework: 2.4, trend: '+4%' },
  { name: 'Lintasan Maintenance', concession: 'LITRAK', jobs: 94, avgResponse: '4.2h', sla: 92, rework: 3.1, trend: '+2%' },
  { name: 'Sprint Field Services', concession: 'SPRINT', jobs: 82, avgResponse: '4.8h', sla: 88, rework: 4.6, trend: '-1%' },
  { name: 'Infra Selatan', concession: 'PLUS', jobs: 76, avgResponse: '5.1h', sla: 86, rework: 5.0, trend: '+1%' },
  { name: 'Metro Pavement Crew', concession: 'LITRAK', jobs: 69, avgResponse: '5.4h', sla: 84, rework: 5.8, trend: '-3%' },
  { name: 'Jajaran Bridge Unit', concession: 'PLUS', jobs: 52, avgResponse: '6.1h', sla: 82, rework: 6.2, trend: '0%' },
  { name: 'Urban Drainage Ops', concession: 'SPRINT', jobs: 47, avgResponse: '6.6h', sla: 79, rework: 7.4, trend: '-2%' },
  { name: 'Pantai Timur Response', concession: 'PLUS', jobs: 44, avgResponse: '7.2h', sla: 76, rework: 8.1, trend: '-4%' },
];

const DEFECT_MIX = [
  { category: 'Pavement', concession: 'PLUS', count: 148 },
  { category: 'Drainage', concession: 'PLUS', count: 93 },
  { category: 'Signage', concession: 'PLUS', count: 54 },
  { category: 'Guardrail', concession: 'PLUS', count: 46 },
  { category: 'Bridge Joint', concession: 'PLUS', count: 31 },
  { category: 'Pavement', concession: 'LITRAK', count: 92 },
  { category: 'Drainage', concession: 'LITRAK', count: 71 },
  { category: 'Signage', concession: 'LITRAK', count: 48 },
  { category: 'Guardrail', concession: 'LITRAK', count: 33 },
  { category: 'Bridge Joint', concession: 'LITRAK', count: 19 },
  { category: 'Pavement', concession: 'SPRINT', count: 73 },
  { category: 'Drainage', concession: 'SPRINT', count: 62 },
  { category: 'Signage', concession: 'SPRINT', count: 41 },
  { category: 'Guardrail', concession: 'SPRINT', count: 29 },
  { category: 'Bridge Joint', concession: 'SPRINT', count: 14 },
];

const CLAIMS_AGING = [
  { bucket: '0-7 days', concession: 'PLUS', submitted: 34, review: 24, approved: 18, rejected: 4 },
  { bucket: '8-14 days', concession: 'PLUS', submitted: 21, review: 26, approved: 16, rejected: 5 },
  { bucket: '15-30 days', concession: 'PLUS', submitted: 12, review: 20, approved: 11, rejected: 6 },
  { bucket: '30+ days', concession: 'PLUS', submitted: 7, review: 17, approved: 8, rejected: 9 },
  { bucket: '0-7 days', concession: 'LITRAK', submitted: 24, review: 18, approved: 13, rejected: 3 },
  { bucket: '8-14 days', concession: 'LITRAK', submitted: 18, review: 19, approved: 10, rejected: 4 },
  { bucket: '15-30 days', concession: 'LITRAK', submitted: 9, review: 15, approved: 8, rejected: 5 },
  { bucket: '30+ days', concession: 'LITRAK', submitted: 5, review: 12, approved: 5, rejected: 7 },
  { bucket: '0-7 days', concession: 'SPRINT', submitted: 19, review: 15, approved: 11, rejected: 2 },
  { bucket: '8-14 days', concession: 'SPRINT', submitted: 15, review: 16, approved: 9, rejected: 3 },
  { bucket: '15-30 days', concession: 'SPRINT', submitted: 8, review: 12, approved: 7, rejected: 4 },
  { bucket: '30+ days', concession: 'SPRINT', submitted: 4, review: 10, approved: 4, rejected: 6 },
];

const PAYMENT_VELOCITY = [
  { concession: 'PLUS', submitted: 1180, approved: 982, released: 844 },
  { concession: 'LITRAK', submitted: 724, approved: 604, released: 498 },
  { concession: 'SPRINT', submitted: 486, approved: 392, released: 318 },
];

const PAYMENT_VELOCITY_TREND = [
  { month: 'Jan', concession: 'PLUS', submitted: 128, approved: 104, released: 86 },
  { month: 'Feb', concession: 'PLUS', submitted: 142, approved: 116, released: 98 },
  { month: 'Mar', concession: 'PLUS', submitted: 156, approved: 130, released: 110 },
  { month: 'Apr', concession: 'PLUS', submitted: 168, approved: 138, released: 119 },
  { month: 'May', concession: 'PLUS', submitted: 181, approved: 151, released: 130 },
  { month: 'Jun', concession: 'PLUS', submitted: 192, approved: 163, released: 142 },
  { month: 'Jan', concession: 'LITRAK', submitted: 82, approved: 68, released: 54 },
  { month: 'Feb', concession: 'LITRAK', submitted: 91, approved: 74, released: 61 },
  { month: 'Mar', concession: 'LITRAK', submitted: 98, approved: 82, released: 68 },
  { month: 'Apr', concession: 'LITRAK', submitted: 104, approved: 87, released: 73 },
  { month: 'May', concession: 'LITRAK', submitted: 113, approved: 94, released: 78 },
  { month: 'Jun', concession: 'LITRAK', submitted: 121, approved: 99, released: 84 },
  { month: 'Jan', concession: 'SPRINT', submitted: 55, approved: 44, released: 34 },
  { month: 'Feb', concession: 'SPRINT', submitted: 61, approved: 48, released: 38 },
  { month: 'Mar', concession: 'SPRINT', submitted: 66, approved: 52, released: 42 },
  { month: 'Apr', concession: 'SPRINT', submitted: 72, approved: 57, released: 47 },
  { month: 'May', concession: 'SPRINT', submitted: 78, approved: 62, released: 51 },
  { month: 'Jun', concession: 'SPRINT', submitted: 84, approved: 67, released: 56 },
];

const OPEN_CLAIMS = [
  { id: 'CLM-2026-8841', concession: 'PLUS', value: 96.4, daysPending: 42, approver: 'Finance Director', status: 'Review' },
  { id: 'CLM-2026-8794', concession: 'LITRAK', value: 72.8, daysPending: 36, approver: 'JKR Verifier', status: 'Submitted' },
  { id: 'CLM-2026-8762', concession: 'PLUS', value: 68.1, daysPending: 31, approver: 'Technical Audit', status: 'Review' },
  { id: 'CLM-2026-8728', concession: 'SPRINT', value: 54.9, daysPending: 29, approver: 'Finance Director', status: 'Approved' },
  { id: 'CLM-2026-8699', concession: 'LITRAK', value: 47.3, daysPending: 25, approver: 'Concession Lead', status: 'Review' },
  { id: 'CLM-2026-8660', concession: 'PLUS', value: 42.6, daysPending: 21, approver: 'JKR Verifier', status: 'Submitted' },
  { id: 'CLM-2026-8615', concession: 'SPRINT', value: 38.5, daysPending: 19, approver: 'Technical Audit', status: 'Review' },
  { id: 'CLM-2026-8577', concession: 'PLUS', value: 33.8, daysPending: 17, approver: 'Concession Lead', status: 'Approved' },
  { id: 'CLM-2026-8521', concession: 'LITRAK', value: 29.4, daysPending: 14, approver: 'JKR Verifier', status: 'Submitted' },
  { id: 'CLM-2026-8488', concession: 'SPRINT', value: 24.2, daysPending: 12, approver: 'Finance Director', status: 'Review' },
];

const BUDGET_BURN = [
  { concession: 'PLUS', allocated: 1450, spent: 918, projected: 1320 },
  { concession: 'LITRAK', allocated: 920, spent: 642, projected: 884 },
  { concession: 'SPRINT', allocated: 680, spent: 418, projected: 622 },
];

const MONTHLY_RELEASES = [
  { month: 'Jan', PLUS: 92, LITRAK: 48, SPRINT: 31 },
  { month: 'Feb', PLUS: 104, LITRAK: 51, SPRINT: 34 },
  { month: 'Mar', PLUS: 118, LITRAK: 57, SPRINT: 39 },
  { month: 'Apr', PLUS: 126, LITRAK: 62, SPRINT: 44 },
  { month: 'May', PLUS: 133, LITRAK: 69, SPRINT: 48 },
  { month: 'Jun', PLUS: 142, LITRAK: 73, SPRINT: 52 },
  { month: 'Jul', PLUS: 151, LITRAK: 78, SPRINT: 56 },
  { month: 'Aug', PLUS: 148, LITRAK: 82, SPRINT: 59 },
  { month: 'Sep', PLUS: 156, LITRAK: 86, SPRINT: 61 },
  { month: 'Oct', PLUS: 162, LITRAK: 90, SPRINT: 64 },
  { month: 'Nov', PLUS: 171, LITRAK: 96, SPRINT: 68 },
  { month: 'Dec', PLUS: 181, LITRAK: 102, SPRINT: 72 },
];

const STATES = [
  'Perlis', 'Kedah', 'Pulau Pinang', 'Perak',
  'Selangor', 'W.P. Kuala Lumpur', 'W.P. Putrajaya',
  'Negeri Sembilan', 'Melaka', 'Johor',
  'Pahang', 'Terengganu', 'Kelantan',
  'Sabah', 'Sarawak', 'W.P. Labuan',
];

const STATE_REGIONS = [
  { region: 'Northern',      states: ['Perlis', 'Kedah', 'Pulau Pinang', 'Perak'] },
  { region: 'Central',       states: ['Selangor', 'W.P. Kuala Lumpur', 'W.P. Putrajaya'] },
  { region: 'Southern',      states: ['Negeri Sembilan', 'Melaka', 'Johor'] },
  { region: 'East Coast',    states: ['Pahang', 'Terengganu', 'Kelantan'] },
  { region: 'East Malaysia', states: ['Sabah', 'Sarawak', 'W.P. Labuan'] },
];

// ── Incidents tab ──
const INCIDENT_HOURLY = Array.from({ length: 24 }, (_, i) => {
  const hour = (new Date().getHours() - 23 + i + 24) % 24;
  const base = 6 + Math.round(8 * Math.sin((hour - 6) / 24 * Math.PI * 2 + 1) + 6);
  return {
    label: String(hour).padStart(2, '0') + ':00',
    critical: Math.max(0, Math.round(base * 0.18 + (i % 5 === 0 ? 2 : 0))),
    high:     Math.max(0, Math.round(base * 0.34)),
    medium:   Math.max(0, Math.round(base * 0.48 + (i % 3))),
  };
});
const INCIDENT_DISPATCH = [
  { crew: 'Northbound Rapid 12', concession: 'PLUS',   eta: '6 min',  load: 78 },
  { crew: 'Central Response 04', concession: 'LITRAK', eta: '9 min',  load: 62 },
  { crew: 'Klang Valley Unit 07', concession: 'SPRINT', eta: '11 min', load: 55 },
  { crew: 'Southern Highway 18', concession: 'PLUS',   eta: '14 min', load: 71 },
  { crew: 'East Coast Patrol 03', concession: 'PLUS',   eta: '22 min', load: 48 },
];

// ── Traffic & Tolls tab ──
const TRAFFIC_FLOW = Array.from({ length: 24 }, (_, h) => {
  const freeFlow = 95 + Math.round(4 * Math.sin(h / 24 * Math.PI * 2));
  const dip = (h >= 7 && h <= 9) || (h >= 17 && h <= 19) ? 28 + Math.round(Math.random() * 18) : Math.round(Math.random() * 10);
  return { hour: String(h).padStart(2, '0') + ':00', measured: Math.max(35, freeFlow - dip), freeFlow };
});
const TOLL_PLAZAS = [
  { plaza: 'Sungai Besi',  concession: 'PLUS',   state: 'W.P. Kuala Lumpur', throughput: 14200, revenue: 18.4, change: 4.2 },
  { plaza: 'Jalan Duta',   concession: 'PLUS',   state: 'W.P. Kuala Lumpur', throughput: 11800, revenue: 15.2, change: 2.1 },
  { plaza: 'Gombak',       concession: 'PLUS',   state: 'Selangor',          throughput: 13400, revenue: 17.0, change: -1.4 },
  { plaza: 'Damansara',    concession: 'LITRAK', state: 'Selangor',          throughput: 9600,  revenue: 12.1, change: 3.8 },
  { plaza: 'Penchala',     concession: 'SPRINT', state: 'Selangor',          throughput: 8200,  revenue: 10.4, change: -0.6 },
  { plaza: 'Skudai',       concession: 'PLUS',   state: 'Johor',             throughput: 10100, revenue: 12.7, change: 5.5 },
  { plaza: 'Juru',         concession: 'PLUS',   state: 'Pulau Pinang',      throughput: 9400,  revenue: 11.8, change: 1.2 },
  { plaza: 'Sg. Dua',      concession: 'PLUS',   state: 'Pulau Pinang',      throughput: 7800,  revenue: 9.6,  change: -2.3 },
];
const CONGESTION_HOTSPOTS = [
  { corridor: 'PLUS — KM 219.3 NB (Tapah)',     state: 'Perak',             jam: 9.2, avgSpeed: 38 },
  { corridor: 'NKVE — Kota Damansara EB',       state: 'Selangor',          jam: 8.7, avgSpeed: 41 },
  { corridor: 'LDP — Sunway Toll SB',           state: 'Selangor',          jam: 8.3, avgSpeed: 33 },
  { corridor: 'SPRINT — Penchala Link',         state: 'W.P. Kuala Lumpur', jam: 7.9, avgSpeed: 36 },
  { corridor: 'PLUS — KM 152.1 SB (Slim)',      state: 'Perak',             jam: 7.4, avgSpeed: 44 },
  { corridor: 'NSE — Senai Utara',              state: 'Johor',             jam: 6.8, avgSpeed: 47 },
];

// ── Asset Pulse tab ──
const PCI_BY_STATE = STATES.map((state, i) => {
  const base = 78 + ((i * 7) % 14) - 7;
  return {
    state,
    pci: base,
    trend: ((i % 4) - 1.5) * 0.6,
    rul: 9 + ((i * 3) % 11),
    inspections: 18 + ((i * 5) % 22),
  };
});
const BRIDGE_HEALTH = [
  { name: 'Penang Bridge',            state: 'Pulau Pinang',  score: 86, due: '12 Aug 2026', rating: 'Good' },
  { name: 'Sultan Iskandar Bridge',   state: 'Johor',         score: 82, due: '04 Sep 2026', rating: 'Good' },
  { name: 'Putra Bridge',             state: 'W.P. Putrajaya', score: 91, due: '21 Dec 2026', rating: 'Excellent' },
  { name: 'Seri Wawasan Bridge',      state: 'W.P. Putrajaya', score: 88, due: '17 Nov 2026', rating: 'Good' },
  { name: 'Lebuhraya Pantai Timur 3', state: 'Pahang',        score: 71, due: '02 Jul 2026', rating: 'Watch' },
  { name: 'Sungai Johor Bridge',      state: 'Johor',         score: 76, due: '28 Aug 2026', rating: 'Watch' },
  { name: 'Rajang Bridge',            state: 'Sarawak',       score: 64, due: '10 Jul 2026', rating: 'Action' },
];

// ── Sustainability tab ──
const CO2_BY_CONCESSION = [
  { concession: 'PLUS',   reduced: 142, target: 180, baseline: 220 },
  { concession: 'LITRAK', reduced: 78,  target: 90,  baseline: 110 },
  { concession: 'SPRINT', reduced: 54,  target: 70,  baseline: 88 },
];
const RENEWABLE_MIX = [
  { source: 'Solar',          value: 38 },
  { source: 'Grid Renewable', value: 22 },
  { source: 'Biofuel Fleet',  value: 12 },
  { source: 'Conventional',   value: 28 },
];
const GREEN_PROCUREMENT = [
  { month: 'Jan', spend: 18 }, { month: 'Feb', spend: 22 }, { month: 'Mar', spend: 26 },
  { month: 'Apr', spend: 25 }, { month: 'May', spend: 29 }, { month: 'Jun', spend: 34 },
];

// ── Compliance Vault tab ──
const COMPLIANCE_OBLIGATIONS = [
  { concession: 'PLUS',   open: 6, inReview: 11, closed: 142 },
  { concession: 'LITRAK', open: 3, inReview: 7,  closed: 84  },
  { concession: 'SPRINT', open: 4, inReview: 5,  closed: 61  },
];
const EXPIRY_PIPELINE = [
  { bucket: 'Next 30 days', count: 14, kind: 'Operating licences, insurance policies', tone: 'critical' },
  { bucket: '31 – 60 days', count: 22, kind: 'Inspection certificates, bonds',         tone: 'high' },
  { bucket: '61 – 90 days', count: 31, kind: 'Audit closures, employee permits',       tone: 'medium' },
];
const COMPLIANCE_CALENDAR = [
  { date: '02 Jul', concession: 'PLUS',   item: 'Q2 SLA self-attestation',  status: 'Due' },
  { date: '14 Jul', concession: 'LITRAK', item: 'Insurance renewal',         status: 'Due' },
  { date: '03 Aug', concession: 'SPRINT', item: 'Independent auditor visit', status: 'Scheduled' },
  { date: '19 Aug', concession: 'PLUS',   item: 'Pavement audit submission', status: 'Scheduled' },
  { date: '08 Sep', concession: 'LITRAK', item: 'Concession agreement review', status: 'Planning' },
];

// ── Workforce tab ──
const CREW_UTILISATION = [
  { region: 'Northern',      utilisation: 82, crews: 18, overtime: 142 },
  { region: 'Central',       utilisation: 94, crews: 26, overtime: 318 },
  { region: 'Southern',      utilisation: 76, crews: 21, overtime: 188 },
  { region: 'East Coast',    utilisation: 68, crews: 14, overtime: 96  },
  { region: 'East Malaysia', utilisation: 71, crews: 16, overtime: 124 },
];
const SAFETY_INCIDENTS = [
  { month: 'Jan', minor: 6, major: 1, lti: 0 },
  { month: 'Feb', minor: 4, major: 2, lti: 1 },
  { month: 'Mar', minor: 7, major: 1, lti: 0 },
  { month: 'Apr', minor: 5, major: 0, lti: 0 },
  { month: 'May', minor: 8, major: 2, lti: 1 },
  { month: 'Jun', minor: 3, major: 1, lti: 0 },
];
const OVERTIME_HOTSPOTS = [
  { district: 'KL Central',       hours: 412, change: 8.2 },
  { district: 'Subang',           hours: 384, change: 5.1 },
  { district: 'Cheras',           hours: 356, change: -1.4 },
  { district: 'Johor Bahru',      hours: 318, change: 6.4 },
  { district: 'Georgetown',       hours: 268, change: 2.0 },
  { district: 'Kuantan',          hours: 224, change: -3.7 },
];

// ── Reports tab ──
const REPORTS_LIBRARY = [
  { id: 'RPT-001', name: 'Monthly SLA Scorecard',          owner: 'Ops PMO',       lastRun: '24 Jun 2026 09:15', schedule: 'Monthly · 1st', runs: 84,  fmt: 'PDF' },
  { id: 'RPT-002', name: 'Concession Cash Flow',           owner: 'Finance Lead',  lastRun: '25 Jun 2026 06:00', schedule: 'Weekly · Mon',  runs: 156, fmt: 'XLSX' },
  { id: 'RPT-003', name: 'Pavement Deterioration Atlas',   owner: 'Asset Mgmt',    lastRun: '12 Jun 2026 22:40', schedule: 'Quarterly',     runs: 18,  fmt: 'PDF' },
  { id: 'RPT-004', name: 'Compliance Obligation Register', owner: 'Legal',         lastRun: '25 Jun 2026 18:02', schedule: 'Weekly · Fri',  runs: 96,  fmt: 'XLSX' },
  { id: 'RPT-005', name: 'Workforce Utilisation Heatmap',  owner: 'HR Analytics',  lastRun: '23 Jun 2026 07:30', schedule: 'Bi-weekly',     runs: 64,  fmt: 'PNG' },
  { id: 'RPT-006', name: 'Sustainability Disclosure',      owner: 'ESG Office',    lastRun: '20 Jun 2026 16:48', schedule: 'Quarterly',     runs: 12,  fmt: 'PDF' },
  { id: 'RPT-007', name: 'Incident Root-Cause Digest',     owner: 'Safety Cell',   lastRun: '25 Jun 2026 21:11', schedule: 'Daily · 21:00', runs: 312, fmt: 'PDF' },
  { id: 'RPT-008', name: 'Toll Revenue Reconciliation',    owner: 'Finance Audit', lastRun: '25 Jun 2026 02:15', schedule: 'Daily · 02:00', runs: 480, fmt: 'XLSX' },
];
const REPORTS_SCHEDULE = [
  { date: 'Tonight 22:00', name: 'Incident Root-Cause Digest',  status: 'Queued' },
  { date: 'Tomorrow 02:00', name: 'Toll Revenue Reconciliation', status: 'Queued' },
  { date: '27 Jun 06:00',  name: 'Concession Cash Flow',        status: 'Scheduled' },
  { date: '27 Jun 18:00',  name: 'Compliance Obligation Register', status: 'Scheduled' },
];


const TABS = [
  { id: 'commandCentre',  label: 'Command Centre',   icon: 'mdi:radar',             theme: 'purple',  group: 'Live' },
  { id: 'incidents',      label: 'Incidents Live',   icon: 'mdi:alert',             theme: 'red',     group: 'Live' },
  { id: 'traffic',        label: 'Traffic & Tolls',  icon: 'mdi:traffic-light',     theme: 'cyan',    group: 'Live' },
  { id: 'operations',     label: 'Operations',       icon: 'mdi:speedometer',       theme: 'orange',  group: 'Analytics' },
  { id: 'financial',      label: 'Financial',        icon: 'mdi:cash-multiple',     theme: 'magenta', group: 'Analytics' },
  { id: 'asset',          label: 'Asset Pulse',      icon: 'mdi:road-variant',      theme: 'blue',    group: 'Analytics' },
  { id: 'sustainability', label: 'Sustainability',   icon: 'mdi:leaf',              theme: 'green',   group: 'Analytics' },
  { id: 'compliance',     label: 'Compliance Vault', icon: 'mdi:shield-check',      theme: 'indigo',  group: 'Governance' },
  { id: 'workforce',      label: 'Workforce',        icon: 'mdi:account-hard-hat',  theme: 'amber',   group: 'Governance' },
  { id: 'reports',        label: 'Reports',          icon: 'mdi:file-chart',        theme: 'slate',   group: 'Governance' },
];

const TAB_THEMES = {
  purple:  { primary: '#7b3aed', dark: '#5c2bbd', soft: '#ede7ff' },
  red:     { primary: '#dc2626', dark: '#a01717', soft: '#fee2e2' },
  cyan:    { primary: '#0891b2', dark: '#0a6f8a', soft: '#cffafe' },
  orange:  { primary: '#ff7a18', dark: '#cc5d05', soft: '#ffedd5' },
  magenta: { primary: '#c44e7e', dark: '#9a3962', soft: '#fce4ec' },
  blue:    { primary: '#2563eb', dark: '#1d4fc2', soft: '#dbeafe' },
  green:   { primary: '#16a34a', dark: '#0f7e39', soft: '#dcfce7' },
  indigo:  { primary: '#4f46e5', dark: '#3d36b8', soft: '#e0e7ff' },
  amber:   { primary: '#d97706', dark: '#a85d04', soft: '#fef3c7' },
  slate:   { primary: '#475569', dark: '#334155', soft: '#e2e8f0' },
};

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
  getStateDetail,
  TOPO_URLS,
  SLA_BY_CONCESSION_SEVERITY,
  MTTR_TREND,
  CONTRACTORS,
  DEFECT_MIX,
  CLAIMS_AGING,
  PAYMENT_VELOCITY,
  PAYMENT_VELOCITY_TREND,
  OPEN_CLAIMS,
  BUDGET_BURN,
  MONTHLY_RELEASES,
  STATES,
  STATE_REGIONS,
  TABS,
  TAB_THEMES,
  INCIDENT_HOURLY,
  INCIDENT_DISPATCH,
  TRAFFIC_FLOW,
  TOLL_PLAZAS,
  CONGESTION_HOTSPOTS,
  PCI_BY_STATE,
  BRIDGE_HEALTH,
  CO2_BY_CONCESSION,
  RENEWABLE_MIX,
  GREEN_PROCUREMENT,
  COMPLIANCE_OBLIGATIONS,
  EXPIRY_PIPELINE,
  COMPLIANCE_CALENDAR,
  CREW_UTILISATION,
  SAFETY_INCIDENTS,
  OVERTIME_HOTSPOTS,
  REPORTS_LIBRARY,
  REPORTS_SCHEDULE,
};
