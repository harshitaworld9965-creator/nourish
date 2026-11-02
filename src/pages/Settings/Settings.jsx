import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, Trash2, RotateCcw, Smartphone } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field } from '../../components/ui/Field.jsx';
import { Sheet } from '../../components/ui/Sheet.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useStore } from '../../store/NourishProvider.jsx';
import { useInstallPrompt } from '../../hooks/useInstallPrompt.js';
import { useToday } from '../../hooks/useToday.js';
import { DEFAULT_TEMPLATE } from '../../data/defaultMealPlan.js';
import { DEFAULT_WATER_TARGET, DEFAULT_GLASS_SIZE, DEFAULT_STEP_GOAL } from '../../data/defaultSettings.js';
import { getTemplate } from '../../store/initialState.js';
import { exportFile, parseImport } from '../../utils/exportImport.js';
import { clearStoredState } from '../../utils/storage.js';
import { clearMeta } from '../../store/sync.js';
import { formatTime } from '../../utils/dates.js';
import { SyncSection } from './SyncSection.jsx';
import styles from './Settings.module.css';

export default function Settings() {
  const { state, dispatch, sync } = useStore();
  const toast = useToast();
  const today = useToday();
  const { canInstall, installed, install } = useInstallPrompt();
  const s = state.settings;
  const [confirm, setConfirm] = useState(null); // 'clear' | { import } | 'restore'
  const fileRef = useRef(null);

  const update = (patch) => dispatch({ type: 'UPDATE_SETTINGS', patch });
  const active = getTemplate(state, s.activeTemplateId);
  const templates = [DEFAULT_TEMPLATE, ...Object.values(state.templates.items).sort((a, b) => a.createdAt - b.createdAt)];

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = parseImport(await file.text());
      setConfirm({ import: parsed });
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <PageHeader title="Settings" />

      <Section title="You">
        <TextSetting label="Name for the greeting" value={s.name} onSave={(v) => update({ name: v })} placeholder="Optional" />
      </Section>

      <Section title="Daily targets" note="Used for the progress bars and weekly analytics.">
        <div className={styles.two}>
          <NumberSetting label="Calories (kcal)" value={s.kcalTarget} min={800} max={5000} onSave={(v) => update({ kcalTarget: v })} />
          <NumberSetting label="Protein (g)" value={s.proteinTarget} min={20} max={400} onSave={(v) => update({ proteinTarget: v })} />
        </div>
        <div className={styles.two}>
          <NumberSetting
            label="Water (ml)"
            value={s.waterTarget ?? DEFAULT_WATER_TARGET}
            min={500}
            max={10000}
            onSave={(v) => update({ waterTarget: v })}
          />
          <NumberSetting
            label="Glass size (ml)"
            hint="Added per tap"
            value={s.glassSize ?? DEFAULT_GLASS_SIZE}
            min={50}
            max={2000}
            onSave={(v) => update({ glassSize: v })}
          />
        </div>
        <div className={styles.two}>
          <NumberSetting
            label="Daily steps"
            value={s.stepGoal ?? DEFAULT_STEP_GOAL}
            min={500}
            max={50000}
            onSave={(v) => update({ stepGoal: v })}
          />
        </div>
      </Section>

      <Section title="Meal times" note="Applies to new days. Change a single day’s time from the meal itself.">
        <div className={styles.three}>
          {active.meals.map((m) => (
            <Field key={m.id} label={m.name} hint={s.mealTimes[m.id] ? `Plan says ${formatTime(m.time)}` : undefined}>
              {(p) => (
                <input
                  {...p}
                  type="time"
                  value={s.mealTimes[m.id] ?? m.time}
                  onChange={(e) => e.target.value && update({ mealTimes: { ...s.mealTimes, [m.id]: e.target.value } })}
                />
              )}
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Meal plan" note="New days start from the plan selected here. Days you’ve already opened keep their meals.">
        <ul className={`ruled ${styles.templates}`}>
          {templates.map((t) => (
            <li key={t.id} className={styles.template}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="template"
                  checked={s.activeTemplateId === t.id || (t.id === 'default' && !state.templates.items[s.activeTemplateId])}
                  onChange={() => update({ activeTemplateId: t.id })}
                />
                <span>
                  {t.name}
                  <span className="t-small t-muted"> · {t.meals.reduce((a, m) => a + m.items.length, 0)} foods</span>
                </span>
              </label>
              {t.locked ? (
                <span className="t-caption">Built in</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 />}
                  label={`Delete ${t.name}`}
                  onClick={() => {
                    dispatch({ type: 'DELETE_TEMPLATE', id: t.id });
                    toast(`“${t.name}” deleted`);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
        <p className="t-small t-muted">To save a new template, edit a day’s meals and choose “Save as template” below them.</p>
        <div className={styles.row}>
          <Button icon={<RotateCcw />} onClick={() => setConfirm('restore')}>Restore default meal plan</Button>
        </div>
      </Section>

      <Section title="Food database">
        <p className="t-small t-muted">
          Search, edit nutrition values from labels, add custom foods and mark favourites.
        </p>
        <div className={styles.row}>
          <Link to="/foods" className={styles.textLink}>Manage foods</Link>
        </div>
      </Section>

      <Section title="Sync across devices">
        <SyncSection />
      </Section>

      <Section title="Install">
        {installed ? (
          <p className="t-small t-muted">Nourish is installed on this device.</p>
        ) : canInstall ? (
          <Button variant="primary" icon={<Smartphone />} onClick={install}>Install Nourish</Button>
        ) : (
          <p className="t-small t-muted">
            On Android, open the browser menu and choose “Install app” or “Add to Home screen”. On iPad, use Share → Add to
            Home Screen.
          </p>
        )}
      </Section>

      <Section title="Your data" note="Stored on this device. Export a backup now and then.">
        <div className={styles.row}>
          <Button icon={<Download />} onClick={() => { exportFile(state); toast('Backup downloaded'); }}>Export data</Button>
          <Button icon={<Upload />} onClick={() => fileRef.current?.click()}>Import backup</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
          <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirm('clear')}>Clear all data</Button>
        </div>
      </Section>

      <Sheet open={confirm === 'restore'} onClose={() => setConfirm(null)} title="Restore default meal plan?">
        <ConfirmBody
          text="New days will start from the original breakfast, lunch and dinner with their original times. Your saved templates are kept. You can also reset today’s meals."
          onCancel={() => setConfirm(null)}
          actions={[
            {
              label: 'Restore for new days',
              variant: 'secondary',
              onClick: () => {
                dispatch({ type: 'RESTORE_DEFAULT_PLAN' });
                toast('New days will use the original plan');
              },
            },
            {
              label: 'Also reset today',
              variant: 'primary',
              onClick: () => {
                dispatch({ type: 'RESTORE_DEFAULT_PLAN' });
                dispatch({ type: 'RESTORE_DAY', date: today });
                toast('Original plan restored, including today');
              },
            },
          ]}
          close={() => setConfirm(null)}
        />
      </Sheet>

      <Sheet open={Boolean(confirm?.import)} onClose={() => setConfirm(null)} title="Import backup?">
        <ConfirmBody
          text={`This replaces everything on this device with the backup${confirm?.import?.exportedAt ? ` from ${new Date(confirm.import.exportedAt).toLocaleString()}` : ''}.${sync.user ? ' Synced devices will receive it too.' : ''}`}
          onCancel={() => setConfirm(null)}
          actions={[{
            label: 'Replace my data',
            variant: 'primary',
            onClick: () => {
              dispatch({ type: 'IMPORT', state: confirm.import.state });
              toast('Backup imported');
            },
          }]}
          close={() => setConfirm(null)}
        />
      </Sheet>

      <Sheet open={confirm === 'clear'} onClose={() => setConfirm(null)} title="Clear all data?">
        <ClearBody
          signedIn={Boolean(sync.user)}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            if (sync.user) await sync.signOut();
            clearMeta();
            clearStoredState();
            dispatch({ type: 'CLEAR' });
            setConfirm(null);
            toast('All data cleared from this device');
          }}
        />
      </Sheet>
    </div>
  );
}

function Section({ title, note, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {note && <p className="t-small t-muted">{note}</p>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

/** Saves on blur or Enter, so typing doesn't stamp a sync change on every keystroke. */
function NumberSetting({ label, hint, value, min, max, onSave }) {
  const [v, setV] = useState(String(value));
  const [error, setError] = useState('');
  const commit = () => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) {
      setError(`Enter a number from ${min} to ${max}.`);
      return;
    }
    setError('');
    if (Math.round(n) !== value) onSave(Math.round(n));
  };
  return (
    <Field label={label} hint={hint} error={error}>
      {(p) => (
        <input {...p} type="number" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
      )}
    </Field>
  );
}

function TextSetting({ label, value, onSave, placeholder }) {
  const [v, setV] = useState(value);
  return (
    <Field label={label}>
      {(p) => (
        <input
          {...p}
          value={v}
          placeholder={placeholder}
          maxLength={40}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => v.trim() !== value && onSave(v.trim())}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      )}
    </Field>
  );
}

function ConfirmBody({ text, actions, onCancel, close }) {
  return (
    <div className={styles.confirm}>
      <p>{text}</p>
      <div className={styles.confirmButtons}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        {actions.map((a) => (
          <Button key={a.label} variant={a.variant} onClick={() => { a.onClick(); close(); }}>{a.label}</Button>
        ))}
      </div>
    </div>
  );
}

function ClearBody({ signedIn, onCancel, onConfirm }) {
  const [typed, setTyped] = useState('');
  return (
    <div className={styles.confirm}>
      <p>
        This deletes every meal, weigh-in, workout, custom food and template on this device. It can’t be undone, so export a
        backup first if you might need it.
        {signedIn ? ' You’ll be signed out; your synced copy stays in your account and returns if you sign in again.' : ''}
      </p>
      <Field label="Type DELETE to confirm">
        {(p) => <input {...p} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />}
      </Field>
      <div className={styles.confirmButtons}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" disabled={typed !== 'DELETE'} onClick={onConfirm}>Clear all data</Button>
      </div>
    </div>
  );
}