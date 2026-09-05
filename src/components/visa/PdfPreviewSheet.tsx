import { useEffect, useState } from "react";
import { Download, Loader2, Pencil, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CountryConfig } from "@/lib/visa/countries";
import { DISCLAIMER } from "@/lib/visa/countries";
import type { Values } from "@/lib/visa/storage";
import { buildVisaPdf, visaFileName } from "@/lib/visa/pdf";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  country: CountryConfig;
  values: Values;
  onEdit: () => void;
};

export function PdfPreviewSheet({ open, onOpenChange, country, values, onEdit }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [pages, setPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setBusy(true);
    setError(null);
    setUrl(null);

    (async () => {
      try {
        const report = { pageCount: 0, sections: 0, fields: 0 };
        const bytes = await buildVisaPdf(country, values, report);
        if (cancelled) return;
        const b = new Blob([bytes as BlobPart], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(b);
        setBlob(b);
        setPages(report.pageCount);
        setUrl(objectUrl);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not build the PDF");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl!), 500);
    };
  }, [open, country, values]);

  const fileName = visaFileName(country, values);

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], fileName, { type: "application/pdf" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: `${country.name} preparation sheet`, text: DISCLAIMER });
      } catch {
        /* user cancelled */
      }
    } else {
      download();
      toast("Sharing isn't available here — the file was downloaded instead.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94dvh] w-[calc(100vw-1rem)] max-w-3xl flex-col gap-3 overflow-y-auto p-4 sm:w-full sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-lg">
            {country.flag} {country.name} preparation sheet
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {DISCLAIMER}
            {pages ? ` · ${pages} pages` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="h-[52dvh] overflow-hidden rounded-xl border border-border bg-muted/40">
          {busy ? (
            <div
              role="status"
              aria-live="polite"
              className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Building your PDF…
            </div>
          ) : error ? (
            <p role="alert" className="p-6 text-center text-sm text-destructive">
              {error}
            </p>
          ) : url ? (
            <iframe src={url} title={`PDF preview — ${fileName}`} className="size-full" />
          ) : null}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="outline" className="h-12 sm:h-10" onClick={onEdit}>
            <Pencil className="size-4" aria-hidden="true" /> Edit
          </Button>
          <Button variant="secondary" className="h-12 sm:h-10" disabled={!blob} onClick={share}>
            <Share2 className="size-4" aria-hidden="true" /> Share
          </Button>
          <Button className="col-span-2 h-12 sm:col-span-1 sm:h-10" disabled={!url} onClick={download}>
            <Download className="size-4" aria-hidden="true" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
