import { useState, useEffect, useCallback } from "react";
import produce from "immer";

export default function usePersistedImmer(persistenceKey, initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value === initialValue) {
      const stored = localStorage[persistenceKey];

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
      localStorage[persistenceKey] = JSON.stringify(value);
    }
  }, [value, setValue]);

  return [value, useCallback((updater) => setValue(produce(updater)))];
}
