import type { Clause } from "./agreement";

let n = 0;
const cid = () => `nz-${++n}`;

const p = (...parts: string[]) => parts.map((t) => `<p>${t}</p>`).join("");
const ul = (...items: string[]) =>
  `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const ol = (...items: string[]) =>
  `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;

export const nzClauses: Clause[] = [
  {
    id: cid(),
    heading: "1. Parties, Intent and Commencement",
    html:
      p(
        "This Individual Employment Agreement (<b>Agreement</b>) is made between the Employer and the Employee named in the party details of this document. It is an individual employment agreement for the purposes of the Employment Relations Act 2000.",
        "The parties acknowledge that they have dealt with each other in good faith in negotiating this Agreement, and that they will continue to act in good faith towards each other throughout the employment relationship, including by being responsive and communicative and by not doing anything that is likely to mislead or deceive the other party.",
        "Employment commences on the commencement date recorded in this Agreement, or on such other date as the parties agree in writing. The Employee's continuous service is calculated from that date for the purpose of all statutory entitlements.",
        "This Agreement replaces any earlier employment agreement, offer letter, or understanding between the parties relating to the Employee's employment, except where a term is expressly preserved in writing.",
      ) +
      ul(
        "The Employee confirms they are lawfully entitled to work in New Zealand and will maintain that entitlement for the duration of employment.",
        "The Employee will provide evidence of their right to work on request, and will notify the Employer immediately if that entitlement changes, lapses or is subject to new conditions.",
        "Where employment is dependent on a visa, this Agreement is conditional on the Employee holding a current visa permitting the work described.",
      ),
  },
  {
    id: cid(),
    heading: "2. Right to Seek Independent Advice",
    html: p(
      "Before signing this Agreement, the Employee has been given a copy of the proposed terms, a reasonable opportunity to seek independent advice, and a fair opportunity to raise questions or propose changes.",
      "The Employer has considered any issues raised by the Employee and has responded to them. The Employee is not required to sign this Agreement on the day it is provided, and no pressure has been placed on the Employee to sign without advice.",
      "Nothing in this Agreement limits the Employee's right to obtain advice from a union, a lawyer, a community law centre, or another adviser at any time during the employment relationship.",
    ),
  },
  {
    id: cid(),
    heading: "3. Trial and Probationary Arrangements",
    html:
      p(
        "Where the parties have agreed in writing to a trial period, that period is recorded in the schedule to this Agreement and applies only where the Employee has not previously been employed by the Employer and the period complies with the Employment Relations Act 2000.",
        "Where instead a probationary period applies, the Employer will inform the Employee of the standards expected, give the Employee a fair opportunity to meet those standards, and provide honest feedback during the period. A probationary period does not remove the Employee's right to raise a personal grievance.",
      ) +
      ul(
        "Support, training and supervision will be provided during any trial or probationary period.",
        "Performance discussions will be documented and shared with the Employee.",
        "At the end of the period the Employer will confirm in writing whether employment continues unchanged.",
      ),
  },
  {
    id: cid(),
    heading: "4. Position, Duties and Reporting",
    html:
      p(
        "The Employee is employed in the position recorded in this Agreement and reports to the manager notified to them from time to time. The Employee will perform the duties of that position, together with any other duties that are reasonably within their skills, training and experience.",
        "A position description may be provided and updated from time to time after discussion with the Employee. A position description is a guide to the role and is not intended to be an exhaustive statement of duties.",
      ) +
      ul(
        "Perform all duties with reasonable skill, care and diligence.",
        "Follow all lawful and reasonable instructions given by the Employer.",
        "Comply with workplace policies, procedures and codes of conduct.",
        "Use the Employer's equipment, systems and property properly and only for authorised purposes.",
        "Promptly report any matter that may affect the Employer's operations, reputation, or the safety of any person.",
      ),
  },
  {
    id: cid(),
    heading: "5. Place of Work and Mobility",
    html: p(
      "The Employee's usual place of work is the location recorded in this Agreement. The Employee may be required to work at other sites of the Employer where this is reasonable, having regard to travel time, cost and the Employee's personal circumstances.",
      "Any permanent change to the usual place of work will be discussed with the Employee in advance and confirmed in writing. Reasonable additional travel costs directly caused by a temporary relocation will be met by the Employer.",
      "Where the parties agree to remote or hybrid work, the Employee remains subject to the same duties, standards and health and safety obligations as when working on site.",
    ),
  },
  {
    id: cid(),
    heading: "6. Hours of Work and Availability",
    html:
      p(
        "The Employee's guaranteed hours, days of work, start and finish times and any agreed rostering pattern are recorded in the schedule to this Agreement, as required by the Employment Relations Act 2000.",
        "Any availability provision requires genuine reasons based on reasonable grounds and reasonable compensation for the availability period. The Employee may refuse to perform work outside their agreed hours where no compliant availability provision applies.",
      ) +
      ul(
        "Changes to rosters will be notified with reasonable advance notice.",
        "The Employer will not cancel a shift without notice or compensation where a shift cancellation provision applies.",
        "Additional hours worked at the Employer's request will be recorded and paid in accordance with this Agreement.",
      ),
  },
  {
    id: cid(),
    heading: "7. Rest and Meal Breaks",
    html: p(
      "The Employee is entitled to paid rest breaks and unpaid meal breaks in accordance with Part 6D of the Employment Relations Act 2000. The timing of breaks will be agreed between the parties, and where agreement is not reached the statutory default timing applies.",
      "Where the nature of the work means breaks cannot be taken at the specified times, the Employer will provide compensatory measures as required by law.",
      "The Employee will take their breaks and will not work through a break without the prior agreement of their manager.",
    ),
  },
  {
    id: cid(),
    heading: "8. Remuneration",
    html:
      p(
        "The Employee will be paid the rate recorded in this Agreement for each hour worked, or the agreed salary where the position is salaried, less all lawful deductions including PAYE.",
        "Wages will be paid at the agreed frequency by direct credit to a bank account nominated by the Employee. An itemised payslip will be provided each pay period showing hours worked, gross pay, deductions and net pay.",
        "The Employee's pay will never be less than the applicable adult minimum wage for each hour worked. Where a salary is paid, the Employer will monitor hours worked to ensure minimum wage compliance in every pay period.",
      ) +
      ul(
        "Time and wage records will be kept and made available to the Employee on request.",
        "Any overpayment may only be recovered with the Employee's written consent, following consultation.",
        "Remuneration will be reviewed at least annually, though a review does not guarantee an increase.",
      ),
  },
  {
    id: cid(),
    heading: "9. Deductions",
    html: p(
      "The Employer will not make any deduction from the Employee's wages other than deductions required by law, or deductions specifically consented to in writing by the Employee in accordance with the Wages Protection Act 1983.",
      "Before making any deduction relying on a general written consent, the Employer will consult with the Employee. The Employee may withdraw or vary a written consent at any time by giving written notice to the Employer.",
      "No deduction will be made for the cost of recruitment, training, tools, uniforms, or any premium associated with obtaining or maintaining employment.",
    ),
  },
  {
    id: cid(),
    heading: "10. KiwiSaver and Superannuation",
    html: p(
      "Where the Employee is eligible, the Employer will make compulsory employer contributions to KiwiSaver in accordance with the KiwiSaver Act 2006, in addition to the gross remuneration recorded in this Agreement unless the parties have lawfully agreed a total remuneration approach in writing.",
      "The Employer will provide the Employee with the required KiwiSaver information and will action any opt-out, savings suspension or contribution rate change in accordance with the Act.",
    ),
  },
  {
    id: cid(),
    heading: "11. Public Holidays",
    html:
      p(
        "The Employee is entitled to the public holidays set out in the Holidays Act 2003. Where a public holiday falls on a day that would otherwise be a working day for the Employee and the Employee does not work, the Employee is paid relevant daily pay or average daily pay.",
      ) +
      ul(
        "Work on a public holiday that is an otherwise working day is paid at time and a half and gives rise to an alternative holiday.",
        "Work on a public holiday that is not an otherwise working day is paid at time and a half with no alternative holiday.",
        "Alternative holidays are taken on a date agreed between the parties, and if not agreed within twelve months may be paid out on request.",
      ),
  },
  {
    id: cid(),
    heading: "12. Annual Holidays",
    html: p(
      "After each twelve months of continuous employment, the Employee is entitled to four weeks of paid annual holidays under the Holidays Act 2003.",
      "Annual holidays are taken at a time agreed between the parties. Neither party will unreasonably withhold agreement. Where agreement cannot be reached, the Employer may direct the Employee to take annual holidays on fourteen days' written notice.",
      "Annual holidays are paid at the greater of ordinary weekly pay and average weekly earnings. On termination, any untaken entitlement is paid out, together with eight percent of gross earnings for the period since the last entitlement date.",
      "The Employee may request to cash up up to one week of annual holidays each entitlement year. The Employer will consider any request within a reasonable time and will advise the outcome in writing.",
    ),
  },
  {
    id: cid(),
    heading: "13. Closedown Periods",
    html: p(
      "The Employer may have one customary closedown period each year. The Employee will be given at least fourteen days' notice of a closedown.",
      "During a closedown, the Employee will take any accrued annual holidays. Where the Employee has not yet become entitled to annual holidays, they will be paid eight percent of gross earnings since commencement, less any holiday pay already taken or paid out, and a new entitlement date may be set.",
    ),
  },
  {
    id: cid(),
    heading: "14. Sick Leave",
    html:
      p(
        "After six months of continuous employment, and after each subsequent twelve month period, the Employee is entitled to paid sick leave in accordance with the Holidays Act 2003, which may be used where the Employee, their spouse or partner, or a dependant is sick or injured.",
      ) +
      ul(
        "The Employee will notify their manager as early as possible, and no later than the start of the working day where practicable.",
        "The Employer may require proof of sickness or injury after three consecutive calendar days, or earlier where the Employer has reasonable grounds and agrees to meet the reasonable cost of obtaining that proof.",
        "Unused sick leave carries over up to the statutory maximum accumulation.",
      ),
  },
  {
    id: cid(),
    heading: "15. Bereavement and Family Violence Leave",
    html: p(
      "The Employee is entitled to paid bereavement leave under the Holidays Act 2003 on the death of a close family member, and to a further period on the death of another person where the Employer accepts the Employee has suffered a bereavement.",
      "The Employee is entitled to paid family violence leave under the Holidays Act 2003 where they are affected by family violence, regardless of when the violence occurred. Requests will be handled sensitively, promptly and confidentially, and the Employee may request a short-term flexible working arrangement.",
    ),
  },
  {
    id: cid(),
    heading: "16. Parental Leave and Flexible Working",
    html: p(
      "The Employee may be entitled to parental leave and payment under the Parental Leave and Employment Protection Act 1987. The Employer will process any application in accordance with that Act and will confirm entitlements in writing.",
      "The Employee may request a variation to their hours, days or place of work at any time under Part 6AA of the Employment Relations Act 2000. The Employer will deal with any request as soon as possible and within one month, and will only refuse a request on one or more of the statutory grounds, giving reasons in writing.",
    ),
  },
  {
    id: cid(),
    heading: "17. Health, Safety and Wellbeing",
    html:
      p(
        "The Employer is a person conducting a business or undertaking under the Health and Safety at Work Act 2015 and will, so far as is reasonably practicable, ensure the health and safety of the Employee and others affected by the work.",
        "The Employer will provide information, training, instruction, supervision and any personal protective equipment required for the work at no cost to the Employee, and will engage with workers on health and safety matters.",
      ) +
      ul(
        "The Employee will take reasonable care for their own health and safety and that of others.",
        "The Employee will comply with reasonable health and safety instructions and use equipment as trained.",
        "Hazards, incidents, near misses and injuries will be reported immediately.",
        "The Employee may cease or refuse work they reasonably believe would expose them to a serious risk, and will not be disadvantaged for doing so.",
      ),
  },
  {
    id: cid(),
    heading: "18. Drugs, Alcohol and Impairment",
    html: p(
      "The Employee must not attend work impaired by alcohol, drugs or any other substance in a way that affects their ability to work safely.",
      "Where the Employer has a drug and alcohol policy, testing will only be carried out in accordance with that policy, on reasonable grounds, using accredited procedures, and with the Employee given support and a fair process before any decision is made.",
      "The Employee will advise their manager where prescribed medication may affect their ability to perform safety-sensitive work.",
    ),
  },
  {
    id: cid(),
    heading: "19. Equal Opportunity, Harassment and Bullying",
    html: p(
      "The Employer is committed to a workplace free from discrimination, sexual harassment, racial harassment, bullying and victimisation, consistent with the Human Rights Act 1993 and the Employment Relations Act 2000.",
      "Any complaint will be taken seriously, dealt with promptly and fairly, and handled as confidentially as the circumstances allow. No person who raises a concern in good faith will be treated detrimentally for doing so.",
    ),
  },
  {
    id: cid(),
    heading: "20. Confidential Information",
    html:
      p(
        "The Employee will keep the Employer's confidential information secure and will not use or disclose it other than for the proper performance of their duties. This obligation continues after the employment ends.",
      ) +
      ul(
        "Confidential information includes client and supplier information, pricing, methods, financial data, personnel information and anything marked or reasonably understood to be confidential.",
        "Confidential information does not include information that is in the public domain other than through a breach of this Agreement.",
        "Nothing in this clause prevents a disclosure required by law, or a protected disclosure under the Protected Disclosures (Protection of Whistleblowers) Act 2022.",
      ),
  },
  {
    id: cid(),
    heading: "21. Intellectual Property",
    html: p(
      "All intellectual property created by the Employee in the course of employment, and relating to the Employer's business, is owned by the Employer from the moment of creation.",
      "The Employee will do all things reasonably required to give effect to that ownership, including signing documents and providing records, both during and after employment. The Employee waives any moral rights to the extent permitted by law.",
    ),
  },
  {
    id: cid(),
    heading: "22. Conflicts of Interest and Secondary Employment",
    html: p(
      "The Employee will disclose to the Employer any actual or potential conflict between their personal interests and the interests of the Employer as soon as they become aware of it.",
      "The Employee may undertake other work outside their hours of work provided it does not create a conflict of interest, breach confidentiality, or affect their ability to perform their duties safely and effectively. The Employer will not unreasonably object to secondary employment.",
    ),
  },
  {
    id: cid(),
    heading: "23. Privacy and Personal Information",
    html: p(
      "The Employer collects, holds and uses personal information about the Employee for employment purposes, in accordance with the Privacy Act 2020. Information is stored securely and only accessed by those who need it.",
      "The Employee may request access to, and correction of, personal information held about them. The Employer will respond within the statutory timeframe.",
      "The Employee will handle the personal information of colleagues, clients and customers in accordance with the Privacy Act 2020 and the Employer's privacy policy.",
    ),
  },
  {
    id: cid(),
    heading: "24. Company Property, Systems and Communications",
    html: p(
      "Property provided to the Employee remains the property of the Employer and must be returned in good condition on request, and in any event on the last day of employment.",
      "The Employer's systems, devices and accounts are provided for work purposes. Limited reasonable personal use is permitted where it does not interfere with work or breach any policy. The Employee should not expect privacy in work systems where monitoring is carried out in accordance with the Employer's policy and the Privacy Act 2020.",
    ),
  },
  {
    id: cid(),
    heading: "25. Performance Management",
    html:
      p(
        "The Employer will set clear expectations, provide regular feedback and support the Employee to succeed in their role.",
        "Where performance falls below the required standard, the Employer will follow a fair process before making any decision that could affect the Employee's employment.",
      ) +
      ol(
        "Raise the concern with the Employee, with specific examples.",
        "Explain the standard required and the support and training that will be provided.",
        "Give the Employee a reasonable opportunity to respond and to improve within a stated timeframe.",
        "Review progress and provide written confirmation of the outcome.",
      ),
  },
  {
    id: cid(),
    heading: "26. Discipline, Misconduct and Serious Misconduct",
    html:
      p(
        "Where a concern about conduct arises, the Employer will investigate fairly, put the concerns and relevant information to the Employee, allow the Employee to be represented and supported, give a genuine opportunity to respond, and consider that response with an open mind before deciding.",
        "Possible outcomes range from no action, to a verbal or written warning, to a final written warning, to termination in the case of serious misconduct.",
      ) +
      ul(
        "Serious misconduct may include theft, dishonesty, violence, serious breaches of health and safety, serious breaches of confidentiality, or conduct that destroys the trust and confidence necessary for the employment relationship.",
        "The Employee may be suspended on pay where suspension is necessary and after the Employee has had an opportunity to comment on the proposal.",
        "The lists in this clause are examples and are not exhaustive.",
      ),
  },
  {
    id: cid(),
    heading: "27. Abandonment of Employment",
    html: p(
      "Where the Employee is absent from work without explanation for three or more consecutive working days, the Employer will make reasonable attempts to contact the Employee and any nominated emergency contact.",
      "Where contact cannot be made and no reasonable explanation is provided, the Employer may treat the Employee as having abandoned their employment, after writing to the Employee at their last known address and allowing a reasonable time to respond.",
    ),
  },
  {
    id: cid(),
    heading: "28. Notice and Termination",
    html:
      p(
        "Either party may end this Agreement by giving the period of written notice recorded in this Agreement. Where no period is recorded, four weeks' notice applies.",
      ) +
      ul(
        "The Employer may, at its discretion, pay the Employee in lieu of all or part of the notice period.",
        "The Employer may direct the Employee not to attend work during the notice period, while continuing to pay them.",
        "The Employer may terminate without notice for serious misconduct, following a fair process.",
        "On termination the Employee will return all property and will be paid all outstanding wages and holiday entitlements in the final pay.",
      ),
  },
  {
    id: cid(),
    heading: "29. Redundancy and Business Restructuring",
    html: p(
      "Where the Employer is considering a change that may affect the Employee's continued employment, the Employer will provide the Employee with relevant information, consult in good faith, and genuinely consider the Employee's feedback and any alternatives before making a decision.",
      "Where a position is disestablished, the Employer will consider redeployment to any suitable vacancy. Notice will be given in accordance with this Agreement. No redundancy compensation is payable unless separately agreed in writing.",
    ),
  },
  {
    id: cid(),
    heading: "30. Employee Protection Provision",
    html: p(
      "This clause applies where the Employer's business, or part of it, is sold, transferred, or contracted out and the Employee's work is affected.",
      "The Employer will negotiate with the new employer about whether the affected employees will transfer on the same terms, and will inform the affected employees of the outcome and of the process for expressing interest in employment with the new employer.",
      "Where an employee does not transfer, their entitlements under this Agreement, including notice, are preserved.",
    ),
  },
  {
    id: cid(),
    heading: "31. Resolving Employment Relationship Problems",
    html:
      p(
        "If an employment relationship problem arises, the parties will first attempt to resolve it by discussing it directly and in good faith.",
        "If the problem is not resolved, either party may seek assistance from a representative, or apply to the Ministry of Business, Innovation and Employment for free mediation services. Where mediation does not resolve the matter, either party may apply to the Employment Relations Authority.",
      ) +
      ul(
        "A personal grievance must be raised with the Employer within ninety days of the action complained of, or of the date the Employee became aware of it, whichever is later.",
        "A grievance about sexual harassment may be raised within twelve months.",
        "The Employee may be represented and supported at any stage of the process.",
        "Time limits for recovery of wages and holiday pay are set by legislation and are not affected by this Agreement.",
      ),
  },
  {
    id: cid(),
    heading: "32. Variation, Severability and Entire Agreement",
    html: p(
      "This Agreement may only be varied by written agreement signed by both parties, except where a change is required by law, or where this Agreement expressly allows a change to be confirmed in writing.",
      "If any part of this Agreement is found to be unenforceable, that part will be modified to the minimum extent necessary or severed, and the remainder of the Agreement continues in force.",
      "This Agreement, together with its schedules, records the entire agreement between the parties in relation to the Employee's employment. Nothing in this Agreement reduces any minimum entitlement provided by law; where there is any inconsistency, the statutory entitlement applies.",
    ),
  },
  {
    id: cid(),
    heading: "33. Definitions and Interpretation",
    html:
      p(
        "In this Agreement, unless the context requires otherwise, the following meanings apply. These definitions are provided so that the parties share a common understanding of the words used throughout the document.",
      ) +
      ul(
        "<b>Act</b> means the Employment Relations Act 2000 and any Act that replaces it.",
        "<b>Employer</b> means the entity named in the party details, and includes any authorised representative of that entity.",
        "<b>Employee</b> means the individual named in the party details.",
        "<b>Ordinary hours</b> means the guaranteed hours and pattern of work recorded in Schedule 1.",
        "<b>Otherwise working day</b> has the meaning given in the Holidays Act 2003.",
        "<b>Policy</b> means any written workplace policy, procedure, standard or code of conduct notified to the Employee.",
        "<b>Working day</b> means a day other than a Saturday, Sunday or public holiday observed at the place of work.",
      ) +
      p(
        "Headings are for convenience only and do not affect interpretation. Words importing the singular include the plural and vice versa. A reference to legislation includes any amendment to, or replacement of, that legislation.",
        "Where a term of this Agreement is more favourable to the Employee than the statutory minimum, the term of this Agreement applies. Where a statutory minimum is more favourable, the statutory minimum applies and this Agreement is read accordingly.",
        "Any period of notice expressed in days means calendar days unless working days are specified. Notice given after 5.00pm on a working day is treated as given on the next working day.",
      ),
  },
  {
    id: cid(),
    heading: "34. Overtime, Allowances and Penal Rates",
    html:
      p(
        "Any overtime, penal rates, shift loadings or allowances that apply to the Employee's position are recorded in Schedule 1. Where no such rate is recorded, additional hours are paid at the Employee's ordinary rate for each hour worked.",
        "Overtime must be authorised in advance by the Employee's manager, except where it is necessary to respond to an emergency or to ensure the safety of any person. Time worked in those circumstances will be recorded and paid.",
      ) +
      ul(
        "All hours worked, including additional hours, must be recorded accurately in the Employer's timekeeping system on the day they are worked.",
        "The Employer will not require or permit the Employee to work unrecorded or unpaid hours.",
        "Allowances are paid in the pay period following the period in which they are incurred, where a claim is submitted with the required evidence.",
        "Where the Employee is required to attend training, a meeting or a health and safety briefing outside their ordinary hours, that time is treated as time worked.",
      ) +
      p(
        "The Employer will review allowance rates at least annually and will consult the Employee before reducing or removing any allowance that forms a regular part of their remuneration.",
      ),
  },
  {
    id: cid(),
    heading: "35. Expenses, Travel and Vehicles",
    html:
      p(
        "The Employer will reimburse the Employee for reasonable expenses necessarily incurred in performing their duties, where those expenses are approved in advance and supported by receipts or other reasonable evidence.",
        "Where the Employee is required to travel for work, the Employer will meet the reasonable cost of transport, accommodation and meals in accordance with its expenses policy. Travel time that is part of the Employee's duties is treated as time worked.",
      ) +
      ul(
        "Where the Employee uses their own vehicle for work with the Employer's agreement, a mileage allowance is payable at the rate recorded in Schedule 1 or, if none is recorded, at the published Inland Revenue kilometre rate.",
        "The Employee must hold a current and appropriate driver licence and must notify the Employer immediately if that licence is suspended, restricted or cancelled.",
        "Any vehicle provided by the Employer remains the Employer's property, must be kept clean and roadworthy, and must be used in accordance with the Employer's vehicle policy and all road user rules.",
        "Fines and infringement notices incurred by the Employee remain the Employee's responsibility and will not be deducted from wages without written consent.",
      ),
  },
  {
    id: cid(),
    heading: "36. Uniforms, Tools and Equipment",
    html: p(
      "Where a uniform, protective clothing, tools or equipment are required for the position, they will be provided by the Employer at no cost to the Employee, together with any training required to use them safely.",
      "The Employee will keep items provided in good condition, use them only for work purposes, and report any loss, damage or fault promptly. Fair wear and tear is expected and will not be charged to the Employee.",
      "All items provided remain the property of the Employer and must be returned on the last day of employment or earlier on request. No deduction will be made for unreturned items unless the Employee gives specific written consent at the time.",
    ),
  },
  {
    id: cid(),
    heading: "37. Training, Development and Qualifications",
    html:
      p(
        "The Employer will provide the induction, on-the-job training and supervision reasonably required for the Employee to perform their duties safely and competently.",
        "Where the position requires a licence, registration, certificate or practising qualification, the Employee will obtain and maintain it, and will notify the Employer immediately if it lapses, is suspended, or is subject to conditions.",
      ) +
      ul(
        "Training required by the Employer is paid time and any course fees are met by the Employer.",
        "Training the Employee chooses to undertake for their own development may be supported by agreement, on terms recorded in writing before the training begins.",
        "The Employer will not recover the cost of training that it required the Employee to undertake, and will not seek any premium in connection with the Employee's employment.",
      ),
  },
  {
    id: cid(),
    heading: "38. Information Technology, Email and Social Media",
    html:
      p(
        "The Employer's devices, networks, email accounts and software are provided for the performance of the Employee's duties. Limited personal use is permitted where it is reasonable, lawful, and does not interfere with work or breach any policy.",
        "The Employee will keep credentials secure, will not share passwords, and will not install unauthorised software or connect unauthorised devices to the Employer's systems.",
      ) +
      ul(
        "The Employee will not access, copy or transmit the Employer's data other than for work purposes and through approved systems.",
        "The Employee will not post content that identifies the Employer, its clients or its people in a way that is confidential, misleading, harassing or damaging to reputation.",
        "Any monitoring of systems will be carried out in accordance with the Employer's policy, the Privacy Act 2020, and only to the extent reasonably necessary.",
        "On termination, the Employee will return all data and will not retain copies of the Employer's information on personal devices or accounts.",
      ),
  },
  {
    id: cid(),
    heading: "39. Records, Timekeeping and Wage Records",
    html: p(
      "The Employer will keep accurate wage and time records, holiday and leave records, and a signed copy of this Agreement, as required by the Employment Relations Act 2000 and the Holidays Act 2003.",
      "The Employee will record their hours of work accurately and promptly, and will not record hours for another person or allow another person to record hours on their behalf.",
      "The Employee may request a copy of their records at any time, and the Employer will provide them within a reasonable period and at no cost. Where a record is found to be incorrect, it will be corrected and any resulting underpayment will be paid in the next pay period.",
    ),
  },
  {
    id: cid(),
    heading: "40. Restraint of Trade and Non-Solicitation",
    html:
      p(
        "Any restraint of trade applying to the Employee is recorded in Schedule 1 and is limited to what is reasonably necessary to protect the Employer's legitimate proprietary interests.",
        "Where no restraint is recorded in Schedule 1, no restraint of trade applies and the Employee is free to take up other employment after this Agreement ends, subject only to their continuing obligations of confidentiality and intellectual property.",
      ) +
      ul(
        "Any restraint will state the activities restricted, the geographic area, and the duration.",
        "The parties agree that a court or the Employment Relations Authority may modify an unreasonable restraint rather than strike it out entirely.",
        "Nothing in a restraint prevents the Employee from earning a living in a manner that does not use the Employer's confidential information or client connections.",
      ),
  },
  {
    id: cid(),
    heading: "41. Suspension, Stand-Down and Business Interruption",
    html: p(
      "Where the Employer proposes to suspend the Employee during an investigation, it will first put the proposal to the Employee, consider their response, and will only suspend where it is reasonably necessary. Suspension is on full pay and is not a disciplinary outcome.",
      "Where work is unavailable due to an event outside the Employer's control, such as a natural disaster, public health direction or emergency, the parties will discuss options in good faith, which may include alternative duties, remote work, or the use of paid leave by agreement.",
      "The Employer will not unilaterally reduce the Employee's guaranteed hours or pay. Any change to hours or pay requires the Employee's written agreement.",
    ),
  },
  {
    id: cid(),
    heading: "42. Union Membership, Representation and Bargaining",
    html:
      p(
        "The Employee is free to choose whether or not to join a union. That choice will not affect the Employee's employment, and the Employer will not exert undue influence on the Employee in relation to union membership.",
      ) +
      ul(
        "The Employee is entitled to be represented and supported at any meeting that may affect their employment, and will be given reasonable time to arrange representation.",
        "Union representatives may access the workplace in accordance with Part 3 of the Employment Relations Act 2000.",
        "Where a collective agreement covering the Employee's work exists, the Employee has been given information about it and may join the union and become covered by it.",
        "The Employee is entitled to paid time to attend union meetings to the extent provided by the Act.",
      ),
  },
  {
    id: cid(),
    heading: "43. Migrant and Visa-Holding Employees",
    html:
      p(
        "Where the Employee holds a work visa, the Employer will comply with all immigration and employment obligations, including providing the information and conditions required for the Employee's visa.",
      ) +
      ul(
        "The Employer will not charge the Employee any premium, fee or cost in connection with obtaining or keeping employment.",
        "The Employee will be paid at least the rate recorded in this Agreement and at least the applicable minimum wage for every hour worked.",
        "The Employer will provide employment information about rights and entitlements in New Zealand, including how to raise concerns and how to access free mediation.",
        "The Employee will not be disadvantaged for raising a concern about their employment or immigration conditions.",
        "Where employment ends, the Employer will provide any documentation the Employee reasonably requires for immigration purposes.",
      ),
  },
  {
    id: cid(),
    heading: "44. Notices and Communication Between the Parties",
    html: p(
      "A notice under this Agreement must be in writing and may be delivered by hand, sent by post to the last known address of the other party, or sent by email to the address recorded in the party details.",
      "A notice sent by email is treated as received on the next working day after sending, unless the sender receives a delivery failure. A notice sent by post is treated as received three working days after posting.",
      "Each party will keep the other informed of any change to their contact details. Formal notices, including notice of resignation or termination, must be given in writing and not by informal message.",
    ),
  },
  {
    id: cid(),
    heading: "45. Governing Law and Jurisdiction",
    html: p(
      "This Agreement is governed by the laws of New Zealand. The parties submit to the jurisdiction of the Employment Relations Authority, the Employment Court, and the courts of New Zealand in relation to any matter arising from the employment relationship.",
      "Nothing in this Agreement limits the jurisdiction of the Employment Relations Authority or the Employment Court, or the ability of a Labour Inspector to exercise their statutory powers.",
    ),
  },

  {
    id: cid(),
    heading: "Schedule 1 — Key Employment Terms",
    html: p(
      "Position title, reporting line, place of work, commencement date, guaranteed hours, days of work, start and finish times, rate of pay or salary, pay frequency, notice period, and any agreed allowances are recorded in this schedule and form part of this Agreement.",
      "Where any of these terms change, the parties will record the change in writing and attach it to this schedule. The most recent signed record prevails.",
    ),
  },
  {
    id: cid(),
    heading: "Schedule 2 — Policies Referenced",
    html:
      p(
        "The following policies apply to the Employee's employment. Policies are not part of this Agreement and may be updated from time to time after consultation, but the Employee is required to comply with them.",
      ) +
      ul(
        "Code of conduct and workplace behaviour policy.",
        "Health, safety and wellbeing policy, including incident reporting.",
        "Drug and alcohol policy.",
        "Privacy and information security policy.",
        "Leave, timekeeping and flexible working policy.",
        "Grievance and complaints policy.",
      ),
  },
  {
    id: cid(),
    heading: "Schedule 3 — Leave and Entitlement Summary",
    html:
      p(
        "This summary is provided for convenience only. The Employee's entitlements are governed by the Holidays Act 2003 and the other legislation referred to in this Agreement.",
      ) +
      ul(
        "Annual holidays: four weeks paid after each twelve months of continuous employment.",
        "Public holidays: eleven public holidays, paid where the day is an otherwise working day.",
        "Sick leave: statutory entitlement after six months, and after each twelve months thereafter, with carry-over up to the statutory maximum.",
        "Bereavement leave: statutory entitlement per qualifying bereavement.",
        "Family violence leave: statutory paid entitlement per twelve month period.",
        "Alternative holidays: one for each public holiday worked that is an otherwise working day.",
        "Parental leave: as provided by the Parental Leave and Employment Protection Act 1987.",
      ) +
      p(
        "Where the Employee's work pattern varies, entitlements are calculated using the methods set out in the Holidays Act 2003, including relevant daily pay, average daily pay, ordinary weekly pay and average weekly earnings.",
      ),
  },
  {
    id: cid(),
    heading: "Schedule 4 — Support and Information Services",
    html:
      p(
        "The following free services are available to both parties for information and assistance with employment matters in New Zealand.",
      ) +
      ul(
        "Employment New Zealand information services, for guidance on minimum rights and obligations.",
        "Free mediation services provided by the Ministry of Business, Innovation and Employment.",
        "The Employment Relations Authority, for determinations where mediation does not resolve a matter.",
        "Community law centres and Citizens Advice Bureau, for free general legal information.",
        "WorkSafe New Zealand, for health and safety guidance and notifiable event reporting.",
        "The Office of the Privacy Commissioner, for privacy complaints and guidance.",
      ) +
      p(
        "The Employer will not treat the Employee detrimentally for contacting any of these services, and will cooperate with any process that follows.",
      ),
  },
  {
    id: cid(),
    heading: "Schedule 5 — Acknowledgement Checklist",
    html:
      p(
        "The parties confirm the following steps were completed before this Agreement was signed. This checklist forms part of the record of the parties' good faith dealings.",
      ) +
      ol(
        "A copy of the proposed agreement was provided to the Employee to keep.",
        "The Employee was advised of their right to seek independent advice.",
        "The Employee was given a reasonable opportunity to seek that advice.",
        "The Employer considered and responded to any issues raised by the Employee.",
        "The key terms in Schedule 1 were explained and agreed.",
        "The Employee's right to work in New Zealand was verified.",
        "The relevant workplace policies were made available to the Employee.",
        "A signed copy of this Agreement will be retained by each party.",
      ),
  },
];

