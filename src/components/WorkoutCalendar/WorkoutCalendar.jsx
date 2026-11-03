import { Link } from 'react-router-dom';
import { Check, Dumbbell, Footprints, Moon, Sun } from 'lucide-react';
import { weekdayShort, fromKey } from '../../utils/dates.js';
import styles from './WorkoutCalendar.module.css';

const fmt = (n) => Math.round(n).toLocaleString('en-IN');

/**
 * Seven columns: what the routine plans for each day, whether it was done,
 * and whether the step goal was hit. Tapping a planned session that isn't
 * logged yet opens a pre-filled log form; tapping an unmet step circle opens
 * that day in the diary.
 */
export function WorkoutCalendar({ keys, today, planFor, onDate, onQuickLog, onOpenDay, stepsFor, stepGoal }) {
  return (
    <ol className={styles.grid} aria-label="Week">
      {keys.map((date) => {
        const plan = planFor(date);
        const done = onDate(date);
        const strengthDone = done.some((w) => w.type === 'strength');
        const cardioDone = done.some((w) => w.type === 'cardio');
        const rest = !plan.strength && !plan.cardio;
        return (
          <li key={date} className={`${styles.day} ${date === today ? styles.today : ''}`}>
            <button type="button" className={styles.dayHead} onClick={() => onOpenDay(date)}>
              <span className="t-caption">{weekdayShort(date)}</span>
              <span className={styles.num}>{fromKey(date).getDate()}</span>
            </button>
            <div className={styles.slots}>
              {plan.strength && (
                <Slot
                  label="Strength"
                  icon={<Dumbbell size={15} />}
                  done={strengthDone}
                  onClick={() => !strengthDone && onQuickLog(date, 'strength')}
                />
              )}
              {plan.cardio && (
                <Slot
                  label={`${plan.cardio === 'morning' ? 'Morning' : 'Evening'} cardio`}
                  icon={plan.cardio === 'morning' ? <Sun size={15} /> : <Moon size={15} />}
                  done={cardioDone}
                  onClick={() => !cardioDone && onQuickLog(date, 'cardio', plan.cardio)}
                />
              )}
              {rest && <span className={`t-caption ${styles.rest}`}>Rest</span>}
              {/* Unplanned sessions still show up */}
              {!plan.strength && strengthDone && <Slot label="Strength" icon={<Dumbbell size={15} />} done extra />}
              {!plan.cardio && cardioDone && <Slot label="Cardio" icon={<Sun size={15} />} done extra />}

              <StepSlot date={date} steps={stepsFor(date)} goal={stepGoal} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Slot({ label, icon, done, onClick, extra }) {
  return (
    <button
      type="button"
      className={`interactive ${styles.slot} ${done ? styles.done : ''} ${extra ? styles.extra : ''}`}
      onClick={onClick}
      disabled={done}
      aria-label={`${label}: ${done ? 'done' : 'not logged, tap to log'}`}
      title={label}
    >
      {done ? <Check size={15} strokeWidth={2.5} /> : icon}
    </button>
  );
}

/** Goal hit → solid with a tick. Some steps → light fill. None → dashed. */
function StepSlot({ date, steps, goal }) {
  const hit = steps >= goal;
  const summary = steps > 0 ? `${fmt(steps)} of ${fmt(goal)} steps` : 'No steps logged';

  if (hit) {
    return (
      <span className={`${styles.slot} ${styles.stepHit}`} role="img" aria-label={`Steps: goal hit, ${summary}`} title={summary}>
        <Check size={15} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <Link
      to={`/diary?date=${date}`}
      className={`interactive ${styles.slot} ${styles.stepSlot} ${steps > 0 ? styles.stepPartial : ''}`}
      aria-label={`Steps: ${summary}. Open this day to log steps`}
      title={summary}
    >
      <Footprints size={15} />
    </Link>
  );
}