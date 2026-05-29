import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { AgePicker } from "./AgePicker";
import { AgeGroup } from "@/data/words";

interface Props {
  title: string;
  emoji: string;
  description: string;
  age: AgeGroup;
  onAgeChange: (a: AgeGroup) => void;
  children: ReactNode;
  showTurn?: boolean;
  onTurnChange?: () => void;
}

export function GameShell({ title, emoji, description, age, onAgeChange, children, showTurn = true, onTurnChange }: Props) {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/40 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Hub
          </Link>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{emoji}</span> {title}
            </h1>
          </div>
          <div className="w-12" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm sm:text-base mb-4">{description}</p>
          <AgePicker value={age} onChange={onAgeChange} />
        </div>
        {/* PlayersBar removed per request */}
        {children}
      </main>
    </div>
  );
}