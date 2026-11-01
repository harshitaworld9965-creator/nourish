import { useEffect, useMemo } from 'react';
import { useStore } from '../store/NourishProvider.jsx';
import { materializeDay } from '../store/initialState.js';
import { useFoods } from './useFoods.js';
import { dayTotals } from '../utils/nutrition.js';
import { DEFAULT_WATER_TARGET, DEFAULT_GLASS_SIZE } from '../data/defaultSettings.js';

/**
 * One day's meals and water. If the date has never been opened, it is created
 * from the active template (once — later template changes don't rewrite it).
 */
export function useDay(date) {
  const { state, dispatch } = useStore();
  const { foodsById } = useFoods();
  const stored = state.days[date];

  useEffect(() => {
    if (!stored) dispatch({ type: 'ENSURE_DAY', date });
  }, [stored, date, dispatch]);

  // Render the template immediately on first paint rather than flashing empty
  const day = useMemo(() => stored ?? materializeDay(state), [stored, state]);

  const eaten = useMemo(() => dayTotals(day, foodsById, { eatenOnly: true }), [day, foodsById]);
  const planned = useMemo(() => dayTotals(day, foodsById), [day, foodsById]);

  // Older saved settings won't have the water fields yet
  const targets = useMemo(
    () => ({
      ...state.settings,
      waterTarget: state.settings.waterTarget ?? DEFAULT_WATER_TARGET,
      glassSize: state.settings.glassSize ?? DEFAULT_GLASS_SIZE,
    }),
    [state.settings],
  );

  const actions = useMemo(
    () => ({
      insertItem: (mealId, item, index) => dispatch({ type: 'INSERT_ITEM', date, mealId, item, index }),
      updateItem: (mealId, itemId, patch) => dispatch({ type: 'UPDATE_ITEM', date, mealId, itemId, patch }),
      removeItem: (mealId, itemId) => dispatch({ type: 'REMOVE_ITEM', date, mealId, itemId }),
      setMealTime: (mealId, time) => dispatch({ type: 'SET_MEAL_TIME', date, mealId, time }),
      toggleEaten: (mealId) => dispatch({ type: 'TOGGLE_EATEN', date, mealId }),
      setAllEaten: (value) => dispatch({ type: 'SET_ALL_EATEN', date, eaten: value }),
      setMeal: (meal) => dispatch({ type: 'SET_MEAL', date, meal }),
      restoreMeal: (mealId) => dispatch({ type: 'RESTORE_MEAL', date, mealId }),
      setDay: (d) => dispatch({ type: 'SET_DAY', date, day: d }),
      restoreDay: () => dispatch({ type: 'RESTORE_DAY', date }),
      addWater: (ml) => dispatch({ type: 'ADD_WATER', date, ml }),
    }),
    [date, dispatch],
  );

  return { day, eaten, planned, foodsById, actions, targets, water: day.water ?? 0 };
}