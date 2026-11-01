import { useState } from 'react';
import { Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/NourishProvider.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field } from '../../components/ui/Field.jsx';
import styles from './Settings.module.css';

const STATUS = { idle: 'Up to date', syncing: 'Syncing…', error: 'Sync failed', offline: 'Offline — will sync when you reconnect' };

/** Sign in with an emailed 6-digit code; the same email on each device shares one copy of your data. */
export function SyncSection() {
  const { sync } = useStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!sync.available) {
    return (
      <div className={styles.syncOff}>
        <CloudOff size={20} aria-hidden="true" />
        <p className="t-small t-muted">
          Sync isn’t set up, so data stays on this device. Add your Supabase keys (see README) to sync your phone and
          tablet.
        </p>
      </div>
    );
  }

  if (sync.user) {
    return (
      <div className={styles.stack}>
        <div className={styles.syncOn}>
          <Cloud size={20} aria-hidden="true" />
          <div>
            <p>{sync.user.email}</p>
            <p className={`t-small ${sync.status === 'error' ? styles.errorText : 't-muted'}`}>
              {STATUS[sync.status]}
              {sync.status === 'idle' && sync.lastSynced ? ` · ${sync.lastSynced.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
              {sync.status === 'error' && sync.error ? ` — ${sync.error}` : ''}
            </p>
          </div>
        </div>
        <div className={styles.row}>
          <Button size="sm" icon={<RefreshCw />} onClick={sync.syncNow} disabled={sync.status === 'syncing'}>Sync now</Button>
          <Button size="sm" variant="ghost" icon={<LogOut />} onClick={sync.signOut}>Sign out</Button>
        </div>
      </div>
    );
  }

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return step === 'email' ? (
    <form
      className={styles.inline}
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
        run(async () => {
          await sync.sendCode(email.trim());
          setStep('code');
        });
      }}
      noValidate
    >
      <p className="t-small t-muted">Sign in with the same email on your phone and tablet to keep them in step.</p>
      <Field label="Email" error={error}>
        {(p) => <input {...p} type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />}
      </Field>
      <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</Button>
    </form>
  ) : (
    <form
      className={styles.inline}
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\d{6,10}$/.test(code.trim())) return setError('Enter the code from the email.');
        run(() => sync.verifyCode(email.trim(), code.trim()));
      }}
      noValidate
    >
      <p className="t-small t-muted">We sent a code to {email}. It expires in an hour.</p>
      <Field label="Code" error={error}>
        {(p) => <input {...p} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} autoFocus />}
      </Field>
      <div className={styles.row}>
        <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</Button>
        <Button variant="ghost" onClick={() => { setStep('email'); setCode(''); setError(''); }}>Use another email</Button>
      </div>
    </form>
  );
}
