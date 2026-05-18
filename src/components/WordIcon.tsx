import { WordEntry } from "@/data/words";

interface Props {
  entry: Pick<WordEntry, "emoji" | "iconUrl" | "word">;
  className?: string;
  size?: number;
}

export function WordIcon({ entry, className = "", size = 96 }: Props) {
  if (entry.iconUrl) {
    return (
      <img
        src={entry.iconUrl}
        alt={entry.word}
        className={"inline-block object-contain " + className}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  return <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>{entry.emoji}</span>;
}