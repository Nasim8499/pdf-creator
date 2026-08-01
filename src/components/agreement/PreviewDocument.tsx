import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { formatDate, type Agreement } from "@/lib/agreement";

const PAGE_W = 794;
const PAGE_H = 1123;
const PAD_X = 64;
const PAD_TOP = 56;
const PAD_BOTTOM = 56;
const HEADER_H = 58;
const FOOTER_H = 46;
const CONTENT_H = PAGE_H - PAD_TOP - PAD_BOTTOM - HEADER_H - FOOTER_H;
const CONTENT_PAD_TOP = 20;
const PACK_H = CONTENT_H - CONTENT_PAD_TOP - 8;

type Block = { id: string; node: ReactNode; keepWithNext?: boolean; breakBefore?: boolean };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-[3px]">
      <span className="w-40 shrink-0 text-[10.5px] uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="flex-1 text-[12.5px] text-neutral-900">{value || "—"}</span>
    </div>
  );
}

function Logo({ src, alt, h }: { src?: string | undefined; alt: string; h: number }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      style={{ height: h, maxWidth: h * 4 }}
      className="w-auto shrink-0 object-contain"
    />
  );
}

function LogoSlot({ src, alt, h, label }: { src?: string | undefined; alt: string; h: number; label: string }) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden border border-dashed border-neutral-300 px-2"
      style={{ height: h + 12, minWidth: h + 34 }}
    >
      {src ? (
        <Logo src={src} alt={alt} h={h} />
      ) : (
        <span className="text-[7.5px] uppercase tracking-[0.16em] text-neutral-400">{label}</span>
      )}
    </div>
  );
}

function SectionBar({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-4 mt-2 flex items-center gap-3 border-y-2 border-neutral-900 bg-neutral-900 px-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
        {index}
      </span>
      <span className="doc-serif text-[13px] font-semibold uppercase tracking-[0.14em] text-white">
        {title}
      </span>
    </div>
  );
}

function buildBlocks(a: Agreement): Block[] {
  const blocks: Block[] = [];

  blocks.push({
    id: "cover",
    node: (
      <div className="flex h-[880px] flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-6 border-b-2 border-neutral-900 pb-4">
            <LogoSlot src={a.employer.logo} alt="Employer logo" h={40} label="Employer logo" />
            <div className="pt-1 text-right text-[9.5px] uppercase leading-relaxed tracking-[0.2em] text-neutral-500">
              New Zealand
              <br />
              Individual Employment Agreement
            </div>
            <LogoSlot src={a.employee.logo} alt="Employee logo" h={40} label="Employee logo" />
          </div>
          <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.18em] text-neutral-500">
            <span>Part A · Parties &amp; Terms</span>
            <span>Part B · Schedules</span>
            <span>Part C · Signatures</span>
          </div>
        </div>
        <div>
          <div className="mb-5 h-[3px] w-24 bg-neutral-900" />
          <h1 className="doc-serif text-[42px] font-semibold leading-[1.1] text-neutral-900">
            {a.documentTitle}
          </h1>
          {a.subtitle ? (
            <p className="mt-4 max-w-[80%] text-[13px] italic leading-relaxed text-neutral-500">
              {a.subtitle}
            </p>
          ) : null}
          <div className="mt-10 grid grid-cols-2 border-y border-neutral-300">
            {[
              { k: "Employer", v: a.employer.name || "—" },
              { k: "Employee", v: a.employee.name || "—" },
              { k: "Date of agreement", v: formatDate(a.agreementDate) },
              { k: "Commencement", v: formatDate(a.startDate) },
            ].map(({ k, v }) => (
              <div key={k} className="border-b border-neutral-200 px-1 py-3 last:border-b-0 [&:nth-last-child(2)]:border-b-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{k}</div>
                <div className="doc-serif mt-1 text-[16px] font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="border-t border-neutral-300 pt-3 text-[11px] leading-relaxed text-neutral-500">
          This document is a private agreement between the parties named above. It is not issued by,
          and is not affiliated with, any government agency. Minimum entitlements under New Zealand
          employment law apply regardless of the terms recorded here.
        </p>
      </div>
    ),
  });

  blocks.push({
    id: "toc",
    breakBefore: true,
    node: (
      <div>
        <h2 className="doc-serif mb-4 border-b border-neutral-300 pb-2 text-[19px] font-semibold text-neutral-900">
          Contents
        </h2>
        <ol className="columns-3 gap-6 [column-fill:balance]">
          {a.clauses.map((c) => (
            <li
              key={c.id}
              className="mb-[5px] break-inside-avoid text-[10px] leading-snug text-neutral-700"
            >
              {c.heading}
            </li>
          ))}
        </ol>
      </div>
    ),
  });

  blocks.push({
    id: "title",
    breakBefore: true,
    node: (
      <div className="mb-6 border-b-2 border-neutral-900 pb-4">
        <h1 className="doc-serif text-[26px] font-semibold leading-tight text-neutral-900">
          {a.documentTitle}
        </h1>
        {a.subtitle ? (
          <p className="mt-1.5 text-[11.5px] italic text-neutral-500">{a.subtitle}</p>
        ) : null}
      </div>
    ),
  });

  blocks.push({
    id: "parties-bar",
    keepWithNext: true,
    node: <SectionBar index="Part A" title="Parties to this agreement" />,
  });

  blocks.push({
    id: "parties",
    node: (
      <div className="mb-6 grid grid-cols-2 gap-5">
        {[
          { title: "Employer", p: a.employer },
          { title: "Employee", p: a.employee },
        ].map(({ title, p }) => (
          <div key={title} className="border border-neutral-300">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-300 bg-neutral-100 px-3 py-1.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
                {title}
              </span>
              <Logo src={p.logo} alt={`${title} logo`} h={20} />
            </div>
            <div className="p-3">
              <div className="doc-serif text-[13.5px] font-semibold text-neutral-900">
                {p.name || "—"}
              </div>
              <div className="mt-1 space-y-0.5 text-[11.5px] leading-snug text-neutral-600">
                {p.address ? <div>{p.address}</div> : null}
                {p.contact ? <div>{p.contact}</div> : null}
                {p.extra ? <div>{p.extra}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  });

  blocks.push({
    id: "dates",
    node: (
      <div className="mb-6 border-y-2 border-neutral-900 bg-neutral-50 px-4 py-3">
        <Field label="Date of agreement" value={formatDate(a.agreementDate)} />
        <Field label="Commencement date" value={formatDate(a.startDate)} />
        {a.endDate ? <Field label="End date" value={formatDate(a.endDate)} /> : null}
      </div>
    ),
  });

  blocks.push({
    id: "terms-bar",
    keepWithNext: true,
    breakBefore: true,
    node: <SectionBar index="Part B" title="Terms and conditions of employment" />,
  });

  a.clauses.forEach((c, index) => {
    blocks.push({
      id: c.id,
      node: (
        <section className="mb-5">
          <h2 className="doc-serif mb-2 flex gap-2.5 border-b border-neutral-200 pb-1 text-[15.5px] font-semibold text-neutral-900">
            <span className="shrink-0 tabular-nums text-neutral-500">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{c.heading}</span>
          </h2>
          <div
            className="doc-prose text-[13px] leading-[1.78] text-neutral-800"
            dangerouslySetInnerHTML={{ __html: c.html }}
          />
        </section>
      ),
    });
  });

  if (a.consents.length) {
    blocks.push({
      id: "consents-head",
      keepWithNext: true,
      breakBefore: true,
      node: <SectionBar index="Part C" title="Acknowledgements and consents" />,
    });
    a.consents.forEach((c) => {
      blocks.push({
        id: c.id,
        node: (
          <div className="mb-2.5 flex gap-2.5">
            <span
              className={`mt-[2px] flex size-[13px] shrink-0 items-center justify-center border text-[9px] leading-none ${
                c.acknowledged
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-500 text-transparent"
              }`}
            >
              ✓
            </span>
            <p className="text-[12px] leading-[1.6] text-neutral-800">
              {c.label ? <b className="text-neutral-900">{c.label}: </b> : null}
              {c.text}
            </p>
          </div>
        ),
      });
    });
  }

  if (a.signatures.length) {
    blocks.push({
      id: "sign-head",
      keepWithNext: true,
      breakBefore: true,
      node: <SectionBar index="Part D" title="Execution and signatures" />,
    });
    a.signatures.forEach((s) => {
      const role = s.role.toLowerCase();
      const roleLogo = role.includes("employer")
        ? a.employer.logo
        : role.includes("employee")
          ? a.employee.logo
          : undefined;
      blocks.push({
        id: s.id,
        node: (
          <div className="mb-4 border border-neutral-300">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-1.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
                {s.role}
              </span>
              <Logo src={roleLogo} alt={`${s.role} logo`} h={18} />
            </div>
            <div className="p-4 pt-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Field label="Name" value={s.name} />
              <Field label="Title" value={s.title} />
              <Field label="Organisation" value={s.organisation} />
              <Field label={s.dateLabel || "Date"} value={formatDate(s.dateValue)} />
            </div>
            <div className="mt-5 border-b border-neutral-400" />
            <div className="mt-1 text-[10.5px] uppercase tracking-wide text-neutral-500">
              {s.signatureLabel || "Signature"}
            </div>
          </div>
        ),
      });
    });
  }

  return blocks;
}

export function PreviewDocument({
  agreement,
  zoom = 1,
}: {
  agreement: Agreement;
  zoom?: number;
}) {
  const blocks = useMemo(() => buildBlocks(agreement), [agreement]);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([blocks.map((_, i) => i)]);
  const signature = JSON.stringify(agreement);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const heights = Array.from(el.children).map((c) => (c as HTMLElement).offsetHeight);
    const next: number[][] = [];
    let current: number[] = [];
    let used = 0;
    heights.forEach((h, i) => {
      if (current.length && blocks[i]?.breakBefore) {
        next.push(current);
        current = [];
        used = 0;
      }
      if (current.length && used + h > PACK_H) {
        const moved: number[] = [];
        while (current.length > 1 && blocks[current[current.length - 1] ?? 0]?.keepWithNext) {
          moved.unshift(current.pop() as number);
        }
        next.push(current);
        current = moved;
        used = moved.reduce((sum, idx) => sum + (heights[idx] ?? 0), 0);
      }
      current.push(i);
      used += h;
    });
    if (current.length) next.push(current);
    setPages(next.length ? next : [[]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return (
    <div className="agreement-preview">
      <div
        aria-hidden
        ref={measureRef}
        style={{ width: PAGE_W - PAD_X * 2, position: "absolute", left: -99999, top: 0 }}
      >
        {blocks.map((b) => (
          <div key={b.id} style={{ display: "flow-root" }}>
            {b.node}
          </div>
        ))}
      </div>

      <div
        className="flex flex-col items-center gap-6"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          height: zoom !== 1 ? `${(PAGE_H + 24) * pages.length * zoom}px` : undefined,
        }}
      >
        {pages.map((page, pageIndex) => (
          <article
            key={pageIndex}
            className="doc-page relative bg-white text-neutral-900 shadow-[0_2px_24px_rgba(15,23,42,0.14)]"
            style={{
              width: PAGE_W,
              height: PAGE_H,
              paddingLeft: PAD_X,
              paddingRight: PAD_X,
              paddingTop: PAD_TOP,
              paddingBottom: PAD_BOTTOM,
            }}
          >
            <header
              className="flex items-end justify-between border-b border-neutral-300 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-neutral-500"
              style={{ height: HEADER_H }}
            >
              <span className="truncate">{agreement.headerText}</span>
              <span className="shrink-0">{agreement.employee.name}</span>
            </header>

            <div style={{ height: CONTENT_H, overflow: "hidden", paddingTop: CONTENT_PAD_TOP }}>
              {page.map((i) => (
                <div key={blocks[i]?.id ?? i} style={{ display: "flow-root" }}>
                  {blocks[i]?.node}
                </div>
              ))}
            </div>

            <footer
              className="flex items-center justify-between border-t border-neutral-300 pt-2 text-[10px] text-neutral-500"
              style={{ height: FOOTER_H }}
            >
              <span className="truncate pr-4">{agreement.footerText}</span>
              <span className="shrink-0">
                Page {pageIndex + 1} of {pages.length}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
