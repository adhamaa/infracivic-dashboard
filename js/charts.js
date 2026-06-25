// js/charts.js -- AG Charts helpers

(() => {
  const IC = window.IC = window.IC || {};
  const D = window.IC_DATA;
  const charts = new Map();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const chartFont = 'Segoe UI, system-ui, -apple-system, sans-serif';
  const palette = {
    violet: '#6d5dfc',
    blue: '#2563eb',
    cyan: '#0891b2',
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
    pink: '#db2777',
    slate: '#64748b',
  };

  const axisLabel = { fontFamily: chartFont, color: '#64748b', fontSize: 11 };
  const legendLabel = { fontFamily: chartFont, color: '#475569', fontSize: 11 };

  function modernAxis(axis) {
    return {
      line: { enabled: false },
      tick: { enabled: false },
      ...axis,
      label: { ...axisLabel, ...(axis.label || {}) },
      title: axis.title ? { fontFamily: chartFont, color: '#475569', fontSize: 11, fontWeight: 700, ...axis.title } : axis.title,
    };
  }

  function modernLegend(legend = {}) {
    return {
      position: 'bottom',
      spacing: 10,
      item: {
        marker: { shape: 'circle', size: 9 },
        label: legendLabel,
      },
      ...legend,
      item: {
        marker: { shape: 'circle', size: 9, ...(legend.item?.marker || {}) },
        label: { ...legendLabel, ...(legend.item?.label || {}) },
      },
    };
  }

  function modernSeries(series) {
    if (series.type === 'bar') {
      return {
        ...series,
        strokeWidth: series.strokeWidth ?? 0,
        cornerRadius: series.cornerRadius ?? 6,
        label: { enabled: false, color: '#334155', fontFamily: chartFont, fontSize: 10, ...(series.label || {}) },
      };
    }
    if (series.type === 'line') {
      return {
        ...series,
        strokeWidth: series.strokeWidth ?? 2.75,
        marker: { enabled: false, ...(series.marker || {}) },
      };
    }
    if (series.type === 'pie' || series.type === 'donut') {
      return {
        ...series,
        stroke: series.stroke || '#ffffff',
        strokeWidth: series.strokeWidth ?? 2,
        calloutLabel: { color: '#475569', fontFamily: chartFont, fontSize: 11, minAngle: 18, ...(series.calloutLabel || {}) },
        sectorLabel: { color: '#ffffff', fontFamily: chartFont, fontSize: 11, fontWeight: 800, ...(series.sectorLabel || {}) },
      };
    }
    return series;
  }

  function modernOptions(options) {
    const next = {
      ...options,
      legend: modernLegend(options.legend),
      series: Array.isArray(options.series) ? options.series.map(modernSeries) : options.series,
    };
    if (Array.isArray(options.axes)) next.axes = options.axes.map(modernAxis);
    else delete next.axes;
    return next;
  }

  function hasAgCharts() {
    return Boolean(window.agCharts?.AgCharts);
  }

  function destroyChart(id) {
    const chart = charts.get(id);
    if (chart?.destroy) chart.destroy();
    charts.delete(id);
  }

  function chartBox(container) {
    const rect = container.getBoundingClientRect();
    const style = window.getComputedStyle(container);
    const xPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const yPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return {
      width: Math.max(0, Math.floor(rect.width - xPadding)),
      height: Math.max(0, Math.floor(rect.height - yPadding)),
    };
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
    const size = chartBox(container);
    const sizeOptions = size.width > 0 && size.height > 0 ? size : {};
    try {
      const chart = window.agCharts.AgCharts.create({
        container,
        ...sizeOptions,
        background: { fill: 'transparent' },
        padding: { top: 10, right: 14, bottom: 10, left: 10 },
        animation: { enabled: !reducedMotion },
        theme: {
          palette: {
            fills: [palette.violet, palette.blue, palette.green, palette.amber, palette.red, palette.cyan, palette.pink, palette.slate],
            strokes: [palette.violet, palette.blue, palette.green, palette.amber, palette.red, palette.cyan, palette.pink, palette.slate],
          },
          overrides: {
            common: {
              title: { enabled: false },
              subtitle: { enabled: false },
              legend: { item: { label: legendLabel } },
            },
          },
        },
        ...modernOptions(options),
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
    return lookup[key] || palette.violet;
  }

  IC.charts = {
    palette,
    createChart,
    destroyChart,
    filteredByConcession,
    severityColor,
  };
})();
