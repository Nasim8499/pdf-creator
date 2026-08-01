import { Check, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agreementTemplates, applyTemplate } from "@/lib/templates";
import type { Agreement } from "@/lib/agreement";

type Props = {
  value: Agreement;
  onChange: (updater: (prev: Agreement) => Agreement) => void;
};

/** Swaps the whole document body between agreement types. */
export function TemplatePicker({ value, onChange }: Props) {
  const active = value.templateId ?? "individual";

  return (
    <section
      aria-labelledby="templates-heading"
      className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4"
    >
      <div className="flex items-center gap-2">
        <LayoutTemplate className="size-3.5 text-muted-foreground" />
        <h3
          id="templates-heading"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Agreement template
        </h3>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Switching a template replaces the clauses and consents. Party details, logos and layout
        settings are kept.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {agreementTemplates.map((t) => {
          const selected = t.id === active;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange((prev) => applyTemplate(prev, t))}
                className={`w-full rounded-md border p-3 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{t.label}</span>
                  {selected ? <Check className="size-4 shrink-0 text-primary" /> : null}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                  {t.blurb}
                </span>
                <span className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t.clauses.length} clauses
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {active !== "individual" ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full text-xs"
          onClick={() => onChange((prev) => applyTemplate(prev, agreementTemplates[0]!))}
        >
          Back to the individual employment template
        </Button>
      ) : null}
    </section>
  );
}
