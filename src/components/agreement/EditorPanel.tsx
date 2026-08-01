import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "./RichTextEditor";
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
  onChange,
}: {
  title: string;
  party: Party;
  onChange: (patch: Partial<Party>) => void;
}) {
  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-card p-3">
      <div className="text-sm font-semibold">{title}</div>
      <div className="space-y-1.5">
        <Label className="text-xs">Name</Label>
        <Input value={party.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Address</Label>
        <Input value={party.address} onChange={(e) => onChange({ address: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Contact</Label>
        <Input value={party.contact} onChange={(e) => onChange({ contact: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Additional detail</Label>
        <Input value={party.extra} onChange={(e) => onChange({ extra: e.target.value })} />
      </div>
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
        <SectionTitle>Parties</SectionTitle>
        <PartyFields
          title="Employer"
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
