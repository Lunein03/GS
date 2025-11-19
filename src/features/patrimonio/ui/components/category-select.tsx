import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

export interface CategoryOption {
  label: string;
  value: string;
}

interface CategorySelectProps {
  options: CategoryOption[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function CategorySelect({ options, value, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedMap = useMemo(() => new Set(value), [value]);

  const handleToggle = (category: string) => {
    const next = new Set(selectedMap);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    onChange(Array.from(next));
  };

  const handleRemove = (category: string) => {
    if (!selectedMap.has(category)) {
      return;
    }
    onChange(value.filter((item) => item !== category));
  };

  const triggerLabel = value.length === 0 ? 'Todas as categorias' : `${value.length} selecionada${value.length > 1 ? 's' : ''}`;

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 min-w-[12rem] justify-between rounded-lg border-border bg-background/60 text-sm"
          >
            <span className="truncate text-left">{triggerLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-0">
          <ScrollArea className="max-h-64 p-2">
            <div className="flex flex-col gap-1">
              {options.map((option) => {
                const checked = selectedMap.has(option.value);
                return (
                  <button
                    key={option.value || 'sem-categoria'}
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted/60',
                      checked ? 'bg-muted/60 text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Checkbox checked={checked} className="h-4 w-4" aria-hidden="true" />
                    <span className="flex-1 truncate">{option.label}</span>
                    {checked ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((selected) => {
            const label = options.find((option) => option.value === selected)?.label ?? selected;
            return (
              <Badge
                key={selected || 'sem-categoria'}
                variant="secondary"
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-foreground"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(selected)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-primary/20"
                  aria-label={`Remover categoria ${label}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
