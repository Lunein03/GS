/**
 * Hook for document generation using the Python backend.
 * Provides state management and error handling for PDF generation.
 */

import { useState, useCallback } from "react";
import {
  downloadProposalDocument,
  previewProposalDocument,
  checkDocumentServiceHealth,
  ProposalDocumentRequest,
  ProposalItemData,
} from "../api/document-client";

interface UseDocumentGeneratorOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDocumentGeneratorReturn {
  isGenerating: boolean;
  isBackendAvailable: boolean | null;
  error: Error | null;
  checkBackend: () => Promise<boolean>;
  generatePdf: (data: ProposalDocumentRequest) => Promise<void>;
  previewPdf: (data: ProposalDocumentRequest) => Promise<void>;
  downloadPdf: (data: ProposalDocumentRequest, filename?: string) => Promise<void>;
}

/**
 * Transform frontend proposal data to backend format
 */
export function transformToBackendFormat(data: {
  code?: string;
  name?: string;
  status?: string;
  date?: Date;
  validity?: Date;
  clientName?: string;
  contactName?: string;
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  responsibleName?: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitValue: number;
  }>;
  observations?: string;
}): ProposalDocumentRequest {
  return {
    code: data.code,
    name: data.name,
    status: data.status,
    date: data.date?.toISOString().split("T")[0],
    validity: data.validity?.toISOString().split("T")[0],
    company: {
      name: data.companyName,
      cnpj: data.companyCnpj,
      address: data.companyAddress,
      email: data.companyEmail,
      phone: data.companyPhone,
    },
    client: data.clientName
      ? {
          name: data.clientName,
          contact_name: data.contactName,
        }
      : undefined,
    signature: data.responsibleName
      ? {
          name: data.responsibleName,
          company: "GS Produções",
        }
      : undefined,
    items: data.items?.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitValue: item.unitValue,
    })) as ProposalItemData[],
    observations: data.observations,
    include_watermark: true,
    include_signature_page: true,
  };
}

/**
 * Hook for generating documents via the Python backend
 */
export function useDocumentGenerator(
  options: UseDocumentGeneratorOptions = {}
): UseDocumentGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError } = options;

  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      const available = await checkDocumentServiceHealth();
      setIsBackendAvailable(available);
      return available;
    } catch {
      setIsBackendAvailable(false);
      return false;
    }
  }, []);

  const generatePdf = useCallback(
    async (data: ProposalDocumentRequest): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        await downloadProposalDocument(data);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to generate PDF");
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [onSuccess, onError]
  );

  const previewPdf = useCallback(
    async (data: ProposalDocumentRequest): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        await previewProposalDocument(data);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to preview PDF");
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [onSuccess, onError]
  );

  const downloadPdf = useCallback(
    async (data: ProposalDocumentRequest, filename?: string): Promise<void> => {
      setIsGenerating(true);
      setError(null);

      try {
        await downloadProposalDocument(data, filename);
        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to download PDF");
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [onSuccess, onError]
  );

  return {
    isGenerating,
    isBackendAvailable,
    error,
    checkBackend,
    generatePdf,
    previewPdf,
    downloadPdf,
  };
}

export type { ProposalDocumentRequest, ProposalItemData };
