import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { DailyBars } from '../../components/charts/DailyBars.jsx';
import { WeeklyWeightLine } from '../../components/charts/WeeklyWeightLine.jsx';
import { useStore } from '../../store/NourishProvider.jsx';
import { useFoods } from '../../hooks/useFoods.js';
import { useToday } from '../../hooks/useToday.js';
import { useWeight, weeklyAverages, averageBetween } from '../../hooks/useWeight.js';
import { useWorkouts } from '../../hooks/useWorkouts.js';
import { summarizeDays, nutritionStats, topFoods, kcalOnTarget, proteinOnTarget } from '../../utils/analytics.js';
import { addDays, startOfWeek, weekKeys, formatWeekRange } from '../../utils/dates.js';
import { fmtKcal, fmtProtein, formatNumber } from '../../utils/nutrition.js';
import styles from './Analytics.module.css';

const signed = (n) => (n > 0 ? `+${formatNumber(n)}` : n < 0 ? `−${formatNumber(-n)}` : '0');

export default function Analytics() {
  const today = useToday();
  const { state } = useStore();
  const { foodsById } = useFoods();
  const { entries: weights } = useWeight();
  const { entries: workouts } = useWorkouts();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const keys = useMemo(() => weekKeys(weekStart), [weekStart]);
  const settings = state.settings;

  const days = useMemo(() => {
    return summarizeDays(state.days, keys, foodsById).map((d) => ({
      ...d,
      kcalOk: d.logged && kcalOnTarget(d.kcal, settings.kcalTarget),
      proteinOk: d.logged && proteinOnTarget(d.protein, settings.proteinTarget),
    }));
  }, [state.days, keys, foodsById, settings]);

  const stats = nutritionStats(days, settings);
  const foods = useMemo(() => topFoods(state.days, keys, foodsById), [state.days, keys, foodsById]);
  const weekWorkouts = workouts.filter((w) => w.date >= keys[0] && w.date <= keys[6]);
  const avgDuration = weekWorkouts.length ? weekWorkouts.reduce((a, w) => a + w.duration, 0) / weekWorkouts.length : null;
  const thisAvg = averageBetween(weights, keys[0], keys[6]);
  const prevAvg = averageBetween(weights, addDays(keys[0], -7), addDays(keys[0], -1));
  const weightTrend = useMemo(() => weeklyAverages(weights, 8, keys[6]), [weights, keys]);
  const hasWeightTrend = weightTrend.filter((w) => w.avg != null).length > 1;
  const isCurrent = weekStart === startOfWeek(today);

  return (
    <div className={`container ${styles.page}`}>
      <PageHeader title="Weekly analytics" lead="Trends over the week. One off day changes very little." />

      <div className={styles.weekBar}>
        <Button variant="ghost" icon={<ChevronLeft />} label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))} />
        <p className={styles.weekLabel}>{isCurrent ? 'This week' : formatWeekRange(weekStart)}</p>
        <Button variant="ghost" icon={<ChevronRight />} label="Next week" disabled={isCurrent} onClick={() => setWeekStart(addDays(weekStart, 7))} />
      </div>

      <dl className={styles.stats}>
        <Stat label="Average calories" value={stats.avgKcal != null ? fmtKcal(stats.avgKcal) : '—'} unit="kcal / day" note={`Target ${fmtKcal(settings.kcalTarget)}`} />
        <Stat label="Average protein" value={stats.avgProtein != null ? fmtProtein(stats.avgProtein) : '—'} unit="g / day" note={`Target ${settings.proteinTarget} g`} />
        <Stat label="Days on target" value={stats.loggedDays ? stats.bothDays : '—'} unit={stats.loggedDays ? `of ${stats.loggedDays}` : ''} note={`Calories ${stats.kcalDays}, protein ${stats.proteinDays}`} />
        <Stat label="Weight, weekly average" value={thisAvg != null ? formatNumber(thisAvg) : '—'} unit={thisAvg != null ? 'kg' : ''} note={thisAvg != null && prevAvg != null ? `${signed(thisAvg - prevAvg)} kg vs previous week` : 'No comparison yet'} />
        <Stat label="Workouts" value={weekWorkouts.length} unit={weekWorkouts.length === 1 ? 'session' : 'sessions'} note={(() => { const n = new Set(weekWorkouts.map((w) => w.date)).size; return `${n} active ${n === 1 ? 'day' : 'days'}`; })()} />
        <Stat label="Average workout" value={avgDuration != null ? Math.round(avgDuration) : '—'} unit={avgDuration != null ? 'min' : ''} note="Per session" />
      </dl>

      {stats.loggedDays === 0 ? (
        <EmptyState title="No meals marked as eaten this week">
          Nutrition charts fill in as you mark meals eaten on the Today screen or in the diary.
        </EmptyState>
      ) : (
        <div className={styles.charts}>
          <section className={styles.section}>
            <h2 className="t-heading">Calories</h2>
            <DailyBars data={days.map((d) => ({ ...d, onTarget: d.kcalOk }))} dataKey="kcal" target={settings.kcalTarget} unit="kcal" format={fmtKcal} />
            <p className="t-caption">On target means 85–105% of your calorie goal.</p>
          </section>
          <section className={styles.section}>
            <h2 className="t-heading">Protein</h2>
            <DailyBars data={days.map((d) => ({ ...d, onTarget: d.proteinOk }))} dataKey="protein" target={settings.proteinTarget} unit="g" format={fmtProtein} />
            <p className="t-caption">On target means at least 95% of your protein goal.</p>
          </section>
        </div>
      )}

      <div className={styles.charts}>
        <section className={styles.section}>
          <h2 className="t-heading">Weight, last 8 weeks</h2>
          {hasWeightTrend ? (
            <WeeklyWeightLine data={weightTrend} />
          ) : (
            <p className="t-small t-muted">Weekly averages appear after weigh-ins in at least two different weeks.</p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className="t-heading">Most eaten foods</h2>
          {foods.length ? (
            <ol className={`ruled ${styles.foods}`}>
              {foods.map((f) => (
                <li key={f.id} className={styles.food}>
                  <span>{f.name}</span>
                  <span className="t-small t-muted">{f.count} {f.count === 1 ? 'time' : 'times'}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="t-small t-muted">Appears once meals are marked eaten.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, note }) {
  return (
    <div className={styles.stat}>
      <dt className="t-small t-muted">{label}</dt>
      <dd className={styles.statLine}>
        <span className={`t-numeral ${styles.statValue}`}>{value}</span> <span className="t-small t-muted">{unit}</span>
      </dd>
      <dd className="t-caption">{note}</dd>
    </div>
  );
}
