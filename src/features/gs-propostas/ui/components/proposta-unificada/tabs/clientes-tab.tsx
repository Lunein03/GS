"use client";

/**
 * ClientesTab - Cadastro inline de clientes
 * 
 * Versão inline do cadastro de clientes integrada à tela de proposta.
 * Permite buscar, selecionar e cadastrar clientes sem sair do contexto.
 * 
 * @see docs/specs/SPEC-004-tab-clientes.md
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  Eye, 
  Edit2, 
  CheckCircle2,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Power,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/lib/utils";

// API
import {
  getClientes,
  createCliente,
  updateCliente,
  getContatosSecundarios,
  createContatoSecundario,
} from "@/features/gs-propostas/api/clients";

// Components & Types
import { ClienteForm } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/components/forms/cliente-form";
import type { 
  Cliente, 
  FilterState, 
  ClienteFormData,
  UpdateClienteInput
} from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente";

// ============================================
// TYPES
// ============================================

interface ClientesTabProps {
  /** Cliente atualmente selecionado na proposta */
  selectedClientId?: string;
  
  /** Callback quando um cliente é selecionado */
  onClientSelect: (client: Cliente | null) => void;
  
  /** Se está em modo somente visualização */
  readOnly?: boolean;
}

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// ============================================
// CLIENT PREVIEW COMPONENT
// ============================================

interface ClientPreviewProps {
  client: Cliente;
  onUse: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

function ClientPreview({ client, onUse, onEdit, readOnly }: ClientPreviewProps) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {client.tipo === 'juridica' ? (
              <Building2 className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{client.nome}</h4>
            <p className="text-xs text-muted-foreground">
              {client.tipo === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'} • {client.cpfCnpj}
            </p>
          </div>
        </div>
        <Badge variant={client.ativo === 1 ? 'default' : 'secondary'}>
          {client.ativo === 1 ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          <span>{client.contatoTelefone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate">{client.contatoEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {client.endereco}, {client.numero} - {client.bairro}, {client.cidade}/{client.estado}
          </span>
        </div>
      </div>
      
      {!readOnly && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1">
            <Edit2 className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button size="sm" onClick={onUse} className="gap-1 ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Usar este cliente
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ClientesTab({
  selectedClientId,
  onClientSelect,
  readOnly = false,
}: ClientesTabProps) {
  // ============================================
  // STATE
  // ============================================
  
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tipo: 'all',
    status: 'all',
    estado: undefined,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  
  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | undefined>();
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(selectedClientId);
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // ============================================
  // COMPUTED
  // ============================================
  
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === localSelectedId);
  }, [clients, localSelectedId]);
  
  // ============================================
  // DATA FETCHING
  // ============================================
  
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const params = {
        search: filters.search || undefined,
        tipo: filters.tipo === 'all' ? undefined : filters.tipo,
        status: filters.status === 'all' ? undefined : filters.status,
        estado: filters.estado,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      const result = await getClientes(params);
      
      if (!result.success) {
        toast.error(result.error.message ?? 'Erro ao carregar clientes');
        setClients([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        return;
      }
      
      const clientesFormatted = result.data.clientes.map(cliente => ({
        ...cliente,
        ativo: cliente.ativo as number,
      }));
      
      setClients(clientesFormatted);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes. Tente novamente.');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);
  
  useEffect(() => {
    loadClients();
  }, [loadClients]);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchDebounce]);
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleClientClick = (clientId: string) => {
    setLocalSelectedId(clientId);
  };
  
  const handleUseClient = () => {
    if (selectedClient) {
      onClientSelect(selectedClient);
      toast.success(`Cliente "${selectedClient.nome}" selecionado!`);
    }
  };
  
  const handleNew = () => {
    setEditingClient(undefined);
    setIsFormOpen(true);
  };
  
  const handleEdit = async (client: Cliente) => {
    try {
      const contatosResult = await getContatosSecundarios(client.id);
      const clienteComContatos: Cliente = {
        ...client,
        contatosSecundarios: contatosResult.success && contatosResult.data
          ? contatosResult.data
          : [],
      };
      setEditingClient(clienteComContatos);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setEditingClient(client);
      setIsFormOpen(true);
    }
  };
  
  const handleFormSubmit = async (data: ClienteFormData & { contatosSecundarios?: Array<{ id?: string; nome: string; email?: string; telefone?: string; cargo?: string }> }) => {
    try {
      const { contatosSecundarios, ...clienteData } = data;
      
      const result = editingClient
        ? await updateCliente({ id: editingClient.id, ...clienteData })
        : await createCliente(clienteData);
      
      if (!result.success) {
        toast.error(result.error.message ?? 'Erro ao salvar cliente');
        return;
      }
      
      const clienteId = editingClient?.id || result.data.id;
      
      // Save secondary contacts
      if (clienteId && contatosSecundarios && contatosSecundarios.length > 0) {
        for (const contato of contatosSecundarios) {
          if (!contato.id) {
            await createContatoSecundario(clienteId, {
              nome: contato.nome,
              email: contato.email,
              telefone: contato.telefone,
              cargo: contato.cargo,
            });
          }
        }
      }
      
      toast.success(editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado!');
      setIsFormOpen(false);
      setEditingClient(undefined);
      
      // Reload and auto-select new client
      await loadClients();
      if (!editingClient && result.data?.id) {
        setLocalSelectedId(result.data.id);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente. Tente novamente.');
    }
  };
  
  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingClient(undefined);
  };

  const handleToggleStatus = async (client: Cliente, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const newStatus = client.ativo === 1 ? 0 : 1;
      const actionLabel = newStatus === 1 ? 'ativado' : 'desativado';

      // Construct payload compatible with UpdateClienteInput
      // effectively excluding created/updated/deletedAt and mapping fields
      const payload: UpdateClienteInput = {
        id: client.id,
        tipo: client.tipo,
        cpfCnpj: client.cpfCnpj,
        nome: client.nome,
        cargo: client.cargo || undefined,
        cep: client.cep,
        endereco: client.endereco,
        numero: client.numero,
        complemento: client.complemento || undefined,
        bairro: client.bairro,
        cidade: client.cidade,
        estado: client.estado,
        contatoNome: client.contatoNome,
        contatoEmail: client.contatoEmail,
        contatoTelefone: client.contatoTelefone,
        ativo: newStatus,
        // We preserve existing secondary contacts logic if necessary, 
        // but updateClienteSchema handles optional contatosSecundarios
      };
      
      const result = await updateCliente(payload as any);
      
      if (result.success) {
        toast.success(`Cliente ${actionLabel} com sucesso!`);
        // Refresh list keeping current page/filters
        loadClients();
      } else {
        toast.error(result.error?.message || `Erro ao alterar status do cliente`);
      }
    } catch (error) {
      console.error('Erro ao alternar status:', error);
      toast.error('Erro inesperado ao atualizar status');
    }
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Clientes</h3>
            <p className="text-xs text-muted-foreground">
              Selecione um cliente ou cadastre um novo
            </p>
          </div>
        </div>
        
        {!readOnly && (
          <Button onClick={handleNew} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ, email..."
            value={searchDebounce}
            onChange={(e) => setSearchDebounce(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select 
          value={filters.tipo} 
          onValueChange={(v) => setFilters(prev => ({ ...prev, tipo: v as FilterState['tipo'] }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="fisica">Pessoa Física</SelectItem>
            <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.status} 
          onValueChange={(v) => setFilters(prev => ({ ...prev, status: v as FilterState['status'] }))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando clientes...</span>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && clients.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">
            {filters.search || filters.tipo !== 'all' || filters.status !== 'all'
              ? 'Nenhum cliente encontrado com os filtros aplicados'
              : 'Nenhum cliente cadastrado'}
          </p>
          {!readOnly && !filters.search && filters.tipo === 'all' && filters.status === 'all' && (
            <Button onClick={handleNew} size="sm" variant="outline" className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Cadastrar primeiro cliente
            </Button>
          )}
        </div>
      )}
      
      {/* Clients Table */}
      {!isLoading && clients.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">CPF/CNPJ</TableHead>
                <TableHead className="hidden lg:table-cell">Contato</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow 
                  key={client.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    localSelectedId === client.id && "bg-primary/5"
                  )}
                  onClick={() => handleClientClick(client.id)}
                >
                  <TableCell>
                    <RadioGroup value={localSelectedId} onValueChange={handleClientClick}>
                      <RadioGroupItem value={client.id} />
                    </RadioGroup>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {client.tipo === 'juridica' ? (
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium truncate">{client.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {client.tipo === 'juridica' ? 'PJ' : 'PF'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {client.cpfCnpj}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {client.contatoTelefone}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={client.ativo === 1 ? 'default' : 'secondary'}
                      className={cn(
                        "text-[10px] h-5 px-1.5",
                        client.ativo === 0 && "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {client.ativo === 1 ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client.id);
                        }}
                        title="Visualizar"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!readOnly && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!readOnly && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-7 w-7 transition-colors",
                            client.ativo === 1 
                              ? "text-emerald-500 hover:text-red-500 hover:bg-red-500/10" 
                              : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                          )}
                          onClick={(e) => handleToggleStatus(client, e)}
                          title={client.ativo === 1 ? "Desativar" : "Ativar"}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination Info */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            Mostrando {clients.length} de {pagination.total} clientes
            {pagination.totalPages > 1 && (
              <span> • Página {pagination.page} de {pagination.totalPages}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Selected Client Preview */}
      {selectedClient && (
        <ClientPreview
          client={selectedClient}
          onUse={handleUseClient}
          onEdit={() => handleEdit(selectedClient)}
          readOnly={readOnly}
        />
      )}
      
      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Cadastrar Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? 'Edite os dados do cliente selecionado.'
                : 'Preencha os dados para cadastrar um novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          
          <ClienteForm
            initialData={editingClient}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
