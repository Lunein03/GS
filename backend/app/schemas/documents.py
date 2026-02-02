"""
Schemas for document generation (PDF/DOCX).
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    """Supported document types for export."""
    PDF = "pdf"
    DOCX = "docx"


class DocumentFormat(str, Enum):
    """Document format/template style."""
    PROPOSAL = "proposal"
    CONTRACT = "contract"
    INVOICE = "invoice"
    RECEIPT = "receipt"
    MEDIAKIT = "mediakit"


class ProposalItemData(BaseModel):
    """Item data for proposal document."""
    id: str
    description: str
    quantity: int = 1
    unit_value: Decimal = Field(alias="unitValue", default=Decimal("0"))
    total: Optional[Decimal] = None

    class Config:
        populate_by_name = True

    def model_post_init(self, __context):
        if self.total is None:
            self.total = self.quantity * self.unit_value


class CompanyData(BaseModel):
    """Company information for documents."""
    name: str = "GS PRODUÇÕES E ACESSIBILIDADE"
    cnpj: str = "35.282.691/0001-48"
    address: str = "Rua Cinco de Julho, 388, APT 103"
    neighborhood: str = "Copacabana"
    city: str = "Rio de Janeiro"
    state: str = "RJ"
    zip_code: str = "22051-030"
    email: str = "comercial@gsproducao.com"
    phone: str = "+55 21 96819-9637"
    website: Optional[str] = "https://gsproducao.com"


class ClientData(BaseModel):
    """Client information for documents."""
    name: Optional[str] = None
    contact_name: Optional[str] = None
    cnpj: Optional[str] = None
    cpf: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class SignatureData(BaseModel):
    """Signature information for documents."""
    name: str = "Gabriel Sampaio Verissimo"
    role: Optional[str] = "Diretor"
    company: str = "GS Produções"


class ProposalDocumentRequest(BaseModel):
    """
    Request payload for generating a proposal document.
    All fields are optional to allow partial data.
    """
    # Document metadata
    code: Optional[str] = None
    name: Optional[str] = "Nova Proposta"
    title: Optional[str] = None
    status: Optional[str] = "Aberto"
    
    # Dates
    date: Optional[date] = None
    validity: Optional[date] = None
    created_at: Optional[datetime] = None
    
    # Entities
    company: Optional[CompanyData] = None
    client: Optional[ClientData] = None
    signature: Optional[SignatureData] = None
    
    # Content
    items: list[ProposalItemData] = Field(default_factory=list)
    observations: Optional[str] = None
    internal_notes: Optional[str] = None
    
    # Styling options
    include_watermark: bool = True
    include_signature_page: bool = True
    primary_color: str = "#6620F2"  # Electric Indigo
    secondary_color: str = "#31EBCB"  # Turquesa Viva


class DocumentGenerationResponse(BaseModel):
    """Response after document generation."""
    success: bool
    filename: str
    content_type: str
    message: Optional[str] = None


class ContractDocumentRequest(BaseModel):
    """Request payload for generating a contract document."""
    proposal_id: Optional[UUID] = None
    title: str = "Contrato de Prestação de Serviços"
    
    # Parties
    company: Optional[CompanyData] = None
    client: Optional[ClientData] = None
    
    # Contract specifics
    service_description: str = ""
    total_value: Decimal = Decimal("0")
    payment_terms: Optional[str] = None
    execution_period: Optional[str] = None
    
    # Clauses
    clauses: list[str] = Field(default_factory=list)
    
    # Dates
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    signature_date: Optional[date] = None


class MediaKitDocumentRequest(BaseModel):
    """Request payload for generating a media kit document."""
    category: str = "shows"  # "shows" or "teatro"
    company: Optional[CompanyData] = None
    
    # Content sections
    about_text: Optional[str] = None
    vision_text: Optional[str] = None
    services: list[str] = Field(default_factory=list)
    
    # Styling
    primary_color: str = "#6620F2"
    secondary_color: str = "#31EBCB"
