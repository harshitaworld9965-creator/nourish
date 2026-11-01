import { useRef, useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { Field } from '../ui/Field.jsx';
import { uid } from '../../utils/ids.js';
import { STATE_LABELS } from '../../utils/nutrition.js';
import styles from './FoodEditor.module.css';

const toForm = (f) => ({
  name: f?.name ?? '',
  category: f?.category ?? 'Custom',
  state: f?.state ?? 'asSold',
  per: String(f?.per ?? 100),
  perUnit: f?.perUnit ?? 'g',
  kcal: f ? String(f.kcal) : '',
  protein: f ? String(f.protein) : '',
  servingLabel: f?.serving?.label ?? '',
  servingSize: f?.serving ? String(f.serving.size) : '',
  fromLabel: f?.source === 'label',
  note: f?.note ?? '',
});

/**
 * Create or edit a food. For built-in foods the result is stored as an
 * override; the original values stay in foodDatabase.js.
 */
export function FoodEditor({ food, onSave, onCancel, onDelete, onReset, isDefault, isEdited, usedNames }) {
  const [form, setForm] = useState(() => toForm(food));
  const [errors, setErrors] = useState({});
  const done = useRef(false);
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    const num = (v) => (v === '' ? NaN : Number(v));
    if (!form.name.trim()) er.name = 'Enter a name.';
    else if (!food && usedNames.has(form.name.trim().toLowerCase())) er.name = 'A food with this name already exists.';
    if (!(num(form.per) > 0)) er.per = 'Must be above zero.';
    if (!form.perUnit.trim()) er.perUnit = 'Enter a unit.';
    if (!(num(form.kcal) >= 0)) er.kcal = 'Enter calories (0 or more).';
    if (!(num(form.protein) >= 0)) er.protein = 'Enter protein (0 or more).';
    if (num(form.protein) * 4 > num(form.kcal) * 1.15 + 5) er.protein = 'Protein alone has more calories than the total. Check both values.';
    const hasServing = form.servingLabel.trim() || form.servingSize;
    if (hasServing) {
      if (!form.servingLabel.trim()) er.servingLabel = 'Name the serving, e.g. “slice”.';
      if (!(num(form.servingSize) > 0)) er.servingSize = 'Must be above zero.';
    }
    return er;
  };

  const submit = (e) => {
    e.preventDefault();
    if (done.current) return;
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;
    done.current = true;
    onSave({
      ...(food ?? {}),
      id: food?.id ?? `custom-${uid()}`,
      name: form.name.trim(),
      category: form.category.trim() || 'Custom',
      state: form.state,
      per: Number(form.per),
      perUnit: form.perUnit.trim(),
      kcal: Number(form.kcal),
      protein: Number(form.protein),
      serving: form.servingLabel.trim() ? { label: form.servingLabel.trim(), size: Number(form.servingSize) } : null,
      source: form.fromLabel ? 'label' : isDefault ? 'estimate' : 'custom',
      note: form.note.trim(),
    });
  };

  return (
    <form onSubmit={submit} className={styles.form} noValidate>
      <Field label="Name" error={errors.name}>
        {(p) => <input {...p} value={form.name} onChange={set('name')} maxLength={60} autoFocus={!food} />}
      </Field>

      <div className={styles.two}>
        <Field label="Weighed as" hint="Log the weight in this state.">
          {(p) => (
            <select {...p} value={form.state} onChange={set('state')}>
              {Object.entries(STATE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Category">
          {(p) => <input {...p} value={form.category} onChange={set('category')} maxLength={30} />}
        </Field>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Nutrition</legend>
        <div className={styles.two}>
          <Field label="Per amount" error={errors.per}>
            {(p) => <input {...p} type="number" inputMode="decimal" step="any" value={form.per} onChange={set('per')} />}
          </Field>
          <Field label="Unit" error={errors.perUnit} hint="g, ml, piece…">
            {(p) => <input {...p} value={form.perUnit} onChange={set('perUnit')} list="food-units" maxLength={20} />}
          </Field>
        </div>
        <datalist id="food-units">
          <option value="g" />
          <option value="ml" />
          <option value="piece" />
          <option value="serving" />
        </datalist>
        <div className={styles.two}>
          <Field label="Calories (kcal)" error={errors.kcal}>
            {(p) => <input {...p} type="number" inputMode="decimal" step="any" value={form.kcal} onChange={set('kcal')} />}
          </Field>
          <Field label="Protein (g)" error={errors.protein}>
            {(p) => <input {...p} type="number" inputMode="decimal" step="any" value={form.protein} onChange={set('protein')} />}
          </Field>
        </div>
        <label className={styles.check}>
          <input type="checkbox" checked={form.fromLabel} onChange={set('fromLabel')} />
          These values are from the product label
        </label>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Serving (optional)</legend>
        <p className="t-small t-muted">Lets you log “2 eggs” or “1 scoop” instead of weighing.</p>
        <div className={styles.two}>
          <Field label="Serving name" error={errors.servingLabel}>
            {(p) => <input {...p} value={form.servingLabel} onChange={set('servingLabel')} placeholder="scoop" maxLength={30} />}
          </Field>
          <Field label={`Size (${form.perUnit || 'unit'})`} error={errors.servingSize}>
            {(p) => <input {...p} type="number" inputMode="decimal" step="any" value={form.servingSize} onChange={set('servingSize')} placeholder="30" />}
          </Field>
        </div>
      </fieldset>

      <Field label="Note">
        {(p) => <textarea {...p} value={form.note} onChange={set('note')} maxLength={200} />}
      </Field>

      <div className={styles.actions}>
        {onDelete && <Button variant="danger" onClick={onDelete}>Delete food</Button>}
        {isEdited && onReset && <Button variant="ghost" onClick={onReset}>Reset to built-in values</Button>}
        <span className={styles.spacer} />
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{food ? 'Save food' : 'Add food'}</Button>
      </div>
    </form>
  );
}
