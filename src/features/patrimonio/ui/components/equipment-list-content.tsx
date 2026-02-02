"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Pencil, Plus, QrCode, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";

import {
  useDeleteEquipment,
  useEquipmentList,
  useUpdateEquipment,
} from "@/features/patrimonio/hooks/use-equipment";
import type { Equipment } from "@/features/patrimonio/domain/types/equipment";
import { equipmentFormSchema, type EquipmentFormInput } from "@/features/patrimonio/domain/validators";
import { CategorySelect } from "@/features/patrimonio/ui/components/category-select";
import { formatBRLInput, formatCentsToBRL, parseBRLToCents } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/ui/use-toast";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { SectionShell } from "@/shared/ui/section-shell";

const PAGE_CARD_CLASS = "rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl";
const LIST_ITEM_CLASS = "rounded-xl border border-border bg-card/60 p-5 transition-colors hover:bg-card/80";
const PRIMARY_BUTTON_CLASS = "h-12 rounded-xl border border-accent/30 bg-accent/20 px-5 text-foreground transition hover:bg-accent/30";
const EMPTY_STATE_CLASS = "flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/60 p-12 text-center text-muted-foreground";
const ACTION_ICON_BUTTON_CLASS = "h-10 w-10 rounded-xl border border-border bg-card/60 text-muted-foreground transition hover:bg-card/80 hover:text-foreground";
const DIALOG_CONTENT_CLASS = "max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background/95 p-6 backdrop-blur-xl";
const INPUT_CLASS = "h-12 rounded-xl border border-border bg-card/60 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent";
const TEXTAREA_CLASS = "rounded-xl border border-border bg-card/60 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent";
const QR_PREVIEW_CARD_CLASS = "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/80 p-6 text-center";
const QR_LABEL_CARD_CLASS = "rounded-2xl border border-border bg-card/70 p-6";
const QR_LABEL_GRID_CLASS = "grid gap-4 text-sm sm:grid-cols-2";

const STATUS_OPTIONS = [
  { value: "available", label: "Disponível" },
  { value: "in-use", label: "Em uso" },
  { value: "maintenance", label: "Manutenção" },
  { value: "retired", label: "Inativo" },
] as const;

type EquipmentFilters = {
  q: string;
  categories: string[];
};

type DisplayEquipment = {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  description?: string;
  quantity: number;
  unitValueCents: number;
  totalValueCents: number;
};

type AggregateCategory = {
  category: string;
  units: number;
  totalValueCents: number;
};

function buildEquipmentQrPayload(equipment: Equipment): string {
  return JSON.stringify({
    type: "equipment",
    id: equipment.id,
    code: equipment.code,
    name: equipment.name,
    category: equipment.category,
    location: equipment.location ?? null,
    createdAt: equipment.createdAt,
    updatedAt: equipment.updatedAt,
  });
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const EXTRANEOUS_NOTE_PATTERNS = [
  /valor\s+unit[áa]rio\s*\(centavos\)\s*:\s*\d+(?:[.,]\d+)?/gi,
];

function sanitizeEquipmentNotes(notes?: string | null): string | undefined {
  if (!notes) {
    return undefined;
  }

  let sanitized = notes;

  for (const pattern of EXTRANEOUS_NOTE_PATTERNS) {
    sanitized = sanitized.replace(pattern, " ");
  }

  sanitized = sanitized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  return sanitized.length > 0 ? sanitized : undefined;
}

function buildDisplayDataset(source: Equipment[]): DisplayEquipment[] {
  return source.map((item) => {
    const quantity = item.quantity ?? 1;
    const unitValueCents = item.unitValueCents ?? item.acquisitionValueCents ?? 0;
    const description = sanitizeEquipmentNotes(item.notes);

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      location: item.location?.trim() ? item.location : "Não informado",
      description,
      quantity,
      unitValueCents,
      totalValueCents: quantity * unitValueCents,
    };
  });
}

function formatDateLabel(input: string): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString("pt-BR");
}

function computeAggregates(items: DisplayEquipment[]) {
  const totalValueCents = items.reduce(
    (accumulator, item) => accumulator + item.totalValueCents,
    0,
  );
  const distinctItems = items.length;
  const totalUnits = items.reduce(
    (accumulator, item) => accumulator + item.quantity,
    0,
  );

  const categoryMap = new Map<string, AggregateCategory>();

  for (const item of items) {
    const current =
      categoryMap.get(item.category) ?? {
        category: item.category,
        units: 0,
        totalValueCents: 0,
      };

    current.units += item.quantity;
    current.totalValueCents += item.totalValueCents;
    categoryMap.set(item.category, current);
  }

  const categories = Array.from(categoryMap.values()).sort((left, right) => {
    if (right.totalValueCents !== left.totalValueCents) {
      return right.totalValueCents - left.totalValueCents;
    }
    return left.category.localeCompare(right.category);
  });

  return { totalValueCents, distinctItems, totalUnits, categories };
}

export function EquipmentListContent() {
  const router = useRouter();
  const [filters, setFilters] = useState<EquipmentFilters>({ q: "", categories: [] });
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState<Equipment | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isQrGenerating, setIsQrGenerating] = useState(false);
  const {
    data: equipment = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useEquipmentList();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();
  const { toast } = useToast();

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    watch: watchEdit,
    reset: resetEditForm,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
  } = useForm<EquipmentFormInput>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      acquisitionDate: "",
      status: "available",
      location: "",
      notes: "",
      acquisitionValue: "",
      quantity: 1,
    },
  });

  const editAcquisitionValue = watchEdit("acquisitionValue");
  const editStatus = watchEdit("status");

  const dataset = useMemo(() => buildDisplayDataset(equipment), [equipment]);

  const equipmentMap = useMemo(() => {
    const map = new Map<string, Equipment>();
    for (const item of equipment) {
      map.set(item.id, item);
    }
    return map;
  }, [equipment]);

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];

    for (const item of dataset) {
      if (seen.has(item.category)) {
        continue;
      }
      seen.add(item.category);
      options.push({ value: item.category, label: item.category });
    }

    return options.sort((left, right) => left.label.localeCompare(right.label));
  }, [dataset]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = filters.q.trim() ? normalize(filters.q.trim()) : "";
    const selectedCategories =
      filters.categories.length > 0 ? new Set(filters.categories) : null;

    return dataset.filter((item) => {
      if (selectedCategories && !selectedCategories.has(item.category)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [item.name, item.description ?? "", item.location, item.code]
        .filter(Boolean)
        .map((value) => normalize(String(value)));

      return haystack.some((value) => value.includes(normalizedSearch));
    });
  }, [dataset, filters.categories, filters.q]);

  const aggregates = useMemo(() => computeAggregates(filteredItems), [filteredItems]);

  useEffect(() => {
    if (!editingEquipment) {
      resetEditForm({
        name: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
        acquisitionDate: "",
        status: "available",
        location: "",
        notes: "",
        acquisitionValue: "",
        quantity: 1,
      });
      return;
    }

    resetEditForm({
      name: editingEquipment.name,
      category: editingEquipment.category,
      brand: editingEquipment.brand ?? "",
      model: editingEquipment.model ?? "",
      serialNumber: editingEquipment.serialNumber ?? "",
      acquisitionDate: editingEquipment.acquisitionDate,
      status: editingEquipment.status,
      location: editingEquipment.location ?? "",
      notes: editingEquipment.notes ?? "",
      acquisitionValue: editingEquipment.unitValueCents
        ? formatCentsToBRL(editingEquipment.unitValueCents)
        : "",
      quantity: editingEquipment.quantity ?? 1,
    });
  }, [editingEquipment, resetEditForm]);

  useEffect(() => {
    if (!qrTarget || !isQrDialogOpen) {
      setQrDataUrl(null);
      setIsQrGenerating(false);
      return;
    }

    let isMounted = true;
    setIsQrGenerating(true);
    setQrDataUrl(null);

    const payload = buildEquipmentQrPayload(qrTarget);

    QRCode.toDataURL(payload, { margin: 1, width: 512 })
      .then((url: string) => {
        if (!isMounted) {
          return;
        }
        setQrDataUrl(url);
      })
      .catch((generationError: unknown) => {
        if (!isMounted) {
          return;
        }

        toast({
          title: "Erro ao gerar QR code",
          description:
            generationError instanceof Error
              ? generationError.message
              : "Não foi possível gerar o QR code deste equipamento.",
          variant: "destructive",
        });
        setIsQrDialogOpen(false);
        setQrTarget(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsQrGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isQrDialogOpen, qrTarget, toast]);

  const handleEditClick = (id: string) => {
    const target = equipmentMap.get(id);
    if (!target) {
      return;
    }
    setEditingEquipment(target);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const target = equipmentMap.get(id);
    if (!target) {
      return;
    }
    setDeleteTarget(target);
    setIsDeleteDialogOpen(true);
  };

  const handleQrClick = (id: string) => {
    const target = equipmentMap.get(id);
    if (!target) {
      return;
    }
    setQrTarget(target);
    setIsQrDialogOpen(true);
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open && updateMutation.isPending) {
      return;
    }
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingEquipment(null);
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open && deleteMutation.isPending) {
      return;
    }
    setIsDeleteDialogOpen(open);
    if (!open) {
      setDeleteTarget(null);
    }
  };

  const handleQrDialogChange = (open: boolean) => {
    if (!open && isQrGenerating) {
      return;
    }
    setIsQrDialogOpen(open);
    if (!open) {
      setQrTarget(null);
      setQrDataUrl(null);
    }
  };

  const handleEditAcquisitionValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLInput(event.target.value);
    setEditValue("acquisitionValue", formatted, { shouldValidate: true });
  };

  const onEditSubmit = (formData: EquipmentFormInput) => {
    if (!editingEquipment) {
      return;
    }

    const unitValueCents = parseBRLToCents(formData.acquisitionValue);

    if (unitValueCents <= 0) {
      toast({
        title: "Valor unitário inválido",
        description: "Informe um valor unitário maior que zero.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(
      {
        id: editingEquipment.id,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber,
        acquisitionDate: formData.acquisitionDate,
        status: formData.status,
        location: formData.location,
        notes: formData.notes,
        quantity: formData.quantity,
        unitValueCents,
      },
      {
        onSuccess: () => {
          toast({
            title: "Equipamento atualizado",
            description: "As informações foram salvas com sucesso.",
          });
          setIsEditDialogOpen(false);
          setEditingEquipment(null);
        },
        onError: (mutationError) => {
          toast({
            title: "Erro ao atualizar equipamento",
            description: mutationError.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({
          title: "Equipamento removido",
          description: "O equipamento foi excluído do inventário.",
        });
        setIsDeleteDialogOpen(false);
        setDeleteTarget(null);
      },
      onError: (mutationError) => {
        toast({
          title: "Erro ao excluir equipamento",
          description: mutationError.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleDownloadQr = () => {
    if (!qrTarget || !qrDataUrl) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `${qrTarget.code}-qr.png`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    toast({
      title: "QR code baixado",
      description: "A etiqueta foi salva no seu dispositivo.",
    });
  };

  return (
    <SectionShell
      title="Inventário canônico"
      header={
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              Patrimônio consolidado
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Lista oficial de equipamentos, mobiliário e eletrodomésticos com quantidades e valores unitários
              revisados.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
              <div className="relative w-full md:max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.q}
                  onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                  placeholder="Buscar por nome, descrição ou localização"
                  className="h-12 rounded-xl border border-border bg-card/60 pl-12 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent"
                  aria-label="Buscar equipamento"
                />
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[16rem]">
                <CategorySelect
                  options={categoryOptions}
                  value={filters.categories}
                  onChange={(categories) => setFilters((current) => ({ ...current, categories }))}
                />
                {filters.q || filters.categories.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setFilters({ q: "", categories: [] })}
                    className="self-start text-sm font-medium text-accent transition hover:text-accent/80"
                  >
                    Limpar filtros
                  </button>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => router.push("/patrimonio/cadastrar")}
              className={PRIMARY_BUTTON_CLASS}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo equipamento
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-12 lg:space-y-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className={PAGE_CARD_CLASS}>
            {isError ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 py-12 text-center text-sm text-destructive">
                <span>Falha ao carregar equipamentos.</span>
                <span className="text-xs text-destructive/80">{error?.message ?? "Tente novamente em instantes."}</span>
                <Button
                  type="button"
                  onClick={() => refetch()}
                  className="h-10 rounded-lg bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
                >
                  Recarregar lista
                </Button>
              </div>
            ) : isLoading ? (
              <div className={EMPTY_STATE_CLASS}>
                <span>Carregando equipamentos...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              dataset.length === 0 ? (
                <div className={EMPTY_STATE_CLASS}>
                  <Package className="h-12 w-12 text-muted-foreground/70" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nenhum equipamento cadastrado.</p>
                    <p className="text-xs text-muted-foreground">
                      Utilize o botão “Novo equipamento” para começar o cadastro.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={EMPTY_STATE_CLASS}>
                  <span>Nenhum item corresponde aos filtros selecionados.</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFilters({ q: "", categories: [] })}
                    className="h-10 rounded-xl border border-accent/30 bg-transparent px-4 text-xs font-medium text-accent hover:bg-accent/10"
                  >
                    Remover filtros
                  </Button>
                </div>
              )
            ) : (
              <div className="grid gap-3">
                {filteredItems.map((item) => (
                  <article key={item.id} className={LIST_ITEM_CLASS}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent"
                          >
                            {item.category}
                          </Badge>
                        </div>

                        <dl className="grid gap-x-8 gap-y-3 text-sm lg:grid-cols-5">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Código</dt>
                            <dd className="font-mono text-sm font-semibold text-foreground">{item.code}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Localização</dt>
                            <dd className="text-foreground">{item.location}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Quantidade</dt>
                            <dd className="text-foreground">{item.quantity}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Valor unitário</dt>
                            <dd className="text-foreground">{formatCentsToBRL(item.unitValueCents)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Valor total</dt>
                            <dd className="font-semibold text-foreground">{formatCentsToBRL(item.totalValueCents)}</dd>
                          </div>
                        </dl>

                        {item.description ? (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 self-start lg:self-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQrClick(item.id)}
                          className={ACTION_ICON_BUTTON_CLASS}
                          title="Gerar QR code"
                          disabled={isQrGenerating && qrTarget?.id === item.id}
                        >
                          <QrCode className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item.id)}
                          className={ACTION_ICON_BUTTON_CLASS}
                          title="Editar equipamento"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(item.id)}
                          className={cn(ACTION_ICON_BUTTON_CLASS, "text-destructive hover:text-destructive")}
                          title="Excluir equipamento"
                          disabled={deleteMutation.isPending && deleteTarget?.id === item.id}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className={cn(PAGE_CARD_CLASS, "h-fit space-y-6 lg:sticky lg:top-24")}>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Resumo financeiro</h2>
              <p className="text-sm text-muted-foreground">Totais calculados a partir da lista filtrada.</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 p-5">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Calculando totais...</p>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Valor total</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {formatCentsToBRL(aggregates.totalValueCents)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {aggregates.distinctItems} {aggregates.distinctItems === 1 ? "item distinto" : "itens distintos"} •{" "}
                    {aggregates.totalUnits} {aggregates.totalUnits === 1 ? "unidade" : "unidades"}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Por categoria</p>
              {isLoading ? (
                <p className="rounded-xl border border-dashed border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
                  Calculando categorias...
                </p>
              ) : aggregates.categories.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
                  Nenhuma categoria encontrada.
                </p>
              ) : (
                <div className="space-y-3">
                  {aggregates.categories.map((category) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{category.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.units} {category.units === 1 ? "unidade" : "unidades"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCentsToBRL(category.totalValueCents)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={isQrDialogOpen} onOpenChange={handleQrDialogChange}>
        <DialogContent className={DIALOG_CONTENT_CLASS} aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Etiqueta de identificação</DialogTitle>
            <DialogDescription>Gere e baixe o QR code exclusivo deste equipamento.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className={QR_PREVIEW_CARD_CLASS}>
              {isQrGenerating ? (
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/70">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : qrDataUrl ? (
                <figure className="flex flex-col items-center gap-3">
                  <img
                    src={qrDataUrl}
                    alt={qrTarget ? `QR code do equipamento ${qrTarget.name}` : "QR code do equipamento"}
                    className="h-48 w-48 rounded-2xl border border-border bg-background object-contain"
                  />
                  <figcaption className="text-xs text-muted-foreground">Escaneie para identificar rapidamente</figcaption>
                </figure>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/70 text-xs text-muted-foreground">
                  Falha ao gerar QR code. Tente novamente.
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Este QR code encoda o identificador oficial do inventário e pode ser impresso em etiquetas físicas.
              </p>
            </div>

            {qrTarget ? (
              <div className={QR_LABEL_CARD_CLASS}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Etiqueta</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">{qrTarget.code}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{qrTarget.name}</p>

                <dl className={`${QR_LABEL_GRID_CLASS} mt-4`}>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Categoria</dt>
                    <dd className="text-sm font-medium text-foreground">{qrTarget.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Localização</dt>
                    <dd className="text-sm font-medium text-foreground">{qrTarget.location?.trim() || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Quantidade</dt>
                    <dd className="text-sm font-medium text-foreground">{qrTarget.quantity ?? 1}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Valor unitário</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {formatCentsToBRL(qrTarget.unitValueCents ?? qrTarget.acquisitionValueCents ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Atualizado em</dt>
                    <dd className="text-sm font-medium text-foreground">{formatDateLabel(qrTarget.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQrDialogChange(false)}
              disabled={isQrGenerating}
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl || isQrGenerating}
              className={PRIMARY_BUTTON_CLASS}
            >
              {isQrGenerating ? "Gerando..." : "Baixar etiqueta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className={DIALOG_CONTENT_CLASS} aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Editar equipamento</DialogTitle>
            <DialogDescription>Atualize as informações do equipamento selecionado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(onEditSubmit)} className="mt-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  {...editRegister("name")}
                  placeholder="Ex: Projetor Sony"
                  className={INPUT_CLASS}
                />
                {editErrors.name ? <p className="text-sm text-destructive">{editErrors.name.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria *</Label>
                <Input
                  id="edit-category"
                  {...editRegister("category")}
                  placeholder="Ex: Audiovisual"
                  className={INPUT_CLASS}
                />
                {editErrors.category ? (
                  <p className="text-sm text-destructive">{editErrors.category.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-acquisitionValue">Valor unitário *</Label>
                <Input
                  id="edit-acquisitionValue"
                  inputMode="decimal"
                  value={editAcquisitionValue}
                  onChange={handleEditAcquisitionValueChange}
                  placeholder="Ex: R$ 1.900,00"
                  className={INPUT_CLASS}
                />
                {editErrors.acquisitionValue ? (
                  <p className="text-sm text-destructive">{editErrors.acquisitionValue.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantidade *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={1}
                  step={1}
                  {...editRegister("quantity", { valueAsNumber: true })}
                  placeholder="Ex: 2"
                  className={INPUT_CLASS}
                />
                {editErrors.quantity ? (
                  <p className="text-sm text-destructive">{editErrors.quantity.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-brand">Marca</Label>
                <Input
                  id="edit-brand"
                  {...editRegister("brand")}
                  placeholder="Ex: Sony"
                  className={INPUT_CLASS}
                />
                {editErrors.brand ? <p className="text-sm text-destructive">{editErrors.brand.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  {...editRegister("model")}
                  placeholder="Ex: VPL-FH500L"
                  className={INPUT_CLASS}
                />
                {editErrors.model ? <p className="text-sm text-destructive">{editErrors.model.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-serialNumber">Número de série</Label>
                <Input
                  id="edit-serialNumber"
                  {...editRegister("serialNumber")}
                  placeholder="Ex: SN123456"
                  className={INPUT_CLASS}
                />
                {editErrors.serialNumber ? (
                  <p className="text-sm text-destructive">{editErrors.serialNumber.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-acquisitionDate">Data de aquisição *</Label>
                <Input
                  id="edit-acquisitionDate"
                  type="date"
                  {...editRegister("acquisitionDate")}
                  className={INPUT_CLASS}
                />
                {editErrors.acquisitionDate ? (
                  <p className="text-sm text-destructive">{editErrors.acquisitionDate.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value) => setEditValue("status", value as EquipmentFormInput["status"])}
                >
                  <SelectTrigger id="edit-status" className={INPUT_CLASS}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editErrors.status ? <p className="text-sm text-destructive">{editErrors.status.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Localização</Label>
                <Input
                  id="edit-location"
                  {...editRegister("location")}
                  placeholder="Ex: Sala 201"
                  className={INPUT_CLASS}
                />
                {editErrors.location ? (
                  <p className="text-sm text-destructive">{editErrors.location.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea
                id="edit-notes"
                rows={4}
                {...editRegister("notes")}
                placeholder="Informações adicionais sobre o equipamento"
                className={TEXTAREA_CLASS}
              />
              {editErrors.notes ? <p className="text-sm text-destructive">{editErrors.notes.message}</p> : null}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditDialogChange(false)}
                disabled={isEditSubmitting || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={PRIMARY_BUTTON_CLASS}
                disabled={isEditSubmitting || updateMutation.isPending}
              >
                {isEditSubmitting || updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Tem certeza que deseja remover "${deleteTarget.name}" do inventário? Esta ação não pode ser desfeita.`
                : "Tem certeza que deseja remover este equipamento do inventário?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionShell>
  );
}




