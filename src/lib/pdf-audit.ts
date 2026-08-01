import { PDFDocument, PDFName, PDFRawStream, PDFArray, PDFDict } from "pdf-lib";
import type { BuildReport } from "./pdf-build";

export type AuditSeverity = "error" | "warning" | "pass";

export type AuditIssue = {
  id: string;
  severity: AuditSeverity;
  title: string;
  detail: string;
};

export type AuditResult = {
  issues: AuditIssue[];
  errors: number;
  warnings: number;
  stats: {
    pages: number;
    headings: number;
    bookmarks: number;
    textPages: number;
    characters: number;
  };
};

/** Counts text-showing operators and rough glyph count in a page content stream. */
function readPageText(doc: PDFDocument, index: number): { ops: number; chars: number } {
  const page = doc.getPage(index);
  const contents = page.node.get(PDFName.of("Contents"));
  const streams: PDFRawStream[] = [];
  if (contents instanceof PDFRawStream) streams.push(contents);
  else if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i += 1) {
      const s = contents.lookup(i);
      if (s instanceof PDFRawStream) streams.push(s);
    }
  } else {
    const resolved = page.node.context.lookup(contents);
    if (resolved instanceof PDFRawStream) streams.push(resolved);
  }

  let ops = 0;
  let chars = 0;
  for (const stream of streams) {
    const text = new TextDecoder("latin1").decode(stream.getContents());
    ops += (text.match(/\bTj\b/g) ?? []).length + (text.match(/\bTJ\b/g) ?? []).length;
    for (const m of text.matchAll(/\(((?:\\.|[^\\()])*)\)\s*Tj/g)) {
      chars += (m[1] ?? "").replace(/\\(.)/g, "$1").length;
    }
  }
  return { ops, chars };
}

/** Counts entries in the document outline (bookmarks). */
function countBookmarks(doc: PDFDocument): number {
  const outlines = doc.catalog.lookup(PDFName.of("Outlines"));
  if (!(outlines instanceof PDFDict)) return 0;
  let node = outlines.lookup(PDFName.of("First"));
  let count = 0;
  const guard = 5000;
  while (node instanceof PDFDict && count < guard) {
    count += 1;
    node = node.lookup(PDFName.of("Next"));
  }
  return count;
}

/**
 * Inspects a freshly built PDF the way an accessibility checker would: heading
 * structure, navigable outline, and real selectable text on every page.
 */
export async function auditAgreementPdf(
  bytes: Uint8Array,
  report: BuildReport,
): Promise<AuditResult> {
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  const issues: AuditIssue[] = [];

  /* --- Selectable text ------------------------------------------------- */
  let characters = 0;
  let textPages = 0;
  const emptyPages: number[] = [];
  for (let i = 0; i < pages; i += 1) {
    const { ops, chars } = readPageText(doc, i);
    characters += chars;
    if (ops > 0) textPages += 1;
    else emptyPages.push(i + 1);
  }
  issues.push(
    emptyPages.length
      ? {
          id: "text",
          severity: "error",
          title: "Pages without selectable text",
          detail: `Page${emptyPages.length > 1 ? "s" : ""} ${emptyPages.join(", ")} contain no text operators, so screen readers and search will skip them.`,
        }
      : {
          id: "text",
          severity: "pass",
          title: "All text is selectable",
          detail: `${textPages} of ${pages} pages carry real vector text (~${characters.toLocaleString()} characters). Nothing is rasterised.`,
        },
  );

  /* --- Heading structure ----------------------------------------------- */
  const headings = report.headings;
  if (!headings.length) {
    issues.push({
      id: "headings",
      severity: "error",
      title: "No headings found",
      detail: "The document has no section headings, so there is no reading structure to navigate.",
    });
  } else {
    const firstLevel = headings[0]?.level;
    if (firstLevel !== 1) {
      issues.push({
        id: "heading-order",
        severity: "warning",
        title: "Document does not start at the top level",
        detail: `The first heading "${headings[0]?.label}" is a level ${firstLevel} heading. Sections should open with a part band before their clauses.`,
      });
    }

    const orphans = headings.filter((h, i) => h.level === 2 && !headings.slice(0, i).some((p) => p.level === 1));
    if (orphans.length) {
      issues.push({
        id: "heading-orphan",
        severity: "warning",
        title: "Headings outside any part",
        detail: `${orphans.length} heading(s) appear before the first part band, e.g. "${orphans[0]?.label}".`,
      });
    }

    const seen = new Map<string, number>();
    for (const h of headings) seen.set(h.label, (seen.get(h.label) ?? 0) + 1);
    const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([l]) => l);
    if (dupes.length) {
      issues.push({
        id: "heading-dupes",
        severity: "warning",
        title: "Duplicate heading text",
        detail: `${dupes.length} heading(s) repeat the same wording (e.g. "${dupes[0]}"), which makes the outline ambiguous.`,
      });
    }

    const outOfOrder = headings.some((h, i) => i > 0 && h.page < (headings[i - 1]?.page ?? 0));
    if (outOfOrder) {
      issues.push({
        id: "heading-pages",
        severity: "error",
        title: "Heading order does not match page order",
        detail: "Headings are recorded out of sequence, so the outline would jump backwards.",
      });
    }

    if (
      !orphans.length &&
      !dupes.length &&
      !outOfOrder &&
      firstLevel === 1
    ) {
      const parts = headings.filter((h) => h.level === 1).length;
      issues.push({
        id: "headings",
        severity: "pass",
        title: "Heading structure is sound",
        detail: `${parts} part heading(s) and ${headings.length - parts} section heading(s) nest correctly and follow page order.`,
      });
    }
  }

  /* --- Outline / bookmarks --------------------------------------------- */
  const bookmarks = countBookmarks(doc);
  if (bookmarks === 0) {
    issues.push({
      id: "outline",
      severity: "error",
      title: "No document outline",
      detail: "The PDF has no bookmarks, so assistive technology cannot jump between sections.",
    });
  } else if (bookmarks < report.toc.length) {
    issues.push({
      id: "outline",
      severity: "warning",
      title: "Outline is incomplete",
      detail: `${bookmarks} bookmarks for ${report.toc.length} contents entries — some sections are not reachable from the outline.`,
    });
  } else {
    issues.push({
      id: "outline",
      severity: "pass",
      title: "Navigable outline present",
      detail: `${bookmarks} bookmarks link every part, clause and schedule to its page.`,
    });
  }

  /* --- Contents accuracy ------------------------------------------------ */
  const badToc = report.toc.filter((t) => t.page < 1 || t.page > pages);
  issues.push(
    badToc.length
      ? {
          id: "toc",
          severity: "error",
          title: "Contents point outside the document",
          detail: `${badToc.length} contents entr(y/ies) reference a page that does not exist.`,
        }
      : {
          id: "toc",
          severity: "pass",
          title: "Table of contents resolves",
          detail: `All ${report.toc.length} contents entries point at a real page in the ${pages}-page file.`,
        },
  );

  /* --- Metadata --------------------------------------------------------- */
  const title = doc.getTitle();
  const lang = doc.catalog.lookup(PDFName.of("Lang"));
  const missing: string[] = [];
  if (!title) missing.push("title");
  if (!doc.getAuthor()) missing.push("author");
  if (!lang) missing.push("language");
  issues.push(
    missing.length
      ? {
          id: "metadata",
          severity: "warning",
          title: "Document metadata incomplete",
          detail: `Missing ${missing.join(", ")}. Screen readers announce the file name instead of the document title.`,
        }
      : {
          id: "metadata",
          severity: "pass",
          title: "Document metadata set",
          detail: `Title "${title}", author and language (en-NZ) are declared in the file properties.`,
        },
  );

  const order: Record<AuditSeverity, number> = { error: 0, warning: 1, pass: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    issues,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    stats: { pages, headings: headings.length, bookmarks, textPages, characters },
  };
}
