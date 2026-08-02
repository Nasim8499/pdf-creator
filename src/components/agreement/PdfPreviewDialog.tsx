import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, RefreshCw, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Agreement } from "@/lib/agreement";
import { pdfFileName } from "@/lib/pdf";
import type { AuditResult, AuditSeverity } from "@/lib/pdf-audit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement: Agreement | null;
  label?: string | undefined;
};

const severityIcon: Record<AuditSeverity, typeof CheckCircle2> = {
  error: XCircle,
  warning: AlertTriangle,
  pass: CheckCircle2,
};

const severityClass: Record<AuditSeverity, string> = {
  error: "text-destructive",
  warning: "text-amber-600 dark:text-amber-500",
  pass: "text-emerald-600 dark:text-emerald-500",
};

/**
 * Builds the real PDF, audits its accessibility (headings, outline, selectable
 * text), shows both inline, and only then downloads the file.
 */
export function PdfPreviewDialog({ open, onOpenChange, agreement, label }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<number | null>(null);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!open || !agreement) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setBuilding(true);
    setError(null);
    setUrl(null);
    setPages(null);
    setAudit(null);

    (async () => {
      try {
        const { buildAgreementPdf } = await import("@/lib/pdf-build");
        const { auditAgreementPdf } = await import("@/lib/pdf-audit");
        const report = { headings: [], toc: [], pageCount: 0 };
        const bytes = await buildAgreementPdf(agreement, report);
        if (cancelled) return;
        const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        const result = await auditAgreementPdf(bytes, report);
        if (cancelled) return;
        setPages(report.pageCount);
        setAudit(result);
        setUrl(objectUrl);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not build the PDF");
      } finally {
        if (!cancelled) setBuilding(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl!), 500);
    };
  }, [open, agreement, nonce]);

  const fileName = agreement ? `${pdfFileName(agreement, label)}.pdf` : "agreement.pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col overflow-y-auto sm:w-full">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-lg">Check the PDF before downloading</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            This is the exact file that will be saved. Scroll through the pages and review the
            accessibility audit{pages ? ` — ${pages} pages` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <div className="h-[45vh] overflow-hidden rounded-md border border-border bg-muted/40 md:h-[60vh]">

            {building ? (
              <div
                role="status"
                aria-live="polite"
                className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Building the PDF…
              </div>
            ) : error ? (
              <div
                role="alert"
                className="flex h-full items-center justify-center p-6 text-sm text-destructive"
              >
                {error}
              </div>
            ) : url ? (
              <iframe src={url} title={`PDF preview of ${fileName}`} className="size-full" />
            ) : null}
          </div>

          <section
            aria-labelledby="pdf-audit-heading"
            className="flex max-h-[42vh] flex-col overflow-hidden rounded-md border border-border md:h-[60vh] md:max-h-none"
          >
            <header className="border-b border-border bg-muted/40 px-3 py-2">
              <h3
                id="pdf-audit-heading"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Accessibility audit
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground" aria-live="polite">
                {building
                  ? "Checking headings, outline and selectable text…"
                  : audit
                    ? audit.errors > 0
                      ? `${audit.errors} problem${audit.errors > 1 ? "s" : ""} found${audit.warnings ? `, ${audit.warnings} warning${audit.warnings > 1 ? "s" : ""}` : ""}.`
                      : audit.warnings > 0
                        ? `No blocking problems, ${audit.warnings} warning${audit.warnings > 1 ? "s" : ""}.`
                        : "All checks passed."
                    : "Waiting for the build."}
              </p>
            </header>

            <ul className="flex-1 divide-y divide-border overflow-y-auto text-sm">
              {audit?.issues.map((issue) => {
                const Icon = severityIcon[issue.severity];
                return (
                  <li key={issue.id + issue.title} className="flex gap-2 px-3 py-2.5">
                    <Icon
                      className={`mt-0.5 size-4 shrink-0 ${severityClass[issue.severity]}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium leading-snug">
                        <span className="sr-only">{issue.severity}: </span>
                        {issue.title}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                        {issue.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {audit ? (
              <footer className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                {audit.stats.pages} pages · {audit.stats.headings} headings ·{" "}
                {audit.stats.bookmarks} bookmarks · {audit.stats.textPages} pages with text
              </footer>
            ) : null}
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setNonce((n) => n + 1)}
            disabled={building}
            className="sm:mr-auto"
          >
            <RefreshCw className="size-4" aria-hidden="true" /> Rebuild &amp; re-audit
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Keep editing
            </Button>
            <Button
              disabled={!url}
              onClick={() => {
                if (!url) return;
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            >
              <Download className="size-4" aria-hidden="true" />
              {audit && audit.errors > 0 ? "Download anyway" : "Download PDF"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
