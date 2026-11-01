import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { chart, axisProps, gridProps, tooltipProps } from './chartTheme.js';
import { formatShort, formatWeekRange } from '../../utils/dates.js';
import { formatNumber } from '../../utils/nutrition.js';
import styles from './Charts.module.css';

export function WeeklyWeightLine({ data }) {
  const vals = data.map((d) => d.avg).filter((v) => v != null);
  return (
    <div className={styles.frame}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="start" tickFormatter={formatShort} {...axisProps} />
          <YAxis
            {...axisProps}
            width={40}
            domain={[Math.floor(Math.min(...vals) - 0.5), Math.ceil(Math.max(...vals) + 0.5)]}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip {...tooltipProps} labelFormatter={formatWeekRange} formatter={(v) => [`${formatNumber(v)} kg`, 'Average']} />
          <Line
            type="monotone"
            dataKey="avg"
            stroke={chart.accentStrong}
            strokeWidth={2}
            dot={{ r: 3, fill: chart.accentStrong, strokeWidth: 0 }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
