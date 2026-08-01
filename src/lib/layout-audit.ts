import type { DocSettings } from "./agreement";

export type AuditLevel = "error" | "warning" | "ok";

export type AuditIssue = {
  id: string;
  level: Exclude<AuditLevel, "ok">;
  title: string;
  detail: string;
};

/** Where each anchored block landed, used to detect drift between runs. */
export type LayoutFingerprint = {
  pageCount: number;
  /** Anchor id -> 1-based page number. */
  anchors: Record<string, number>;
  /** Clause id -> printed clause number. */
  clauseNumbers: Record<string, number>;
  sectionSpacing: number;
  clauseSpacing: number;
  pageSize: string;
  marginX: number;
  marginY: number;
};

export type LayoutReport = {
  checkedAt: string;
  pageCount: number;
  issues: AuditIssue[];
  fingerprint: LayoutFingerprint;
};

export type AuditBlockMeta = {
  id: string;
  kind: "cover" | "toc" | "title" | "band" | "clause" | "consent" | "signature" | "other";
  label: string;
  height: number;
  keepWithNext?: boolean | undefined;
  breakBefore?: boolean | undefined;
};

export type AuditInput = {
  blocks: AuditBlockMeta[];
  pages: number[][];
  packHeight: number;
  settings: DocSettings;
  headerHeight: number;
  footerHeight: number;
};

export function buildReport(input: AuditInput, baseline?: LayoutFingerprint | null): LayoutReport {
  const { blocks, pages, packHeight, settings: s } = input;
  const issues: AuditIssue[] = [];
  const anchors: Record<string, number> = {};
  const clauseNumbers: Record<string, number> = {};

  let clauseSeq = 0;
  blocks.forEach((b) => {
    if (b.kind === "clause") clauseNumbers[b.id] = ++clauseSeq;
  });

  pages.forEach((page, pageIndex) => {
    const pageNo = pageIndex + 1;
    let used = 0;
    page.forEach((i) => {
      const b = blocks[i];
      if (!b) return;
      used += b.height;
      if (b.kind === "band" || b.kind === "cover" || b.kind === "toc") anchors[b.id] = pageNo;
      if (b.kind === "clause") anchors[`clause:${b.id}`] = pageNo;
    });

    if (!page.length) {
      issues.push({
        id: `empty-${pageNo}`,
        level: "warning",
        title: `Page ${pageNo} is empty`,
        detail: "A forced break left a blank page. Relax strict breaks or shorten the section above.",
      });
    }

    if (used > packHeight + 1) {
      issues.push({
        id: `overflow-${pageNo}`,
        level: "error",
        title: `Page ${pageNo} overflows by ${Math.round(used - packHeight)}px`,
        detail:
          "A single block is taller than the printable area, so content will be clipped in the PDF. Reduce margins, split the clause, or lower the spacing values.",
      });
    }

    const lastIndex = page[page.length - 1];
    const last = lastIndex === undefined ? undefined : blocks[lastIndex];
    if (last && (last.kind === "band" || last.keepWithNext)) {
      issues.push({
        id: `orphan-${pageNo}`,
        level: "error",
        title: `"${last.label}" is stranded at the bottom of page ${pageNo}`,
        detail: "The heading prints without the content that follows it.",
      });
    }
  });

  // Clause numbering must run 1..n with no gaps or repeats.
  const seen = Object.values(clauseNumbers);
  const expected = seen.length === 0 || seen.every((n, i) => n === i + 1);
  if (!expected) {
    issues.push({
      id: "clause-sequence",
      level: "error",
      title: "Clause numbering is out of sequence",
      detail: "Numbers must run consecutively from 01. Reorder or renumber the clauses.",
    });
  }

  if (!s.strictBreaks) {
    issues.push({
      id: "strict-breaks",
      level: "warning",
      title: "Strict Part breaks are off",
      detail:
        "Part A–D bands can drift between pages as you edit. Turn strict breaks on to pin each Part to a fresh page.",
    });
  }

  if (s.showPageNumbers && !s.showFooter) {
    issues.push({
      id: "page-numbers-hidden",
      level: "warning",
      title: "Page numbers are enabled but the footer is hidden",
      detail: "Page numbering will not appear in the exported PDF.",
    });
  }

  if (s.logo.showInHeader && s.showHeader && s.logo.headerHeight + Math.abs(s.logo.offsetY) > 40) {
    issues.push({
      id: "header-logo",
      level: "warning",
      title: "Header logo is taller than the header band",
      detail: "Reduce the header logo height or the vertical nudge so it stays inside every page header.",
    });
  }

  if (s.logo.showInFooter && s.showFooter && s.logo.footerHeight + Math.abs(s.logo.offsetY) > 28) {
    issues.push({
      id: "footer-logo",
      level: "warning",
      title: "Footer logo is taller than the footer band",
      detail: "Reduce the footer logo height so it stays clear of the page number row.",
    });
  }

  const sponsorInChrome = s.sponsorLogo.inHeader || s.sponsorLogo.inFooter;
  if (sponsorInChrome && s.showSponsorStrip && !s.sponsors.length) {
    issues.push({
      id: "sponsor-empty",
      level: "warning",
      title: "Sponsor marks are enabled with no sponsors added",
      detail: "Add at least one sponsor, or turn the sponsor strip off.",
    });
  }

  if (s.sponsorLogo.inFooter && s.showFooter && s.sponsorLogo.markHeight + s.sponsorLogo.marginY * 2 > 30) {
    issues.push({
      id: "sponsor-footer-size",
      level: "warning",
      title: "Sponsor mark is too tall for the footer",
      detail: "Lower the sponsor mark height or its vertical margin to keep footers identical on every page.",
    });
  }

  const fingerprint: LayoutFingerprint = {
    pageCount: pages.length,
    anchors,
    clauseNumbers,
    sectionSpacing: s.sectionSpacing,
    clauseSpacing: s.clauseSpacing,
    pageSize: s.pageSize,
    marginX: s.marginX,
    marginY: s.marginY,
  };

  if (baseline) {
    if (baseline.pageCount !== fingerprint.pageCount) {
      issues.push({
        id: "drift-pages",
        level: "warning",
        title: `Page count changed: ${baseline.pageCount} → ${fingerprint.pageCount}`,
        detail: "The document is a different length than the locked baseline.",
      });
    }
    const moved = Object.entries(fingerprint.anchors).filter(
      ([id, page]) => baseline.anchors[id] !== undefined && baseline.anchors[id] !== page,
    );
    const movedBands = moved.filter(([id]) => !id.startsWith("clause:"));
    if (movedBands.length) {
      issues.push({
        id: "drift-bands",
        level: "error",
        title: `${movedBands.length} section band${movedBands.length > 1 ? "s" : ""} shifted page`,
        detail: movedBands
          .slice(0, 4)
          .map(([id, page]) => `${id}: page ${baseline.anchors[id]} → ${page}`)
          .join(" · "),
      });
    }
    const movedClauses = moved.length - movedBands.length;
    if (movedClauses > 0) {
      issues.push({
        id: "drift-clauses",
        level: "warning",
        title: `${movedClauses} clause${movedClauses > 1 ? "s" : ""} moved to a different page`,
        detail: "Expected when you edit clause text; re-lock the baseline once the layout looks right.",
      });
    }
    const renumbered = Object.entries(fingerprint.clauseNumbers).filter(
      ([id, n]) => baseline.clauseNumbers[id] !== undefined && baseline.clauseNumbers[id] !== n,
    );
    if (renumbered.length) {
      issues.push({
        id: "drift-numbers",
        level: "error",
        title: `${renumbered.length} clause number${renumbered.length > 1 ? "s" : ""} changed`,
        detail: "Clause numbering differs from the locked baseline — cross-references may be wrong.",
      });
    }
    if (
      baseline.sectionSpacing !== fingerprint.sectionSpacing ||
      baseline.clauseSpacing !== fingerprint.clauseSpacing
    ) {
      issues.push({
        id: "drift-spacing",
        level: "warning",
        title: "Section or clause spacing changed since the baseline",
        detail: `Bands ${baseline.sectionSpacing}→${fingerprint.sectionSpacing}px · clauses ${baseline.clauseSpacing}→${fingerprint.clauseSpacing}px.`,
      });
    }
    if (
      baseline.pageSize !== fingerprint.pageSize ||
      baseline.marginX !== fingerprint.marginX ||
      baseline.marginY !== fingerprint.marginY
    ) {
      issues.push({
        id: "drift-geometry",
        level: "warning",
        title: "Page geometry changed since the baseline",
        detail: `${baseline.pageSize} ${baseline.marginX}/${baseline.marginY}px → ${fingerprint.pageSize} ${fingerprint.marginX}/${fingerprint.marginY}px.`,
      });
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    pageCount: pages.length,
    issues,
    fingerprint,
  };
}

export const errorCount = (r: LayoutReport | null) =>
  r ? r.issues.filter((i) => i.level === "error").length : 0;

export const warningCount = (r: LayoutReport | null) =>
  r ? r.issues.filter((i) => i.level === "warning").length : 0;
