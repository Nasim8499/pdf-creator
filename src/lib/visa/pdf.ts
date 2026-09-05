import { DISCLAIMER, type CountryConfig } from "./countries";
import type { Values } from "./storage";

/**
 * Builds an original, generic visa preparation sheet as a real vector PDF.
 * The layout is our own: it deliberately does not imitate any government
 * form, emblem or seal, and every page carries the unofficial notice.
 */

const A4 = { w: 595.28, h: 841.89 };
const MX = 46;
const CONTENT_W = A4.w - MX * 2;

const hex = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

export type BuildReport = { pageCount: number; sections: number; fields: number };

export async function buildVisaPdf(
  country: CountryConfig,
  values: Values,
  report?: BuildReport,
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const base = hex(country.accent.base);
  const deep = hex(country.accent.deep);
  const accent = rgb(base.r, base.g, base.b);
  const accentDeep = rgb(deep.r, deep.g, deep.b);
  const ink = rgb(0.11, 0.12, 0.15);
  const soft = rgb(0.42, 0.45, 0.5);
  const line = rgb(0.85, 0.87, 0.9);
  const tint = rgb(0.96, 0.97, 0.98);

  const ref = `PREP-${country.code.toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
  const generated = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  let page = pdf.addPage([A4.w, A4.h]);
  let y = 0;
  const pages: import("pdf-lib").PDFPage[] = [page];

  const wrap = (text: string, size: number, width: number, f = font) => {
    const out: string[] = [];
    for (const para of String(text).split("\n")) {
      let cur = "";
      for (const word of para.split(/\s+/)) {
        const test = cur ? `${cur} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > width && cur) {
          out.push(cur);
          cur = word;
        } else cur = test;
      }
      out.push(cur);
    }
    return out.length ? out : [""];
  };

  const pageHeader = () => {
    page.drawRectangle({ x: 0, y: A4.h - 92, width: A4.w, height: 92, color: accentDeep });
    page.drawRectangle({ x: 0, y: A4.h - 96, width: A4.w, height: 4, color: accent });
    page.drawText(country.name.toUpperCase(), {
      x: MX,
      y: A4.h - 46,
      size: 17,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(country.formTitle, {
      x: MX,
      y: A4.h - 63,
      size: 9.5,
      font,
      color: rgb(0.86, 0.9, 0.93),
    });
    page.drawText(DISCLAIMER.toUpperCase(), {
      x: MX,
      y: A4.h - 80,
      size: 7,
      font: bold,
      color: rgb(0.8, 0.86, 0.9),
    });
    const refW = bold.widthOfTextAtSize(ref, 9);
    page.drawText(ref, { x: A4.w - MX - refW, y: A4.h - 46, size: 9, font: bold, color: rgb(1, 1, 1) });
    y = A4.h - 122;
  };

  const newPage = () => {
    page = pdf.addPage([A4.w, A4.h]);
    pages.push(page);
    pageHeader();
  };

  const room = (h: number) => {
    if (y - h < 74) newPage();
  };

  pageHeader();

  /* ---------------- cover summary ---------------- */
  const applicant =
    [values["givenNames"], values["surname"]].filter(Boolean).join(" ").trim() || "—";

  page.drawRectangle({
    x: MX,
    y: y - 96,
    width: CONTENT_W,
    height: 96,
    color: tint,
    borderColor: line,
    borderWidth: 0.8,
  });
  page.drawRectangle({ x: MX, y: y - 96, width: 4, height: 96, color: accent });
  page.drawText("APPLICANT", { x: MX + 16, y: y - 22, size: 7.5, font: bold, color: soft });
  page.drawText(applicant, { x: MX + 16, y: y - 42, size: 15, font: bold, color: ink });
  const meta: [string, string][] = [
    ["Nationality", String(values["nationality"] || "—")],
    ["Passport", String(values["passportNumber"] || "—")],
    ["Intended arrival", String(values["arrival"] || "—")],
    ["Prepared", generated],
  ];
  meta.forEach((m, i) => {
    const col = MX + 16 + (i % 2) * (CONTENT_W / 2 - 10);
    const row = y - 62 - Math.floor(i / 2) * 18;
    page.drawText(`${m[0]}:`, { x: col, y: row, size: 8, font: bold, color: soft });
    page.drawText(m[1], {
      x: col + bold.widthOfTextAtSize(`${m[0]}: `, 8),
      y: row,
      size: 8,
      font,
      color: ink,
    });
  });
  y -= 112;

  const noteLines = wrap(
    `This sheet collects the information typically requested for ${country.name} (${country.visaTypes.join(", ")}). It is not an official form and carries no legal standing. Lodge your application through ${country.officialPortal}. Typical processing: ${country.processing}.`,
    8.5,
    CONTENT_W - 20,
    italic,
  );
  page.drawRectangle({
    x: MX,
    y: y - (noteLines.length * 11 + 14),
    width: CONTENT_W,
    height: noteLines.length * 11 + 14,
    borderColor: line,
    borderWidth: 0.8,
  });
  noteLines.forEach((l, i) => {
    page.drawText(l, { x: MX + 10, y: y - 18 - i * 11, size: 8.5, font: italic, color: soft });
  });
  y -= noteLines.length * 11 + 28;

  /* ---------------- sections ---------------- */
  let fieldCount = 0;
  country.sections.forEach((section, si) => {
    room(70);
    page.drawRectangle({ x: MX, y: y - 22, width: CONTENT_W, height: 22, color: accentDeep });
    page.drawText(`${String(si + 1).padStart(2, "0")}  ${section.title.toUpperCase()}`, {
      x: MX + 10,
      y: y - 15,
      size: 9,
      font: bold,
      color: rgb(1, 1, 1),
    });
    y -= 30;

    if (section.description) {
      for (const l of wrap(section.description, 8, CONTENT_W, italic)) {
        room(12);
        page.drawText(l, { x: MX, y, size: 8, font: italic, color: soft });
        y -= 11;
      }
      y -= 4;
    }

    section.fields.forEach((f, fi) => {
      fieldCount += 1;
      const raw = values[f.id];
      const value =
        f.type === "checkbox"
          ? raw === true
            ? "Confirmed"
            : "Not confirmed"
          : typeof raw === "string" && raw.trim()
            ? raw.trim()
            : "—";
      const labelW = 172;
      const valueW = CONTENT_W - labelW - 24;
      const labelLines = wrap(f.label, 8.5, labelW - 12, bold);
      const valueLines = wrap(value, 9, valueW);
      const h = Math.max(labelLines.length, valueLines.length) * 12 + 10;
      room(h + 4);

      if (fi % 2 === 0) {
        page.drawRectangle({ x: MX, y: y - h, width: CONTENT_W, height: h, color: tint });
      }
      page.drawLine({
        start: { x: MX, y: y - h },
        end: { x: MX + CONTENT_W, y: y - h },
        thickness: 0.5,
        color: line,
      });
      labelLines.forEach((l, i) => {
        page.drawText(l, { x: MX + 10, y: y - 14 - i * 12, size: 8.5, font: bold, color: soft });
      });
      valueLines.forEach((l, i) => {
        page.drawText(l, {
          x: MX + labelW,
          y: y - 14 - i * 12,
          size: 9,
          font,
          color: value === "—" ? line : ink,
        });
      });
      y -= h;
    });
    y -= 18;
  });

  /* ---------------- guidance + signature ---------------- */
  room(150);
  page.drawText("BEFORE YOU SUBMIT", { x: MX, y, size: 9, font: bold, color: accentDeep });
  y -= 16;
  for (const g of [...country.guidance, `Official portal: ${country.officialPortal}`]) {
    for (const [i, l] of wrap(g, 8.5, CONTENT_W - 14).entries()) {
      room(12);
      if (i === 0) page.drawCircle({ x: MX + 3, y: y + 3, size: 1.6, color: accent });
      page.drawText(l, { x: MX + 14, y, size: 8.5, font, color: ink });
      y -= 12;
    }
    y -= 3;
  }

  y -= 14;
  room(110);
  page.drawText("DECLARATION", { x: MX, y, size: 9, font: bold, color: accentDeep });
  y -= 16;
  for (const l of wrap(
    "I confirm the information above is accurate to the best of my knowledge and that this preparation sheet is unofficial. The final application will be submitted through the official channel.",
    8.5,
    CONTENT_W,
  )) {
    page.drawText(l, { x: MX, y, size: 8.5, font, color: ink });
    y -= 12;
  }
  y -= 26;
  const half = (CONTENT_W - 24) / 2;
  const sigCols: { label: string; val: string }[] = [
    { label: "Signature", val: "" },
    { label: "Date", val: String(values["signDate"] || "") },
  ];
  sigCols.forEach(({ label, val }, i) => {
    const x = MX + i * (half + 24);
    page.drawLine({ start: { x, y }, end: { x: x + half, y }, thickness: 0.8, color: soft });
    page.drawText(label, { x, y: y - 12, size: 8, font: bold, color: soft });
    if (val) page.drawText(val, { x, y: y + 6, size: 9, font, color: ink });
  });
  const printedName = String(values["signName"] || applicant);
  page.drawText(printedName, { x: MX, y: y + 6, size: 9, font: italic, color: ink });

  /* ---------------- footers ---------------- */
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: MX, y: 58 },
      end: { x: A4.w - MX, y: 58 },
      thickness: 0.6,
      color: line,
    });
    p.drawText(DISCLAIMER, { x: MX, y: 44, size: 7.5, font: bold, color: soft });
    p.drawText(`${country.name} · ${ref} · not an official government document`, {
      x: MX,
      y: 33,
      size: 7,
      font,
      color: soft,
    });
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, {
      x: A4.w - MX - font.widthOfTextAtSize(label, 7.5),
      y: 44,
      size: 7.5,
      font,
      color: soft,
    });
  });

  pdf.setTitle(`${country.name} visa preparation sheet — ${applicant} (unofficial)`);
  pdf.setSubject(DISCLAIMER);
  pdf.setAuthor(applicant);
  pdf.setCreator("Visa Prep — unofficial preparation tool");
  pdf.setLanguage("en");

  if (report) {
    report.pageCount = pages.length;
    report.sections = country.sections.length;
    report.fields = fieldCount;
  }
  return pdf.save();
}

export function visaFileName(country: CountryConfig, values: Values) {
  const who = [values["surname"], values["givenNames"]]
    .filter(Boolean)
    .join("-")
    .replace(/[^\w-]+/g, "-")
    .slice(0, 40);
  return `${country.code}-visa-prep${who ? `-${who}` : ""}-unofficial.pdf`;
}
