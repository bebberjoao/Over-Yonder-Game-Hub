import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { AgeGroup, shuffle } from "@/data/words";
import { RotateCw } from "lucide-react";
import { usePlayers } from "@/context/PlayersContext";
import { useWords } from "@/context/WordsContext";
import { WordIcon } from "@/components/WordIcon";

export const Route = createFileRoute("/hangman")({
  head: () => ({
    meta: [
      { title: "Hangman — Over Yonder Game Hub" },
      { name: "description", content: "Adivinhe a palavra em inglês letra por letra." },
    ],
  }),
  component: HangmanPage,
});

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const MAX = 6;

function HangmanPage() {
  const [age, setAge] = useState<AgeGroup>("kids");
  const [seed, setSeed] = useState(0);
  const { words } = useWords();
  const word = useMemo(() => shuffle(words[age])[0], [age, seed, words]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const { addScore, nextTurn, players } = usePlayers();
  const [awarded, setAwarded] = useState(false);

  useEffect(() => { setGuessed(new Set()); setAwarded(false); }, [word]);

  const wrong = [...guessed].filter((l) => !word.word.includes(l));
  const won = word.word.split("").every((l) => guessed.has(l));
  const lost = wrong.length >= MAX;
  const ended = won || lost;

  useEffect(() => {
    if (won && !awarded) {
      addScore(1);
      setAwarded(true);
    }
  }, [won, awarded, addScore]);

  const guess = (l: string) => {
    if (ended || guessed.has(l)) return;
    setGuessed((g) => new Set([...g, l]));
    if (!word.word.includes(l) && players.length > 1) nextTurn();
  };

  const next = () => setSeed((s) => s + 1);

  return (
    <GameShell title="Hangman" emoji="🎯" description="Adivinhe a palavra antes de errar 6 vezes" age={age} onAgeChange={setAge}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl p-6 sm:p-10 text-center mb-6" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
          <div className="text-sm text-muted-foreground mb-2">Dica: {word.hint}</div>
          <div className="mb-4 flex justify-center"><WordIcon entry={word} size={72} /></div>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
            {word.word.split("").map((l, i) => (
              <div key={i} className="w-9 h-12 sm:w-12 sm:h-14 border-b-4 border-primary flex items-center justify-center text-2xl sm:text-3xl font-bold">
                {guessed.has(l) || lost ? l.toUpperCase() : ""}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: MAX }).map((_, i) => (
              <span key={i} className={`text-2xl ${i < wrong.length ? "" : "opacity-20"}`}>❤️</span>
            ))}
          </div>
          {ended && (
            <div className="mt-5 animate-pop">
              <div className="text-2xl font-bold mb-3">{won ? "🎉 Você venceu!" : `💔 A palavra era "${word.word}"`}</div>
              <button onClick={next} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-orange)" }}>
                <RotateCw className="h-4 w-4" /> Próxima palavra
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {ALPHABET.map((l) => {
            const used = guessed.has(l);
            const correct = used && word.word.includes(l);
            const wrongL = used && !word.word.includes(l);
            return (
              <button key={l} onClick={() => guess(l)} disabled={used || ended}
                className={`aspect-square rounded-lg font-bold uppercase transition-all text-sm sm:text-base ${
                  correct ? "bg-[oklch(0.7_0.18_150)] text-white" :
                  wrongL ? "bg-destructive/40 text-foreground/40" :
                  "bg-card border border-border hover:border-primary hover:bg-muted"
                }`}>
                {l}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}