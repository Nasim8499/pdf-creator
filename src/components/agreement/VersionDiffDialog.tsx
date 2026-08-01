import { useMemo, useState } from "react";
import { ArrowRight, FileDown, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { diffAgreements, type FieldChange, type ItemChange } from "@/lib/agreement-diff";
import type { Agreement, Version } from "@/lib/agreement";

const CURRENT = "__current__";

type Props = {
  current: Agreement;
  versions: Version[];
  onExport: (doc: Agreement) => void;
};

function WordDiff({ change }: { change: FieldChange }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {change.label}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {change.parts.map((part, i) =>
          part.type === "same" ? (
            <span key={i} className="text-muted-foreground">
              {part.text}
            </span>
          ) : part.type === "add" ? (
            <span key={i} className="rounded-sm bg-primary/12 px-0.5 text-foreground underline decoration-primary/50">
              {part.text}
            </span>
          ) : (
            <span key={i} className="rounded-sm bg-destructive/12 px-0.5 text-destructive line-through">
              {part.text}
            </span>
          ),
        )}
      </p>
    </div>
  );
}

function ItemBlock({ item }: { item: ItemChange }) {
  const tone =
    item.status === "added"
      ? "border-primary/40 text-primary"
      : item.status === "removed"
        ? "border-destructive/40 text-destructive"
        : "border-border text-muted-foreground";
  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium">{item.title}</span>
        <Badge variant="outline" className={`ml-auto shrink-0 capitalize ${tone}`}>
          {item.status}
        </Badge>
      </div>
      {item.fields.map((f) => (
        <WordDiff key={f.key} change={f} />
      ))}
    </div>
  );
}

export function VersionDiffDialog({ current, versions, onExport }: Props) {
  const [open, setOpen] = useState(false);
  const [leftId, setLeftId] = useState<string>(versions[0]?.id ?? CURRENT);
  const [rightId, setRightId] = useState<string>(CURRENT);

  const options = useMemo(
    () => [{ id: CURRENT, label: "Current draft (unsaved)" }, ...versions.map((v) => ({ id: v.id, label: v.label }))],
    [versions],
  );

  const resolve = (id: string): Agreement =>
    id === CURRENT ? current : (versions.find((v) => v.id === id)?.data ?? current);

  const left = resolve(leftId);
  const right = resolve(rightId);
  const diff = useMemo(() => diffAgreements(left, right), [left, right]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <GitCompare className="size-4" /> Compare versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compare versions</DialogTitle>
          <DialogDescription>
            Review every change between two saved versions before you re-export to PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={leftId} onValueChange={setLeftId}>
            <SelectTrigger className="min-w-0 flex-1">
              <SelectValue placeholder="Base version" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          <Select value={rightId} onValueChange={setRightId}>
            <SelectTrigger className="min-w-0 flex-1">
              <SelectValue placeholder="Compared version" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary/30" /> added
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-destructive/30" /> removed
          </span>
          <span className="ml-auto tabular-nums">
            {diff.totalChanges} change{diff.totalChanges === 1 ? "" : "s"}
          </span>
        </div>

        <ScrollArea className="h-[52vh] rounded-lg border border-border bg-muted/30">
          <div className="space-y-5 p-3">
            {diff.sections.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                These two versions are identical.
              </p>
            ) : (
              diff.sections.map((section) => (
                <div key={section.section} className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {section.section}
                  </div>
                  {section.fields.length > 0 && (
                    <div className="space-y-2.5 rounded-lg border border-border bg-card p-3">
                      {section.fields.map((f) => (
                        <WordDiff key={f.key} change={f} />
                      ))}
                    </div>
                  )}
                  {section.items.map((item) => (
                    <ItemBlock key={`${section.section}-${item.id}`} item={item} />
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => onExport(left)}>
            <FileDown className="size-4" /> Export base
          </Button>
          <Button onClick={() => onExport(right)}>
            <FileDown className="size-4" /> Export compared
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
