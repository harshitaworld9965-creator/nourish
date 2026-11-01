import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from '../NavBar/NavBar.jsx';
import { useStore } from '../../store/NourishProvider.jsx';
import styles from './AppShell.module.css';

export function AppShell() {
  const { saveFailed } = useStore();
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <NavBar />
      <main id="main" className={styles.main}>
        {saveFailed && (
          <p className={styles.warning} role="alert">
            Changes can’t be saved on this device — storage is full or blocked. Export your data from Settings.
          </p>
        )}
        <Suspense fallback={<p className={`container t-muted ${styles.loading}`}>Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
