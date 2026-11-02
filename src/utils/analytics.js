import { dayTotals, dayHasEaten } from './nutrition.js';
import { addDays, startOfWeek, weekKeys } from './dates.js';

/** A day counts as "logged" once a meal is marked eaten or a snack is added. */
export function summarizeDays(days, keys, foodsById) {
  return keys.map((date) => {
    const day = days[date];
    const logged = dayHasEaten(day);
    const t = logged ? dayTotals(day, foodsById, { eatenOnly: true }) : { kcal: 0, protein: 0 };
    return { date, logged, kcal: t.kcal, protein: t.protein };
  });
}

/** Calories count as on target between 85% and 105% of the goal; protein at 95% or more. */
export const kcalOnTarget = (kcal, target) => kcal >= target * 0.85 && kcal <= target * 1.05;
export const proteinOnTarget = (protein, target) => protein >= target * 0.95;

export function nutritionStats(summaries, settings) {
  const logged = summaries.filter((d) => d.logged);
  const n = logged.length;
  return {
    loggedDays: n,
    avgKcal: n ? logged.reduce((a, d) => a + d.kcal, 0) / n : null,
    avgProtein: n ? logged.reduce((a, d) => a + d.protein, 0) / n : null,
    kcalDays: logged.filter((d) => kcalOnTarget(d.kcal, settings.kcalTarget)).length,
    proteinDays: logged.filter((d) => proteinOnTarget(d.protein, settings.proteinTarget)).length,
    bothDays: logged.filter(
      (d) => kcalOnTarget(d.kcal, settings.kcalTarget) && proteinOnTarget(d.protein, settings.proteinTarget),
    ).length,
  };
}

/** Foods that appear most often in eaten meals and snacks over the given dates. */
export function topFoods(days, keys, foodsById, limit = 5) {
  const counts = new Map();
  const count = (item) => counts.set(item.foodId, (counts.get(item.foodId) ?? 0) + 1);
  for (const date of keys) {
    const day = days[date];
    for (const meal of day?.meals ?? []) {
      if (meal.eaten) meal.items.forEach(count);
    }
    (day?.snacks ?? []).forEach(count);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({ id, name: foodsById[id]?.name ?? 'Deleted food', count }));
}

// ---------- Steps ----------

/** Steps per date. A day with 0 steps counts as not logged, so it doesn't drag averages down. */
export function stepSummaries(days, keys, goal) {
  return keys.map((date) => {
    const steps = days[date]?.steps ?? 0;
    return { date, steps, logged: steps > 0, onTarget: steps >= goal };
  });
}

export function stepStats(summaries) {
  const logged = summaries.filter((d) => d.logged);
  const n = logged.length;
  const total = logged.reduce((a, d) => a + d.steps, 0);
  const best = logged.reduce((b, d) => (!b || d.steps > b.steps ? d : b), null);
  return {
    loggedDays: n,
    total,
    avg: n ? total / n : null,
    goalDays: logged.filter((d) => d.onTarget).length,
    best,
  };
}

/** Average steps per logged day for each of the last `weeks` weeks, oldest first. */
export function weeklyStepAverages(days, weeks, endKey, goal) {
  const lastWeek = startOfWeek(endKey);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(lastWeek, -7 * (weeks - 1 - i));
    const s = stepStats(stepSummaries(days, weekKeys(start), goal));
    return { date: start, steps: s.avg ?? 0, logged: s.loggedDays > 0, onTarget: s.avg != null && s.avg >= goal };
  });
}