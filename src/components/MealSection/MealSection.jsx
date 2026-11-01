import { useId, useState } from 'react';
import { Check, ChevronDown, Plus, RotateCcw, Shuffle } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { ItemEditor } from '../ItemEditor/ItemEditor.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useFoods } from '../../hooks/useFoods.js';
import { formatTime } from '../../utils/dates.js';
import { itemNutrition, mealTotals, formatQty, fmtKcal, fmtProtein } from '../../utils/nutrition.js';
import { themeFor, themeVars } from './mealTheme.js';
import styles from './MealSection.module.css';

export function MealSection({ meal, actions }) {
  const { foods, foodsById, favorites } = useFoods();
  const toast = useToast();
  const [expanded, setExpanded] = useState(!meal.eaten);
  const [editing, setEditing] = useState(null); // item | 'new' | null
  const listId = useId();
  const totals = mealTotals(meal, foodsById);
  const { icon: Icon } = themeFor(meal.id);

  const removeItem = (item) => {
    const index = meal.items.findIndex((i) => i.id === item.id);
    actions.removeItem(meal.id, item.id);
    toast(`Removed ${foodsById[item.foodId]?.name ?? 'food'}`, {
      label: 'Undo',
      onClick: () => actions.insertItem(meal.id, item, index),
    });
  };

  const restore = () => {
    const before = structuredClone(meal);
    actions.restoreMeal(meal.id);
    toast(`${meal.name} restored to the original plan`, { label: 'Undo', onClick: () => actions.setMeal(before) });
  };

  // Clear the planned foods for this day only, then open the food search
  const replace = () => {
    const before = structuredClone(meal);
    actions.replaceMeal(meal.id);
    setExpanded(true);
    setEditing('new');
    toast(`${meal.name} cleared — add what you ate`, { label: 'Undo', onClick: () => actions.setMeal(before) });
  };

  return (
    <article
      id={`meal-${meal.id}`}
      className={`${styles.meal} ${meal.eaten ? styles.isEaten : ''}`}
      style={themeVars(meal.id)}
    >
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden="true">
          <Icon size={20} strokeWidth={2} />
        </span>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={styles.time}>
            {formatTime(meal.time)}
            {meal.replaced && <span className={styles.changed}> · Changed from plan</span>}
          </span>
          <span className={styles.titleRow}>
            <h3 className={styles.name}>{meal.name}</h3>
            <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
          </span>
          <span className={`t-small ${styles.totals}`}>
            {fmtKcal(totals.kcal)} kcal · {fmtProtein(totals.protein)} g protein
          </span>
        </button>

        <button
          type="button"
          className={`interactive ${styles.eaten}`}
          aria-pressed={meal.eaten}
          onClick={() => actions.toggleEaten(meal.id)}
        >
          <span className={styles.check}>{meal.eaten && <Check size={14} strokeWidth={3} />}</span>
          <span className={styles.eatenLabel}>{meal.eaten ? 'Eaten' : 'Mark eaten'}</span>
        </button>
      </header>

      {!expanded && meal.items.length > 0 && (
        <p className={`t-small ${styles.preview}`}>
          {meal.items.map((i) => foodsById[i.foodId]?.name ?? 'Unknown food').join(', ')}
        </p>
      )}

      <div id={listId} hidden={!expanded}>
        {meal.items.length === 0 ? (
          <p className={`t-small ${styles.emptyMeal}`}>
            {meal.replaced ? 'Add what you ate instead.' : 'No foods in this meal.'}
          </p>
        ) : (
          <ul className={`ruled ${styles.items}`}>
            {meal.items.map((item) => {
              const food = foodsById[item.foodId];
              const n = itemNutrition(item, food);
              return (
                <li key={item.id}>
                  <button type="button" className={`interactive ${styles.item}`} onClick={() => setEditing(item)}>
                    <span className={styles.itemMain}>
                      <span className={food ? undefined : styles.missing}>{food?.name ?? 'Deleted food'}</span>
                      <span className={`t-small ${styles.qty}`}>
                        {formatQty(item, food)}
                        {food?.state === 'dry' ? ' dry' : ''}
                      </span>
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
            Add food
          </button>
          {!meal.replaced && (
            <Button variant="ghost" size="sm" icon={<Shuffle />} onClick={replace}>
              Ate something else
            </Button>
          )}
          <label className={styles.timeField}>
            <span className="t-small">Time</span>
            <input
              type="time"
              value={meal.time}
              onChange={(e) => e.target.value && actions.setMealTime(meal.id, e.target.value)}
              className={styles.timeInput}
            />
          </label>
          <Button variant="ghost" size="sm" icon={<RotateCcw />} onClick={restore} className={styles.restore}>
            Restore default
          </Button>
        </div>
      </div>

      <ItemEditor
        open={editing !== null}
        onClose={() => setEditing(null)}
        item={editing === 'new' ? null : editing}
        mealName={meal.name}
        foods={foods}
        foodsById={foodsById}
        favorites={favorites}
        onSave={(item) =>
          editing === 'new'
            ? actions.insertItem(meal.id, item)
            : actions.updateItem(meal.id, item.id, item)
        }
        onRemove={() => editing && editing !== 'new' && removeItem(editing)}
      />
    </article>
  );
}