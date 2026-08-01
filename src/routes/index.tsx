import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Zap,
  Loader2,
  ALargeSmall,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorPanel } from "@/components/agreement/EditorPanel";
import { QuickFillPanel } from "@/components/agreement/QuickFillPanel";
import { SettingsPanel } from "@/components/agreement/SettingsPanel";
import { BrandingPanel } from "@/components/agreement/BrandingPanel";
import { PdfPreviewDialog } from "@/components/agreement/PdfPreviewDialog";
import { DraftsPanel } from "@/components/agreement/DraftsPanel";
import { ExportConfirmDialog } from "@/components/agreement/ExportConfirmDialog";
import {
  loadDrafts,
  persistDrafts,
  renameDraft,
  upsertAutoDraft,
  type Draft,
} from "@/lib/drafts";
import { useThrottledValue } from "@/hooks/use-throttled-value";


import { TemplatePicker } from "@/components/agreement/TemplatePicker";
import { downloadAgreementPdf, pdfFileName, printAsPdf } from "@/lib/pdf";
import { PreviewDocument } from "@/components/agreement/PreviewDocument";
import { VersionDiffDialog } from "@/components/agreement/VersionDiffDialog";
import { LayoutAuditPanel } from "@/components/agreement/LayoutAuditPanel";
import { CompliancePanel } from "@/components/agreement/CompliancePanel";
import { ComplianceRulesPanel } from "@/components/agreement/ComplianceRulesPanel";
import { complianceRules } from "@/lib/compliance";
import { applyInzMapping } from "@/lib/inz-mapping";
import { scanAgreement } from "@/lib/compliance";
import { errorCount, type LayoutFingerprint, type LayoutReport } from "@/lib/layout-audit";

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
  const [confirmedRules, setConfirmedRules] = useState<string[]>([]);
  const [zoom, setZoom] = useState(0.62);
  const [mobileTab, setMobileTab] = useState("edit");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [printTarget, setPrintTarget] = useState<Agreement | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [textScale, setTextScale] = useState<"base" | "large" | "xlarge">("base");


  const [report, setReport] = useState<LayoutReport | null>(null);
  const [baseline, setBaseline] = useState<LayoutFingerprint | null>(null);
  const [baselineAt, setBaselineAt] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setAgreement(stored.current);
      setVersions(stored.versions);
    }
    // Fit the page width to small screens on first paint.
    const w = window.innerWidth;
    if (w < 1024) setZoom(Math.max(0.28, +(((w - 28) / 794) * 100).toFixed(0) / 100));
    try {
      const raw = window.localStorage.getItem("agreement-layout-baseline");
      if (raw) {
        const parsed = JSON.parse(raw) as { fingerprint: LayoutFingerprint; at: string };
        setBaseline(parsed.fingerprint);
        setBaselineAt(parsed.at);
      }
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  const lockBaseline = useCallback(() => {
    setReport((r) => {
      if (!r) {
        toast.error("Still measuring the layout — try again in a moment.");
        return r;
      }
      const at = new Date().toISOString();
      setBaseline(r.fingerprint);
      setBaselineAt(at);
      try {
        window.localStorage.setItem(
          "agreement-layout-baseline",
          JSON.stringify({ fingerprint: r.fingerprint, at }),
        );
      } catch {
        /* ignore */
      }
      toast.success("Layout baseline locked", {
        description: `${r.pageCount} pages recorded. Future edits are checked against this.`,
      });
      return r;
    });
  }, []);

  const clearBaseline = useCallback(() => {
    setBaseline(null);
    setBaselineAt(null);
    try {
      window.localStorage.removeItem("agreement-layout-baseline");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored(agreement, versions);
  }, [agreement, versions]);

  // Hydrate the drafts list once.
  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const saveDraftNow = useCallback(() => {
    setDrafts((prev) => {
      const next = upsertAutoDraft(prev, agreement);
      persistDrafts(next);
      return next;
    });
    setDraftSavedAt(new Date().toISOString());
  }, [agreement]);

  // Autosave the Quick fill fields shortly after typing stops.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = window.setTimeout(() => saveDraftNow(), 1200);
    return () => window.clearTimeout(t);
  }, [agreement, saveDraftNow]);


  const update = useCallback((updater: (prev: Agreement) => Agreement) => {
    setAgreement((prev) => updater(prev));
  }, []);

  const print = (doc: Agreement, force = false, fileLabel?: string) => {
    const blocked = scanAgreement(doc);
    if (blocked.length > 0) {
      const groups = new Map<string, { label: string; hint: string; fields: string[] }>();
      blocked.forEach((f) => {
        const g = groups.get(f.ruleId) ?? { label: f.label, hint: f.hint, fields: [] };
        if (!g.fields.includes(f.field)) g.fields.push(f.field);
        groups.set(f.ruleId, g);
      });
      toast.error(
        `PDF export prevented — ${blocked.length} government-issued field${blocked.length === 1 ? "" : "s"} blocked`,
        {
          duration: 12000,
          description: (
            <div className="mt-1 space-y-1.5">
              {[...groups.values()].map((g) => (
                <div key={g.label}>
                  <div className="text-xs font-semibold">{g.label}</div>
                  <div className="text-[11px] opacity-90">
                    In {g.fields.slice(0, 3).join(", ")}
                    {g.fields.length > 3 ? ` +${g.fields.length - 3} more` : ""} — {g.hint}
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      );
      return;
    }
    if (!force) {
      const unconfirmed = complianceRules.filter((r) => !confirmedRules.includes(r.id));
      if (unconfirmed.length > 0) {
        toast.warning(
          `Confirm ${unconfirmed.length} compliance rule${unconfirmed.length === 1 ? "" : "s"} before export`,
          {
            description: `Not yet confirmed: ${unconfirmed.map((r) => r.label).join(", ")}.`,
            action: { label: "Confirm & export", onClick: () => { confirmAllRules(); print(doc, true); } },
          },
        );
        return;
      }
    }
    if (!force && doc === agreement) {
      const errs = errorCount(report);
      if (errs > 0) {
        toast.error(`Layout validation found ${errs} issue${errs === 1 ? "" : "s"}`, {
          description: "Page numbering or spacing shifted. Review the layout checks before exporting.",
          action: { label: "Export anyway", onClick: () => print(doc, true) },
        });
        return;
      }
    }
    setPrintTarget(doc);
    setTimeout(() => {
      printAsPdf(pdfFileName(doc, fileLabel), () => setTimeout(() => setPrintTarget(null), 300));
    }, 250);
  };

  /** Opens the in-app PDF preview so formatting can be checked before saving. */
  const previewPdf = (doc: Agreement, fileLabel?: string) => {
    setPdfPreview({ doc, ...(fileLabel ? { label: fileLabel } : {}) });
  };

  /** Builds and downloads a genuine PDF file, no print dialog. */
  const savePdfFile = async (doc: Agreement, fileLabel?: string) => {
    const id = toast.loading("Building PDF file…");
    try {
      await downloadAgreementPdf(doc, fileLabel);
      toast.success("PDF downloaded", { id, description: `${pdfFileName(doc, fileLabel)}.pdf` });
    } catch (e) {
      toast.error("Could not build the PDF", {
        id,
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
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

  // Throttle the heavy paginated preview so typing stays smooth.
  const { value: throttledAgreement, pending: previewPending } = useThrottledValue(agreement, 450);
  const shown = printTarget ?? throttledAgreement;
  const findings = useMemo(() => scanAgreement(agreement), [agreement]);


  const confirmAllRules = useCallback(() => {
    setConfirmedRules(complianceRules.map((r) => r.id));
  }, []);

  const applyMapping = useCallback(() => {
    setAgreement((prev) => {
      const { next, mapped, excluded, renamed } = applyInzMapping(prev);
      toast.success("INZ-labelled inputs converted", {
        description: `${mapped.length} moved to party fields, ${excluded.length} agency-issued item(s) removed, ${renamed.length} relabelled as party-supplied. See the export appendix.`,
      });
      return next;
    });
  }, []);


  const editorColumn = (
    <div className="space-y-8 p-4 sm:p-5">
      <TemplatePicker value={agreement} onChange={update} />
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
                    aria-label={`Download ${v.label} as a PDF file`}
                    onClick={() => savePdfFile(v.data, v.label)}
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

      <Tabs defaultValue="quick">
        <TabsList className="w-full">
          <TabsTrigger value="quick" className="flex-1">
            <Zap className="size-3.5" /> Quick fill
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1">
            <PencilLine className="size-3.5" /> Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex-1">
            <Settings2 className="size-3.5" /> Design
          </TabsTrigger>
        </TabsList>
        <TabsContent value="quick" className="mt-5 space-y-6">
          <div id="quick-fill-form" role="group" aria-label="Quick fill fields" tabIndex={-1}>
            <QuickFillPanel value={agreement} onChange={update} />
          </div>

          <DraftsPanel
            drafts={drafts}
            savedAt={draftSavedAt}
            onSaveNow={saveDraftNow}
            onOpen={(d) => {
              setAgreement(clone(d.data));
              toast.success("Draft opened", { description: d.label });
            }}
            onExport={(d) => previewPdf(d.data, d.label)}
            onRename={(id, label) =>
              setDrafts((prev) => {
                const next = renameDraft(prev, id, label);
                persistDrafts(next);
                return next;
              })
            }
            onDelete={(id) =>
              setDrafts((prev) => {
                const next = prev.filter((x) => x.id !== id);
                persistDrafts(next);
                return next;
              })
            }

          />
        </TabsContent>

        <TabsContent value="content" className="mt-5">
          <EditorPanel value={agreement} onChange={update} />
        </TabsContent>

        <TabsContent value="design" className="mt-5 space-y-8">
          <BrandingPanel value={agreement} onChange={update} />
          <CompliancePanel findings={findings} />
          <ComplianceRulesPanel
            agreement={agreement}
            findings={findings}
            confirmed={confirmedRules}
            onToggle={(id, next) =>
              setConfirmedRules((prev) =>
                next ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
              )
            }
            onConfirmAll={confirmAllRules}
            onApplyMapping={applyMapping}
            onToggleAppendix={(next) =>
              update((prev) => ({ ...prev, settings: { ...prev.settings, showAppendix: next } }))
            }
          />
          <LayoutAuditPanel
            report={report}
            hasBaseline={baseline !== null}
            baselineAt={baselineAt ?? undefined}
            onLock={lockBaseline}
            onClear={clearBaseline}
          />
          <SettingsPanel value={agreement} onChange={update} />
        </TabsContent>
      </Tabs>
    </div>
  );

  const previewColumn = (
    <div
      id="preview-panel"
      role="region"
      aria-label="Live paginated PDF preview"
      className="preview-scroll relative lg:h-[calc(100vh-var(--app-header))] lg:overflow-auto"
    >
      {previewPending && !printTarget ? (
        <div
          role="status"
          aria-live="polite"
          className="no-print pointer-events-none sticky top-2 z-10 mx-auto flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/95 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur"
        >
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Preview updating…
        </div>
      ) : (
        <span className="sr-only" role="status" aria-live="polite">
          Preview up to date
        </span>
      )}
      <div className="preview-pad p-3 sm:p-6">
        <PreviewDocument
          agreement={shown}
          zoom={zoom}
          {...(printTarget ? {} : { onAudit: setReport, baseline })}
        />
      </div>
    </div>
  );


  const scaleClass =
    textScale === "large" ? "text-[1.08rem]" : textScale === "xlarge" ? "text-[1.18rem]" : "";

  return (
    <main className={`min-h-dvh bg-background ${scaleClass}`}>
      <a
        href="#quick-fill-form"
        className="no-print sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to the Quick fill form
      </a>
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
              size="icon"
              variant="outline"
              aria-label={`Text size: ${textScale}. Tap to change`}
              title="Change text size"
              className="size-11 sm:size-9"
              onClick={() =>
                setTextScale((s) => (s === "base" ? "large" : s === "large" ? "xlarge" : "base"))
              }
            >
              <ALargeSmall className="size-4" />
            </Button>
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
              className="size-11 sm:hidden"
              onClick={() => setAgreement(clone(defaultAgreement))}
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button className="hidden lg:inline-flex" onClick={() => setExportOpen(true)}>
              <FileDown className="size-4" /> Export PDF
            </Button>

          </div>
        </div>
      </header>

      {/* Mobile: switch between editing and the paginated preview */}
      <div
        role="tablist"
        aria-label="Editor and preview"
        className="no-print sticky top-[57px] z-20 grid grid-cols-2 border-b border-border bg-background lg:hidden"
      >
        {[
          { id: "edit", label: "Edit", Icon: PencilLine },
          { id: "preview", label: "Preview", Icon: FileText },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mobileTab === id}
            aria-controls={id === "edit" ? "editor-panel" : "preview-panel"}
            onClick={() => setMobileTab(id)}
            className={`flex min-h-11 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              mobileTab === id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>


      <div className="lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <section
          id="editor-panel"
          aria-label="Agreement editor"
          className={`no-print border-border lg:border-r ${
            mobileTab === "preview" ? "hidden lg:block" : ""
          }`}
        >
          <ScrollArea className="lg:h-[calc(100vh-var(--app-header))]">{editorColumn}</ScrollArea>
        </section>


        <section
          className={`print-root print-keep bg-muted/50 ${
            mobileTab === "edit" ? "hidden lg:block" : ""
          }`}
        >
          <div className="no-print flex items-center justify-center gap-1 border-b border-border bg-background px-3 py-1.5 lg:hidden">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Zoom out"
              className="size-11"
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
              className="size-11"
              onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.06).toFixed(2)))}
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="ml-2 h-9"
              onClick={() =>
                setZoom(
                  Math.max(0.25, +(((window.innerWidth - 28) / 794).toFixed(2))),
                )
              }
            >
              Fit width
            </Button>
          </div>
          {previewColumn}
        </section>
      </div>

      {/* Mobile action bar — one export button, current preview settings */}
      <div className="no-print sticky bottom-0 z-30 border-t border-border bg-background/95 px-3 py-2 backdrop-blur lg:hidden">
        <Button className="h-12 w-full text-base" onClick={() => setExportOpen(true)}>
          <FileDown className="size-5" /> Export PDF
        </Button>
      </div>

      <PdfPreviewDialog
        open={pdfPreview !== null}
        onOpenChange={(open) => {
          if (!open) setPdfPreview(null);
        }}
        agreement={pdfPreview?.doc ?? null}
        label={pdfPreview?.label}
      />

      <ExportConfirmDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        agreement={agreement}
        findings={findings}
        confirmed={confirmedRules}
        onConfirm={() => {
          confirmAllRules();
          setExportOpen(false);
          previewPdf(agreement);
        }}
      />
    </main>
  );
}




