import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { ComplianceFinding } from "@/lib/compliance";

export function CompliancePanel({ findings }: { findings: ComplianceFinding[] }) {
  const ok = findings.length === 0;
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        {ok ? (
          <ShieldCheck className="size-4 text-emerald-600" />
        ) : (
          <ShieldAlert className="size-4 text-destructive" />
        )}
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Compliance check
        </h2>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${
            ok ? "bg-emerald-600/10 text-emerald-700" : "bg-destructive/10 text-destructive"
          }`}
        >
          {ok ? "Clear" : `${findings.length} blocked`}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Government-issued fields — immigration or client IDs, visa statuses and decisions,
        accreditation numbers, official application references, verification portals and agency
        branding — cannot be included in the exported PDF.
      </p>

      {ok ? (
        <p className="text-xs text-muted-foreground">
          Nothing found. This document reads as a private record and can be exported.
        </p>
      ) : (
        <ul className="space-y-2">
          {findings.slice(0, 20).map((f, i) => (
            <li
              key={`${f.ruleId}-${i}`}
              className="rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
                {f.label}
              </div>
              <div className="mt-0.5 text-xs font-medium">{f.field}</div>
              <div className="mt-0.5 break-words text-[11px] text-muted-foreground">
                “{f.excerpt}”
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{f.hint}</div>
            </li>
          ))}
          {findings.length > 20 ? (
            <li className="text-[11px] text-muted-foreground">
              …and {findings.length - 20} more.
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
