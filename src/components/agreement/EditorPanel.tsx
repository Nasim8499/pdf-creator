import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "./RichTextEditor";
import { LogoPicker } from "./LogoPicker";
import { uid, type Agreement, type Party } from "@/lib/agreement";

type Props = {
  value: Agreement;
  onChange: (updater: (prev: Agreement) => Agreement) => void;
};

function SectionTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

function PartyFields({
  title,
  party,
  entity,
  onChange,
}: {
  title: string;
  party: Party;
  entity?: boolean;
  onChange: (patch: Partial<Party>) => void;
}) {
  const field = (label: string, key: keyof Party, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        value={(party[key] as string) ?? ""}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange({ [key]: e.target.value } as Partial<Party>)}
      />
    </div>
  );
  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-card p-3">
      <div className="text-sm font-semibold">{title}</div>
      <LogoPicker
        label={`${title} logo`}
        value={party.logo}
        onChange={(logo) => onChange({ logo })}
      />
      {field(entity ? "Entity name (as used in the document)" : "Name", "name")}
      {field(entity ? "Full legal entity name" : "Full legal name", "legalName")}
      {field(entity ? "NZBN / company number" : "Tax / IRD reference", "registration")}
      {field(entity ? "Registered address" : "Residential address", "address")}
      {field("Postal address", "postalAddress", "Optional")}
      {field("Contact", "contact")}
      {entity ? field("Website", "website") : null}
      {field(entity ? "Business activity" : "Designated position", "position")}
      {field("Additional detail", "extra")}
    </div>
  );
}

export function EditorPanel({ value, onChange }: Props) {
  const set = (patch: Partial<Agreement>) => onChange((p) => ({ ...p, ...patch }));

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <SectionTitle>Document</SectionTitle>
        <div className="space-y-1.5">
          <Label className="text-xs">Title</Label>
          <Input
            value={value.documentTitle}
            onChange={(e) => set({ documentTitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Subtitle</Label>
          <Input value={value.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Page header</Label>
            <Input value={value.headerText} onChange={(e) => set({ headerText: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Page footer</Label>
            <Input value={value.footerText} onChange={(e) => set({ footerText: e.target.value })} />
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle>Private-record notice</SectionTitle>
        <p className="text-xs text-muted-foreground">
          Printed prominently on the first page of the agreement and on the cover.
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Notice heading</Label>
          <Input value={value.noticeTitle} onChange={(e) => set({ noticeTitle: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Notice text</Label>
          <Textarea
            rows={5}
            value={value.noticeText}
            onChange={(e) => set({ noticeText: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle>Parties</SectionTitle>
        <PartyFields
          title="Employer"
          entity
          party={value.employer}
          onChange={(patch) => set({ employer: { ...value.employer, ...patch } })}
        />
        <PartyFields
          title="Employee"
          party={value.employee}
          onChange={(patch) => set({ employee: { ...value.employee, ...patch } })}
        />
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                set({
                  references: [...value.references, { id: uid(), label: "Reference", value: "" }],
                })
              }
            >
              <Plus className="size-3.5" /> Reference
            </Button>
          }
        >
          Reference details (party-supplied)
        </SectionTitle>
        <p className="text-xs text-muted-foreground">
          Your own internal file or reference numbers only. Agency-issued IDs, visa statuses and
          accreditation numbers are blocked by the compliance check.
        </p>
        {value.references.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <Input
              value={r.label}
              placeholder="Label"
              onChange={(e) =>
                set({
                  references: value.references.map((x) =>
                    x.id === r.id ? { ...x, label: e.target.value } : x,
                  ),
                })
              }
            />
            <Input
              value={r.value}
              placeholder="Number"
              onChange={(e) =>
                set({
                  references: value.references.map((x) =>
                    x.id === r.id ? { ...x, value: e.target.value } : x,
                  ),
                })
              }
            />
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete reference"
              onClick={() => set({ references: value.references.filter((x) => x.id !== r.id) })}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="space-y-1.5">
          <Label className="text-xs">Note printed under the table</Label>
          <Textarea
            rows={3}
            value={value.referencesNote}
            onChange={(e) => set({ referencesNote: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Include</span>
              <Switch
                checked={value.letter.enabled}
                aria-label="Include the covering letter"
                onCheckedChange={(checked) =>
                  set({ letter: { ...value.letter, enabled: checked } })
                }
              />
            </div>
          }
        >
          Work Employment Agreement Letter
        </SectionTitle>
        <div className="space-y-2.5 rounded-lg border border-border bg-card p-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Letter heading</Label>
              <Input
                value={value.letter.title}
                onChange={(e) => set({ letter: { ...value.letter, title: e.target.value } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reference line</Label>
              <Input
                value={value.letter.reference}
                onChange={(e) => set({ letter: { ...value.letter, reference: e.target.value } })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Salutation</Label>
            <Input
              value={value.letter.salutation}
              onChange={(e) => set({ letter: { ...value.letter, salutation: e.target.value } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Letter body</Label>
            <RichTextEditor
              value={value.letter.html}
              onChange={(html) => set({ letter: { ...value.letter, html } })}
            />
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Sign-off</Label>
              <Input
                value={value.letter.signOff}
                onChange={(e) => set({ letter: { ...value.letter, signOff: e.target.value } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Signer name</Label>
              <Input
                value={value.letter.signerName}
                onChange={(e) => set({ letter: { ...value.letter, signerName: e.target.value } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Signer title</Label>
              <Input
                value={value.letter.signerTitle}
                onChange={(e) => set({ letter: { ...value.letter, signerTitle: e.target.value } })}
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle>Dates</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Agreement date</Label>
            <Input
              type="date"
              value={value.agreementDate}
              onChange={(e) => set({ agreementDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Commencement</Label>
            <Input
              type="date"
              value={value.startDate}
              onChange={(e) => set({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">End (optional)</Label>
            <Input
              type="date"
              value={value.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </div>
        </div>
      </section>

      <Separator />


      <section className="space-y-3">
        <SectionTitle
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                set({
                  clauses: [
                    ...value.clauses,
                    { id: uid(), heading: "New clause", html: "<p>Clause text…</p>" },
                  ],
                })
              }
            >
              <Plus className="size-3.5" /> Clause
            </Button>
          }
        >
          Clauses
        </SectionTitle>

        {value.clauses.map((clause, index) => (
          <div key={clause.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={clause.heading}
                onChange={(e) =>
                  set({
                    clauses: value.clauses.map((c) =>
                      c.id === clause.id ? { ...c, heading: e.target.value } : c,
                    ),
                  })
                }
                className="font-medium"
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Move clause up"
                disabled={index === 0}
                onClick={() => {
                  const next = [...value.clauses];
                  const moved = next.splice(index, 1)[0];
                  if (moved) next.splice(index - 1, 0, moved);
                  set({ clauses: next });
                }}
              >
                ↑
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Move clause down"
                disabled={index === value.clauses.length - 1}
                onClick={() => {
                  const next = [...value.clauses];
                  const moved = next.splice(index, 1)[0];
                  if (moved) next.splice(index + 1, 0, moved);
                  set({ clauses: next });
                }}
              >
                ↓
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete clause"
                onClick={() => set({ clauses: value.clauses.filter((c) => c.id !== clause.id) })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <RichTextEditor
              value={clause.html}
              onChange={(html) =>
                set({
                  clauses: value.clauses.map((c) => (c.id === clause.id ? { ...c, html } : c)),
                })
              }
            />
          </div>
        ))}
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                set({
                  consents: [
                    ...value.consents,
                    { id: uid(), label: "New acknowledgement", text: "", acknowledged: false },
                  ],
                })
              }
            >
              <Plus className="size-3.5" /> Consent
            </Button>
          }
        >
          Acknowledgements & consents
        </SectionTitle>

        {value.consents.map((consent) => (
          <div key={consent.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <Input
                value={consent.label}
                placeholder="Label"
                onChange={(e) =>
                  set({
                    consents: value.consents.map((c) =>
                      c.id === consent.id ? { ...c, label: e.target.value } : c,
                    ),
                  })
                }
              />
              <div className="flex shrink-0 items-center gap-2">
                <Switch
                  checked={consent.acknowledged}
                  onCheckedChange={(checked) =>
                    set({
                      consents: value.consents.map((c) =>
                        c.id === consent.id ? { ...c, acknowledged: checked } : c,
                      ),
                    })
                  }
                  aria-label="Mark as acknowledged"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete consent"
                  onClick={() =>
                    set({ consents: value.consents.filter((c) => c.id !== consent.id) })
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Textarea
              rows={3}
              value={consent.text}
              placeholder="Acknowledgement wording"
              onChange={(e) =>
                set({
                  consents: value.consents.map((c) =>
                    c.id === consent.id ? { ...c, text: e.target.value } : c,
                  ),
                })
              }
            />
          </div>
        ))}
      </section>

      <Separator />

      <section className="space-y-3">
        <SectionTitle
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                set({
                  signatures: [
                    ...value.signatures,
                    {
                      id: uid(),
                      role: "Witness",
                      name: "",
                      title: "",
                      organisation: "",
                      signatureLabel: "Signature",
                      dateLabel: "Date signed",
                      dateValue: "",
                    },
                  ],
                })
              }
            >
              <Plus className="size-3.5" /> Block
            </Button>
          }
        >
          Signature blocks
        </SectionTitle>

        {value.signatures.map((sig) => {
          const patch = (p: Partial<typeof sig>) =>
            set({
              signatures: value.signatures.map((s) => (s.id === sig.id ? { ...s, ...p } : s)),
            });
          return (
            <div key={sig.id} className="space-y-2.5 rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={sig.role}
                  placeholder="Role"
                  onChange={(e) => patch({ role: e.target.value })}
                  className="font-medium"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete signature block"
                  onClick={() =>
                    set({ signatures: value.signatures.filter((s) => s.id !== sig.id) })
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={sig.name} onChange={(e) => patch({ name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input value={sig.title} onChange={(e) => patch({ title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Organisation</Label>
                  <Input
                    value={sig.organisation}
                    onChange={(e) => patch({ organisation: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Signature line label</Label>
                  <Input
                    value={sig.signatureLabel}
                    onChange={(e) => patch({ signatureLabel: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date label</Label>
                  <Input
                    value={sig.dateLabel}
                    onChange={(e) => patch({ dateLabel: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date signed</Label>
                  <Input
                    type="date"
                    value={sig.dateValue}
                    onChange={(e) => patch({ dateValue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
