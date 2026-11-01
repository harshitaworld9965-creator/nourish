import { DEFAULT_SETTINGS } from '../data/defaultSettings.js';
import { DEFAULT_TEMPLATE } from '../data/defaultMealPlan.js';
import { SCHEMA_VERSION } from '../utils/storage.js';

/**
 * Every slice carries `updatedAt`. It is 0 until you change something,
 * and it's what device sync compares (last edit wins, per slice / per day).
 */
export function createInitialState() {
  return {
    version: SCHEMA_VERSION,
    settings: structuredClone(DEFAULT_SETTINGS),
    foods: { overrides: {}, custom: {}, favorites: [], updatedAt: 0 },
    templates: { items: {}, updatedAt: 0 },
    weight: { entries: [], updatedAt: 0 },
    workouts: { entries: [], updatedAt: 0 },
    days: {},
  };
}

export function getTemplate(state, id) {
  if (!id || id === 'default') return DEFAULT_TEMPLATE;
  return state.templates.items[id] ?? DEFAULT_TEMPLATE;
}

/** Build a fresh day from the active template. Not an edit, so updatedAt = 0. */
export function materializeDay(state) {
  const tpl = getTemplate(state, state.settings.activeTemplateId);
  const times = state.settings.mealTimes ?? {};
  return {
    templateId: tpl.id,
    meals: tpl.meals.map((m) => ({
      ...structuredClone(m),
      time: times[m.id] ?? m.time,
      eaten: false,
    })),
    updatedAt: 0,
  };
}

export function defaultMeal(mealId) {
  const m = DEFAULT_TEMPLATE.meals.find((x) => x.id === mealId);
  return m ? structuredClone(m) : null;
}
