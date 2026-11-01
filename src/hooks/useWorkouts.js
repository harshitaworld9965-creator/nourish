import { useMemo } from 'react';
import { useStore } from '../store/NourishProvider.jsx';
import { weekdayIndex } from '../utils/dates.js';

export const WORKOUT_TYPES = { strength: 'Strength', cardio: 'Cardio' };
export const CARDIO_TIMES = { morning: 'Morning', evening: 'Evening' };

export function useWorkouts() {
  const { state, dispatch } = useStore();
  const entries = useMemo(
    () => [...state.workouts.entries].sort((a, b) => b.date.localeCompare(a.date)),
    [state.workouts.entries],
  );
  const routine = state.settings.routine;

  return {
    entries,
    routine,
    durations: state.settings.durations,
    planFor: (dateKey) => routine[weekdayIndex(dateKey)],
    onDate: (dateKey) => entries.filter((e) => e.date === dateKey),
    upsert: (entry) => dispatch({ type: 'WORKOUT_UPSERT', entry }),
    remove: (id) => dispatch({ type: 'WORKOUT_DELETE', id }),
    setRoutine: (next) => dispatch({ type: 'UPDATE_SETTINGS', patch: { routine: next } }),
  };
}
