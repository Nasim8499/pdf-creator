import { FileDown, FolderOpen, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Draft } from "@/lib/drafts";

type Props = {
  drafts: Draft[];
  savedAt: string | null;
  onOpen: (draft: Draft) => void;
  onExport: (draft: Draft) => void;
  onDelete: (id: string) => void;
  onSaveNow: () => void;
};

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-NZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DraftsPanel({ drafts, savedAt, onOpen, onExport, onDelete, onSaveNow }: Props) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Drafts — autosaved
          </h3>
          <p className="truncate text-[11px] text-muted-foreground">
            {savedAt ? `Last autosave ${when(savedAt)}` : "Autosaves as you type"}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-10 shrink-0 sm:h-8" onClick={onSaveNow}>
          <Save className="size-4" /> Save now
        </Button>
      </div>

      {drafts.length === 0 ? (
        <p className="text-xs text-muted-foreground">No drafts yet — start typing.</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => (
            <li
              key={d.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border p-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{when(d.savedAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Open draft ${d.label}`}
                  className="size-10 sm:size-9"
                  onClick={() => onOpen(d)}
                >
                  <FolderOpen className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Export draft ${d.label}`}
                  className="size-10 sm:size-9"
                  onClick={() => onExport(d)}
                >
                  <FileDown className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete draft ${d.label}`}
                  className="size-10 sm:size-9"
                  onClick={() => onDelete(d.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
