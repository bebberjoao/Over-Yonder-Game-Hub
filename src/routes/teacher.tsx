import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, GraduationCap, LogOut, Plus, Trash2, Save, RotateCw, Download, Upload, Lock } from "lucide-react";
import { AgePicker } from "@/components/AgePicker";
import { WordIcon } from "@/components/WordIcon";
import { useWords } from "@/context/WordsContext";
import { AgeGroup, WordEntry, ageLabels } from "@/data/words";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Area — Over Yonder Game Hub" },
      { name: "description", content: "Área do professor para cadastrar palavras e ícones de cada categoria." },
    ],
  }),
  component: TeacherPage,
});

const AUTH_KEY = "oy-teacher-auth-v1";
const PASS_KEY = "oy-teacher-pass-v1";
const DEFAULT_PASS = "123";

function TeacherPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/40 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Hub
          </Link>
          <div className="w-12 flex justify-end">
            {authed && (
              <button
                onClick={() => { try { localStorage.removeItem(AUTH_KEY); } catch {} setAuthed(false); }}
                title="Sair"
                className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {authed ? <TeacherDashboard /> : <LoginForm onAuthed={() => setAuthed(true)} />}
      </main>
    </div>
  );
}

function LoginForm({ onAuthed }: { onAuthed: () => void }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let stored = DEFAULT_PASS;
    try { stored = localStorage.getItem(PASS_KEY) || DEFAULT_PASS; } catch {}
    if (pass === stored) {
      try { localStorage.setItem(AUTH_KEY, "1"); } catch {}
      onAuthed();
    } else {
      setErr("Senha incorreta");
    }
  };

  return (
    <div className="max-w-sm mx-auto rounded-3xl p-8 animate-pop" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
      <div className="text-center mb-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-3" style={{ background: "var(--gradient-orange)" }}>
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Login do Professor</h2>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={pass}
          onChange={(e) => { setPass(e.target.value); setErr(""); }}
          placeholder="Senha"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none"
          autoFocus
        />
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button type="submit" className="w-full py-3 rounded-xl font-bold text-primary-foreground" style={{ background: "var(--gradient-orange)" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

function TeacherDashboard() {
  const { words, addWord, updateWord, removeWord, resetAge, exportJson, importJson } = useWords();
  const [age, setAge] = useState<AgeGroup>("kids");
  const list = words[age];

  const totals = useMemo(() => ({
    kids: words.kids.length, teens: words.teens.length, adults: words.adults.length,
  }), [words]);

  // New word draft
  const empty: WordEntry = { word: "", translation: "", hint: "", emoji: "✨", iconUrl: "" };
  const [draft, setDraft] = useState<WordEntry>(empty);

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.word.trim() || !draft.translation.trim()) return;
    addWord(age, {
      word: draft.word.trim().toLowerCase(),
      translation: draft.translation.trim(),
      hint: draft.hint.trim() || draft.translation.trim(),
      emoji: draft.emoji.trim() || "✨",
      iconUrl: draft.iconUrl?.trim() || undefined,
    });
    setDraft(empty);
  };

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "over-yonder-words.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJson(String(reader.result || ""));
      alert(ok ? "Importado com sucesso!" : "JSON inválido.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const changePassword = () => {
    const next = prompt("Nova senha (mínimo 4 caracteres):");
    if (!next) return;
    if (next.length < 4) { alert("Senha muito curta."); return; }
    try { localStorage.setItem(PASS_KEY, next); alert("Senha alterada!"); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-4 sm:p-5 border border-border bg-card/60 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Categoria</div>
          <div className="mt-2"><AgePicker value={age} onChange={setAge} /></div>
        </div>
        <div className="flex gap-2 text-xs sm:text-sm flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-muted">Kids: <b>{totals.kids}</b></span>
          <span className="px-3 py-1.5 rounded-full bg-muted">Teens: <b>{totals.teens}</b></span>
          <span className="px-3 py-1.5 rounded-full bg-muted">Adults: <b>{totals.adults}</b></span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={doExport} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary text-sm font-semibold">
            <Download className="h-4 w-4" /> Exportar JSON
          </button>
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary text-sm font-semibold cursor-pointer">
            <Upload className="h-4 w-4" /> Importar
            <input type="file" accept="application/json" className="hidden" onChange={doImport} />
          </label>
          <button onClick={() => { if (confirm(`Restaurar palavras padrão de ${ageLabels[age]}?`)) resetAge(age); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-destructive hover:text-destructive text-sm font-semibold">
            <RotateCw className="h-4 w-4" /> Restaurar
          </button>
          <button onClick={changePassword} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary text-sm font-semibold">
            <Lock className="h-4 w-4" /> Senha
          </button>
        </div>
      </div>

      <form onSubmit={submitNew} className="rounded-2xl p-4 sm:p-5 border border-border bg-card/60">
        <div className="font-bold mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Nova palavra em {ageLabels[age]}</div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input value={draft.word} onChange={(e) => setDraft({ ...draft, word: e.target.value })}
            placeholder="Palavra (EN)" className="px-3 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none" />
          <input value={draft.translation} onChange={(e) => setDraft({ ...draft, translation: e.target.value })}
            placeholder="Tradução (PT)" className="px-3 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none" />
          <input value={draft.hint} onChange={(e) => setDraft({ ...draft, hint: e.target.value })}
            placeholder="Dica" className="px-3 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none" />
          <input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
            placeholder="Emoji" className="px-3 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none text-center" />
          <input value={draft.iconUrl || ""} onChange={(e) => setDraft({ ...draft, iconUrl: e.target.value })}
            placeholder="URL do ícone (opcional)" className="px-3 py-2 rounded-lg border-2 border-border bg-background focus:border-primary outline-none" />
        </div>
        <div className="flex justify-end mt-3">
          <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-primary-foreground" style={{ background: "var(--gradient-orange)" }}>
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {list.length === 0 && (
          <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">Nenhuma palavra cadastrada.</div>
        )}
        {list.map((entry, i) => (
          <WordRow key={i} entry={entry}
            onSave={(e) => updateWord(age, i, e)}
            onDelete={() => { if (confirm(`Remover "${entry.word}"?`)) removeWord(age, i); }}
          />
        ))}
      </div>
    </div>
  );
}

function WordRow({ entry, onSave, onDelete }: { entry: WordEntry; onSave: (e: WordEntry) => void; onDelete: () => void; }) {
  const [e, setE] = useState<WordEntry>(entry);
  const [editing, setEditing] = useState(false);
  useEffect(() => { setE(entry); }, [entry]);

  const save = () => {
    onSave({
      word: e.word.trim().toLowerCase(),
      translation: e.translation.trim(),
      hint: e.hint.trim(),
      emoji: e.emoji.trim() || "✨",
      iconUrl: e.iconUrl?.trim() || undefined,
    });
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/60 hover:border-primary/60 transition-colors">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-background shrink-0">
          <WordIcon entry={entry} size={40} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-primary truncate">{entry.word}</div>
          <div className="text-sm text-muted-foreground truncate">{entry.translation} — <span className="italic">{entry.hint}</span></div>
        </div>
        <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-border hover:border-primary">Editar</button>
        <button onClick={onDelete} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border-2 border-primary bg-card/80 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input value={e.word} onChange={(ev) => setE({ ...e, word: ev.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" placeholder="EN" />
        <input value={e.translation} onChange={(ev) => setE({ ...e, translation: ev.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" placeholder="PT" />
        <input value={e.hint} onChange={(ev) => setE({ ...e, hint: ev.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" placeholder="Dica" />
        <input value={e.emoji} onChange={(ev) => setE({ ...e, emoji: ev.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none text-center" placeholder="Emoji" />
        <input value={e.iconUrl || ""} onChange={(ev) => setE({ ...e, iconUrl: ev.target.value })}
          className="px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none" placeholder="URL ícone" />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => { setE(entry); setEditing(false); }} className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-border">Cancelar</button>
        <button onClick={save} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-orange)" }}>
          <Save className="h-4 w-4" /> Salvar
        </button>
      </div>
    </div>
  );
}