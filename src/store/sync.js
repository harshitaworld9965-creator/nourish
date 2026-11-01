/**
 * Device sync, last-edit-wins per record.
 *
 * Records: settings, foods, templates, weight, workouts, and one per day
 * ("day:2026-11-01"). Each value carries its own `updatedAt`, so two devices
 * editing *different* days never conflict. If both edit the same record,
 * the later edit wins.
 */
import { supabase, SYNC_TABLE } from '../lib/supabase.js';

const META_KEY = 'nourish:v1:sync';
const SLICES = ['settings', 'foods', 'templates', 'weight', 'workouts'];

export function loadMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) ?? { pushed: {}, cursor: null, userId: null };
  } catch {
    return { pushed: {}, cursor: null, userId: null };
  }
}

export function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function clearMeta() {
  localStorage.removeItem(META_KEY);
}

export function localRecords(state) {
  const records = SLICES.map((key) => ({ key, value: state[key] }));
  for (const [date, day] of Object.entries(state.days)) records.push({ key: `day:${date}`, value: day });
  return records;
}

export function localTimestamp(state, key) {
  if (key.startsWith('day:')) return state.days[key.slice(4)]?.updatedAt ?? 0;
  return state[key]?.updatedAt ?? 0;
}

export function dirtyRecords(state, meta) {
  return localRecords(state).filter((r) => r.value.updatedAt > 0 && r.value.updatedAt > (meta.pushed[r.key] ?? 0));
}

export async function pull(cursor) {
  let query = supabase
    .from(SYNC_TABLE)
    .select('key, value, synced_at')
    .order('synced_at', { ascending: true })
    .limit(1000);
  if (cursor) query = query.gte('synced_at', cursor);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function push(userId, records) {
  if (!records.length) return;
  const rows = records.map((r) => ({
    user_id: userId,
    key: r.key,
    value: r.value,
    updated_at: new Date(r.value.updatedAt).toISOString(),
  }));
  // Batch to keep request bodies small
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from(SYNC_TABLE).upsert(rows.slice(i, i + 200), { onConflict: 'user_id,key' });
    if (error) throw error;
  }
}
