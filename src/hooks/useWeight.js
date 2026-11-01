import { useMemo } from 'react';
import { useStore } from '../store/NourishProvider.jsx';
import { addDays, startOfWeek, todayKey } from '../utils/dates.js';

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Mean of entries whose date is within [from, to] inclusive. */
export function averageBetween(entries, from, to) {
  return avg(entries.filter((e) => e.date >= from && e.date <= to).map((e) => e.kg));
}

export function weeklyAverages(entries, weeks, endKey = todayKey()) {
  const thisWeek = startOfWeek(endKey);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, -7 * (weeks - 1 - i));
    return { start, avg: averageBetween(entries, start, addDays(start, 6)) };
  });
}

/** For each entry, the mean of entries in the 7 days ending on it. */
export function withRollingAverage(sorted) {
  return sorted.map((e) => ({ ...e, rolling: averageBetween(sorted, addDays(e.date, -6), e.date) }));
}

export function useWeight() {
  const { state, dispatch } = useStore();
  const entries = useMemo(
    () => [...state.weight.entries].sort((a, b) => a.date.localeCompare(b.date)),
    [state.weight.entries],
  );

  const stats = useMemo(() => {
    const today = todayKey();
    const week = startOfWeek(today);
    const latest = entries.at(-1) ?? null;
    const first = entries[0] ?? null;
    const sevenDay = averageBetween(entries, addDays(today, -6), today);
    const thisWeek = averageBetween(entries, week, addDays(week, 6));
    const lastWeek = averageBetween(entries, addDays(week, -7), addDays(week, -1));
    // Overall change compares 7-day averages at both ends so one heavy day doesn't skew it
    const startAvg = first ? averageBetween(entries, first.date, addDays(first.date, 6)) : null;
    const endAvg = latest ? averageBetween(entries, addDays(latest.date, -6), latest.date) : null;
    return {
      latest,
      sevenDay,
      thisWeek,
      lastWeek,
      weekChange: thisWeek != null && lastWeek != null ? thisWeek - lastWeek : null,
      overallChange: entries.length > 1 && startAvg != null && endAvg != null ? endAvg - startAvg : null,
    };
  }, [entries]);

  return {
    entries,
    stats,
    upsert: (entry) => dispatch({ type: 'WEIGHT_UPSERT', entry }),
    remove: (id) => dispatch({ type: 'WEIGHT_DELETE', id }),
  };
}
