"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * A Select that always shows the label (not the value/ID) when an item is selected.
 * Pass items as { value, label } pairs.
 */
export function LabeledSelect({
  value,
  onValueChange,
  placeholder,
  items,
  disabled,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  items: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}) {
  const selectedLabel = items.find((i) => i.value === value)?.label;

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v ?? "")} disabled={disabled}>
      <SelectTrigger className={className}>
        {selectedLabel ? (
          <span className="truncate">{selectedLabel}</span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
