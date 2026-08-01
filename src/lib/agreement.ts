import { nzClauses } from "./nz-clauses";
import type { PageSizeName, ThemeName } from "./doc-theme";


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
  /** Data URL of an uploaded logo, shown on the cover, page headers and footers. */
  logo?: string | undefined;
};

export type LogoFit = "contain" | "cover";
export type LogoAlign = "left" | "center" | "right";

export type LogoSettings = {
  headerHeight: number;
  footerHeight: number;
  coverHeight: number;
  fit: LogoFit;
  align: LogoAlign;
  offsetX: number;
  offsetY: number;
  showInHeader: boolean;
  showInFooter: boolean;
  showOnCover: boolean;
  showInSignatures: boolean;
  frame: boolean;
};

export type Sponsor = {
  id: string;
  name: string;
  tagline: string;
  logo?: string | undefined;
};

/** Placement, size and margin controls for sponsor marks. */
export type SponsorLogoSettings = {
  /** Logo height inside the sponsor strip, px. */
  stripHeight: number;
  /** Logo height for the small marks printed in the header/footer, px. */
  markHeight: number;
  fit: LogoFit;
  align: LogoAlign;
  /** Horizontal gap between sponsor items in the strip, px. */
  gap: number;
  /** Consistent margin applied around every sponsor mark, px. */
  marginX: number;
  marginY: number;
  inHeader: boolean;
  inFooter: boolean;
  onCover: boolean;
  inSignatures: boolean;
  headerSide: "left" | "right";
  footerSide: "left" | "right";
  /** Max sponsor marks rendered in a header/footer row. */
  maxMarks: number;
  frame: boolean;
  /** Eye-catching accent bar and tint behind sponsor marks. */
  highlight: boolean;
};

export type CodeMarkSettings = {
  enabled: boolean;
  type: "qr" | "barcode";
  value: string;
  caption: string;
  onCover: boolean;
  onEveryPage: boolean;
  inSignatures: boolean;
  size: number;
};

export type DocSettings = {
  pageSize: PageSizeName;
  marginX: number;
  marginY: number;
  showHeader: boolean;
  showFooter: boolean;
  showPageNumbers: boolean;
  showCover: boolean;
  showContents: boolean;
  /** Space below a Part band, in px. */
  sectionSpacing: number;
  /** Space between clauses, in px. */
  clauseSpacing: number;
  /** Force each Part A–D band onto a fresh page. */
  strictBreaks: boolean;
  /** Show 01, 02 … numbers beside clause headings. */
  numberClauses: boolean;
  theme: ThemeName;
  logo: LogoSettings;
  codes: CodeMarkSettings;
  sponsors: Sponsor[];
  showSponsorStrip: boolean;
  sponsorHeading: string;
  sponsorLogo: SponsorLogoSettings;
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
  settings: DocSettings;
};


export type Version = {
  id: string;
  label: string;
  savedAt: string;
  data: Agreement;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const STORAGE_KEY = "employment-agreement-editor-v3";

export const defaultSettings: DocSettings = {
  pageSize: "A4",
  marginX: 64,
  marginY: 56,
  showHeader: true,
  showFooter: true,
  showPageNumbers: true,
  showCover: true,
  showContents: true,
  sectionSpacing: 18,
  clauseSpacing: 20,
  strictBreaks: true,
  numberClauses: true,
  theme: "nz-official",
  logo: {
    headerHeight: 24,
    footerHeight: 14,
    coverHeight: 44,
    fit: "contain",
    align: "left",
    offsetX: 0,
    offsetY: 0,
    showInHeader: true,
    showInFooter: true,
    showOnCover: true,
    showInSignatures: true,
    frame: true,
  },
  codes: {
    enabled: true,
    type: "qr",
    value: "https://example.com/agreements/verify/AGR-000-000",
    caption: "Scan to verify this document reference",
    onCover: true,
    onEveryPage: false,
    inSignatures: true,
    size: 72,
  },
  sponsors: [],
  showSponsorStrip: false,
  sponsorHeading: "Supported by",
  sponsorLogo: {
    stripHeight: 32,
    markHeight: 16,
    fit: "contain",
    align: "left",
    gap: 24,
    marginX: 8,
    marginY: 2,
    inHeader: false,
    inFooter: true,
    onCover: true,
    inSignatures: true,
    headerSide: "right",
    footerSide: "right",
    maxMarks: 3,
    frame: false,
    highlight: true,
  },
};

export const defaultSponsorLogo = defaultSettings.sponsorLogo;


export const defaultAgreement: Agreement = {
  settings: JSON.parse(JSON.stringify(defaultSettings)) as DocSettings,


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
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type Stored = { current: Agreement; versions: Version[] };

/** Fills in settings introduced after a document was saved. */
export function withSettings(doc: Agreement): Agreement {
  const s = (doc.settings ?? {}) as Partial<DocSettings>;
  return {
    ...doc,
    settings: {
      ...defaultSettings,
      ...s,
      logo: { ...defaultSettings.logo, ...(s.logo ?? {}) },
      codes: { ...defaultSettings.codes, ...(s.codes ?? {}) },
      sponsorLogo: { ...defaultSettings.sponsorLogo, ...(s.sponsorLogo ?? {}) },

      sponsors: s.sponsors ?? [],
    },
  };
}

export function loadStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.current) return null;
    return {
      current: withSettings(parsed.current),
      versions: (parsed.versions ?? []).map((v) => ({ ...v, data: withSettings(v.data) })),
    };
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
