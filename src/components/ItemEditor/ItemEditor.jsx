import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Trash2 } from 'lucide-react';
import { Sheet } from '../ui/Sheet.jsx';
import { Button } from '../ui/Button.jsx';
import { Field } from '../ui/Field.jsx';
import { FoodPicker } from '../FoodPicker/FoodPicker.jsx';
import { uid } from '../../utils/ids.js';
import {
  getUnits, itemNutrition, defaultPortion, baseAmount, formatNumber, fmtKcal, fmtProtein, STATE_LABELS,
} from '../../utils/nutrition.js';
import styles from './ItemEditor.module.css';

/**
 * Add, edit, replace or remove one food in a meal.
 * `item` null → add flow (pick a food, then set quantity).
 */
export function ItemEditor({ open, onClose, item, mealName, foods, foodsById, favorites, onSave, onRemove }) {
  const title = item ? 'Edit food' : `Add to ${mealName.toLowerCase()}`;
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <EditorBody
        item={item}
        foods={foods}
        foodsById={foodsById}
        favorites={favorites}
        onSave={onSave}
        onRemove={onRemove}
        onClose={onClose}
      />
    </Sheet>
  );
}

function EditorBody({ item, foods, foodsById, favorites, onSave, onRemove, onClose }) {
  const [newId] = useState(uid);
  const [mode, setMode] = useState(item ? 'edit' : 'pick');
  const [draft, setDraft] = useState(() =>
    item ? { ...item, qty: String(item.qty) } : { id: newId, foodId: null, qty: '', unit: 'base' },
  );
  const [error, setError] = useState('');
  const submitted = useRef(false);

  const food = draft.foodId ? foodsById[draft.foodId] : null;

  const pick = (f) => {
    const portion = defaultPortion(f);
    setDraft((d) => ({ ...d, foodId: f.id, qty: String(portion.qty), unit: portion.unit, alternatives: undefined, note: undefined }));
    setError('');
    setMode('edit');
  };

  const swap = (alt) => {
    setDraft((d) => ({
      ...d,
      ...alt,
      qty: String(alt.qty),
      note: undefined,
      alternatives: [
        { foodId: d.foodId, qty: Number(d.qty), unit: d.unit },
        ...(d.alternatives ?? []).filter((a) => a !== alt),
      ],
    }));
  };

  const save = (e) => {
    e?.preventDefault();
    if (submitted.current) return; // ignore double taps
    const qty = Number(draft.qty);
    if (!draft.foodId || !food) return setError('Choose a food first.');
    if (!Number.isFinite(qty) || qty <= 0) return setError('Enter a quantity above zero.');
    if (qty > 10000) return setError('That quantity looks too large.');
    submitted.current = true;
    const clean = { ...draft, qty };
    if (!clean.alternatives?.length) delete clean.alternatives;
    if (!clean.note) delete clean.note;
    onSave(clean);
    onClose();
  };

  if (mode === 'pick') {
    return (
      <>
        {item && (
          <Button variant="ghost" size="sm" onClick={() => setMode('edit')} className={styles.back}>
            Back to {foodsById[item.foodId]?.name ?? 'food'}
          </Button>
        )}
        <FoodPicker foods={foods} favorites={favorites} onPick={pick} />
      </>
    );
  }

  const units = getUnits(food);
  const preview = itemNutrition({ ...draft, qty: Number(draft.qty) || 0 }, food);
  const grams = food ? baseAmount({ ...draft, qty: Number(draft.qty) || 0 }, food) : 0;

  return (
    <form onSubmit={save} className={styles.form} noValidate>
      <div className={styles.foodHead}>
        <p className={styles.foodName}>{food?.name ?? 'This food was deleted'}</p>
        {food && (
          <p className="t-small t-muted">
            {STATE_LABELS[food.state]}
            {food.source === 'estimate' ? ' · estimated values' : food.source === 'label' ? ' · from label' : ''}
          </p>
        )}
      </div>

      {food && (
        <div className={styles.qtyRow}>
          <Field label="Quantity" error={error} className={styles.qty}>
            {(p) => (
              <input
                {...p}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={draft.qty}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, qty: e.target.value }));
                  setError('');
                }}
                autoFocus={!item}
              />
            )}
          </Field>
          {units.length > 1 ? (
            <Field label="Unit">
              {(p) => (
                <select {...p} value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id === 'serving' ? `${u.label} (${formatNumber(u.size)} ${food.perUnit})` : u.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          ) : (
            <p className={styles.unitStatic}>{food.perUnit}</p>
          )}
        </div>
      )}

      {food && (
        <div className={styles.result} aria-live="polite">
          <p>
            <span className="t-numeral">{fmtKcal(preview.kcal)}</span> <span className="t-muted">kcal</span>
          </p>
          <p>
            <span className="t-numeral">{fmtProtein(preview.protein)}</span> <span className="t-muted">g protein</span>
          </p>
          {draft.unit === 'serving' && (
            <p className="t-small t-muted">
              {formatNumber(grams)} {food.perUnit}
            </p>
          )}
        </div>
      )}

      {draft.note && <p className="t-small t-muted">{draft.note}</p>}
      {food?.note && <p className="t-small t-muted">{food.note}</p>}

      {draft.alternatives?.length > 0 && (
        <div className={styles.swaps}>
          {draft.alternatives.map((alt) => (
            <Button key={alt.foodId} size="sm" variant="secondary" icon={<ArrowLeftRight />} onClick={() => swap(alt)}>
              Swap for {foodsById[alt.foodId]?.name ?? 'alternative'}
            </Button>
          ))}
        </div>
      )}

      {food?.source === 'estimate' && (
        <p className="t-caption">
          Values are typical estimates. <Link to="/foods" className={styles.link}>Edit this food</Link> to match your
          brand’s label.
        </p>
      )}

      <div className={styles.actions}>
        {item && (
          <Button variant="danger" icon={<Trash2 />} onClick={() => { onRemove(); onClose(); }}>
            Remove
          </Button>
        )}
        <span className={styles.spacer} />
        <Button variant="ghost" onClick={() => setMode('pick')}>
          {item ? 'Replace food' : 'Choose another'}
        </Button>
        <Button variant="primary" type="submit" disabled={!food}>
          {item ? 'Save' : 'Add food'}
        </Button>
      </div>
    </form>
  );
}
