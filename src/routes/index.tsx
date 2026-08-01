import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileDown, History, Save, RotateCcw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditorPanel } from "@/components/agreement/EditorPanel";
import { PreviewDocument } from "@/components/agreement/PreviewDocument";
import {
  clone,
  defaultAgreement,
  loadStored,
  saveStored,
  uid,
  type Agreement,
  type Version,
} from "@/lib/agreement";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Employment Agreement Editor — Draft, Version & Export to PDF" },
      {
        name: "description",
        content:
          "Draft a neutral employment agreement with rich-text clauses, editable parties and dates, signature blocks, consents, live paginated preview, version history and PDF export.",
      },
      { property: "og:title", content: "Employment Agreement Editor" },
      {
        property: "og:description",
        content:
          "Rich-text clause editing, signature blocks, consents, live paginated preview, saved versions and PDF export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgreementEditorPage,
});

function AgreementEditorPage() {
  const [agreement, setAgreement] = useState<Agreement>(defaultAgreement);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionLabel, setVersionLabel] = useState("");
  const [zoom, setZoom] = useState(0.62);
  const [printTarget, setPrintTarget] = useState<Agreement | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setAgreement(stored.current);
      setVersions(stored.versions);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored(agreement, versions);
  }, [agreement, versions]);

  const update = useCallback((updater: (prev: Agreement) => Agreement) => {
    setAgreement((prev) => updater(prev));
  }, []);

  const print = (doc: Agreement) => {
    setPrintTarget(doc);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintTarget(null), 300);
    }, 250);
  };

  const saveVersion = () => {
    const label =
      versionLabel.trim() || `Version ${versions.length + 1} — ${agreement.employee.name || "Draft"}`;
    setVersions((prev) => [
      { id: uid(), label, savedAt: new Date().toISOString(), data: clone(agreement) },
      ...prev,
    ]);
    setVersionLabel("");
    toast.success("Version saved", { description: label });
  };

  const shown = printTarget ?? agreement;

  return (
    <main className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
          <div className="mr-auto">
            <h1 className="doc-serif text-lg font-semibold leading-tight">
              Employment Agreement Editor
            </h1>
            <p className="text-xs text-muted-foreground">
              Neutral template · edits save to this browser
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border px-1 py-0.5">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.08).toFixed(2)))}
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="w-11 text-center text-xs tabular-nums text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.08).toFixed(2)))}
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setAgreement(clone(defaultAgreement))}>
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button onClick={() => print(agreement)}>
            <FileDown className="size-4" /> Export PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="no-print border-r border-border">
          <ScrollArea className="lg:h-[calc(100vh-65px)]">
            <div className="space-y-8 p-5">
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <History className="size-3.5" /> Version history
                </div>
                <div className="flex gap-2">
                  <Input
                    value={versionLabel}
                    placeholder="Version name (optional)"
                    onChange={(e) => setVersionLabel(e.target.value)}
                  />
                  <Button onClick={saveVersion} className="shrink-0">
                    <Save className="size-4" /> Save
                  </Button>
                </div>
                {versions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No saved versions yet. Save a snapshot to restore or export it later.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {versions.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{v.label}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {new Date(v.savedAt).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAgreement(clone(v.data));
                            toast.success("Version restored", { description: v.label });
                          }}
                        >
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Export ${v.label} to PDF`}
                          onClick={() => print(v.data)}
                        >
                          <FileDown className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${v.label}`}
                          onClick={() => setVersions((prev) => prev.filter((x) => x.id !== v.id))}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <EditorPanel value={agreement} onChange={update} />
            </div>
          </ScrollArea>
        </section>

        <section className="print-root bg-muted/50">
          <div className="preview-scroll lg:h-[calc(100vh-65px)] lg:overflow-auto">
            <div className="preview-pad p-6">
              <PreviewDocument agreement={shown} zoom={zoom} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
