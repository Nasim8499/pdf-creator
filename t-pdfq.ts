import { buildAgreementPdf } from "./src/lib/pdf-build";
import { defaultAgreement } from "./src/lib/agreement";
import { agreementTemplates, applyTemplate } from "./src/lib/templates";
for (const t of agreementTemplates) {
  const a = applyTemplate(defaultAgreement, t);
  const r:any = {headings:[],toc:[],pageCount:0};
  const b = await buildAgreementPdf(a, r);
  console.log(t.label ?? t.id, "->", r.pageCount, "pages, toc", r.toc.length);
  await Bun.write(`/tmp/pdfq/${t.id}.pdf`, b);
}
