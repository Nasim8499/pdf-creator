import type { Agreement } from "./agreement";

/**
 * Compliance screening.
 *
 * This editor produces a *private* employment record. Government-issued
 * identifiers (immigration client IDs, visa decisions, accreditation numbers,
 * official verification portals, agency branding) must never be printed as if
 * this document issued or evidences them. Findings here block the PDF export.
 */

export type ComplianceRule = {
  id: string;
  label: string;
  hint: string;
  re: RegExp;
  /**
   * "fields" rules are only applied to identity/record-style fields. Clause and
   * letter prose may lawfully mention agencies (e.g. MBIE mediation services).
   */
  scope?: "all" | "fields";
};

export const complianceRules: ComplianceRule[] = [
  {
    id: "client-id",
    label: "Immigration / client ID",
    hint: "Remove agency-issued client or file IDs. Use Reference details for your own numbers.",
    re: /\b(?:inz\s*(?:client\s*)?id|client\s*(?:\/\s*inz\s*)?id|inz\s*\d{3,4}|nz\d{6,}[a-z-]*)\b/gi,
  },
  {
    id: "visa-status",
    label: "Visa status or decision",
    hint: "A private agreement cannot record a visa decision or status.",
    re: /\b(?:visa\s*status|approved[\s-]?in[\s-]?principle|visa\s*(?:number|no\.?|reference|approval|approved)|date\s*approved)\b/gi,
  },
  {
    id: "accreditation",
    label: "Accreditation / scheme reference",
    hint: "Employer accreditation numbers are issued by an agency — remove them.",
    re: /\b(?:accreditation\s*(?:id|no\.?|number|reference)|aewv[\s-]?\d|aewv-\d{4})\b/gi,
  },
  {
    id: "application-ref",
    label: "Official application reference",
    hint: "Application reference numbers belong to the agency file, not this agreement.",
    re: /\b(?:application\s*reference\s*(?:no\.?|number)?|immigration\s*reference)\b/gi,
  },
  {
    id: "portal",
    label: "Verification portal",
    hint: "Remove links that imply official verification of this document.",
    re: /\b(?:verification\s*portal|verify\s*portal|workpermit[a-z0-9-]*\.(?:online|com|net)|[a-z0-9-]+\.govt\.nz)\b/gi,
  },
  {
    id: "agency-branding",
    label: "Government agency branding",
    hint: "This document is not issued by or affiliated with any agency.",
    re: /\b(?:immigration\s+new\s+zealand|mbie|ministry\s+of\s+business,?\s+innovation)\b/gi,
    scope: "fields",
  },
  {
    id: "passport",
    label: "Passport number",
    hint: "Passport numbers are government-issued identity data — keep them out of the export.",
    re: /\bpassport\s*(?:no\.?|number|#)\b/gi,
  },
  {
    id: "official-use",
    label: "“Official use only” framing",
    hint: "Do not present this private record as an official record block.",
    re: /\b(?:official\s+(?:immigration|records?|use\s+only)|inz\s+use\s+only)\b/gi,
  },
];

export type ComplianceFinding = {
  ruleId: string;
  label: string;
  hint: string;
  field: string;
  match: string;
  excerpt: string;
};

const strip = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function scanText(
  field: string,
  text: string,
  out: ComplianceFinding[],
  scope: "all" | "fields" = "fields",
) {
  const value = (text ?? "").toString();
  if (!value.trim()) return;
  for (const rule of complianceRules) {
    if ((rule.scope ?? "all") === "fields" && scope === "all") continue;
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(value)) !== null) {
      const start = Math.max(0, m.index - 34);
      out.push({
        ruleId: rule.id,
        label: rule.label,
        hint: rule.hint,
        field,
        match: m[0],
        excerpt:
          (start > 0 ? "…" : "") +
          value.slice(start, Math.min(value.length, m.index + m[0].length + 34)).trim() +
          (m.index + m[0].length + 34 < value.length ? "…" : ""),
      });
      if (out.length > 60) return;
    }
  }
}

export function scanAgreement(a: Agreement): ComplianceFinding[] {
  const out: ComplianceFinding[] = [];
  scanText("Document title", a.documentTitle, out);
  scanText("Subtitle", a.subtitle, out);
  scanText("Page header", a.headerText, out);
  scanText("Page footer", a.footerText, out);
  scanText("Private-record notice", a.noticeTitle ?? "", out);
  scanText("Private-record notice", a.noticeText ?? "", out);

  ([["Employer", a.employer], ["Employee", a.employee]] as const).forEach(([who, p]) => {
    scanText(`${who} · name`, p.name, out);
    scanText(`${who} · legal name`, p.legalName ?? "", out);
    scanText(`${who} · address`, p.address, out);
    scanText(`${who} · postal address`, p.postalAddress ?? "", out);
    scanText(`${who} · contact`, p.contact, out);
    scanText(`${who} · website`, p.website ?? "", out);
    scanText(`${who} · registration`, p.registration ?? "", out);
    scanText(`${who} · position`, p.position ?? "", out);
    scanText(`${who} · additional detail`, p.extra, out);
  });

  (a.references ?? []).forEach((r) => {
    scanText(`Reference · ${r.label || "untitled"}`, r.label, out);
    scanText(`Reference · ${r.label || "untitled"}`, r.value, out);
  });

  if (a.letter?.enabled) {
    scanText("Letter · heading", a.letter.title, out);
    scanText("Letter · salutation", a.letter.salutation, out);
    scanText("Letter · body", strip(a.letter.html), out, "all");
    scanText("Letter · sign-off", a.letter.signerName, out);
    scanText("Letter · sign-off", a.letter.signerTitle, out);
  }

  a.clauses.forEach((c) => {
    scanText(`Clause · ${c.heading}`, c.heading, out, "all");
    scanText(`Clause · ${c.heading}`, strip(c.html), out, "all");
  });
  a.consents.forEach((c) => scanText(`Consent · ${c.label}`, `${c.label} ${c.text}`, out));
  a.signatures.forEach((s) =>
    scanText(`Signature · ${s.role}`, `${s.role} ${s.name} ${s.title} ${s.organisation}`, out),
  );

  scanText("Document code", a.settings.codes.value, out);
  scanText("Document code caption", a.settings.codes.caption, out);
  a.settings.sponsors.forEach((sp) => scanText(`Sponsor · ${sp.name}`, `${sp.name} ${sp.tagline}`, out));

  // Clause text may legitimately discuss visas in general terms; only the
  // record-style field patterns above are treated as findings.
  return out;
}
