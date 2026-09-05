import type { CountryConfig } from "./countries";

export type Values = Record<string, string | boolean>;

export type VisaDraft = {
  id: string;
  country: string;
  label: string;
  values: Values;
  updatedAt: string;
};

const KEY = "visa-prep-drafts-v1";

export function loadDrafts(): VisaDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as VisaDraft[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(drafts: VisaDraft[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(drafts.slice(0, 50)));
  } catch {
    /* storage full — ignore */
  }
}

export function draftLabel(values: Values) {
  const name = [values["givenNames"], values["surname"]].filter(Boolean).join(" ").trim();
  return name || "Untitled applicant";
}

export function saveDraft(draft: VisaDraft) {
  const next = [
    { ...draft, updatedAt: new Date().toISOString() },
    ...loadDrafts().filter((d) => d.id !== draft.id),
  ];
  persist(next);
  return next;
}

export function deleteDraft(id: string) {
  const next = loadDrafts().filter((d) => d.id !== id);
  persist(next);
  return next;
}

export function getDraft(id: string) {
  return loadDrafts().find((d) => d.id === id);
}

export function newDraftId() {
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Share of required fields that carry a value. */
export function completion(country: CountryConfig, values: Values) {
  const req = country.sections.flatMap((s) => s.fields.filter((f) => f.required));
  if (req.length === 0) return 1;
  const done = req.filter((f) => {
    const v = values[f.id];
    return f.type === "checkbox" ? v === true : typeof v === "string" && v.trim() !== "";
  }).length;
  return done / req.length;
}

export function missingRequired(country: CountryConfig, values: Values) {
  return country.sections.flatMap((s) =>
    s.fields
      .filter((f) => {
        if (!f.required) return false;
        const v = values[f.id];
        return f.type === "checkbox" ? v !== true : !(typeof v === "string" && v.trim());
      })
      .map((f) => ({ section: s.title, sectionId: s.id, label: f.label })),
  );
}
