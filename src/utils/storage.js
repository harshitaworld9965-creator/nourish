/**
 * LocalStorage persistence with a schema version.
 * Everything lives under one key so a save is atomic.
 */
export const STORAGE_KEY = 'nourish:v1';
export const SCHEMA_VERSION = 1;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch (err) {
    console.error('Nourish: could not read saved data', err);
    return null;
  }
}

/** Returns true on success, false if storage is full or unavailable. */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Nourish: could not save data', err);
    return false;
  }
}

export function clearStoredState() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Future schema changes go here, one step per version. */
function migrate(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.version === SCHEMA_VERSION) return data;
  return null;
}
