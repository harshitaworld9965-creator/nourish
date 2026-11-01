/** Weekly routine, index 0 = Monday. cardio: 'morning' | 'evening' | null */
export const DEFAULT_ROUTINE = [
  { strength: true, cardio: 'morning' },
  { strength: true, cardio: 'evening' },
  { strength: true, cardio: 'morning' },
  { strength: true, cardio: 'evening' },
  { strength: true, cardio: 'morning' },
  { strength: true, cardio: 'evening' },
  { strength: false, cardio: null }, // recovery day
];

export const DEFAULT_WATER_TARGET = 4000; // ml per day
export const DEFAULT_GLASS_SIZE = 250; // ml added per tap

export const DEFAULT_SETTINGS = {
  name: '',
  kcalTarget: 1500,
  proteinTarget: 100,
  waterTarget: DEFAULT_WATER_TARGET,
  glassSize: DEFAULT_GLASS_SIZE,
  activeTemplateId: 'default',
  mealTimes: {}, // { breakfast: '08:30' } overrides template times for new days
  routine: DEFAULT_ROUTINE,
  durations: { strength: 60, cardio: 30 },
  updatedAt: 0,
};