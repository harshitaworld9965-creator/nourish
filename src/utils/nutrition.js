/**
 * Pure nutrition maths. No React, no storage — easy to reason about and test.
 */

export function getUnits(food) {
  if (!food) return [];
  const units = [{ id: 'base', label: food.perUnit, size: 1 }];
  if (food.serving?.size > 0) units.push({ id: 'serving', label: food.serving.label, size: food.serving.size });
  return units;
}

export function unitSize(food, unit) {
  if (unit === 'serving' && food?.serving?.size > 0) return food.serving.size;
  return 1;
}

/** Amount of the food in its base unit (g / ml / …). */
export const baseAmount = (item, food) => (Number(item.qty) || 0) * unitSize(food, item.unit);

export function itemNutrition(item, food) {
  if (!food || !(food.per > 0)) return { kcal: 0, protein: 0, missing: !food };
  const factor = baseAmount(item, food) / food.per;
  return { kcal: factor * food.kcal, protein: factor * food.protein };
}

export function mealTotals(meal, foodsById) {
  return meal.items.reduce(
    (acc, item) => {
      const n = itemNutrition(item, foodsById[item.foodId]);
      acc.kcal += n.kcal;
      acc.protein += n.protein;
      return acc;
    },
    { kcal: 0, protein: 0 },
  );
}

export function dayTotals(day, foodsById, { eatenOnly = false } = {}) {
  const totals = { kcal: 0, protein: 0 };
  if (!day) return totals;
  for (const meal of day.meals) {
    if (eatenOnly && !meal.eaten) continue;
    const t = mealTotals(meal, foodsById);
    totals.kcal += t.kcal;
    totals.protein += t.protein;
  }
  return totals;
}

export const dayHasEaten = (day) => Boolean(day?.meals?.some((m) => m.eaten));

/** A sensible starting portion when a food is first added. */
export function defaultPortion(food) {
  if (food.serving?.size > 0) return { qty: 1, unit: 'serving' };
  if (food.perUnit === 'g' || food.perUnit === 'ml') return { qty: 100, unit: 'base' };
  return { qty: 1, unit: 'base' };
}

const plural = (label, qty) => (Number(qty) === 1 || /s$/.test(label) ? label : `${label}s`);

export function formatQty(item, food) {
  const qty = formatNumber(Number(item.qty) || 0);
  if (!food) return qty;
  if (item.unit === 'serving' && food.serving) return `${qty} ${plural(food.serving.label, item.qty)}`;
  if (food.perUnit === 'g' || food.perUnit === 'ml') return `${qty} ${food.perUnit}`;
  return `${qty} ${plural(food.perUnit, item.qty)}`;
}

export function formatNumber(n, maxDecimals = 1) {
  return Number(n.toFixed(maxDecimals)).toLocaleString('en-IN');
}

export const fmtKcal = (n) => Math.round(n).toLocaleString('en-IN');

/** One decimal below 10 g, whole grams above — precise where it matters. */
export const fmtProtein = (n) => (n < 10 ? formatNumber(n, 1) : Math.round(n).toLocaleString('en-IN'));

export const STATE_LABELS = {
  raw: 'Raw',
  dry: 'Dry weight',
  cooked: 'Cooked weight',
  asSold: 'As sold',
};

/** "per 100 g" / "per scoop (30 g)" */
export function describeBasis(food) {
  return `per ${formatNumber(food.per)} ${food.perUnit}`;
}
