'use client';

import { useState, useMemo } from 'react';
import { Grid3x3 } from 'lucide-react';

// Componentes
import { ItemsFilters } from './components/items-filters';
import { ItemsTable } from './components/items-table';
import { ItemFormDialog } from './components/item-form-dialog';
import { ItemDeleteDialog } from './components/item-delete-dialog';
import { CategoriesDialog } from './components/categories-dialog';

// Tipos e constantes
import type { Item, Category } from './types/item.types';
import { DEFAULT_CATEGORIES } from './types/item.types';

// ============================================
// CONSTANTES
// ============================================

const ITEMS_PER_PAGE = 20;

// ============================================
// CATEGORIAS INICIAIS
// ============================================

// Categorias padrão baseadas em DEFAULT_CATEGORIES
const INITIAL_CATEGORIES: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
  ...cat,
  id: `cat-${index + 1}`,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ItensPage() {
  // ============================================
  // ESTADO
  // ============================================
  
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Controle de modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  
  // Itens sendo editados/deletados
  const [itemToEdit, setItemToEdit] = useState<Item | undefined>();
  const [itemToDelete, setItemToDelete] = useState<Item | undefined>();

  // ============================================
  // LÓGICA DE FILTROS E PAGINAÇÃO
  // ============================================

  // Adicionar categoria aos itens
  const itemsWithCategory = useMemo(() => {
    return items.map((item) => ({
      ...item,
      category: categories.find((cat) => cat.id === item.categoryId),
    }));
  }, [items, categories]);

  // Filtrar itens por busca e categorias
  const filteredItems = useMemo(() => {
    let result = itemsWithCategory;

    // Filtro de busca (nome ou descrição)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Filtro de categorias
    if (selectedCategories.length > 0) {
      result = result.filter((item) =>
        selectedCategories.includes(item.categoryId)
      );
    }

    return result;
  }, [itemsWithCategory, searchQuery, selectedCategories]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Paginar itens
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage]);

  // ============================================
  // HANDLERS
  // ============================================

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1); // Reset para primeira página ao buscar
  }

  function handleCategoryToggle(categoryId: string) {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }

  function handleRefresh() {
    // TODO (HIGH): [Data] Implementar busca real do banco de dados
    // Por enquanto, apenas reseta os filtros
    setSearchQuery('');
    setSelectedCategories([]);
    setCurrentPage(1);
  }

  function handleCreateItem() {
    setItemToEdit(undefined);
    setIsFormOpen(true);
  }

  function handleEditItem(item: Item) {
    setItemToEdit(item);
    setIsFormOpen(true);
  }

  function handleDeleteItem(item: Item) {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  }

  function handleManageCategories() {
    setIsCategoriesDialogOpen(true);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function handleFormSuccess(newItem?: Item) {
    // TODO (HIGH): [Data] Atualizar lista de itens do banco de dados
    // Por enquanto, atualiza o estado local
    if (newItem) {
      if (itemToEdit) {
        // Atualizar item existente
        setItems((prev) => prev.map((item) => (item.id === newItem.id ? newItem : item)));
      } else {
        // Adicionar novo item
        setItems((prev) => [...prev, newItem]);
      }
    }
    setIsFormOpen(false);
    setItemToEdit(undefined);
  }

  function handleDeleteSuccess() {
    // TODO (HIGH): [Data] Atualizar lista de itens do banco de dados
    // Por enquanto, remove o item do estado local
    if (itemToDelete) {
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(undefined);
  }

  function handleCategoriesChange(updatedCategories?: Category[]) {
    // TODO (HIGH): [Data] Atualizar lista de categorias do banco de dados
    // Por enquanto, atualiza o estado local
    if (updatedCategories) {
      setCategories(updatedCategories);
    }
    setIsCategoriesDialogOpen(false);
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Grid3x3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens</h1>
          <p className="text-muted-foreground">
            Cadastre produtos e serviços oferecidos
          </p>
        </div>
      </header>

      {/* Filtros */}
      <ItemsFilters
        categories={categories}
        selectedCategories={selectedCategories}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCategoryToggle={handleCategoryToggle}
        onRefresh={handleRefresh}
        onCreateItem={handleCreateItem}
        onManageCategories={handleManageCategories}
      />

      {/* Tabela de Itens */}
      <ItemsTable
        items={paginatedItems}
        currentPage={currentPage}
        totalPages={totalPages}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onPageChange={handlePageChange}
      />

      {/* Modal de Formulário */}
      <ItemFormDialog
        item={itemToEdit}
        categories={categories}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de Deleção */}
      {itemToDelete && (
        <ItemDeleteDialog
          item={itemToDelete}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Modal de Categorias */}
      <CategoriesDialog
        categories={categories}
        open={isCategoriesDialogOpen}
        onOpenChange={setIsCategoriesDialogOpen}
        onCategoriesChange={() => handleCategoriesChange(categories)}
      />
    </div>
  );
}
