import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { AgeGroup, shuffle } from "@/data/words";
import { Check, X, RotateCw } from "lucide-react";
import { usePlayers } from "@/context/PlayersContext";
import { useWords } from "@/context/WordsContext";
import { WordIcon } from "@/components/WordIcon";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Vocabulary Quiz — Over Yonder Game Hub" },
      { name: "description", content: "Quiz de vocabulário em inglês com tradução." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const [age, setAge] = useState<AgeGroup>("kids");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const { addScore, nextTurn, players, current } = usePlayers();
  const { words } = useWords();
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});

  const questions = useMemo(() => shuffle(words[age]).slice(0, 10), [age, words]);
  const currentQ = questions[round];

  const options = useMemo(() => {
    if (!currentQ) return [];
    const others = shuffle(words[age].filter((w) => w.word !== currentQ.word)).slice(0, 3);
    return shuffle([currentQ, ...others]).map((w) => w.translation);
  }, [currentQ, age, words]);

  useEffect(() => { setRound(0); setScore(0); setPicked(null); setPlayerScores({}); }, [age]);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === currentQ.translation) {
      setScore((s) => s + 1);
      addScore(1);
      if (current) {
        setPlayerScores((ps) => ({ ...ps, [current.id]: (ps[current.id] ?? 0) + 1 }));
      }
    }
    setTimeout(() => {
      setPicked(null);
      setRound((r) => r + 1);
      if (players.length > 1) nextTurn();
    }, 900);
  };

  const finished = round >= questions.length;
  const reset = () => { setRound(0); setScore(0); setPicked(null); setPlayerScores({}); };

  const ranking = useMemo(() => {
    return [...players]
      .map((p) => ({ ...p, roundScore: playerScores[p.id] ?? 0 }))
      .sort((a, b) => b.roundScore - a.roundScore);
  }, [players, playerScores]);
  const topScore = ranking[0]?.roundScore ?? 0;

  return (
    <GameShell title="Vocabulary Quiz" emoji="🧠" description="Escolha a tradução correta da palavra em inglês" age={age} onAgeChange={setAge}>
      <div className="max-w-2xl mx-auto">
        {finished ? (
          <div className="rounded-3xl p-8 sm:p-10 text-center animate-pop" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-3xl font-bold mb-1">Quiz finalizado!</h2>
            <p className="text-muted-foreground mb-6">Total de {questions.length} perguntas</p>

            {players.length > 1 ? (
              <div className="text-left mb-6">
                <div className="text-sm font-semibold text-muted-foreground mb-3 text-center">🏅 Placar dos jogadores</div>
                <ul className="space-y-2">
                  {ranking.map((p, i) => {
                    const isWinner = p.roundScore === topScore && topScore > 0;
                    return (
                      <li key={p.id}
                        className={"flex items-center justify-between p-3 rounded-xl border-2 " + (isWinner ? "border-primary bg-primary/10" : "border-border bg-card/50")}>
                        <div className="flex items-center gap-3">
                          <span className="w-7 text-center font-bold text-muted-foreground">{i + 1}º</span>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: p.color }}>
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-semibold">{p.name}</span>
                          {isWinner && <span className="text-lg">👑</span>}
                        </div>
                        <div className="font-bold text-primary text-lg">
                          {p.roundScore} <span className="text-xs text-muted-foreground font-normal">/ {questions.length}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground mb-6">Você acertou <span className="text-primary font-bold text-2xl">{score}</span> de {questions.length}</p>
            )}

            <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-orange)" }}>
              <RotateCw className="h-4 w-4" /> Jogar novamente
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 text-sm font-semibold">
              <span className="text-muted-foreground">Pergunta {round + 1}/{questions.length}</span>
              <span className="text-primary">⭐ {score} pts</span>
            </div>
            <div className="h-2 rounded-full bg-muted mb-6 overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${(round / questions.length) * 100}%`, background: "var(--gradient-orange)" }} />
            </div>
            <div className="rounded-3xl p-8 sm:p-12 text-center mb-6 animate-pop" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
              <div className="mb-3 flex justify-center"><WordIcon entry={currentQ} size={72} /></div>
              <div className="text-sm text-muted-foreground mb-1">O que significa</div>
              <div className="text-4xl sm:text-5xl font-bold text-primary">{currentQ.word}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt) => {
                const isCorrect = opt === currentQ.translation;
                const isPicked = picked === opt;
                let style = "border-border bg-card hover:border-primary hover:bg-muted";
                if (picked) {
                  if (isCorrect) style = "border-[oklch(0.7_0.18_150)] bg-[oklch(0.7_0.18_150/0.15)]";
                  else if (isPicked) style = "border-destructive bg-destructive/15 animate-shake";
                  else style = "border-border bg-card opacity-50";
                }
                return (
                  <button key={opt} onClick={() => choose(opt)} disabled={!!picked}
                    className={`p-4 rounded-xl border-2 text-left font-semibold transition-all flex items-center justify-between ${style}`}>
                    <span>{opt}</span>
                    {picked && isCorrect && <Check className="h-5 w-5 text-[oklch(0.7_0.18_150)]" />}
                    {picked && isPicked && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}