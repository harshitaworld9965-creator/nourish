import { createInitialState, materializeDay, defaultMeal } from './initialState.js';
import { DEFAULT_TEMPLATE } from '../data/defaultMealPlan.js';
import { SNACKS_ID } from '../utils/nutrition.js';

const stamp = (prev = 0) => Math.max(Date.now(), prev + 1);

/** Apply fn to a day (creating it from the template if needed) and stamp it. */
function editDay(state, date, fn) {
  const day = state.days[date] ?? materializeDay(state);
  const next = fn(day);
  if (next === day) return state;
  return { ...state, days: { ...state.days, [date]: { ...next, updatedAt: stamp(day.updatedAt) } } };
}

/** Change one meal. If fn returns the same meal, nothing is saved. */
function editMeal(state, date, mealId, fn) {
  return editDay(state, date, (day) => {
    let changed = false;
    const meals = day.meals.map((m) => {
      if (m.id !== mealId) return m;
      const next = fn(m);
      if (next !== m) changed = true;
      return next;
    });
    return changed ? { ...day, meals } : day;
  });
}

/** Change the item list of a meal — or of the day's snacks when mealId is 'snacks'. */
function editItems(state, date, mealId, fn) {
  if (mealId === SNACKS_ID) {
    return editDay(state, date, (day) => {
      const items = day.snacks ?? [];
      const next = fn(items);
      return next === items ? day : { ...day, snacks: next };
    });
  }
  return editMeal(state, date, mealId, (meal) => {
    const next = fn(meal.items);
    return next === meal.items ? meal : { ...meal, items: next };
  });
}

const editSlice = (state, key, fn) => {
  const slice = state[key];
  return { ...state, [key]: { ...fn(slice), updatedAt: stamp(slice.updatedAt) } };
};

const upsertById = (list, entry) =>
  list.some((e) => e.id === entry.id) ? list.map((e) => (e.id === entry.id ? entry : e)) : [...list, entry];

export function reducer(state, action) {
  switch (action.type) {
    // ---------- Days ----------
    case 'ENSURE_DAY':
      if (state.days[action.date]) return state;
      return { ...state, days: { ...state.days, [action.date]: materializeDay(state) } };

    case 'INSERT_ITEM':
      return editItems(state, action.date, action.mealId, (items) => {
        // Guard against double taps: an item id can only be added once.
        if (items.some((i) => i.id === action.item.id)) return items;
        const next = [...items];
        const at = action.index ?? next.length;
        next.splice(Math.min(at, next.length), 0, action.item);
        return next;
      });

    case 'UPDATE_ITEM':
      return editItems(state, action.date, action.mealId, (items) =>
        items.map((i) => (i.id === action.itemId ? { ...i, ...action.patch } : i)),
      );

    case 'REMOVE_ITEM':
      return editItems(state, action.date, action.mealId, (items) => items.filter((i) => i.id !== action.itemId));

    case 'SET_MEAL_TIME':
      return editMeal(state, action.date, action.mealId, (meal) => ({ ...meal, time: action.time }));

    case 'TOGGLE_EATEN':
      return editMeal(state, action.date, action.mealId, (meal) => ({ ...meal, eaten: !meal.eaten }));

    case 'SET_ALL_EATEN':
      return editDay(state, action.date, (day) => ({
        ...day,
        meals: day.meals.map((m) => ({ ...m, eaten: action.eaten })),
      }));

    case 'REPLACE_MEAL':
      // "Ate something else": empty the planned foods, mark eaten, flag as changed.
      return editMeal(state, action.date, action.mealId, (meal) => ({
        ...meal,
        items: [],
        eaten: true,
        replaced: true,
      }));

    case 'ADD_WATER':
      return editDay(state, action.date, (day) => {
        const current = day.water ?? 0;
        const next = Math.min(20000, Math.max(0, current + action.ml));
        // Unchanged (e.g. minus at 0) → return the same day so nothing is saved or synced
        return next === current ? day : { ...day, water: next };
      });

    case 'SET_STEPS':
      return editDay(state, action.date, (day) => {
        const next = Math.min(100000, Math.max(0, Math.round(Number(action.steps) || 0)));
        return next === (day.steps ?? 0) ? day : { ...day, steps: next };
      });

    case 'SET_MEAL':
      return editMeal(state, action.date, action.meal.id, () => structuredClone(action.meal));

    case 'RESTORE_MEAL':
      // The original meal has no `replaced` flag, so restoring also clears "Changed from plan"
      return editMeal(state, action.date, action.mealId, (meal) => {
        const original = defaultMeal(action.mealId);
        return original ? { ...original, eaten: meal.eaten } : meal;
      });

    case 'SET_DAY':
      return editDay(state, action.date, () => structuredClone(action.day));

    case 'RESTORE_DAY':
      // Restores meals only; water, steps and snacks for that day are kept
      return editDay(state, action.date, (day) => ({
        ...day,
        templateId: 'default',
        meals: DEFAULT_TEMPLATE.meals.map((m) => {
          const prev = day.meals.find((x) => x.id === m.id);
          return { ...structuredClone(m), eaten: prev?.eaten ?? false };
        }),
      }));

    // ---------- Templates ----------
    case 'SAVE_TEMPLATE': {
      const next = editSlice(state, 'templates', (t) => ({
        ...t,
        items: { ...t.items, [action.template.id]: action.template },
      }));
      return action.activate ? editSlice(next, 'settings', (s) => ({ ...s, activeTemplateId: action.template.id })) : next;
    }

    case 'DELETE_TEMPLATE': {
      const next = editSlice(state, 'templates', (t) => {
        const items = { ...t.items };
        delete items[action.id];
        return { ...t, items };
      });
      return next.settings.activeTemplateId === action.id
        ? editSlice(next, 'settings', (s) => ({ ...s, activeTemplateId: 'default' }))
        : next;
    }

    case 'RESTORE_DEFAULT_PLAN':
      return editSlice(state, 'settings', (s) => ({ ...s, activeTemplateId: 'default', mealTimes: {} }));

    // ---------- Settings ----------
    case 'UPDATE_SETTINGS':
      return editSlice(state, 'settings', (s) => ({ ...s, ...action.patch }));

    // ---------- Foods ----------
    case 'UPSERT_FOOD':
      return editSlice(state, 'foods', (f) =>
        action.isDefault
          ? { ...f, overrides: { ...f.overrides, [action.food.id]: action.food } }
          : { ...f, custom: { ...f.custom, [action.food.id]: action.food } },
      );

    case 'RESET_FOOD':
      return editSlice(state, 'foods', (f) => {
        const overrides = { ...f.overrides };
        delete overrides[action.id];
        return { ...f, overrides };
      });

    case 'DELETE_FOOD':
      return editSlice(state, 'foods', (f) => {
        const custom = { ...f.custom };
        delete custom[action.id];
        return { ...f, custom, favorites: f.favorites.filter((id) => id !== action.id) };
      });

    case 'TOGGLE_FAVORITE':
      return editSlice(state, 'foods', (f) => ({
        ...f,
        favorites: f.favorites.includes(action.id)
          ? f.favorites.filter((id) => id !== action.id)
          : [...f.favorites, action.id],
      }));

    // ---------- Weight & workouts ----------
    case 'WEIGHT_UPSERT':
      return editSlice(state, 'weight', (w) => ({
        ...w,
        // one entry per date: a new entry on an existing date replaces it
        entries: upsertById(
          w.entries.filter((e) => e.date !== action.entry.date || e.id === action.entry.id),
          action.entry,
        ),
      }));

    case 'WEIGHT_DELETE':
      return editSlice(state, 'weight', (w) => ({ ...w, entries: w.entries.filter((e) => e.id !== action.id) }));

    case 'WORKOUT_UPSERT':
      return editSlice(state, 'workouts', (w) => ({ ...w, entries: upsertById(w.entries, action.entry) }));

    case 'WORKOUT_DELETE':
      return editSlice(state, 'workouts', (w) => ({ ...w, entries: w.entries.filter((e) => e.id !== action.id) }));

    // ---------- Whole-state ----------
    case 'HYDRATE':
      return action.state;

    case 'IMPORT': {
      // Stamp everything so an import wins over older copies on other devices.
      const now = Date.now();
      const s = action.state;
      const days = Object.fromEntries(Object.entries(s.days).map(([k, d]) => [k, { ...d, updatedAt: now }]));
      return {
        ...s,
        settings: { ...s.settings, updatedAt: now },
        foods: { ...s.foods, updatedAt: now },
        templates: { ...s.templates, updatedAt: now },
        weight: { ...s.weight, updatedAt: now },
        workouts: { ...s.workouts, updatedAt: now },
        days,
      };
    }

    case 'CLEAR':
      return createInitialState();

    case 'REMOTE_APPLY': {
      const { key, value } = action;
      if (key.startsWith('day:')) return { ...state, days: { ...state.days, [key.slice(4)]: value } };
      if (['settings', 'foods', 'templates', 'weight', 'workouts'].includes(key)) return { ...state, [key]: value };
      return state;
    }

    default:
      console.warn('Unknown action', action.type);
      return state;
  }
}