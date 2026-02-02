/**
 * Document Generation API Client
 * 
 * Client for communicating with the Python backend for PDF/document generation.
 */

// Backend base URL - configurable via environment
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';
const API_PREFIX = '/api/v1';

/**
 * Item data for proposal documents
 */
export interface ProposalItemData {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  total?: number;
}

/**
 * Company information for documents
 */
export interface CompanyData {
  name?: string;
  cnpj?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  email?: string;
  phone?: string;
  website?: string;
}

/**
 * Client information for documents
 */
export interface ClientData {
  name?: string;
  contact_name?: string;
  cnpj?: string;
  cpf?: string;
  address?: string;
  email?: string;
  phone?: string;
}

/**
 * Signature information for documents
 */
export interface SignatureData {
  name?: string;
  role?: string;
  company?: string;
}

/**
 * Proposal document generation request
 */
export interface ProposalDocumentRequest {
  code?: string;
  name?: string;
  title?: string;
  status?: string;
  date?: string;  // ISO date string
  validity?: string;  // ISO date string
  company?: CompanyData;
  client?: ClientData;
  signature?: SignatureData;
  items?: ProposalItemData[];
  observations?: string;
  internal_notes?: string;
  include_watermark?: boolean;
  include_signature_page?: boolean;
  primary_color?: string;
  secondary_color?: string;
}

/**
 * Document type enum
 */
export type DocumentType = 'pdf' | 'docx';

/**
 * Error response from the API
 */
interface ApiError {
  detail: string;
}

/**
 * Check if backend is healthy
 */
export async function checkDocumentServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}${API_PREFIX}/documents/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate a proposal document
 * 
 * @param data - Proposal document data
 * @param docType - Document type (pdf or docx)
 * @returns Blob containing the generated document
 */
export async function generateProposalDocument(
  data: ProposalDocumentRequest,
  docType: DocumentType = 'pdf'
): Promise<Blob> {
  const url = new URL(`${BACKEND_URL}${API_PREFIX}/documents/proposal/generate`);
  url.searchParams.set('doc_type', docType);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to generate document');
  }

  return response.blob();
}

/**
 * Generate a proposal PDF from a database record
 * 
 * @param proposalId - UUID of the proposal in the database
 * @param includeSignaturePage - Whether to include the client signature page
 * @returns Blob containing the generated PDF
 */
export async function generateProposalPdfFromDb(
  proposalId: string,
  includeSignaturePage: boolean = true
): Promise<Blob> {
  const url = new URL(`${BACKEND_URL}${API_PREFIX}/documents/proposal/${proposalId}/pdf`);
  url.searchParams.set('include_signature_page', String(includeSignaturePage));

  const response = await fetch(url.toString(), {
    method: 'GET',
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to generate PDF');
  }

  return response.blob();
}

/**
 * Preview a proposal document (opens in new tab)
 * 
 * @param data - Proposal document data
 */
export async function previewProposalDocument(
  data: ProposalDocumentRequest
): Promise<void> {
  const response = await fetch(`${BACKEND_URL}${API_PREFIX}/documents/proposal/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Failed to generate preview');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  // Clean up the object URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Download a proposal document
 * 
 * @param data - Proposal document data
 * @param filename - Optional custom filename
 * @param docType - Document type (pdf or docx)
 */
export async function downloadProposalDocument(
  data: ProposalDocumentRequest,
  filename?: string,
  docType: DocumentType = 'pdf'
): Promise<void> {
  const blob = await generateProposalDocument(data, docType);
  
  const defaultFilename = `proposta-${data.code || 'nova'}-${new Date().toISOString().split('T')[0]}.${docType}`;
  const finalFilename = filename || defaultFilename;
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Download a proposal PDF from a database record
 * 
 * @param proposalId - UUID of the proposal
 * @param filename - Optional custom filename
 */
export async function downloadProposalPdfFromDb(
  proposalId: string,
  filename?: string,
  includeSignaturePage: boolean = true
): Promise<void> {
  const blob = await generateProposalPdfFromDb(proposalId, includeSignaturePage);
  
  const defaultFilename = `proposta-${proposalId}-${new Date().toISOString().split('T')[0]}.pdf`;
  const finalFilename = filename || defaultFilename;
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}
