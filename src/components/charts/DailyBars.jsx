import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import { chart, axisProps, gridProps, tooltipProps } from './chartTheme.js';
import { weekdayShort, formatMedium } from '../../utils/dates.js';
import styles from './Charts.module.css';

/**
 * Bars against a dashed target line. Bars that meet the target are solid,
 * the rest are paler. Entries with logged: false show no bar.
 */
export function DailyBars({
  data,
  dataKey,
  target,
  unit,
  format,
  color = chart.accent,
  xFormat = weekdayShort,
  labelFormat = formatMedium,
}) {
  const max = Math.max(target * 1.2, ...data.map((d) => d[dataKey] || 0));
  const roundTo = max > 2000 ? 1000 : 10;
  const top = Math.ceil(max / roundTo) * roundTo;

  return (
    <figure>
      <div className={styles.frame}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" tickFormatter={xFormat} {...axisProps} />
            <YAxis {...axisProps} width={top >= 10000 ? 56 : 46} domain={[0, top]} tickFormatter={format} />
            <Tooltip
              {...tooltipProps}
              labelFormatter={labelFormat}
              formatter={(v, _n, item) => [item.payload.logged ? `${format(v)} ${unit}` : 'Not logged', '']}
              separator=""
            />
            <ReferenceLine y={target} stroke={chart.text} strokeDasharray="4 4" />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.date} fill={color} fillOpacity={d.onTarget ? 1 : 0.35} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className={styles.legend}>
        <span className={styles.key}>
          <span className={styles.swatchBar} style={{ background: color }} /> On target
        </span>
        <span className={styles.key}>
          <span className={styles.swatchBar} style={{ background: color, opacity: 0.35 }} /> Below or over
        </span>
        <span className={styles.key}>
          <span className={styles.swatchDash} /> Target
        </span>
      </figcaption>
    </figure>
  );
}