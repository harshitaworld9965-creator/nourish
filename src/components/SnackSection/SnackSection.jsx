import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ItemEditor } from '../ItemEditor/ItemEditor.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useFoods } from '../../hooks/useFoods.js';
import { SNACKS_ID, itemNutrition, itemsTotals, formatQty, fmtKcal, fmtProtein } from '../../utils/nutrition.js';
import { themeFor, themeVars } from '../MealSection/mealTheme.js';
import styles from '../MealSection/MealSection.module.css';

/**
 * Food eaten outside the three meals. Empty every day, never part of the plan,
 * and counted as soon as it's added.
 */
export function SnackSection({ snacks, actions }) {
  const { foods, foodsById, favorites } = useFoods();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // item | 'new' | null
  const totals = itemsTotals(snacks, foodsById);
  const { icon: Icon } = themeFor(SNACKS_ID);

  const removeItem = (item) => {
    const index = snacks.findIndex((i) => i.id === item.id);
    actions.removeItem(SNACKS_ID, item.id);
    toast(`Removed ${foodsById[item.foodId]?.name ?? 'food'}`, {
      label: 'Undo',
      onClick: () => actions.insertItem(SNACKS_ID, item, index),
    });
  };

  return (
    <article
      id="meal-snacks"
      className={`${styles.meal} ${snacks.length ? styles.isEaten : ''}`}
      style={themeVars(SNACKS_ID)}
      aria-labelledby="snacks-title"
    >
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden="true">
          <Icon size={20} strokeWidth={2} />
        </span>
        <div className={styles.toggle}>
          <span className={styles.time}>Any time</span>
          <h3 id="snacks-title" className={styles.name}>Snacks &amp; extras</h3>
          <span className={`t-small ${styles.totals}`}>
            {snacks.length
              ? `${fmtKcal(totals.kcal)} kcal · ${fmtProtein(totals.protein)} g protein`
              : 'Nothing added'}
          </span>
        </div>
      </header>

      {snacks.length === 0 && (
        <p className={`t-small ${styles.note}`}>Anything you eat between meals. It counts as soon as you add it.</p>
      )}

      {snacks.length > 0 && (
        <ul className={`ruled ${styles.items}`}>
          {snacks.map((item) => {
            const food = foodsById[item.foodId];
            const n = itemNutrition(item, food);
            return (
              <li key={item.id}>
                <button type="button" className={`interactive ${styles.item}`} onClick={() => setEditing(item)}>
                  <span className={styles.itemMain}>
                    <span className={food ? undefined : styles.missing}>{food?.name ?? 'Deleted food'}</span>
                    <span className={`t-small ${styles.qty}`}>{formatQty(item, food)}</span>
                  </span>
                  <span className={styles.itemNums}>
                    <span className="t-numeral">{fmtKcal(n.kcal)}</span>
                    <span className={`t-small ${styles.qty}`}>{fmtProtein(n.protein)} g</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.footer}>
        <button type="button" className={`interactive ${styles.addBtn}`} onClick={() => setEditing('new')}>
          <Plus size={16} strokeWidth={2.4} />
          Add snack
        </button>
      </div>

      <ItemEditor
        open={editing !== null}
        onClose={() => setEditing(null)}
        item={editing === 'new' ? null : editing}
        mealName="Snacks"
        foods={foods}
        foodsById={foodsById}
        favorites={favorites}
        onSave={(item) =>
          editing === 'new'
            ? actions.insertItem(SNACKS_ID, item)
            : actions.updateItem(SNACKS_ID, item.id, item)
        }
        onRemove={() => editing && editing !== 'new' && removeItem(editing)}
      />
    </article>
  );
}