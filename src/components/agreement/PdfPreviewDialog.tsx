import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement: Agreement | null;
  label?: string | undefined;
};

/**
 * Builds the real PDF, shows it inline so formatting can be verified, and only
 * then downloads the file.
 */
export function PdfPreviewDialog({ open, onOpenChange, agreement, label }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<number | null>(null);
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

    (async () => {
      try {
        const { buildAgreementPdf } = await import("@/lib/pdf-build");
        const bytes = await buildAgreementPdf(agreement);
        if (cancelled) return;
        const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        const { PDFDocument } = await import("pdf-lib");
        const loaded = await PDFDocument.load(bytes);
        if (cancelled) return;
        setPages(loaded.getPageCount());
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Check the PDF before downloading</DialogTitle>
          <DialogDescription>
            This is the exact file that will be saved. Scroll through the pages to verify the
            formatting{pages ? ` — ${pages} pages` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[60vh] overflow-hidden rounded-md border border-border bg-muted/40">
          {building ? (
            <div
              role="status"
              aria-live="polite"
              className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Building the PDF…
            </div>
          ) : error ? (
            <div role="alert" className="flex h-full items-center justify-center p-6 text-sm text-destructive">
              {error}
            </div>
          ) : url ? (
            <iframe src={url} title={`PDF preview of ${fileName}`} className="size-full" />
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setNonce((n) => n + 1)}
            disabled={building}
            className="sm:mr-auto"
          >
            <RefreshCw className="size-4" aria-hidden="true" /> Rebuild preview
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
              <Download className="size-4" aria-hidden="true" /> Download PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
