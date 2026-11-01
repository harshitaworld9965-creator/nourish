import { Minus, Plus } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
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
        <h2 className={styles.name}>Water</h2>
        <p className="t-small t-muted">
          {left > 0 ? `${left.toLocaleString('en-IN')} ml to go` : 'Target reached'}
        </p>
      </div>

      <p className={styles.figure}>
        <span className={`t-numeral ${styles.value}`}>{litres(water)}</span>
        <span className={styles.target}>/ {litres(target)} L</span>
      </p>

      <Meter value={water} max={target} label="Water drunk" />

      <div className={styles.row}>
        <ol className={styles.glasses} aria-hidden="true">
          {Array.from({ length: glasses }, (_, i) => (
            <li key={i} className={i < filled ? styles.full : undefined} />
          ))}
        </ol>
        <div className={styles.buttons}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Minus />}
            label={`Remove ${glass} ml`}
            onClick={() => onAdd(-glass)}
            disabled={water === 0}
          />
          <Button variant="secondary" size="sm" icon={<Plus />} onClick={() => onAdd(glass)}>
            {glass} ml
          </Button>
        </div>
      </div>
    </section>
  );
}