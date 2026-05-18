import { useState } from "react";
import { usePlayers } from "@/context/PlayersContext";
import { Users, Plus, X, RefreshCw, ArrowRightLeft } from "lucide-react";

interface Props {
  showTurn?: boolean;
  onTurnChange?: () => void;
}

export function PlayersBar({ showTurn = true, onTurnChange }: Props) {
  const { players, current, addPlayer, removePlayer, setCurrent, nextTurn, resetScores } = usePlayers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addPlayer(name);
    setName("");
  };

  const handleNext = () => {
    nextTurn();
    onTurnChange?.();
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-3 sm:p-4 mb-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="h-4 w-4" /> Jogadores ({players.length})
        </div>
        <div className="flex items-center gap-1.5">
          {showTurn && players.length > 1 && (
            <button onClick={handleNext} title="Passar a vez"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Próx. vez
            </button>
          )}
          <button onClick={resetScores} title="Zerar pontuações"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Zerar
          </button>
          <button onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-orange)" }}>
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {players.map((p) => {
          const isCurrent = showTurn && current?.id === p.id;
          return (
            <button key={p.id} onClick={() => setCurrent(p.id)}
              className={`group relative inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl border-2 transition-all ${
                isCurrent ? "border-primary shadow-[var(--shadow-glow)] -translate-y-0.5" : "border-border hover:border-primary/50"
              }`}
              style={{ background: isCurrent ? "color-mix(in oklab, " + p.color + " 18%, transparent)" : undefined }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
              <span className="text-sm font-semibold">{p.name}</span>
              <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg bg-background/60 border border-border">
                ⭐ {p.score}
              </span>
              {players.length > 1 && (
                <span onClick={(e) => { e.stopPropagation(); removePlayer(p.id); }}
                  role="button"
                  className="ml-0.5 h-5 w-5 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <form onSubmit={submit} className="mt-3 flex gap-2 animate-pop">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do jogador"
            maxLength={16}
            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
          <button type="submit" className="px-4 py-2 rounded-lg font-semibold text-primary-foreground text-sm" style={{ background: "var(--gradient-orange)" }}>
            Adicionar
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg border border-border text-sm">
            Cancelar
          </button>
        </form>
      )}

      {showTurn && current && players.length > 1 && (
        <div className="mt-3 text-xs text-center text-muted-foreground">
          Vez de <span className="font-bold" style={{ color: current.color }}>{current.name}</span>
        </div>
      )}
    </div>
  );
}
