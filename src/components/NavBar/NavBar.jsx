import { NavLink } from 'react-router-dom';
import { House, BookOpen, Scale, Dumbbell, ChartColumn, Database, Settings } from 'lucide-react';
import styles from './NavBar.module.css';

const ITEMS = [
  { to: '/', label: 'Today', icon: House, end: true },
  { to: '/diary', label: 'Diary', icon: BookOpen },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/activity', label: 'Activity', icon: Dumbbell },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn },
  { to: '/foods', label: 'Foods', icon: Database, railOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings, railOnly: true },
];

/** Bottom tab bar on phones; becomes a side rail from 900px. */
export function NavBar() {
  return (
    <nav className={styles.nav} aria-label="Main">
      <span className={styles.wordmark}>Nourish</span>
      <ul className={styles.list}>
        {ITEMS.map(({ to, label, icon: Icon, end, railOnly }) => (
          <li key={to} className={railOnly ? styles.railOnly : undefined}>
            <NavLink to={to} end={end} className={({ isActive }) => `interactive ${styles.link} ${isActive ? styles.active : ''}`}>
              <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
