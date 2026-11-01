import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field } from '../../components/ui/Field.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { WorkoutCalendar } from '../../components/WorkoutCalendar/WorkoutCalendar.jsx';
import { useWorkouts, WORKOUT_TYPES, CARDIO_TIMES } from '../../hooks/useWorkouts.js';
import { useToday } from '../../hooks/useToday.js';
import { uid } from '../../utils/ids.js';
import { addDays, startOfWeek, weekKeys, formatWeekRange, formatMedium, isValidKey, WEEKDAY_NAMES } from '../../utils/dates.js';
import styles from './Activity.module.css';

export default function Activity() {
  const today = useToday();
  const w = useWorkouts();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [form, setForm] = useState(null); // workout draft
  const [routineOpen, setRoutineOpen] = useState(false);
  const keys = weekKeys(weekStart);

  const weekEntries = useMemo(
    () => w.entries.filter((e) => e.date >= keys[0] && e.date <= keys[6]),
    [w.entries, keys],
  );

  const plannedStrength = keys.filter((k) => w.planFor(k).strength).length;
  const plannedCardio = keys.filter((k) => w.planFor(k).cardio).length;
  const doneStrength = new Set(weekEntries.filter((e) => e.type === 'strength').map((e) => e.date)).size;
  const doneCardio = new Set(weekEntries.filter((e) => e.type === 'cardio').map((e) => e.date)).size;

  const newDraft = (date = today, type = 'strength', time = null) => ({
    id: uid(),
    date,
    type,
    cardioTime: type === 'cardio' ? time ?? w.planFor(date).cardio ?? 'morning' : null,
    duration: String(w.durations[type]),
    notes: '',
    isNew: true,
  });

  const del = (entry) => {
    w.remove(entry.id);
    toast('Workout deleted', { label: 'Undo', onClick: () => w.upsert(entry) });
  };

  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="Activity"
        lead="Your routine is planned in dashed circles. Tap one to log it. Exercise isn’t added back to your calorie budget."
        actions={<Button variant="primary" icon={<Plus />} onClick={() => setForm(newDraft())}>Log</Button>}
      />

      <div className={styles.weekBar}>
        <Button variant="ghost" icon={<ChevronLeft />} label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))} />
        <p className={styles.weekLabel}>{weekStart === startOfWeek(today) ? 'This week' : formatWeekRange(weekStart)}</p>
        <Button variant="ghost" icon={<ChevronRight />} label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))} />
        <Button variant="ghost" size="sm" onClick={() => setRoutineOpen(true)} className={styles.routineBtn}>Edit routine</Button>
      </div>

      <WorkoutCalendar
        keys={keys}
        today={today}
        planFor={w.planFor}
        onDate={w.onDate}
        onQuickLog={(date, type, time) => setForm(newDraft(date, type, time))}
        onOpenDay={(date) => setForm(newDraft(date))}
      />

      <dl className={styles.summary}>
        <div><dt className="t-small t-muted">Strength</dt><dd><span className="t-numeral">{doneStrength}</span> of {plannedStrength} planned</dd></div>
        <div><dt className="t-small t-muted">Cardio</dt><dd><span className="t-numeral">{doneCardio}</span> of {plannedCardio} planned</dd></div>
        <div>
          <dt className="t-small t-muted">Total time</dt>
          <dd><span className="t-numeral">{weekEntries.reduce((a, e) => a + e.duration, 0)}</span> min</dd>
        </div>
      </dl>

      <section className={styles.section}>
        <h2 className="t-heading">Logged this week</h2>
        {weekEntries.length === 0 ? (
          <EmptyState title="Nothing logged this week">Tap a dashed circle in the calendar to log a planned session.</EmptyState>
        ) : (
          <ul className={`ruled ${styles.list}`}>
            {weekEntries.map((e) => (
              <li key={e.id} className={styles.entry}>
                <div className={styles.entryMain}>
                  <p>
                    {WORKOUT_TYPES[e.type]}
                    {e.cardioTime ? `, ${CARDIO_TIMES[e.cardioTime].toLowerCase()}` : ''} · {e.duration} min
                  </p>
                  <p className="t-small t-muted">{formatMedium(e.date)}{e.notes ? ` — ${e.notes}` : ''}</p>
                </div>
                <Button variant="ghost" size="sm" icon={<Pencil />} label="Edit workout" onClick={() => setForm({ ...e, duration: String(e.duration) })} />
                <Button variant="ghost" size="sm" icon={<Trash2 />} label="Delete workout" onClick={() => del(e)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={form !== null} onClose={() => setForm(null)} title={form?.isNew ? 'Log workout' : 'Edit workout'}>
        <WorkoutForm
          draft={form}
          today={today}
          durations={w.durations}
          onCancel={() => setForm(null)}
          onSave={(entry) => {
            w.upsert(entry);
            setForm(null);
            toast(form?.isNew ? 'Workout logged' : 'Workout updated');
          }}
        />
      </Sheet>

      <Sheet open={routineOpen} onClose={() => setRoutineOpen(false)} title="Weekly routine">
        <RoutineForm
          routine={w.routine}
          onCancel={() => setRoutineOpen(false)}
          onSave={(r) => {
            w.setRoutine(r);
            setRoutineOpen(false);
            toast('Routine updated');
          }}
        />
      </Sheet>
    </div>
  );
}

function WorkoutForm({ draft, today, durations, onSave, onCancel }) {
  const [d, setD] = useState(draft);
  const [error, setError] = useState('');
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const duration = Number(d.duration);
    if (!isValidKey(d.date)) return setError('Choose a date.');
    if (d.date > today) return setError('You can’t log a workout in the future.');
    if (!Number.isFinite(duration) || duration <= 0 || duration > 600) return setError('Enter a duration between 1 and 600 minutes.');
    const { isNew: _n, ...entry } = d;
    onSave({ ...entry, duration: Math.round(duration), cardioTime: d.type === 'cardio' ? d.cardioTime : null, notes: d.notes.trim() });
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <fieldset className={styles.segment}>
        <legend className="t-small t-muted">Type</legend>
        {Object.entries(WORKOUT_TYPES).map(([k, v]) => (
          <label key={k} className={styles.segOption}>
            <input
              type="radio"
              name="type"
              value={k}
              checked={d.type === k}
              onChange={() => setD((x) => ({ ...x, type: k, duration: x.isNew ? String(durations[k]) : x.duration, cardioTime: k === 'cardio' ? x.cardioTime ?? 'morning' : null }))}
            />
            <span>{v}</span>
          </label>
        ))}
      </fieldset>

      {d.type === 'cardio' && (
        <fieldset className={styles.segment}>
          <legend className="t-small t-muted">When</legend>
          {Object.entries(CARDIO_TIMES).map(([k, v]) => (
            <label key={k} className={styles.segOption}>
              <input type="radio" name="time" value={k} checked={d.cardioTime === k} onChange={() => set('cardioTime', k)} />
              <span>{v}</span>
            </label>
          ))}
        </fieldset>
      )}

      <div className={styles.two}>
        <Field label="Date">
          {(p) => <input {...p} type="date" value={d.date} max={today} onChange={(e) => set('date', e.target.value)} />}
        </Field>
        <Field label="Duration (min)" error={error}>
          {(p) => <input {...p} type="number" inputMode="numeric" value={d.duration} onChange={(e) => { set('duration', e.target.value); setError(''); }} />}
        </Field>
      </div>

      <Field label="Notes">
        {(p) => <textarea {...p} value={d.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Legs and core, felt strong" maxLength={300} />}
      </Field>

      <div className={styles.buttons}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{draft.isNew ? 'Log workout' : 'Save'}</Button>
      </div>
    </form>
  );
}

function RoutineForm({ routine, onSave, onCancel }) {
  const [r, setR] = useState(() => structuredClone(routine));
  const update = (i, patch) => setR((rs) => rs.map((day, j) => (j === i ? { ...day, ...patch } : day)));
  return (
    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); onSave(r); }}>
      <table className={styles.routine}>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Strength</th>
            <th scope="col">Cardio</th>
          </tr>
        </thead>
        <tbody>
          {r.map((day, i) => (
            <tr key={WEEKDAY_NAMES[i]}>
              <th scope="row">{WEEKDAY_NAMES[i]}</th>
              <td>
                <input type="checkbox" checked={day.strength} onChange={(e) => update(i, { strength: e.target.checked })} aria-label={`Strength on ${WEEKDAY_NAMES[i]}`} />
              </td>
              <td>
                <select value={day.cardio ?? ''} onChange={(e) => update(i, { cardio: e.target.value || null })} aria-label={`Cardio on ${WEEKDAY_NAMES[i]}`} className={styles.routineSelect}>
                  <option value="">None</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.buttons}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save routine</Button>
      </div>
    </form>
  );
}
