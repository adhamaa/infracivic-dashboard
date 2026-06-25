// js/charts.js -- AG Charts helpers

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  const charts = new Map();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const palette = {
    purple: '#824acb',
    blue: '#1976d2',
    green: '#2e8b45',
    orange: '#ff7a16',
    red: '#ef3b3b',
    yellow: '#f9a825',
    teal: '#17aeb8',
    slate: '#64748b',
  };

  function hasAgCharts() {
    return Boolean(window.agCharts?.AgCharts);
  }

  function destroyChart(id) {
    const chart = charts.get(id);
    if (chart?.destroy) chart.destroy();
    charts.delete(id);
  }

  function createChart(id, options) {
    const container = document.getElementById(id);
    if (!container) return;
    destroyChart(id);
    if (!hasAgCharts()) {
      container.innerHTML = '<div class="chart-empty">Chart library unavailable.</div>';
      return;
    }
    container.innerHTML = '';
    try {
      const chart = window.agCharts.AgCharts.create({
        container,
        background: { fill: 'transparent' },
        padding: { top: 6, right: 10, bottom: 6, left: 8 },
        animation: { enabled: !reducedMotion },
        theme: {
          palette: {
            fills: [palette.purple, palette.blue, palette.green, palette.orange, palette.red, palette.teal, palette.yellow, palette.slate],
            strokes: [palette.purple, palette.blue, palette.green, palette.orange, palette.red, palette.teal, palette.yellow, palette.slate],
          },
          overrides: {
            common: {
              title: { enabled: false },
              subtitle: { enabled: false },
              legend: { item: { label: { fontFamily: 'Segoe UI, system-ui, sans-serif', color: '#475569' } } },
            },
          },
        },
        ...options,
      });
      charts.set(id, chart);
      return chart;
    } catch (error) {
      console.warn(`Unable to render chart ${id}`, error);
      container.innerHTML = '<div class="chart-empty">Chart could not be rendered.</div>';
    }
  }

  function filteredByConcession(items) {
    const selected = IC.state.filters.concession;
    if (selected === 'all') return items;
    return items.filter(item => item.concession === selected);
  }

  function severityColor(key) {
    const lookup = {
      Critical: D.SEV_COLORS.critical,
      High: D.SEV_COLORS.high,
      Medium: D.SEV_COLORS.medium,
      Low: D.SEV_COLORS.low,
      critical: D.SEV_COLORS.critical,
      high: D.SEV_COLORS.high,
      medium: D.SEV_COLORS.medium,
      low: D.SEV_COLORS.low,
    };
    return lookup[key] || palette.purple;
  }

  IC.charts = {
    palette,
    createChart,
    destroyChart,
    filteredByConcession,
    severityColor,
  };
})();
