export type AgeGroup = "kids" | "teens" | "adults";

export interface WordEntry {
  word: string;
  translation: string;
  hint: string;
  emoji: string;
  iconUrl?: string;
}

export const defaultWordsByAge: Record<AgeGroup, WordEntry[]> = {
  kids: [
    { word: "cat", translation: "gato", hint: "Animal de estimação que mia", emoji: "🐱" },
    { word: "dog", translation: "cachorro", hint: "Melhor amigo do homem", emoji: "🐶" },
    { word: "apple", translation: "maçã", hint: "Fruta vermelha ou verde", emoji: "🍎" },
    { word: "sun", translation: "sol", hint: "Brilha durante o dia", emoji: "☀️" },
    { word: "book", translation: "livro", hint: "Tem páginas e histórias", emoji: "📖" },
    { word: "ball", translation: "bola", hint: "Você joga com ela", emoji: "⚽" },
    { word: "milk", translation: "leite", hint: "Bebida branca", emoji: "🥛" },
    { word: "fish", translation: "peixe", hint: "Vive na água", emoji: "🐟" },
    { word: "bird", translation: "pássaro", hint: "Voa no céu", emoji: "🐦" },
    { word: "star", translation: "estrela", hint: "Brilha no céu à noite", emoji: "⭐" },
    { word: "tree", translation: "árvore", hint: "Tem folhas e galhos", emoji: "🌳" },
    { word: "moon", translation: "lua", hint: "Aparece à noite", emoji: "🌙" },
  ],
  teens: [
    { word: "school", translation: "escola", hint: "Lugar onde estudamos", emoji: "🏫" },
    { word: "friend", translation: "amigo", hint: "Alguém especial", emoji: "🤝" },
    { word: "music", translation: "música", hint: "Você ouve com fones", emoji: "🎵" },
    { word: "movie", translation: "filme", hint: "Assistido no cinema", emoji: "🎬" },
    { word: "phone", translation: "telefone", hint: "Você o usa para ligar", emoji: "📱" },
    { word: "travel", translation: "viajar", hint: "Conhecer novos lugares", emoji: "✈️" },
    { word: "dream", translation: "sonho", hint: "Acontece quando você dorme", emoji: "💭" },
    { word: "sport", translation: "esporte", hint: "Atividade física", emoji: "🏀" },
    { word: "future", translation: "futuro", hint: "O que está por vir", emoji: "🚀" },
    { word: "happy", translation: "feliz", hint: "Sentimento positivo", emoji: "😊" },
    { word: "summer", translation: "verão", hint: "Estação quente", emoji: "🌞" },
    { word: "beach", translation: "praia", hint: "Areia e mar", emoji: "🏖️" },
  ],
  adults: [
    { word: "business", translation: "negócio", hint: "Atividade comercial", emoji: "💼" },
    { word: "meeting", translation: "reunião", hint: "Encontro de trabalho", emoji: "👥" },
    { word: "deadline", translation: "prazo", hint: "Data limite de entrega", emoji: "⏰" },
    { word: "invest", translation: "investir", hint: "Aplicar dinheiro", emoji: "📈" },
    { word: "career", translation: "carreira", hint: "Trajetória profissional", emoji: "🎯" },
    { word: "growth", translation: "crescimento", hint: "Desenvolvimento", emoji: "🌱" },
    { word: "manage", translation: "gerenciar", hint: "Administrar algo", emoji: "📊" },
    { word: "report", translation: "relatório", hint: "Documento com resultados", emoji: "📄" },
    { word: "client", translation: "cliente", hint: "Quem compra ou contrata", emoji: "🤵" },
    { word: "budget", translation: "orçamento", hint: "Plano financeiro", emoji: "💰" },
    { word: "leader", translation: "líder", hint: "Quem comanda equipes", emoji: "🧑‍💼" },
    { word: "global", translation: "global", hint: "Em todo o mundo", emoji: "🌍" },
  ],
};

// Backwards-compat export. Prefer `useWords()` from WordsContext to get
// the live (teacher-edited) version persisted in localStorage.
export const wordsByAge = defaultWordsByAge;

export const ageLabels: Record<AgeGroup, string> = {
  kids: "Kids",
  teens: "Teens",
  adults: "Adults",
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}