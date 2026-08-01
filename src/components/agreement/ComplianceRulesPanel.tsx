import { useMemo } from "react";
import { CheckCircle2, ShieldAlert, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { complianceRules, type ComplianceFinding } from "@/lib/compliance";
import { previewInzMapping } from "@/lib/inz-mapping";
import type { Agreement } from "@/lib/agreement";

export function ComplianceRulesPanel({
  agreement,
  findings,
  confirmed,
  onToggle,
  onConfirmAll,
  onApplyMapping,
  onToggleAppendix,
}: {
  agreement: Agreement;
  findings: ComplianceFinding[];
  confirmed: string[];
  onToggle: (ruleId: string, next: boolean) => void;
  onConfirmAll: () => void;
  onApplyMapping: () => void;
  onToggleAppendix: (next: boolean) => void;
}) {
  const byRule = useMemo(() => {
    const m: Record<string, ComplianceFinding[]> = {};
    findings.forEach((f) => {
      (m[f.ruleId] ??= []).push(f);
    });
    return m;
  }, [findings]);

  const preview = useMemo(() => previewInzMapping(agreement), [agreement]);
  const mapCount = preview.mapped.length + preview.excluded.length + preview.renamed.length;
  const outstanding = complianceRules.filter(
    (r) => (byRule[r.id]?.length ?? 0) > 0 || !confirmed.includes(r.id),
  ).length;

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        {outstanding === 0 ? (
          <ShieldCheck className="size-4 text-emerald-600" />
        ) : (
          <ShieldAlert className="size-4 text-amber-600" />
        )}
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Compliance rules
        </h2>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {complianceRules.length - outstanding}/{complianceRules.length} confirmed
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Confirm each blocked field type is absent before exporting. Rules with detected matches
        cannot be confirmed until the text is removed.
      </p>

      <ul className="space-y-1.5">
        {complianceRules.map((r) => {
          const hits = byRule[r.id]?.length ?? 0;
          const isConfirmed = hits === 0 && confirmed.includes(r.id);
          return (
            <li
              key={r.id}
              className={`flex gap-2.5 rounded-md border px-2.5 py-2 ${
                hits > 0
                  ? "border-destructive/40 bg-destructive/5"
                  : isConfirmed
                    ? "border-emerald-600/30 bg-emerald-600/5"
                    : "border-border"
              }`}
            >
              <Checkbox
                id={`rule-${r.id}`}
                className="mt-0.5"
                checked={isConfirmed}
                disabled={hits > 0}
                onCheckedChange={(v) => onToggle(r.id, v === true)}
              />
              <div className="min-w-0">
                <Label htmlFor={`rule-${r.id}`} className="text-xs font-semibold">
                  {r.label}
                </Label>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{r.hint}</p>
                {hits > 0 ? (
                  <p className="mt-1 text-[11px] font-medium text-destructive">
                    {hits} match{hits === 1 ? "" : "es"} found — export blocked.
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onConfirmAll} className="grow sm:grow-0">
          <CheckCircle2 className="size-4" /> Confirm all clear
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onApplyMapping}
          disabled={mapCount === 0}
          className="grow sm:grow-0"
        >
          <Wand2 className="size-4" /> Convert INZ inputs ({mapCount})
        </Button>
      </div>

      {mapCount > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          {preview.mapped.length} field{preview.mapped.length === 1 ? "" : "s"} would move into
          employer/employee particulars, {preview.excluded.length} agency-issued item
          {preview.excluded.length === 1 ? "" : "s"} would be removed, and{" "}
          {preview.renamed.length} label{preview.renamed.length === 1 ? "" : "s"} relabelled as
          party-supplied.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-md border border-border px-2.5 py-2">
        <Label htmlFor="appendix-toggle" className="text-xs">
          Print compliance appendix in the PDF
        </Label>
        <Switch
          id="appendix-toggle"
          checked={agreement.settings.showAppendix}
          onCheckedChange={onToggleAppendix}
        />
      </div>
    </section>
  );
}
