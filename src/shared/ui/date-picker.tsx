"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
  allowClear?: boolean;
  id?: string;
  name?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecionar data",
  disabled,
  className,
  fromYear = 2020,
  toYear = 2030,
  allowClear = true,
  id,
  name,
  ariaInvalid,
  ariaDescribedBy,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsedValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return parseISO(value);
    } catch (error) {
      return undefined;
    }
  }, [value]);

  return (
    <div className="w-full">
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
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
              !parsedValue && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="h-4 w-4 text-secondary" />
            {parsedValue ? format(parsedValue, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parsedValue}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            initialFocus
            locale={ptBR}
            fromYear={fromYear}
            toYear={toYear}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
          />
          {allowClear && (
            <div className="border-t border-border p-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  onChange("");
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
