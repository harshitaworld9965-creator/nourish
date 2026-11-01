import { createClient } from '@supabase/supabase-js';

/**
 * Optional backend. If the two env variables are missing, `supabase` is null
 * and the app runs entirely on this device.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export const SYNC_TABLE = 'nourish_records';
