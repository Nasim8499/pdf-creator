import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { countries, DISCLAIMER } from "@/lib/visa/countries";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Adding countries & templates — Visa Prep docs" },
      {
        name: "description",
        content:
          "How to add a new country configuration, sections and fields to the unofficial visa preparation app.",
      },
      { property: "og:title", content: "Adding countries & templates — Visa Prep docs" },
      {
        property: "og:description",
        content: "Guide to the data-driven country configuration used for forms and PDFs.",
      },
    ],
  }),
  component: Docs,
});

function Docs() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-16 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="size-11">
          <Link to="/" aria-label="Back to countries">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="truncate text-xl font-bold tracking-tight">Adding countries & templates</h1>
      </div>

      <div className="space-y-5 text-sm leading-relaxed">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            Every screen, form step and PDF is generated from one list of country definitions in{" "}
            <code className="rounded bg-muted px-1">src/lib/visa/countries.ts</code>. There is no
            country-specific screen code, so a new country only needs data.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Add a country in three steps</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>
              Append a <code className="rounded bg-muted px-1">CountryConfig</code> to the{" "}
              <code className="rounded bg-muted px-1">countries</code> array: code (ISO alpha-2),
              name, flag emoji, region, generic accent colours, visa types, processing time and the
              official portal address.
            </li>
            <li>
              Build its <code className="rounded bg-muted px-1">sections</code> from the reusable
              builders (personal, passport, contact, travel, accommodation, funding, employment,
              background, emergency, declaration) and pass extra fields where the country asks for
              something specific.
            </li>
            <li>
              Save. The country appears in search, gets its own form steps, review screen and PDF
              automatically.
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Field options</h2>
          <p className="mt-2 text-muted-foreground">
            Types: text, email, tel, date, number, select (with options), textarea and checkbox. Set{" "}
            <code className="rounded bg-muted px-1">required</code> to include a field in the
            progress calculation, and <code className="rounded bg-muted px-1">half</code> to place
            two fields side by side on wider screens. Never rename an existing field id — saved
            drafts are keyed by it.
          </p>
        </section>

        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <h2 className="text-sm font-semibold text-destructive">Content rules</h2>
          <p className="mt-2 text-muted-foreground">
            {DISCLAIMER} Never copy an official form layout pixel-for-pixel, never reproduce
            government logos, seals or emblems, and never imply an embassy connection. Use generic
            colours and original layouts only.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Currently configured ({countries.length})</h2>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-muted-foreground sm:grid-cols-2">
            {countries.map((c) => (
              <li key={c.code} className="truncate">
                <span aria-hidden="true">{c.flag}</span> {c.name} — {c.sections.length} sections ·{" "}
                {c.officialPortal}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
