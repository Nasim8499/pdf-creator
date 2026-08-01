import type { Agreement } from "./agreement";

const slug = (v: string) =>
  v
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

/**
 * Browsers name a "Save as PDF" file after document.title, so we set a clean
 * name for the duration of the print and restore it afterwards.
 */
export function pdfFileName(doc: Agreement, label?: string) {
  const who = doc.employee.name || doc.employer.name || "agreement";
  const date = (doc.agreementDate || new Date().toISOString().slice(0, 10)).slice(0, 10);
  return slug([label || doc.documentTitle, who, date].filter(Boolean).join(" - ")) || "agreement";
}

export function printAsPdf(fileName: string, onDone?: () => void) {
  if (typeof window === "undefined") return;
  const previous = document.title;
  document.title = fileName;
  const restore = () => {
    document.title = previous;
    onDone?.();
  };
  window.addEventListener("afterprint", restore, { once: true });
  window.print();
  // Safari does not always fire afterprint.
  window.setTimeout(restore, 1500);
}

/**
 * Generates a genuine PDF file (vector text, real pages) from the agreement
 * data and downloads it — no browser print dialog involved.
 */
export async function downloadAgreementPdf(doc: Agreement, label?: string) {
  if (typeof window === "undefined") return;
  const { buildAgreementPdf } = await import("./pdf-build");
  const bytes = await buildAgreementPdf(doc);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${pdfFileName(doc, label)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
