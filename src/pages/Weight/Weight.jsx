import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field } from '../../components/ui/Field.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { WeightChart } from '../../components/charts/WeightChart.jsx';
import { useWeight, withRollingAverage, weeklyAverages } from '../../hooks/useWeight.js';
import { useToday } from '../../hooks/useToday.js';
import { uid } from '../../utils/ids.js';
import { formatMedium, formatWeekRange, isValidKey } from '../../utils/dates.js';
import { formatNumber } from '../../utils/nutrition.js';
import styles from './Weight.module.css';

const signed = (n) => (n > 0 ? `+${formatNumber(n)}` : n < 0 ? `−${formatNumber(-n)}` : '0');

export default function Weight() {
  const { entries, stats, upsert, remove } = useWeight();
  const today = useToday();
  const toast = useToast();
  const [editing, setEditing] = useState(null);

  const chartData = useMemo(() => withRollingAverage(entries.slice(-90)), [entries]);
  const weeks = useMemo(() => weeklyAverages(entries, 6, today).reverse(), [entries, today]);

  const del = (entry) => {
    remove(entry.id);
    toast(`Removed ${formatMedium(entry.date)}`, { label: 'Undo', onClick: () => upsert(entry) });
  };

  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="Weight"
        lead="Weight moves day to day with water, salt and digestion. Watch the 7-day average, not a single weigh-in."
      />

      <WeightForm key={today} today={today} entries={entries} onSave={(e) => { upsert(e); toast('Weight saved'); }} />

      {entries.length === 0 ? (
        <EmptyState title="No weigh-ins yet">
          Weigh yourself in the morning, after the bathroom and before eating, whenever it suits you. Daily entries aren’t
          required.
        </EmptyState>
      ) : (
        <>
          <dl className={styles.stats}>
            <Stat label="Latest" value={formatNumber(stats.latest.kg)} unit="kg" note={formatMedium(stats.latest.date)} />
            <Stat
              label="7-day average"
              value={stats.sevenDay != null ? formatNumber(stats.sevenDay) : '—'}
              unit={stats.sevenDay != null ? 'kg' : ''}
              note={stats.sevenDay == null ? 'No entries in the last 7 days' : 'Last 7 days'}
            />
            <Stat
              label="vs last week"
              value={stats.weekChange != null ? signed(stats.weekChange) : '—'}
              unit={stats.weekChange != null ? 'kg' : ''}
              note={stats.weekChange != null ? 'Weekly average' : 'Needs entries in both weeks'}
            />
            <Stat
              label="Overall change"
              value={stats.overallChange != null ? signed(stats.overallChange) : '—'}
              unit={stats.overallChange != null ? 'kg' : ''}
              note={`Since ${formatMedium(entries[0].date)}`}
            />
          </dl>

          {entries.length > 1 && (
            <section className={styles.section}>
              <h2 className="t-heading">Trend</h2>
              <WeightChart data={chartData} />
            </section>
          )}

          <div className={styles.columns}>
            <section className={styles.section}>
              <h2 className="t-heading">Weekly averages</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Week</th>
                    <th scope="col">Average</th>
                    <th scope="col">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w, i) => {
                    const prev = weeks[i + 1]?.avg;
                    return (
                      <tr key={w.start}>
                        <td>{formatWeekRange(w.start)}</td>
                        <td>{w.avg != null ? `${formatNumber(w.avg)} kg` : '—'}</td>
                        <td className="t-muted">{w.avg != null && prev != null ? signed(w.avg - prev) : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section className={styles.section}>
              <h2 className="t-heading">History</h2>
              <ul className={`ruled ${styles.history}`}>
                {[...entries].reverse().map((e) => (
                  <li key={e.id} className={styles.entry}>
                    <span>{formatMedium(e.date)}</span>
                    <span className={`t-numeral ${styles.kg}`}>{formatNumber(e.kg)} kg</span>
                    <span className={styles.entryActions}>
                      <Button variant="ghost" size="sm" icon={<Pencil />} label={`Edit ${formatMedium(e.date)}`} onClick={() => setEditing(e)} />
                      <Button variant="ghost" size="sm" icon={<Trash2 />} label={`Delete ${formatMedium(e.date)}`} onClick={() => del(e)} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title="Edit weigh-in">
        <WeightForm
          initial={editing}
          today={today}
          entries={entries}
          onSave={(e) => {
            upsert(e);
            setEditing(null);
            toast('Weight updated');
          }}
          inSheet
        />
      </Sheet>
    </div>
  );
}

function Stat({ label, value, unit, note }) {
  return (
    <div className={styles.stat}>
      <dt className="t-small t-muted">{label}</dt>
      <dd>
        <span className={`t-numeral ${styles.statValue}`}>{value}</span> {unit && <span className="t-muted">{unit}</span>}
      </dd>
      <dd className="t-caption">{note}</dd>
    </div>
  );
}

function WeightForm({ initial, today, entries, onSave, inSheet = false }) {
  const [date, setDate] = useState(initial?.date ?? today);
  const [kg, setKg] = useState(initial ? String(initial.kg) : '');
  const [error, setError] = useState('');
  const existing = entries.find((e) => e.date === date && e.id !== initial?.id);

  const submit = (ev) => {
    ev.preventDefault();
    const value = Number(kg);
    if (!isValidKey(date)) return setError('Choose a date.');
    if (date > today) return setError('That date is in the future.');
    if (!Number.isFinite(value) || value < 20 || value > 300) return setError('Enter a weight between 20 and 300 kg.');
    onSave({ id: initial?.id ?? existing?.id ?? uid(), date, kg: Math.round(value * 10) / 10 });
    if (!initial) setKg('');
    setError('');
  };

  return (
    <form onSubmit={submit} className={`${styles.form} ${inSheet ? styles.formSheet : ''}`} noValidate>
      <Field label="Date">
        {(p) => <input {...p} type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />}
      </Field>
      <Field label="Weight (kg)" error={error} hint={existing ? `Replaces ${formatNumber(existing.kg)} kg on this date` : undefined}>
        {(p) => (
          <input {...p} type="number" inputMode="decimal" step="0.1" placeholder="e.g. 62.4" value={kg} onChange={(e) => { setKg(e.target.value); setError(''); }} />
        )}
      </Field>
      <Button variant="primary" type="submit" className={styles.submit}>
        {initial ? 'Save' : 'Add weigh-in'}
      </Button>
    </form>
  );
}
