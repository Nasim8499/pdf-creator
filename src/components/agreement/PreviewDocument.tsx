import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { formatDate, type Agreement } from "@/lib/agreement";

const PAGE_W = 794;
const PAGE_H = 1123;
const PAD_X = 64;
const PAD_TOP = 56;
const PAD_BOTTOM = 56;
const HEADER_H = 46;
const FOOTER_H = 40;
const CONTENT_H = PAGE_H - PAD_TOP - PAD_BOTTOM - HEADER_H - FOOTER_H;
const CONTENT_PAD_TOP = 20;
const PACK_H = CONTENT_H - CONTENT_PAD_TOP - 8;

type Block = { id: string; node: ReactNode; keepWithNext?: boolean };

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

function buildBlocks(a: Agreement): Block[] {
  const blocks: Block[] = [];

  blocks.push({
    id: "title",
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
    id: "parties",
    node: (
      <div className="mb-6 grid grid-cols-2 gap-5">
        {[
          { title: "Employer", p: a.employer },
          { title: "Employee", p: a.employee },
        ].map(({ title, p }) => (
          <div key={title} className="rounded-md border border-neutral-300 p-3">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
              {title}
            </div>
            <div className="doc-serif text-[13.5px] font-semibold text-neutral-900">
              {p.name || "—"}
            </div>
            <div className="mt-1 space-y-0.5 text-[11.5px] leading-snug text-neutral-600">
              {p.address ? <div>{p.address}</div> : null}
              {p.contact ? <div>{p.contact}</div> : null}
              {p.extra ? <div>{p.extra}</div> : null}
            </div>
          </div>
        ))}
      </div>
    ),
  });

  blocks.push({
    id: "dates",
    node: (
      <div className="mb-6 rounded-md bg-neutral-100 px-4 py-3">
        <Field label="Date of agreement" value={formatDate(a.agreementDate)} />
        <Field label="Commencement date" value={formatDate(a.startDate)} />
        {a.endDate ? <Field label="End date" value={formatDate(a.endDate)} /> : null}
      </div>
    ),
  });

  a.clauses.forEach((c) => {
    blocks.push({
      id: c.id,
      node: (
        <section className="mb-5">
          <h2 className="doc-serif mb-1.5 text-[15px] font-semibold text-neutral-900">
            {c.heading}
          </h2>
          <div
            className="doc-prose text-[12.5px] leading-[1.7] text-neutral-800"
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
      node: (
        <h2 className="doc-serif mb-2 mt-2 text-[15px] font-semibold text-neutral-900">
          Acknowledgements and Consents
        </h2>
      ),
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
      node: (
        <h2 className="doc-serif mb-3 mt-6 text-[15px] font-semibold text-neutral-900">
          Signatures
        </h2>
      ),
    });
    a.signatures.forEach((s) => {
      blocks.push({
        id: s.id,
        node: (
          <div className="mb-4 rounded-md border border-neutral-300 p-4">
            <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
              {s.role}
            </div>
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
      if (current.length && used + h > PACK_H) {
        const moved: number[] = [];
        while (current.length > 1 && blocks[current[current.length - 1]]?.keepWithNext) {
          moved.unshift(current.pop() as number);
        }
        next.push(current);
        current = moved;
        used = moved.reduce((sum, idx) => sum + heights[idx], 0);
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
