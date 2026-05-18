import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
}

interface Ctx {
  players: Player[];
  currentId: string | null;
  current: Player | null;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  setCurrent: (id: string) => void;
  nextTurn: () => void;
  addScore: (points: number) => void;
  resetScores: () => void;
}

const PlayersContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "oy-players-v1";
const COLORS = [
  "oklch(0.72 0.18 55)",
  "oklch(0.65 0.18 250)",
  "oklch(0.7 0.18 150)",
  "oklch(0.7 0.2 350)",
  "oklch(0.75 0.16 100)",
  "oklch(0.65 0.2 300)",
];

function uid() { return Math.random().toString(36).slice(2, 9); }

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.players)) {
          setPlayers(parsed.players);
          setCurrentId(parsed.currentId ?? parsed.players[0]?.id ?? null);
        }
      } else {
        const p1: Player = { id: uid(), name: "Player 1", color: COLORS[0], score: 0 };
        setPlayers([p1]);
        setCurrentId(p1.id);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, currentId })); } catch {}
  }, [players, currentId, hydrated]);

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) => {
      const np: Player = { id: uid(), name: trimmed, color: COLORS[prev.length % COLORS.length], score: 0 };
      const next = [...prev, np];
      setCurrentId((c) => c ?? np.id);
      return next;
    });
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setCurrentId((c) => (c === id ? next[0]?.id ?? null : c));
      return next;
    });
  }, []);

  const setCurrent = useCallback((id: string) => setCurrentId(id), []);

  const nextTurn = useCallback(() => {
    setPlayers((prev) => {
      if (prev.length === 0) return prev;
      setCurrentId((c) => {
        const i = prev.findIndex((p) => p.id === c);
        return prev[(i + 1) % prev.length].id;
      });
      return prev;
    });
  }, []);

  const addScore = useCallback((points: number) => {
    setCurrentId((c) => {
      if (!c) return c;
      setPlayers((prev) => prev.map((p) => (p.id === c ? { ...p, score: p.score + points } : p)));
      return c;
    });
  }, []);

  const resetScores = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  }, []);

  const current = useMemo(() => players.find((p) => p.id === currentId) ?? null, [players, currentId]);

  const value: Ctx = { players, currentId, current, addPlayer, removePlayer, setCurrent, nextTurn, addScore, resetScores };
  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error("usePlayers must be used within PlayersProvider");
  return ctx;
}
