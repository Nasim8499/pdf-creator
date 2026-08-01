import { AlertTriangle, CheckCircle2, Lock, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorCount, warningCount, type LayoutReport } from "@/lib/layout-audit";

type Props = {
  report: LayoutReport | null;
  hasBaseline: boolean;
  baselineAt?: string | undefined;
  onLock: () => void;
  onClear: () => void;
};

export function LayoutAuditPanel({ report, hasBaseline, baselineAt, onLock, onClear }: Props) {
  const errors = errorCount(report);
  const warnings = warningCount(report);
  const clean = report !== null && errors === 0 && warnings === 0;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Layout validation
      </h2>

      <div className="rounded-md border border-border bg-card p-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              {clean ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : errors > 0 ? (
                <XCircle className="size-4 shrink-0 text-destructive" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              )}
              <span className="truncate">
                {report === null
                  ? "Measuring pages…"
                  : clean
                    ? "Layout is stable"
                    : `${errors} error${errors === 1 ? "" : "s"} · ${warnings} warning${warnings === 1 ? "" : "s"}`}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {report
                ? `${report.pageCount} pages · checked ${new Date(report.checkedAt).toLocaleTimeString()}`
                : "Runs automatically on every edit."}
            </p>
          </div>
          <Button size="sm" variant={hasBaseline ? "outline" : "default"} onClick={onLock}>
            {hasBaseline ? <RefreshCw className="size-3.5" /> : <Lock className="size-3.5" />}
            {hasBaseline ? "Re-lock" : "Lock baseline"}
          </Button>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {hasBaseline
            ? `Comparing against the baseline locked ${baselineAt ? new Date(baselineAt).toLocaleString() : ""}. Any page-numbering or section-spacing shift is flagged before you export.`
            : "Lock a baseline once the document looks right — later edits are then checked for page-numbering and section-spacing drift."}
        </p>
        {hasBaseline ? (
          <Button size="sm" variant="ghost" className="mt-1 h-7 px-2 text-[11px]" onClick={onClear}>
            Clear baseline
          </Button>
        ) : null}
      </div>

      {report && report.issues.length > 0 ? (
        <ul className="space-y-1.5">
          {report.issues.map((i) => (
            <li
              key={i.id}
              className="rounded-md border px-3 py-2"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <div className="flex items-start gap-2">
                {i.level === "error" ? (
                  <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-medium">{i.title}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {i.detail}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
