// Simplified expressway alignments for road-level incident rendering.
window.IC_ROADS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'E1', name: 'North-South Expressway Northern Route', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.18, 6.45], [100.37, 6.15], [100.49, 5.78], [100.43, 5.41], [100.56, 5.07],
          [100.77, 4.78], [101.09, 4.60], [101.28, 4.24], [101.44, 3.78], [101.53, 3.45],
          [101.62, 3.14], [101.70, 2.93]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E2', name: 'North-South Expressway Southern Route', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [101.70, 2.93], [101.92, 2.62], [102.25, 2.19], [102.44, 2.93], [102.62, 2.58],
          [102.92, 2.20], [103.20, 1.90], [103.35, 1.55], [103.77, 1.49]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E5', name: 'Seremban-Port Dickson Highway', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.94, 2.72], [101.83, 2.70], [101.72, 2.66], [101.61, 2.58], [101.54, 2.51]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E8', name: 'East Coast Expressway', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.62, 3.14], [101.78, 3.30], [101.97, 4.24], [102.24, 4.12], [102.62, 3.92], [103.14, 3.80], [103.32, 3.81]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E37', name: 'Kajang Dispersal Link', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.62, 3.14], [101.67, 3.08], [101.73, 3.02], [101.79, 2.97], [101.84, 2.92]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E6', name: 'Elite Expressway', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.53, 3.45], [101.55, 3.20], [101.62, 3.03], [101.70, 2.93], [101.76, 2.75]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E9', name: 'Cheras-Kajang Expressway', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.68, 3.13], [101.71, 3.08], [101.75, 3.02], [101.78, 2.98]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'E11', name: 'Damansara-Puchong Expressway', type: 'expressway' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.53, 3.22], [101.58, 3.16], [101.61, 3.08], [101.64, 2.99]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'F1', name: 'Federal Route 1', type: 'federal' },
      geometry: {
        type: 'LineString',
        coordinates: [[100.37, 6.12], [100.48, 5.86], [100.39, 5.41], [100.72, 4.75], [101.09, 4.55], [101.27, 4.22], [101.44, 3.80], [101.70, 2.93], [102.26, 2.20], [103.33, 1.55]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'F2', name: 'Federal Route 2', type: 'federal' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.61, 3.13], [101.80, 3.22], [102.10, 3.43], [102.42, 3.82], [102.88, 3.82], [103.24, 3.81]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'F3', name: 'Federal Route 3', type: 'federal' },
      geometry: {
        type: 'LineString',
        coordinates: [[103.43, 4.45], [103.35, 3.81], [103.33, 3.04], [103.42, 2.46], [103.78, 1.49]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'B20', name: 'Selangor State Route B20', type: 'state' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.35, 3.16], [101.48, 3.10], [101.63, 3.08], [101.78, 3.01]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'N4', name: 'Negeri Sembilan State Route N4', type: 'state' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.86, 2.74], [101.96, 2.68], [102.08, 2.63], [102.20, 2.56]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'J32', name: 'Johor State Route J32', type: 'state' },
      geometry: {
        type: 'LineString',
        coordinates: [[103.55, 1.72], [103.68, 1.64], [103.80, 1.56], [103.92, 1.48]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'D-KLG-01', name: 'Klang District Maintenance Road', type: 'district' },
      geometry: {
        type: 'LineString',
        coordinates: [[101.33, 3.12], [101.39, 3.06], [101.47, 3.02], [101.55, 2.98]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'D-KTN-02', name: 'Kuantan District Access Road', type: 'district' },
      geometry: {
        type: 'LineString',
        coordinates: [[103.20, 3.90], [103.28, 3.84], [103.37, 3.78], [103.45, 3.72]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'D-PG-03', name: 'Penang District Connector', type: 'district' },
      geometry: {
        type: 'LineString',
        coordinates: [[100.28, 5.43], [100.34, 5.39], [100.41, 5.36], [100.48, 5.32]]
      }
    }
  ]
};