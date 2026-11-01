import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Download, X, Check } from 'lucide-react';
import { useToday } from '../../hooks/useToday.js';
import { useDay } from '../../hooks/useDay.js';
import { useWeight } from '../../hooks/useWeight.js';
import { useWorkouts, WORKOUT_TYPES, CARDIO_TIMES } from '../../hooks/useWorkouts.js';
import { useInstallPrompt } from '../../hooks/useInstallPrompt.js';
import { useStore } from '../../store/NourishProvider.jsx';
import { NutritionSummary } from '../../components/NutritionSummary/NutritionSummary.jsx';
import { WaterTracker } from '../../components/WaterTracker/WaterTracker.jsx';
import { MealSection } from '../../components/MealSection/MealSection.jsx';
import { SnackSection } from '../../components/SnackSection/SnackSection.jsx';
import { DayActions } from '../../components/DayActions/DayActions.jsx';
import { themeFor, themeVars } from '../../components/MealSection/mealTheme.js';
import { Button } from '../../components/ui/Button.jsx';
import { addDays, formatLong, greeting } from '../../utils/dates.js';
import { summarizeDays, nutritionStats } from '../../utils/analytics.js';
import { fmtKcal, fmtProtein, formatNumber, SNACKS_ID } from '../../utils/nutrition.js';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const today = useToday();
  const { state } = useStore();
  const { day, eaten, planned, foodsById, actions, targets, water, snacks } = useDay(today);
  const name = state.settings.name.trim();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.top}>
        <span className={styles.wordmark}>Nourish</span>
        <Link to="/settings" className={`interactive ${styles.iconLink}`} aria-label="Settings">
          <Settings size={20} strokeWidth={1.6} />
        </Link>
      </header>

      <section className={styles.hero}>
        <p className="t-small t-muted">{formatLong(today)}</p>
        <h1 className="t-display">
          {greeting()}
          {name ? `, ${name}` : ''}.
        </h1>
        <DayStrip meals={day.meals} snackCount={snacks.length} />
      </section>

      <InstallBanner />

      <div className={styles.layout}>
        <div className={styles.main}>
          <NutritionSummary
            eaten={eaten}
            planned={planned}
            kcalTarget={targets.kcalTarget}
            proteinTarget={targets.proteinTarget}
          />

          <WaterTracker
            water={water}
            target={targets.waterTarget}
            glass={targets.glassSize}
            onAdd={actions.addWater}
          />

          <section className={styles.meals} aria-labelledby="meals-title">
            <h2 id="meals-title" className="sr-only">Today’s meals</h2>
            {day.meals.map((meal) => (
              <MealSection key={meal.id} meal={meal} actions={actions} />
            ))}
            <SnackSection snacks={snacks} actions={actions} />
            <DayActions day={day} actions={actions} />
          </section>
        </div>

        <aside className={styles.side} aria-label="This week">
          <WorkoutToday today={today} />
          <WeightNow />
          <WeekAverage today={today} foodsById={foodsById} />
          <nav className={styles.quick} aria-label="Shortcuts">
            <Link to="/diary" className={styles.quickLink}>Food diary</Link>
            <Link to="/analytics" className={styles.quickLink}>Weekly analytics</Link>
            <Link to="/foods" className={styles.quickLink}>Food database</Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}

/** One coloured chip per meal. Fills in when eaten; tap to jump to that meal. */
function DayStrip({ meals, snackCount }) {
  return (
    <nav className={styles.strip} aria-label="Jump to a meal">
      {meals.map((m) => {
        const { icon: Icon } = themeFor(m.id);
        return (
          <a
            key={m.id}
            href={`#meal-${m.id}`}
            className={`${styles.chip} ${m.eaten ? styles.chipDone : ''}`}
            style={themeVars(m.id)}
          >
            <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>{m.name}</span>
            {m.eaten && <Check size={14} strokeWidth={3} aria-label="eaten" />}
          </a>
        );
      })}
      <SnackChip count={snackCount} />
    </nav>
  );
}

function SnackChip({ count }) {
  const { icon: Icon } = themeFor(SNACKS_ID);
  return (
    <a
      href="#meal-snacks"
      className={`${styles.chip} ${count ? styles.chipDone : ''}`}
      style={themeVars(SNACKS_ID)}
    >
      <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
      <span>Snacks</span>
      {count > 0 && <span className={styles.count}>{count}</span>}
    </a>
  );
}

function Panel({ title, to, children }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {to && <Link to={to} className={styles.panelLink}>Open</Link>}
      </div>
      {children}
    </section>
  );
}

function WorkoutToday({ today }) {
  const { planFor, onDate } = useWorkouts();
  const plan = planFor(today);
  const done = onDate(today);
  const planned = [plan.strength && 'Strength', plan.cardio && `${CARDIO_TIMES[plan.cardio]} cardio`].filter(Boolean);

  return (
    <Panel title="Today’s workout" to="/activity">
      <p className={styles.panelValue}>{planned.length ? planned.join(' + ') : 'Recovery day'}</p>
      <p className="t-small t-muted">
        {done.length
          ? `Logged: ${done.map((w) => `${WORKOUT_TYPES[w.type].toLowerCase()} ${w.duration} min`).join(', ')}`
          : planned.length
            ? 'Nothing logged yet'
            : 'Rest, walk, stretch'}
      </p>
    </Panel>
  );
}

function WeightNow() {
  const { stats } = useWeight();
  return (
    <Panel title="Weight" to="/weight">
      {stats.latest ? (
        <>
          <p className={styles.panelValue}>
            <span className="t-numeral">{formatNumber(stats.latest.kg)}</span> kg
          </p>
          <p className="t-small t-muted">
            {stats.sevenDay != null ? `7-day average ${formatNumber(stats.sevenDay)} kg` : 'No entries this week'}
          </p>
        </>
      ) : (
        <p className="t-small t-muted">No weigh-ins yet.</p>
      )}
    </Panel>
  );
}

function WeekAverage({ today, foodsById }) {
  const { state } = useStore();
  const stats = useMemo(() => {
    const keys = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
    return nutritionStats(summarizeDays(state.days, keys, foodsById), state.settings);
  }, [state.days, state.settings, today, foodsById]);

  return (
    <Panel title="Last 7 days" to="/analytics">
      {stats.loggedDays ? (
        <>
          <p className={styles.panelValue}>
            <span className="t-numeral">{fmtKcal(stats.avgKcal)}</span> kcal a day
          </p>
          <p className="t-small t-muted">
            {fmtProtein(stats.avgProtein)} g protein · {stats.loggedDays} {stats.loggedDays === 1 ? 'day' : 'days'} logged
          </p>
        </>
      ) : (
        <p className="t-small t-muted">Mark meals as eaten to see your weekly average.</p>
      )}
    </Panel>
  );
}

function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('nourish:install-dismissed') === '1');
  if (!canInstall || dismissed) return null;
  return (
    <div className={styles.install}>
      <p className="t-small">Install Nourish to open it like an app and use it offline.</p>
      <Button variant="primary" size="sm" icon={<Download />} onClick={install}>Install</Button>
      <Button
        variant="ghost"
        size="sm"
        icon={<X />}
        label="Dismiss"
        onClick={() => {
          sessionStorage.setItem('nourish:install-dismissed', '1');
          setDismissed(true);
        }}
      />
    </div>
  );
}