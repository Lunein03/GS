from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import (
    ProposalNoteMode,
    ProposalSignatureStatus,
    ProposalSignatureType,
    ProposalStatus,
)


class ProposalItemBase(BaseModel):
    type: str
    name: str
    description: Optional[str] = None
    quantity: Decimal = Decimal("1")
    unit_price: Decimal
    discount: Optional[Decimal] = Decimal("0")
    total: Decimal
    sort_order: Optional[int] = 0


class ProposalItemCreate(ProposalItemBase):
    pass


class ProposalItemUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    discount: Optional[Decimal] = None
    total: Optional[Decimal] = None
    sort_order: Optional[int] = None


class ProposalItemRead(ProposalItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class ProposalBase(BaseModel):
    code: str
    title: str
    opportunity_id: Optional[UUID] = None
    status: ProposalStatus = ProposalStatus.OPEN
    client_name: str
    client_email: Optional[EmailStr] = None
    client_phone: Optional[str] = None
    company_name: Optional[str] = None
    payment_mode: Optional[str] = None
    valid_until: Optional[datetime] = None
    total_value: Decimal = Decimal("0")
    discount: Optional[Decimal] = Decimal("0")
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    responsible_user: Optional[str] = None


class ProposalCreate(ProposalBase):
    items: Optional[List[ProposalItemCreate]] = Field(default=None)


class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[ProposalStatus] = None
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    client_phone: Optional[str] = None
    company_name: Optional[str] = None
    payment_mode: Optional[str] = None
    valid_until: Optional[datetime] = None
    total_value: Optional[Decimal] = None
    discount: Optional[Decimal] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    responsible_user: Optional[str] = None


class ProposalRead(ProposalBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    items: List[ProposalItemRead] = []


class ProposalStatusPayload(BaseModel):
    status: ProposalStatus


class ProposalNoteBase(BaseModel):
    name: str
    description: Optional[str] = None
    inclusion_mode: ProposalNoteMode = ProposalNoteMode.MANUAL


class ProposalNoteCreate(ProposalNoteBase):
    pass


class ProposalNoteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    inclusion_mode: Optional[ProposalNoteMode] = None


class ProposalNoteRead(ProposalNoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class PaymentModeBase(BaseModel):
    name: str
    installments: int = 1
    interest_rate: Decimal = Decimal("0")
    adjustment_rate: Decimal = Decimal("0")
    description: Optional[str] = None


class PaymentModeCreate(PaymentModeBase):
    pass


class PaymentModeUpdate(BaseModel):
    name: Optional[str] = None
    installments: Optional[int] = None
    interest_rate: Optional[Decimal] = None
    adjustment_rate: Optional[Decimal] = None
    description: Optional[str] = None


class PaymentModeRead(PaymentModeBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ProposalSignatureBase(BaseModel):
    name: str
    cpf: str
    email: EmailStr
    phone: Optional[str] = None
    signature_type: ProposalSignatureType
    status: ProposalSignatureStatus = ProposalSignatureStatus.PENDING
    govbr_identifier: Optional[str] = None


class ProposalSignatureCreate(ProposalSignatureBase):
    pass


class ProposalSignatureUpdate(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    signature_type: Optional[ProposalSignatureType] = None
    status: Optional[ProposalSignatureStatus] = None
    govbr_identifier: Optional[str] = None


class ProposalSignatureRead(ProposalSignatureBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
