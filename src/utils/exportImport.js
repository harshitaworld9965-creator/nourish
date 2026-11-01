import { SCHEMA_VERSION } from './storage.js';

export function exportFile(state) {
  const payload = { app: 'nourish', version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nourish-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Throws a readable error if the file isn't a Nourish backup. */
export function parseImport(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('This file isn’t valid JSON.');
  }
  if (json?.app !== 'nourish' || !isObj(json.data)) throw new Error('This file isn’t a Nourish backup.');
  if (json.version !== SCHEMA_VERSION) throw new Error(`This backup is from a different version (${json.version}).`);
  const d = json.data;
  const ok =
    isObj(d.settings) &&
    isObj(d.foods) && isObj(d.foods.overrides) && isObj(d.foods.custom) && Array.isArray(d.foods.favorites) &&
    isObj(d.templates) && isObj(d.templates.items) &&
    isObj(d.weight) && Array.isArray(d.weight.entries) &&
    isObj(d.workouts) && Array.isArray(d.workouts.entries) &&
    isObj(d.days);
  if (!ok) throw new Error('The backup is incomplete or damaged.');
  return { state: { ...d, version: SCHEMA_VERSION }, exportedAt: json.exportedAt };
}
