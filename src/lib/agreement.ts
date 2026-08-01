export type Clause = {
  id: string;
  heading: string;
  html: string;
};

export type SignatureBlock = {
  id: string;
  role: string;
  name: string;
  title: string;
  organisation: string;
  signatureLabel: string;
  dateLabel: string;
  dateValue: string;
};

export type Consent = {
  id: string;
  label: string;
  text: string;
  acknowledged: boolean;
};

export type Party = {
  name: string;
  address: string;
  contact: string;
  extra: string;
};

export type Agreement = {
  documentTitle: string;
  subtitle: string;
  headerText: string;
  footerText: string;
  employer: Party;
  employee: Party;
  agreementDate: string;
  startDate: string;
  endDate: string;
  clauses: Clause[];
  signatures: SignatureBlock[];
  consents: Consent[];
};

export type Version = {
  id: string;
  label: string;
  savedAt: string;
  data: Agreement;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const STORAGE_KEY = "employment-agreement-editor-v1";

export const defaultAgreement: Agreement = {
  documentTitle: "Individual Employment Agreement",
  subtitle: "Neutral template — not an official or government-issued document",
  headerText: "Individual Employment Agreement — Draft",
  footerText: "Draft for review. Seek independent advice before signing.",
  employer: {
    name: "Employer Company Limited",
    address: "12 Example Street, Suburb, City 1010",
    contact: "+00 0 000 0000 · hr@employer.example",
    extra: "Company / registration number: 000000",
  },
  employee: {
    name: "Employee Full Name",
    address: "34 Sample Road, Suburb, City 2020",
    contact: "employee@example.com",
    extra: "Position: Operations Assistant",
  },
  agreementDate: "2026-08-01",
  startDate: "2026-09-01",
  endDate: "",
  clauses: [
    {
      id: uid(),
      heading: "1. Parties and Commencement",
      html: "<p>This agreement is made between the <b>Employer</b> and the <b>Employee</b> named above. Employment begins on the commencement date recorded in this agreement and continues until ended in accordance with the termination clause.</p>",
    },
    {
      id: uid(),
      heading: "2. Position and Duties",
      html: "<p>The Employee is engaged in the position described above and will perform the duties reasonably required for that role, together with any other duties within their skills and experience.</p><ul><li>Carry out duties with reasonable skill and care.</li><li>Follow lawful and reasonable instructions.</li><li>Comply with workplace policies and health and safety requirements.</li></ul>",
    },
    {
      id: uid(),
      heading: "3. Hours of Work",
      html: "<p>The Employee's ordinary hours are agreed between the parties and recorded in writing. Any change to the agreed pattern of work will be discussed in advance and confirmed in writing.</p>",
    },
    {
      id: uid(),
      heading: "4. Remuneration",
      html: "<p>The Employee will be paid the agreed rate for each hour worked, less lawful deductions. Payment is made at the agreed frequency into a bank account nominated by the Employee, with an itemised payslip provided each pay period.</p>",
    },
    {
      id: uid(),
      heading: "5. Leave Entitlements",
      html: "<p>The Employee is entitled to annual leave, public holidays, sick leave and bereavement leave in accordance with applicable employment legislation and any additional entitlements agreed in writing.</p>",
    },
    {
      id: uid(),
      heading: "6. Health and Safety",
      html: "<p>The Employer will provide a safe workplace, appropriate training and any required protective equipment at no cost. The Employee will follow safety procedures and report hazards and incidents promptly.</p>",
    },
    {
      id: uid(),
      heading: "7. Confidentiality",
      html: "<p>The Employee will keep confidential information of the Employer secure and will not disclose or use it other than for the proper performance of their duties, during and after employment.</p>",
    },
    {
      id: uid(),
      heading: "8. Resolving Employment Problems",
      html: "<p>Either party may raise a concern at any time. The parties will attempt to resolve problems in good faith and through discussion in the first instance, and may use mediation where a matter cannot be resolved directly.</p>",
    },
    {
      id: uid(),
      heading: "9. Termination",
      html: "<p>Either party may end this agreement by giving the agreed period of written notice. The Employer may terminate without notice for serious misconduct following a fair process.</p>",
    },
    {
      id: uid(),
      heading: "10. Variation and Entire Agreement",
      html: "<p>This agreement may only be varied by written agreement signed by both parties. It records the entire agreement between the parties and replaces any earlier understanding on the same subject.</p>",
    },
  ],
  signatures: [
    {
      id: uid(),
      role: "Employer",
      name: "Authorised Representative Name",
      title: "People & Culture Manager",
      organisation: "Employer Company Limited",
      signatureLabel: "Signature",
      dateLabel: "Date signed",
      dateValue: "",
    },
    {
      id: uid(),
      role: "Employee",
      name: "Employee Full Name",
      title: "",
      organisation: "",
      signatureLabel: "Signature",
      dateLabel: "Date signed",
      dateValue: "",
    },
  ],
  consents: [
    {
      id: uid(),
      label: "Independent advice",
      text: "I confirm I have had a reasonable opportunity to seek independent advice about the terms of this agreement before signing.",
      acknowledged: true,
    },
    {
      id: uid(),
      label: "Privacy",
      text: "I consent to my personal information being collected, stored and used by the Employer for employment administration purposes.",
      acknowledged: true,
    },
    {
      id: uid(),
      label: "Policies",
      text: "I acknowledge I have been given access to the Employer's workplace policies and understand they may be updated from time to time.",
      acknowledged: false,
    },
  ],
};

export function formatDate(value: string) {
  if (!value) return "—";
  const d = new Date(value + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type Stored = { current: Agreement; versions: Version[] };

export function loadStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.current) return null;
    return { current: parsed.current, versions: parsed.versions ?? [] };
  } catch {
    return null;
  }
}

export function saveStored(current: Agreement, versions: Version[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ current, versions }));
  } catch {
    /* storage unavailable */
  }
}

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
