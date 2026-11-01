import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { loadMeta, saveMeta, dirtyRecords, localTimestamp, pull, push } from './sync.js';

/**
 * Runs sync when: you sign in, the app comes back to the foreground,
 * the network returns, a minute passes, or ~2 s after you change something.
 */
export function useSync(state, dispatch) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | syncing | error | offline
  const [lastSynced, setLastSynced] = useState(null);
  const [error, setError] = useState(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const running = useRef(false);
  const again = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  const runSync = useCallback(async () => {
    if (!supabase || !userId) return;
    if (running.current) {
      again.current = true;
      return;
    }
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }
    running.current = true;
    setStatus('syncing');
    try {
      let meta = loadMeta();
      if (meta.userId !== userId) meta = { pushed: {}, cursor: null, userId };

      // 1. Pull anything changed on other devices
      const rows = await pull(meta.cursor);
      for (const row of rows) {
        const remoteTs = row.value?.updatedAt ?? 0;
        if (remoteTs > localTimestamp(stateRef.current, row.key)) {
          dispatch({ type: 'REMOTE_APPLY', key: row.key, value: row.value });
        }
        meta.pushed[row.key] = Math.max(meta.pushed[row.key] ?? 0, remoteTs);
        if (!meta.cursor || row.synced_at > meta.cursor) meta.cursor = row.synced_at;
      }

      // 2. Push local edits newer than what the server has
      const dirty = dirtyRecords(stateRef.current, meta);
      await push(userId, dirty);
      for (const r of dirty) meta.pushed[r.key] = r.value.updatedAt;

      saveMeta(meta);
      setLastSynced(new Date());
      setError(null);
      setStatus('idle');
    } catch (err) {
      console.error('Nourish sync failed', err);
      setError(err.message ?? String(err));
      setStatus('error');
    } finally {
      running.current = false;
      if (again.current) {
        again.current = false;
        runSync();
      }
    }
  }, [userId, dispatch]);

  // Sign-in, foreground, network, timer
  useEffect(() => {
    if (!userId) return;
    runSync();
    const onVisible = () => document.visibilityState === 'visible' && runSync();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', runSync);
    const timer = setInterval(() => document.visibilityState === 'visible' && runSync(), 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', runSync);
      clearInterval(timer);
    };
  }, [userId, runSync]);

  // Local edits → push shortly after
  useEffect(() => {
    if (!userId) return;
    if (!dirtyRecords(state, loadMeta()).length) return;
    const t = setTimeout(runSync, 2000);
    return () => clearTimeout(t);
  }, [state, userId, runSync]);

  const sendCode = useCallback(async (email) => {
    const { error: e } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    });
    if (e) throw e;
  }, []);

  const verifyCode = useCallback(async (email, token) => {
    const { error: e } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (e) throw e;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStatus('idle');
    setLastSynced(null);
  }, []);

  return {
    available: Boolean(supabase),
    user: session?.user ?? null,
    status,
    error,
    lastSynced,
    syncNow: runSync,
    sendCode,
    verifyCode,
    signOut,
  };
}
