'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { FilterState } from '../../types/cliente-schemas';

// ============================================
// TYPES
// ============================================

interface ClienteFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

// ============================================
// COMPONENT
// ============================================

// TODO (LOW): [UI] Instalar componente Sheet do shadcn/ui para melhor UX mobile
// Comando: npx shadcn@latest add sheet
// Atualmente usando Dialog como alternativa

export function ClienteFilters({
  onFilterChange,
  initialFilters = {
    search: '',
    tipo: 'all',
    status: 'all',
    estado: undefined,
  },
}: ClienteFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  // Handler para busca com debounce
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  // Handler para tipo
  const handleTipoChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      tipo: value as 'fisica' | 'juridica' | 'all',
    }));
  }, []);

  // Handler para status
  const handleStatusChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value as 'ativo' | 'inativo' | 'all',
    }));
  }, []);

  // Handler para estado
  const handleEstadoChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      estado: value || undefined,
    }));
  }, []);

  // Limpar filtros
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      tipo: 'all',
      status: 'all',
      estado: undefined,
    });
  }, []);

  // Verificar se há filtros ativos
  const hasActiveFilters =
    filters.search ||
    filters.tipo !== 'all' ||
    filters.status !== 'all' ||
    filters.estado;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Busca */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ, email..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Buscar clientes"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleSearchChange('')}
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Avançados (Mobile) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="sm:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Refine sua busca de clientes
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="mobile-tipo">Tipo de Pessoa</Label>
              <Select value={filters.tipo} onValueChange={handleTipoChange}>
                <SelectTrigger id="mobile-tipo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="mobile-status">Status</Label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="mobile-status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="mobile-estado">Estado</Label>
              <Input
                id="mobile-estado"
                placeholder="Ex: SP"
                value={filters.estado || ''}
                onChange={(e) => handleEstadoChange(e.target.value.toUpperCase())}
                maxLength={2}
                className="uppercase"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Limpar
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filtros Avançados (Desktop) */}
      <div className="hidden sm:flex gap-2">
        {/* Tipo */}
        <Select value={filters.tipo} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-[180px]" aria-label="Filtrar por tipo de pessoa">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="fisica">Pessoa Física</SelectItem>
            <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]" aria-label="Filtrar por status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>

        {/* Limpar Filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            aria-label="Limpar todos os filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
