import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Agreement } from "@/lib/agreement";

type Props = {
  value: Agreement;
  onChange: (updater: (prev: Agreement) => Agreement) => void;
};

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/**
 * Branding for every generated PDF: the cover title, the organisation shown on
 * the cover and signature blocks, and the effective date used throughout.
 */
export function BrandingPanel({ value, onChange }: Props) {
  const set = (patch: Partial<Agreement>) => onChange((p) => ({ ...p, ...patch }));
  const setEmployer = (patch: Partial<Agreement["employer"]>) =>
    onChange((p) => ({ ...p, employer: { ...p.employer, ...patch } }));

  return (
    <section aria-labelledby="branding-heading" className="space-y-4">
      <div>
        <h2
          id="branding-heading"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          PDF branding
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          These values appear on the cover page, page headers and the document properties of every
          exported PDF.
        </p>
      </div>

      <Field id="brand-title" label="Cover title">
        <Input
          id="brand-title"
          value={value.documentTitle}
          onChange={(e) => set({ documentTitle: e.target.value })}
          placeholder="Individual Employment Agreement"
        />
      </Field>

      <Field id="brand-subtitle" label="Cover subtitle">
        <Textarea
          id="brand-subtitle"
          rows={2}
          value={value.subtitle}
          onChange={(e) => set({ subtitle: e.target.value })}
        />
      </Field>

      <Field
        id="brand-org"
        label="Organisation name"
        hint="Used on the cover, headers and the employer signature block."
      >
        <Input
          id="brand-org"
          value={value.employer.name}
          onChange={(e) => setEmployer({ name: e.target.value, legalName: e.target.value })}
          placeholder="Employer Company Limited"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="brand-date" label="Effective date">
          <Input
            id="brand-date"
            type="date"
            value={value.agreementDate}
            onChange={(e) => set({ agreementDate: e.target.value })}
          />
        </Field>
        <Field id="brand-start" label="Commencement date">
          <Input
            id="brand-start"
            type="date"
            value={value.startDate}
            onChange={(e) => set({ startDate: e.target.value })}
          />
        </Field>
      </div>

      <Field id="brand-header" label="Page header text">
        <Input
          id="brand-header"
          value={value.headerText}
          onChange={(e) => set({ headerText: e.target.value })}
        />
      </Field>

      <Field id="brand-footer" label="Page footer text">
        <Textarea
          id="brand-footer"
          rows={2}
          value={value.footerText}
          onChange={(e) => set({ footerText: e.target.value })}
        />
      </Field>
    </section>
  );
}
