import { useState, useEffect, useCallback } from "react";
import produce from "immer";

export default function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value === initialValue) {
      const stored = localStorage[key];

      if (stored) {
        let storedValue;

        try {
          storedValue = JSON.parse(stored);
        } catch (e) {}

        if (storedValue) {
          setValue(storedValue);
        }
      }
    } else {
      localStorage[key] = JSON.stringify(value);
    }
  }, [value, setValue]);

  return [value, useCallback((updater) => setValue(produce(updater)))];
}
