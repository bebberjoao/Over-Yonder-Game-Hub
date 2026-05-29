import { usePlayers } from "@/context/PlayersContext";
import { Users, RefreshCw } from "lucide-react";

interface Props {
  showTurn?: boolean;
  onTurnChange?: () => void;
}

export function PlayersBar({ showTurn = true, onTurnChange }: Props) {
  const { players, current, setCurrent, resetScores } = usePlayers();

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-3 sm:p-4 mb-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="h-4 w-4" /> Jogadores ({players.length})
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={resetScores} title="Zerar pontuações"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Zerar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <div key={p.id} className="group relative inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl border-2 border-border">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-sm font-semibold">{p.name}</span>
            <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg bg-background/60 border border-border">
              ⭐ {p.score}
            </span>
          </div>
        ))}
      </div>
      {/* Multiplayer removed */}
      {showTurn && current && (
        <div className="mt-3 text-xs text-center text-muted-foreground">
          Jogando: <span className="font-bold" style={{ color: current.color }}>{current.name}</span>
        </div>
      )}
    </div>
  );
}
