import styles from './Button.module.css';

/**
 * variant: primary | secondary | ghost | danger
 * size:    md | sm
 * icon:    an icon element; with no children it becomes an icon-only button
 *          (pass `label` for its accessible name)
 */
export function Button({ variant = 'secondary', size = 'md', icon, label, className = '', children, type = 'button', ...rest }) {
  const iconOnly = icon && !children;
  return (
    <button
      type={type}
      className={`interactive ${styles.btn} ${styles[variant]} ${styles[size]} ${iconOnly ? styles.iconOnly : ''} ${className}`}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
