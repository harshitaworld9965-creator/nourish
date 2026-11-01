import styles from './Meter.module.css';

/**
 * Progress bar. `value` is eaten, `planned` (optional) shows as a paler
 * segment behind it. Pass any CSS colour as `color`; size 'lg' is chunkier.
 */
export function Meter({ value, planned, max, label, color = 'var(--color-accent)', size = 'md' }) {
  const pct = (n) => `${Math.min(100, Math.max(0, (n / max) * 100))}%`;
  const over = value > max;
  return (
    <div
      className={`${styles.track} ${size === 'lg' ? styles.lg : ''}`}
      style={{ '--meter': color }}
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