import { Plus, Trash2, QrCode, Barcode as BarcodeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { LogoPicker } from "./LogoPicker";
import { themeList, type PageSizeName, type ThemeName } from "@/lib/doc-theme";
import {
  uid,
  type Agreement,
  type CodeMarkSettings,
  type DocSettings,
  type LogoSettings,
} from "@/lib/agreement";

type Props = {
  value: Agreement;
  onChange: (updater: (prev: Agreement) => Agreement) => void;
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
      <span className="text-xs">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v ?? value)}
      />
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <Button
          key={o.value}
          size="sm"
          variant={value === o.value ? "default" : "outline"}
          onClick={() => onChange(o.value)}
          className="h-8"
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

export function SettingsPanel({ value, onChange }: Props) {
  const s = value.settings;
  const setS = (patch: Partial<DocSettings>) =>
    onChange((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  const setLogo = (patch: Partial<LogoSettings>) =>
    onChange((p) => ({ ...p, settings: { ...p.settings, logo: { ...p.settings.logo, ...patch } } }));
  const setCodes = (patch: Partial<CodeMarkSettings>) =>
    onChange((p) => ({
      ...p,
      settings: { ...p.settings, codes: { ...p.settings.codes, ...patch } },
    }));

  return (
    <div className="space-y-7">
      <Group title="Theme">
        <div className="grid grid-cols-2 gap-2">
          {themeList.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setS({ theme: t.name as ThemeName })}
              className={`rounded-lg border p-2.5 text-left transition-colors ${
                s.theme === t.name
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex gap-1">
                {t.swatch.map((c) => (
                  <span
                    key={c}
                    className="h-5 flex-1 rounded-sm border border-border"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="mt-1.5 text-xs font-semibold">{t.label}</div>
              <div className="text-[10.5px] leading-snug text-muted-foreground">
                {t.description}
              </div>
            </button>
          ))}
        </div>
      </Group>

      <Separator />

      <Group title="Export & page setup">
        <div className="space-y-1.5">
          <Label className="text-xs">Page size</Label>
          <Chips<PageSizeName>
            value={s.pageSize}
            onChange={(pageSize) => setS({ pageSize })}
            options={[
              { value: "A4", label: "A4" },
              { value: "Letter", label: "Letter" },
              { value: "Legal", label: "Legal" },
            ]}
          />
        </div>
        <Range
          label="Side margins"
          value={s.marginX}
          min={24}
          max={110}
          onChange={(marginX) => setS({ marginX })}
        />
        <Range
          label="Top & bottom margins"
          value={s.marginY}
          min={24}
          max={110}
          onChange={(marginY) => setS({ marginY })}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle label="Page header" checked={s.showHeader} onChange={(v) => setS({ showHeader: v })} />
          <Toggle label="Page footer" checked={s.showFooter} onChange={(v) => setS({ showFooter: v })} />
          <Toggle
            label="Page numbers"
            checked={s.showPageNumbers}
            onChange={(v) => setS({ showPageNumbers: v })}
          />
          <Toggle label="Cover page" checked={s.showCover} onChange={(v) => setS({ showCover: v })} />
          <Toggle
            label="Contents page"
            checked={s.showContents}
            onChange={(v) => setS({ showContents: v })}
          />
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          The printed PDF uses exactly these dimensions, margins and header/footer settings, so the
          export matches the preview page for page.
        </p>
      </Group>

      <Separator />

      <Group title="Page breaks & spacing">
        <Toggle
          label="Start each Part (A–D) on a new page"
          checked={s.strictBreaks}
          onChange={(v) => setS({ strictBreaks: v })}
        />
        <Toggle
          label="Number clauses (01, 02 …)"
          checked={s.numberClauses}
          onChange={(v) => setS({ numberClauses: v })}
        />
        <Range
          label="Space after section bands"
          value={s.sectionSpacing}
          min={6}
          max={48}
          onChange={(sectionSpacing) => setS({ sectionSpacing })}
        />
        <Range
          label="Space between clauses"
          value={s.clauseSpacing}
          min={6}
          max={48}
          onChange={(clauseSpacing) => setS({ clauseSpacing })}
        />
        <p className="text-[11px] leading-snug text-muted-foreground">
          Headings are kept with the content that follows them, so bands and clause numbers stay put
          across edits and exports.
        </p>
      </Group>

      <Separator />

      <Group title="Logo placement">
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle label="On cover" checked={s.logo.showOnCover} onChange={(v) => setLogo({ showOnCover: v })} />
          <Toggle label="In header" checked={s.logo.showInHeader} onChange={(v) => setLogo({ showInHeader: v })} />
          <Toggle label="In footer" checked={s.logo.showInFooter} onChange={(v) => setLogo({ showInFooter: v })} />
          <Toggle
            label="In signatures"
            checked={s.logo.showInSignatures}
            onChange={(v) => setLogo({ showInSignatures: v })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fit</Label>
          <Chips<LogoSettings["fit"]>
            value={s.logo.fit}
            onChange={(fit) => setLogo({ fit })}
            options={[
              { value: "contain", label: "Fit inside" },
              { value: "cover", label: "Fill slot" },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Alignment in cover slot</Label>
          <Chips<LogoSettings["align"]>
            value={s.logo.align}
            onChange={(align) => setLogo({ align })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Centre" },
              { value: "right", label: "Right" },
            ]}
          />
        </div>
        <Range label="Cover size" value={s.logo.coverHeight} min={20} max={90} onChange={(v) => setLogo({ coverHeight: v })} />
        <Range label="Header size" value={s.logo.headerHeight} min={10} max={40} onChange={(v) => setLogo({ headerHeight: v })} />
        <Range label="Footer size" value={s.logo.footerHeight} min={8} max={30} onChange={(v) => setLogo({ footerHeight: v })} />
        <Range label="Horizontal nudge" value={s.logo.offsetX} min={-20} max={20} onChange={(v) => setLogo({ offsetX: v })} />
        <Range label="Vertical nudge" value={s.logo.offsetY} min={-12} max={12} onChange={(v) => setLogo({ offsetY: v })} />
        <Toggle label="Outline empty cover slots" checked={s.logo.frame} onChange={(v) => setLogo({ frame: v })} />
      </Group>

      <Separator />

      <Group title="QR / barcode reference">
        <Toggle label="Show code mark" checked={s.codes.enabled} onChange={(v) => setCodes({ enabled: v })} />
        {s.codes.enabled ? (
          <>
            <Chips<CodeMarkSettings["type"]>
              value={s.codes.type}
              onChange={(type) => setCodes({ type })}
              options={[
                { value: "qr", label: "QR code" },
                { value: "barcode", label: "Barcode" },
              ]}
            />
            <div className="space-y-1.5">
              <Label className="text-xs">Value / verification link</Label>
              <Input value={s.codes.value} onChange={(e) => setCodes({ value: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Caption</Label>
              <Input value={s.codes.caption} onChange={(e) => setCodes({ caption: e.target.value })} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Toggle label="On cover" checked={s.codes.onCover} onChange={(v) => setCodes({ onCover: v })} />
              <Toggle
                label="In signature part"
                checked={s.codes.inSignatures}
                onChange={(v) => setCodes({ inSignatures: v })}
              />
              <Toggle
                label="Small mark on every page"
                checked={s.codes.onEveryPage}
                onChange={(v) => setCodes({ onEveryPage: v })}
              />
            </div>
            <Range label="Code size" value={s.codes.size} min={44} max={140} onChange={(size) => setCodes({ size })} />
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {s.codes.type === "qr" ? <QrCode className="size-3.5" /> : <BarcodeIcon className="size-3.5" />}
              Rendered as an image so it stays crisp in the exported PDF.
            </p>
          </>
        ) : null}
      </Group>

      <Separator />

      <Group title="Sponsors">
        <Toggle
          label="Show sponsor strip"
          checked={s.showSponsorStrip}
          onChange={(v) => setS({ showSponsorStrip: v })}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Strip heading</Label>
          <Input
            value={s.sponsorHeading}
            onChange={(e) => setS({ sponsorHeading: e.target.value })}
          />
        </div>
        {s.sponsors.map((sp) => (
          <div key={sp.id} className="space-y-2.5 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <Input
                value={sp.name}
                placeholder="Sponsor name"
                className="font-medium"
                onChange={(e) =>
                  setS({
                    sponsors: s.sponsors.map((x) =>
                      x.id === sp.id ? { ...x, name: e.target.value } : x,
                    ),
                  })
                }
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${sp.name || "sponsor"}`}
                onClick={() => setS({ sponsors: s.sponsors.filter((x) => x.id !== sp.id) })}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <Input
              value={sp.tagline}
              placeholder="Tagline (optional)"
              onChange={(e) =>
                setS({
                  sponsors: s.sponsors.map((x) =>
                    x.id === sp.id ? { ...x, tagline: e.target.value } : x,
                  ),
                })
              }
            />
            <LogoPicker
              label="Sponsor logo"
              value={sp.logo}
              onChange={(logo) =>
                setS({ sponsors: s.sponsors.map((x) => (x.id === sp.id ? { ...x, logo } : x)) })
              }
            />
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setS({
              showSponsorStrip: true,
              sponsors: [...s.sponsors, { id: uid(), name: "New sponsor", tagline: "" }],
            })
          }
        >
          <Plus className="size-3.5" /> Sponsor
        </Button>
      </Group>
    </div>
  );
}
