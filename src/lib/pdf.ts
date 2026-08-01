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
