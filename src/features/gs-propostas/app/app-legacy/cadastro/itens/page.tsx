'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid3x3 } from 'lucide-react';

import { ItemsFilters } from './components/items-filters';
import { ItemsTable } from './components/items-table';
import { ItemFormDialog } from './components/item-form-dialog';
import { ItemDeleteDialog } from './components/item-delete-dialog';
import { CategoriesDialog } from './components/categories-dialog';
import type { Item, Category } from './types/item.types';
import {
  useItems,
  useRefreshItems,
} from './hooks/use-items';
import {
  useCategories,
  useRefreshCategories,
} from '../categorias/hooks/use-categories';

const ITEMS_PER_PAGE = 20;

export default function ItensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);

  const [itemToEdit, setItemToEdit] = useState<Item | undefined>();
  const [itemToDelete, setItemToDelete] = useState<Item | undefined>();

  const categoriesQuery = useCategories({});
  const categories = (categoriesQuery.data ?? []) as Category[];
  const refreshCategories = useRefreshCategories();

  const itemsQuery = useItems({
    search: searchQuery || undefined,
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });
  const refreshItems = useRefreshItems();

  const totalPages = itemsQuery.data?.pagination.totalPages ?? 0;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const itemsWithCategory = useMemo(() => {
    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const items = itemsQuery.data?.items ?? [];
    return items.map((item) => ({
      ...item,
      category: categoryMap.get(item.categoryId),
    }));
  }, [itemsQuery.data?.items, categories]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => (
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    ));
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setCurrentPage(1);
    await Promise.all([refreshItems(), refreshCategories()]);
  }, [refreshItems, refreshCategories]);

  const handleCreateItem = () => {
    setItemToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleManageCategories = () => {
    setIsCategoriesDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFormSuccess = useCallback(async () => {
    await refreshItems();
    setIsFormOpen(false);
    setItemToEdit(undefined);
  }, [refreshItems]);

  const handleDeleteSuccess = useCallback(async () => {
    await refreshItems();
    setIsDeleteDialogOpen(false);
    setItemToDelete(undefined);
  }, [refreshItems]);

  const handleCategoriesChange = useCallback(async (_?: Category[]) => {
    await refreshCategories();
    setIsCategoriesDialogOpen(false);
  }, [refreshCategories]);

  const displayTotalPages = totalPages > 0 ? totalPages : 1;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Grid3x3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Itens</h1>
          <p className="text-muted-foreground">Cadastre produtos e servicos oferecidos</p>
        </div>
      </header>

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

      <ItemsTable
        items={itemsWithCategory}
        currentPage={currentPage}
        totalPages={displayTotalPages}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onPageChange={handlePageChange}
      />

      <ItemFormDialog
        item={itemToEdit}
        categories={categories}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setItemToEdit(undefined);
          }
        }}
        onSuccess={handleFormSuccess}
      />

      {itemToDelete && (
        <ItemDeleteDialog
          item={itemToDelete}
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setItemToDelete(undefined);
            }
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}

      <CategoriesDialog
        categories={categories}
        open={isCategoriesDialogOpen}
        onOpenChange={setIsCategoriesDialogOpen}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
}


