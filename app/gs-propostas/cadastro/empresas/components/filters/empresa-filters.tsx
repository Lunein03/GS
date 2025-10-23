'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Plus, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FilterState } from '../../types/empresa';

// Lista de estados brasileiros
const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

interface EmpresaFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export function EmpresaFilters({
  onFilterChange,
  initialFilters = {
    search: '',
    tipo: 'all',
    status: 'all',
    estado: undefined,
  },
}: EmpresaFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTipoChange = (value: string) => {
    const newFilters = {
      ...filters,
      tipo: value as 'fisica' | 'juridica' | 'all',
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value as 'ativo' | 'inativo' | 'all',
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleEstadoChange = (value: string) => {
    const newFilters = {
      ...filters,
      estado: value === 'all' ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      tipo: 'all',
      status: 'all',
      estado: undefined,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    (filters.tipo && filters.tipo !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    filters.estado !== undefined;

  const handleCadastrarClick = () => {
    router.push('/gs-propostas/cadastro/empresas/nova');
  };

  return (
    <div className="space-y-4">
      {/* Header com título e botão de cadastro */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Cadastro de Empresas
          </h1>
        </div>
        <Button
          onClick={handleCadastrarClick}
          className="gap-2"
          size="default"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Empresas
        </Button>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Campo de busca */}
          <div className="lg:col-span-2">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Nome ou documento..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label
              htmlFor="tipo"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Tipo
            </label>
            <Select
              value={filters.tipo || 'all'}
              onValueChange={handleTipoChange}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="fisica">Pessoa Física</SelectItem>
                <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Status
            </label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label
              htmlFor="estado"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Estado
            </label>
            <Select
              value={filters.estado || 'all'}
              onValueChange={handleEstadoChange}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão limpar filtros */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
