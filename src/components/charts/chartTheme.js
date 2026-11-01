/** Shared Recharts styling so every chart speaks the same visual language. */
export const chart = {
  text: '#88847d',
  ink: '#242321',
  grid: '#e5e1d9',
  accent: '#718b78',
  accentStrong: '#5c7563',
  accent2: '#d9bfa5',
  accent2Soft: '#f1e6da',
  font: "'Instrument Sans Variable', system-ui, sans-serif",
};

export const axisProps = {
  stroke: chart.grid,
  tick: { fill: chart.text, fontSize: 12, fontFamily: chart.font },
  tickLine: false,
  axisLine: false,
};

export const gridProps = { stroke: chart.grid, vertical: false };

export const tooltipProps = {
  cursor: { fill: 'rgba(36,35,33,0.04)', stroke: chart.grid },
  contentStyle: {
    background: '#fbfaf7',
    border: `1px solid ${chart.grid}`,
    borderRadius: 6,
    fontFamily: chart.font,
    fontSize: 13,
    boxShadow: '0 4px 24px rgba(36,35,33,0.08)',
  },
  labelStyle: { color: chart.ink, marginBottom: 4 },
  itemStyle: { color: chart.ink, padding: 0 },
};
