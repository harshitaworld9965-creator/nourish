/**
 * Built-in food database.
 *
 * Every value here is an ESTIMATE taken from standard food-composition
 * tables (IFCT 2017 / USDA). Brands differ, so each food is marked
 * `source: 'estimate'` and the app tells you so. Editing a food in the
 * Foods page stores an override — this file is never modified at runtime.
 *
 * Shape
 *   per, perUnit   nutrition is given for `per` of `perUnit` (e.g. 100 g)
 *   kcal, protein  values for that amount
 *   state          'raw' | 'dry' | 'cooked' | 'asSold' — which weight to log
 *   serving        optional extra unit: { label, size } where size is in perUnit
 */

const food = (id, name, category, fields) => ({
  id,
  name,
  category,
  state: 'raw',
  serving: null,
  source: 'estimate',
  note: '',
  ...fields,
});

export const DEFAULT_FOODS = [
  // Breakfast staples
  food('muesli', 'Muesli', 'Grains', {
    per: 100, perUnit: 'g', kcal: 370, protein: 10, state: 'asSold',
    note: 'Varies a lot by brand. Check your pack.',
  }),
  food('whole-milk', 'Whole milk', 'Dairy', {
    per: 100, perUnit: 'ml', kcal: 62, protein: 3.2, state: 'asSold',
    serving: { label: 'glass', size: 200 },
  }),
  food('toned-milk', 'Toned milk', 'Dairy', {
    per: 100, perUnit: 'ml', kcal: 58, protein: 3.1, state: 'asSold',
    serving: { label: 'glass', size: 200 },
  }),
  food('oat-milk', 'Oat milk, unsweetened', 'Dairy alternatives', {
    per: 100, perUnit: 'ml', kcal: 45, protein: 1, state: 'asSold',
    serving: { label: 'glass', size: 200 },
    note: 'Protein ranges from 0.3 g to 1 g per 100 ml between brands.',
  }),
  food('banana', 'Banana', 'Fruit', {
    per: 100, perUnit: 'g', kcal: 89, protein: 1.1,
    serving: { label: 'medium banana', size: 118 },
  }),
  food('apple', 'Apple', 'Fruit', {
    per: 100, perUnit: 'g', kcal: 52, protein: 0.3,
    serving: { label: 'medium apple', size: 182 },
  }),
  food('almonds', 'Almonds', 'Nuts', {
    per: 100, perUnit: 'g', kcal: 579, protein: 21.2,
    serving: { label: 'almond', size: 1.2 },
  }),

  // Protein
  food('boiled-egg', 'Boiled egg', 'Eggs', {
    per: 100, perUnit: 'g', kcal: 155, protein: 12.6, state: 'cooked',
    serving: { label: 'egg', size: 50 },
  }),
  food('whey-protein', 'Whey protein', 'Supplements', {
    per: 100, perUnit: 'g', kcal: 400, protein: 80, state: 'asSold',
    serving: { label: 'scoop', size: 30 },
    note: 'Enter your tub’s label. Scoop size and protein per scoop vary.',
  }),
  food('soya-chunks-dry', 'Soya chunks', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 345, protein: 52, state: 'dry',
    note: 'Weigh before soaking or boiling.',
  }),
  food('chickpeas-boiled', 'Chickpeas, boiled', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 164, protein: 8.9, state: 'cooked',
  }),
  food('chickpeas-dry', 'Chickpeas, dry', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 364, protein: 19.3, state: 'dry',
    note: 'About 100 g dry becomes 230 g boiled.',
  }),
  food('moong-dal-dry', 'Moong dal, dry', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 347, protein: 24, state: 'dry',
  }),
  food('moong-dal-cooked', 'Moong dal, cooked', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 105, protein: 7, state: 'cooked',
    serving: { label: 'katori', size: 150 },
    note: 'Depends on how thick the dal is.',
  }),
  food('rajma-dry', 'Rajma, dry', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 333, protein: 24, state: 'dry',
  }),
  food('rajma-boiled', 'Rajma, boiled', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 127, protein: 8.7, state: 'cooked',
  }),
  food('roasted-chana', 'Roasted chana', 'Legumes', {
    per: 100, perUnit: 'g', kcal: 369, protein: 20, state: 'asSold',
  }),
  food('homemade-curd', 'Homemade curd', 'Dairy', {
    per: 100, perUnit: 'g', kcal: 60, protein: 3.1,
    serving: { label: 'katori', size: 150 },
    note: 'Whole-milk curd. Toned-milk curd is a little lower.',
  }),
  food('greek-yogurt', 'Greek yogurt, plain', 'Dairy', {
    per: 100, perUnit: 'g', kcal: 73, protein: 10, state: 'asSold',
    note: 'Low-fat plain. Full-fat is closer to 97 kcal.',
  }),
  food('paneer', 'Paneer', 'Dairy', {
    per: 100, perUnit: 'g', kcal: 265, protein: 18.3, state: 'asSold',
  }),

  // Grains
  food('oats', 'Oats, rolled', 'Grains', {
    per: 100, perUnit: 'g', kcal: 379, protein: 13.2, state: 'dry',
  }),
  food('roti', 'Roti, whole wheat', 'Grains', {
    per: 100, perUnit: 'g', kcal: 260, protein: 9, state: 'cooked',
    serving: { label: 'roti', size: 40 },
  }),
  food('rice-cooked', 'Rice, cooked', 'Grains', {
    per: 100, perUnit: 'g', kcal: 130, protein: 2.7, state: 'cooked',
    serving: { label: 'katori', size: 150 },
  }),

  // Vegetables
  food('mixed-vegetables', 'Mixed vegetables', 'Vegetables', {
    per: 100, perUnit: 'g', kcal: 65, protein: 2.6, state: 'cooked',
    serving: { label: 'serving', size: 100 },
    note: 'Lightly cooked with little oil.',
  }),
  food('cucumber', 'Cucumber', 'Vegetables', { per: 100, perUnit: 'g', kcal: 15, protein: 0.7 }),
  food('tomato', 'Tomato', 'Vegetables', { per: 100, perUnit: 'g', kcal: 18, protein: 0.9 }),
  food('onion', 'Onion', 'Vegetables', { per: 100, perUnit: 'g', kcal: 40, protein: 1.1 }),
  food('lemon-spices', 'Lemon and spices', 'Seasoning', {
    per: 1, perUnit: 'serving', kcal: 5, protein: 0.2, state: 'asSold',
  }),
];

export const DEFAULT_FOOD_IDS = new Set(DEFAULT_FOODS.map((f) => f.id));
