import { useState, useEffect } from "react";
import { useImmer } from "use-immer";

export default function usePersistedState(key, initialValue) {
  const [value, setValue] = useImmer(initialValue);

  useEffect(() => {
    if (value === initialValue) {
      const stored = localStorage[key];

      if (stored) {
        let storedValue;

        try {
          storedValue = JSON.parse(stored);
        } catch (e) {}

        if (storedValue) {
          setValue((draft) => {
            for (let key in storedValue) {
              draft[key] = storedValue[key];
            }
          });
        }
      }
    } else {
      localStorage[key] = JSON.stringify(value);
    }
  }, [value]);

  return [value, setValue];
}
