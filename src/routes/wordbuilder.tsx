import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { AgeGroup, shuffle } from "@/data/words";
import { Delete, RotateCw, Check } from "lucide-react";
import { usePlayers } from "@/context/PlayersContext";
import { useWords } from "@/context/WordsContext";
import { WordIcon } from "@/components/WordIcon";

export const Route = createFileRoute("/wordbuilder")({
  head: () => ({
    meta: [
      { title: "Word Builder — Over Yonder Game Hub" },
      { name: "description", content: "Forme a palavra em inglês a partir das letras embaralhadas." },
    ],
  }),
  component: WordBuilderPage,
});

function WordBuilderPage() {
  const [age, setAge] = useState<AgeGroup>("kids");
  const [seed, setSeed] = useState(0);
  const [score, setScore] = useState(0);
  const { addScore, nextTurn, players } = usePlayers();
  const { words } = useWords();
  const word = useMemo(() => shuffle(words[age])[0], [age, seed, words]);

  const pool = useMemo(() => {
    const extras = shuffle(["a","e","i","o","u","r","s","t","l","n","m"].filter((l) => !word.word.includes(l))).slice(0, 3);
    return shuffle([...word.word.split(""), ...extras]).map((ch, i) => ({ id: ch + "-" + i, ch }));
  }, [word]);

  const [picked, setPicked] = useState<{ id: string; ch: string }[]>([]);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");

  useEffect(() => { setPicked([]); setStatus("idle"); }, [word]);

  const add = (l: { id: string; ch: string }) => {
    if (status !== "idle") return;
    if (picked.some((p) => p.id === l.id)) return;
    setPicked((p) => [...p, l]);
  };
  const removeAt = (i: number) => { setStatus("idle"); setPicked((p) => p.filter((_, j) => j !== i)); };
  const clear = () => { setPicked([]); setStatus("idle"); };

  const check = () => {
    const guess = picked.map((p) => p.ch).join("");
    if (guess === word.word) {
      setStatus("right");
      setScore((s) => s + 1);
      addScore(1);
      setTimeout(() => setSeed((s) => s + 1), 1100);
    } else {
      setStatus("wrong");
      setTimeout(() => {
        setStatus("idle");
        setPicked([]);
        if (players.length > 1) nextTurn();
      }, 800);
    }
  };

  return (
    <GameShell title="Word Builder" emoji="🔤" description="Forme a palavra em inglês usando as letras" age={age} onAgeChange={setAge}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4 text-sm font-semibold">
          <span className="text-muted-foreground">Pontos: <span className="text-primary text-base">⭐ {score}</span></span>
          <button onClick={() => setSeed((s) => s + 1)} className="inline-flex items-center gap-1.5 text-primary hover:underline">
            <RotateCw className="h-4 w-4" /> Pular
          </button>
        </div>
        <div className="rounded-3xl p-6 sm:p-10 text-center mb-6" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
          <div className="mb-3 flex justify-center"><WordIcon entry={word} size={84} /></div>
          <div className="text-sm text-muted-foreground mb-1">Significa</div>
          <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{word.translation}</div>
          <div className="text-xs text-muted-foreground italic mb-6">{word.hint}</div>

          <div className={"min-h-[64px] flex flex-wrap justify-center gap-2 mb-2 p-3 rounded-2xl border-2 border-dashed " + (
            status === "right" ? "border-[oklch(0.7_0.18_150)] bg-[oklch(0.7_0.18_150/0.1)]" :
            status === "wrong" ? "border-destructive bg-destructive/10 animate-shake" :
            "border-border"
          )}>
            {picked.length === 0 && <span className="text-muted-foreground self-center text-sm">Toque nas letras abaixo</span>}
            {picked.map((p, i) => (
              <button key={p.id} onClick={() => removeAt(i)}
                className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-primary text-primary-foreground font-bold text-xl uppercase animate-pop">
                {p.ch}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {pool.map((l) => {
            const used = picked.some((p) => p.id === l.id);
            return (
              <button key={l.id} onClick={() => add(l)} disabled={used || status !== "idle"}
                className={"w-11 h-12 sm:w-14 sm:h-14 rounded-lg font-bold text-xl uppercase transition-all " + (
                  used ? "opacity-30 bg-muted" : "bg-card border-2 border-border hover:border-primary hover:-translate-y-0.5"
                )}>
                {l.ch}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={clear} className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card hover:border-primary font-semibold">
            <Delete className="h-4 w-4" /> Limpar
          </button>
          <button onClick={check} disabled={picked.length === 0 || status !== "idle"}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-primary-foreground disabled:opacity-50"
            style={{ background: "var(--gradient-orange)" }}>
            <Check className="h-4 w-4" /> Verificar
          </button>
        </div>
      </div>
    </GameShell>
  );
}