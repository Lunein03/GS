'use client';

import * as React from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import { Package, Wrench } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { ItemFormData, Category } from '../types/item.types';
import { ITEM_TYPES, ITEM_UNITS } from '../types/item.types';
import { ItemImageUpload } from './item-image-upload';

interface ItemFormTabsProps {
  control: Control<ItemFormData>;
  errors: FieldErrors<ItemFormData>;
  categories: Category[];
}

// Função para formatar valor como moeda brasileira
const formatCurrency = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Converte para número e divide por 100 para ter os centavos
  const amount = Number(numbers) / 100;
  
  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Função para converter string formatada em número
const parseCurrency = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return Number(numbers) / 100;
};

export function ItemFormTabs({ control, errors, categories }: ItemFormTabsProps) {
  return (
    <Tabs defaultValue="principal" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="principal">Principal</TabsTrigger>
        <TabsTrigger value="descricao">Descrição</TabsTrigger>
        <TabsTrigger value="funcionalidades">Funcionalidades</TabsTrigger>
        <TabsTrigger value="imagens">Imagens</TabsTrigger>
      </TabsList>

      {/* Aba Principal */}
      <TabsContent value="principal" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo Tipo */}
          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tipo <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ITEM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.value === 'product' ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <Wrench className="h-4 w-4" />
                          )}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Categoria */}
          <FormField
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Categoria <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{
                              backgroundColor: category.color,
                              color: '#ffffff',
                            }}
                            className="text-xs"
                          >
                            {category.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo Nome */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do item"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo Unidade */}
          <FormField
            control={control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Unidade <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ITEM_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Valor */}
          <FormField
            control={control}
            name="defaultPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Valor <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      R$
                    </span>
                    <Input
                      placeholder="0,00"
                      className="pl-10"
                      value={field.value ? formatCurrency(String(field.value * 100)) : ''}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value);
                        const numericValue = parseCurrency(formatted);
                        field.onChange(numericValue);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo SKU (opcional) */}
          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Código SKU (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo PN (opcional) */}
          <FormField
            control={control}
            name="pn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PN (Part Number)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Número de peça (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>

      {/* Aba Descrição */}
      <TabsContent value="descricao" className="space-y-4 mt-4">
        <FormField
          control={control}
          name="description"
          render={({ field }) => {
            const charCount = field.value?.length || 0;
            const maxChars = 2000;
            const isNearLimit = charCount > maxChars * 0.9;

            return (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva detalhadamente o item..."
                    className="min-h-[200px] resize-y"
                    maxLength={maxChars}
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Dica: Use quebras de linha para organizar o texto
                  </span>
                  <span
                    className={
                      isNearLimit
                        ? 'text-destructive font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    {charCount} / {maxChars}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </TabsContent>

      {/* Aba Funcionalidades */}
      <TabsContent value="funcionalidades" className="space-y-4 mt-4">
        <FormField
          control={control}
          name="features"
          render={({ field }) => {
            const charCount = field.value?.length || 0;
            const maxChars = 2000;
            const isNearLimit = charCount > maxChars * 0.9;

            return (
              <FormItem>
                <FormLabel>Funcionalidades</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Liste as principais funcionalidades do item..."
                    className="min-h-[200px] resize-y"
                    maxLength={maxChars}
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Dica: Separe cada funcionalidade em uma linha diferente
                  </span>
                  <span
                    className={
                      isNearLimit
                        ? 'text-destructive font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    {charCount} / {maxChars}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </TabsContent>

      {/* Aba Imagens */}
      <TabsContent value="imagens" className="space-y-4 mt-4">
        <FormField
          control={control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagens do Item</FormLabel>
              <FormControl>
                <ItemImageUpload
                  images={field.value || []}
                  onImagesChange={field.onChange}
                  maxImages={5}
                  maxSizeInMB={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    </Tabs>
  );
}
