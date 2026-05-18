import { AgeGroup, ageLabels } from "@/data/words";

interface Props {
  value: AgeGroup;
  onChange: (v: AgeGroup) => void;
}

const emojis: Record<AgeGroup, string> = { kids: "🧒", teens: "🧑", adults: "🧑‍💼" };

export function AgePicker({ value, onChange }: Props) {
  return (
    <div className="inline-flex flex-wrap gap-2 p-1.5 rounded-2xl bg-secondary border border-border">
      {(Object.keys(ageLabels) as AgeGroup[]).map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all ${
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-foreground/80 hover:text-foreground hover:bg-muted"
            }`}
          >
            <span className="mr-1.5">{emojis[g]}</span>
            {ageLabels[g]}
          </button>
        );
      })}
    </div>
  );
}