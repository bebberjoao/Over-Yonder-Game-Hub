import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AgeGroup, WordEntry, defaultWordsByAge } from "@/data/words";
import { fetchWordsFromSheets } from "@/data/sheetsLoader";

const STORAGE_KEY = "oy-words-v1";
const SHEETS_ID = import.meta.env.VITE_SHEETS_ID || "";
const SHEETS_CSV_URL = import.meta.env.VITE_SHEETS_CSV_URL || "";

type Dict = Record<AgeGroup, WordEntry[]>;

interface Ctx {
  words: Dict;
  addWord: (age: AgeGroup, entry: WordEntry) => void;
  updateWord: (age: AgeGroup, index: number, entry: WordEntry) => void;
  removeWord: (age: AgeGroup, index: number) => void;
  resetAge: (age: AgeGroup) => void;
  resetAll: () => void;
  exportJson: () => string;
  importJson: (raw: string) => boolean;
}

const WordsContext = createContext<Ctx | null>(null);

function cloneDefaults(): Dict {
  return JSON.parse(JSON.stringify(defaultWordsByAge));
}

export function WordsProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Dict>(() => cloneDefaults());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Try to load from Google Sheets first if a CSV URL or sheet ID is configured
        if (SHEETS_CSV_URL || SHEETS_ID) {
          const sheetsData = await fetchWordsFromSheets({
            spreadsheetId: SHEETS_ID || undefined,
            csvUrl: SHEETS_CSV_URL || undefined,
          });
          setWords(sheetsData);
          setHydrated(true);
          return;
        }
      } catch (err) {
        console.warn("Failed to load from Sheets, falling back to localStorage/defaults", err);
      }

      // Fallback to localStorage
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.kids && parsed.teens && parsed.adults) {
            setWords(parsed);
            setHydrated(true);
            return;
          }
        }
      } catch {}

      // Final fallback to defaults
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(words)); } catch {}
  }, [words, hydrated]);

  const addWord = useCallback((age: AgeGroup, entry: WordEntry) => {
    setWords((w) => ({ ...w, [age]: [...w[age], entry] }));
  }, []);
  const updateWord = useCallback((age: AgeGroup, index: number, entry: WordEntry) => {
    setWords((w) => ({ ...w, [age]: w[age].map((e, i) => (i === index ? entry : e)) }));
  }, []);
  const removeWord = useCallback((age: AgeGroup, index: number) => {
    setWords((w) => ({ ...w, [age]: w[age].filter((_, i) => i !== index) }));
  }, []);
  const resetAge = useCallback((age: AgeGroup) => {
    setWords((w) => ({ ...w, [age]: JSON.parse(JSON.stringify(defaultWordsByAge[age])) }));
  }, []);
  const resetAll = useCallback(() => setWords(cloneDefaults()), []);
  const exportJson = useCallback(() => JSON.stringify(words, null, 2), [words]);
  const importJson = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.kids || !parsed.teens || !parsed.adults) return false;
      setWords(parsed);
      return true;
    } catch { return false; }
  }, []);

  const value = useMemo<Ctx>(() => ({ words, addWord, updateWord, removeWord, resetAge, resetAll, exportJson, importJson }), [words, addWord, updateWord, removeWord, resetAge, resetAll, exportJson, importJson]);
  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
}

export function useWords() {
  const ctx = useContext(WordsContext);
  if (!ctx) throw new Error("useWords must be used within WordsProvider");
  return ctx;
}