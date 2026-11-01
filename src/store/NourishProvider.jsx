import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { reducer } from './reducer.js';
import { createInitialState } from './initialState.js';
import { loadState, saveState, STORAGE_KEY } from '../utils/storage.js';
import { useSync } from './useSync.js';

const StoreContext = createContext(null);

export function NourishProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState() ?? createInitialState());
  const [saveFailed, setSaveFailed] = useState(false);

  // Persist on every change
  useEffect(() => {
    setSaveFailed(!saveState(state));
  }, [state]);

  // Another tab changed the data → load it here too
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      const next = loadState();
      if (next) dispatch({ type: 'HYDRATE', state: next });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const sync = useSync(state, dispatch);

  const value = useMemo(() => ({ state, dispatch, sync, saveFailed }), [state, sync, saveFailed]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <NourishProvider>');
  return ctx;
}
