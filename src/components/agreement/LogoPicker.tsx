import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_EDGE = 480;

async function fileToScaledDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  if (file.type === "image/svg+xml") return raw;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = raw;
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  if (scale === 1 && raw.length < 200_000) return raw;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

type Props = {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
};

export function LogoPicker({ label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      onChange(await fileToScaledDataUrl(file));
    } catch {
      setError("That file could not be read as an image.");
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={`Upload ${label.toLowerCase()}`}
          className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/40 transition-colors hover:border-primary/60 hover:bg-accent"
        >
          {value ? (
            <img src={value} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" />
          )}
        </button>
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] leading-snug text-muted-foreground">
            Click to {value ? "replace" : "add"} a logo. PNG, JPG or SVG — it appears on the cover,
            every page header and the footer.
          </p>
          {value ? (
            <Button size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              <Trash2 className="size-3.5 text-destructive" /> Remove
            </Button>
          ) : null}
          {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
