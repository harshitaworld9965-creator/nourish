import { Sunrise, Sun, Moon, Cookie, Utensils } from 'lucide-react';

/** Colour + icon per meal. Colours come from tokens.css (--c-breakfast etc.). */
const THEMES = {
  breakfast: { key: 'breakfast', icon: Sunrise },
  lunch: { key: 'lunch', icon: Sun },
  dinner: { key: 'dinner', icon: Moon },
  snacks: { key: 'snacks', icon: Cookie },
};

const FALLBACK = { key: 'lunch', icon: Utensils };

export const themeFor = (mealId) => THEMES[mealId] ?? FALLBACK;

/** CSS variables to put on an element so its styles can use var(--meal) etc. */
export function themeVars(mealId) {
  const { key } = themeFor(mealId);
  return {
    '--meal': `var(--c-${key})`,
    '--meal-soft': `var(--c-${key}-soft)`,
    '--meal-ink': `var(--c-${key}-ink)`,
  };
}