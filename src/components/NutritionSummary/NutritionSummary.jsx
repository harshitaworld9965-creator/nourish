import { Meter } from '../ui/Meter.jsx';
import { fmtKcal, fmtProtein } from '../../utils/nutrition.js';
import styles from './NutritionSummary.module.css';

/**
 * The day at a glance. "Eaten" counts meals you've marked eaten; the paler
 * segment shows what the rest of the plan will add.
 */
export function NutritionSummary({ eaten, planned, kcalTarget, proteinTarget }) {
  return (
    <section className={styles.summary} aria-label="Today’s nutrition">
      <Metric
        name="Calories"
        value={eaten.kcal}
        planned={planned.kcal}
        target={kcalTarget}
        unit="kcal"
        fmt={fmtKcal}
      />
      <Metric
        name="Protein"
        value={eaten.protein}
        planned={planned.protein}
        target={proteinTarget}
        unit="g"
        fmt={fmtProtein}
        aimAbove
      />
    </section>
  );
}

function Metric({ name, value, planned, target, unit, fmt, aimAbove = false }) {
  const remaining = target - value;
  let status;
  if (remaining > 0) status = `${fmt(remaining)} ${unit} remaining`;
  else if (remaining === 0 || (aimAbove && remaining < 0)) status = aimAbove ? 'Target reached' : 'On target';
  else status = `${fmt(-remaining)} ${unit} over`;

  return (
    <div className={styles.metric}>
      <div className={styles.head}>
        <h2 className={styles.name}>{name}</h2>
        <p className={`t-small t-muted ${styles.status}`}>{status}</p>
      </div>
      <p className={styles.figure}>
        <span className={`t-numeral ${styles.value}`}>{fmt(value)}</span>
        <span className={styles.target}>
          / {fmt(target)} {unit}
        </span>
      </p>
      <Meter value={value} planned={planned} max={target} label={`${name} eaten`} />
      <p className="t-caption">
        {fmt(planned)} {unit} planned today
      </p>
    </div>
  );
}
