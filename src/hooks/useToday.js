import { useEffect, useState } from 'react';
import { todayKey } from '../utils/dates.js';

/** Today's date key, kept correct if the app stays open past midnight. */
export function useToday() {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const check = () => setToday((prev) => (prev === todayKey() ? prev : todayKey()));
    const timer = setInterval(check, 30_000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);
  return today;
}
