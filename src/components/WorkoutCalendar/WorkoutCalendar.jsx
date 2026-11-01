import { Check, Dumbbell, Moon, Sun } from 'lucide-react';
import { weekdayShort, fromKey } from '../../utils/dates.js';
import styles from './WorkoutCalendar.module.css';

/**
 * Seven columns: what the routine plans for each day, and whether it was done.
 * Tapping a planned session that isn't logged yet opens a pre-filled log form.
 */
export function WorkoutCalendar({ keys, today, planFor, onDate, onQuickLog, onOpenDay }) {
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
