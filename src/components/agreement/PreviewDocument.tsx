import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  formatDate,
  type Agreement,
  type DocSettings,
  type LogoSettings,
  type Party,
  type SponsorLogoSettings,
} from "@/lib/agreement";
import { docThemes, pageSizes, type DocTheme } from "@/lib/doc-theme";
import { buildReport, type AuditBlockMeta, type LayoutFingerprint, type LayoutReport } from "@/lib/layout-audit";
import { CodeMark } from "./CodeMark";

type Block = {
  id: string;
  node: ReactNode;
  keepWithNext?: boolean;
  breakBefore?: boolean;
  kind?: AuditBlockMeta["kind"];
  label?: string;
};

type Ctx = { a: Agreement; s: DocSettings; t: DocTheme };


const alignClass: Record<LogoSettings["align"], string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function Logo({
  src,
  alt,
  h,
  s,
}: {
  src?: string | undefined;
  alt: string;
  h: number;
  s: LogoSettings;
}) {
  if (!src || h <= 0) return null;
  return (
    <img
      src={src}
      alt={alt}
      style={{
        height: h,
        maxWidth: h * 5,
        objectFit: s.fit,
        marginLeft: s.offsetX,
        marginTop: s.offsetY,
      }}
      className="w-auto shrink-0"
    />
  );
}

function LogoSlot({
  src,
  alt,
  h,
  label,
  s,
}: {
  src?: string | undefined;
  alt: string;
  h: number;
  label: string;
  s: LogoSettings;
}) {
  return (
    <div
      className={`flex items-center overflow-hidden px-2 ${alignClass[s.align]} ${
        s.frame ? "border border-dashed" : ""
      }`}
      style={{ height: h + 14, minWidth: h + 40, borderColor: "#cbd2dd" }}
    >
      {src ? (
        <Logo src={src} alt={alt} h={h} s={s} />
      ) : (
        <span className="text-[7.5px] uppercase tracking-[0.16em] text-neutral-400">{label}</span>
      )}
    </div>
  );
}

function Field({ label, value, t }: { label: string; value: string; t: DocTheme }) {
  return (
    <div className="flex gap-2 py-[3px]">
      <span
        className="w-40 shrink-0 text-[10.5px] uppercase tracking-wide"
        style={{ color: t.muted }}
      >
        {label}
      </span>
      <span className="flex-1 text-[12.5px]" style={{ color: t.body }}>
        {value || "—"}
      </span>
    </div>
  );
}

function SectionBar({ index, title, t, gap }: { index: string; title: string; t: DocTheme; gap: number }) {
  return (
    <div
      className="mt-2 flex items-center gap-3 px-3 py-1.5"
      style={{
        marginBottom: gap,
        background: t.bandBg,
        borderTop: `2px solid ${t.ink}`,
        borderBottom: `2px solid ${t.ink}`,
      }}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: t.bandText, opacity: 0.72 }}
      >
        {index}
      </span>
      <span
        className={`${t.headingClass} text-[13px] font-semibold uppercase tracking-[0.14em]`}
        style={{ color: t.bandText }}
      >
        {title}
      </span>
    </div>
  );
}

function SponsorStrip({ a, t }: Ctx) {
  const { sponsors, sponsorHeading, sponsorLogo: sl } = a.settings;
  if (!sponsors.length) return null;
  return (
    <div
      className="mb-5 overflow-hidden"
      style={{ border: `1px solid ${sl.highlight ? t.accent : t.chromeRule}`, background: t.surface }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.22em]"
        style={{ background: t.bandBg, color: t.bandText }}
      >
        {sl.highlight ? (
          <span className="h-2.5 w-2.5 shrink-0" style={{ background: t.accent }} />
        ) : null}
        {sponsorHeading || "Supported by"}
      </div>
      <div
        className={`flex flex-wrap items-center ${alignClass[sl.align]}`}
        style={{
          columnGap: sl.gap,
          rowGap: Math.max(8, sl.marginY * 2),
          paddingLeft: 12 + sl.marginX,
          paddingRight: 12 + sl.marginX,
          paddingTop: 10 + sl.marginY,
          paddingBottom: 10 + sl.marginY,
        }}
      >
        {sponsors.map((sp) => (
          <div key={sp.id} className="flex items-center gap-2.5">
            {sp.logo ? (
              <img
                src={sp.logo}
                alt={sp.name}
                className="w-auto"
                style={{
                  height: sl.stripHeight,
                  maxWidth: sl.stripHeight * 5,
                  objectFit: sl.fit,
                  ...(sl.frame ? { border: `1px solid ${t.chromeRule}`, padding: 2 } : null),
                }}
              />
            ) : (
              <div
                className="grid place-items-center text-[11px] font-bold"
                style={{
                  height: sl.stripHeight,
                  width: sl.stripHeight,
                  background: sl.highlight ? t.accent : t.bandBg,
                  color: t.bandText,
                }}
              >
                {(sp.name || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="leading-tight">
              <div className="text-[11.5px] font-semibold" style={{ color: t.ink }}>
                {sp.name}
              </div>
              {sp.tagline ? (
                <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: t.muted }}>
                  {sp.tagline}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact sponsor row printed in every page header/footer. */
function SponsorMarks({ a, t, sl }: { a: Agreement; t: DocTheme; sl: SponsorLogoSettings }) {
  const sponsors = a.settings.sponsors.slice(0, Math.max(1, sl.maxMarks));
  if (!sponsors.length) return null;
  return (
    <div
      className="flex shrink-0 items-center"
      style={{
        gap: Math.max(6, sl.gap / 3),
        marginLeft: sl.marginX,
        marginRight: sl.marginX,
        marginTop: sl.marginY,
        marginBottom: sl.marginY,
        paddingLeft: sl.highlight ? 6 : 0,
        borderLeft: sl.highlight ? `2px solid ${t.accent}` : undefined,
      }}
    >
      {sponsors.map((sp) =>
        sp.logo ? (
          <img
            key={sp.id}
            src={sp.logo}
            alt={sp.name}
            className="w-auto"
            style={{
              height: sl.markHeight,
              maxWidth: sl.markHeight * 5,
              objectFit: sl.fit,
              ...(sl.frame ? { border: `1px solid ${t.chromeRule}` } : null),
            }}
          />
        ) : (
          <span
            key={sp.id}
            className="whitespace-nowrap px-1 text-[8px] font-semibold uppercase tracking-[0.14em]"
            style={{
              lineHeight: `${sl.markHeight}px`,
              color: t.ink,
              ...(sl.frame ? { border: `1px solid ${t.chromeRule}` } : null),
            }}
          >
            {sp.name}
          </span>
        ),
      )}
    </div>
  );
}

function VerifyMark({ t, s, inline }: { t: DocTheme; s: DocSettings; inline?: boolean }) {
  if (!s.codes.enabled || !s.codes.value.trim()) return null;
  return (
    <div
      className={`flex items-center gap-3 ${inline ? "" : "mt-4"} px-3 py-2`}
      style={{ border: `1px solid ${t.chromeRule}`, background: t.chromeBg }}
    >
      <CodeMark type={s.codes.type} value={s.codes.value} size={s.codes.size} dark={t.ink} />
      <div className="min-w-0">
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: t.ink }}>
          Document reference
        </div>
        <div className="mt-0.5 break-all text-[9.5px] leading-snug" style={{ color: t.muted }}>
          {s.codes.value}
        </div>

        {s.codes.caption ? (
          <div className="mt-1 text-[9.5px] italic" style={{ color: t.muted }}>
            {s.codes.caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PartyCard({ title, p, t, s }: { title: string; p: Party; t: DocTheme; s: DocSettings }) {
  return (
    <div style={{ border: `1px solid ${t.chromeRule}` }}>
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5"
        style={{ background: t.surface, borderBottom: `1px solid ${t.chromeRule}` }}
      >
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: t.ink }}
        >
          {title}
        </span>
        <Logo src={p.logo} alt={`${title} logo`} h={20} s={s.logo} />
      </div>
      <div className="p-3">
        <div className={`${t.headingClass} text-[13.5px] font-semibold`} style={{ color: t.ink }}>
          {p.name || "—"}
        </div>
        <div className="mt-1 space-y-0.5 text-[11.5px] leading-snug" style={{ color: t.muted }}>
          {p.address ? <div>{p.address}</div> : null}
          {p.contact ? <div>{p.contact}</div> : null}
          {p.extra ? <div>{p.extra}</div> : null}
        </div>
      </div>
    </div>
  );
}

function buildBlocks(ctx: Ctx): Block[] {
  const { a, s, t } = ctx;
  const blocks: Block[] = [];
  const brk = s.strictBreaks;

  if (s.showCover) {
    blocks.push({
      id: "cover",
      kind: "cover",
      label: "Cover page",
      node: (
        <div className="flex flex-col justify-between" style={{ minHeight: 820 }}>
          <div>
            <div
              className="flex items-start justify-between gap-6 pb-4"
              style={{ borderBottom: `2px solid ${t.ink}` }}
            >
              {s.logo.showOnCover ? (
                <LogoSlot
                  src={a.employer.logo}
                  alt="Employer logo"
                  h={s.logo.coverHeight}
                  label="Employer logo"
                  s={s.logo}
                />
              ) : (
                <span />
              )}
              <div
                className="pt-1 text-center text-[9.5px] uppercase leading-relaxed tracking-[0.2em]"
                style={{ color: t.muted }}
              >
                New Zealand
                <br />
                Individual Employment Agreement
              </div>
              {s.logo.showOnCover ? (
                <LogoSlot
                  src={a.employee.logo}
                  alt="Employee logo"
                  h={s.logo.coverHeight}
                  label="Employee logo"
                  s={s.logo}
                />
              ) : (
                <span />
              )}
            </div>
            <div
              className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.18em]"
              style={{ color: t.muted }}
            >
              <span>Part A · Parties</span>
              <span>Part B · Terms</span>
              <span>Part C · Consents</span>
              <span>Part D · Signatures</span>
            </div>
          </div>

          <div>
            <div className="mb-5 h-[3px] w-24" style={{ background: t.accent }} />
            <h1
              className={`${t.headingClass} text-[42px] font-semibold leading-[1.1]`}
              style={{ color: t.ink }}
            >
              {a.documentTitle}
            </h1>
            {a.subtitle ? (
              <p className="mt-4 max-w-[80%] text-[13px] italic leading-relaxed" style={{ color: t.muted }}>
                {a.subtitle}
              </p>
            ) : null}
            <div className="mt-8 grid grid-cols-2" style={{ borderTop: `1px solid ${t.chromeRule}`, borderBottom: `1px solid ${t.chromeRule}` }}>
              {[
                { k: "Employer", v: a.employer.name || "—" },
                { k: "Employee", v: a.employee.name || "—" },
                { k: "Date of agreement", v: formatDate(a.agreementDate) },
                { k: "Commencement", v: formatDate(a.startDate) },
              ].map(({ k, v }) => (
                <div key={k} className="px-1 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: t.muted }}>
                    {k}
                  </div>
                  <div className={`${t.headingClass} mt-1 text-[16px] font-semibold`} style={{ color: t.ink }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            {s.codes.enabled && s.codes.onCover ? <VerifyMark t={t} s={s} /> : null}
          </div>

          <div>
            {s.showSponsorStrip && s.sponsorLogo.onCover ? <SponsorStrip {...ctx} /> : null}
            <p
              className="pt-3 text-[11px] leading-relaxed"
              style={{ borderTop: `1px solid ${t.chromeRule}`, color: t.muted }}
            >
              This document is a private agreement between the parties named above. It is not issued
              by, and is not affiliated with, any government agency. Minimum entitlements under New
              Zealand employment law apply regardless of the terms recorded here.
            </p>
          </div>
        </div>
      ),
    });
  }

  if (s.showContents) {
    blocks.push({
      id: "toc",
      kind: "toc",
      label: "Contents",
      breakBefore: s.showCover,
      node: (
        <div>
          <h2
            className={`${t.headingClass} mb-4 pb-2 text-[19px] font-semibold`}
            style={{ color: t.ink, borderBottom: `1px solid ${t.chromeRule}` }}
          >
            Contents
          </h2>
          <ol className="columns-3 gap-6 [column-fill:balance]">
            {a.clauses.map((c, i) => (
              <li
                key={c.id}
                className="mb-[5px] break-inside-avoid text-[10px] leading-snug"
                style={{ color: t.body }}
              >
                {s.numberClauses ? (
                  <span className="tabular-nums" style={{ color: t.muted }}>
                    {String(i + 1).padStart(2, "0")}{" "}
                  </span>
                ) : null}
                {c.heading}
              </li>
            ))}
          </ol>
        </div>
      ),
    });
  }

  blocks.push({
    id: "title",
    kind: "title",
    label: "Title block",
    breakBefore: s.showCover || s.showContents,
    node: (
      <div className="mb-6 pb-4" style={{ borderBottom: `2px solid ${t.ink}` }}>
        <h1
          className={`${t.headingClass} text-[26px] font-semibold leading-tight`}
          style={{ color: t.ink }}
        >
          {a.documentTitle}
        </h1>
        {a.subtitle ? (
          <p className="mt-1.5 text-[11.5px] italic" style={{ color: t.muted }}>
            {a.subtitle}
          </p>
        ) : null}
      </div>
    ),
  });

  blocks.push({
    id: "parties-bar",
    kind: "band",
    label: "Part A · Parties",
    keepWithNext: true,
    node: <SectionBar index="Part A" title="Parties to this agreement" t={t} gap={s.sectionSpacing} />,
  });

  blocks.push({
    id: "parties",
    node: (
      <div className="grid grid-cols-2 gap-5" style={{ marginBottom: s.sectionSpacing }}>
        <PartyCard title="Employer" p={a.employer} t={t} s={s} />
        <PartyCard title="Employee" p={a.employee} t={t} s={s} />
      </div>
    ),
  });

  blocks.push({
    id: "dates",
    node: (
      <div
        className="px-4 py-3"
        style={{
          marginBottom: s.sectionSpacing,
          background: t.surface,
          borderTop: `2px solid ${t.ink}`,
          borderBottom: `2px solid ${t.ink}`,
        }}
      >
        <Field label="Date of agreement" value={formatDate(a.agreementDate)} t={t} />
        <Field label="Commencement date" value={formatDate(a.startDate)} t={t} />
        {a.endDate ? <Field label="End date" value={formatDate(a.endDate)} t={t} /> : null}
      </div>
    ),
  });

  blocks.push({
    id: "terms-bar",
    kind: "band",
    label: "Part B · Terms",
    keepWithNext: true,
    breakBefore: brk,
    node: (
      <SectionBar index="Part B" title="Terms and conditions of employment" t={t} gap={s.sectionSpacing} />
    ),
  });

  a.clauses.forEach((c, index) => {
    blocks.push({
      id: c.id,
      kind: "clause",
      label: c.heading,
      node: (
        <section style={{ marginBottom: s.clauseSpacing }}>
          <h2
            className={`${t.headingClass} mb-2 flex gap-2.5 pb-1 text-[15.5px] font-semibold`}
            style={{ color: t.ink, borderBottom: `1px solid ${t.chromeRule}` }}
          >
            {s.numberClauses ? (
              <span className="shrink-0 tabular-nums" style={{ color: t.accent }}>
                {String(index + 1).padStart(2, "0")}
              </span>
            ) : null}
            <span>{c.heading}</span>
          </h2>
          <div
            className="doc-prose text-[13px] leading-[1.78]"
            style={{ color: t.body }}
            dangerouslySetInnerHTML={{ __html: c.html }}
          />
        </section>
      ),
    });
  });

  if (a.consents.length) {
    blocks.push({
      id: "consents-head",
      kind: "band",
      label: "Part C · Consents",
      keepWithNext: true,
      breakBefore: brk,
      node: (
        <SectionBar index="Part C" title="Acknowledgements and consents" t={t} gap={s.sectionSpacing} />
      ),
    });
    a.consents.forEach((c) => {
      blocks.push({
        id: c.id,
        node: (
          <div className="mb-2.5 flex gap-2.5">
            <span
              className="mt-[2px] flex size-[13px] shrink-0 items-center justify-center text-[9px] leading-none"
              style={
                c.acknowledged
                  ? { border: `1px solid ${t.ink}`, background: t.ink, color: "#fff" }
                  : { border: `1px solid ${t.muted}`, color: "transparent" }
              }
            >
              ✓
            </span>
            <p className="text-[12px] leading-[1.6]" style={{ color: t.body }}>
              {c.label ? (
                <b style={{ color: t.ink }}>{c.label}: </b>
              ) : null}
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
      kind: "band",
      label: "Part D · Signatures",
      keepWithNext: true,
      breakBefore: brk,
      node: <SectionBar index="Part D" title="Execution and signatures" t={t} gap={s.sectionSpacing} />,
    });
    a.signatures.forEach((sig) => {
      const role = sig.role.toLowerCase();
      const roleLogo = role.includes("employer")
        ? a.employer.logo
        : role.includes("employee")
          ? a.employee.logo
          : undefined;
      blocks.push({
        id: sig.id,
        kind: "signature",
        label: sig.role,
        node: (
          <div className="mb-4" style={{ border: `1px solid ${t.chromeRule}` }}>
            <div
              className="flex items-center justify-between gap-2 px-4 py-1.5"
              style={{ background: t.surface, borderBottom: `1px solid ${t.chromeRule}` }}
            >
              <span
                className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: t.ink }}
              >
                {sig.role}
              </span>
              {s.logo.showInSignatures ? (
                <Logo src={roleLogo} alt={`${sig.role} logo`} h={18} s={s.logo} />
              ) : null}
            </div>
            <div className="p-4 pt-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <Field label="Name" value={sig.name} t={t} />
                <Field label="Title" value={sig.title} t={t} />
                <Field label="Organisation" value={sig.organisation} t={t} />
                <Field label={sig.dateLabel || "Date"} value={formatDate(sig.dateValue)} t={t} />
              </div>
              <div className="mt-5" style={{ borderBottom: `1px solid ${t.muted}` }} />
              <div className="mt-1 text-[10.5px] uppercase tracking-wide" style={{ color: t.muted }}>
                {sig.signatureLabel || "Signature"}
              </div>
            </div>
          </div>
        ),
      });
    });

    if (s.codes.enabled && s.codes.inSignatures) {
      blocks.push({ id: "sign-code", node: <VerifyMark t={t} s={s} /> });
    }
    if (s.showSponsorStrip && s.sponsors.length && s.sponsorLogo.inSignatures) {
      blocks.push({ id: "sign-sponsors", kind: "other", label: "Sponsors", node: <div className="mt-5"><SponsorStrip {...ctx} /></div> });
    }
  }

  return blocks;
}

export function PreviewDocument({
  agreement,
  zoom = 1,
  onAudit,
  baseline,
}: {
  agreement: Agreement;
  zoom?: number;
  onAudit?: (report: LayoutReport) => void;
  baseline?: LayoutFingerprint | null;
}) {
  const s = agreement.settings;
  const t = docThemes[s.theme] ?? docThemes["nz-official"];
  const size = pageSizes[s.pageSize] ?? pageSizes.A4;
  const sl = s.sponsorLogo;
  const sponsorsOn = s.showSponsorStrip && s.sponsors.length > 0;

  const HEADER_H = s.showHeader ? 58 : 0;
  const FOOTER_H = s.showFooter ? 46 : 0;
  const CONTENT_PAD_TOP = s.showHeader ? 20 : 0;
  const CONTENT_H = size.h - s.marginY * 2 - HEADER_H - FOOTER_H;
  const PACK_H = CONTENT_H - CONTENT_PAD_TOP - 8;
  const innerW = size.w - s.marginX * 2;

  const blocks = useMemo(() => buildBlocks({ a: agreement, s, t }), [agreement, s, t]);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([blocks.map((_, i) => i)]);
  const signature = JSON.stringify(agreement);
  const auditRef = useRef(onAudit);
  auditRef.current = onAudit;
  const baselineRef = useRef(baseline);
  baselineRef.current = baseline;

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
    const paged = next.length ? next : [[]];
    setPages(paged);

    if (auditRef.current) {
      const metas: AuditBlockMeta[] = blocks.map((b, i) => ({
        id: b.id,
        kind: b.kind ?? "other",
        label: b.label ?? b.id,
        height: heights[i] ?? 0,
        keepWithNext: b.keepWithNext,
        breakBefore: b.breakBefore,
      }));
      auditRef.current(
        buildReport(
          {
            blocks: metas,
            pages: paged,
            packHeight: PACK_H,
            settings: s,
            headerHeight: HEADER_H,
            footerHeight: FOOTER_H,
          },
          baselineRef.current,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, PACK_H, innerW]);


  const pageStyle: CSSProperties = {
    width: size.w,
    height: size.h,
    paddingLeft: s.marginX,
    paddingRight: s.marginX,
    paddingTop: s.marginY,
    paddingBottom: s.marginY,
    color: t.body,
  };

  return (
    <div className="agreement-preview">
      <style>{`@page { size: ${size.mmW}mm ${size.mmH}mm; margin: 0; }
@media print { .doc-page { width: ${size.w - 1}px !important; height: ${size.h - 2}px !important; } }`}</style>

      <div
        aria-hidden
        ref={measureRef}
        style={{ width: innerW, position: "absolute", left: -99999, top: 0 }}
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
          height: zoom !== 1 ? `${(size.h + 24) * pages.length * zoom}px` : undefined,
        }}
      >
        {pages.map((page, pageIndex) => (
          <article
            key={pageIndex}
            className="doc-page relative bg-white shadow-[0_2px_24px_rgba(15,23,42,0.14)]"
            style={pageStyle}
          >
            {s.showHeader ? (
              <header
                className="flex items-center justify-between gap-4 pb-2"
                style={{ height: HEADER_H, borderBottom: `2px solid ${t.chromeRule}` }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {sponsorsOn && sl.inHeader && sl.headerSide === "left" ? (
                    <SponsorMarks a={agreement} t={t} sl={sl} />
                  ) : null}
                  {s.logo.showInHeader ? (
                    <Logo
                      src={agreement.employer.logo}
                      alt="Employer logo"
                      h={s.logo.headerHeight}
                      s={s.logo}
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div
                      className="truncate text-[10.5px] uppercase tracking-[0.16em]"
                      style={{ color: t.ink }}
                    >
                      {agreement.headerText}
                    </div>
                    <div
                      className="truncate text-[9px] uppercase tracking-[0.18em]"
                      style={{ color: t.muted }}
                    >
                      {agreement.employer.name}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  {s.codes.enabled && s.codes.onEveryPage ? (
                    <CodeMark type={s.codes.type} value={s.codes.value} size={30} dark={t.ink} />
                  ) : null}
                  <div className="text-right">
                    <div
                      className="text-[9px] uppercase tracking-[0.18em]"
                      style={{ color: t.muted }}
                    >
                      Employee
                    </div>
                    <div
                      className="text-[10.5px] uppercase tracking-[0.14em]"
                      style={{ color: t.ink }}
                    >
                      {agreement.employee.name}
                    </div>
                  </div>
                  {sponsorsOn && sl.inHeader && sl.headerSide === "right" ? (
                    <SponsorMarks a={agreement} t={t} sl={sl} />
                  ) : null}
                  {s.logo.showInHeader ? (
                    <Logo
                      src={agreement.employee.logo}
                      alt="Employee logo"
                      h={s.logo.headerHeight}
                      s={s.logo}
                    />
                  ) : null}
                </div>
              </header>
            ) : null}

            <div style={{ height: CONTENT_H, overflow: "hidden", paddingTop: CONTENT_PAD_TOP }}>
              {page.map((i) => (
                <div key={blocks[i]?.id ?? i} style={{ display: "flow-root" }}>
                  {blocks[i]?.node}
                </div>
              ))}
            </div>

            {s.showFooter ? (
              <footer
                className="flex items-center justify-between gap-4 pt-2 text-[10px]"
                style={{ height: FOOTER_H, borderTop: `2px solid ${t.chromeRule}`, color: t.muted }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {sponsorsOn && sl.inFooter && sl.footerSide === "left" ? (
                    <SponsorMarks a={agreement} t={t} sl={sl} />
                  ) : null}
                  {s.logo.showInFooter ? (
                    <Logo src={agreement.employer.logo} alt="" h={s.logo.footerHeight} s={s.logo} />
                  ) : null}
                  <span className="truncate">{agreement.footerText}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {s.showPageNumbers ? (
                    <span className="tabular-nums uppercase tracking-[0.14em]">
                      Page {pageIndex + 1} of {pages.length}
                    </span>
                  ) : null}
                  {sponsorsOn && sl.inFooter && sl.footerSide === "right" ? (
                    <SponsorMarks a={agreement} t={t} sl={sl} />
                  ) : null}
                  {s.logo.showInFooter ? (
                    <Logo src={agreement.employee.logo} alt="" h={s.logo.footerHeight} s={s.logo} />
                  ) : null}
                </div>
              </footer>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
