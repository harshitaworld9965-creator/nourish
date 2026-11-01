import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import styles from './PageHeader.module.css';

/** Title, optional lead line and actions. The settings link shows on phones only (the rail has it on desktop). */
export function PageHeader({ title, lead, actions, eyebrow }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.text}>
          {eyebrow && <p className={`t-small t-muted ${styles.eyebrow}`}>{eyebrow}</p>}
          <h1 className="t-title">{title}</h1>
        </div>
        <div className={styles.actions}>
          {actions}
          <Link to="/settings" className={`interactive ${styles.settings}`} aria-label="Settings">
            <Settings size={20} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
      {lead && <p className={`t-lead ${styles.lead}`}>{lead}</p>}
    </header>
  );
}
