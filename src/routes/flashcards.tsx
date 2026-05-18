import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { AgeGroup, shuffle } from "@/data/words";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useWords } from "@/context/WordsContext";
import { WordIcon } from "@/components/WordIcon";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Over Yonder Game Hub" },
      { name: "description", content: "Estude vocabulário em inglês com flashcards interativos." },
    ],
  }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const [age, setAge] = useState<AgeGroup>("kids");
  const { words } = useWords();
  const deck = useMemo(() => shuffle(words[age]), [age, words]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setIdx(0); setFlipped(false); }, [age]);

  const card = deck[idx];
  const next = () => { setFlipped(false); setIdx((i) => (i + 1) % deck.length); };
  const prev = () => { setFlipped(false); setIdx((i) => (i - 1 + deck.length) % deck.length); };

  return (
    <GameShell title="Flashcards" emoji="✨" description="Clique no cartão para ver a tradução" age={age} onAgeChange={setAge} showTurn={false}>
      <div className="max-w-xl mx-auto">
        <div className="text-center text-sm text-muted-foreground mb-3 font-semibold">{idx + 1} / {deck.length}</div>
        <div className="[perspective:1200px] mb-6">
          <button onClick={() => setFlipped((f) => !f)}
            className="relative w-full aspect-[4/3] [transform-style:preserve-3d] transition-transform duration-500"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
            <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center [backface-visibility:hidden] p-6"
              style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
              <div className="mb-4 flex justify-center"><WordIcon entry={card} size={120} /></div>
              <div className="text-3xl sm:text-5xl font-bold text-primary">{card.word}</div>
              <div className="mt-4 text-xs text-muted-foreground">Toque para virar</div>
            </div>
            <div className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] p-6"
              style={{ background: "var(--gradient-orange)", color: "var(--navy-deep)" }}>
              <div className="text-sm font-semibold opacity-80 mb-2">Tradução</div>
              <div className="text-3xl sm:text-5xl font-bold mb-3">{card.translation}</div>
              <div className="text-sm opacity-80 italic">{card.hint}</div>
            </div>
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button onClick={prev} className="flex-1 inline-flex items-center justify-center gap-1 py-3 rounded-xl border border-border bg-card hover:border-primary font-semibold">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <button onClick={() => setFlipped((f) => !f)} className="px-4 py-3 rounded-xl border border-border bg-card hover:border-primary"><RotateCw className="h-4 w-4" /></button>
          <button onClick={next} className="flex-1 inline-flex items-center justify-center gap-1 py-3 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-orange)" }}>
            Próxima <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GameShell>
  );
}