import { dayTotals, dayHasEaten } from './nutrition.js';

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