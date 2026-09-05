import { useEffect, useMemo, useState } from "react";
import { createFileRoute, notFound, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  FileText,
  Save,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { DISCLAIMER, countries, getCountry } from "@/lib/visa/countries";
import {
  completion,
  draftLabel,
  getDraft,
  missingRequired,
  newDraftId,
  saveDraft,
  type Values,
} from "@/lib/visa/storage";
import { FieldInput } from "@/components/visa/FieldInput";
import { PdfPreviewSheet } from "@/components/visa/PdfPreviewSheet";

export const Route = createFileRoute("/apply/$code")({
  validateSearch: (s: Record<string, unknown>) => ({
    draft: typeof s["draft"] === "string" ? s["draft"] : undefined,
  }),
  loader: ({ params }) => {
    const country = getCountry(params.code);
    if (!country) throw notFound();
    return { code: country.code };
  },
  head: ({ params }) => {
    const c = getCountry(params.code);
    const name = c?.name ?? "Country";
    const title = `${name} visa preparation form (unofficial) — Visa Prep`;
    const description = `Fill in the details usually requested for a ${name} visa and export an unofficial PDF preparation sheet. Not an official government form.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ApplyPage,
});

function ApplyPage() {
  const { code } = Route.useParams();
  const { draft: draftId } = Route.useSearch();
  const navigate = useNavigate();
  const country = getCountry(code) ?? countries[0]!;

  const [id, setId] = useState(draftId ?? newDraftId());
  const [values, setValues] = useState<Values>({});
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [preview, setPreview] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (draftId) {
      const d = getDraft(draftId);
      if (d) {
        setValues(d.values);
        setId(d.id);
      }
    }
    setReady(true);
  }, [draftId]);

  const sections = country.sections;
  const total = sections.length + 1; // + review
  const isReview = step === sections.length;
  const section = sections[Math.min(step, sections.length - 1)]!;
  const pct = Math.round(completion(country, values) * 100);
  const missing = useMemo(() => missingRequired(country, values), [country, values]);

  const set = (fieldId: string, v: string | boolean) =>
    setValues((prev) => ({ ...prev, [fieldId]: v }));

  const persist = (quiet = false) => {
    saveDraft({
      id,
      country: country.code,
      label: draftLabel(values),
      values,
      updatedAt: new Date().toISOString(),
    });
    if (!quiet) toast.success("Saved on this device — continue any time.");
  };

  // Autosave once the user has typed something.
  useEffect(() => {
    if (!ready || Object.keys(values).length === 0) return;
    const t = setTimeout(() => persist(true), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, ready]);

  const sectionInvalid = (secIndex: number) => {
    const s = sections[secIndex]!;
    return s.fields.some((f) => {
      if (!f.required) return false;
      const v = values[f.id];
      return f.type === "checkbox" ? v !== true : !(typeof v === "string" && v.trim());
    });
  };

  const next = () => {
    if (!isReview && sectionInvalid(step)) {
      setShowErrors(true);
      toast.error("Some required fields on this step are still empty.");
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(s + 1, sections.length));
    window.scrollTo({ top: 0 });
  };

  const back = () => {
    setShowErrors(false);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl pb-32">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="size-11 shrink-0">
            <Link to="/" aria-label="Back to country list">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold">
              <span aria-hidden="true">{country.flag}</span> {country.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Step {step + 1} of {total} · {isReview ? "Review" : section.title}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label="Save and continue later"
            onClick={() => persist()}
          >
            <Save className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <Progress
          value={((step + 1) / total) * 100}
          className="mt-2.5 h-1.5"
          aria-label={`Progress: step ${step + 1} of ${total}`}
        />
      </header>

      <div className="px-4 pt-4">
        <p className="mb-4 flex gap-2 rounded-xl border border-border bg-muted/50 p-3 text-[11px] leading-snug text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{DISCLAIMER}</span>
        </p>

        {isReview ? (
          <section aria-labelledby="review-heading">
            <h1 id="review-heading" className="text-xl font-bold tracking-tight">
              Review your answers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pct}% of required fields complete
              {missing.length ? ` · ${missing.length} still empty` : " · nothing missing"}.
            </p>

            {missing.length > 0 ? (
              <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-sm font-semibold text-destructive">Still to fill in</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {missing.slice(0, 8).map((m) => (
                    <li key={m.section + m.label}>
                      {m.section}: {m.label}
                    </li>
                  ))}
                  {missing.length > 8 ? <li>…and {missing.length - 8} more</li> : null}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {sections.map((s, i) => (
                <section key={s.id} className="rounded-2xl border border-border bg-card">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-2.5">
                    <h2 className="truncate text-sm font-semibold">{s.title}</h2>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 shrink-0"
                      onClick={() => {
                        setStep(i);
                        window.scrollTo({ top: 0 });
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  <dl className="divide-y divide-border">
                    {s.fields.map((f) => {
                      const v = values[f.id];
                      const shown =
                        f.type === "checkbox"
                          ? v === true
                            ? "Confirmed"
                            : "Not confirmed"
                          : typeof v === "string" && v.trim()
                            ? v
                            : "—";
                      return (
                        <div
                          key={f.id}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 px-3 py-2"
                        >
                          <dt className="min-w-0 text-xs text-muted-foreground">{f.label}</dt>
                          <dd className="min-w-0 break-words text-xs font-medium">{shown}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </section>
              ))}
            </div>
          </section>
        ) : (
          <section aria-labelledby="section-heading">
            <h1 id="section-heading" className="text-xl font-bold tracking-tight">
              {section.title}
            </h1>
            {section.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.fields.map((f) => {
                const v = values[f.id];
                const empty =
                  f.type === "checkbox" ? v !== true : !(typeof v === "string" && v.trim());
                return (
                  <FieldInput
                    key={f.id}
                    field={f}
                    value={v}
                    onChange={(nv) => set(f.id, nv)}
                    invalid={showErrors && !!f.required && empty}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      <nav
        aria-label="Form navigation"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <Button
            variant="outline"
            className="h-12 flex-1"
            onClick={back}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Button>
          {isReview ? (
            <Button className="h-12 flex-[2]" onClick={() => setPreview(true)}>
              <FileText className="size-4" aria-hidden="true" /> Preview PDF
            </Button>
          ) : (
            <Button className="h-12 flex-[2]" onClick={next}>
              {step === sections.length - 1 ? (
                <>
                  <Check className="size-4" aria-hidden="true" /> Review
                </>
              ) : (
                <>
                  Save &amp; continue <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          )}
        </div>
      </nav>

      <PdfPreviewSheet
        open={preview}
        onOpenChange={setPreview}
        country={country}
        values={values}
        onEdit={() => {
          setPreview(false);
          setStep(0);
          navigate({ to: "/apply/$code", params: { code: country.code }, search: { draft: id } });
        }}
      />
    </main>
  );
}
