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
  setCurrent: (id: string) => void;
  addScore: (points: number) => void;
  resetScores: () => void;
  nextTurn: () => void; // noop kept for compatibility
}

const PlayersContext = createContext<Ctx | null>(null);

function uid() { return Math.random().toString(36).slice(2, 9); }

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize single player
    const p1: Player = { id: uid(), name: "Player 1", color: "oklch(0.72 0.18 55)", score: 0 };
    setPlayers([p1]);
    setCurrentId(p1.id);
  }, []);

  const setCurrent = useCallback((id: string) => setCurrentId(id), []);

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

  const nextTurn = useCallback(() => {
    // Multiplayer removed: noop
  }, []);

  const current = useMemo(() => players.find((p) => p.id === currentId) ?? null, [players, currentId]);

  const value: Ctx = { players, currentId, current, setCurrent, addScore, resetScores, nextTurn };
  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error("usePlayers must be used within PlayersProvider");
  return ctx;
}
