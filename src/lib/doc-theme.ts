export type ThemeName = "nz-official" | "nz-heritage" | "monochrome" | "plain";

export type DocTheme = {
  name: ThemeName;
  label: string;
  description: string;
  /** Main ink colour for headings and rules. */
  ink: string;
  /** Body text colour. */
  body: string;
  /** Muted label colour. */
  muted: string;
  /** Accent used for thin rules, numbers and small marks. */
  accent: string;
  /** Section band background + text. */
  bandBg: string;
  bandText: string;
  /** Tinted surface for party cards, date strips. */
  surface: string;
  /** Page header / footer tint. */
  chromeBg: string;
  chromeRule: string;
  /** Heading font stack class. */
  headingClass: string;
  /** Body font stack class. */
  bodyClass: string;
  /** Swatches shown in the theme picker. */
  swatch: string[];
};

export const docThemes: Record<ThemeName, DocTheme> = {
  "nz-official": {
    name: "nz-official",
    label: "NZ Official",
    description: "Navy bands, silver rules, serif headings",
    ink: "#0a2342",
    body: "#1d2430",
    muted: "#63708a",
    accent: "#12508f",
    bandBg: "#0a2342",
    bandText: "#ffffff",
    surface: "#f2f5f9",
    chromeBg: "#f7f9fc",
    chromeRule: "#0a2342",
    headingClass: "doc-serif",
    bodyClass: "doc-sans",
    swatch: ["#0a2342", "#12508f", "#f2f5f9", "#c8d3e2"],
  },
  "nz-heritage": {
    name: "nz-heritage",
    label: "NZ Heritage",
    description: "Fern green and warm parchment tones",
    ink: "#14342b",
    body: "#222e28",
    muted: "#65786e",
    accent: "#8a6a20",
    bandBg: "#14342b",
    bandText: "#f7f3e8",
    surface: "#f6f4ea",
    chromeBg: "#faf8f1",
    chromeRule: "#14342b",
    headingClass: "doc-serif",
    bodyClass: "doc-sans",
    swatch: ["#14342b", "#8a6a20", "#f6f4ea", "#c9c0a4"],
  },
  monochrome: {
    name: "monochrome",
    label: "Monochrome",
    description: "High-contrast black and white",
    ink: "#111111",
    body: "#1f1f1f",
    muted: "#6b6b6b",
    accent: "#111111",
    bandBg: "#111111",
    bandText: "#ffffff",
    surface: "#f4f4f4",
    chromeBg: "#ffffff",
    chromeRule: "#111111",
    headingClass: "doc-serif",
    bodyClass: "doc-sans",
    swatch: ["#111111", "#6b6b6b", "#f4f4f4", "#ffffff"],
  },
  plain: {
    name: "plain",
    label: "Plain",
    description: "Light rules, no filled bands — ink friendly",
    ink: "#2b2b2b",
    body: "#333333",
    muted: "#7a7a7a",
    accent: "#4a4a4a",
    bandBg: "#eeeeee",
    bandText: "#222222",
    surface: "#fbfbfb",
    chromeBg: "#ffffff",
    chromeRule: "#bdbdbd",
    headingClass: "doc-sans",
    bodyClass: "doc-sans",
    swatch: ["#2b2b2b", "#7a7a7a", "#eeeeee", "#ffffff"],
  },
};

export const themeList = Object.values(docThemes);

export type PageSizeName = "A4" | "Letter" | "Legal";

/** Page dimensions in CSS px at 96dpi, plus mm for the @page rule. */
export const pageSizes: Record<PageSizeName, { w: number; h: number; mmW: number; mmH: number }> = {
  A4: { w: 794, h: 1123, mmW: 210, mmH: 297 },
  Letter: { w: 816, h: 1056, mmW: 216, mmH: 279 },
  Legal: { w: 816, h: 1344, mmW: 216, mmH: 356 },
};
