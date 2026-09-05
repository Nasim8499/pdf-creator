import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Search, ShieldAlert, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { countries, DISCLAIMER, getCountry } from "@/lib/visa/countries";
import { completion, deleteDraft, loadDrafts, type VisaDraft } from "@/lib/visa/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visa Prep — unofficial visa application preparation" },
      {
        name: "description",
        content:
          "Prepare visa application details for 13 countries on your phone and export a clean, unofficial PDF preparation sheet.",
      },
      { property: "og:title", content: "Visa Prep — unofficial visa application preparation" },
      {
        property: "og:description",
        content:
          "Fill country-specific visa preparation forms on mobile and download an unofficial PDF summary.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");
  const [drafts, setDrafts] = useState<VisaDraft[]>([]);

  useEffect(() => setDrafts(loadDrafts()), []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.region.toLowerCase().includes(s) ||
        c.visaTypes.some((v) => v.toLowerCase().includes(s)),
    );
  }, [q]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-16 pt-6">
      <header className="mb-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Visa Prep
            </p>
            <h1 className="truncate text-2xl font-bold tracking-tight">
              Prepare your visa details
            </h1>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-11 shrink-0">
            <Link to="/docs">
              <BookOpen className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Docs</span>
            </Link>
          </Button>
        </div>
        <div
          role="note"
          className="mt-3 flex gap-2 rounded-xl border border-border bg-muted/50 p-3 text-xs leading-snug text-muted-foreground"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold text-foreground">{DISCLAIMER}</strong> This app is not
            affiliated with any embassy, government or immigration authority, and uses only original
            layouts and generic branding.
          </p>
        </div>
      </header>

      {drafts.length > 0 ? (
        <section aria-labelledby="saved-heading" className="mb-6">
          <h2
            id="saved-heading"
            className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Continue where you left off
          </h2>
          <ul className="space-y-2">
            {drafts.map((d) => {
              const c = getCountry(d.country);
              if (!c) return null;
              const pct = Math.round(completion(c, d.values) * 100);
              return (
                <li key={d.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <Link
                      to="/apply/$code"
                      params={{ code: c.code }}
                      search={{ draft: d.id }}
                      className="min-w-0"
                    >
                      <p className="truncate text-sm font-semibold">
                        <span aria-hidden="true">{c.flag}</span> {c.name} · {d.label}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Clock className="size-3" aria-hidden="true" />
                        <time dateTime={d.updatedAt}>
                          {new Date(d.updatedAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                        · {pct}% of required fields
                      </p>
                      <Progress value={pct} className="mt-2 h-1.5" />
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-11 shrink-0"
                      aria-label={`Delete saved application for ${c.name}, ${d.label}`}
                      onClick={() => setDrafts(deleteDraft(d.id))}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="countries-heading">
        <h2
          id="countries-heading"
          className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Choose a country
        </h2>
        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search countries"
            placeholder="Search country, region or visa type"
            className="h-12 pl-9 text-base"
          />
        </div>

        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No country matches “{q}”.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {list.map((c) => (
              <li key={c.code}>
                <Link
                  to="/apply/$code"
                  params={{ code: c.code }}
                  className="flex min-h-[76px] items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-2xl"
                  >
                    {c.flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {c.region} · {c.visaTypes[0]}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                    Apply <ArrowRight className="size-3" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
