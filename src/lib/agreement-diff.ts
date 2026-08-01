import type { Agreement, Clause, Consent, SignatureBlock } from "./agreement";

export type WordPart = { type: "same" | "add" | "del"; text: string };

export type FieldChange = {
  key: string;
  label: string;
  before: string;
  after: string;
  parts: WordPart[];
};

export type ItemChange = {
  id: string;
  title: string;
  status: "added" | "removed" | "modified";
  fields: FieldChange[];
};

export type SectionDiff = {
  section: string;
  fields: FieldChange[];
  items: ItemChange[];
};

export type AgreementDiff = {
  sections: SectionDiff[];
  totalChanges: number;
};

export function htmlToText(html: string) {
  return html
    .replace(/<\s*(br|\/p|\/li|\/div|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Word-level LCS diff, good enough for clause-sized text. */
export function diffWords(before: string, after: string): WordPart[] {
  const a = before.length ? before.split(/(\s+)/).filter((t) => t !== "") : [];
  const b = after.length ? after.split(/(\s+)/).filter((t) => t !== "") : [];

  // Guard against pathological sizes.
  if (a.length * b.length > 400_000) {
    const parts: WordPart[] = [];
    if (before) parts.push({ type: "del", text: before });
    if (after) parts.push({ type: "add", text: after });
    return parts;
  }

  const m = a.length;
  const n = b.length;
  const table: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      table[i]![j] = a[i] === b[j] ? (table[i + 1]![j + 1] ?? 0) + 1 : Math.max(table[i + 1]![j] ?? 0, table[i]![j + 1] ?? 0);
    }
  }

  const raw: WordPart[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      raw.push({ type: "same", text: a[i]! });
      i++;
      j++;
    } else if ((table[i + 1]![j] ?? 0) >= (table[i]![j + 1] ?? 0)) {
      raw.push({ type: "del", text: a[i]! });
      i++;
    } else {
      raw.push({ type: "add", text: b[j]! });
      j++;
    }
  }
  while (i < m) raw.push({ type: "del", text: a[i++]! });
  while (j < n) raw.push({ type: "add", text: b[j++]! });

  // Merge adjacent parts of the same type.
  const merged: WordPart[] = [];
  for (const part of raw) {
    const last = merged[merged.length - 1];
    if (last && last.type === part.type) last.text += part.text;
    else merged.push({ ...part });
  }
  return merged;
}

function field(key: string, label: string, before: string, after: string): FieldChange | null {
  const b = (before ?? "").trim();
  const a = (after ?? "").trim();
  if (b === a) return null;
  return { key, label, before: b, after: a, parts: diffWords(b, a) };
}

function compact(items: (FieldChange | null)[]): FieldChange[] {
  return items.filter((x): x is FieldChange => x !== null);
}

function logoField(prefix: string, before?: string, after?: string): FieldChange | null {
  const b = before ?? "";
  const a = after ?? "";
  if (b === a) return null;
  const state = (v: string) => (v ? "Logo set" : "No logo");
  return {
    key: `${prefix}.logo`,
    label: "Logo",
    before: state(b),
    after: state(a),
    parts: [
      { type: "del", text: state(b) },
      { type: "same", text: " → " },
      { type: "add", text: b && a ? "Logo replaced" : state(a) },
    ],
  };
}

function partyFields(prefix: string, before: Agreement["employer"], after: Agreement["employer"]) {
  return compact([
    field(`${prefix}.name`, "Name", before.name, after.name),
    field(`${prefix}.address`, "Address", before.address, after.address),
    field(`${prefix}.contact`, "Contact", before.contact, after.contact),
    field(`${prefix}.extra`, "Additional details", before.extra, after.extra),
    logoField(prefix, before.logo, after.logo),
  ]);
}

function clauseItems(before: Clause[], after: Clause[]): ItemChange[] {
  const beforeMap = new Map(before.map((c) => [c.id, c]));
  const afterMap = new Map(after.map((c) => [c.id, c]));
  const out: ItemChange[] = [];

  after.forEach((c, index) => {
    const prev = beforeMap.get(c.id);
    if (!prev) {
      out.push({
        id: c.id,
        title: `${index + 1}. ${c.heading || "Untitled clause"}`,
        status: "added",
        fields: compact([
          field("heading", "Heading", "", c.heading),
          field("body", "Body", "", htmlToText(c.html)),
        ]),
      });
      return;
    }
    const fields = compact([
      field("heading", "Heading", prev.heading, c.heading),
      field("body", "Body", htmlToText(prev.html), htmlToText(c.html)),
    ]);
    if (fields.length) {
      out.push({
        id: c.id,
        title: `${index + 1}. ${c.heading || prev.heading || "Untitled clause"}`,
        status: "modified",
        fields,
      });
    }
  });

  before.forEach((c, index) => {
    if (afterMap.has(c.id)) return;
    out.push({
      id: c.id,
      title: `${index + 1}. ${c.heading || "Untitled clause"}`,
      status: "removed",
      fields: compact([
        field("heading", "Heading", c.heading, ""),
        field("body", "Body", htmlToText(c.html), ""),
      ]),
    });
  });

  return out;
}

function signatureItems(before: SignatureBlock[], after: SignatureBlock[]): ItemChange[] {
  const beforeMap = new Map(before.map((s) => [s.id, s]));
  const afterMap = new Map(after.map((s) => [s.id, s]));
  const out: ItemChange[] = [];

  const describe = (s: SignatureBlock, prev: SignatureBlock | null): FieldChange[] =>
    compact([
      field("role", "Role", prev?.role ?? "", s.role),
      field("name", "Name", prev?.name ?? "", s.name),
      field("title", "Title", prev?.title ?? "", s.title),
      field("organisation", "Organisation", prev?.organisation ?? "", s.organisation),
      field("signatureLabel", "Signature label", prev?.signatureLabel ?? "", s.signatureLabel),
      field("dateLabel", "Date label", prev?.dateLabel ?? "", s.dateLabel),
      field("dateValue", "Date signed", prev?.dateValue ?? "", s.dateValue),
    ]);

  after.forEach((s) => {
    const prev = beforeMap.get(s.id);
    if (!prev) {
      out.push({ id: s.id, title: s.role || "Signature block", status: "added", fields: describe(s, null) });
      return;
    }
    const fields = describe(s, prev);
    if (fields.length) {
      out.push({ id: s.id, title: s.role || prev.role || "Signature block", status: "modified", fields });
    }
  });

  before.forEach((s) => {
    if (afterMap.has(s.id)) return;
    out.push({
      id: s.id,
      title: s.role || "Signature block",
      status: "removed",
      fields: compact([
        field("name", "Name", s.name, ""),
        field("title", "Title", s.title, ""),
        field("organisation", "Organisation", s.organisation, ""),
      ]),
    });
  });

  return out;
}

function consentItems(before: Consent[], after: Consent[]): ItemChange[] {
  const beforeMap = new Map(before.map((c) => [c.id, c]));
  const afterMap = new Map(after.map((c) => [c.id, c]));
  const yn = (v: boolean) => (v ? "Acknowledged" : "Not acknowledged");
  const out: ItemChange[] = [];

  after.forEach((c) => {
    const prev = beforeMap.get(c.id);
    if (!prev) {
      out.push({
        id: c.id,
        title: c.label || "Consent",
        status: "added",
        fields: compact([
          field("label", "Label", "", c.label),
          field("text", "Text", "", c.text),
          field("acknowledged", "State", "", yn(c.acknowledged)),
        ]),
      });
      return;
    }
    const fields = compact([
      field("label", "Label", prev.label, c.label),
      field("text", "Text", prev.text, c.text),
      field("acknowledged", "State", yn(prev.acknowledged), yn(c.acknowledged)),
    ]);
    if (fields.length) out.push({ id: c.id, title: c.label || prev.label || "Consent", status: "modified", fields });
  });

  before.forEach((c) => {
    if (afterMap.has(c.id)) return;
    out.push({
      id: c.id,
      title: c.label || "Consent",
      status: "removed",
      fields: compact([field("text", "Text", c.text, "")]),
    });
  });

  return out;
}

export function diffAgreements(before: Agreement, after: Agreement): AgreementDiff {
  const sections: SectionDiff[] = [
    {
      section: "Document details",
      fields: compact([
        field("documentTitle", "Document title", before.documentTitle, after.documentTitle),
        field("subtitle", "Subtitle", before.subtitle, after.subtitle),
        field("headerText", "Header", before.headerText, after.headerText),
        field("footerText", "Footer", before.footerText, after.footerText),
        field("agreementDate", "Agreement date", before.agreementDate, after.agreementDate),
        field("startDate", "Start date", before.startDate, after.startDate),
        field("endDate", "End date", before.endDate, after.endDate),
      ]),
      items: [],
    },
    { section: "Employer", fields: partyFields("employer", before.employer, after.employer), items: [] },
    { section: "Employee", fields: partyFields("employee", before.employee, after.employee), items: [] },
    { section: "Clauses", fields: [], items: clauseItems(before.clauses, after.clauses) },
    { section: "Signature blocks", fields: [], items: signatureItems(before.signatures, after.signatures) },
    { section: "Consents", fields: [], items: consentItems(before.consents, after.consents) },
  ].filter((s) => s.fields.length > 0 || s.items.length > 0);

  const totalChanges = sections.reduce((sum, s) => sum + s.fields.length + s.items.length, 0);
  return { sections, totalChanges };
}
