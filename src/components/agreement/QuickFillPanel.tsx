import { Plus, Trash2, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { complianceRules } from "@/lib/compliance";
import { uid, type Agreement, type Party } from "@/lib/agreement";

type Props = {
  value: Agreement;
  onChange: (updater: (prev: Agreement) => Agreement) => void;
};

/** Inline screen: returns the first blocked rule matched by this input. */
export function checkFieldText(text: string) {
  if (!text.trim()) return null;
  for (const rule of complianceRules) {
    rule.re.lastIndex = 0;
    if (rule.re.test(text)) return rule;
  }
  return null;
}

const inputClass = "h-11 text-base sm:h-9 sm:text-sm";

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const issue = checkFieldText(value);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder ?? ""}
        aria-invalid={issue ? true : undefined}
        className={`${inputClass} ${issue ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
        onChange={(e) => onChange(e.target.value)}
      />
      {issue ? (
        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-destructive">
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          <span>
            <strong className="font-semibold">{issue.label}</strong> — {issue.hint} Export is
            blocked while this stays here.
          </span>
        </p>
      ) : null}
    </div>
  );
}

function PartyQuickFields({
  who,
  party,
  onPatch,
}: {
  who: "Employer" | "Employee";
  party: Party;
  onPatch: (patch: Partial<Party>) => void;
}) {
  const k = who.toLowerCase();
  const isEmployer = who === "Employer";
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {who}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id={`${k}-name`}
          label={isEmployer ? "Entity name" : "Name"}
          value={party.name}
          onChange={(v) => onPatch({ name: v })}
        />
        <Field
          id={`${k}-legal`}
          label="Full legal name"
          value={party.legalName ?? ""}
          onChange={(v) => onPatch({ legalName: v })}
        />
        <Field
          id={`${k}-reg`}
          label={isEmployer ? "NZBN / company no." : "IRD / party reference"}
          value={party.registration ?? ""}
          onChange={(v) => onPatch({ registration: v })}
        />
        <Field
          id={`${k}-position`}
          label={isEmployer ? "Business activity" : "Designated position"}
          value={party.position ?? ""}
          onChange={(v) => onPatch({ position: v })}
        />
        <div className="sm:col-span-2">
          <Field
            id={`${k}-address`}
            label="Address"
            value={party.address}
            onChange={(v) => onPatch({ address: v })}
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            id={`${k}-postal`}
            label="Postal address (optional)"
            value={party.postalAddress ?? ""}
            onChange={(v) => onPatch({ postalAddress: v })}
          />
        </div>
        <Field
          id={`${k}-contact`}
          label="Contact"
          value={party.contact}
          onChange={(v) => onPatch({ contact: v })}
        />
        <Field
          id={`${k}-website`}
          label="Website (optional)"
          value={party.website ?? ""}
          onChange={(v) => onPatch({ website: v })}
        />
      </div>
    </section>
  );
}

/**
 * Fast path for the fields that change document-to-document: the two parties,
 * the dates and the party-supplied reference numbers. Everything else (clauses,
 * design, sponsors) stays in the full editor.
 */
export function QuickFillPanel({ value, onChange }: Props) {
  const patchParty = (who: "employer" | "employee", patch: Partial<Party>) =>
    onChange((prev) => ({ ...prev, [who]: { ...prev[who], ...patch } }));

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Change only the details that vary per agreement — parties, dates and your own file or
          application reference numbers. The clause text and layout stay exactly as they are.
          Reference numbers here are party-supplied; agency-issued IDs, visa statuses and
          accreditation portals are flagged inline and blocked from the export.
        </p>
      </div>

      <PartyQuickFields
        who="Employer"
        party={value.employer}
        onPatch={(p) => patchParty("employer", p)}
      />
      <PartyQuickFields
        who="Employee"
        party={value.employee}
        onPatch={(p) => patchParty("employee", p)}
      />

      <section className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Dates
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            id="q-agreement-date"
            label="Agreement date"
            type="date"
            value={value.agreementDate}
            onChange={(v) => onChange((prev) => ({ ...prev, agreementDate: v }))}
          />
          <Field
            id="q-start-date"
            label="Start date"
            type="date"
            value={value.startDate}
            onChange={(v) => onChange((prev) => ({ ...prev, startDate: v }))}
          />
          <Field
            id="q-end-date"
            label="End date (optional)"
            type="date"
            value={value.endDate}
            onChange={(v) => onChange((prev) => ({ ...prev, endDate: v }))}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h3 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Reference details — party-supplied
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="h-10 shrink-0 sm:h-8"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                references: [...(prev.references ?? []), { id: uid(), label: "", value: "" }],
              }))
            }
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Your own file, offer or application numbers. These carry no status with any government
          agency.
        </p>
        <div className="space-y-3">
          {(value.references ?? []).map((r) => {
            const issue = checkFieldText(`${r.label} ${r.value}`);
            return (
              <div key={r.id} className="space-y-1.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <Input
                    value={r.label}
                    placeholder="Label (e.g. Employer file no.)"
                    className={`${inputClass} ${issue ? "border-destructive" : ""}`}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        references: prev.references.map((x) =>
                          x.id === r.id ? { ...x, label: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                  <Input
                    value={r.value}
                    placeholder="Number"
                    className={`col-span-2 sm:col-span-1 ${inputClass} ${issue ? "border-destructive" : ""}`}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        references: prev.references.map((x) =>
                          x.id === r.id ? { ...x, value: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove reference"
                    className="size-11 shrink-0 sm:size-9"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        references: prev.references.filter((x) => x.id !== r.id),
                      }))
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                {issue ? (
                  <p className="flex items-start gap-1.5 text-[11px] leading-snug text-destructive">
                    <AlertTriangle className="mt-px size-3.5 shrink-0" />
                    <span>
                      <strong className="font-semibold">{issue.label}</strong> — {issue.hint}
                    </span>
                  </p>
                ) : null}
              </div>
            );
          })}
          {(value.references ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No reference numbers yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
