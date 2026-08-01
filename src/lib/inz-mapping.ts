import { uid, type Agreement, type AuditEntry, type Party } from "./agreement";

/**
 * INZ → party-field mapping.
 *
 * Users often paste agency-style record blocks ("Client / INZ ID", "Visa
 * Status", "Accreditation ID", "Verification Portal"). Everything that is
 * legitimately a party detail (entity name, NZBN, addresses, contact, legal
 * name, position) is moved into the ordinary employer/employee fields and
 * marked party-supplied. Anything that is agency-issued is removed and
 * recorded in the compliance audit trail.
 */

type Target =
  | { kind: "party"; who: "employer" | "employee"; field: keyof Party; name: string }
  | { kind: "drop"; reason: string };

const rules: { re: RegExp; target: Target }[] = [
  // Agency-issued — never printed.
  { re: /(client\s*\/?\s*inz\s*id|inz\s*id|client\s*id)/i, target: { kind: "drop", reason: "Agency-issued client identifier" } },
  { re: /(visa\s*status|approved[\s-]?in[\s-]?principle|date\s*approved)/i, target: { kind: "drop", reason: "Visa status or decision" } },
  { re: /accreditation/i, target: { kind: "drop", reason: "Employer accreditation reference" } },
  { re: /(application\s*reference|immigration\s*reference)/i, target: { kind: "drop", reason: "Official application reference" } },
  { re: /(verification\s*portal|verify\s*portal)/i, target: { kind: "drop", reason: "Official verification portal" } },
  { re: /passport/i, target: { kind: "drop", reason: "Government-issued identity document number" } },

  // Employer particulars.
  { re: /(employer\s*(entity|name)|company\s*name|entity\s*name)/i, target: { kind: "party", who: "employer", field: "name", name: "Employer · entity name" } },
  { re: /(nzbn|company\s*(no|number)|co\.?\s*no)/i, target: { kind: "party", who: "employer", field: "registration", name: "Employer · NZBN / company number" } },
  { re: /(corporate\s*hq|head\s*office|employer\s*address|registered\s*office)/i, target: { kind: "party", who: "employer", field: "address", name: "Employer · address" } },
  { re: /(employer\s*contact|employer\s*phone)/i, target: { kind: "party", who: "employer", field: "contact", name: "Employer · contact" } },
  { re: /website/i, target: { kind: "party", who: "employer", field: "website", name: "Employer · website" } },

  // Employee particulars.
  { re: /(full\s*legal\s*name|employee\s*name|legal\s*name)/i, target: { kind: "party", who: "employee", field: "legalName", name: "Employee · full legal name" } },
  { re: /(residential\s*address|employee\s*address|home\s*address)/i, target: { kind: "party", who: "employee", field: "address", name: "Employee · address" } },
  { re: /(designated\s*position|job\s*title|position|role)/i, target: { kind: "party", who: "employee", field: "position", name: "Employee · position" } },
  { re: /(employee\s*contact|mobile|phone|email)/i, target: { kind: "party", who: "employee", field: "contact", name: "Employee · contact" } },
  { re: /(date\s*of\s*birth|dob|nationality)/i, target: { kind: "party", who: "employee", field: "extra", name: "Employee · additional detail" } },
];

function classify(label: string): Target | null {
  for (const r of rules) if (r.re.test(label)) return r.target;
  return null;
}

/** Removes agency framing words from a label that is otherwise fine to keep. */
export function neutraliseLabel(label: string) {
  return label
    .replace(/\b(inz|immigration new zealand|mbie|official|govt|government)\b/gi, "")
    .replace(/\s*[·|/-]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type MappingPreview = {
  mapped: AuditEntry[];
  excluded: AuditEntry[];
  renamed: AuditEntry[];
};

export type MappingResult = MappingPreview & { next: Agreement };

export function applyInzMapping(a: Agreement): MappingResult {
  const at = new Date().toISOString();
  const mapped: AuditEntry[] = [];
  const excluded: AuditEntry[] = [];
  const renamed: AuditEntry[] = [];

  const employer: Party = { ...a.employer };
  const employee: Party = { ...a.employee };
  const keep: Agreement["references"] = [];

  for (const ref of a.references ?? []) {
    const label = (ref.label ?? "").trim();
    const value = (ref.value ?? "").trim();
    const target = classify(label);

    if (target?.kind === "drop") {
      excluded.push({
        id: uid(),
        at,
        action: "excluded",
        label: label || "Untitled field",
        detail: target.reason,
      });
      continue;
    }

    if (target?.kind === "party" && value) {
      const party = target.who === "employer" ? employer : employee;
      const field = target.field as "extra";
      const existing = (party[field] ?? "").toString().trim();
      party[field] = existing && existing !== value ? `${existing}\n${value}` : value;
      mapped.push({
        id: uid(),
        at,
        action: "mapped",
        label: label || target.name,
        detail: `Moved to ${target.name} (party-supplied)`,
      });
      continue;
    }

    const clean = neutraliseLabel(label);
    if (clean && clean !== label) {
      renamed.push({
        id: uid(),
        at,
        action: "mapped",
        label,
        detail: `Kept as party-supplied reference “${clean}”`,
      });
    }
    keep.push({ ...ref, label: clean || label || "Reference" });
  }

  const trail = [...(a.auditTrail ?? []), ...mapped, ...renamed, ...excluded];

  return {
    mapped,
    excluded,
    renamed,
    next: {
      ...a,
      employer,
      employee,
      references: keep,
      auditTrail: trail,
    },
  };
}

/** Dry run used to show the user what a mapping would do. */
export function previewInzMapping(a: Agreement): MappingPreview {
  const { mapped, excluded, renamed } = applyInzMapping(a);
  return { mapped, excluded, renamed };
}
