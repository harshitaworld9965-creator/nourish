import { useCallback, useMemo } from 'react';
import { useStore } from '../store/NourishProvider.jsx';
import { DEFAULT_FOODS, DEFAULT_FOOD_IDS } from '../data/foodDatabase.js';

/** Built-in foods merged with your edits, plus your custom foods. */
export function useFoods() {
  const { state, dispatch } = useStore();
  const { overrides, custom, favorites } = state.foods;

  const foods = useMemo(() => {
    const merged = DEFAULT_FOODS.map((f) => (overrides[f.id] ? { ...f, ...overrides[f.id], id: f.id } : f));
    return [...merged, ...Object.values(custom)].sort((a, b) => a.name.localeCompare(b.name));
  }, [overrides, custom]);

  const foodsById = useMemo(() => Object.fromEntries(foods.map((f) => [f.id, f])), [foods]);

  const saveFood = useCallback(
    (food) => dispatch({ type: 'UPSERT_FOOD', food, isDefault: DEFAULT_FOOD_IDS.has(food.id) }),
    [dispatch],
  );

  return {
    foods,
    foodsById,
    favorites,
    isDefault: (id) => DEFAULT_FOOD_IDS.has(id),
    isEdited: (id) => Boolean(overrides[id]),
    saveFood,
    resetFood: (id) => dispatch({ type: 'RESET_FOOD', id }),
    deleteFood: (id) => dispatch({ type: 'DELETE_FOOD', id }),
    toggleFavorite: (id) => dispatch({ type: 'TOGGLE_FAVORITE', id }),
  };
}
