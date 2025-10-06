"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  step?: number;
  start?: string;
  end?: string;
  allowClear?: boolean;
  id?: string;
  name?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Selecionar horário",
  disabled,
  className,
  step = 15,
  start = "00:00",
  end = "23:45",
  allowClear = true,
  id,
  name,
  ariaInvalid,
  ariaDescribedBy,
}: TimePickerProps) {
  const options = React.useMemo(() => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const minutesStep = Math.max(1, step);

    const items: string[] = [];
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += minutesStep) {
      items.push(minutesToTime(minutes));
    }

    return items;
  }, [start, end, step]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (allowClear && newValue === "__clear") {
        onChange("");
        return;
      }
      onChange(newValue);
    },
    [allowClear, onChange]
  );

  return (
    <div className="w-full">
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      <Select value={value || undefined} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            "h-11 w-full justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left font-medium text-foreground shadow-sm transition-colors hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-1 items-center gap-3 text-left">
            <Clock className="h-4 w-4 text-secondary" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="w-[var(--radix-select-trigger-width)] p-1">
        {allowClear && (
          <SelectItem value="__clear" className="text-muted-foreground">
            Limpar seleção
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
    </div>
  );
}
