import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Layers, Type, Sparkles, Shuffle, ArrowRight, GraduationCap } from "lucide-react";
import logo from "../../images/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Game Hub — Over Yonder English School" },
      { name: "description", content: "Aprenda inglês jogando: quiz, memória, forca, flashcards e formação de palavras. Para Kids, Teens e Adults." },
      { property: "og:title", content: "Over Yonder Game Hub" },
      { property: "og:description", content: "Jogos para aprender inglês de forma divertida." },
    ],
  }),
  component: Index,
});

const games = [
  { to: "/quiz", title: "Vocabulary Quiz", desc: "Escolha a tradução correta", icon: Brain, color: "from-orange-500 to-orange-400" },
  { to: "/memory", title: "Memory Game", desc: "Combine palavra e tradução", icon: Layers, color: "from-blue-500 to-blue-400" },
  { to: "/hangman", title: "Hangman", desc: "Adivinhe a palavra letra por letra", icon: Type, color: "from-orange-500 to-orange-400" },
  { to: "/flashcards", title: "Flashcards", desc: "Estude com cartões interativos", icon: Sparkles, color: "from-blue-500 to-blue-400" },
  { to: "/wordbuilder", title: "Word Builder", desc: "Forme palavras com as letras", icon: Shuffle, color: "from-orange-500 to-orange-400" },
] as const;

function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-float">🎮</div>
        <div className="absolute top-32 right-16 text-5xl animate-float" style={{ animationDelay: "1s" }}>🌍</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-float" style={{ animationDelay: "2s" }}>📚</div>
        <div className="absolute bottom-32 right-10 text-6xl animate-float" style={{ animationDelay: "0.5s" }}>✨</div>
      </div>

      <header className="relative max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Over Yonder logo" width={84} height={60} className="object-contain" style={{ background: "transparent" }} />
          <div className="leading-tight">
            <div className="font-bold text-base sm:text-lg">Over Yonder</div>
            <div className="text-xs text-muted-foreground">English School</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/30">
            🎮 Game Hub
          </span>
        </div>
      </header>

      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-5">
          Learn English by{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-orange)" }}>
            Playing
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          5 jogos divertidos para Kids, Teens e Adults. Pratique vocabulário, melhore sua memória e aprenda enquanto se diverte. ✨
        </p>
      </section>

      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {games.map((g, i) => {
            const Icon = g.icon;
            return (
              <Link
                key={g.to}
                to={g.to}
                className="group relative rounded-2xl p-6 border border-border hover:border-primary/60 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-card)", animation: `pop 0.4s ease-out ${i * 0.05}s both` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ background: i % 2 === 0 ? "var(--gradient-orange)" : "linear-gradient(135deg, oklch(0.45 0.15 260), oklch(0.6 0.18 250))" }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold mb-1">{g.title}</h3>
                <p className="text-sm text-muted-foreground">{g.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs sm:text-sm text-muted-foreground border-t border-border/50">
        © {new Date().getFullYear()} Over Yonder English School — Game Hub
      </footer>
    </div>
  );
}
