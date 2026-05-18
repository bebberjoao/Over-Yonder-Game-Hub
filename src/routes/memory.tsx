import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { AgeGroup, shuffle } from "@/data/words";
import { RotateCw } from "lucide-react";
import { usePlayers } from "@/context/PlayersContext";
import { useWords } from "@/context/WordsContext";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Game — Over Yonder Game Hub" },
      { name: "description", content: "Combine palavras em inglês com sua tradução." },
    ],
  }),
  component: MemoryPage,
});

interface Card { id: string; key: string; label: string; type: "en" | "pt"; emoji?: string; }

function MemoryPage() {
  const [age, setAge] = useState<AgeGroup>("kids");
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const { addScore, nextTurn, players } = usePlayers();
  const { words } = useWords();

  const build = useMemo(() => () => {
    const picks = shuffle(words[age]).slice(0, 6);
    const c: Card[] = [];
    picks.forEach((w) => {
      c.push({ id: `${w.word}-en`, key: w.word, label: w.word, type: "en", emoji: w.emoji });
      c.push({ id: `${w.word}-pt`, key: w.word, label: w.translation, type: "pt" });
    });
    return shuffle(c);
  }, [age, words]);

  useEffect(() => {
    setCards(build());
    setFlipped([]); setMatched(new Set()); setMoves(0);
  }, [age, build]);

  const click = (id: string) => {
    if (flipped.includes(id) || matched.has(id) || flipped.length === 2) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => cards.find((c) => c.id === i)!);
      if (a.key === b.key && a.type !== b.type) {
        setTimeout(() => {
          setMatched((m) => new Set([...m, a.id, b.id]));
          setFlipped([]);
          addScore(1);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          if (players.length > 1) nextTurn();
        }, 900);
      }
    }
  };

  const won = cards.length > 0 && matched.size === cards.length;
  const reset = () => { setCards(build()); setFlipped([]); setMatched(new Set()); setMoves(0); };

  return (
    <GameShell title="Memory Game" emoji="🧩" description="Combine cada palavra com sua tradução" age={age} onAgeChange={setAge}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 text-sm font-semibold">
          <span className="text-muted-foreground">Movimentos: <span className="text-primary">{moves}</span></span>
          <span className="text-muted-foreground">Pares: <span className="text-primary">{matched.size / 2}/{cards.length / 2}</span></span>
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-primary hover:underline"><RotateCw className="h-4 w-4" /> Reiniciar</button>
        </div>
        {won && (
          <div className="rounded-2xl p-5 mb-4 text-center font-bold animate-pop" style={{ background: "var(--gradient-orange)", color: "var(--navy-deep)" }}>
            🎉 Parabéns! Você completou em {moves} movimentos!
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {cards.map((c) => {
            const isOpen = flipped.includes(c.id) || matched.has(c.id);
            const isMatched = matched.has(c.id);
            return (
              <button key={c.id} onClick={() => click(c.id)}
                className={`aspect-[3/4] rounded-2xl font-bold text-sm sm:text-base p-2 transition-all duration-300 ${
                  isOpen
                    ? isMatched
                      ? "bg-[oklch(0.7_0.18_150/0.2)] border-2 border-[oklch(0.7_0.18_150)]"
                      : "bg-card border-2 border-primary animate-pop"
                    : "border-2 border-border hover:border-primary/60 hover:-translate-y-0.5"
                }`}
                style={!isOpen ? { background: "var(--gradient-card)" } : {}}
              >
                {isOpen ? (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    {c.emoji && <span className="text-3xl">{c.emoji}</span>}
                    <span className={c.type === "en" ? "text-primary" : ""}>{c.label}</span>
                  </div>
                ) : (
                  <span className="text-3xl text-primary/60">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}