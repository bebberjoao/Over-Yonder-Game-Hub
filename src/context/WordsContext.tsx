import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AgeGroup, WordEntry, defaultWordsByAge, shuffle } from "@/data/words";
import { fetchWordsFromSheets } from "@/data/sheetsLoader";

const STORAGE_KEY = "oy-words-v1";
const DEFAULT_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQLUQ2whcqlo9O8o7WNQ0PiOcYWeVnMucHvUVtc5mgab-Oqva6hW75l8MNA7mX55pfSR3USwRsRG7V8/pub?output=csv";
const SHEETS_ID = import.meta.env.VITE_SHEETS_ID || "";
const SHEETS_CSV_URL = import.meta.env.VITE_SHEETS_CSV_URL || DEFAULT_SHEETS_CSV_URL;

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
  getRandomWords: (age: AgeGroup, count?: number) => WordEntry[];
  getDistractors: (age: AgeGroup, count?: number) => WordEntry[];
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

  const getRandomWords = useCallback((age: AgeGroup, count = 1) => {
    const pool = (words[age] ?? []).filter((e) => e && e.word && e.translation);
    if (count <= 0) return [];
    if (pool.length === 0) return [];
    if (count >= pool.length) return shuffle(pool);
    const copy = [...pool];
    const out: WordEntry[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }, [words]);

  const getDistractors = useCallback((age: AgeGroup, count = 3) => {
    // collect pool from other age groups
    const others: WordEntry[] = [];
    (Object.keys(words) as AgeGroup[]).forEach((a) => {
      if (a === age) return;
      (words[a] ?? []).forEach((e) => {
        if (e && e.word && e.translation) others.push(e);
      });
    });
    if (count <= 0) return [];
    if (others.length === 0) return [];
    if (count >= others.length) return shuffle(others);
    const copy = [...others];
    const out: WordEntry[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }, [words]);

  const value = useMemo<Ctx>(() => ({ words, addWord, updateWord, removeWord, resetAge, resetAll, exportJson, importJson, getRandomWords, getDistractors }), [words, addWord, updateWord, removeWord, resetAge, resetAll, exportJson, importJson, getRandomWords, getDistractors]);
  return <WordsContext.Provider value={value}>{children}</WordsContext.Provider>;
}

export function useWords() {
  const ctx = useContext(WordsContext);
  if (!ctx) throw new Error("useWords must be used within WordsProvider");
  return ctx;
}