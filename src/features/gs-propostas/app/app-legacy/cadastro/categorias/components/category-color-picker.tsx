'use client';

import { memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

const CATEGORY_COLORS = [
  '#FA3B38',
  '#FF5A5F',
  '#FF8A65',
  '#FFB74D',
  '#FFD54F',
  '#FFF176',
  '#AED581',
  '#81C784',
  '#4DB6AC',
  '#26A69A',
  '#4FC3F7',
  '#29B6F6',
  '#42A5F5',
  '#5C6BC0',
  '#7E57C2',
  '#AB47BC',
  '#EC407A',
  '#BDBDBD',
  '#9E9E9E',
  '#757575',
  '#616161',
  '#424242',
  '#212121',
] as const;

type CategoryColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function CategoryColorPickerComponent({ value, onChange }: CategoryColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Selecione uma cor">
      {CATEGORY_COLORS.map((color) => {
        const isActive = value.toUpperCase() === color;

        return (
          <Button
            key={color}
            type="button"
            variant="ghost"
            onClick={() => onChange(color)}
            className={cn(
              'h-9 w-9 rounded-full p-0 border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
              isActive && 'ring-2 ring-offset-2 ring-primary border-primary',
            )}
            style={{ backgroundColor: color }}
            aria-label={`Cor ${color}`}
            data-selected={isActive}
          />
        );
      })}
    </div>
  );
}

export const CategoryColorPicker = memo(CategoryColorPickerComponent);
export const categoryColorOptions = CATEGORY_COLORS;


