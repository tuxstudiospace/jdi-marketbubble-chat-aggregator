import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [key, val]);
  const update = useCallback((v) => setVal((prev) => (typeof v === 'function' ? v(prev) : v)), []);
  return [val, update];
}
