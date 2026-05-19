import { useCallback, useEffect, useState } from "react";
import { ALLOWED_MODEL_IDS, DEFAULT_MODEL_ID } from "../components/assistant/ModelToggle";

const STORAGE_KEY = "mike.selectedModel";

function readStored(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL_ID;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && ALLOWED_MODEL_IDS.includes(raw)) return raw;
  return DEFAULT_MODEL_ID;
}

function writeStored(modelId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, modelId);
}

export function useSelectedModel(): [string, (id: string) => void] {
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID);

  useEffect(() => {
    setModel(readStored());
  }, []);

  const setSelectedModel = useCallback((id: string) => {
    if (ALLOWED_MODEL_IDS.includes(id)) {
      setModel(id);
      writeStored(id);
    }
  }, []);

  return [model, setSelectedModel];
}