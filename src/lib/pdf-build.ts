import {
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type PDFRef,
  type RGB,
} from "pdf-lib";
import type { Agreement } from "./agreement";
import { formatDate } from "./agreement";
import { docThemes } from "./doc-theme";


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const A4 = { w: 595.28, h: 841.89 };
const MX = 58;
const MY = 64;
const CONTENT_W = A4.w - MX * 2;
const TOP = A4.h - MY;
const BOTTOM = MY + 18;

type Block =
  | { kind: "p"; text: string }
  | { kind: "li"; text: string }
  | { kind: "oli"; text: string; index: number };

const hexToRgb = (hex: string): RGB => {
  const v = hex.replace("#", "");
  const n = parseInt(
    v.length === 3
      ? v
          .split("")
          .map((c) => c + c)
          .join("")
      : v,
    16,
  );
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** WinAnsi-safe text: pdf-lib's standard fonts cannot encode most Unicode. */
const ascii = (s: string) =>
  s
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2022\u25CF]/g, "-")
    .replace(/[^\x20-\x7E\u00A1-\u00FF]/g, "");

/** Turns the editor's simple clause HTML into flat text blocks. */
export function htmlToBlocks(html: string): Block[] {
  const out: Block[] = [];
  const clean = (s: string) =>
    ascii(
      s
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim(),
    );

  const re = /<(p|li|h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let ordered = false;
  let counter = 0;
  // Track ordered-list regions so <li> inside <ol> gets numbers.
  const olRanges: Array<[number, number]> = [];
  const olRe = /<ol[^>]*>[\s\S]*?<\/ol>/gi;
  let m: RegExpExecArray | null;
  while ((m = olRe.exec(html))) olRanges.push([m.index, m.index + m[0].length]);

  while ((m = re.exec(html))) {
    const text = clean(m[2] ?? "");
    if (!text) continue;
    const tag = (m[1] ?? "").toLowerCase();
    if (tag === "li") {
      const pos = m.index;
      const inOl = olRanges.some(([a, b]) => pos > a && pos < b);
      if (inOl) {
        if (!ordered) counter = 0;
        ordered = true;
        out.push({ kind: "oli", text, index: ++counter });
      } else {
        ordered = false;
        out.push({ kind: "li", text });
      }
    } else {
      ordered = false;
      out.push({ kind: "p", text });
    }
  }
  if (out.length === 0) {
    const t = clean(html);
    if (t) out.push({ kind: "p", text: t });
  }
  return out;
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/* ------------------------------------------------------------------ */
/* Document writer                                                     */
/* ------------------------------------------------------------------ */

type Fonts = {
  serif: PDFFont;
  serifBold: PDFFont;
  serifItalic: PDFFont;
  sans: PDFFont;
  sansBold: PDFFont;
};

type Palette = {
  ink: RGB;
  body: RGB;
  muted: RGB;
  accent: RGB;
  band: RGB;
  bandText: RGB;
  surface: RGB;
  rule: RGB;
};

class Writer {
  doc: PDFDocument;
  fonts: Fonts;
  pal: Palette;
  agreement: Agreement;
  page!: PDFPage;
  y = TOP;
  pages: PDFPage[] = [];
  /** Heading -> printed page number, collected for the table of contents. */
  toc: Array<{ label: string; page: number }> = [];
  /** Every heading with its level, used by the accessibility audit. */
  outline: Array<{ level: 1 | 2; label: string; page: number }> = [];
  offset: number;
  /** Typographic density: 1 = roomy, <1 tightens type to fit the page target. */
  scale: number;

  constructor(
    doc: PDFDocument,
    fonts: Fonts,
    pal: Palette,
    agreement: Agreement,
    offset: number,
    scale = 1,
  ) {
    this.doc = doc;
    this.fonts = fonts;
    this.pal = pal;
    this.agreement = agreement;
    this.offset = offset;
    this.scale = scale;
    this.newPage();
  }

  get pageNumber() {
    return this.offset + this.pages.length;
  }

  newPage() {
    this.page = this.doc.addPage([A4.w, A4.h]);
    this.pages.push(this.page);
    this.chrome();
    this.y = TOP - 26;
  }


  private chrome() {
    const { agreement: a, fonts, pal } = this;
    const head = ascii(a.headerText || a.documentTitle);
    this.page.drawText(head.toUpperCase(), {
      x: MX,
      y: A4.h - MY + 16,
      size: 7,
      font: fonts.sansBold,
      color: pal.muted,
    });
    const who = ascii(a.employee.name || "");
    if (who) {
      const w = fonts.sansBold.widthOfTextAtSize(who.toUpperCase(), 7);
      this.page.drawText(who.toUpperCase(), {
        x: A4.w - MX - w,
        y: A4.h - MY + 16,
        size: 7,
        font: fonts.sansBold,
        color: pal.muted,
      });
    }
    this.page.drawRectangle({
      x: MX,
      y: A4.h - MY + 8,
      width: CONTENT_W,
      height: 0.7,
      color: pal.rule,
    });
    this.page.drawRectangle({ x: MX, y: MY - 8, width: CONTENT_W, height: 0.7, color: pal.rule });
    const foot = ascii(a.footerText || "");
    if (foot) {
      this.page.drawText(foot.slice(0, 110), {
        x: MX,
        y: MY - 22,
        size: 6.5,
        font: fonts.sans,
        color: pal.muted,
      });
    }
  }

  space(h: number) {
    this.y -= h * this.scale;
  }

  need(h: number) {
    if (this.y - h < BOTTOM) this.newPage();
  }

  text(
    value: string,
    opts: {
      font?: PDFFont;
      size?: number;
      color?: RGB;
      lead?: number;
      indent?: number;
      width?: number;
      after?: number;
    } = {},
  ) {
    const font = opts.font ?? this.fonts.serif;
    const size = +((opts.size ?? 9.6) * this.scale).toFixed(2);
    const lead = +((opts.lead ?? (opts.size ?? 9.6) * 1.5) * this.scale).toFixed(2);
    const indent = opts.indent ?? 0;
    const width = opts.width ?? CONTENT_W - indent;
    for (const line of wrap(value, font, size, width)) {
      this.need(lead);
      this.page.drawText(line, {
        x: MX + indent,
        y: this.y - size,
        size,
        font,
        color: opts.color ?? this.pal.body,
      });
      this.y -= lead;
    }
    if (opts.after) this.y -= opts.after * this.scale;
  }


  rule(color?: RGB, width = CONTENT_W) {
    this.need(8);
    this.page.drawRectangle({
      x: MX,
      y: this.y - 4,
      width,
      height: 0.8,
      color: color ?? this.pal.rule,
    });
    this.y -= 12;
  }

  /** Section band, e.g. "PART B - TERMS OF EMPLOYMENT". */
  band(label: string) {
    this.need(48);
    this.outline.push({ level: 1, label: ascii(label), page: this.pageNumber });
    this.space(10);
    this.page.drawRectangle({
      x: MX,
      y: this.y - 22,
      width: CONTENT_W,
      height: 22,
      color: this.pal.band,
    });
    this.page.drawText(ascii(label).toUpperCase(), {
      x: MX + 10,
      y: this.y - 16,
      size: 9,
      font: this.fonts.sansBold,
      color: this.pal.bandText,
    });
    this.y -= 34;
  }

  heading(label: string, opts: { toc?: boolean; break?: boolean } = {}) {
    if (opts.break && this.y < TOP - 40) this.newPage();
    this.need(46);
    if (opts.toc !== false) this.toc.push({ label: ascii(label), page: this.pageNumber });
    this.outline.push({ level: 2, label: ascii(label), page: this.pageNumber });
    this.page.drawRectangle({
      x: MX,
      y: this.y - 15,
      width: 3,
      height: 15,
      color: this.pal.accent,
    });
    this.text(label, {
      font: this.fonts.serifBold,
      size: 12,
      color: this.pal.ink,
      lead: 15,
      indent: 12,
      after: 6,
    });
  }

  blocks(list: Block[]) {
    for (const b of list) {
      if (b.kind === "p") {
        this.text(b.text, { after: 5 });
      } else {
        const marker = b.kind === "oli" ? `${b.index}.` : "-";
        this.need(14 * this.scale);
        this.page.drawText(marker, {
          x: MX + 12,
          y: this.y - 9.6 * this.scale,
          size: 9.6 * this.scale,
          font: this.fonts.serif,
          color: this.pal.accent,
        });

        this.text(b.text, { indent: 28, after: 4 });
      }
    }
  }

  /** Two-column key/value card used for parties and key dates. */
  card(title: string, rows: Array<[string, string]>) {
    const lineH = 13;
    const h = 24 + rows.length * lineH;
    this.need(h + 8);
    this.page.drawRectangle({
      x: MX,
      y: this.y - h,
      width: CONTENT_W,
      height: h,
      color: this.pal.surface,
    });
    this.page.drawRectangle({ x: MX, y: this.y - h, width: 2.5, height: h, color: this.pal.accent });
    this.page.drawText(ascii(title).toUpperCase(), {
      x: MX + 12,
      y: this.y - 15,
      size: 7.5,
      font: this.fonts.sansBold,
      color: this.pal.accent,
    });
    let ry = this.y - 30;
    for (const [k, v] of rows) {
      this.page.drawText(ascii(k), {
        x: MX + 12,
        y: ry,
        size: 8,
        font: this.fonts.sans,
        color: this.pal.muted,
      });
      const val = wrap(v || "-", this.fonts.serif, 8.6, CONTENT_W - 160)[0] ?? "-";
      this.page.drawText(val, {
        x: MX + 150,
        y: ry,
        size: 8.6,
        font: this.fonts.serif,
        color: this.pal.ink,
      });
      ry -= lineH;
    }
    this.y -= h + 12;
  }
}

/* ------------------------------------------------------------------ */
/* Body composition                                                    */
/* ------------------------------------------------------------------ */

const isSchedule = (h: string) => /^schedule\b/i.test(h.trim());

function writeBody(w: Writer) {
  const a = w.agreement;

  /* Notice */
  w.band("Important notice");
  w.text(a.noticeTitle, { font: w.fonts.serifBold, size: 11, color: w.pal.ink, after: 4 });
  w.text(a.noticeText, { size: 9, color: w.pal.body, after: 10 });

  /* Letter */
  if (a.letter?.enabled) {
    w.band("Covering letter");
    w.text(a.letter.title, { font: w.fonts.serifBold, size: 12, color: w.pal.ink, after: 2 });
    if (a.letter.reference)
      w.text(a.letter.reference, { font: w.fonts.sans, size: 8, color: w.pal.muted, after: 8 });
    w.text(a.letter.salutation, { after: 6 });
    w.blocks(htmlToBlocks(a.letter.html));
    w.space(10);
    w.text(a.letter.signOff, { after: 22 });
    w.rule();
    w.text(a.letter.signerName, { font: w.fonts.serifBold, size: 9.6, color: w.pal.ink });
    w.text(a.letter.signerTitle, { font: w.fonts.sans, size: 8, color: w.pal.muted, after: 6 });
  }

  /* Parties */
  w.band("Part A - Parties to this agreement");
  w.card("Employer", [
    ["Legal name", a.employer.legalName || a.employer.name],
    ["Registration", a.employer.registration || "-"],
    ["Physical address", a.employer.address],
    ["Postal address", a.employer.postalAddress || "-"],
    ["Contact", a.employer.contact],
    ["Business activity", a.employer.position || "-"],
  ]);
  w.card("Employee", [
    ["Legal name", a.employee.legalName || a.employee.name],
    ["Reference", a.employee.registration || "-"],
    ["Address", a.employee.address],
    ["Contact", a.employee.contact],
    ["Position", a.employee.position || "-"],
  ]);
  w.card("Key dates", [
    ["Date of agreement", formatDate(a.agreementDate)],
    ["Commencement", formatDate(a.startDate)],
    ["End date", a.endDate ? formatDate(a.endDate) : "Not applicable - ongoing"],
  ]);

  if (a.references?.length) {
    w.card(
      "Party-supplied references",
      a.references.map((r) => [r.label, r.value] as [string, string]),
    );
    w.text(a.referencesNote, { font: w.fonts.serifItalic, size: 8, color: w.pal.muted, after: 8 });
  }

  /* Clauses and schedules */
  const clauses = a.clauses.filter((c) => !isSchedule(c.heading));
  const schedules = a.clauses.filter((c) => isSchedule(c.heading));

  w.band("Part B - Terms of employment");
  for (const c of clauses) {
    w.heading(c.heading);
    w.blocks(htmlToBlocks(c.html));
    w.space(8);
  }

  if (schedules.length) {
    w.newPage();
    w.band("Part C - Schedules");
    for (const s of schedules) {
      w.heading(s.heading);
      w.blocks(htmlToBlocks(s.html));
      w.space(8);
    }
  }

  /* Consents */
  if (a.consents?.length) {
    w.band("Part D - Acknowledgements and consents");
    for (const c of a.consents) {
      w.need(30);
      w.page.drawRectangle({
        x: MX,
        y: w.y - 10,
        width: 9,
        height: 9,
        borderColor: w.pal.accent,
        borderWidth: 0.8,
        ...(c.acknowledged ? { color: w.pal.accent } : {}),
      });
      w.text(c.label, {
        font: w.fonts.serifBold,
        size: 9.4,
        color: w.pal.ink,
        indent: 18,
        after: 1,
      });
      w.text(c.text, { size: 9, indent: 18, after: 8 });
    }
  }

  /* Signatures */
  w.newPage();
  w.band("Part E - Execution");
  w.text(
    "Signed by the parties as an individual employment record. Each party retains a signed copy.",
    { size: 9, color: w.pal.muted, after: 12 },
  );
  for (const s of a.signatures ?? []) {
    w.need(120);
    const h = 104;
    w.page.drawRectangle({
      x: MX,
      y: w.y - h,
      width: CONTENT_W,
      height: h,
      borderColor: w.pal.rule,
      borderWidth: 0.8,
    });
    w.page.drawRectangle({ x: MX, y: w.y - 20, width: CONTENT_W, height: 20, color: w.pal.band });
    w.page.drawText(ascii(s.role).toUpperCase(), {
      x: MX + 10,
      y: w.y - 14,
      size: 8,
      font: w.fonts.sansBold,
      color: w.pal.bandText,
    });
    const rows: Array<[string, string]> = [
      ["Name", s.name],
      ["Title", s.title || "-"],
      ["Organisation", s.organisation || "-"],
    ];
    let ry = w.y - 36;
    for (const [k, v] of rows) {
      w.page.drawText(ascii(k), {
        x: MX + 10,
        y: ry,
        size: 7.5,
        font: w.fonts.sans,
        color: w.pal.muted,
      });
      w.page.drawText(ascii(v), {
        x: MX + 96,
        y: ry,
        size: 9,
        font: w.fonts.serif,
        color: w.pal.ink,
      });
      ry -= 14;
    }
    // Signature and date rules
    w.page.drawRectangle({ x: MX + 10, y: w.y - 84, width: 230, height: 0.8, color: w.pal.rule });
    w.page.drawRectangle({
      x: MX + 260,
      y: w.y - 84,
      width: CONTENT_W - 270,
      height: 0.8,
      color: w.pal.rule,
    });
    w.page.drawText(ascii(s.signatureLabel || "Signature"), {
      x: MX + 10,
      y: w.y - 96,
      size: 7.5,
      font: w.fonts.sans,
      color: w.pal.muted,
    });
    w.page.drawText(
      `${ascii(s.dateLabel || "Date signed")}${s.dateValue ? `: ${formatDate(s.dateValue)}` : ""}`,
      { x: MX + 260, y: w.y - 96, size: 7.5, font: w.fonts.sans, color: w.pal.muted },
    );
    w.y -= h + 16;
  }

  /* Audit appendix */
  if (a.settings.showAppendix) {
    w.newPage();
    w.band("Appendix - Compliance audit trail");
    w.text(
      "This appendix records how agency-issued identifiers were handled when this document was produced.",
      { size: 9, color: w.pal.muted, after: 8 },
    );
    const entries = a.auditTrail ?? [];
    if (!entries.length) {
      w.text("No government-issued fields were detected in this document.", { size: 9, after: 6 });
    } else {
      for (const e of entries) {
        w.text(`${e.action === "excluded" ? "Excluded" : "Mapped"} - ${e.label}`, {
          font: w.fonts.serifBold,
          size: 9.2,
          color: w.pal.ink,
        });
        w.text(e.detail, { size: 8.6, color: w.pal.muted, after: 6 });
      }
    }
  }
}

/**
 * Ruled continuation pages used to land the document on the target length.
 * They are real, printable "notes and variations" pages, not blank filler.
 */
function writeNotesPages(w: Writer, count: number) {
  for (let i = 0; i < count; i += 1) {
    w.newPage();
    w.band(count === 1 ? "Notes and agreed variations" : `Notes and agreed variations (${i + 1})`);
    w.text(
      "Use these ruled pages to record agreed variations, meeting notes or additional terms. Each entry should be dated and initialled by both parties.",
      { size: 9, color: w.pal.muted, after: 10 },
    );
    let ry = w.y;
    while (ry - 22 > BOTTOM) {
      w.page.drawRectangle({ x: MX, y: ry - 4, width: CONTENT_W, height: 0.5, color: w.pal.rule });
      ry -= 22;
    }
    w.y = BOTTOM;
  }
}


/* ------------------------------------------------------------------ */
/* Cover, contents, page numbers                                       */
/* ------------------------------------------------------------------ */

function drawCover(page: PDFPage, a: Agreement, fonts: Fonts, pal: Palette) {
  page.drawRectangle({ x: 0, y: A4.h - 12, width: A4.w, height: 12, color: pal.band });
  page.drawRectangle({ x: MX, y: 120, width: 3, height: A4.h - 260, color: pal.accent });

  const x = MX + 22;
  page.drawText(ascii("New Zealand").toUpperCase(), {
    x,
    y: A4.h - 130,
    size: 8,
    font: fonts.sansBold,
    color: pal.muted,
  });

  const badge = ascii(a.settings.theme === "plain" ? "Agreement" : "Employment record").toUpperCase();
  const bw = fonts.sansBold.widthOfTextAtSize(badge, 7.5) + 16;
  page.drawRectangle({ x, y: A4.h - 168, width: bw, height: 18, color: pal.band });
  page.drawText(badge, {
    x: x + 8,
    y: A4.h - 163,
    size: 7.5,
    font: fonts.sansBold,
    color: pal.bandText,
  });

  let y = A4.h - 210;
  for (const line of wrap(a.documentTitle, fonts.serifBold, 30, CONTENT_W - 60)) {
    page.drawText(line, { x, y, size: 30, font: fonts.serifBold, color: pal.ink });
    y -= 36;
  }
  page.drawRectangle({ x, y: y - 6, width: 70, height: 2, color: pal.accent });
  y -= 34;
  for (const line of wrap(a.subtitle, fonts.serifItalic, 10, CONTENT_W - 80)) {
    page.drawText(line, { x, y, size: 10, font: fonts.serifItalic, color: pal.muted });
    y -= 15;
  }

  /* Party grid */
  y -= 30;
  const cells: Array<[string, string]> = [
    ["Employer", a.employer.legalName || a.employer.name],
    ["Employee", a.employee.legalName || a.employee.name],
    ["Date of agreement", formatDate(a.agreementDate)],
    ["Commencement", formatDate(a.startDate)],
  ];
  const cw = (CONTENT_W - 22) / 2;
  cells.forEach(([k, v], i) => {
    const cx = x + (i % 2) * (cw + 10);
    const cy = y - Math.floor(i / 2) * 62;
    page.drawRectangle({ x: cx, y: cy - 48, width: cw - 22, height: 48, color: pal.surface });
    page.drawText(ascii(k).toUpperCase(), {
      x: cx + 10,
      y: cy - 17,
      size: 7,
      font: fonts.sansBold,
      color: pal.muted,
    });
    const val = wrap(v, fonts.serifBold, 11, cw - 44)[0] ?? "-";
    page.drawText(val, { x: cx + 10, y: cy - 36, size: 11, font: fonts.serifBold, color: pal.ink });
  });

  /* At a glance — key terms, so the cover carries real information */
  let gy = y - 2 * 62 - 14;
  page.drawText("AT A GLANCE", {
    x,
    y: gy,
    size: 7.5,
    font: fonts.sansBold,
    color: pal.accent,
  });
  page.drawRectangle({ x, y: gy - 8, width: CONTENT_W - 22, height: 0.8, color: pal.rule });
  gy -= 24;
  const ref = a.references?.[0];
  const glance: Array<[string, string]> = [
    ["Position", a.employee.position || "As recorded in Schedule 1"],
    ["Agreement type", a.headerText || a.documentTitle],
    ["Employer contact", a.employer.contact || "-"],
    ["Employee contact", a.employee.contact || "-"],
    ["Term", a.endDate ? `${formatDate(a.startDate)} to ${formatDate(a.endDate)}` : "Ongoing, from commencement"],
    ...(ref ? ([[ref.label || "Reference", ref.value || "-"]] as Array<[string, string]>) : []),
  ];
  for (const [k, v] of glance) {
    if (gy < 170) break;
    page.drawText(ascii(k).toUpperCase(), {
      x,
      y: gy,
      size: 7,
      font: fonts.sansBold,
      color: pal.muted,
    });
    const val = wrap(v, fonts.serif, 9.5, CONTENT_W - 180)[0] ?? "-";
    page.drawText(val, { x: x + 130, y: gy, size: 9.5, font: fonts.serif, color: pal.ink });
    page.drawRectangle({
      x,
      y: gy - 7,
      width: CONTENT_W - 22,
      height: 0.4,
      color: pal.rule,
    });
    gy -= 20;
  }


  /* Footer notice */
  const notice = wrap(a.noticeText, fonts.sans, 7.6, CONTENT_W - 40).slice(0, 4);
  let ny = 132;
  page.drawRectangle({ x: MX, y: 118, width: CONTENT_W, height: 0.8, color: pal.rule });
  for (const line of notice) {
    page.drawText(line, { x, y: ny - 20, size: 7.6, font: fonts.sans, color: pal.muted });
    ny -= 11;
  }
}

function drawContents(
  pages: PDFPage[],
  toc: Array<{ label: string; page: number }>,
  fonts: Fonts,
  pal: Palette,
) {
  let idx = 0;
  let page = pages[idx]!;
  let y = TOP - 20;
  page.drawText("TABLE OF CONTENTS", {
    x: MX,
    y: y + 10,
    size: 9,
    font: fonts.sansBold,
    color: pal.accent,
  });
  page.drawRectangle({ x: MX, y, width: CONTENT_W, height: 0.8, color: pal.rule });
  y -= 24;

  for (const entry of toc) {
    if (y < BOTTOM + 10) {
      idx += 1;
      if (idx >= pages.length) break;
      page = pages[idx]!;
      y = TOP - 20;
    }
    const label = wrap(entry.label, fonts.serif, 9, CONTENT_W - 60)[0] ?? "";
    const num = String(entry.page);
    const nw = fonts.sans.widthOfTextAtSize(num, 8.5);
    page.drawText(label, { x: MX, y, size: 9, font: fonts.serif, color: pal.body });
    page.drawText(num, { x: MX + CONTENT_W - nw, y, size: 8.5, font: fonts.sans, color: pal.muted });
    const lw = fonts.serif.widthOfTextAtSize(label, 9);
    page.drawRectangle({
      x: MX + lw + 6,
      y: y + 3,
      width: Math.max(0, CONTENT_W - lw - nw - 12),
      height: 0.4,
      color: pal.rule,
    });
    y -= 16;
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Builds a real, vector PDF of the whole agreement and returns its bytes. */
export type BuildReport = {
  /** Every heading in reading order, with its level and printed page number. */
  headings: Array<{ level: 1 | 2; label: string; page: number }>;
  /** Entries written into the table of contents. */
  toc: Array<{ label: string; page: number }>;
  pageCount: number;
};

export async function buildAgreementPdf(
  agreement: Agreement,
  report?: BuildReport,
): Promise<Uint8Array> {
  const theme = docThemes[agreement.settings.theme] ?? docThemes["nz-official"];
  const pal: Palette = {
    ink: hexToRgb(theme.ink),
    body: hexToRgb(theme.body),
    muted: hexToRgb(theme.muted),
    accent: hexToRgb(theme.accent),
    band: hexToRgb(theme.bandBg),
    bandText: hexToRgb(theme.bandText),
    surface: hexToRgb(theme.surface),
    rule: hexToRgb(theme.chromeRule === "#111111" ? "#c9c9c9" : "#c8d3e2"),
  };

  // Pass 1: lay the body out to learn how many contents pages are needed.
  const probeDoc = await PDFDocument.create();
  const probeFonts = await loadFonts(probeDoc);
  const probe = new Writer(probeDoc, probeFonts, pal, agreement, 2);
  writeBody(probe);
  const perTocPage = Math.floor((TOP - 20 - BOTTOM) / 16);
  const tocPages = Math.max(1, Math.ceil(probe.toc.length / perTocPage));

  // Pass 2: real document with the correct page offset.
  const doc = await PDFDocument.create();
  doc.setTitle(agreement.documentTitle);
  doc.setSubject(agreement.subtitle);
  doc.setAuthor(agreement.employer.legalName || agreement.employer.name || "Employer");
  doc.setCreator("Employment Agreement Builder");
  doc.setProducer("Employment Agreement Builder");
  doc.setKeywords([
    "employment agreement",
    "New Zealand",
    agreement.employer.name || "",
    agreement.employee.name || "",
  ].filter(Boolean));
  doc.setLanguage("en-NZ");
  doc.setCreationDate(new Date());
  const fonts = await loadFonts(doc);

  const cover = doc.addPage([A4.w, A4.h]);
  drawCover(cover, agreement, fonts, pal);

  const contents: PDFPage[] = [];
  for (let i = 0; i < tocPages; i += 1) contents.push(doc.addPage([A4.w, A4.h]));

  const writer = new Writer(doc, fonts, pal, agreement, 1 + tocPages);
  writeBody(writer);
  drawContents(contents, writer.toc, fonts, pal);

  // Page numbers on every page after the cover.
  const all = doc.getPages();
  all.forEach((p, i) => {
    if (i === 0) return;
    const label = `PAGE ${i + 1} OF ${all.length}`;
    const w = fonts.sansBold.widthOfTextAtSize(label, 7);
    p.drawText(label, {
      x: A4.w - MX - w,
      y: MY - 22,
      size: 7,
      font: fonts.sansBold,
      color: pal.muted,
    });
  });

  // Navigable heading outline (bookmarks) so screen readers and PDF viewers can
  // jump between sections instead of scrolling blind.
  addOutline(doc, [
    { title: "Cover", pageIndex: 0 },
    { title: "Table of contents", pageIndex: 1 },
    ...writer.toc.map((t) => ({ title: t.label, pageIndex: Math.max(0, t.page - 1) })),
  ]);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));

  if (report) {
    report.headings = writer.outline;
    report.toc = writer.toc;
    report.pageCount = all.length;
  }

  return doc.save();
}

/** Adds a flat PDF outline (bookmark) tree pointing at each heading's page. */
function addOutline(doc: PDFDocument, items: Array<{ title: string; pageIndex: number }>) {
  if (!items.length) return;
  const context = doc.context;
  const pages = doc.getPages();
  const outlinesRef = context.nextRef();
  const refs: PDFRef[] = items.map(() => context.nextRef());

  items.forEach((item, i) => {
    const page = pages[Math.min(item.pageIndex, pages.length - 1)];
    if (!page) return;
    const dict = context.obj({
      Title: PDFHexString.fromText(item.title),
      Parent: outlinesRef,
      Dest: context.obj([
        page.ref,
        PDFName.of("XYZ"),
        PDFNull,
        PDFNumber.of(page.getHeight()),
        PDFNull,
      ]),
    });
    const prev = refs[i - 1];
    const next = refs[i + 1];
    if (prev) dict.set(PDFName.of("Prev"), prev);
    if (next) dict.set(PDFName.of("Next"), next);
    context.assign(refs[i]!, dict);
  });

  const first = refs[0]!;
  const last = refs[refs.length - 1]!;
  context.assign(
    outlinesRef,
    context.obj({
      Type: PDFName.of("Outlines"),
      First: first,
      Last: last,
      Count: PDFNumber.of(items.length),
    }),
  );
  doc.catalog.set(PDFName.of("Outlines"), outlinesRef);
}


async function loadFonts(doc: PDFDocument): Promise<Fonts> {
  const [serif, serifBold, serifItalic, sans, sansBold] = await Promise.all([
    doc.embedFont(StandardFonts.TimesRoman),
    doc.embedFont(StandardFonts.TimesRomanBold),
    doc.embedFont(StandardFonts.TimesRomanItalic),
    doc.embedFont(StandardFonts.Helvetica),
    doc.embedFont(StandardFonts.HelveticaBold),
  ]);
  return { serif, serifBold, serifItalic, sans, sansBold };
}
