'use client';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Category } from '../types/item.types';

interface ItemsFiltersProps {
  categories: Category[];
  selectedCategories: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onRefresh: () => void;
  onCreateItem: () => void;
  onManageCategories: () => void;
}

export function ItemsFilters({
  categories,
  selectedCategories,
  searchQuery,
  onSearchChange,
  onCategoryToggle,
  onRefresh,
  onCreateItem,
  onManageCategories,
}: ItemsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Procurar por nome ou descrição..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="max-w-md"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            aria-label="Atualizar lista"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onManageCategories}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Gerenciar Categorias
          </Button>
          <Button onClick={onCreateItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Cadastrar Item
          </Button>
        </div>
      </div>

      {/* Filtros de categoria */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Categorias:
          </span>
          {categories.map((category) => {
            const isSelected = isCategorySelected(category.id);
            return (
              <Badge
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                style={
                  isSelected
                    ? {
                        backgroundColor: category.color,
                        borderColor: category.color,
                        color: '#ffffff',
                      }
                    : {
                        borderColor: category.color,
                        color: category.color,
                      }
                }
                onClick={() => onCategoryToggle(category.id)}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Indicador de filtros ativos */}
      {(selectedCategories.length > 0 || searchQuery) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Filtros ativos:</span>
          {searchQuery && (
            <Badge variant="secondary">Busca: "{searchQuery}"</Badge>
          )}
          {selectedCategories.length > 0 && (
            <Badge variant="secondary">
              {selectedCategories.length} categoria(s)
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
              selectedCategories.forEach((id) => onCategoryToggle(id));
            }}
            className="h-auto p-1 text-xs"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}

