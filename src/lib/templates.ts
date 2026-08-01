import type { Agreement, Clause, Consent } from "./agreement";
import { clone, uid } from "./agreement";
import { nzClauses } from "./nz-clauses";

let n = 0;
const cid = (prefix: string) => `${prefix}-${++n}`;

const p = (...parts: string[]) => parts.map((t) => `<p>${t}</p>`).join("");
const ul = (...items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

/** Clauses shared by every agreement type, appended after the type-specific ones. */
function commonTail(prefix: string, start: number): Clause[] {
  let i = start;
  const h = (title: string) => `${i++}. ${title}`;
  return [
    {
      id: cid(prefix),
      heading: h("Health, Safety and Wellbeing"),
      html:
        p(
          "Both parties have duties under the Health and Safety at Work Act 2015. The engaging party will, so far as is reasonably practicable, provide a safe working environment, safe systems of work, adequate facilities, and the information, training, instruction and supervision needed to work safely.",
          "Hazards, incidents, near misses and injuries must be reported as soon as practicable so they can be recorded, investigated and controlled.",
        ) +
        ul(
          "Follow all safety rules, site inductions and reasonable safety instructions.",
          "Use personal protective equipment provided and never remove or disable a safety control.",
          "Do not begin or continue any task where the risk cannot be adequately controlled.",
          "Participate in worker engagement, consultation and health monitoring arrangements.",
        ),
    },
    {
      id: cid(prefix),
      heading: h("Confidential Information"),
      html: p(
        "Confidential information includes commercial terms, pricing, customer and supplier lists, methods, source materials, personal information and any other non-public information obtained in connection with this agreement.",
        "Confidential information must be used only for the purposes of this agreement, must not be disclosed to any other person without written consent, and must be returned or destroyed on request or at the end of the engagement.",
        "These obligations continue indefinitely after the engagement ends, except for information that lawfully enters the public domain or that a party is required by law to disclose.",
      ),
    },
    {
      id: cid(prefix),
      heading: h("Intellectual Property"),
      html: p(
        "All intellectual property created in the course of the engagement, and all materials, records and data produced using the engaging party's resources, are owned by the engaging party from the moment of creation.",
        "The other party will do everything reasonably required to perfect that ownership, including signing assignments and waiving moral rights to the extent permitted by law.",
        "Pre-existing intellectual property remains owned by the party that brought it to the engagement, and is licensed only to the extent needed to deliver the work described.",
      ),
    },
    {
      id: cid(prefix),
      heading: h("Privacy and Personal Information"),
      html: p(
        "Personal information is collected, held, used and disclosed in accordance with the Privacy Act 2020, and only for purposes connected with this agreement, its administration, and legal compliance.",
        "Each party may request access to, and correction of, personal information the other holds about them. Records are stored securely and kept only for as long as there is a lawful purpose for holding them.",
      ),
    },
    {
      id: cid(prefix),
      heading: h("Resolving Problems and Disputes"),
      html:
        p(
          "The parties will attempt in good faith to resolve any problem by direct discussion at the earliest opportunity, and will keep a brief written record of what was discussed and agreed.",
          "Where a matter cannot be resolved directly, either party may seek free mediation assistance through the Ministry of Business, Innovation and Employment's employment services.",
        ) +
        ul(
          "Raise the concern promptly and in writing where practicable.",
          "Meet within a reasonable time, with support people welcome at any meeting.",
          "Escalate to mediation before commencing any formal proceedings.",
        ),
    },
    {
      id: cid(prefix),
      heading: h("Variation, Severance and Entire Agreement"),
      html: p(
        "No variation to this agreement is effective unless it is recorded in writing and signed by both parties. A failure to enforce a term is not a waiver of that term.",
        "If any provision is found to be unenforceable, that provision is modified to the minimum extent necessary, or severed, and the remainder of the agreement continues in force.",
        "This document, together with any schedule and any policy expressly incorporated into it, records the entire agreement between the parties on its subject matter.",
      ),
    },
    {
      id: cid(prefix),
      heading: h("Notices and Contact Details"),
      html: p(
        "Notices under this agreement may be given by hand, by post to the last known address, or by email to the address recorded in the particulars, and are treated as received on delivery or on the next working day for electronic notices sent outside working hours.",
        "Each party must promptly notify the other of any change to their address, contact number or email address.",
      ),
    },
    {
      id: cid(prefix),
      heading: h("Governing Law and Jurisdiction"),
      html: p(
        "This agreement is governed by the law of New Zealand, and the parties submit to the non-exclusive jurisdiction of the courts and specialist institutions of New Zealand.",
        "Nothing in this agreement limits any minimum right or entitlement conferred by New Zealand legislation, and any term that purports to do so has no effect to the extent of that inconsistency.",
      ),
    },
  ];
}

const contractorClauses: Clause[] = [
  {
    id: cid("con"),
    heading: "1. Parties, Nature of Engagement and Term",
    html:
      p(
        "This Independent Contractor Agreement is made between the Principal and the Contractor named in the particulars of this document. The Contractor is engaged as an independent contractor and not as an employee, partner, agent or joint venturer of the Principal.",
        "The engagement begins on the commencement date recorded in this document and continues until the completion date, or until terminated in accordance with this agreement.",
        "The parties record that the true nature of the relationship is determined by its real substance, not only by the label used in this document. Each party will conduct the engagement consistently with an independent contracting relationship.",
      ) +
      ul(
        "The Contractor controls how, when and where the services are performed, subject to reasonable site, safety and deadline requirements.",
        "The Contractor may perform work for other clients, provided there is no conflict of interest.",
        "The Contractor is responsible for their own tax, ACC levies, insurance and business expenses.",
      ),
  },
  {
    id: cid("con"),
    heading: "2. Services and Deliverables",
    html:
      p(
        "The Contractor will provide the services described in the schedule to this agreement, and any further services agreed in writing, to a professional standard consistent with recognised industry practice.",
        "Deliverables must meet the acceptance criteria recorded in the schedule. Where a deliverable does not meet those criteria, the Principal will notify the Contractor in writing and allow a reasonable opportunity to remedy it at the Contractor's cost.",
      ) +
      ul(
        "Provide regular progress updates at the agreed intervals.",
        "Notify the Principal immediately of anything likely to delay a milestone.",
        "Maintain accurate records of the work performed and materials supplied.",
      ),
  },
  {
    id: cid("con"),
    heading: "3. Fees, Invoicing and Payment",
    html:
      p(
        "The Principal will pay the fees recorded in the schedule, whether calculated as an hourly rate, a daily rate or a fixed project fee, on receipt of a valid tax invoice.",
        "Invoices are payable within the payment period recorded in the schedule. Where no period is recorded, payment is due on the 20th of the month following the date of invoice.",
      ) +
      ul(
        "The Contractor is responsible for GST registration and for accounting for GST where registered.",
        "Withholding tax will be deducted where the services are of a type listed in the Income Tax Act 2007 and no exemption certificate is held.",
        "Disputed amounts will be notified within seven days and the undisputed balance paid on time.",
      ),
  },
  {
    id: cid("con"),
    heading: "4. Expenses, Equipment and Materials",
    html: p(
      "The Contractor supplies their own tools, equipment, software and consumables unless the schedule expressly records otherwise.",
      "Pre-approved expenses reasonably and necessarily incurred in providing the services will be reimbursed at cost on production of receipts. Expenses that have not been pre-approved in writing are the Contractor's own cost.",
    ),
  },
  {
    id: cid("con"),
    heading: "5. Subcontracting, Substitution and Personnel",
    html: p(
      "The Contractor may engage suitably qualified subcontractors or substitutes to perform the services, provided the Principal is notified in advance and the Contractor remains fully responsible for the work, conduct and confidentiality obligations of any person they engage.",
      "The Contractor will ensure every person engaged holds the necessary licences, registrations and site inductions, and is covered by appropriate insurance.",
    ),
  },
  {
    id: cid("con"),
    heading: "6. Insurance, Warranties and Liability",
    html:
      p(
        "The Contractor warrants that they hold the skills, licences and registrations needed to perform the services, and that the services will not infringe any third party's rights.",
        "The Contractor will maintain public liability insurance and, where relevant to the services, professional indemnity insurance, for the amounts recorded in the schedule, and will provide certificates of currency on request.",
      ) +
      ul(
        "Each party is liable for loss it causes through negligence, breach or wilful misconduct.",
        "Neither party is liable for indirect or consequential loss, except where that limitation is prohibited by law.",
        "Liability caps recorded in the schedule do not limit liability for personal injury, fraud, or breach of confidentiality.",
      ),
  },
  {
    id: cid("con"),
    heading: "7. Status, Tax and Statutory Compliance",
    html: p(
      "The Contractor is not entitled to holiday pay, sick leave, public holiday payments, KiwiSaver employer contributions or other employee entitlements, because the Contractor is not an employee under this agreement.",
      "The Contractor will meet all of their own income tax, GST, ACC levy and student loan obligations, and indemnifies the Principal against any liability arising from a failure to do so.",
      "Nothing in this clause prevents any person from applying to the Employment Relations Authority for a determination of their employment status.",
    ),
  },
  {
    id: cid("con"),
    heading: "8. Restraints, Non-Solicitation and Conflicts",
    html: p(
      "During the engagement and for the restraint period recorded in the schedule, the Contractor will not solicit the Principal's clients or personnel with whom they had material contact through this engagement.",
      "Any restraint applies only to the extent it is reasonable in duration, area and scope to protect the Principal's legitimate proprietary interests, and will be read down as necessary to remain enforceable.",
      "The Contractor will disclose any actual or potential conflict of interest as soon as they become aware of it.",
    ),
  },
  {
    id: cid("con"),
    heading: "9. Termination and Consequences",
    html:
      p(
        "Either party may terminate this agreement by giving the notice period recorded in the schedule, or immediately where the other party commits a material breach that is not remedied within ten working days of written notice.",
        "On termination, the Contractor will deliver up all work in progress, materials, records and confidential information, and will invoice for services properly performed up to the termination date.",
      ) +
      ul(
        "Accrued rights and obligations survive termination.",
        "Confidentiality, intellectual property and liability provisions continue to apply.",
        "Neither party is entitled to compensation merely because the engagement ends.",
      ),
  },
  ...commonTail("con", 10),
];

const casualClauses: Clause[] = [
  {
    id: cid("cas"),
    heading: "1. Nature of Casual Employment",
    html:
      p(
        "This is a casual employment agreement. There is no expectation of ongoing or regular employment, and no guaranteed hours of work. Each engagement is a separate period of employment that begins when the Employee accepts an offer of work and ends at the conclusion of that work.",
        "The Employer is not obliged to offer work, and the Employee is not obliged to accept any work offered. Declining an offer of work will not disadvantage the Employee in relation to future offers.",
      ) +
      ul(
        "Each accepted shift is a discrete period of employment.",
        "There is no availability provision, so the Employee is free to be unavailable at any time.",
        "If a genuine pattern of regular work develops, the parties will discuss moving to a permanent agreement.",
      ),
  },
  {
    id: cid("cas"),
    heading: "2. Offers and Acceptance of Work",
    html: p(
      "Work will usually be offered by phone, text message or the Employer's rostering system, and will state the date, expected start and finish times, the location and the work to be performed.",
      "An offer becomes an engagement once the Employee accepts it. Once accepted, the Employee is expected to attend on time and to notify the Employer as early as possible if they are unable to attend.",
      "Where an accepted shift is cancelled by the Employer after the Employee has commenced travel or work, the Employee will be paid for the time actually worked and any compensation recorded in the schedule.",
    ),
  },
  {
    id: cid("cas"),
    heading: "3. Position, Duties and Supervision",
    html:
      p(
        "The Employee is engaged in the position recorded in this agreement and will perform the duties of that position, together with any other duties reasonably within their skills, training and experience.",
        "The Employee will follow all lawful and reasonable instructions, complete the required inductions, and comply with workplace policies in force at the time of each engagement.",
      ) +
      ul(
        "Arrive fit for work and ready to start at the agreed time.",
        "Record start, finish and break times accurately.",
        "Report any hazard, incident or injury immediately.",
      ),
  },
  {
    id: cid("cas"),
    heading: "4. Remuneration and Casual Loading",
    html: p(
      "The Employee will be paid the hourly rate recorded in this agreement for each hour worked, which will never be less than the applicable adult minimum wage.",
      "Wages are paid by direct credit at the agreed frequency, with an itemised payslip showing hours worked, gross pay, holiday pay, deductions and net pay.",
      "Where the parties have agreed to pay holiday pay as an 8% addition to each pay, that amount is shown separately on the payslip, as required by the Holidays Act 2003.",
    ),
  },
  {
    id: cid("cas"),
    heading: "5. Holiday Pay, Public Holidays and Leave",
    html:
      p(
        "Because employment is genuinely intermittent and irregular, annual holiday pay may lawfully be paid as 8% of gross earnings with each pay instead of accruing four weeks of annual holidays. If the pattern of work becomes regular, the Employee becomes entitled to four weeks of annual holidays instead.",
        "If the Employee works on a public holiday, they are paid at least time and a half for the hours worked. If the day would otherwise be a working day for them, they also receive an alternative holiday.",
      ) +
      ul(
        "Sick leave and bereavement leave apply where the Employee meets the statutory work-pattern criteria.",
        "Family violence leave is available on the same statutory basis.",
        "All statutory minimums apply regardless of anything recorded in this agreement.",
      ),
  },
  {
    id: cid("cas"),
    heading: "6. Rest and Meal Breaks",
    html: p(
      "Paid rest breaks and unpaid meal breaks are provided in accordance with Part 6D of the Employment Relations Act 2000, based on the length of each engagement.",
      "Break timing will be agreed with the supervisor at the start of the shift. Where breaks cannot be taken because of the nature of the work, compensatory measures will be provided.",
    ),
  },
  {
    id: cid("cas"),
    heading: "7. KiwiSaver, Deductions and Records",
    html: p(
      "KiwiSaver automatic enrolment rules apply to casual employees in the same way as to other employees, and compulsory employer contributions are paid where the Employee is a contributing member.",
      "No deduction will be made from wages other than deductions required by law or specifically consented to in writing, in accordance with the Wages Protection Act 1983.",
      "Accurate wage, time, holiday and leave records are kept for every engagement and are available to the Employee on request.",
    ),
  },
  {
    id: cid("cas"),
    heading: "8. Ending an Engagement",
    html: p(
      "Each engagement ends at the conclusion of the shift or piece of work accepted. No notice is required to bring an individual engagement to an end.",
      "This overarching casual agreement may be ended by either party on one week's written notice. Ending the arrangement does not affect wages or holiday pay already owed for work performed.",
      "Nothing in this clause removes the Employee's right to raise a personal grievance about how the employment relationship has been conducted.",
    ),
  },
  ...commonTail("cas", 9),
];

const fixedTermClauses: Clause[] = [
  {
    id: cid("fix"),
    heading: "1. Fixed Term and Genuine Reasons",
    html:
      p(
        "This is a fixed-term employment agreement. Employment begins on the commencement date and ends on the end date recorded in this document, unless it is ended earlier in accordance with this agreement.",
        "The genuine reason based on reasonable grounds for the fixed term, and the way employment will end, are recorded in the schedule, as required by section 66 of the Employment Relations Act 2000.",
      ) +
      ul(
        "The fixed term is not being used to exclude or limit the Employee's statutory rights.",
        "The fixed term is not being used to establish the suitability of the Employee for permanent employment.",
        "If the fixed term ends and work continues by agreement, the employment becomes permanent on the same terms.",
      ),
  },
  {
    id: cid("fix"),
    heading: "2. Position, Duties and Reporting",
    html: p(
      "The Employee is employed in the position recorded in this agreement for the duration of the fixed term, and reports to the manager notified to them from time to time.",
      "The Employee will perform the duties of the position with reasonable skill, care and diligence, and will comply with the Employer's lawful and reasonable instructions and workplace policies.",
    ),
  },
  {
    id: cid("fix"),
    heading: "3. Hours, Remuneration and Entitlements",
    html:
      p(
        "The Employee's agreed hours, days of work and remuneration are recorded in this agreement. Wages are paid by direct credit at the agreed frequency, less lawful deductions, with an itemised payslip each period.",
        "Statutory entitlements accrue in the same way as for permanent employees, including annual holidays, public holidays, sick leave, bereavement leave and family violence leave.",
      ) +
      ul(
        "Where the fixed term is less than twelve months, annual holiday pay may be paid as 8% of gross earnings if the parties agree in writing.",
        "Public holiday entitlements are unaffected by the fixed term.",
        "KiwiSaver enrolment and employer contributions apply as normal.",
      ),
  },
  {
    id: cid("fix"),
    heading: "4. Early Termination and End of Term",
    html: p(
      "Either party may end this agreement before the end date by giving the notice period recorded in this agreement, or immediately in the case of serious misconduct following a fair process.",
      "The Employer will confirm the approaching end of the fixed term in writing at least four weeks before the end date, or as soon as practicable for shorter terms, and will discuss any available continuing work.",
      "At the end of the term the Employee will be paid all outstanding wages and holiday pay in the final pay.",
    ),
  },
  ...commonTail("fix", 5),
];

const baseConsents = (extra: Array<[string, string]>): Consent[] => [
  {
    id: uid(),
    label: "Independent advice",
    text: "I confirm I have had a reasonable opportunity to seek independent advice about the terms of this agreement before signing.",
    acknowledged: true,
  },
  {
    id: uid(),
    label: "Privacy",
    text: "I consent to my personal information being collected, stored and used for the administration of this agreement.",
    acknowledged: true,
  },
  ...extra.map(([label, text]) => ({ id: uid(), label, text, acknowledged: false })),
];

export type AgreementTemplate = {
  id: string;
  label: string;
  blurb: string;
  documentTitle: string;
  subtitle: string;
  headerText: string;
  /** Short badge printed on the cover. */
  badge: string;
  clauses: Clause[];
  consents: Consent[];
  roles: [string, string];
};

export const agreementTemplates: AgreementTemplate[] = [
  {
    id: "individual",
    label: "Individual employment",
    blurb: "Permanent employee, full statutory terms, 30+ clauses.",
    documentTitle: "Individual Employment Agreement",
    subtitle:
      "New Zealand format — neutral template, not an official or government-issued document",
    headerText: "Individual Employment Agreement — New Zealand",
    badge: "Permanent employment",
    clauses: nzClauses,
    consents: baseConsents([
      [
        "Policies",
        "I acknowledge I have been given access to the Employer's workplace policies and understand they may be updated from time to time.",
      ],
    ]),
    roles: ["Employer", "Employee"],
  },
  {
    id: "contractor",
    label: "Independent contractor",
    blurb: "Services, fees, invoicing, insurance and restraints.",
    documentTitle: "Independent Contractor Services Agreement",
    subtitle:
      "New Zealand format — a private services agreement between a principal and an independent contractor",
    headerText: "Independent Contractor Agreement — New Zealand",
    badge: "Contract for services",
    clauses: contractorClauses,
    consents: baseConsents([
      [
        "Contractor status",
        "I confirm I am engaged as an independent contractor, and that I am responsible for my own tax, ACC levies and insurance.",
      ],
      [
        "Insurance",
        "I confirm I hold, and will maintain, the insurance cover recorded in the schedule to this agreement.",
      ],
    ]),
    roles: ["Principal", "Contractor"],
  },
  {
    id: "casual",
    label: "Casual employment",
    blurb: "No guaranteed hours, shift offers, 8% holiday pay.",
    documentTitle: "Casual Employment Agreement",
    subtitle:
      "New Zealand format — intermittent and irregular work with no guaranteed hours",
    headerText: "Casual Employment Agreement — New Zealand",
    badge: "Casual · no guaranteed hours",
    clauses: casualClauses,
    consents: baseConsents([
      [
        "Casual basis",
        "I understand that work is offered on a casual basis, that there are no guaranteed hours, and that I may decline any offer of work.",
      ],
      [
        "Holiday pay",
        "I agree that annual holiday pay may be paid as 8% of my gross earnings with each pay while my work remains intermittent and irregular.",
      ],
    ]),
    roles: ["Employer", "Employee"],
  },
  {
    id: "fixed-term",
    label: "Fixed-term employment",
    blurb: "Genuine reason, end date and end-of-term process.",
    documentTitle: "Fixed-Term Employment Agreement",
    subtitle:
      "New Zealand format — employment for a defined term with a genuine reason based on reasonable grounds",
    headerText: "Fixed-Term Employment Agreement — New Zealand",
    badge: "Fixed term",
    clauses: fixedTermClauses,
    consents: baseConsents([
      [
        "Fixed term",
        "I understand the genuine reason for the fixed term, when my employment will end, and how it will end.",
      ],
    ]),
    roles: ["Employer", "Employee"],
  },
];

export const templateById = (id: string) =>
  agreementTemplates.find((t) => t.id === id) ?? agreementTemplates[0]!;

/** Swaps the document body to another template, keeping party details and settings. */
export function applyTemplate(prev: Agreement, template: AgreementTemplate): Agreement {
  const [roleA, roleB] = template.roles;
  return {
    ...prev,
    templateId: template.id,
    documentTitle: template.documentTitle,
    subtitle: template.subtitle,
    headerText: template.headerText,
    clauses: clone(template.clauses).map((c) => ({ ...c, id: uid() })),
    consents: clone(template.consents).map((c) => ({ ...c, id: uid() })),
    signatures: prev.signatures.map((sig, i) => ({
      ...sig,
      role: i === 0 ? roleA : i === 1 ? roleB : sig.role,
    })),
  };
}
