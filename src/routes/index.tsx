import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileDown,
  History,
  Save,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Settings2,
  PencilLine,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorPanel } from "@/components/agreement/EditorPanel";
import { SettingsPanel } from "@/components/agreement/SettingsPanel";
import { PreviewDocument } from "@/components/agreement/PreviewDocument";
import { VersionDiffDialog } from "@/components/agreement/VersionDiffDialog";
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

  const editorColumn = (
    <div className="space-y-8 p-4 sm:p-5">
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
        {versions.length > 0 && (
          <VersionDiffDialog current={agreement} versions={versions} onExport={print} />
        )}
        {versions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No saved versions yet. Save a snapshot to restore or export it later.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {versions.map((v) => (
              <li
                key={v.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{v.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(v.savedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex shrink-0 items-center">
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
                    size="icon"
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Tabs defaultValue="content">
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1">
            <PencilLine className="size-3.5" /> Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex-1">
            <Settings2 className="size-3.5" /> Design &amp; export
          </TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-5">
          <EditorPanel value={agreement} onChange={update} />
        </TabsContent>
        <TabsContent value="design" className="mt-5">
          <SettingsPanel value={agreement} onChange={update} />
        </TabsContent>
      </Tabs>
    </div>
  );

  const previewColumn = (
    <div className="preview-scroll lg:h-[calc(100vh-var(--app-header))] lg:overflow-auto">
      <div className="preview-pad p-3 sm:p-6">
        <PreviewDocument agreement={shown} zoom={zoom} />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <h1 className="doc-serif truncate text-base font-semibold leading-tight sm:text-lg">
              Employment Agreement Editor
            </h1>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              Neutral template · edits save to this browser
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-1 rounded-md border border-border px-1 py-0.5 sm:flex">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.08).toFixed(2)))}
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
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => setAgreement(clone(defaultAgreement))}
            >
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Reset document"
              className="sm:hidden"
              onClick={() => setAgreement(clone(defaultAgreement))}
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button onClick={() => print(agreement)}>
              <FileDown className="size-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile: switch between editing and the paginated preview */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="no-print sticky top-[57px] z-20 w-full rounded-none">
            <TabsTrigger value="edit" className="flex-1">
              <PencilLine className="size-3.5" /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              <FileText className="size-3.5" /> Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="no-print mt-0">
            {editorColumn}
          </TabsContent>
          <TabsContent value="preview" forceMount className="mt-0 data-[state=inactive]:hidden">
            <section className="print-root bg-muted/50">
              <div className="flex items-center justify-center gap-1 border-b border-border bg-background px-3 py-1.5 no-print">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Zoom out"
                  onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.06).toFixed(2)))}
                >
                  <ZoomOut className="size-4" />
                </Button>
                <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Zoom in"
                  onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.06).toFixed(2)))}
                >
                  <ZoomIn className="size-4" />
                </Button>
              </div>
              {previewColumn}
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <section className="no-print border-r border-border">
          <ScrollArea className="lg:h-[calc(100vh-var(--app-header))]">{editorColumn}</ScrollArea>
        </section>
        <section className="print-root bg-muted/50">{previewColumn}</section>
      </div>
    </main>
  );
}

