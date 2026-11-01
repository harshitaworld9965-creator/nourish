import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { controlClass } from '../ui/Field.jsx';
import { defaultPortion, itemNutrition, formatQty, fmtKcal, fmtProtein, STATE_LABELS } from '../../utils/nutrition.js';
import styles from './FoodPicker.module.css';

/** Searchable food list. Favourites first when the search is empty. */
export function FoodPicker({ foods, favorites, onPick }) {
  const [query, setQuery] = useState('');

  const { favs, rest } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (f) => !q || f.name.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q);
    const all = foods.filter(match);
    if (q) return { favs: [], rest: all };
    return { favs: all.filter((f) => favorites.includes(f.id)), rest: all.filter((f) => !favorites.includes(f.id)) };
  }, [foods, favorites, query]);

  return (
    <div className={styles.picker}>
      <label className={styles.search}>
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search foods</span>
        <input
          className={`${controlClass} ${styles.input}`}
          type="search"
          placeholder="Search foods"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </label>

      {favs.length > 0 && <List title="Favourites" foods={favs} onPick={onPick} starred />}
      {rest.length > 0 && <List title={query ? `${rest.length} found` : 'All foods'} foods={rest} onPick={onPick} />}

      {favs.length + rest.length === 0 && (
        <p className={`t-small t-muted ${styles.none}`}>
          Nothing called “{query}”. <Link to="/foods?new=1" className={styles.link}>Add it as a custom food</Link>
        </p>
      )}
    </div>
  );
}

function List({ title, foods, onPick, starred }) {
  return (
    <section>
      <h3 className={`t-caption ${styles.groupTitle}`}>{title}</h3>
      <ul className="ruled">
        {foods.map((food) => {
          const portion = { ...defaultPortion(food) };
          const n = itemNutrition(portion, food);
          return (
            <li key={food.id}>
              <button type="button" className={`interactive ${styles.row}`} onClick={() => onPick(food)}>
                <span className={styles.name}>
                  {starred && <Star size={13} className={styles.star} aria-label="Favourite" />}
                  {food.name}
                  {food.state === 'dry' || food.state === 'cooked' ? (
                    <span className={styles.state}>{STATE_LABELS[food.state].toLowerCase()}</span>
                  ) : null}
                </span>
                <span className={`t-small t-muted ${styles.meta}`}>
                  {formatQty(portion, food)} · {fmtKcal(n.kcal)} kcal · {fmtProtein(n.protein)} g protein
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
