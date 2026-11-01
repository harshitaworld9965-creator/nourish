/**
 * The original meal plan. Hardcoded and never written to.
 *
 * Each day is created as a copy of the *active* template (this one unless
 * you choose a saved one). Editing a day only changes that day's copy.
 *
 * Item units: 'base' means the food's own unit (g / ml), 'serving' means the
 * food's named serving (egg, scoop, medium banana…).
 * `alternatives` power the one-tap swap in the editor (banana ↔ apple).
 */
export const DEFAULT_TEMPLATE = Object.freeze({
  id: 'default',
  name: 'Original plan',
  locked: true,
  meals: [
    {
      id: 'breakfast',
      name: 'Breakfast',
      time: '08:00',
      items: [
        { id: 'b1', foodId: 'muesli', qty: 50, unit: 'base' },
        { id: 'b2', foodId: 'whole-milk', qty: 200, unit: 'base' },
        {
          id: 'b3', foodId: 'banana', qty: 1, unit: 'serving',
          alternatives: [{ foodId: 'apple', qty: 1, unit: 'serving' }],
        },
        { id: 'b4', foodId: 'almonds', qty: 6, unit: 'serving' },
      ],
    },
    {
      id: 'lunch',
      name: 'Lunch',
      time: '13:00',
      items: [
        { id: 'l1', foodId: 'chickpeas-boiled', qty: 100, unit: 'base' },
        { id: 'l2', foodId: 'soya-chunks-dry', qty: 40, unit: 'base', note: 'Dry weight, before boiling' },
        { id: 'l3', foodId: 'homemade-curd', qty: 100, unit: 'base' },
        { id: 'l4', foodId: 'cucumber', qty: 100, unit: 'base' },
        { id: 'l5', foodId: 'tomato', qty: 80, unit: 'base' },
        { id: 'l6', foodId: 'onion', qty: 40, unit: 'base' },
        { id: 'l7', foodId: 'lemon-spices', qty: 1, unit: 'base' },
      ],
    },
    {
      id: 'dinner',
      name: 'Dinner',
      time: '19:30',
      items: [
        { id: 'd1', foodId: 'boiled-egg', qty: 2, unit: 'serving' },
        { id: 'd2', foodId: 'oats', qty: 40, unit: 'base' },
        { id: 'd3', foodId: 'whey-protein', qty: 1, unit: 'serving' },
        {
          id: 'd4', foodId: 'whole-milk', qty: 200, unit: 'base',
          alternatives: [{ foodId: 'oat-milk', qty: 200, unit: 'base' }],
        },
        { id: 'd5', foodId: 'mixed-vegetables', qty: 1, unit: 'serving' },
      ],
    },
  ],
});
