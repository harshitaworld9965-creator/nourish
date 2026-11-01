import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Star } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { controlClass } from '../../components/ui/Field.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { FoodEditor } from '../../components/FoodEditor/FoodEditor.jsx';
import { useFoods } from '../../hooks/useFoods.js';
import { defaultPortion, itemNutrition, formatQty, describeBasis, fmtKcal, fmtProtein, formatNumber, STATE_LABELS } from '../../utils/nutrition.js';
import styles from './FoodDatabase.module.css';

const FILTERS = { all: 'All', favorites: 'Favourites', custom: 'My foods', edited: 'Edited' };

export default function FoodDatabase() {
  const { foods, favorites, isDefault, isEdited, saveFood, resetFood, deleteFood, toggleFavorite } = useFoods();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null); // food | 'new' | null

  // /foods?new=1 opens the add form (linked from the food picker)
  useEffect(() => {
    if (params.get('new')) {
      setEditing('new');
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foods.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q) && !f.category?.toLowerCase().includes(q)) return false;
      if (filter === 'favorites') return favorites.includes(f.id);
      if (filter === 'custom') return !isDefault(f.id);
      if (filter === 'edited') return isEdited(f.id);
      return true;
    });
  }, [foods, query, filter, favorites, isDefault, isEdited]);

  const usedNames = useMemo(() => new Set(foods.map((f) => f.name.toLowerCase())), [foods]);
  const current = editing && editing !== 'new' ? editing : null;
  const close = () => setEditing(null);

  return (
    <div className={`container ${styles.page}`}>
      <PageHeader
        title="Foods"
        lead="Built-in values are estimates. Edit any food to match the label on what you actually buy."
        actions={<Button variant="primary" icon={<Plus />} onClick={() => setEditing('new')}>Add food</Button>}
      />

      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search foods</span>
          <input
            type="search"
            className={`${controlClass} ${styles.searchInput}`}
            placeholder="Search foods"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className={styles.filters} role="group" aria-label="Filter foods">
          {Object.entries(FILTERS).map(([k, v]) => (
            <button
              key={k}
              type="button"
              className={`interactive ${styles.chip}`}
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={query ? `No foods match “${query}”` : 'Nothing here yet'}
          action={<Button variant="secondary" icon={<Plus />} onClick={() => setEditing('new')}>Add a custom food</Button>}
        >
          {filter === 'favorites' ? 'Tap the star next to a food to keep it at the top of the food picker.' : null}
        </EmptyState>
      ) : (
        <ul className={`ruled ${styles.list}`}>
          {visible.map((food) => {
            const portion = defaultPortion(food);
            const n = itemNutrition(portion, food);
            const fav = favorites.includes(food.id);
            return (
              <li key={food.id} className={styles.row}>
                <button type="button" className={`interactive ${styles.main}`} onClick={() => setEditing(food)}>
                  <span className={styles.name}>{food.name}</span>
                  <span className={`t-small t-muted ${styles.meta}`}>
                    {formatNumber(food.kcal)} kcal · {formatNumber(food.protein)} g protein {describeBasis(food)}
                  </span>
                  <span className={styles.tags}>
                    <span className={styles.tag}>{STATE_LABELS[food.state]}</span>
                    {food.source === 'estimate' && <span className={styles.tag}>Estimate</span>}
                    {food.source === 'label' && <span className={`${styles.tag} ${styles.tagGood}`}>From label</span>}
                    {!isDefault(food.id) && <span className={styles.tag}>Custom</span>}
                    {isEdited(food.id) && <span className={styles.tag}>Edited</span>}
                  </span>
                </button>
                <span className={`t-small t-muted ${styles.serving}`}>
                  {formatQty(portion, food)}: <span className="t-numeral">{fmtKcal(n.kcal)}</span> kcal, {fmtProtein(n.protein)} g
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Star className={fav ? styles.starOn : undefined} />}
                  label={fav ? `Remove ${food.name} from favourites` : `Add ${food.name} to favourites`}
                  aria-pressed={fav}
                  onClick={() => toggleFavorite(food.id)}
                />
              </li>
            );
          })}
        </ul>
      )}

      <Sheet open={editing !== null} onClose={close} title={current ? current.name : 'Add food'} wide>
        <FoodEditor
          food={current}
          isDefault={current ? isDefault(current.id) : false}
          isEdited={current ? isEdited(current.id) : false}
          usedNames={usedNames}
          onCancel={close}
          onSave={(food) => {
            saveFood(food);
            close();
            toast(current ? `${food.name} updated` : `${food.name} added`);
          }}
          onReset={() => {
            resetFood(current.id);
            close();
            toast(`${current.name} reset to built-in values`);
          }}
          onDelete={
            current && !isDefault(current.id)
              ? () => {
                  if (!window.confirm(`Delete ${current.name}? Meals that use it will show “Deleted food”.`)) return;
                  deleteFood(current.id);
                  close();
                  toast(`${current.name} deleted`);
                }
              : undefined
          }
        />
      </Sheet>
    </div>
  );
}
