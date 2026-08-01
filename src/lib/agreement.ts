import { nzClauses } from "./nz-clauses";

export type Clause = {
  id: string;
  heading: string;
  html: string;
};

export type SignatureBlock = {
  id: string;
  role: string;
  name: string;
  title: string;
  organisation: string;
  signatureLabel: string;
  dateLabel: string;
  dateValue: string;
};

export type Consent = {
  id: string;
  label: string;
  text: string;
  acknowledged: boolean;
};

export type Party = {
  name: string;
  address: string;
  contact: string;
  extra: string;
};

export type Agreement = {
  documentTitle: string;
  subtitle: string;
  headerText: string;
  footerText: string;
  employer: Party;
  employee: Party;
  agreementDate: string;
  startDate: string;
  endDate: string;
  clauses: Clause[];
  signatures: SignatureBlock[];
  consents: Consent[];
};

export type Version = {
  id: string;
  label: string;
  savedAt: string;
  data: Agreement;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const STORAGE_KEY = "employment-agreement-editor-v2";

export const defaultAgreement: Agreement = {
  documentTitle: "Individual Employment Agreement",
  subtitle: "New Zealand format — neutral template, not an official or government-issued document",
  headerText: "Individual Employment Agreement — New Zealand",
  footerText: "Draft for review. Minimum entitlements under New Zealand law always apply.",
  employer: {
    name: "Employer Company Limited",
    address: "12 Example Street, Newtown, Wellington 6021, New Zealand",
    contact: "+64 4 000 0000 · hr@employer.example",
    extra: "NZBN: 9429000000000 · IRD: 000-000-000",
  },
  employee: {
    name: "Employee Full Name",
    address: "34 Sample Road, Papanui, Christchurch 8052, New Zealand",
    contact: "employee@example.com · +64 21 000 000",
    extra: "Position: Operations Assistant · IRD: 000-000-000",
  },
  agreementDate: "2026-08-01",
  startDate: "2026-09-01",
  endDate: "",
  clauses: nzClauses.map((c) => ({ ...c })),

  signatures: [
    {
      id: uid(),
      role: "Employer",
      name: "Authorised Representative Name",
      title: "People & Culture Manager",
      organisation: "Employer Company Limited",
      signatureLabel: "Signature",
      dateLabel: "Date signed",
      dateValue: "",
    },
    {
      id: uid(),
      role: "Employee",
      name: "Employee Full Name",
      title: "",
      organisation: "",
      signatureLabel: "Signature",
      dateLabel: "Date signed",
      dateValue: "",
    },
  ],
  consents: [
    {
      id: uid(),
      label: "Independent advice",
      text: "I confirm I have had a reasonable opportunity to seek independent advice about the terms of this agreement before signing.",
      acknowledged: true,
    },
    {
      id: uid(),
      label: "Privacy",
      text: "I consent to my personal information being collected, stored and used by the Employer for employment administration purposes.",
      acknowledged: true,
    },
    {
      id: uid(),
      label: "Policies",
      text: "I acknowledge I have been given access to the Employer's workplace policies and understand they may be updated from time to time.",
      acknowledged: false,
    },
  ],
};

export function formatDate(value: string) {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type Stored = { current: Agreement; versions: Version[] };

export function loadStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.current) return null;
    return { current: parsed.current, versions: parsed.versions ?? [] };
  } catch {
    return null;
  }
}

export function saveStored(current: Agreement, versions: Version[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ current, versions }));
  } catch {
    /* storage unavailable */
  }
}

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
