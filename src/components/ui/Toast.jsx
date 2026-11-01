import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(() => {});

/** One toast at a time, with an optional action such as Undo. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((message, action) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    timer.current = setTimeout(() => setToast(null), action ? 6000 : 3500);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={styles.toast}>
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  toast.action.onClick();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
