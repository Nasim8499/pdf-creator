import { CheckCircle2, FileDown, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { complianceRules, type ComplianceFinding } from "@/lib/compliance";
import { previewInzMapping } from "@/lib/inz-mapping";
import type { Agreement } from "@/lib/agreement";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement: Agreement;
  findings: ComplianceFinding[];
  confirmed: string[];
  onConfirm: () => void;
};

/** Pre-export summary of what goes into the PDF and what compliance removed. */
export function ExportConfirmDialog({
  open,
  onOpenChange,
  agreement,
  findings,
  confirmed,
  onConfirm,
}: Props) {
  const mapping = previewInzMapping(agreement);
  const blocked = findings.length > 0;
  const unconfirmed = complianceRules.filter((r) => !confirmed.includes(r.id));

  const included = [
    `Cover page and table of contents`,
    `${agreement.clauses.length} clause${agreement.clauses.length === 1 ? "" : "s"}`,
    `Employer and employee particulars (party-supplied)`,
    `${agreement.references?.length ?? 0} reference detail${(agreement.references?.length ?? 0) === 1 ? "" : "s"}`,
    `${agreement.signatures?.length ?? 0} signature block${(agreement.signatures?.length ?? 0) === 1 ? "" : "s"}`,
    agreement.settings.showAppendix ? "Compliance audit appendix" : null,
  ].filter(Boolean) as string[];

  const excluded = [
    ...mapping.excluded.map((e) => `Removed agency-issued item: ${e.label} — ${e.detail}`),
    ...mapping.renamed.map((r) => `Relabelled as party-supplied: ${r.label}`),
    ...findings.map((f) => `Blocked ${f.label} in ${f.field}`),
  ];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {blocked ? (
              <ShieldAlert className="size-4 text-destructive" />
            ) : (
              <ShieldCheck className="size-4 text-emerald-600" />
            )}
            Confirm PDF export
          </DialogTitle>
          <DialogDescription>
            Review the compliance audit trail before the PDF is generated.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[52dvh] pr-3">
          <div className="space-y-4">
            <section aria-labelledby="exp-inc">
              <h3
                id="exp-inc"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Included in the PDF
              </h3>
              <ul className="mt-2 space-y-1.5">
                {included.map((i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <CheckCircle2 className="mt-px size-3.5 shrink-0 text-emerald-600" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="exp-exc">
              <h3
                id="exp-exc"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Excluded / flagged
              </h3>
              {excluded.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Nothing excluded — no government-issued fields were detected.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {excluded.slice(0, 20).map((e, i) => (
                    <li key={`${e}-${i}`} className="flex gap-2 text-xs">
                      <XCircle className="mt-px size-3.5 shrink-0 text-destructive" />
                      <span className="break-words">{e}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {unconfirmed.length > 0 ? (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-[11px]">
                {unconfirmed.length} compliance rule{unconfirmed.length === 1 ? "" : "s"} not yet
                confirmed. Exporting from here confirms them:{" "}
                {unconfirmed.map((r) => r.label).join(", ")}.
              </p>
            ) : null}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="h-11 sm:h-9" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="h-11 sm:h-9" disabled={blocked} onClick={onConfirm}>
            <FileDown className="size-4" />
            {blocked ? "Export blocked" : "Generate PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
