import { clone, type Agreement } from "./agreement";

/** Lightweight autosaved snapshots of the Quick fill fields. */
export type Draft = {
  id: string;
  label: string;
  savedAt: string;
  /** Set when the user renames a draft — autosave then stops re-labelling it. */
  renamed?: boolean;
  data: Agreement;
};

export const DRAFTS_KEY = "employment-agreement-drafts-v1";
const MAX_DRAFTS = 12;

export function draftLabel(a: Agreement) {
  const who = a.employee.legalName || a.employee.name || "Unnamed employee";
  const org = a.employer.name || "Unnamed employer";
  return `${who} · ${org}`;
}

export function loadDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Draft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistDrafts(drafts: Draft[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
  } catch {
    /* quota — ignore */
  }
}

/** Rename a draft and mark it so autosave keeps the custom name. */
export function renameDraft(drafts: Draft[], id: string, label: string): Draft[] {
  const name = label.trim();
  if (!name) return drafts;
  return drafts.map((d) => (d.id === id ? { ...d, label: name, renamed: true } : d));
}

/**
 * Autosave: one draft per party pairing. Re-saving the same pairing updates the
 * existing entry instead of filling the list with near-identical copies.
 * Renamed drafts keep their custom label but still track the same pairing.
 */
export function upsertAutoDraft(drafts: Draft[], a: Agreement): Draft[] {
  const label = draftLabel(a);
  const existing = drafts.find((d) => d.label === label || d.autoKey === label);
  const entry: Draft = {
    id: existing?.id ?? `d-${Date.now().toString(36)}`,
    label: existing?.renamed ? existing.label : label,
    autoKey: label,
    savedAt: new Date().toISOString(),
    ...(existing?.renamed ? { renamed: true } : {}),
    data: clone(a),
  };
  return [entry, ...drafts.filter((d) => d.id !== entry.id)].slice(0, MAX_DRAFTS);
}
