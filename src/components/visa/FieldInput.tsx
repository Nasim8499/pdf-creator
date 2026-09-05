import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Field } from "@/lib/visa/countries";

type Props = {
  field: Field;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
  invalid?: boolean;
};

export function FieldInput({ field, value, onChange, invalid }: Props) {
  const id = `f-${field.id}`;
  const describedBy = field.help ? `${id}-help` : undefined;

  if (field.type === "checkbox") {
    return (
      <div className="col-span-full flex items-start gap-3 rounded-xl border border-border bg-card p-3">
        <Checkbox
          id={id}
          checked={value === true}
          onCheckedChange={(c) => onChange(c === true)}
          className="mt-0.5 size-5"
          aria-invalid={invalid || undefined}
        />
        <Label htmlFor={id} className="text-sm font-normal leading-snug">
          {field.label}
          {field.required ? <span className="text-destructive"> *</span> : null}
        </Label>
      </div>
    );
  }

  return (
    <div className={field.half ? "sm:col-span-1 col-span-full" : "col-span-full"}>
      <Label htmlFor={id} className="mb-1.5 block text-sm">
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>

      {field.type === "textarea" ? (
        <Textarea
          id={id}
          value={String(value ?? "")}
          placeholder={field.placeholder ?? ""}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-24 text-base"
        />
      ) : field.type === "select" ? (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger id={id} aria-invalid={invalid || undefined} className="h-12 text-base">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o} value={o} className="py-2.5 text-base">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={field.type}
          inputMode={
            field.type === "number" ? "numeric" : field.type === "tel" ? "tel" : undefined
          }
          value={String(value ?? "")}
          placeholder={field.placeholder ?? ""}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 text-base"
        />
      )}

      {field.help ? (
        <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
          {field.help}
        </p>
      ) : null}
    </div>
  );
}
