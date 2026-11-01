/**
 * Dates are stored as local 'YYYY-MM-DD' keys. Parsing at local noon
 * avoids daylight-saving edge cases when adding days.
 */
const pad = (n) => String(n).padStart(2, '0');

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => toKey(new Date());

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function isValidKey(key) {
  return typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(fromKey(key).getTime());
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** 0 = Monday … 6 = Sunday */
export const weekdayIndex = (key) => (fromKey(key).getDay() + 6) % 7;

export const startOfWeek = (key) => addDays(key, -weekdayIndex(key));

export const weekKeys = (startKey) => Array.from({ length: 7 }, (_, i) => addDays(startKey, i));

export const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);

export const formatLong = (key) =>
  fromKey(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatMedium = (key) =>
  fromKey(key).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const formatShort = (key) =>
  fromKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const weekdayShort = (key) => fromKey(key).toLocaleDateString('en-GB', { weekday: 'short' });

export function formatWeekRange(startKey) {
  const end = addDays(startKey, 6);
  return `${formatShort(startKey)} – ${formatShort(end)}`;
}

/** '13:00' → '1:00 pm' */
export function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${pad(m)} ${suffix}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
