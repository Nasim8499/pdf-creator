import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

const tools = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "underline", icon: Underline, label: "Underline" },
  { cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { cmd: "undo", icon: Undo2, label: "Undo" },
  { cmd: "redo", icon: Redo2, label: "Redo" },
] as const;

export function RichTextEditor({ value, onChange, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const run = (cmd: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/60 px-1.5 py-1">
        {tools.map(({ cmd, icon: Icon, label }) => (
          <button
            key={cmd}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(cmd)}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <Icon className="size-3.5" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="doc-prose min-h-24 px-3 py-2 text-sm leading-relaxed outline-none focus-visible:bg-accent/30"
      />
    </div>
  );
}
