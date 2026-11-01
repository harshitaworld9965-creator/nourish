import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader.jsx';
import { NutritionSummary } from '../../components/NutritionSummary/NutritionSummary.jsx';
import { WaterTracker } from '../../components/WaterTracker/WaterTracker.jsx';
import { MealSection } from '../../components/MealSection/MealSection.jsx';
import { SnackSection } from '../../components/SnackSection/SnackSection.jsx';
import { DayActions } from '../../components/DayActions/DayActions.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToday } from '../../hooks/useToday.js';
import { useDay } from '../../hooks/useDay.js';
import { addDays, formatLong, isValidKey } from '../../utils/dates.js';
import styles from './Diary.module.css';

/** Any day's meals. The date lives in the URL (?date=2026-11-01) so it survives reloads. */
export default function Diary() {
  const today = useToday();
  const [params, setParams] = useSearchParams();
  const raw = params.get('date');
  const date = isValidKey(raw) ? raw : today;
  const go = (key) => setParams(key === today ? {} : { date: key }, { replace: true });

  return (
    <div className={`container ${styles.page}`}>
      <PageHeader title="Food diary" lead="Look back at any day, or plan ahead. Changes apply to that date only." />

      <div className={styles.dateBar}>
        <Button variant="ghost" icon={<ChevronLeft />} label="Previous day" onClick={() => go(addDays(date, -1))} />
        <label className={styles.dateLabel}>
          <span className={styles.dateText}>{date === today ? `Today, ${formatLong(date)}` : formatLong(date)}</span>
          <input
            type="date"
            className={styles.dateInput}
            value={date}
            onChange={(e) => isValidKey(e.target.value) && go(e.target.value)}
            aria-label="Choose a date"
          />
        </label>
        <Button variant="ghost" icon={<ChevronRight />} label="Next day" onClick={() => go(addDays(date, 1))} />
        {date !== today && (
          <Button variant="secondary" size="sm" onClick={() => go(today)}>Today</Button>
        )}
      </div>

      <DiaryDay key={date} date={date} />
    </div>
  );
}

function DiaryDay({ date }) {
  const { day, eaten, planned, actions, targets, water, snacks } = useDay(date);
  return (
    <div className={styles.day}>
      <NutritionSummary eaten={eaten} planned={planned} kcalTarget={targets.kcalTarget} proteinTarget={targets.proteinTarget} />
      <WaterTracker water={water} target={targets.waterTarget} glass={targets.glassSize} onAdd={actions.addWater} />
      <section>
        {day.meals.map((meal) => (
          <MealSection key={meal.id} meal={meal} actions={actions} />
        ))}
        <SnackSection snacks={snacks} actions={actions} />
        <DayActions day={day} actions={actions} />
      </section>
    </div>
  );
}