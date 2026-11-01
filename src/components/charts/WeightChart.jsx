import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { chart, axisProps, gridProps, tooltipProps } from './chartTheme.js';
import { formatShort } from '../../utils/dates.js';
import { formatNumber } from '../../utils/nutrition.js';
import styles from './Charts.module.css';

/** Daily weigh-ins as quiet dots; the 7-day average as the line that matters. */
export function WeightChart({ data }) {
  const values = data.map((d) => d.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);

  return (
    <figure>
      <div className={styles.frame}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" tickFormatter={formatShort} {...axisProps} minTickGap={24} />
            <YAxis domain={[min, max]} {...axisProps} width={40} tickFormatter={(v) => formatNumber(v)} />
            <Tooltip
              {...tooltipProps}
              labelFormatter={formatShort}
              formatter={(v, name) => [`${formatNumber(v)} kg`, name]}
            />
            <Scatter name="Weigh-in" dataKey="kg" fill={chart.accent2} isAnimationActive={false} />
            <Line
              name="7-day average"
              type="monotone"
              dataKey="rolling"
              stroke={chart.accentStrong}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className={styles.legend}>
        <span className={styles.key}><span className={styles.swatchDot} /> Weigh-in</span>
        <span className={styles.key}><span className={styles.swatchLine} /> 7-day average</span>
      </figcaption>
    </figure>
  );
}
