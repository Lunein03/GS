from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import (
    ActivityPriority,
    ActivityStatus,
    CompanySignatureStatus,
    CompanySignatureType,
    EmpresaTipo,
    OpportunityStatus,
)


class OpportunityBase(BaseModel):
    title: str
    description: Optional[str] = None
    value: Decimal = Field(default=Decimal("0"))
    probability: Optional[int] = Field(default=50, ge=0, le=100)
    next_step: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    responsible_user: Optional[str] = None
    tags: Optional[List[str]] = None


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    value: Optional[Decimal] = None
    probability: Optional[int] = Field(default=None, ge=0, le=100)
    next_step: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    responsible_user: Optional[str] = None
    tags: Optional[List[str]] = None


class OpportunityRead(OpportunityBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: OpportunityStatus
    created_at: datetime
    updated_at: datetime


class OpportunityStatusUpdate(BaseModel):
    new_status: OpportunityStatus
    user_id: Optional[str] = Field(default="system")


class OpportunityActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    action: str
    from_status: Optional[OpportunityStatus] = None
    to_status: Optional[OpportunityStatus] = None
    notes: Optional[str] = None
    user_id: Optional[str] = None
    created_at: datetime


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: Optional[str]
    status: ActivityStatus
    priority: ActivityPriority
    assigned_to: Optional[str]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class ClientBase(BaseModel):
    tipo: EmpresaTipo
    cpf_cnpj: str = Field(pattern=r"^\d{11,14}$")
    nome: Optional[str] = None
    cargo: Optional[str] = None
    cep: str
    endereco: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    estado: str
    contato_nome: str
    contato_email: EmailStr
    contato_telefone: str
    ativo: bool = True


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    nome: Optional[str] = None
    cargo: Optional[str] = None
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    contato_nome: Optional[str] = None
    contato_email: Optional[EmailStr] = None
    contato_telefone: Optional[str] = None
    ativo: Optional[bool] = None


class ClientRead(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]


class ClientSecondaryContactBase(BaseModel):
    nome: str
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    cargo: Optional[str] = None


class ClientSecondaryContactCreate(ClientSecondaryContactBase):
    pass


class ClientSecondaryContactUpdate(ClientSecondaryContactBase):
    pass


class ClientSecondaryContactRead(ClientSecondaryContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_id: UUID
    created_at: datetime
    updated_at: datetime


class CompanyBase(BaseModel):
    tipo: EmpresaTipo
    cpf_cnpj: str
    nome: Optional[str] = None
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    logo: Optional[str] = None
    contato_nome: str
    contato_email: EmailStr
    contato_telefone: str
    cep: str
    endereco: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    estado: str
    ativo: int = 1
    # Campos de assinatura digital
    assinatura_tipo: Optional[CompanySignatureType] = None
    assinatura_cpf_titular: Optional[str] = None
    assinatura_nome_titular: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    nome: Optional[str] = None
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    logo: Optional[str] = None
    contato_nome: Optional[str] = None
    contato_email: Optional[EmailStr] = None
    contato_telefone: Optional[str] = None
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    ativo: Optional[int] = None
    # Campos de assinatura digital
    assinatura_tipo: Optional[CompanySignatureType] = None
    assinatura_cpf_titular: Optional[str] = None
    assinatura_nome_titular: Optional[str] = None


class CompanyRead(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    # Campos de assinatura - somente leitura
    assinatura_status: Optional[CompanySignatureStatus] = None
    assinatura_govbr_identifier: Optional[str] = None
    assinatura_validado_em: Optional[datetime] = None
