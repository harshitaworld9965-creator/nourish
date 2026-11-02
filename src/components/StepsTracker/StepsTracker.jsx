import { useId, useState } from 'react';
import { Footprints, Plus } from 'lucide-react';
import { Meter } from '../ui/Meter.jsx';
import styles from './StepsTracker.module.css';

const fmt = (n) => Math.round(n).toLocaleString('en-IN');
const QUICK = [500, 1000];

/**
 * Steps for one day. Type the day's total (replaces the number) or use the
 * quick buttons to add on top of it.
 */
export function StepsTracker({ steps, goal, onSet }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const left = goal - steps;

  const submit = (e) => {
    e.preventDefault();
    const n = Number(draft.replace(/[,\s]/g, ''));
    if (draft.trim() === '' || !Number.isFinite(n) || n < 0 || n > 100000) {
      setError('Enter a number between 0 and 1,00,000.');
      return;
    }
    onSet(Math.round(n));
    setDraft('');
    setError('');
  };

  return (
    <section className={styles.steps} aria-label="Steps">
      <div className={styles.head}>
        <h2 className={styles.name}>
          <span className={styles.icon} aria-hidden="true">
            <Footprints size={15} strokeWidth={2.2} />
          </span>
          Steps
        </h2>
        <p className={styles.status}>{left > 0 ? `${fmt(left)} to go` : 'Goal reached'}</p>
      </div>

      <p className={styles.figure}>
        <span className={`t-numeral ${styles.value}`}>{fmt(steps)}</span>
        <span className={styles.target}>/ {fmt(goal)}</span>
      </p>

      <Meter value={steps} max={goal} label="Steps walked" color="var(--c-steps)" size="lg" />

      <div className={styles.row}>
        <form className={styles.form} onSubmit={submit} noValidate>
          <label htmlFor={inputId} className="sr-only">
            Total steps for the day
          </label>
          <input
            id={inputId}
            className={styles.input}
            inputMode="numeric"
            placeholder={steps ? 'Update total' : 'Enter total'}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError('');
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          <button type="submit" className={`interactive ${styles.save}`}>
            Save
          </button>
        </form>

        <div className={styles.quick}>
          {QUICK.map((n) => (
            <button key={n} type="button" className={`interactive ${styles.add}`} onClick={() => onSet(steps + n)}>
              <Plus size={16} strokeWidth={2.4} />
              {fmt(n)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}