import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Sheet.module.css';

/**
 * Modal built on <dialog>: focus trapping, Escape and the inert background
 * come from the browser. Bottom sheet on phones, centred panel on wider screens.
 * Children mount only while open, so forms start fresh each time.
 */
export function Sheet({ open, onClose, title, children, footer, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.sheet} ${wide ? styles.wide : ''}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className={styles.inner}>
          <header className={styles.header}>
            <h2 id={titleId} className={`t-heading ${styles.title}`}>
              {title}
            </h2>
            <button type="button" className={`interactive ${styles.close}`} onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
