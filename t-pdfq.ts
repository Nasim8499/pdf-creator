import { buildAgreementPdf } from "./src/lib/pdf-build";
import { defaultAgreement } from "./src/lib/agreement";
const r:any = {headings:[],toc:[],pageCount:0};
const b = await buildAgreementPdf(defaultAgreement, r);
console.log("default pages", r.pageCount, "toc", r.toc.length);
await Bun.write("/tmp/pdfq/default.pdf", b);
