import { Droplet, Minus, Plus } from 'lucide-react';
import { Meter } from '../ui/Meter.jsx';
import styles from './WaterTracker.module.css';

const litres = (ml) => (ml / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 });

/**
 * Water for one day. Each tap adds or removes one glass.
 * The glass row is decorative (aria-hidden) — the meter and text carry the meaning.
 */
export function WaterTracker({ water, target, glass, onAdd }) {
  const glasses = Math.ceil(target / glass);
  const filled = Math.min(glasses, Math.floor(water / glass));
  const left = target - water;

  return (
    <section className={styles.water} aria-label="Water">
      <div className={styles.head}>
        <h2 className={styles.name}>
          <span className={styles.icon} aria-hidden="true">
            <Droplet size={15} strokeWidth={2.2} />
          </span>
          Water
        </h2>
        <p className={styles.status}>
          {left > 0 ? `${left.toLocaleString('en-IN')} ml to go` : 'Target reached'}
        </p>
      </div>

      <p className={styles.figure}>
        <span className={`t-numeral ${styles.value}`}>{litres(water)}</span>
        <span className={styles.target}>/ {litres(target)} L</span>
      </p>

      <Meter value={water} max={target} label="Water drunk" color="var(--c-water)" size="lg" />

      <div className={styles.row}>
        <ol className={styles.glasses} aria-hidden="true">
          {Array.from({ length: glasses }, (_, i) => (
            <li key={i} className={i < filled ? styles.full : undefined} />
          ))}
        </ol>
        <div className={styles.buttons}>
          <button
            type="button"
            className={`interactive ${styles.minus}`}
            onClick={() => onAdd(-glass)}
            disabled={water === 0}
            aria-label={`Remove ${glass} ml`}
          >
            <Minus size={18} />
          </button>
          <button type="button" className={`interactive ${styles.add}`} onClick={() => onAdd(glass)}>
            <Plus size={18} strokeWidth={2.4} />
            {glass} ml
          </button>
        </div>
      </div>
    </section>
  );
}