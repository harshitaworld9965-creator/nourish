import styles from './EmptyState.module.css';

export function EmptyState({ title, children, action }) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {children && <p className="t-small t-muted">{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
