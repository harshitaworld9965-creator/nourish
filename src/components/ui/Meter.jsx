import styles from './Meter.module.css';

/**
 * Hairline progress bar. `value` is eaten, `planned` (optional) is shown as a
 * paler segment behind it so you can see what the rest of the day adds.
 */
export function Meter({ value, planned, max, label }) {
  const pct = (n) => `${Math.min(100, Math.max(0, (n / max) * 100))}%`;
  const over = value > max;
  return (
    <div
      className={styles.track}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
    >
      {planned != null && <span className={styles.planned} style={{ width: pct(planned) }} />}
      <span className={`${styles.fill} ${over ? styles.over : ''}`} style={{ width: pct(value) }} />
    </div>
  );
}
