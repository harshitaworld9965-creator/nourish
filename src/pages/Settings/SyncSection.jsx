import { useState } from 'react';
import { Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/NourishProvider.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field } from '../../components/ui/Field.jsx';
import styles from './Settings.module.css';

const STATUS = { idle: 'Up to date', syncing: 'Syncing…', error: 'Sync failed', offline: 'Offline — will sync when you reconnect' };

/** Log in with the same email and password on every device to share one copy of your data. */
export function SyncSection() {
  const { sync } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <Button size="sm" variant="ghost" icon={<LogOut />} onClick={sync.signOut}>Log out</Button>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    setBusy(true);
    setError('');
    try {
      await sync.signIn(email.trim(), password);
      setPassword('');
    } catch (err) {
      setError(
        /invalid login credentials/i.test(err.message)
          ? 'Email or password is wrong.'
          : err.message ?? 'Couldn’t log in. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.inline} onSubmit={submit} noValidate>
      <p className="t-small t-muted">Log in with the same email and password on your phone, tablet and laptop.</p>
      <Field label="Email">
        {(p) => (
          <input {...p} type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
        )}
      </Field>
      <Field label="Password" error={error}>
        {(p) => (
          <input {...p} type="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
        )}
      </Field>
      <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Button>
    </form>
  );
}