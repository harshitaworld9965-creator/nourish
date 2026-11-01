import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import { chart, axisProps, gridProps, tooltipProps } from './chartTheme.js';
import { weekdayShort, formatMedium } from '../../utils/dates.js';
import styles from './Charts.module.css';

/** One bar per day against a dashed target line. Days with nothing eaten show no bar. */
export function DailyBars({ data, dataKey, target, unit, format }) {
  const max = Math.max(target * 1.2, ...data.map((d) => d[dataKey]));
  return (
    <figure>
      <div className={styles.frame}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" tickFormatter={weekdayShort} {...axisProps} />
            <YAxis {...axisProps} width={44} domain={[0, Math.ceil(max / 10) * 10]} tickFormatter={format} />
            <Tooltip
              {...tooltipProps}
              labelFormatter={formatMedium}
              formatter={(v, _n, item) => [item.payload.logged ? `${format(v)} ${unit}` : 'Not logged', '']}
              separator=""
            />
            <ReferenceLine y={target} stroke={chart.text} strokeDasharray="4 4" />
            <Bar dataKey={dataKey} radius={[2, 2, 0, 0]} maxBarSize={36} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.date} fill={d.onTarget ? chart.accent : chart.accent2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className={styles.legend}>
        <span className={styles.key}><span className={styles.swatchBar} /> On target</span>
        <span className={styles.key}><span className={styles.swatchBar} style={{ background: chart.accent2 }} /> Off target</span>
        <span className={styles.key}><span className={styles.swatchDash} /> Target</span>
      </figcaption>
    </figure>
  );
}
