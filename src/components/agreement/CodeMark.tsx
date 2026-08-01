import { useEffect, useState } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

/** Renders a QR code or Code-128 barcode as an <img> so it survives printing. */
export function CodeMark({
  type,
  value,
  size,
  dark = "#111111",
  className,
}: {
  type: "qr" | "barcode";
  value: string;
  size: number;
  dark?: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let alive = true;
    const text = value.trim();
    if (!text) {
      setSrc("");
      return;
    }
    if (type === "qr") {
      QRCode.toDataURL(text, {
        margin: 0,
        width: Math.max(120, size * 3),
        color: { dark, light: "#ffffff" },
        errorCorrectionLevel: "M",
      })
        .then((url) => {
          if (alive) setSrc(url);
        })
        .catch(() => alive && setSrc(""));
    } else {
      try {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, text, {
          format: "CODE128",
          displayValue: false,
          margin: 0,
          height: 60,
          width: 2,
          lineColor: dark,
        });
        setSrc(canvas.toDataURL("image/png"));
      } catch {
        setSrc("");
      }
    }
    return () => {
      alive = false;
    };
  }, [type, value, size, dark]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={type === "qr" ? "Verification QR code" : "Verification barcode"}
      className={className}
      style={
        type === "qr"
          ? { width: size, height: size }
          : { height: Math.round(size * 0.5), width: size * 2.2, objectFit: "fill" }
      }
    />
  );
}
