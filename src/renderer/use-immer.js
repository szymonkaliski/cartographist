import { useState, useCallback } from "react";
import produce from "immer";

export default function useImmer(initialValue) {
  const [value, setValue] = useState(initialValue);

  return [value, useCallback((updater) => setValue(produce(updater)))];
}
