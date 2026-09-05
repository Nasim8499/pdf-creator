/**
 * Country configuration registry.
 *
 * Every screen, form and PDF in this app is generated from the data below —
 * there is no country-specific UI code. To add a country, append one
 * `CountryConfig` to `countries`. See /docs in the app for the full guide.
 */

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "select"
  | "textarea"
  | "checkbox";

export type Field = {
  /** Stable key. Used for storage and PDF output — never rename in place. */
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  /** Render at half width on wider screens. */
  half?: boolean;
};

export type Section = {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
};

export type CountryConfig = {
  /** ISO-3166 alpha-2, lowercase. Used in the URL. */
  code: string;
  name: string;
  flag: string;
  region: string;
  /** Generic brand colours for the generated PDF. No official emblems. */
  accent: { base: string; deep: string };
  formTitle: string;
  visaTypes: string[];
  processing: string;
  officialPortal: string;
  guidance: string[];
  sections: Section[];
};

/* ------------------------------------------------------------------ */
/* Reusable section builders                                           */
/* ------------------------------------------------------------------ */

const personal = (extra: Field[] = []): Section => ({
  id: "personal",
  title: "Personal details",
  description: "Exactly as printed in your passport.",
  fields: [
    { id: "surname", label: "Surname / family name", type: "text", required: true, half: true },
    { id: "givenNames", label: "Given names", type: "text", required: true, half: true },
    { id: "otherNames", label: "Any other names used", type: "text" },
    { id: "dob", label: "Date of birth", type: "date", required: true, half: true },
    {
      id: "sex",
      label: "Sex",
      type: "select",
      options: ["Female", "Male", "Unspecified"],
      required: true,
      half: true,
    },
    { id: "birthPlace", label: "Town / city of birth", type: "text", required: true, half: true },
    { id: "birthCountry", label: "Country of birth", type: "text", required: true, half: true },
    { id: "nationality", label: "Current nationality", type: "text", required: true, half: true },
    { id: "otherNationality", label: "Other nationality held", type: "text", half: true },
    {
      id: "maritalStatus",
      label: "Marital status",
      type: "select",
      options: ["Single", "Married", "Civil partnership", "Divorced", "Widowed", "Separated"],
      half: true,
    },
    ...extra,
  ],
});

const passport = (extra: Field[] = []): Section => ({
  id: "passport",
  title: "Travel document",
  fields: [
    {
      id: "passportType",
      label: "Document type",
      type: "select",
      options: ["Ordinary passport", "Official passport", "Diplomatic passport", "Travel document"],
      required: true,
      half: true,
    },
    { id: "passportNumber", label: "Document number", type: "text", required: true, half: true },
    { id: "passportIssued", label: "Date of issue", type: "date", required: true, half: true },
    { id: "passportExpiry", label: "Date of expiry", type: "date", required: true, half: true },
    { id: "passportAuthority", label: "Issuing authority", type: "text", required: true },
    ...extra,
  ],
});

const contact = (extra: Field[] = []): Section => ({
  id: "contact",
  title: "Contact & residence",
  fields: [
    { id: "addressLine", label: "Home address", type: "textarea", required: true },
    { id: "city", label: "City", type: "text", required: true, half: true },
    { id: "postcode", label: "Post code", type: "text", half: true },
    { id: "residenceCountry", label: "Country of residence", type: "text", required: true },
    { id: "email", label: "Email address", type: "email", required: true, half: true },
    { id: "phone", label: "Mobile number", type: "tel", required: true, half: true },
    ...extra,
  ],
});

const travel = (label: string, extra: Field[] = []): Section => ({
  id: "travel",
  title: "Travel plans",
  description: `Your intended visit to ${label}.`,
  fields: [
    { id: "purpose", label: "Main purpose of travel", type: "text", required: true },
    { id: "arrival", label: "Intended arrival date", type: "date", required: true, half: true },
    { id: "departure", label: "Intended departure date", type: "date", required: true, half: true },
    { id: "stayLength", label: "Length of stay (days)", type: "number", half: true },
    {
      id: "entries",
      label: "Entries requested",
      type: "select",
      options: ["Single", "Double", "Multiple"],
      half: true,
    },
    { id: "arrivalPort", label: "Port / city of first entry", type: "text", half: true },
    { id: "previousVisits", label: "Previous visits (dates)", type: "textarea" },
  ].concat(extra as never[]) as Field[],
});

const accommodation = (extra: Field[] = []): Section => ({
  id: "accommodation",
  title: "Accommodation & host",
  fields: [
    {
      id: "stayType",
      label: "Where will you stay?",
      type: "select",
      options: ["Hotel", "Private host", "Employer housing", "Own property", "Other"],
      required: true,
    },
    { id: "stayName", label: "Hotel / host name", type: "text", required: true },
    { id: "stayAddress", label: "Full address in country", type: "textarea", required: true },
    { id: "stayPhone", label: "Contact number there", type: "tel", half: true },
    ...extra,
  ],
});

const funding = (currency: string, extra: Field[] = []): Section => ({
  id: "funding",
  title: "Funds & sponsorship",
  fields: [
    {
      id: "fundedBy",
      label: "Who is paying for the trip?",
      type: "select",
      options: ["Myself", "Employer", "Host / inviter", "Family member", "Scholarship"],
      required: true,
      half: true,
    },
    { id: "funds", label: `Available funds (${currency})`, type: "number", half: true },
    {
      id: "fundMeans",
      label: "Means of support",
      type: "select",
      options: ["Bank statement", "Credit card", "Cash", "Sponsor letter", "Prepaid bookings"],
    },
    { id: "sponsorDetails", label: "Sponsor name and relationship", type: "text" },
    ...extra,
  ],
});

const employment = (extra: Field[] = []): Section => ({
  id: "employment",
  title: "Occupation",
  fields: [
    {
      id: "occupationStatus",
      label: "Current status",
      type: "select",
      options: ["Employed", "Self-employed", "Student", "Retired", "Unemployed", "Homemaker"],
      required: true,
      half: true,
    },
    { id: "jobTitle", label: "Job title / field of study", type: "text", half: true },
    { id: "employerName", label: "Employer or institution", type: "text" },
    { id: "employerAddress", label: "Employer address", type: "textarea" },
    { id: "monthlyIncome", label: "Monthly income", type: "text", half: true },
    ...extra,
  ],
});

const background = (extra: Field[] = []): Section => ({
  id: "background",
  title: "Declarations",
  description: "Answer honestly — this sheet is only a preparation aid.",
  fields: [
    { id: "refused", label: "Have you ever been refused a visa? Give details", type: "textarea" },
    { id: "deported", label: "Have you ever been deported or removed? Give details", type: "textarea" },
    { id: "criminal", label: "Any criminal convictions? Give details", type: "textarea" },
    { id: "health", label: "Health conditions relevant to travel", type: "textarea" },
    ...extra,
  ],
});

const emergency = (): Section => ({
  id: "emergency",
  title: "Emergency contact",
  fields: [
    { id: "ecName", label: "Full name", type: "text", required: true, half: true },
    { id: "ecRelation", label: "Relationship", type: "text", half: true },
    { id: "ecPhone", label: "Phone number", type: "tel", required: true, half: true },
    { id: "ecEmail", label: "Email", type: "email", half: true },
  ],
});

const declaration = (): Section => ({
  id: "declaration",
  title: "Signature & consent",
  fields: [
    { id: "signName", label: "Name to appear on the signature line", type: "text", required: true },
    { id: "signPlace", label: "Place of signing", type: "text", half: true },
    { id: "signDate", label: "Date", type: "date", half: true },
    {
      id: "confirmUnofficial",
      label: "I understand this document is unofficial and must be submitted through the official portal.",
      type: "checkbox",
      required: true,
    },
  ],
});

/* ------------------------------------------------------------------ */
/* Countries                                                           */
/* ------------------------------------------------------------------ */

export const countries: CountryConfig[] = [
  {
    code: "au",
    name: "Australia",
    flag: "🇦🇺",
    region: "Oceania",
    accent: { base: "#0b7285", deep: "#083d4a" },
    formTitle: "Visitor & work visa preparation sheet",
    visaTypes: ["Visitor (600)", "eVisitor (651)", "Working Holiday (417)", "Student (500)"],
    processing: "Typically 2–8 weeks online",
    officialPortal: "immi.homeaffairs.gov.au",
    guidance: [
      "Most Australian visas are lodged online through ImmiAccount — there is no paper form to post.",
      "Have digital copies of your passport bio page, funds evidence and health insurance ready.",
    ],
    sections: [
      personal(),
      passport(),
      contact(),
      travel("Australia", [
        {
          id: "visaSubclass",
          label: "Visa subclass applied for",
          type: "select",
          options: ["Visitor (600)", "eVisitor (651)", "Working Holiday (417)", "Student (500)"],
          required: true,
        },
        { id: "immiAccount", label: "ImmiAccount reference (if created)", type: "text", half: true },
      ]),
      accommodation(),
      funding("AUD"),
      employment(),
      background([
        { id: "healthInsurance", label: "Health insurance provider and policy number", type: "text" },
      ]),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "es",
    name: "Spain",
    flag: "🇪🇸",
    region: "Europe / Schengen",
    accent: { base: "#b8342a", deep: "#6d1c16" },
    formTitle: "Schengen short-stay preparation sheet",
    visaTypes: ["Schengen short stay (C)", "National long stay (D)", "Student", "Non-lucrative"],
    processing: "15–45 calendar days",
    officialPortal: "exteriores.gob.es",
    guidance: [
      "Spain uses the harmonised Schengen application; appointments are booked through the consulate or its outsourced centre.",
      "Travel medical insurance of at least €30,000 cover is normally required.",
    ],
    sections: [
      personal([{ id: "idNumber", label: "National identity number", type: "text", half: true }]),
      passport(),
      contact(),
      travel("Spain", [
        {
          id: "schengenType",
          label: "Visa category",
          type: "select",
          options: ["Short stay (C)", "Long stay (D)", "Airport transit (A)"],
          required: true,
          half: true,
        },
        { id: "mainDestination", label: "Main Schengen destination", type: "text", half: true },
        { id: "firstEntryState", label: "Schengen state of first entry", type: "text", half: true },
        { id: "fingerprints", label: "Previous fingerprints given (date)", type: "text", half: true },
      ]),
      accommodation(),
      funding("EUR", [
        { id: "insurer", label: "Travel medical insurance provider", type: "text", half: true },
        { id: "insuranceCover", label: "Cover amount (EUR)", type: "number", half: true },
      ]),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "dk",
    name: "Denmark",
    flag: "🇩🇰",
    region: "Europe / Schengen",
    accent: { base: "#c0392b", deep: "#7b1f16" },
    formTitle: "Schengen & residence preparation sheet",
    visaTypes: ["Schengen short stay (C)", "Work permit", "Study permit", "Family reunification"],
    processing: "15–60 calendar days",
    officialPortal: "nyidanmark.dk",
    guidance: [
      "Danish residence cases run through SIRI / the Danish Immigration Service with a case order ID.",
      "Short visits use the standard Schengen route via the embassy or an application centre.",
    ],
    sections: [
      personal(),
      passport(),
      contact(),
      travel("Denmark", [
        {
          id: "permitType",
          label: "Permit sought",
          type: "select",
          options: ["Short stay (C)", "Work permit", "Study permit", "Family reunification"],
          required: true,
        },
        { id: "caseOrderId", label: "Case order ID (if issued)", type: "text", half: true },
      ]),
      accommodation(),
      funding("DKK", [
        { id: "insurer", label: "Travel medical insurance provider", type: "text", half: true },
      ]),
      employment([
        { id: "cprPending", label: "Danish employer CVR number (if any)", type: "text", half: true },
      ]),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "tr",
    name: "Turkey",
    flag: "🇹🇷",
    region: "Europe / Asia",
    accent: { base: "#c1121f", deep: "#6f0a12" },
    formTitle: "Visit & e-Visa preparation sheet",
    visaTypes: ["e-Visa (tourist)", "Sticker visa", "Work visa", "Student visa"],
    processing: "e-Visa minutes; sticker visa 2–6 weeks",
    officialPortal: "evisa.gov.tr",
    guidance: [
      "Many nationalities qualify for the online e-Visa; others apply at a Turkish consulate.",
      "Passport validity of at least 150 days beyond arrival is commonly requested.",
    ],
    sections: [
      personal(),
      passport(),
      contact(),
      travel("Turkey", [
        {
          id: "visaRoute",
          label: "Route",
          type: "select",
          options: ["e-Visa", "Consulate sticker visa", "Work visa", "Student visa"],
          required: true,
          half: true,
        },
        { id: "supportingDoc", label: "Supporting visa / residence permit held", type: "text", half: true },
      ]),
      accommodation(),
      funding("USD"),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "rs",
    name: "Serbia",
    flag: "🇷🇸",
    region: "Europe",
    accent: { base: "#1d4e89", deep: "#102f54" },
    formTitle: "Entry & temporary residence preparation sheet",
    visaTypes: ["Short stay (C)", "Long stay (D)", "Temporary residence", "Work permit"],
    processing: "15–30 days",
    officialPortal: "mfa.gov.rs",
    guidance: [
      "Long-stay (D) visas are usually the first step before applying for temporary residence in Serbia.",
      "White card registration of your address is expected shortly after arrival.",
    ],
    sections: [
      personal(),
      passport(),
      contact(),
      travel("Serbia", [
        {
          id: "visaCategory",
          label: "Category",
          type: "select",
          options: ["Short stay (C)", "Long stay (D)", "Temporary residence"],
          required: true,
        },
        { id: "inviterName", label: "Inviting person or company", type: "text" },
      ]),
      accommodation(),
      funding("EUR"),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "nz",
    name: "New Zealand",
    flag: "🇳🇿",
    region: "Oceania",
    accent: { base: "#12403a", deep: "#0a2521" },
    formTitle: "Visitor & work visa preparation sheet",
    visaTypes: ["Visitor visa", "NZeTA", "Accredited Employer Work Visa", "Student visa"],
    processing: "NZeTA minutes; visas 3–10 weeks",
    officialPortal: "immigration.govt.nz",
    guidance: [
      "Visa-waiver travellers still need an NZeTA plus the International Visitor Levy before boarding.",
      "Work visas normally require a job offer from an accredited employer.",
    ],
    sections: [
      personal(),
      passport(),
      contact(),
      travel("New Zealand", [
        {
          id: "visaProduct",
          label: "Visa applied for",
          type: "select",
          options: ["Visitor visa", "NZeTA", "Work visa", "Student visa"],
          required: true,
        },
        { id: "clientNumber", label: "Immigration NZ client number (if held)", type: "text", half: true },
      ]),
      accommodation(),
      funding("NZD"),
      employment([
        { id: "jobOffer", label: "NZ job offer / accredited employer", type: "text" },
      ]),
      background([
        { id: "chestXray", label: "Chest x-ray or medical certificate reference", type: "text", half: true },
      ]),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "by",
    name: "Belarus",
    flag: "🇧🇾",
    region: "Europe",
    accent: { base: "#3c6e47", deep: "#20402a" },
    formTitle: "Entry visa preparation sheet",
    visaTypes: ["Short stay (C)", "Long stay (D)", "Transit (B)"],
    processing: "5–15 working days",
    officialPortal: "mfa.gov.by",
    guidance: [
      "An invitation or confirmed booking is normally required, plus medical insurance valid in Belarus.",
      "Visa-free entry through certain airports has its own separate conditions.",
    ],
    sections: [
      personal([{ id: "patronymic", label: "Patronymic (if any)", type: "text", half: true }]),
      passport(),
      contact(),
      travel("Belarus", [
        {
          id: "visaCategory",
          label: "Visa category",
          type: "select",
          options: ["Short stay (C)", "Long stay (D)", "Transit (B)"],
          required: true,
          half: true,
        },
        { id: "invitationRef", label: "Invitation reference", type: "text", half: true },
      ]),
      accommodation(),
      funding("EUR", [
        { id: "insurer", label: "Medical insurance valid in Belarus", type: "text" },
      ]),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "md",
    name: "Moldova",
    flag: "🇲🇩",
    region: "Europe",
    accent: { base: "#1f4e9c", deep: "#122c58" },
    formTitle: "Entry visa preparation sheet",
    visaTypes: ["Short stay (C)", "Long stay (D)", "Transit (B)"],
    processing: "10–20 calendar days",
    officialPortal: "evisa.gov.md",
    guidance: [
      "Moldova offers an online e-Visa for many nationalities via the government portal.",
      "Proof of accommodation and return travel are commonly requested.",
    ],
    sections: [
      personal([{ id: "patronymic", label: "Patronymic (if any)", type: "text", half: true }]),
      passport(),
      contact(),
      travel("Moldova", [
        {
          id: "visaCategory",
          label: "Visa category",
          type: "select",
          options: ["Short stay (C)", "Long stay (D)", "Transit (B)"],
          required: true,
          half: true,
        },
        { id: "eVisaRef", label: "e-Visa reference", type: "text", half: true },
      ]),
      accommodation(),
      funding("EUR"),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "sa",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    region: "Middle East",
    accent: { base: "#146b3a", deep: "#0a3a1f" },
    formTitle: "Visit & work visa preparation sheet",
    visaTypes: ["Tourist eVisa", "Business visit", "Work visa", "Umrah visa"],
    processing: "eVisa minutes to days; work visa weeks",
    officialPortal: "visa.mofa.gov.sa",
    guidance: [
      "Tourist eVisas include mandatory insurance bundled with the fee.",
      "Work visas require an employer-issued block visa and enjaz processing.",
    ],
    sections: [
      personal([
        { id: "fatherName", label: "Father's name", type: "text", half: true },
        { id: "religion", label: "Religion (as commonly requested)", type: "text", half: true },
      ]),
      passport(),
      contact(),
      travel("Saudi Arabia", [
        {
          id: "visaRoute",
          label: "Visa route",
          type: "select",
          options: ["Tourist eVisa", "Business visit", "Work visa", "Umrah"],
          required: true,
          half: true,
        },
        { id: "sponsorId", label: "Sponsor / enjaz reference", type: "text", half: true },
      ]),
      accommodation(),
      funding("SAR"),
      employment([
        { id: "saEmployer", label: "Saudi employer or inviting company", type: "text" },
      ]),
      background([
        { id: "medicalCert", label: "Medical certificate reference (work visas)", type: "text", half: true },
      ]),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "ae",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    region: "Middle East",
    accent: { base: "#0f6b57", deep: "#06382d" },
    formTitle: "Entry permit preparation sheet",
    visaTypes: ["Tourist visa", "Visit visa", "Employment entry permit", "Golden visa"],
    processing: "2–10 working days",
    officialPortal: "icp.gov.ae",
    guidance: [
      "Most UAE entry permits are sponsored by an airline, hotel, employer or licensed agent.",
      "Emirates ID and medical screening follow after arrival for residence permits.",
    ],
    sections: [
      personal([{ id: "fatherName", label: "Father's name", type: "text", half: true }]),
      passport(),
      contact(),
      travel("the UAE", [
        {
          id: "permitType",
          label: "Permit type",
          type: "select",
          options: ["Tourist visa", "Visit visa", "Employment entry permit", "Golden visa"],
          required: true,
          half: true,
        },
        { id: "emirate", label: "Emirate of stay", type: "text", half: true },
        { id: "sponsorName", label: "Sponsor / host name", type: "text" },
      ]),
      accommodation(),
      funding("AED"),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "qa",
    name: "Qatar",
    flag: "🇶🇦",
    region: "Middle East",
    accent: { base: "#7b1735", deep: "#440c1d" },
    formTitle: "Entry & residence preparation sheet",
    visaTypes: ["Hayya entry", "Tourist visa", "Work visa", "Family visit"],
    processing: "3–10 working days",
    officialPortal: "portal.moi.gov.qa",
    guidance: [
      "Hayya platform registration covers most short visits and hotel-linked entries.",
      "Work visas are employer-sponsored and include medical and biometric steps.",
    ],
    sections: [
      personal([{ id: "fatherName", label: "Father's name", type: "text", half: true }]),
      passport(),
      contact(),
      travel("Qatar", [
        {
          id: "entryRoute",
          label: "Entry route",
          type: "select",
          options: ["Hayya entry", "Tourist visa", "Work visa", "Family visit"],
          required: true,
          half: true,
        },
        { id: "hayyaRef", label: "Hayya / booking reference", type: "text", half: true },
      ]),
      accommodation(),
      funding("QAR"),
      employment([{ id: "qaSponsor", label: "Qatari sponsor or employer", type: "text" }]),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "bh",
    name: "Bahrain",
    flag: "🇧🇭",
    region: "Middle East",
    accent: { base: "#96162c", deep: "#530b18" },
    formTitle: "Entry visa preparation sheet",
    visaTypes: ["eVisa (tourist)", "Visit visa", "Work visa", "Family visit"],
    processing: "3–10 working days",
    officialPortal: "evisa.gov.bh",
    guidance: [
      "Bahrain's eVisa portal covers most tourist and short business visits.",
      "Proof of onward travel and hotel booking is usually required at the border.",
    ],
    sections: [
      personal([{ id: "fatherName", label: "Father's name", type: "text", half: true }]),
      passport(),
      contact(),
      travel("Bahrain", [
        {
          id: "visaRoute",
          label: "Visa route",
          type: "select",
          options: ["eVisa", "Visit visa", "Work visa", "Family visit"],
          required: true,
          half: true,
        },
        { id: "sponsorCpr", label: "Sponsor CPR / CR number", type: "text", half: true },
      ]),
      accommodation(),
      funding("BHD"),
      employment(),
      background(),
      emergency(),
      declaration(),
    ],
  },
  {
    code: "my",
    name: "Malaysia",
    flag: "🇲🇾",
    region: "Asia",
    accent: { base: "#12457f", deep: "#0a2748" },
    formTitle: "Entry & pass preparation sheet",
    visaTypes: ["eVISA", "Visa on arrival", "Employment Pass", "Student pass"],
    processing: "eVISA 1–3 working days",
    officialPortal: "imi.gov.my",
    guidance: [
      "Travellers must complete the Malaysia Digital Arrival Card before entry.",
      "Employment Passes are applied for by the Malaysian employer through MDEC or ESD.",
    ],
    sections: [
      personal(),
      passport(),
      contact(),
      travel("Malaysia", [
        {
          id: "passType",
          label: "Pass or visa type",
          type: "select",
          options: ["eVISA", "Visa on arrival", "Employment Pass", "Student pass"],
          required: true,
          half: true,
        },
        { id: "mdacRef", label: "Digital Arrival Card reference", type: "text", half: true },
      ]),
      accommodation(),
      funding("MYR"),
      employment([{ id: "myEmployer", label: "Malaysian employer / institution", type: "text" }]),
      background(),
      emergency(),
      declaration(),
    ],
  },
];

export const DISCLAIMER =
  "Unofficial application preparation copy — submit through the official portal.";

export const getCountry = (code: string) =>
  countries.find((c) => c.code === code.toLowerCase());

export const countFields = (c: CountryConfig) =>
  c.sections.reduce((n, s) => n + s.fields.length, 0);

export const requiredFields = (c: CountryConfig) =>
  c.sections.flatMap((s) => s.fields.filter((f) => f.required).map((f) => f.id));
