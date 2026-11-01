import { Flame, Egg } from 'lucide-react';
import { Meter } from '../ui/Meter.jsx';
import { fmtKcal, fmtProtein } from '../../utils/nutrition.js';
import styles from './NutritionSummary.module.css';

/**
 * The day at a glance. "Eaten" counts meals you've marked eaten plus snacks;
 * the paler segment shows what the rest of the plan will add.
 */
export function NutritionSummary({ eaten, planned, kcalTarget, proteinTarget }) {
  return (
    <section className={styles.summary} aria-label="Today’s nutrition">
      <Metric
        name="Calories"
        tone="kcal"
        icon={Flame}
        value={eaten.kcal}
        planned={planned.kcal}
        target={kcalTarget}
        unit="kcal"
        fmt={fmtKcal}
      />
      <Metric
        name="Protein"
        tone="protein"
        icon={Egg}
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

function Metric({ name, tone, icon: Icon, value, planned, target, unit, fmt, aimAbove = false }) {
  const remaining = target - value;
  let status;
  if (remaining > 0) status = `${fmt(remaining)} ${unit} to go`;
  else if (remaining === 0 || (aimAbove && remaining < 0)) status = 'Target reached';
  else status = `${fmt(-remaining)} ${unit} over`;

  const toneVars = {
    '--tone': `var(--c-${tone})`,
    '--tone-soft': `var(--c-${tone}-soft)`,
    '--tone-ink': `var(--c-${tone}-ink)`,
  };

  return (
    <div className={styles.metric} style={toneVars}>
      <div className={styles.head}>
        <h2 className={styles.name}>
          <span className={styles.icon} aria-hidden="true">
            <Icon size={15} strokeWidth={2.2} />
          </span>
          {name}
        </h2>
        <p className={styles.status}>{status}</p>
      </div>
      <p className={styles.figure}>
        <span className={`t-numeral ${styles.value}`}>{fmt(value)}</span>
        <span className={styles.target}>
          / {fmt(target)} {unit}
        </span>
      </p>
      <Meter value={value} planned={planned} max={target} label={`${name} eaten`} color="var(--tone)" size="lg" />
      <p className={styles.planned}>
        {fmt(planned)} {unit} planned today
      </p>
    </div>
  );
}