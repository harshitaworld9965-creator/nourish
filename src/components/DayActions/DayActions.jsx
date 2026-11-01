import { useState } from 'react';
import { CheckCheck, RotateCcw, Save } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Sheet } from '../ui/Sheet.jsx';
import { Field } from '../ui/Field.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useStore } from '../../store/NourishProvider.jsx';
import { uid } from '../../utils/ids.js';
import styles from './DayActions.module.css';

/** Whole-day actions: mark all eaten, restore the original plan, save as a template. */
export function DayActions({ day, actions }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const allEaten = day.meals.every((m) => m.eaten);

  const restoreDay = () => {
    const before = structuredClone(day);
    actions.restoreDay();
    toast('This day now uses the original meal plan', { label: 'Undo', onClick: () => actions.setDay(before) });
  };

  return (
    <div className={styles.actions}>
      <Button variant="ghost" size="sm" icon={<CheckCheck />} onClick={() => actions.setAllEaten(!allEaten)}>
        {allEaten ? 'Unmark all' : 'Mark all eaten'}
      </Button>
      <Button variant="ghost" size="sm" icon={<Save />} onClick={() => setSaving(true)}>
        Save as template
      </Button>
      <Button variant="ghost" size="sm" icon={<RotateCcw />} onClick={restoreDay}>
        Restore default meal plan
      </Button>

      <Sheet open={saving} onClose={() => setSaving(false)} title="Save as template">
        <SaveTemplateForm
          onCancel={() => setSaving(false)}
          onSave={(name, activate) => {
            const template = {
              id: uid(),
              name,
              meals: day.meals.map(({ eaten: _eaten, ...m }) => structuredClone(m)),
              createdAt: Date.now(),
            };
            dispatch({ type: 'SAVE_TEMPLATE', template, activate });
            setSaving(false);
            toast(activate ? `“${name}” saved — new days will use it` : `“${name}” saved`);
          }}
        />
      </Sheet>
    </div>
  );
}

function SaveTemplateForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [activate, setActivate] = useState(true);
  const [error, setError] = useState('');

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return setError('Give the template a name.');
        onSave(name.trim(), activate);
      }}
      noValidate
    >
      <p className="t-small t-muted">
        Saves this day’s three meals as a reusable plan. The original plan stays available in Settings.
      </p>
      <Field label="Template name" error={error}>
        {(p) => (
          <input {...p} value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Paneer week" autoFocus maxLength={60} />
        )}
      </Field>
      <label className={styles.check}>
        <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
        Use this template for new days
      </label>
      <div className={styles.buttons}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save template</Button>
      </div>
    </form>
  );
}
