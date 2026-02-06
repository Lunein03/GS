"use client";

import * as React from "react";
import { format, parseISO, isSameDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/shared/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DateRangeValue {
  from?: string;
  to?: string;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
  allowClear?: boolean;
  id?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  numberOfMonths?: number;
}

function parseIsoDate(value?: string) {
  if (!value) return undefined;
  try {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  } catch (error) {
    return undefined;
  }
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Selecionar período",
  disabled,
  className,
  fromYear = 2020,
  toYear = 2035,
  allowClear = true,
  id,
  ariaInvalid,
  ariaDescribedBy,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const today = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const parsedRange = React.useMemo<DateRange | undefined>(() => {
    const from = parseIsoDate(value?.from);
    const to = parseIsoDate(value?.to);
    if (!from && !to) return undefined;
    return { from, to };
  }, [value?.from, value?.to]);

  const displayValue = React.useMemo(() => {
    if (parsedRange?.from && parsedRange?.to) {
      if (isSameDay(parsedRange.from, parsedRange.to)) {
        return format(parsedRange.from, "dd/MM/yyyy", { locale: ptBR });
      }
      return `${format(parsedRange.from, "dd/MM/yyyy", { locale: ptBR })} até ${format(parsedRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    if (parsedRange?.from) {
      return format(parsedRange.from, "dd/MM/yyyy", { locale: ptBR });
    }
    if (parsedRange?.to) {
      return format(parsedRange.to, "dd/MM/yyyy", { locale: ptBR });
    }
    return placeholder;
  }, [parsedRange, placeholder]);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            id={id}
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "h-11 w-full justify-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left font-medium text-foreground shadow-sm transition-colors hover:border-secondary focus-visible:ring-2 focus-visible:ring-secondary",
              (!parsedRange?.from && !parsedRange?.to) && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="h-4 w-4 text-secondary" />
            <span className="truncate">{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={parsedRange}
            onSelect={(range) => {
              if (!range) {
                onChange({ from: "", to: "" });
                return;
              }
              const nextValue = {
                from: range.from ? format(range.from, "yyyy-MM-dd") : "",
                to: range.to ? format(range.to, "yyyy-MM-dd") : "",
              };
              onChange(nextValue);
              if (range.from && range.to) {
                setOpen(false);
              }
            }}
            initialFocus
            locale={ptBR}
            fromYear={fromYear}
            toYear={toYear}
            numberOfMonths={numberOfMonths}
            disabled={(date) => {
              if (disabled) return true;
              return date < today;
            }}
          />
          {allowClear && (
            <div className="border-t border-border p-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  onChange({ from: "", to: "" });
                  setOpen(false);
                }}
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

